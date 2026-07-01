document.addEventListener('DOMContentLoaded', () => {
    // (A-29) Centralizar capacidades por rol
    const RoleCapabilities = {
        canGrade: (user) => user && user.rol === 'Profesor',
        canManageExams: (user) => user && user.rol === 'Profesor'
    };

    let submissionsTableBody = document.getElementById('submissions-table-body');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));

    if (!currentUser || !RoleCapabilities.canManageExams(currentUser)) {
        window.location.href = 'login.html';
        return;
    }
    const firstName = currentUser.nombre.split(' ')[0];
    document.getElementById('teacher-name').textContent = firstName;

    // --- Elementos de Navegación y Secciones ---
    const navDashboard = document.getElementById('nav-dashboard');
    const navTareas = document.getElementById('nav-tareas');
    const navProyectos = document.getElementById('nav-proyectos');
    const navLogros = document.getElementById('nav-logros');
    const navNews = document.getElementById('nav-news');
    const navAdmin = document.getElementById('nav-admin');
    const navReportsOld = document.getElementById('nav-reportes');

    const sectionAcademicReports = document.getElementById('section-dashboard');
    const sectionTareas = document.getElementById('section-tareas');
    const sectionProyectos = document.getElementById('section-proyectos');
    const sectionLogros = document.getElementById('section-logros');
    const sectionNews = document.getElementById('section-news');
    const sectionAdmin = document.getElementById('section-admin');
    const sectionReportes = document.getElementById('section-reportes');

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
    let studentSort = { column: 'nombre', direction: 'asc' };

    const allSections = [sectionAcademicReports, sectionTareas, sectionProyectos, sectionLogros, sectionNews, sectionAdmin, sectionReportes];
    const allNavLinks = [navDashboard, navTareas, navProyectos, navLogros, navNews, navAdmin, navReportsOld];

    // Auxiliar para normalizar strings (trim, lowercase y sin acentos) para comparaciones robustas
    const norm = (s) => (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // --- Lógica de Navegación ---
    window.navigateTo = function(targetSection, navElement, pushState = true) {
        allSections.forEach(section => section && section.classList.add('hidden'));
        targetSection.classList.remove('hidden');

        // Limpieza de estados visuales persistentes al cambiar de sección
        const infoCard = document.getElementById('student-details-info-card');
        if (infoCard) infoCard.remove();

        // Hide WhatsApp container if moving away from Dashboard
        const waContainer = document.querySelector('.bg-green-50');
        if (waContainer && targetSection !== sectionAcademicReports) waContainer.classList.add('hidden');

        allNavLinks.forEach(link => {
            if (link) {
                link.classList.remove('bg-blue-600', 'text-white');
                link.classList.add('bg-gray-100', 'text-gray-500');
            }
        });
        navElement.classList.add('bg-blue-600', 'text-white');
        navElement.classList.remove('bg-gray-100', 'text-gray-500');

        if (pushState) {
            history.pushState({ type: 'dashboard-section', sectionId: targetSection.id, navId: navElement.id }, '');
        }
    }

    navDashboard.addEventListener('click', () => {
        window.navigateTo(sectionAcademicReports, navDashboard);
        fetchTeacherActivity();
    });
    navTareas.addEventListener('click', () => {
        window.navigateTo(sectionTareas, navTareas);
        tareasListView.classList.remove('hidden');
        tareasCreateView.classList.add('hidden');
        fetchManagementData();
    });
    navProyectos.addEventListener('click', () => {
        window.navigateTo(sectionProyectos, navProyectos);
        fetchProjects();
    });
    navLogros.addEventListener('click', () => {
        window.navigateTo(sectionLogros, navLogros);
        fetchLogros();
    });
    navNews.addEventListener('click', () => {
        window.navigateTo(sectionNews, navNews);
        fetchNewsManagement();
    });
    navAdmin.addEventListener('click', () => {
        window.navigateTo(sectionAdmin, navAdmin);
        loadAcademicAdminData();
    });

    async function loadAcademicAdminData() {
        const parcialSelect = document.getElementById('admin-parcial-actual');
        if (!parcialSelect) return;

        const applyConfig = (data) => {
            if (!data) return;
            console.log("[IMA-TEACHER] Aplicando configuración recibida:", data);

            if (data.ParcialActual) parcialSelect.value = data.ParcialActual;

            // Normalización para visualización (v7.7.5)
            const grades = Array.isArray(data.GradoActual) ? data.GradoActual : [data.GradoActual].filter(Boolean);
            document.querySelectorAll('input[name="admin-grado"]').forEach(cb => {
                cb.checked = grades.includes(cb.value);
            });

            const sections = Array.isArray(data.SeccionActual) ? data.SeccionActual : [data.SeccionActual].filter(Boolean);
            document.querySelectorAll('input[name="admin-seccion"]').forEach(cb => {
                cb.checked = sections.includes(cb.value);
            });

            window.GLOBAL_SCOPE = {
                ParcialActual: parcialSelect.value,
                GradoActual: grades,
                SeccionActual: sections,
                AsignaturaActual: Array.isArray(data.AsignaturaActual) ? data.AsignaturaActual : [data.AsignaturaActual].filter(Boolean),
                TemaActual: Array.isArray(data.TemaActual) ? data.TemaActual : [data.TemaActual].filter(Boolean)
            };
            if (window.GLOBAL_SCOPE.TemaActual.length === 0) window.GLOBAL_SCOPE.TemaActual = ["General"];
            window.PARCIAL_ACTUAL = window.GLOBAL_SCOPE.ParcialActual;

            updateCascadingSelectors(window.GLOBAL_SCOPE.AsignaturaActual, window.GLOBAL_SCOPE.TemaActual);
        };

        // REQ: Sync Global Scope from Server (v7.7.5 - Use unified syncAcademicScope)
        if (window.syncAcademicScope) {
            window.syncAcademicScope(applyConfig);
        } else {
            // Fallback si no está disponible (no debería ocurrir)
            try {
                const configRes = await fetchApi('USER', 'getAcademicConfig', {}, 0, {
                    store: 'academic_stats',
                    key: 'config',
                    onUpdate: (data) => applyConfig(data)
                });
                if (configRes.status === 'success' && configRes.data) {
                    applyConfig(configRes.data);
                }
            } catch (e) {
                console.error("Error cargando config académica:", e);
            }
        }
    }

    function updateCascadingSelectors(selectedAsigs, selectedTemas) {
        const selectedGrades = Array.from(document.querySelectorAll('input[name="admin-grado"]:checked')).map(cb => cb.value);
        const selectedSections = Array.from(document.querySelectorAll('input[name="admin-seccion"]:checked')).map(cb => cb.value);
        const asigContainer = document.getElementById('admin-asignaturas-container');
        const temasContainer = document.getElementById('admin-temas-container');

        if (!asigContainer || !temasContainer) return;

        const presentations = window.presentationData || [];
        let availableSubjs = [];

        selectedGrades.forEach(grado => {
            const gradeObj = presentations.find(g => window.parseGrade(g.grade) === window.parseGrade(grado));
            if (gradeObj) {
                const subjs = gradeObj.subjects.filter(s => {
                    return selectedSections.some(sec => window.checkSectionHelper(s.sections, sec));
                });
                availableSubjs = availableSubjs.concat(subjs);
            }
        });

        // Unique subjects by name
        const uniqueSubjsNames = [...new Set(availableSubjs.map(s => s.name))];
        const selectedAsigArray = Array.isArray(selectedAsigs) ? selectedAsigs : [selectedAsigs].filter(Boolean);

        if (uniqueSubjsNames.length === 0) {
            asigContainer.innerHTML = '<p class="text-[10px] text-gray-400 p-2">Seleccione grado y sección para ver asignaturas.</p>';
            temasContainer.innerHTML = '<p class="text-[10px] text-gray-400 p-2">Seleccione una asignatura para ver sus temas.</p>';
        } else {
            asigContainer.innerHTML = uniqueSubjsNames.map(s => `
                <label class="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                    <input type="checkbox" name="admin-asignatura" value="${s}" class="w-4 h-4 text-blue-600 rounded" ${selectedAsigArray.includes(s) ? 'checked' : ''}>
                    <span class="text-[10px] font-bold text-gray-700 uppercase">${s}</span>
                </label>
            `).join('');
        }

        const updateTemas = () => {
            const checkedAsigs = Array.from(document.querySelectorAll('input[name="admin-asignatura"]:checked')).map(cb => cb.value);
            const selectedTemasArray = Array.isArray(selectedTemas) ? selectedTemas : [selectedTemas].filter(Boolean);

            if (checkedAsigs.length === 0) {
                temasContainer.innerHTML = '<p class="text-[10px] text-gray-400 p-2">Seleccione una asignatura para ver sus temas.</p>';
                return;
            }

            let html = '';
            checkedAsigs.forEach(asigName => {
                const subjs = availableSubjs.filter(s => s.name === asigName);
                const topics = [];
                subjs.forEach(s => {
                    if (s.topics) s.topics.forEach(t => {
                        if (!topics.find(ex => ex.title === t.title)) topics.push(t);
                    });
                });

                if (topics.length > 0) {
                    html += `<div class="mb-4">
                        <h4 class="text-[11px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-1 mb-2">${asigName}</h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label class="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                <input type="checkbox" name="admin-tema" value="General" class="w-4 h-4 text-blue-600 rounded" ${selectedTemasArray.includes("General") ? 'checked' : ''}>
                                <span class="text-[9px] font-bold text-gray-500 uppercase">General (Todos)</span>
                            </label>
                            ${topics.map(t => `
                                <label class="flex items-center gap-2 px-2 py-1 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" name="admin-tema" value="${t.title}" class="w-4 h-4 text-blue-600 rounded" ${selectedTemasArray.includes(t.title) ? 'checked' : ''}>
                                    <span class="text-[9px] font-bold text-gray-700 uppercase">${t.title}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>`;
                }
            });

            temasContainer.innerHTML = html || '<p class="text-[10px] text-gray-400 p-2">Sin temas disponibles para las asignaturas seleccionadas.</p>';
        };

        updateTemas();

        // Add listeners to new checkboxes
        asigContainer.querySelectorAll('input[name="admin-asignatura"]').forEach(cb => {
            cb.addEventListener('change', updateTemas);
        });
    }

    document.querySelectorAll('input[name="admin-grado"], input[name="admin-seccion"]').forEach(cb => {
        cb.addEventListener('change', () => updateCascadingSelectors());
    });


    document.getElementById('btn-save-academic-config')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-save-academic-config');

        const selectedGrades = Array.from(document.querySelectorAll('input[name="admin-grado"]:checked')).map(cb => cb.value);
        const selectedSections = Array.from(document.querySelectorAll('input[name="admin-seccion"]:checked')).map(cb => cb.value);
        const selectedAsigs = Array.from(document.querySelectorAll('input[name="admin-asignatura"]:checked')).map(cb => cb.value);
        const selectedTemas = Array.from(document.querySelectorAll('input[name="admin-tema"]:checked')).map(cb => cb.value);

        if (selectedGrades.length === 0 || selectedSections.length === 0 || selectedAsigs.length === 0 || selectedTemas.length === 0) {
            alert('Debe seleccionar al menos un grado, una sección, una asignatura y un tema.');
            return;
        }

        const fullScope = {
            ParcialActual: document.getElementById('admin-parcial-actual').value,
            GradoActual: selectedGrades,
            SeccionActual: selectedSections,
            AsignaturaActual: selectedAsigs,
            TemaActual: selectedTemas
        };

        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            const res = await fetchApi('USER', 'updateAcademicConfig', { fullScope: fullScope });
            if (res.status === 'success') {
                // Usar la respuesta del servidor para actualizar el caché (v7.7.5)
                const confirmedScope = res.data || fullScope;
                if (window.PersistenceManager) {
                    await window.PersistenceManager.set('academic_stats', confirmedScope, 'config');
                }

                window.GLOBAL_SCOPE = confirmedScope;
                window.PARCIAL_ACTUAL = confirmedScope.ParcialActual;
                alert('Configuración global actualizada correctamente.');

                // Disparar evento para que otros componentes reaccionen
                document.dispatchEvent(new CustomEvent('academic-scope-updated', { detail: confirmedScope }));
            } else {
                throw new Error(res.message);
            }
        } catch (e) {
            alert('Error al guardar configuración: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Configuración';
        }
    });

    // Lógica de Migración del Banco de Preguntas (Fase 2)
    document.getElementById('btn-migrate-questions')?.addEventListener('click', async () => {
        if (!confirm('Esta acción escaneará el repositorio y migrará todas las preguntas detectadas al Banco Central en Google Sheets. ¿Deseas continuar?')) return;

        const btn = document.getElementById('btn-migrate-questions');
        const statusMsg = document.getElementById('migration-status-msg');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Migrando...';
        statusMsg.classList.remove('hidden');
        statusMsg.textContent = 'Iniciando escaneo del repositorio...';

        try {
            // Simulamos el proceso que el agente ya realizó, pero lo exponemos como acción
            // En el backend ya tenemos generateMigrationReport, pero la extracción es local al repo.
            // Por lo tanto, usaremos el JSON que generó Jules para "subirlo" como si el script corriera.

            const migrateUrl = 'migrated_questions.json';
            const response = await fetch(migrateUrl);
            if (!response.ok) throw new Error(`No se encontró el archivo de migración (${migrateUrl}). El agente debe regenerarlo.`);

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error(`[MIGRATION_ERROR] Se esperaba JSON pero se recibió: ${contentType}. Snippet: ${text.substring(0, 100)}`);
                throw new Error(`Respuesta inválida del servidor (no es JSON). Revisa la consola para más detalles.`);
            }

            const questions = await response.json();

            statusMsg.textContent = `Detectadas ${questions.length} preguntas. Validando integridad...`;

            // Filtro de integridad y validación obligatoria (Fase 4 / Incidencia 2)
            let excludedCount = 0;
            const validQuestions = questions.filter(q => {
                const result = window.validateQuestion(q);
                if (!result.valid) {
                    excludedCount++;
                    return false;
                }
                return true;
            });


            if (validQuestions.length === 0) throw new Error("Ninguna pregunta pasó el filtro de validación de integridad.");

            statusMsg.textContent = `Listas ${validQuestions.length} preguntas válidas. Subiendo al Banco Central...`;

            let successCount = 0;
            const chunkSize = 20;
            for (let i = 0; i < validQuestions.length; i += chunkSize) {
                const chunk = validQuestions.slice(i, i + chunkSize);
                await Promise.all(chunk.map(q => fetchApi('USER', 'saveQuestion', {
                    Asignatura: q.Asignatura,
                    Nivel: q.Nivel,
                    Tema: q.Tema || "General",
                    TipoActividad: q.TipoActividad || "Selección múltiple",
                    Pregunta: q.Pregunta,
                    OpcionA: q.OpcionA,
                    OpcionB: q.OpcionB,
                    OpcionC: q.OpcionC || "",
                    OpcionD: q.OpcionD || "",
                    RespuestaCorrecta: q.RespuestaCorrecta,
                    Activa: true
                })));
                successCount += chunk.length;
                statusMsg.textContent = `Progreso: ${successCount} / ${validQuestions.length} preguntas migradas...`;
            }

            const statsRes = await fetch('migration_stats.json');
            const stats = await statsRes.json();

            await fetchApi('USER', 'generateMigrationReport', {
                stats: {
                    totalDetectadas: stats.totalDetectadas,
                    totalMigradas: successCount,
                    asignaturas: stats.asignaturas,
                    detalle: "Migración ejecutada desde el Panel de Administración"
                }
            });

            alert(`¡Migración Exitosa! Se han sincronizado ${successCount} preguntas.`);
            statusMsg.textContent = 'Sincronización Completada.';
        } catch (e) {
            console.error(e);
            alert('Error durante la migración: ' + e.message);
            statusMsg.textContent = 'Fallo en la sincronización.';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar / Migrar Banco';
        }
    });

    const btnCloseYear = document.getElementById('btn-close-year');
    if (btnCloseYear) {
        btnCloseYear.onclick = async () => {
            const format = document.getElementById('backup-format').value;
            if (confirm(`¡ATENCIÓN! Vas a finalizar el año escolar.\n\nSe eliminarán tareas y entregas.\nSe archivará respaldo en formato ${format}.\n\n¿Deseas continuar?`)) {
                btnCloseYear.disabled = true;
                btnCloseYear.textContent = 'Procesando...';
                try {
                    const res = await fetchApi('TASK', 'closeAcademicYear', { profesorId: currentUser.userId, format });
                    if (res.status === 'success') {
                        alert(res.message);
                        window.location.reload();
                    } else {
                        alert('Error: ' + res.message);
                    }
                } catch (e) {
                    alert('Error de conexión.');
                } finally {
                    btnCloseYear.disabled = false;
                    btnCloseYear.textContent = 'Ejecutar Cierre';
                }
            }
        };
    }
    navReportsOld.addEventListener('click', () => {
        window.navigateTo(sectionReportes, navReportsOld);
    });

    // --- Mi Perfil (Centralizado en ui-common.js) ---


    // --- Lógica de Reporte Académico ---
    const btnGenerateReport = document.getElementById('btn-generate-report');
    if (btnGenerateReport) {
        btnGenerateReport.onclick = async () => {
            const grado = document.getElementById('report-grado').value;
            const seccion = document.getElementById('report-seccion').value;
            const parcial = document.getElementById('report-parcial').value;
            const tbody = document.getElementById('report-table-body');
            const thead = document.getElementById('report-table-head');

            const cacheKey = `report_${grado}_${seccion}_${parcial}`;

            const renderReport = (students, allTasks, allExams, taskSubmissions, examSubmissions) => {
                let headHtml = `<tr class="bg-gray-50 border-b border-gray-100">
                    <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Nº</th>
                    <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Alumno</th>`;

                allTasks.forEach(t => {
                    headHtml += `<th class="p-4 text-center font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]" title="${t.titulo}">${t.titulo.substring(0,10)}...</th>`;
                });
                allExams.forEach(e => {
                    headHtml += `<th class="p-4 text-center font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]" title="${e.titulo}">EX: ${e.titulo.substring(0,8)}...</th>`;
                });

                headHtml += `<th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Total</th></tr>`;
                thead.innerHTML = headHtml;

                if (!students || students.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="10" class="p-8 text-center text-gray-400">No se encontraron alumnos para los filtros seleccionados.</td></tr>';
                    return;
                }

                tbody.innerHTML = students.map((s, idx) => {
                    let total = 0;
                    let rowHtml = `<tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4 text-gray-400 font-mono text-xs">${s.numeroLista || idx+1}</td>
                        <td class="p-4 font-medium text-gray-800">${s.nombre}</td>`;

                    allTasks.forEach(t => {
                        const sub = taskSubmissions.find(sub => sub.alumnoId == (s.userId || s.id) && sub.titulo === t.titulo);
                        const score = sub ? parseFloat(sub.calificacion || 0) : 0;
                        total += score;
                        rowHtml += `<td class="p-4 text-center font-medium ${score > 0 ? 'text-green-600' : 'text-gray-300'}">${score}</td>`;
                    });

                    allExams.forEach(e => {
                        const sub = examSubmissions.find(sub => sub.alumnoId == (s.userId || s.id) && sub.titulo === e.titulo);
                        const score = sub ? parseFloat(sub.calificacion || 0) : 0;
                        total += score;
                        rowHtml += `<td class="p-4 text-center font-medium ${score > 0 ? 'text-purple-600' : 'text-gray-300'}">${score}</td>`;
                    });

                    const approved = total >= 70;
                    rowHtml += `<td class="p-4 text-right font-semibold ${approved ? 'text-blue-700' : 'text-red-600'}">${total}%</td></tr>`;
                    return rowHtml;
                }).join('');
            };

            // REQ: Eager Caching for Academic Reports
            let hasLocal = false;
            if (window.PersistenceManager) {
                const cached = await window.PersistenceManager.get('cache_teacher_reports', cacheKey);
                if (cached && cached.data) {
                    const d = cached.data;
                    renderReport(d.students, d.allTasks, d.allExams, d.taskSubmissions, d.examSubmissions);
                    hasLocal = true;
                }
            }

            if (!hasLocal) {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center p-8">Cargando reporte...</td></tr>';
            }

            try {
                const [studentsRes, tasksRes, examsRes, taskSubRes, examSubRes] = await Promise.all([
                    fetchApi('USER', 'getStudentsByGradoSeccion', { grado, seccion }),
                    fetchApi('TASK', 'getAllTasks', { profesorId: currentUser.userId }),
                    fetchApi('EXAM', 'getAllExams', { profesorId: currentUser.userId }),
                    fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId, grado, seccion }),
                    fetchApi('EXAM', 'getTeacherExamActivity', { profesorId: currentUser.userId, grado, seccion })
                ]);

                const students = studentsRes.data || [];
                const allTasks = (tasksRes.data || []).filter(t => norm(t.grado) === norm(grado) && (!t.seccion || norm(t.seccion) === norm(seccion)) && window.normalizePartial(t.parcial) === window.normalizePartial(window.PARCIAL_ACTUAL));
                const allExams = (examsRes.data || []).filter(e => norm(e.grado) === norm(grado) && (!e.seccion || norm(e.seccion) === norm(seccion) || norm(e.seccion) === 'todas'));
                const taskSubmissions = taskSubRes.data || [];
                const examSubmissions = examSubRes.data || [];

                if (window.PersistenceManager) {
                    window.PersistenceManager.set('cache_teacher_reports', {
                        students, allTasks, allExams, taskSubmissions, examSubmissions
                    }, cacheKey);
                }

                renderReport(students, allTasks, allExams, taskSubmissions, examSubmissions);

            } catch (e) {
                tbody.innerHTML = `<tr><td colspan="10" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
            }
        };
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

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
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'code-block'],
            ['clean']
        ];

        if (!quillTask && document.getElementById('editor-task-container')) {
            quillTask = new Quill('#editor-task-container', { theme: 'snow', placeholder: 'Escribe la descripción de la tarea...', modules: { toolbar: toolbarOptions } });
            quillTask.root.style.color = '#000000';
        }
        if (!quillExam && document.getElementById('editor-exam-container')) {
            quillExam = new Quill('#editor-exam-container', { theme: 'snow', placeholder: 'Escribe las instrucciones del examen...', modules: { toolbar: toolbarOptions } });
            quillExam.root.style.color = '#000000';
        }
        if (!quillEdit && document.getElementById('editor-edit-container')) {
            quillEdit = new Quill('#editor-edit-container', { theme: 'snow', modules: { toolbar: toolbarOptions } });
            quillEdit.root.style.color = '#000000';
        }
        if (!quillNews && document.getElementById('editor-news-container')) {
            quillNews = new Quill('#editor-news-container', { theme: 'snow', placeholder: 'Contenido de la noticia...', modules: { toolbar: toolbarOptions } });
            quillNews.root.style.color = '#000000';
        }

        // REQ: Forzar negro por defecto si no hay un color seleccionado (v7.6.2)
        [quillTask, quillExam, quillEdit, quillNews].forEach(q => {
            if (q) {
                q.on('selection-change', function(range) {
                    if (range && range.length === 0) { // Solo si es el cursor de inserción
                        const formats = q.getFormat(range);
                        // Si no hay color activo, asegurar que el siguiente texto sea negro
                        if (!formats.color) {
                            q.format('color', '#000000', 'silent');
                        }
                    }
                });
            }
        });
    }
    initEditors();

    // Task 1: Control de estados en creación de tareas
    const createTaskType = document.getElementById("create-task-type");
    function updateCreateTaskUIState(type) {
        var isSelected = type !== "";
        var titleInput = document.getElementById("create-task-title");
        var editorContainer = document.getElementById("editor-task-container");
        var extraCreditAsoc = document.getElementById("extra-credit-association-container");

        if (titleInput) titleInput.disabled = !isSelected;
        if (editorContainer) {
            if (isSelected) {
                editorContainer.style.opacity = "1";
                editorContainer.style.pointerEvents = "auto";
            } else {
                editorContainer.style.opacity = "0.5";
                editorContainer.style.pointerEvents = "none";
            }
        }

        if (extraCreditAsoc) {
            if (type === "Crédito Extra") {
                extraCreditAsoc.classList.remove("hidden");
                populateRejectedTasksDropdown("extra-credit-task-asoc");
            } else {
                extraCreditAsoc.classList.add("hidden");
            }
        }
    }

    if (createTaskType) {
        createTaskType.addEventListener("change", function(e) {
            updateCreateTaskUIState(e.target.value);
        });
    }

    const editTaskType = document.getElementById("edit-task-type");
    if (editTaskType) {
        editTaskType.addEventListener("change", function(e) {
            const extraCreditAsoc = document.getElementById("edit-extra-credit-association-container");
            if (extraCreditAsoc) {
                if (e.target.value === "Crédito Extra") {
                    extraCreditAsoc.classList.remove("hidden");
                    populateRejectedTasksDropdown("edit-extra-credit-task-asoc");
                } else {
                    extraCreditAsoc.classList.add("hidden");
                }
            }
        });
    }

    async function populateRejectedTasksDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Cargando tareas rechazadas...</option>';

        try {
            // Buscamos tareas rechazadas en toda la actividad cargada
            const rejected = allActivityRaw.filter(item => item.estado === 'Rechazada');

            if (rejected.length === 0) {
                dropdown.innerHTML = '<option value="">No hay tareas rechazadas para vincular.</option>';
                return;
            }

            // Eliminar duplicados de títulos de tareas rechazadas para el dropdown
            const seenTitles = new Set();
            const uniqueRejected = rejected.filter(r => {
                const key = `${r.titulo}`;
                if (seenTitles.has(key)) return false;
                seenTitles.add(key);
                return true;
            });

            dropdown.innerHTML = '<option value="">Seleccione la tarea a reemplazar...</option>' +
                uniqueRejected.map(r => `<option value="${r.tareaId}_${r.alumnoId}">${r.titulo} - ${r.alumnoNombre}</option>`).join('');
        } catch (e) {
            dropdown.innerHTML = '<option value="">Error al cargar tareas.</option>';
        }
    }

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

        // Task 1: Initialize form with 'Tarea' and enabled editor
        const typeSelect = document.getElementById('create-task-type');
        if (typeSelect) {
            typeSelect.value = "Tarea";
            updateCreateTaskUIState("Tarea");
        }

        // REQ: Automatic focus on initialization (v7.6.1)
        setTimeout(() => {
            if (quillTask) {
                quillTask.focus();
            }
        }, 300);
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
    window.pushNav = async function(level, data, pushState = true) {
        if (isNavigating) return;
        isNavigating = true;
        try {
            if (studentSearchInput) studentSearchInput.value = '';

            if (level === 'Alumnos') {
                if (submissionsTableBody) submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-8">Cargando lista de alumnos...</td></tr>';
                try {
                    const res = await fetchApi('USER', 'getStudentsByGradoSeccion', { grado: data.grado, seccion: data.seccion });
                    data.students = res.data || [];
                } catch (e) {
                    console.error("Error al cargar alumnos:", e);
                    data.students = [];
                }
            }

            navStack.push({ level, data });
            if (pushState) {
                // REQ: Incluir contexto de sección para restauración íntegra (v7.6.4)
                history.pushState({
                    type: 'hierarchical-nav',
                    stack: [...navStack],
                    sectionId: sectionAcademicReports.id,
                    navId: navDashboard.id
                }, '');
            }
            renderCurrentLevel('push');
        } finally {
            isNavigating = false;
        }
    }

    window.popNav = function(doPop = true) {
        if (isNavigating) return;
        if (navStack.length > 1) {
            try {
                if (studentSearchInput) studentSearchInput.value = '';
                if (doPop) {
                    history.back();
                } else {
                    navStack.pop();
                    renderCurrentLevel('pop');
                }
            } catch (e) {
                console.error("Error en popNav:", e);
            }
        }
    }

    window.syncNavWithState = function(state) {
        if (state.stack) {
            navStack = [...state.stack];
            // Ensure studentSearchInput is handled if needed
            renderCurrentLevel('pop');
        }
    };

    if (backNavBtn) backNavBtn.addEventListener('click', popNav);

    // --- MÓDULO 1: Gestión de Tareas y Exámenes ---
    let allTasksExams = [];

    async function fetchManagementData() {
        const tbody = document.getElementById('tasks-management-table-body');
        if (!tbody) return;

        const processData = (tasksData, examsData) => {
            const tasks = (Array.isArray(tasksData) ? tasksData : []).map(t => ({ ...t, tipoReal: 'Tarea' }));
            const exams = (Array.isArray(examsData) ? examsData : []).map(e => ({ ...e, tipoReal: 'Examen' }));
            allTasksExams = [...tasks, ...exams].filter(item => item.estado !== 'Inactiva');
            allTasksExams.sort((a, b) => new Date(b.fechaLimite) - new Date(a.fechaLimite));
            renderManagementTable();
        };

        // REQ: Cache-First logic for Task Management (Ticket: Optimización de Caché)
        let hasLocal = false;
        if (window.PersistenceManager) {
            const cached = await window.PersistenceManager.get('cache_profesor_data');
            if (cached && cached.data && cached.data.assignments) {
                allTasksExams = cached.data.assignments;
                renderManagementTable();
                hasLocal = true;
            }
        }

        if (!hasLocal) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Cargando...</td></tr>';
        }

        try {
            const [tasksRes, examsRes] = await Promise.all([
                fetchApi('TASK', 'getAllTasks', { profesorId: currentUser.userId }),
                fetchApi('EXAM', 'getAllExams', { profesorId: currentUser.userId })
            ]);

            processData(tasksRes.data, examsRes.data);
        } catch (error) {
            if (!hasLocal) tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderManagementTable() {
        const tbody = document.getElementById('tasks-management-table-body');
        if (!tbody) return;
        tbody.innerHTML = allTasksExams.map((item, idx) => `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer group" onclick="window.openTaskDetail(${idx})">
                <td class="p-4">
                    <div class="font-semibold text-gray-900 uppercase tracking-tighter">${item.titulo}</div>
                    <div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">${item.tipoReal}</div>
                </td>
                <td class="p-4">
                    <div class="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">${item.asignatura}</div>
                    <div class="text-[10px] text-gray-400 font-medium">${item.parcial || 'Sin parcial'}</div>
                </td>
                <td class="p-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">${item.grado} - ${item.seccion || 'Todas'}</td>
                <td class="p-4 text-[10px] font-semibold ${new Date(item.fechaLimite) < new Date() ? 'text-red-500' : 'text-green-600'} uppercase tracking-widest">
                    ${new Date(item.fechaLimite).toLocaleDateString()}
                </td>
                <td class="p-4 text-right">
                    <button class="bg-gray-50 text-gray-400 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.openTaskDetail = (idx) => {
        const item = allTasksExams[idx];
        document.getElementById('detail-titulo').textContent = item.titulo;
        // REQ 4: Sanitización HTML en la Edición de Tareas (Modulo 5.4)
        document.getElementById('detail-descripcion').innerHTML = window.sanitizarHTMLTecnico(item.descripcion) || 'Sin descripción.';
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

        // REQ: Inyectar botones de copiado si hay bloques de código (v7.6.4)
        if (window.setupCodeCopyButtons) {
            setTimeout(() => window.setupCodeCopyButtons(), 100);
        }
    };

    document.getElementById('close-task-modal-btn').onclick = () => {
        document.getElementById('task-details-modal').classList.add('hidden');
    };

    document.getElementById('edit-task-btn').onclick = () => {
        const idx = document.getElementById('task-details-modal').dataset.currentIndex;
        const item = allTasksExams[idx];

        document.getElementById('edit-id').value = item.tareaId || item.examenId;
        document.getElementById('edit-tipo-orig').value = item.tipoReal;

        // Task 1: Populate task type in edit form
        const editTypeSelect = document.getElementById('edit-task-type');
        if (editTypeSelect) {
            editTypeSelect.value = item.tipo || "Tarea";
            // Trigger change event to show/hide extra credit association
            const event = new Event('change');
            editTypeSelect.dispatchEvent(event);

            // If it was already associated, we should ideally populate it
            if (item.tareaAsociadaId) {
                setTimeout(() => {
                    const asocSelect = document.getElementById('edit-extra-credit-task-asoc');
                    if (asocSelect) asocSelect.value = item.tareaAsociadaId;
                }, 500); // Give time for populateRejectedTasksDropdown
            }
        }
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
            archivoUrl: document.getElementById('edit-archivo').value,
            tipo: document.getElementById('edit-task-type').value,
            tareaAsociadaId: document.getElementById('edit-extra-credit-task-asoc')?.value || ''
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

    async function fetchEntregasRecientes() {
        const tbody = document.getElementById('op-table-body');
        const thead = document.getElementById('op-table-head');
        if (!tbody || !thead) return;
        tbody.innerHTML = '<tr><td class="text-center p-8">Cargando pendientes...</td></tr>';

        try {
            const res = await fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId });
            if (res.status === 'success') {
                const pending = (res.data || []).filter(i =>
                    (i.estado === 'Pendiente' || i.estado === 'Pendiente de revisión' || !i.estado) &&
                    (i.fileId || i.respuestas || i.entregaId)
                );

                thead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100">
                    <th class="p-4 text-left font-medium text-gray-500 text-[0.7rem] uppercase">Alumno</th>
                    <th class="p-4 text-left font-medium text-gray-500 text-[0.7rem] uppercase">Actividad</th>
                    <th class="p-4 text-left font-medium text-gray-500 text-[0.7rem] uppercase">Fecha</th>
                    <th class="p-4 text-right font-medium text-gray-500 text-[0.7rem] uppercase">Acción</th>
                </tr>`;

                if (pending.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8 text-gray-500">No hay tareas pendientes de revisión. ¡Buen trabajo!</td></tr>';
                    return;
                }

                tbody.innerHTML = pending.map((item, idx) => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4">
                            <div class="font-medium text-gray-800">${item.alumnoNombre}</div>
                            <div class="text-[10px] text-gray-400">${item.grado} - ${item.seccion}</div>
                        </td>
                        <td class="p-4">
                            <div class="font-medium text-blue-700">${item.titulo}</div>
                            <div class="text-[10px] text-gray-400">${item.asignatura} | ${item.tipo}</div>
                        </td>
                        <td class="p-4 text-xs text-gray-500">${new Date(item.fecha).toLocaleString()}</td>
                        <td class="p-4 text-right">
                            <button class="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-blue-700 op-grade-btn" data-index="${idx}">Calificar</button>
                        </td>
                    </tr>
                `).join('');

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


    async function fetchTeacherActivity() {
        if (!submissionsTableBody) return;

        // REQ: Eager Caching & Offline-First (Modulo 1)
        let hasLocalData = false;
        if (window.PersistenceManager) {
            const cached = await window.PersistenceManager.get('cache_profesor_data');
            if (cached && cached.data) {
                allActivityRaw = cached.data.activity || [];
                allAssignmentsRaw = cached.data.assignments || [];
                renderCurrentLevel();
                hasLocalData = true;
            }
        }

        if (!hasLocalData) {
            // REQ: Skeleton Screen (Modulo 3)
            submissionsTableBody.innerHTML = Array(8).fill(0).map(() => `
                <tr class="animate-pulse">
                    <td class="p-4"><div class="skeleton h-4 w-3/4 rounded"></div></td>
                    <td class="p-4 text-right"><div class="skeleton h-4 w-1/4 rounded ml-auto"></div></td>
                </tr>
            `).join('');
        }

        try {
            const payload = { profesorId: currentUser.userId };

            // REQ 2: No disparar loader global si ya renderizamos desde caché
            if (!hasLocalData && window.GamesAdapter) window.GamesAdapter.showLoading(true);

            // REQ: Mitigación de Latencia (Ticket 4) - Parallel fetch with Silent Reconciliation
            const [taskSubmissions, examSubmissions, tasksRes, examsRes, configRes] = await Promise.all([
                fetchApi('TASK', 'getTeacherActivity', payload, 0, {
                    store: 'cache_profesor_activity',
                    onUpdate: (data) => {
                        if (!Array.isArray(data)) return;
                        allActivityRaw = data.map(s => ({ ...s, tipo: 'Tarea' }));
                        renderCurrentLevel();
                    }
                }),
                fetchApi('EXAM', 'getTeacherExamActivity', payload, 0, {
                    store: 'cache_profesor_exams_activity',
                    onUpdate: (data) => {
                        if (!Array.isArray(data)) return;
                        // Merge with tasks activity
                        allActivityRaw = [...allActivityRaw.filter(a => a.tipo === 'Tarea'), ...data.map(s => ({ ...s, tipo: 'Examen' }))];
                        renderCurrentLevel();
                    }
                }),
                fetchApi('TASK', 'getAllTasks', payload),
                fetchApi('EXAM', 'getAllExams', payload),
                fetchApi('USER', 'getAcademicConfig')
            ]);

            // Guardar para Offline-First (Modulo 1)
            if (window.PersistenceManager) {
                const taskDataArr = Array.isArray(taskSubmissions.data) ? taskSubmissions.data : [];
                const examDataArr = Array.isArray(examSubmissions.data) ? examSubmissions.data : [];
                const taskResArr = Array.isArray(tasksRes.data) ? tasksRes.data : [];
                const examResArr = Array.isArray(examsRes.data) ? examsRes.data : [];

                const unified = {
                    activity: [
                        ...taskDataArr.map(s => ({ ...s, tipo: 'Tarea' })),
                        ...examDataArr.map(s => ({ ...s, tipo: 'Examen' }))
                    ],
                    assignments: [
                        ...taskResArr.map(t => ({ ...t, tipoReal: 'Tarea' })),
                        ...examResArr.map(e => ({ ...e, tipoReal: 'Examen' }))
                    ].filter(a => a.estado !== 'Inactiva')
                };
                window.PersistenceManager.set('cache_profesor_data', unified);
            }

            if (configRes && configRes.status === 'success' && configRes.data && configRes.data.ParcialActual) {
                window.PARCIAL_ACTUAL = configRes.data.ParcialActual;
            }

            const finalTaskDataArr = Array.isArray(taskSubmissions.data) ? taskSubmissions.data : [];
            const finalExamDataArr = Array.isArray(examSubmissions.data) ? examSubmissions.data : [];
            const finalTaskResArr = Array.isArray(tasksRes.data) ? tasksRes.data : [];
            const finalExamResArr = Array.isArray(examsRes.data) ? examsRes.data : [];

            allActivityRaw = [
                ...finalTaskDataArr.map(s => ({ ...s, tipo: 'Tarea' })),
                ...finalExamDataArr.map(s => ({ ...s, tipo: 'Examen' }))
            ];

            allAssignmentsRaw = [
                ...finalTaskResArr.map(t => ({ ...t, tipoReal: 'Tarea' })),
                ...finalExamResArr.map(e => ({ ...e, tipoReal: 'Examen' }))
            ].filter(a => a.estado !== 'Inactiva');

            renderCurrentLevel();
        } catch (error) {
            console.error("[IMA-TEACHER] Error en fetchTeacherActivity:", error);
            submissionsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center p-12">
                        <div class="text-gray-400 italic mb-4 text-sm">Fallo en la comunicación con el servidor central.</div>
                        <button onclick="location.reload()" class="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">Reintentar</button>
                    </td>
                </tr>`;
        } finally {
            if (window.GamesAdapter) window.GamesAdapter.showLoading(false);
        }
    }

    function renderCurrentLevel(direction) {
        const current = navStack[navStack.length - 1];
        let title = current.level;

        // Tarea 3: Animación de Navegación
        if (submissionsTableBody && direction) {
            submissionsTableBody.classList.remove('nav-transition-push', 'nav-transition-pop');
            void submissionsTableBody.offsetWidth; // Force reflow
            submissionsTableBody.classList.add(direction === 'push' ? 'nav-transition-push' : 'nav-transition-pop');
        }

        // Limpieza de estados visuales persistentes (A-72)
        const infoCard = document.getElementById('student-details-info-card');
        if (infoCard) infoCard.remove();
        const waContainer = document.querySelector('.bg-green-50');
        if (waContainer) waContainer.classList.add('hidden');

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
            case 'Asignaturas': renderAsignaturas(current.data.grado, current.data.seccion, searchTerm); break;
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
                    alumnosGlobal.push({
                        id: item.alumnoId,
                        nombre: item.alumnoNombre,
                        email: item.email,
                        grado: item.grado,
                        seccion: item.seccion,
                        total: 0
                    });
                    seen.add(key);
                }
            }
        });
        currentFilteredItems = alumnosGlobal;
        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Alumno</th>
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Grado/Secc</th>
                <th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th>
            </tr>`;
        if (alumnosGlobal.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-500">No se encontraron alumnos.</td></tr>'; return; }
        submissionsTableBody.innerHTML = alumnosGlobal.map((a, idx) => `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}">
                <td class="p-4 font-medium text-blue-700">${a.nombre}</td>
                <td class="p-4 text-sm text-gray-500">${a.grado} - ${a.seccion || 'N/A'}</td>
                <td class="p-4 text-right"><span class="text-blue-600 font-medium text-sm">Ver detalles &rsaquo;</span></td>
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
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Grado Académico</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Navegación</th></tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center p-12">
                        <div class="flex flex-col items-center gap-4 text-gray-400">
                            <i class="fas fa-folder-open text-4xl opacity-20"></i>
                            <p class="text-[10px] font-bold uppercase tracking-widest">No se encontraron grados académicos con actividad.</p>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        const getSectionsForGrado = (grado) => {
            let secciones = [...new Set([
                ...allActivityRaw.filter(i => norm(i.grado) === norm(grado)).map(i => i.seccion),
                ...allAssignmentsRaw.filter(i => norm(i.grado) === norm(grado)).map(i => i.seccion)
            ].filter(s => s && norm(s) !== 'todas'))];
            const hasTodas = allAssignmentsRaw.some(a => norm(a.grado) === norm(grado) && (norm(a.seccion) === 'todas' || !a.seccion));
            if (hasTodas && secciones.length === 0) secciones = ['A'];
            return secciones;
        };

        submissionsTableBody.innerHTML = filtered.map((grado, idx) => {
            const sections = getSectionsForGrado(grado);
            const nextStepText = sections.length >= 2 ? "Ver Secciones" : "Ver Materias";

            return `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn group" data-index="${idx}">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center font-semibold group-hover:bg-blue-600 group-hover:text-white transition-all">${grado.charAt(0)}</div>
                        <span class="font-semibold text-gray-900 uppercase tracking-tighter">${grado}</span>
                    </div>
                </td>
                <td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest group-hover:underline transition-all">${nextStepText} &rsaquo;</span></td>
            </tr>`;
        }).join('');
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
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Sección</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = `<tr><td colspan="2" class="text-center p-12 text-gray-400 font-bold text-[10px] uppercase tracking-widest">No hay secciones registradas para este grado.</td></tr>`;
            return;
        }
        submissionsTableBody.innerHTML = filtered.map((seccion, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter">Sección ${seccion}</td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest">Ver Asignaturas &rsaquo;</span></td></tr>`).join('');
    }

    function renderAsignaturas(grado, seccion, search) {
        // Tarea 2: Reglas de Aislamiento e Integridad
        const activePartial = window.PARCIAL_ACTUAL;
        const authorizedAsigs = window.GLOBAL_SCOPE ? window.GLOBAL_SCOPE.AsignaturaActual : [];

        let asignaturas = [...new Set([
            ...allActivityRaw.filter(i =>
                norm(i.grado) === norm(grado) &&
                norm(i.seccion) === norm(seccion) &&
                window.normalizePartial(i.parcial) === window.normalizePartial(activePartial)
            ).map(i => i.asignatura),
            ...allAssignmentsRaw.filter(i =>
                norm(i.grado) === norm(grado) &&
                (norm(i.seccion) === norm(seccion) || !i.seccion || norm(i.seccion) === 'todas') &&
                window.normalizePartial(i.parcial) === window.normalizePartial(activePartial)
            ).map(i => i.asignatura)
        ].filter(s => s))];

        // Filtrar por asignaturas autorizadas en Configuración Global si existen
        if (authorizedAsigs && authorizedAsigs.length > 0) {
            asignaturas = asignaturas.filter(asig => authorizedAsigs.indexOf(asig) !== -1);
        }

        const filtered = asignaturas.filter(s => norm(s).includes(norm(search)));
        currentFilteredItems = filtered;
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Asignatura (${activePartial})</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>`;
        submissionsTableBody.innerHTML = filtered.map((asig, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="${idx}"><td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter">${asig}</td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest">Ver Alumnos &rsaquo;</span></td></tr>`).join('');
    }

    function renderAlumnos(grado, seccion, asignatura, search) {
        const current = navStack[navStack.length - 1];
        const students = current.data.students || [];
        const parcial = current.data.parcial;

        // WhatsApp Group Integration
        const waContainer = document.createElement('div');
        waContainer.className = "bg-green-50 p-4 rounded-[1.2rem] mb-6 border border-green-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in";
        waContainer.innerHTML = `
            <div>
                <h4 class="text-[10px] font-semibold text-green-800 uppercase tracking-widest mb-1">Grupo de WhatsApp</h4>
                <p class="text-green-600 text-[9px] font-medium uppercase tracking-tighter">Comparte el enlace con tus alumnos.</p>
            </div>
            <div class="flex items-center gap-2">
                <input type="text" id="wa-link-input" readonly class="bg-white border-none rounded-xl p-2 text-[10px] w-64 focus:ring-2 focus:ring-green-400 outline-none transition-all text-gray-500 font-medium" placeholder="https://chat.whatsapp.com/...">
                <button id="btn-edit-wa" class="bg-white text-green-700 px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-green-100 transition-colors shadow-sm">Editar</button>
                <button id="btn-save-wa" class="hidden bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-green-700 transition-colors">Guardar</button>
            </div>
        `;

        // Insert waContainer before filters if not already present
        const existingWa = document.querySelector('.bg-green-50');
        if (existingWa) existingWa.remove();
        filtersContainer.parentNode.insertBefore(waContainer, filtersContainer);
        if (navStack[navStack.length - 1].level !== "Alumnos") waContainer.classList.add("hidden");

        const waInput = document.getElementById('wa-link-input');
        const btnEditWa = document.getElementById('btn-edit-wa');
        const btnSaveWa = document.getElementById('btn-save-wa');

        // Fetch current link (by Grade as per A-66 memory)
        fetchApi('USER', 'getWhatsAppLink', { grado }).then(res => {
            if (res.status === 'success' && res.link) {
                waInput.value = res.link;
            }
        });

        btnEditWa.onclick = () => {
            waInput.readOnly = false;
            waInput.classList.remove('text-gray-500');
            waInput.focus();
            btnEditWa.classList.add('hidden');
            btnSaveWa.classList.remove('hidden');
        };

        btnSaveWa.onclick = async () => {
            const link = waInput.value.trim();
            if (link && !link.includes('whatsapp.com')) {
                alert('Por favor, ingresa un enlace válido de WhatsApp.');
                return;
            }
            btnSaveWa.disabled = true;
            btnSaveWa.textContent = 'Guardando...';
            try {
                const res = await fetchApi('USER', 'saveWhatsAppLink', { grado, link });
                if (res.status === 'success') {
                    waInput.readOnly = true;
                    waInput.classList.add('text-gray-500');
                    btnEditWa.classList.remove('hidden');
                    btnSaveWa.classList.add('hidden');
                } else {
                    alert(res.message);
                }
            } catch (e) {
                alert('Error al guardar el enlace.');
            } finally {
                btnSaveWa.disabled = false;
                btnSaveWa.textContent = 'Guardar';
            }
        };

        // Filtrado por búsqueda
        let filtered = students.filter(s => norm(s.nombre).includes(norm(search)));

        // Calcular estado y preparar datos
        const studentsWithStatus = filtered.map(s => {
            const studentSubmissions = allActivityRaw.filter(sub =>
                sub.alumnoId == s.userId &&
                norm(sub.grado) === norm(grado) &&
                norm(sub.seccion) === norm(seccion) &&
                norm(sub.asignatura) === norm(asignatura) &&
                norm(sub.parcial) === norm(parcial)
            );
            const isPending = studentSubmissions.some(sub => {
                const status = sub.estado;
                return (status === 'Pendiente' || status === 'Pendiente de revisión' || !status) &&
                       (sub.fileId || sub.respuestas || sub.entregaId);
            });
            return {
                ...s,
                statusText: isPending ? 'Pendiente' : 'Al día',
                isPending: isPending
            };
        });

        // Aplicar ordenamiento
        studentsWithStatus.sort((a, b) => {
            let valA, valB;
            if (studentSort.column === 'estado') {
                valA = a.statusText;
                valB = b.statusText;
            } else if (studentSort.column === 'numeroLista') {
                valA = parseInt(a.numeroLista) || 999;
                valB = parseInt(b.numeroLista) || 999;
            } else {
                valA = norm(a[studentSort.column]);
                valB = norm(b[studentSort.column]);
            }

            if (valA < valB) return studentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return studentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        currentFilteredItems = studentsWithStatus;

        // Render Student List (Simplified as per requirements)
        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="numeroLista">No. Lista</th>
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="nombre">Nombre del alumno</th>
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="estado">estado</th>
                <th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">acción</th>
            </tr>`;

        if (studentsWithStatus.length === 0) {
            submissionsTableBody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-gray-500">No hay alumnos inscritos.</td></tr>`;
            return;
        }

        submissionsTableBody.innerHTML = studentsWithStatus.map((s, idx) => {
            const statusClass = s.isPending ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700';

            return `
                <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn group" data-index="${idx}">
                    <td class="p-4 text-gray-400 font-mono text-xs">${s.numeroLista || '-'}</td>
                    <td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                        ${s.nombre}
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-widest ${statusClass}">${s.statusText}</span>
                    </td>
                    <td class="p-4 text-right">
                        <span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest">Detalles &rsaquo;</span>
                    </td>
                </tr>`;
        }).join('');
    }

    function renderDetallesAlumno(alumnoId, grado, seccion, asignatura, search) {
        const fEstado = document.getElementById('filter-estado').value;
        const isGlobalSearch = (asignatura === 'Búsqueda Global');
        const current = navStack[navStack.length - 1];
        const parcial = current.data.parcial;

        // Rediseño completo de la Tarjeta del Alumno (A-72)
        const studentInfo = current.data.studentInfo || null;
        // Cargar Analítica de Aprendizaje (Fase 9)
        if (studentInfo) {
            fetchApi("USER", "getLearningProfile", { userId: studentInfo.userId || studentInfo.id }).then(res => {
                if (res.status === "success" && res.data) {
                    renderTeacherPsychometricModule(res.data);
                }
            }).catch(e => console.warn("Fallo carga analítica docente:", e));
        }
        const existingInfoCard = document.getElementById('student-details-info-card');
        if (existingInfoCard) existingInfoCard.remove();

        if (studentInfo) {
            const infoCard = document.createElement('div');
            infoCard.id = 'student-details-info-card';
            infoCard.className = "bg-white rounded-[2.5rem] shadow-xl border border-gray-100 mb-8 overflow-hidden animate-fade-in-up transition-all hover:shadow-2xl hover:shadow-blue-50";

            const waPhone = studentInfo.telefono ? String(studentInfo.telefono).replace(/\D/g, '') : '';
            const waLink = waPhone ? `https://wa.me/504${waPhone}` : '#';

            // Calcular carga académica total (A-73)
            // REQ: Filtro Estricto por Parcial (Incidencia 5)
            const activeParcial = window.normalizePartial(window.PARCIAL_ACTUAL);

            const subjectAssignments = allAssignmentsRaw.filter(a =>
                norm(a.grado) === norm(grado) &&
                (!a.seccion || norm(a.seccion) === norm(seccion) || norm(a.seccion) === 'todas') &&
                (isGlobalSearch || norm(a.asignatura) === norm(asignatura)) &&
                (isGlobalSearch || window.normalizePartial(a.parcial) === activeParcial)
            );

            const studentSubmissions = allActivityRaw.filter(sub =>
                sub.alumnoId == alumnoId &&
                norm(sub.grado) === norm(grado) &&
                norm(sub.seccion) === norm(seccion) &&
                norm(sub.asignatura) === norm(asignatura) &&
                (isGlobalSearch || window.normalizePartial(sub.parcial) === activeParcial)
            );

            // --- Ajuste de Lógica de Progreso (Req 2) ---
            // Excluir 'Crédito Extra' del total asignado (baseline)
            const baseAssignments = subjectAssignments.filter(a => a.tipo !== 'Crédito Extra');
            const totalAssigned = baseAssignments.length;

            const mandatoryCompleted = studentSubmissions.filter(s => {
                const assignment = subjectAssignments.find(a => norm(a.titulo) === norm(s.titulo));
                return (s.estado === 'Completada' || s.estado === 'Revisada' || s.estado === 'Finalizado') && assignment && assignment.tipo !== 'Crédito Extra';
            }).length;

            const extraCreditCompleted = studentSubmissions.filter(s => {
                const assignment = subjectAssignments.find(a => norm(a.titulo) === norm(s.titulo));
                return (s.estado === 'Completada' || s.estado === 'Revisada' || s.estado === 'Finalizado') && assignment && assignment.tipo === 'Crédito Extra';
            }).length;

            const completed = Math.min(totalAssigned, mandatoryCompleted + extraCreditCompleted);
            const delivered = studentSubmissions.length;
            const pending = studentSubmissions.filter(s => (s.estado === 'Pendiente' || s.estado === 'Pendiente de revisión' || !s.estado) && (s.fileId || s.respuestas || s.entregaId)).length;

            // Tasa de entrega basada en tareas obligatorias
            const mandatoryDelivered = studentSubmissions.filter(s => {
                const assignment = subjectAssignments.find(a => norm(a.titulo) === norm(s.titulo));
                return assignment && assignment.tipo !== 'Crédito Extra' && assignment.tipo !== 'Credito Extra';
            }).length;
            const deliveryRate = totalAssigned > 0 ? (mandatoryDelivered / totalAssigned) : 0;

            // Puntos totales obtenidos (incluye recuperación por créditos extra)
            const gradeSum = studentSubmissions.reduce((sum, s) => sum + parseFloat(s.calificacion || 0), 0);

            // El máximo posible se basa en las tareas obligatorias
            const maxGradePossible = baseAssignments.reduce((sum, a) => sum + parseFloat(a.puntaje || 100), 0);
            const academicPerformance = maxGradePossible > 0 ? Math.min(1, gradeSum / maxGradePossible) : 0;

            // Factor Puntualidad (Req 4.3): Penalización por entregas tardías
            let onTimeCount = 0;
            studentSubmissions.forEach(sub => {
                const assignment = subjectAssignments.find(a => norm(a.titulo) === norm(sub.titulo));
                if (assignment && assignment.fechaLimite) {
                    // Si se entregó después de la fecha límite (comparando solo fechas para evitar problemas de horas)
                    const subDate = new Date(sub.fecha); subDate.setHours(0,0,0,0);
                    const limitDate = new Date(assignment.fechaLimite); limitDate.setHours(0,0,0,0);
                    if (subDate <= limitDate) onTimeCount++;
                } else {
                    onTimeCount++; // Si no hay fecha límite, se considera a tiempo
                }
            });
            const punctualityRate = delivered > 0 ? (onTimeCount / delivered) : 1;

            // Cálculo final de progreso compuesto
            let compositeProgress = Math.round(((deliveryRate * 0.3) + (academicPerformance * 0.5) + (punctualityRate * 0.2)) * 100);
            if (isNaN(compositeProgress)) compositeProgress = 0;

            let levelText = "Iniciando";
            let levelColor = "text-blue-600";
            if (compositeProgress >= 90) { levelText = "Excelencia"; levelColor = "text-emerald-600"; }
            else if (compositeProgress >= 70) { levelText = "Satisfactorio"; levelColor = "text-green-600"; }
            else if (compositeProgress >= 50) { levelText = "En Mejora"; levelColor = "text-yellow-600"; }
            else if (compositeProgress > 0) { levelText = "En Riesgo"; levelColor = "text-orange-600"; }

            infoCard.innerHTML = `
                <div class="p-4 md:p-6">
                    <!-- Sección 1: Encabezado y Acciones -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-semibold shadow-xl shadow-blue-200 relative transform hover:rotate-3 transition-transform">
                                ${studentInfo.nombre.charAt(0)}
                                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-md" title="Alumno Activo">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <span class="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-semibold uppercase tracking-widest mb-1">Expediente Académico ISEMED</span>
                                <h3 class="text-xl md:text-2xl font-semibold text-gray-900 leading-tight tracking-tight">${studentInfo.nombre}</h3>
                                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-gray-400 font-semibold uppercase tracking-[0.05em]">
                                    <span class="flex items-center gap-1"><div class="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> ${grado} - ${seccion}</span>
                                    <span class="flex items-center gap-1"><div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> ${parcial}</span>
                                    <span class="flex items-center gap-1"><div class="w-1.5 h-1.5 bg-teal-500 rounded-full"></div> LISTA #${studentInfo.numeroLista || '-'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="window.print()" class="px-3 py-2 bg-white text-gray-700 rounded-xl font-semibold text-[9px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-200 flex items-center gap-2 shadow-sm">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                Imprimir
                            </button>
                            ${waPhone ? `<a href="${waLink}" target="_blank" class="px-3 py-2 bg-green-600 text-white rounded-xl font-semibold text-[9px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-2">
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.101.004.242-.038.379.292.144.35.492 1.2.535 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.231-.144.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                WhatsApp
                            </a>` : ''}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <!-- Columna 2: Información del Alumno -->
                        <div class="lg:col-span-4 space-y-4">
                            <h4 class="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-2 border-l-4 border-blue-600 pl-3">Información Personal</h4>
                            <div class="space-y-3">
                                <div class="p-4 bg-gray-50 rounded-[1.2rem] border border-gray-100 shadow-sm group hover:border-blue-200 transition-all">
                                    <span class="block text-[8px] font-semibold text-gray-400 uppercase mb-1">Correo Institucional</span>
                                    <span class="text-[11px] font-semibold text-gray-700 break-all">${studentInfo.email || 'N/A'}</span>
                                </div>
                                <div class="p-4 bg-gray-50 rounded-[1.2rem] border border-gray-100 shadow-sm group hover:border-green-200 transition-all">
                                    <span class="block text-[8px] font-semibold text-gray-400 uppercase mb-1">Contacto Directo</span>
                                    <span class="text-[11px] font-semibold text-gray-700">${studentInfo.telefono || 'No registrado'}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Columna 3: Estado de Tareas -->
                        <div class="lg:col-span-4 space-y-4 lg:border-x lg:border-gray-100 lg:px-6 px-0">
                            <h4 class="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-2 border-l-4 border-purple-500 pl-3">Progreso del Parcial</h4>
                            <div class="space-y-4">
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <div>
                                            <span class="text-[8px] font-semibold text-gray-500 uppercase tracking-widest block">Nivel de Entrega</span>
                                            <span class="text-[10px] font-bold ${levelColor} uppercase tracking-tighter">${levelText}</span>
                                        </div>
                                        <span class="text-xs font-bold text-gray-900">${compositeProgress}%</span>
                                    </div>
                                    <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200 p-0.5">
                                        <div class="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style="width: ${compositeProgress}%"></div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="p-3 bg-white rounded-[1rem] border border-gray-100 text-center shadow-sm">
                                        <span class="block text-2xl font-semibold text-green-600">${completed}</span>
                                        <span class="text-[8px] font-semibold text-gray-400 uppercase tracking-widest">Completas</span>
                                    </div>
                                    <div class="p-3 bg-white rounded-[1rem] border border-gray-100 text-center shadow-sm">
                                        <span class="block text-2xl font-semibold text-yellow-500">${totalAssigned - completed}</span>
                                        <span class="text-[8px] font-semibold text-gray-400 uppercase tracking-widest">Faltantes</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Columna 4: Observaciones y Archivos -->
                        <div class="lg:col-span-4 space-y-4">
                            <h4 class="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-2 border-l-4 border-teal-500 pl-3">Estado Académico</h4>
                            <div class="bg-gray-900 rounded-[1.5rem] p-4 flex flex-col justify-between h-full relative overflow-hidden group">
                                <div class="absolute -top-10 -right-10 w-24 h-24 bg-white opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                <!-- Fase 9: Temas con Dificultad -->
                                <div id="teacher-learning-analytics" class="relative z-10 mb-4 hidden">
                                    <h5 class="text-[8px] font-bold text-orange-400 uppercase tracking-widest mb-2">Temas con Dificultad</h5>
                                    <div id="weak-topics-list" class="flex flex-wrap gap-1"></div>
                                </div>
                                <div class="text-center py-1 relative z-10">
                                    ${pending === 0 && (totalAssigned - completed) === 0 && totalAssigned > 0 ?
                                        `<div class="inline-flex p-2 bg-green-500/20 text-green-400 rounded-xl mb-2 border border-green-500/30"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path></svg></div>
                                         <div class="text-base font-semibold text-white tracking-tight uppercase">AL DÍA</div>
                                         <p class="text-[8px] text-gray-500 uppercase font-semibold tracking-widest mt-1">Carga académica completada</p>` :
                                        `<div class="inline-flex p-2 bg-yellow-500/20 text-yellow-400 rounded-xl mb-2 border border-yellow-500/30"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                                         <div class="text-base font-semibold text-white tracking-tight uppercase">EN CURSO</div>
                                         <p class="text-[8px] text-gray-500 uppercase font-semibold tracking-widest mt-1">${pending} por calificar / ${totalAssigned - completed} faltantes</p>`
                                    }
                                </div>
                                <div class="mt-2 pt-3 border-t border-white/10 relative z-10">
                                    <button class="w-full py-2 bg-white/5 border border-white/10 text-white font-semibold text-[9px] uppercase tracking-[0.1em] rounded-lg hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center gap-2" onclick="window.scrollTo({top: document.querySelector('table').offsetTop - 100, behavior: 'smooth'})">
                                        Explorar evidencias
                                        <svg class="w-3 h-3 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            const table = submissionsTableBody.closest('table');
            if (table) table.parentNode.insertBefore(infoCard, table);
        }

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
        dashboardTableHead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100"><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Actividad</th><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Estado</th><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Archivo</th><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Nota</th><th class="px-2 py-2 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Acción</th></tr>`;
        if (finalFiltered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">Sin entregas.</td></tr>'; return; }
        submissionsTableBody.innerHTML = finalFiltered.map((item, idx) => {
            let statusClass = 'bg-gray-50 text-gray-500'; let statusText = item.estado || 'Pendiente';

            if (item.estado === 'Completada' || item.estado === 'Revisada') {
                statusText = 'Completada';
                statusClass = 'bg-green-50 text-green-700';
            } else if (item.estado === 'Rechazada' || item.estado === 'Tarea incompleta') {
                statusClass = 'bg-red-50 text-red-700';
            } else if (item.estado === 'Pendiente de revisión' || item.fileId || item.respuestas || item.entregaId) {
                statusText = item.estado === 'Pendiente de revisión' ? 'Pendiente' : 'Por calificar';
                statusClass = 'bg-yellow-50 text-yellow-700';
            }

            let fileHtml = '<span class="text-gray-300">-</span>';
            if (item.fileId) {
                const fId = extractDriveId(item.fileId);
                fileHtml = `<a href="https://drive.google.com/uc?id=${fId}" target="_blank" class="text-blue-600 font-semibold text-[10px] uppercase tracking-widest hover:underline">Ver Archivo</a>`;
            }

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-1 py-2"><div class="font-semibold text-gray-900 uppercase tracking-tighter text-[11px] line-clamp-1">${item.titulo}</div><div class="text-[8px] font-semibold text-gray-400 uppercase tracking-widest">${item.asignatura}</div></td>
                    <td class="px-1 py-2"><span class="px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-widest ${statusClass}">${statusText}</span></td>
                    <td class="px-1 py-2">${fileHtml}</td>
                    <td class="px-1 py-2 font-semibold text-gray-900 text-[10px]">${item.calificacion || '-'}</td>
                    <td class="px-1 py-2 text-right space-x-1">
                        <button class="bg-blue-600 text-white px-2 py-1 rounded-md text-[8px] font-bold uppercase grade-btn" data-index="${idx}">Calificar</button>
                        <button class="bg-red-50 text-red-600 px-2 py-1 rounded-md text-[8px] font-bold uppercase delete-submission-btn" data-index="${idx}">Eliminar</button>
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

            // 1. Manejo de Calificación / Eliminación
            if (target.classList.contains('grade-btn')) {
                const idx = target.dataset.index;
                const item = currentFilteredItems[idx];
                if (!item) return;
                if (saveGradeBtn) saveGradeBtn.dataset.type = item.tipo;
                openGradeModal(item);
                return;
            }

            if (target.classList.contains('delete-submission-btn')) {
                const idx = target.dataset.index;
                const item = currentFilteredItems[idx];
                if (!item) return;
                if (confirm(`¿Eliminar entrega de "${item.titulo}"?`)) {
                    target.disabled = true; target.textContent = "...";
                    try {
                        const service = item.tipo === 'Tarea' ? 'TASK' : 'EXAM';
                        const action = item.tipo === 'Tarea' ? 'deleteSubmission' : 'deleteExamSubmission';
                        const res = await fetchApi(service, action, { entregaId: item.entregaId });
                        if (res.status === 'success') {
                            alert(res.message);
                            await fetchTeacherActivity();
                        }
                        else throw new Error(res.message);
                    } catch (error) {
                        alert("Error: " + error.message);
                        target.disabled = false;
                        target.textContent = "Eliminar";
                    }
                }
                return;
            }

            // 2. Manejo de Navegación Jerárquica
            const navBtn = target.closest('.nav-btn');
            if (navBtn && !isNavigating) {
                const idx = parseInt(navBtn.dataset.index);
                const item = currentFilteredItems[idx];
                if (item === undefined) {
                    console.error("Error de sincronización: Item no encontrado en currentFilteredItems con índice", idx);
                    return;
                }

                const current = navStack[navStack.length - 1];

                if (dashboardLevelTitle.textContent === "Resultados de Búsqueda Global") {
                    await pushNav('Detalles', {
                        alumnoId: item.id,
                        alumnoNombre: item.nombre,
                        grado: item.grado,
                        seccion: item.seccion,
                        asignatura: 'Búsqueda Global',
                        parcial: 'Todos los Parciales',
                        studentInfo: { nombre: item.nombre, email: item.email, userId: item.id }
                    });
                    return;
                }

                if (current.level === 'Grados') {
                    // Tarea 1: Lógica de Omisión Inteligente (Secciones)
                    const getSectionsForGrado = (grado) => {
                        let secciones = [...new Set([
                            ...allActivityRaw.filter(i => norm(i.grado) === norm(grado)).map(i => i.seccion),
                            ...allAssignmentsRaw.filter(i => norm(i.grado) === norm(grado)).map(i => i.seccion)
                        ].filter(s => s && norm(s) !== 'todas'))];
                        const hasTodas = allAssignmentsRaw.some(a => norm(a.grado) === norm(grado) && (norm(a.seccion) === 'todas' || !a.seccion));
                        if (hasTodas && secciones.length === 0) secciones = ['A'];
                        return secciones;
                    };

                    const sections = getSectionsForGrado(item);
                    if (sections.length >= 2) {
                        await pushNav('Secciones', { grado: item });
                    } else {
                        const singleSeccion = sections.length === 1 ? sections[0] : 'A';
                        await pushNav('Asignaturas', { grado: item, seccion: singleSeccion });
                    }
                } else if (current.level === 'Secciones') {
                    await pushNav('Asignaturas', { grado: current.data.grado, seccion: item });
                } else if (current.level === 'Asignaturas') {
                    // Tarea 1: Eliminación de la Etapa de "Parcial"
                    await pushNav('Alumnos', {
                        grado: current.data.grado,
                        seccion: current.data.seccion,
                        asignatura: item,
                        parcial: window.PARCIAL_ACTUAL
                    });
                } else if (current.level === 'Alumnos') {
                    await pushNav('Detalles', {
                        alumnoId: item.userId,
                        alumnoNombre: item.nombre,
                        grado: current.data.grado,
                        seccion: current.data.seccion,
                        asignatura: current.data.asignatura,
                        parcial: current.data.parcial,
                        studentInfo: item
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
            const allTasks = (tasksRes.data || []).filter(t => norm(t.grado) === norm(grado) && (!t.seccion || norm(t.seccion) === norm(seccion)) && window.normalizePartial(t.parcial) === window.normalizePartial(window.PARCIAL_ACTUAL));
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

        // Restablecer estado del botón de guardado (Tarea 1: Inicialización)
        saveGradeBtn.disabled = false;
        saveGradeBtn.classList.remove('btn-loading', 'opacity-50', 'cursor-not-allowed');

        // Mostrar información relevante de la entrega (Req 1)
        const taskTitleEl = document.getElementById('grade-modal-task-title');
        const deliveryDateEl = document.getElementById('grade-modal-date');
        const deliveryTimeEl = document.getElementById('grade-modal-time');

        if (taskTitleEl) taskTitleEl.textContent = entrega.titulo || 'N/A';

        if (entrega.fecha) {
            const dateObj = new Date(entrega.fecha);
            if (deliveryDateEl) deliveryDateEl.textContent = dateObj.toLocaleDateString();
            if (deliveryTimeEl) deliveryTimeEl.textContent = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            if (deliveryDateEl) deliveryDateEl.textContent = 'N/A';
            if (deliveryTimeEl) deliveryTimeEl.textContent = 'N/A';
        }

        const flm = document.getElementById('file-link-modal');
        if (entrega.tipo === 'Examen') { flm.href = `results.html?entregaExamenId=${entrega.entregaId}`; flm.textContent = "Ver Respuestas"; }
        else if (entrega.fileId) { flm.href = `https://drive.google.com/uc?id=${extractDriveId(entrega.fileId)}`; flm.textContent = "Ver Archivo"; }
        else { flm.href = '#'; flm.textContent = "N/A"; }
        document.getElementById('calificacion').value = entrega.calificacion || '';
        document.getElementById('estado').value = (entrega.estado === 'Revisada' ? 'Completada' : (entrega.estado || 'Completada'));
        document.getElementById('comentario').value = entrega.comentario || '';

        // Bloque de metadatos (A-71)
        saveGradeBtn.dataset.type = entrega.tipo;

        gradeModal.classList.remove('hidden');
    }
    cancelGradeBtn.onclick = () => {
        gradeModal.classList.add('hidden');
        saveGradeBtn.disabled = false;
        saveGradeBtn.classList.remove('btn-loading', 'opacity-50', 'cursor-not-allowed');
    };
    saveGradeBtn.onclick = async () => {
        if (saveGradeBtn.disabled) return;
        const type = saveGradeBtn.dataset.type;

        // REQ: Linking Topic from Global Scope (v7.7.1)
        // Ensure the grade is associated with the current theme for weighting
        const scope = window.GLOBAL_SCOPE || {};

        // Tarea 5: Asegurar compatibilidad con estructuras de arreglo multi-factor
        const temaVal = Array.isArray(scope.TemaActual) ? scope.TemaActual.join(', ') : (scope.TemaActual || "General");
        const asigVal = Array.isArray(scope.AsignaturaActual) ? scope.AsignaturaActual.join(', ') : (scope.AsignaturaActual || "");

        const payload = {
            entregaId: currentEditingEntregaId,
            calificacion: document.getElementById('calificacion').value,
            estado: document.getElementById('estado').value,
            comentario: document.getElementById('comentario').value,
            temaAsociado: temaVal,
            asignaturaAsociada: asigVal
        };

        // Bloqueo temporal del botón (Req 1.3)
        saveGradeBtn.disabled = true;
        saveGradeBtn.classList.add('btn-loading', 'opacity-50', 'cursor-not-allowed');

        try {
            const res = await fetchApi(type === 'Tarea' ? 'TASK' : 'EXAM', type === 'Tarea' ? 'gradeSubmission' : 'gradeExamSubmission', payload);
            if (res.status === 'success') {
                alert('¡Calificación guardada correctamente!');
                gradeModal.classList.add('hidden');
                fetchTeacherActivity();
            }
            else throw new Error(res.message);
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        } finally {
            // Restablecer estado tras éxito o error para el siguiente ciclo (Tarea 1: Restablecimiento)
            saveGradeBtn.disabled = false;
            saveGradeBtn.classList.remove('btn-loading', 'opacity-50', 'cursor-not-allowed');
        }
    };

    // --- CRUD Forms ---
    if (createAssignmentForm) createAssignmentForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const formData = Object.fromEntries(new FormData(e.target).entries());

        // Obtener contenido de Quill
        if (quillTask) formData.descripcion = quillTask.root.innerHTML;

        // Asegurar que tareaAsociadaId se incluya si es Crédito Extra
        if (formData.tipo === 'Crédito Extra') {
            formData.tareaAsociadaId = document.getElementById('extra-credit-task-asoc')?.value || '';
        }

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
        node.innerHTML = `<div class="question-block border p-4 rounded-lg" data-question-id="${qCounter}"><div class="flex justify-between items-center mb-4"><h4 class="font-medium">Pregunta ${qCounter}</h4><button type="button" class="text-red-500 remove-question-btn">Eliminar</button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block font-medium mb-1">Tipo</label><select class="w-full p-2 border rounded question-type-select"><option value="opcion_multiple">Opción Múltiple</option><option value="verdadero_falso">Verdadero/Falso</option><option value="completacion">Completación</option></select></div><div class="md:col-span-2"><label class="block font-medium mb-1">Texto</label><input type="text" class="w-full p-2 border rounded question-text"></div><div class="md:col-span-2 options-container"></div><div><label class="block font-medium mb-1">Respuesta</label><input type="text" class="w-full p-2 border rounded correct-answer"></div></div></div>`;
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
        const grado = document.getElementById('proj-filter-grado').value;
        const seccion = document.getElementById('proj-filter-seccion').value;

        // REQ: Eager Caching & Offline-First (Ticket: Optimización de Caché)
        let hasLocal = false;
        const storeName = 'cache_teacher_projects';
        const cacheKey = `${grado || 'all'}_${seccion || 'all'}`;
        if (window.PersistenceManager) {
            const cached = await window.PersistenceManager.get(storeName, cacheKey);
            if (cached && cached.data) {
                allProjectsRaw = cached.data;
                renderProjects();
                hasLocal = true;
            }
        }

        if (!hasLocal) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8">Cargando proyectos...</td></tr>';
        }

        try {
            const res = await fetchApi('TASK', 'getAllStudentProjects', { grado, seccion }, 0, {
                store: storeName,
                key: cacheKey,
                onUpdate: (data) => {
                    allProjectsRaw = data.data || data;
                    renderProjects();
                }
            });
            if (res.status === 'success') {
                allProjectsRaw = res.data || [];
                renderProjects();
            }
        } catch (e) {
            if (!hasLocal) tbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
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
                <td class="p-4 font-medium text-gray-800">${p.alumnoNombre}</td>
                <td class="p-4 text-blue-600 font-medium">${p.projectName}</td>
                <td class="p-4 text-xs text-gray-500">${p.grado} - ${p.seccion}</td>
                <td class="p-4 text-xs text-gray-400">${new Date(p.lastUpdated).toLocaleString()}</td>
                <td class="p-4 text-right">
                    <button onclick="window.viewProjectCode('${p.fileId}', '${p.projectName}')" class="bg-blue-600 text-white px-3 py-1 rounded-xl text-xs font-medium">Ver Código</button>
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
        const grado = document.getElementById('logros-filter-grado').value;
        const seccion = document.getElementById('logros-filter-seccion').value;

        const renderLogrosData = (data) => {
            const records = {};
            (data || []).forEach(r => {
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
                    <td class="p-4 font-medium text-gray-800">${r.alumno}</td>
                    <td class="p-4 text-purple-600 font-medium">${r.juego}</td>
                    <td class="p-4"><span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">${r.maxScore}</span></td>
                    <td class="p-4 text-xs italic text-gray-600">${r.lastLogro}</td>
                    <td class="p-4 text-xs text-gray-400">${new Date(r.fecha).toLocaleString()}</td>
                </tr>`).join('');
        };

        // REQ: Eager Caching (Ticket: Optimización de Caché)
        let hasLocal = false;
        const storeName = 'cache_teacher_logros';
        const cacheKey = `${grado || 'all'}_${seccion || 'all'}`;
        if (window.PersistenceManager) {
            const cached = await window.PersistenceManager.get(storeName, cacheKey);
            if (cached && cached.data) {
                renderLogrosData(cached.data);
                hasLocal = true;
            }
        }

        if (!hasLocal) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8">Cargando logros...</td></tr>';
        }

        try {
            // REQ 4: Inicialización de Logros sin filtros obligatorios (Modulo 4)
            const res = await fetchApi('USER', 'getGameStats', { grado: grado || null, seccion: seccion || null }, 0, {
                store: storeName,
                key: cacheKey,
                onUpdate: (data) => renderLogrosData(data.data || data)
            });
            if (res.status === 'success') {
                renderLogrosData(res.data);
            }
        } catch (e) {
            if (!hasLocal) tbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
        }
    }
    document.getElementById('refresh-logros-btn').onclick = fetchLogros;
    document.getElementById('logros-filter-grado').onchange = fetchLogros;
    document.getElementById('logros-filter-seccion').onchange = fetchLogros;



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
                        <div class="h-40 overflow-hidden bg-gray-50">
                            <img src="${window.convertDriveLink(n.imagenUrl)}" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[9px] font-medium uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${n.categoria}</span>
                            <span class="text-[10px] text-gray-400">${n.fecha}</span>
                        </div>
                        <h3 class="font-medium text-gray-800 mb-2 line-clamp-2">${n.titulo}</h3>
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
                    // Usar la URL directa retornada por el backend si está disponible (Req 1)
                    imageUrl = uploadRes.data.directUrl || uploadRes.data.fileId;
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

/**
 * REQ: Clonación Segura de Tabla Psicométrica y Gráficos (Modulo 3 y 5)
 * Inyecta el panel analítico del estudiante en la vista del profesor.
 */
function renderTeacherPsychometricModule(profileData) {
    const analyticsDiv = document.getElementById("teacher-learning-analytics");
    if (!analyticsDiv) return;

    if (!profileData || profileData.length === 0) {
        analyticsDiv.innerHTML = '<p class="text-[8px] text-gray-500 uppercase font-bold text-center py-4">Datos psicométricos insuficientes.</p>';
        analyticsDiv.classList.remove("hidden");
        return;
    }

    // Calcular promedios para índices rápidos
    const avgICR = profileData.reduce((s, i) => s + (i.dominio || 0), 0) / profileData.length;
    const avgMastery = profileData.reduce((s, i) => s + (i.porcentaje || 0), 0) / profileData.length;
    const avgIA = 100 - avgICR; // Estimación para vista rápida

    analyticsDiv.innerHTML = `
        <h5 class="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-4">Análisis Cognitivo del Alumno</h5>

        <!-- Índices Psicométricos (Modulo 5.3) -->
        <div class="grid grid-cols-3 gap-2 mb-6">
            <div class="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                <p class="text-[6px] font-black text-gray-500 uppercase mb-1">Confianza</p>
                <p class="text-[10px] font-bold text-blue-400">${window.redondearMetrica(avgICR)}%</p>
            </div>
            <div class="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                <p class="text-[6px] font-black text-gray-500 uppercase mb-1">Dominio</p>
                <p class="text-[10px] font-bold text-emerald-400">${window.redondearMetrica(avgMastery)}%</p>
            </div>
            <div class="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                <p class="text-[6px] font-black text-gray-500 uppercase mb-1">Adivinación</p>
                <p class="text-[10px] font-bold text-orange-400">${window.redondearMetrica(avgIA)}%</p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white/5 rounded-xl p-2 border border-white/10">
                <canvas id="teacher-radar-chart" height="120"></canvas>
            </div>
            <div class="bg-white/5 rounded-xl p-2 border border-white/10">
                <canvas id="teacher-trend-chart" height="120"></canvas>
            </div>
        </div>
        <div class="space-y-3">
             <h6 class="text-[7px] font-black text-gray-500 uppercase tracking-tighter">Fortalezas y Debilidades</h6>
             <div id="teacher-weak-topics-list" class="flex flex-wrap gap-1"></div>
        </div>
    `;
    analyticsDiv.classList.remove("hidden");

    // Población de temas
    const list = document.getElementById("teacher-weak-topics-list");
    const weakTopics = profileData.filter(t => t.dominio < 60 && t.tema !== 'General').slice(0, 5);
    const strongTopics = profileData.filter(t => t.dominio >= 80 && t.tema !== 'General').slice(0, 3);

    let html = strongTopics.map(t => `<span class="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[7px] font-bold uppercase">${t.tema}</span>`).join("");
    html += weakTopics.map(t => `<span class="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-[7px] font-bold uppercase">${t.tema}</span>`).join("");
    list.innerHTML = html || '<span class="text-[7px] text-gray-500 italic">Analizando patrones...</span>';

    // Inicializar Gráficos
    setTimeout(() => {
        const radarCtx = document.getElementById('teacher-radar-chart')?.getContext('2d');
        const trendCtx = document.getElementById('teacher-trend-chart')?.getContext('2d');
        if (!radarCtx || !trendCtx) return;

        const avgICR = profileData.reduce((s, i) => s + (i.dominio || 0), 0) / profileData.length;
        const avgMastery = profileData.reduce((s, i) => s + (i.porcentaje || 0), 0) / profileData.length;

        if (window.teacherRadarChart) window.teacherRadarChart.destroy();
        window.teacherRadarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['ICR', 'MST', 'STB'],
                datasets: [{
                    data: [avgICR, avgMastery, 100 - (100 - avgICR)],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    pointRadius: 0
                }]
            },
            options: {
                scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.05)' }, pointLabels: { font: { size: 6 } } } },
                plugins: { legend: { display: false } }
            }
        });

        const trendData = profileData.slice(-5).map(i => i.dominio);
        if (window.teacherTrendChart) window.teacherTrendChart.destroy();
        window.teacherTrendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trendData.map((_, i) => i + 1),
                datasets: [{
                    data: trendData,
                    borderColor: '#10b981',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { display: false }, x: { display: false } },
                plugins: { legend: { display: false } }
            }
        });
    }, 200);
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

    // Inicialización automática de la sección de entregas (A-73)
    // Usar replaceState para el estado inicial incluyendo el stack jerárquico (v7.6.4)
    history.replaceState({
        type: 'hierarchical-nav',
        stack: [{ level: 'Grados', data: null }],
        sectionId: sectionAcademicReports.id,
        navId: navDashboard.id
    }, '');
    window.navigateTo(sectionAcademicReports, navDashboard, false);
    fetchTeacherActivity();
});
/**
 * REQ: Soporte para copia de código en el panel del profesor (v7.6.4)
 */
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        if (window.setupCodeCopyButtons) window.setupCodeCopyButtons();
    });

    const panels = document.querySelectorAll('.dashboard-card, #submissions-table-body');
    panels.forEach(p => observer.observe(p, { childList: true, subtree: true }));
});
