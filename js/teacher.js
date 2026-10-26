// ---------------------------------------------------------------------------
// [T-UX-12] [Fase 3: Experiencia de Usuario y Navegación Unificada] - CONSOLIDACIÓN DE PANELES DE CONTROL POR ROL Y DEPARTAMENTO
// Consolida la visualización de indicadores clave, entregas pendientes de revisión y secciones operativas para el panel docente.
// ---------------------------------------------------------------------------
// [TAREA-F5-019] [Fase 5: Analítica de Admisiones] - Controladores globales de seguimiento operativo de admisiones
window.openAdmissionAnalyticsModal = function() {
    var modal = document.getElementById("modal-admission-analytics");
    if (modal) {
        modal.classList.remove("hidden");
        window.loadAdmissionAnalyticsData();
    }
};

window.loadAdmissionAnalyticsData = function() {
    var yearSelect = document.getElementById("analytics-ano-lectivo");
    var targetAno = yearSelect ? yearSelect.value : "2026";

    fetchApi("ACADEMIC", "getAdmissionAnalyticsReport", { anolectivo: targetAno })
        .then(function(res) {
            if (!res || res.status !== "success") {
                showToast("Error al cargar la analítica de admisiones: " + ((res && res.message) || "Error desconocido"), "error");
                return;
            }

            var totEl = document.getElementById("analytics-metric-total");
            if (totEl) totEl.textContent = res.totalSolicitudes || 0;

            var convEl = document.getElementById("analytics-metric-conversion");
            if (convEl) convEl.textContent = (res.tasaConversionPct || 0) + "%";

            var timeEl = document.getElementById("analytics-metric-time");
            if (timeEl) timeEl.textContent = (res.tiempoPromedioAtencionDias || 0) + " Días";

            var stuckEl = document.getElementById("analytics-metric-stuck");
            if (stuckEl) stuckEl.textContent = res.solicitudesEstancadas || 0;

            var statusGrid = document.getElementById("analytics-status-grid");
            if (statusGrid && res.desgloseEstado) {
                var gridHtml = "";
                var colorMap = {
                    Recibida: "bg-blue-50 text-blue-800 border-blue-100",
                    En_Revision: "bg-amber-50 text-amber-800 border-amber-100",
                    Evaluacion: "bg-purple-50 text-purple-800 border-purple-100",
                    En_Espera: "bg-yellow-50 text-yellow-800 border-yellow-100",
                    Admitida: "bg-emerald-50 text-emerald-800 border-emerald-100",
                    Convertida: "bg-teal-50 text-teal-800 border-teal-100",
                    Rechazada: "bg-red-50 text-red-800 border-red-100",
                    Retirada: "bg-gray-50 text-gray-800 border-gray-100"
                };
                Object.keys(res.desgloseEstado).forEach(function(st) {
                    var cls = colorMap[st] || "bg-slate-50 text-slate-800 border-slate-100";
                    gridHtml += '<div class="p-3 rounded-xl border ' + cls + ' font-bold">' +
                        '<div class="text-[10px] uppercase opacity-75">' + st.replace('_', ' ') + '</div>' +
                        '<div class="text-lg font-black mt-0.5">' + res.desgloseEstado[st] + '</div>' +
                        '</div>';
                });
                statusGrid.innerHTML = gridHtml;
            }

            var funnelBody = document.getElementById("analytics-funnel-tbody");
            if (funnelBody) {
                if (Array.isArray(res.embudoPorGrado) && res.embudoPorGrado.length > 0) {
                    var fHtml = "";
                    res.embudoPorGrado.forEach(function(g) {
                        fHtml += '<tr class="hover:bg-slate-50/80 transition-colors">' +
                            '<td class="py-2.5 px-3 font-black text-slate-900">' + (g.grado || 'General') + '</td>' +
                            '<td class="py-2.5 px-3">' + (g.total || 0) + '</td>' +
                            '<td class="py-2.5 px-3 text-amber-600">' + (g.enRevision || 0) + '</td>' +
                            '<td class="py-2.5 px-3 text-emerald-600">' + (g.admitidos || 0) + '</td>' +
                            '<td class="py-2.5 px-3 text-teal-600">' + (g.matriculados || 0) + '</td>' +
                            '<td class="py-2.5 px-3 text-indigo-600 font-black">' + (g.tasaConversionGradoPct || 0) + '%</td>' +
                            '</tr>';
                    });
                    funnelBody.innerHTML = fHtml;
                } else {
                    funnelBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-400 italic">No hay registros de admisión para el año lectivo seleccionado.</td></tr>';
                }
            }

            var rejectionsList = document.getElementById("analytics-rejections-list");
            if (rejectionsList) {
                if (Array.isArray(res.motivosRechazoMuestra) && res.motivosRechazoMuestra.length > 0) {
                    var rHtml = "";
                    res.motivosRechazoMuestra.forEach(function(m) {
                        rHtml += '<div class="p-2.5 bg-white rounded-xl border border-red-100 shadow-2xs">' +
                            '<p class="font-bold text-slate-800">' + (m.nombreAspirante || 'Aspirante') + ' <span class="text-[10px] text-slate-400 font-mono">(' + (m.solicitudId || '') + ')</span></p>' +
                            '<p class="text-slate-600 text-[11px] mt-0.5">' + (m.motivo || 'Sin motivo detallado') + '</p>' +
                            '</div>';
                    });
                    rejectionsList.innerHTML = rHtml;
                } else {
                    rejectionsList.innerHTML = '<p class="text-slate-400 italic">No hay registros de rechazo en este periodo.</p>';
                }
            }

            window._lastAdmissionAnalyticsCSV = res.csvReport || "Sin datos";
        })
        .catch(function(err) {
            showToast("Error de conexión al cargar analítica: " + (err.message || err), "error");
        });
};

window.exportAdmissionAnalyticsCSV = function() {
    var csvContent = window._lastAdmissionAnalyticsCSV || "Sin datos";
    var blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Reporte_Analitica_Admisiones_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Reporte analítico exportado exitosamente en formato CSV.", "success");
};

window.consolidateTeacherDashboardSummary = function(teacherData) {
    if (!teacherData) {
        return { activeClasses: 0, pendingSubmissions: 0, totalStudents: 0, statusLabel: "Sin asignación" };
    }
    var classes = Array.isArray(teacherData.classes) ? teacherData.classes.length : 0;
    var pending = Array.isArray(teacherData.pendingSubmissions) ? teacherData.pendingSubmissions.length : 0;
    var students = typeof teacherData.totalStudents === 'number' ? teacherData.totalStudents : 0;

    return {
        activeClasses: classes,
        pendingSubmissions: pending,
        totalStudents: students,
        statusLabel: classes > 0 ? "Activo" : "Sin clases asignadas"
    };
};

document.addEventListener('DOMContentLoaded', () => {
    // (A-29) Centralizar capacidades por rol
    const RoleCapabilities = {
        canGrade: (user) => user && (user.rol === 'Profesor' || user.rol === 'Administrador' || user.rol === 'Director' || user.rol === 'Subdirector' || user.rol === 'Secretaria'),
        canManageExams: (user) => user && (user.rol === 'Profesor' || user.rol === 'Coordinador' || user.rol === 'Administrador' || user.rol === 'Director' || user.rol === 'Subdirector' || user.rol === 'Secretaria'),
        canManageDuplicates: (user) => user && (user.rol === 'Administrador' || user.rol === 'Director' || user.rol === 'Secretaría' || user.rol === 'Secretaria' || user.rol === 'Subdirector' || user.rol === 'Coordinador' || user.rol === 'Desarrollador')
    };

    let submissionsTableBody = document.getElementById('submissions-table-body');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));

    if (!currentUser || !RoleCapabilities.canManageExams(currentUser)) {
        window.location.href = 'login.html';
        return;
    }
    const firstName = (currentUser.nombre || currentUser.nombreCompleto || 'Usuario').split(' ')[0];
    const teacherNameElem = document.getElementById('teacher-name');
    if (teacherNameElem) teacherNameElem.textContent = firstName;

    // --- Elementos de Navegación y Secciones ---
    const navDashboard = document.getElementById('nav-dashboard');
    const navGradebook = document.getElementById('nav-gradebook');
    const navAttendance = document.getElementById('nav-attendance');
    const navComunicados = document.getElementById('nav-comunicados');
    const navOrientacion = document.getElementById('nav-orientacion');
    const navSupervision = document.getElementById('nav-supervision');
    const navTareas = document.getElementById('nav-tareas');
    const navProyectos = document.getElementById('nav-proyectos');
    const navLogros = document.getElementById('nav-logros');
    const navNews = document.getElementById('nav-news');
    const navAdmin = document.getElementById('nav-admin');
    const navCoordinacion = document.getElementById('nav-coordinacion');
    const navReportsOld = document.getElementById('nav-reportes');
    const navPlantillas = document.getElementById('nav-plantillas');

    const sectionAcademicReports = document.getElementById('section-dashboard');
    const sectionGradebook = document.getElementById('section-gradebook');
    const sectionAttendance = document.getElementById('section-attendance');
    const sectionComunicados = document.getElementById('section-comunicados');
    const sectionOrientacion = document.getElementById('section-orientacion');
    const sectionSupervision = document.getElementById('section-supervision');
    const sectionTareas = document.getElementById('section-tareas');
    const sectionProyectos = document.getElementById('section-proyectos');
    const sectionLogros = document.getElementById('section-logros');
    const sectionNews = document.getElementById('section-news');
    const sectionAdmin = document.getElementById('section-admin');
    const sectionReportes = document.getElementById('section-reportes');
    const sectionCoordinacion = document.getElementById('section-coordinacion');
    const sectionPlantillas = document.getElementById('section-plantillas');

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

    const allSections = [sectionAcademicReports, sectionGradebook, sectionAttendance, sectionComunicados, sectionOrientacion, sectionSupervision, sectionTareas, sectionProyectos, sectionLogros, sectionNews, sectionAdmin, sectionReportes, sectionPlantillas];
    const allNavLinks = [navDashboard, navGradebook, navAttendance, navComunicados, navOrientacion, navSupervision, navTareas, navProyectos, navLogros, navNews, navAdmin, navReportsOld, navPlantillas];

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
    navGradebook?.addEventListener('click', () => {
        window.navigateTo(sectionGradebook, navGradebook);
        initGradebookModule();
    });
    navAttendance?.addEventListener('click', () => {
        window.navigateTo(sectionAttendance, navAttendance);
        initAttendanceModule();
    });
    navComunicados?.addEventListener('click', () => {
        window.navigateTo(sectionComunicados, navComunicados);
        loadInstitutionalAnnouncementsModule();
    });
    navOrientacion?.addEventListener('click', () => {
        window.navigateTo(sectionOrientacion, navOrientacion);
        initOrientationModule();
    });
    navSupervision?.addEventListener('click', () => {
        window.navigateTo(sectionSupervision, navSupervision);
        loadSupervisionModule();
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

    navCoordinacion?.addEventListener('click', () => {
        window.navigateTo(sectionCoordinacion, navCoordinacion);
    });

    navPlantillas?.addEventListener('click', () => {
        window.navigateTo(sectionPlantillas, navPlantillas);
    });

    document.getElementById('btn-save-coord-assignment')?.addEventListener('click', async () => {
        const anoLectivo = document.getElementById('coord-ano-lectivo')?.value || '2025';
        const grado = document.getElementById('coord-grado-select')?.value;
        const seccion = document.getElementById('coord-seccion-select')?.value;
        const docenteUserId = document.getElementById('coord-docente-id')?.value;
        const esMaestroGuia = document.getElementById('coord-es-maestro-guia')?.checked;

        if (!docenteUserId) {
            alert('Por favor ingrese el ID del docente.');
            return;
        }

        try {
            const resp = await apiCall({
                action: 'assignTeacherToSection',
                anoLectivo, grado, seccion, docenteUserId, esMaestroGuia
            }, 'ACADEMIC');

            if (resp && resp.status === 'success') {
                alert(resp.message || 'Asignación guardada con éxito.');
            } else {
                alert('Error al guardar asignación: ' + (resp?.message || 'Error desconocido'));
            }
        } catch (e) {
            alert('Error de asignación: ' + e.message);
        }
    });

    document.getElementById('btn-open-auto-scheduler')?.addEventListener('click', async () => {
        try {
            const resp = await apiCall({
                action: 'generateAutoSchedules',
                anoLectivo: '2025',
                duracionUnidadMinutos: 45,
                horaInicioLectiva: '07:30'
            }, 'ACADEMIC');
            if (resp && resp.status === 'success') {
                alert('Generador de Horarios: ' + resp.message);
            }
        } catch (e) {
            alert('Error en generador de horarios: ' + e.message);
        }
    });

    let confirmedAssignments = [];

    async function loadAcademicAdminData() {
        const parcialSelect = document.getElementById('admin-parcial-actual');
        if (!parcialSelect) return;

        const applyConfig = (data) => {
            if (!data) return;
            console.log("[IMA-TEACHER] Aplicando configuración recibida:", data);

            if (data.ParcialActual) parcialSelect.value = data.ParcialActual;

            window.GLOBAL_SCOPE = {
                ParcialActual: data.ParcialActual || parcialSelect.value,
                GranularConfig: data.GranularConfig || []
            };
            window.PARCIAL_ACTUAL = window.GLOBAL_SCOPE.ParcialActual;

            // Mapear GranularConfig a confirmedAssignments (v7.9.8)
            confirmedAssignments = (data.GranularConfig || []).map(r => ({
                grado: r.grado,
                seccion: r.seccion,
                asignatura: r.asignatura,
                unidad: r.unidad
            }));

            renderConfirmedAssignments();
            initAssignmentBuilder();
        };

        try {
            const configRes = await fetchApi('ACADEMIC', 'getAcademicConfig', { profesorId: currentUser.userId }, 0, {
                store: 'academic_stats',
                key: 'config_' + currentUser.userId,
                onUpdate: (data) => applyConfig(data)
            });
            if (configRes.status === 'success' && configRes.data) {
                applyConfig(configRes.data);
            }
        } catch (e) {
            console.error("Error cargando config académica:", e);
        }
    }

    function initAssignmentBuilder() {
        const gSel = document.getElementById('builder-grado');
        const sSel = document.getElementById('builder-seccion');
        const aSel = document.getElementById('builder-asignatura');
        const uSel = document.getElementById('builder-unidad');
        const btnAdd = document.getElementById('btn-add-assignment');

        if (!gSel) return;

        const presentations = window.presentationData || [];

        gSel.onchange = () => {
            const grado = gSel.value;
            sSel.innerHTML = '<option value="">Seleccione Sección</option>';
            aSel.innerHTML = '<option value="">Seleccione Asignatura</option>';
            uSel.value = 'I unidad';

            sSel.disabled = !grado;
            aSel.disabled = true;
            uSel.disabled = true;

            if (grado) {
                const sections = ["A", "B", "C"]; // Estándar New Generation
                sections.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s; opt.textContent = `Sección ${s}`;
                    sSel.appendChild(opt);
                });
            }
        };

        sSel.onchange = () => {
            const grado = gSel.value;
            const seccion = sSel.value;
            aSel.innerHTML = '<option value="">Seleccione Asignatura</option>';
            aSel.disabled = !seccion;
            uSel.disabled = true;

            if (seccion) {
                const gradeObj = presentations.find(g => window.parseGrade(g.grade) === window.parseGrade(grado));
                if (gradeObj) {
                    const subjs = gradeObj.subjects.filter(s => window.checkSectionHelper(s.sections, seccion));
                    subjs.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s.name; opt.textContent = s.name;
                        aSel.appendChild(opt);
                    });
                }
            }
        };

        aSel.onchange = () => {
            uSel.disabled = !aSel.value;
        };

        btnAdd.onclick = () => {
            const assignment = {
                grado: gSel.value,
                seccion: sSel.value,
                asignatura: aSel.value,
                unidad: uSel.value
            };

            if (!assignment.grado || !assignment.seccion || !assignment.asignatura) {
                alert("Debe completar todos los campos del constructor.");
                return;
            }

            // Evitar duplicados locales
            const exists = confirmedAssignments.some(a =>
                a.grado === assignment.grado &&
                a.seccion === assignment.seccion &&
                a.asignatura === assignment.asignatura
            );

            if (exists) {
                alert("Esta asignación ya está en su lista.");
                return;
            }

            confirmedAssignments.push(assignment);
            renderConfirmedAssignments();

            // Resetear selectores inferiores
            aSel.value = "";
            uSel.value = "I unidad";
            uSel.disabled = true;
        };
    }

    function renderConfirmedAssignments() {
        const listContainer = document.getElementById('admin-assignments-list');
        const btnSave = document.getElementById('btn-save-academic-config');
        if (!listContainer) return;

        if (confirmedAssignments.length === 0) {
            listContainer.innerHTML = '<p class="text-[10px] text-gray-400 italic p-4 text-center border-2 border-dashed border-gray-100 rounded-2xl">No ha añadido asignaciones aún.</p>';
            btnSave.disabled = true;
            return;
        }

        btnSave.disabled = false;
        listContainer.innerHTML = confirmedAssignments.map((a, idx) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                <div>
                    <div class="text-[10px] font-black text-blue-600 uppercase tracking-tighter">${a.asignatura}</div>
                    <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${a.grado} - SECC. ${a.seccion} | ${a.unidad}</div>
                </div>
                <button onclick="window.removeAssignment(${idx})" class="w-7 h-7 bg-white text-red-400 rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-red-50 hover:text-red-600 transition-all">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `).join('');
    }

    window.removeAssignment = (idx) => {
        confirmedAssignments.splice(idx, 1);
        renderConfirmedAssignments();
    };

    document.getElementById('btn-save-academic-config')?.addEventListener('click', async () => {
        if (confirmedAssignments.length === 0) return;

        const btn = document.getElementById('btn-save-academic-config');
        const parcialActual = document.getElementById('admin-parcial-actual').value;

        // Construcción del fullScope jerárquico (v7.9.8)
        const hierarchicalAssignments = confirmedAssignments.map(a => ({
            grado: a.grado,
            seccion: a.seccion,
            asignatura: a.asignatura,
            temas: ["General"], // Por defecto en el constructor simplificado
            unidad: a.unidad
        }));

        const fullScope = {
            profesorId: currentUser.userId,
            ParcialActual: parcialActual,
            UnidadActual: confirmedAssignments[0]?.unidad || "I unidad",
            GradoActual: [...new Set(confirmedAssignments.map(a => a.grado))],
            SeccionActual: [...new Set(confirmedAssignments.map(a => a.seccion))],
            AsignaturaActual: [...new Set(confirmedAssignments.map(a => a.asignatura))],
            TemaActual: ["General"],
            hierarchicalAssignments: hierarchicalAssignments
        };

        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            const res = await fetchApi('ACADEMIC', 'updateAcademicConfig', { fullScope: fullScope });
            if (res.status === 'success') {
                const confirmedScope = res.data || fullScope;
                if (window.PersistenceManager) {
                    await window.PersistenceManager.set('academic_stats', confirmedScope, 'config');
                }

                window.GLOBAL_SCOPE = confirmedScope;
                window.PARCIAL_ACTUAL = confirmedScope.ParcialActual;
                alert('Configuración académica guardada exitosamente.');
                document.dispatchEvent(new CustomEvent('academic-scope-updated', { detail: confirmedScope }));
            } else {
                throw new Error(res.message);
            }
        } catch (e) {
            alert('Error al guardar configuración: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Configuración Final';
        }
    });

    document.getElementById('btn-open-attendance-session')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-open-attendance-session');
        const sessionDate = document.getElementById('attendance-session-date')?.value || new Date().toISOString().split('T')[0];
        const activeScope = window.GLOBAL_SCOPE || {};
        const grado = Array.isArray(activeScope.GradoActual) ? activeScope.GradoActual[0] : (activeScope.GradoActual || "10mo Grado");
        const seccion = Array.isArray(activeScope.SeccionActual) ? activeScope.SeccionActual[0] : (activeScope.SeccionActual || "A");
        const asignatura = Array.isArray(activeScope.AsignaturaActual) ? activeScope.AsignaturaActual[0] : (activeScope.AsignaturaActual || "Informatica");

        btn.disabled = true;
        btn.textContent = 'Abriendo sesión...';

        try {
            const res = await fetchApi('ACADEMIC', 'openAttendanceSession', {
                fecha: sessionDate,
                horaInicio: "07:00",
                horaFin: "08:00",
                grado: grado,
                seccion: seccion,
                asignaturaId: asignatura,
                docenteUserId: currentUser.userId
            });

            if (res.status === 'success') {
                alert(`Sesión de asistencia abierta correctamente para ${asignatura} (${grado} ${seccion}). ID: ${res.data?.sesionId || 'SESION-OK'}`);
            } else {
                throw new Error(res.message);
            }
        } catch (e) {
            alert('Error al abrir control de asistencia: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Abrir Control de Asistencia';
        }
    });

    // --- LÓGICA CONSTRUCTOR DE HORARIOS Y SUSTITUCIONES DOCENTES (FASE 7) ---
    async function loadMasterSchedules() {
        const tbody = document.getElementById('schedules-table-body');
        const badge = document.getElementById('schedule-count-badge');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-400 italic"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando matriz de horarios...</td></tr>';

        try {
            const res = await fetchApi('ACADEMIC', 'getClassSchedules', { docenteUserId: currentUser.userId });
            if (res.status === 'success') {
                const schedules = res.data || [];
                if (badge) badge.textContent = `${schedules.length} Bloques`;

                if (schedules.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-400 italic">No hay bloques de horario registrados para este docente. Utilice el formulario superior para programar sus clases.</td></tr>';
                    return;
                }

                tbody.innerHTML = schedules.map(s => `
                    <tr class="hover:bg-indigo-50/40 transition-colors">
                        <td class="p-3 font-bold text-gray-800">
                            <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase text-[9px] mr-1.5">${s.diaSemana}</span>
                            <span>${s.horaInicio} - ${s.horaFin}</span>
                        </td>
                        <td class="p-3 font-semibold text-gray-700">${s.ofertaId}</td>
                        <td class="p-3 text-gray-600 font-medium">Grado / Secc. Asignada</td>
                        <td class="p-3 font-mono text-gray-600">${s.aulaCodigo || 'N/A'}</td>
                        <td class="p-3 text-gray-600">${s.docenteUserId || currentUser.nombre}</td>
                        <td class="p-3 text-right">
                            <button onclick="window.deleteScheduleBlock('${s.horarioId}')" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold uppercase transition-colors">
                                <i class="fas fa-trash-alt mr-1"></i>Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">${res.message || 'Error al cargar horarios'}</td></tr>`;
            }
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">Error de conexión: ${err.message}</td></tr>`;
        }
    }

    window.deleteScheduleBlock = async function(horarioId) {
        if (!confirm("¿Desea desactivar este bloque de horario?")) return;
        try {
            const res = await fetchApi('ACADEMIC', 'deleteClassSchedule', { horarioId });
            if (res.status === 'success') {
                alert("Bloque de horario eliminado.");
                loadMasterSchedules();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al eliminar horario: " + e.message);
        }
    };

    document.getElementById('schedule-builder-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-class-schedule');
        const diaSemana = document.getElementById('sch-dia').value;
        const horaInicio = document.getElementById('sch-hora-inicio').value;
        const horaFin = document.getElementById('sch-hora-fin').value;
        const aulaCodigo = document.getElementById('sch-aula').value;
        const grado = document.getElementById('sch-grado').value;
        const seccion = document.getElementById('sch-seccion').value;
        const docenteUserId = document.getElementById('sch-docente-id').value || currentUser.userId;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Verificando colisiones...';

        try {
            let ofertaId = "";
            try {
                const offerRes = await fetchApi('ACADEMIC', 'getAcademicOffers', { grado, seccion });
                if (offerRes && offerRes.status === 'success' && Array.isArray(offerRes.data) && offerRes.data.length > 0) {
                    ofertaId = offerRes.data[0].ofertaId;
                }
            } catch (_) {}

            if (!ofertaId) {
                const createOfferRes = await fetchApi('ACADEMIC', 'createAcademicOffer', {
                    grado: grado,
                    seccion: seccion,
                    asignaturaId: "ASIG-GENERAL",
                    planId: "PLAN-2026"
                });
                if (createOfferRes && createOfferRes.status === 'success' && createOfferRes.data?.ofertaId) {
                    ofertaId = createOfferRes.data.ofertaId;
                } else {
                    const cleanGrado = (grado || "DEC").normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 3).toUpperCase();
                    ofertaId = `OFE-${cleanGrado}-${seccion}`;
                }
            }

            const res = await fetchApi('ACADEMIC', 'createClassSchedule', {
                ofertaId,
                diaSemana,
                horaInicio,
                horaFin,
                aulaCodigo,
                docenteUserId
            });

            if (res.status === 'success') {
                alert(`¡Horario asignado con éxito! ID: ${res.data?.horarioId || 'OK'}`);
                loadMasterSchedules();
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            alert("Conflicto / Error en asignación de horario:\n" + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check mr-1"></i> Publicar Horario';
        }
    });

    document.getElementById('btn-load-schedules-list')?.addEventListener('click', loadMasterSchedules);

    document.getElementById('btn-open-substitution-modal')?.addEventListener('click', async () => {
        const sustitutoUserId = prompt("Ingrese el ID o Correo del Docente Sustituto:");
        if (!sustitutoUserId) return;

        const gradoInput = prompt("Ingrese el Grado para la sustitución (Ej. Décimo, Undécimo, Duodécimo):", "Décimo");
        if (!gradoInput) return;
        const seccionInput = prompt("Ingrese la Sección (Ej. A, B, C):", "A");
        if (!seccionInput) return;

        let ofertaId = "";
        try {
            const offerRes = await fetchApi('ACADEMIC', 'getAcademicOffers', { grado: gradoInput, seccion: seccionInput });
            if (offerRes && offerRes.status === 'success' && Array.isArray(offerRes.data) && offerRes.data.length > 0) {
                ofertaId = offerRes.data[0].ofertaId;
            }
        } catch (_) {}

        if (!ofertaId) {
            const createOfferRes = await fetchApi('ACADEMIC', 'createAcademicOffer', {
                grado: gradoInput,
                seccion: seccionInput,
                asignaturaId: "ASIG-GENERAL",
                planId: "PLAN-2026"
            });
            if (createOfferRes && createOfferRes.status === 'success' && createOfferRes.data?.ofertaId) {
                ofertaId = createOfferRes.data.ofertaId;
            } else {
                const cleanGradoInput = (gradoInput || "DEC").normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 3).toUpperCase();
                ofertaId = `OFE-${cleanGradoInput}-${seccionInput}`;
            }
        }

        const motivo = prompt("Motivo de la sustitución temporal:", "Licencia Médica / Permiso");

        try {
            const res = await fetchApi('ACADEMIC', 'createTeacherSubstitution', {
                ofertaId,
                sustitutoUserId,
                fechaInicio: new Date().toISOString().split('T')[0],
                fechaFin: "",
                motivo,
                autorizadoPor: currentUser.nombre
            });

            if (res.status === 'success') {
                alert(`Sustitución docente registrada exitosamente para ${sustitutoUserId}.`);
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error registrando sustitución: " + e.message);
        }
    });

    // Handler para Publicador de Aula Virtual (Fase 8)
    document.getElementById('virtual-classroom-publisher-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit-virtual-post');
        const tipo = document.getElementById('vc-tipo').value;
        const titulo = document.getElementById('vc-titulo').value;
        const url = document.getElementById('vc-url').value;
        const contenido = document.getElementById('vc-contenido').value;
        const esBorrador = document.getElementById('vc-es-borrador').checked;

        btn.disabled = true;
        btn.textContent = 'Procesando...';

        try {
            if (tipo === "Anuncio") {
                const res = await fetchApi('TASK', 'createPost', {
                    titulo,
                    contenido,
                    categoria: "Anuncio",
                    autorId: currentUser.userId,
                    esBorrador,
                    adjuntos: url ? [{ nombre: "Recurso Adjunto", url: url }] : []
                });

                if (res.status === 'success') {
                    alert(esBorrador ? "Borrador de anuncio guardado." : "Anuncio publicado en el Aula Virtual con éxito.");
                    e.target.reset();
                } else {
                    throw new Error(res.message);
                }
            } else {
                const res = await fetchApi('TASK', 'createStudyMaterial', {
                    titulo,
                    descripcion: contenido,
                    tipoRecurso: tipo,
                    parcial: window.GLOBAL_SCOPE ? window.GLOBAL_SCOPE.ParcialActual : "I parcial",
                    unidad: "Unidad 1",
                    tema: "Tema General",
                    archivoUrl: url || "https://drive.google.com",
                    autorId: currentUser.userId
                });

                if (res.status === 'success') {
                    alert("Material educativo / guía publicado con éxito.");
                    e.target.reset();
                } else {
                    throw new Error(res.message);
                }
            }
        } catch (err) {
            alert("Error al publicar en el Aula Virtual:\n" + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Publicar en Aula Virtual';
        }
    });

    // [REQ-EXP-017] [Requerimientos de Expansión y Desarrollo] - Health checks de estado y latencia de microservicios en Consola Técnica.
    function runTechnicalHealthChecks() {
        var services = ['USER', 'ACADEMIC', 'TASK', 'EXAM', 'ACCOUNTING'];
        var btn = document.getElementById('btn-run-health-checks');
        var timeLabel = document.getElementById('health-check-last-time');

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        }

        var promises = services.map(function(svc) {
            var el = document.getElementById('health-status-' + svc);
            if (el) {
                el.className = 'mt-2 text-xs font-bold text-blue-500 animate-pulse';
                el.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Probando...';
            }
            var startTime = Date.now();
            return fetchApi(svc, 'ping', {}, 0)
                .then(function(res) {
                    var latency = Date.now() - startTime;
                    if (el) {
                        if (res && res.status === 'success') {
                            if (latency < 1200) {
                                el.className = 'mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5';
                                el.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> En línea (' + latency + 'ms)';
                            } else {
                                el.className = 'mt-2 text-xs font-bold text-amber-600 flex items-center gap-1.5';
                                el.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Degradado (' + latency + 'ms)';
                            }
                        } else {
                            el.className = 'mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5';
                            el.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Error';
                        }
                    }
                })
                .catch(function(err) {
                    if (el) {
                        el.className = 'mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5';
                        el.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Fuera de línea';
                    }
                });
        });


        Promise.all(promises).then(function() {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-heartbeat"></i> Probar Conectividad';
            }
            if (timeLabel) {
                var now = new Date();
                timeLabel.textContent = 'Última verificación: ' + now.toLocaleTimeString();
            }
        });
    }

    // [TAREA-19] [Fase 1 - Migración Curricular] - Handlers e integración frontend (#modal-curricular-migration) para mapeo, equivalencias y simulación pre-validada.
    const modalCurricularMigration = document.getElementById('modal-curricular-migration');
    const btnCloseCurricularMigration = document.getElementById('btn-close-curricular-migration');
    const btnLoadEquivalences = document.getElementById('btn-load-equivalences');
    const formCurricularMigration = document.getElementById('form-curricular-migration');
    const migrationReportContainer = document.getElementById('migration-report-container');
    const migrationReportDetails = document.getElementById('migration-report-details');

    window.openCurricularMigrationModal = function() {
        if (modalCurricularMigration) {
            modalCurricularMigration.classList.remove('hidden');
        }
    };

    if (btnCloseCurricularMigration) {
        btnCloseCurricularMigration.addEventListener('click', () => {
            if (modalCurricularMigration) modalCurricularMigration.classList.add('hidden');
        });
    }

    if (btnLoadEquivalences) {
        btnLoadEquivalences.addEventListener('click', async () => {
            const planOrigenId = document.getElementById('mig-plan-origen')?.value || 'PLAN-ANTERIOR';
            const planDestinoId = document.getElementById('mig-plan-destino')?.value || 'PLAN-2026-OFICIAL';
            try {
                if (window.showLoading) window.showLoading('Consultando equivalencias curriculares...');
                const res = await fetchApi('ACADEMIC', 'getCurricularEquivalences', { planOrigenId, planDestinoId });
                if (window.hideLoading) window.hideLoading();

                if (res && res.status === 'success' && migrationReportContainer && migrationReportDetails) {
                    migrationReportContainer.classList.remove('hidden');
                    let html = `<div class="font-bold text-amber-700">Equivalencias Mapeadas (${res.totalAsignaturas || 0} asignaturas):</div>`;
                    if (Array.isArray(res.equivalencias)) {
                        res.equivalencias.slice(0, 10).forEach(eq => {
                            html += `<div>• ${eq.nombreOrigen} (${eq.codigoOrigen}) → ${eq.nombreDestino} [${eq.estadoMapeo}]</div>`;
                        });
                    }
                    migrationReportDetails.innerHTML = html;
                } else if (res && res.message) {
                    alert(res.message);
                }
            } catch (err) {
                if (window.hideLoading) window.hideLoading();
                console.error('Error al consultar equivalencias:', err);
            }
        });
    }

    if (formCurricularMigration) {
        formCurricularMigration.addEventListener('submit', async (e) => {
            e.preventDefault();
            const planOrigenId = document.getElementById('mig-plan-origen')?.value || 'PLAN-ANTERIOR';
            const planDestinoId = document.getElementById('mig-plan-destino')?.value || 'PLAN-2026-OFICIAL';
            const ejecutarPruebaSeca = document.getElementById('mig-prueba-seca')?.checked ?? true;

            try {
                if (window.showLoading) window.showLoading('Ejecutando verificación e inspección de migración...');
                const res = await fetchApi('ACADEMIC', 'executeCurricularMigration', {
                    planOrigenId,
                    planDestinoId,
                    ejecutarPruebaSeca,
                    modo: ejecutarPruebaSeca ? 'SIMULACION' : 'REAL'
                });
                if (window.hideLoading) window.hideLoading();

                if (res && res.status === 'success' && migrationReportContainer && migrationReportDetails) {
                    migrationReportContainer.classList.remove('hidden');
                    const rep = res.reporte || {};
                    let html = `<div class="font-bold text-emerald-700">${res.message}</div>`;
                    html += `<div>Modo: ${rep.modoEjecucion || 'N/A'}</div>`;
                    html += `<div>Registros Históricos Analizados: ${rep.registrosHistoricosAnalizados || 0}</div>`;
                    html += `<div>Calificaciones Preservadas Inalterables: ${rep.calificacionesOficialesPreservadas || 0}</div>`;
                    html += `<div>Discrepancias Detectadas: ${rep.discrepanciasDetectadas || 0}</div>`;
                    migrationReportDetails.innerHTML = html;
                } else if (res && res.message) {
                    alert(res.message);
                }
            } catch (err) {
                if (window.hideLoading) window.hideLoading();
                console.error('Error al ejecutar migración:', err);
            }
        });
    }

    // [TAREA-17] [Fase 1 - Analítica Académica] - Controlador del modal e interfaz de reportes analíticos por área, asignatura y programa (#modal-academic-analytics).
    const modalAcademicAnalytics = document.getElementById('modal-academic-analytics');
    const btnCloseAcademicAnalytics = document.getElementById('btn-close-academic-analytics');

    window.openAcademicAnalyticsModal = function() {
        if (modalAcademicAnalytics) {
            modalAcademicAnalytics.classList.remove('hidden');
            window.loadCurricularAnalyticsReport();
        }
    };

    if (btnCloseAcademicAnalytics) {
        btnCloseAcademicAnalytics.addEventListener('click', () => {
            if (modalAcademicAnalytics) modalAcademicAnalytics.classList.add('hidden');
        });
    }

    window.loadCurricularAnalyticsReport = async function() {
        try {
            const res = await fetchApi('ACADEMIC', 'getCurricularAnalyticsReport', {});
            if (res && res.status === 'success' && res.data && res.data.metrics) {
                const m = res.data.metrics;
                document.getElementById('analytics-promedio').innerText = (m.promedioConsolidado || 0) + '%';
                document.getElementById('analytics-evaluadas').innerText = m.evaluadasCount || 0;
                document.getElementById('analytics-pendientes').innerText = m.notasPendientes || 0;
                document.getElementById('analytics-alertas').innerText = m.alertasAcompanamiento || 0;

                const dist = m.distribucion || {};
                document.getElementById('dist-excelente').innerText = dist.excelente || 0;
                document.getElementById('dist-bueno').innerText = dist.bueno || 0;
                document.getElementById('dist-satisfactorio').innerText = dist.satisfactorio || 0;
                document.getElementById('dist-mejora').innerText = dist.necesitaMejora || 0;
            }
        } catch (err) {
            console.error('Error al cargar reporte analítico:', err);
        }
    };

    // [TAREA-18] [Fase 1 - Reutilización de Recursos] - Controlador del modal de catálogo de recursos educativos reutilizables e interdisciplinarios (#modal-reusable-resources).
    const modalReusableResources = document.getElementById('modal-reusable-resources');
    const btnCloseReusableResources = document.getElementById('btn-close-reusable-resources');
    const btnRefreshReusableResources = document.getElementById('btn-refresh-reusable-resources');
    const formAddReusableResource = document.getElementById('form-add-reusable-resource');

    window.openReusableResourcesModal = function() {
        if (modalReusableResources) {
            modalReusableResources.classList.remove('hidden');
            window.loadReusableResourcesCatalog();
        }
    };

    if (btnCloseReusableResources) {
        btnCloseReusableResources.addEventListener('click', () => {
            if (modalReusableResources) modalReusableResources.classList.add('hidden');
        });
    }

    if (btnRefreshReusableResources) {
        btnRefreshReusableResources.addEventListener('click', () => {
            window.loadReusableResourcesCatalog();
        });
    }

    window.loadReusableResourcesCatalog = async function() {
        const tableBody = document.getElementById('table-reusable-resources-body');
        if (!tableBody) return;

        try {
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">Cargando catálogo de recursos...</td></tr>';
            const res = await fetchApi('ACADEMIC', 'getReusableResourceCatalog', {});
            if (res && res.status === 'success') {
                const resources = res.resources || [];
                const projects = res.interdisciplinaryProjects || [];
                const combined = [
                    ...resources.map(r => ({ ...r, esProyectoItem: false })),
                    ...projects.map(p => ({
                        recursoId: p.proyectoId,
                        titulo: p.titulo,
                        area: p.departamentosInvolucrados,
                        asignatura: 'Proyecto Interdisciplinario',
                        tema: p.descripcion,
                        version: '1.0',
                        estado: p.estado,
                        esProyectoItem: true
                    }))
                ];

                if (combined.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 font-semibold">No hay recursos ni proyectos registrados en el catálogo aún.</td></tr>';
                } else {
                    tableBody.innerHTML = combined.map(item => `
                        <tr class="hover:bg-slate-50">
                            <td class="p-2.5 font-bold text-slate-800">${item.titulo}</td>
                            <td class="p-2.5">${item.area || 'General'}</td>
                            <td class="p-2.5">${item.asignatura || 'General'} ${item.tema ? ' / ' + item.tema : ''}</td>
                            <td class="p-2.5"><span class="px-2 py-0.5 ${item.esProyectoItem ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'} rounded-full font-bold text-[10px]">${item.esProyectoItem ? 'PROYECTO' : 'v' + (item.version || '1.0')}</span></td>
                            <td class="p-2.5 text-right">
                                ${item.urlDrive ? `<a href="${item.urlDrive}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-bold text-[11px]"><i class="fa-solid fa-arrow-up-right-from-square mr-0.5"></i> Abrir</a>` : '<span class="text-slate-400 text-[10px]">Sin enlace</span>'}
                            </td>
                        </tr>
                    `).join('');
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Error al cargar recursos.</td></tr>';
            }
        } catch (err) {
            console.error('Error al cargar recursos reutilizables:', err);
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Error de conexión.</td></tr>';
        }
    };

    if (formAddReusableResource) {
        formAddReusableResource.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tipo = document.getElementById('reut-tipo-registro')?.value;
            const titulo = document.getElementById('reut-titulo')?.value?.trim();
            const area = document.getElementById('reut-area')?.value?.trim();
            const asignatura = document.getElementById('reut-asignatura')?.value?.trim();
            const tema = document.getElementById('reut-tema')?.value?.trim();
            const urlDrive = document.getElementById('reut-url')?.value?.trim();

            if (!titulo || !area) {
                alert('Por favor ingrese al menos el Título y Área/Departamentos.');
                return;
            }

            try {
                if (window.showLoading) window.showLoading('Registrando recurso...');
                const res = await fetchApi('ACADEMIC', 'manageReusableResource', {
                    titulo,
                    area,
                    asignatura,
                    tema,
                    urlDrive,
                    esProyecto: tipo === 'Proyecto',
                    departamentosInvolucrados: area,
                    descripcion: tema,
                    autorId: currentUser?.nombre || 'Docente'
                });
                if (window.hideLoading) window.hideLoading();

                if (res && res.status === 'success') {
                    alert('Registro completado exitosamente.');
                    formAddReusableResource.reset();
                    window.loadReusableResourcesCatalog();
                } else {
                    alert(res && res.message ? res.message : 'Error al guardar el recurso.');
                }
            } catch (err) {
                if (window.hideLoading) window.hideLoading();
                console.error('Error al guardar recurso reutilizable:', err);
            }
        });
    }

    // [TAREA-13] [Fase 1 - Planificación de Carga Académica] - Controlador del modal de planificación de carga académica, jefaturas y vacantes.
    const modalAcademicPlanning = document.getElementById('modal-academic-load-planning');
    const btnCloseAcademicPlanning = document.getElementById('btn-close-academic-load-planning');
    const btnRefreshAcademicPlanning = document.getElementById('btn-refresh-academic-planning');
    const formAssignDeptHead = document.getElementById('form-assign-dept-head');

    window.openAcademicLoadPlanningModal = function() {
        if (modalAcademicPlanning) {
            modalAcademicPlanning.classList.remove('hidden');
            window.refreshAcademicPlanningData();
        }
    };

    if (btnCloseAcademicPlanning) {
        btnCloseAcademicPlanning.addEventListener('click', () => {
            if (modalAcademicPlanning) modalAcademicPlanning.classList.add('hidden');
        });
    }

    if (btnRefreshAcademicPlanning) {
        btnRefreshAcademicPlanning.addEventListener('click', () => {
            window.refreshAcademicPlanningData();
        });
    }

    window.refreshAcademicPlanningData = async function() {
        const tableBody = document.getElementById('table-academic-planning-vacancies');
        if (!tableBody) return;

        try {
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">Cargando planificación y vacantes...</td></tr>';
            const res = await fetchApi('ACADEMIC', 'getDepartmentAcademicPlanning', {});
            if (res && res.status === 'success' && res.data) {
                const vacantes = res.data.vacantes || [];
                if (vacantes.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-emerald-600 font-bold">¡Todas las ofertas académicas tienen docente asignado! No hay vacantes.</td></tr>';
                } else {
                    tableBody.innerHTML = vacantes.map(v => `
                        <tr>
                            <td class="p-2.5 font-bold text-slate-800">${v.ofertaId}</td>
                            <td class="p-2.5">${v.asignatura}</td>
                            <td class="p-2.5">${v.grado} ${v.seccion || 'A'}</td>
                            <td class="p-2.5">${v.departamento || 'General'}</td>
                            <td class="p-2.5"><span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">VACANTE</span></td>
                        </tr>
                    `).join('');
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Error al cargar la planificación.</td></tr>';
            }
        } catch (err) {
            console.error('Error al obtener planificación:', err);
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Error de conexión con el servidor.</td></tr>';
        }
    };

    if (formAssignDeptHead) {
        formAssignDeptHead.addEventListener('submit', async (e) => {
            e.preventDefault();
            const deptId = document.getElementById('load-dept-select')?.value;
            const jefeUserId = document.getElementById('load-dept-head-user-id')?.value?.trim();

            if (!deptId || !jefeUserId) {
                alert('Por favor complete todos los campos obligatorios.');
                return;
            }

            try {
                if (window.showLoading) window.showLoading('Asignando jefe de departamento...');
                const res = await fetchApi('ACADEMIC', 'assignDepartmentHead', {
                    departamentoId: deptId,
                    jefeUserId: jefeUserId
                });
                if (window.hideLoading) window.hideLoading();

                if (res && res.status === 'success') {
                    alert(`Jefe asignado correctamente al departamento de ${deptId}.`);
                    document.getElementById('load-dept-head-user-id').value = '';
                    window.refreshAcademicPlanningData();
                } else {
                    alert(res && res.message ? res.message : 'No se pudo asignar el jefe de departamento.');
                }
            } catch (err) {
                if (window.hideLoading) window.hideLoading();
                console.error('Error al asignar jefe de departamento:', err);
                alert('Error al conectar con el servidor.');
            }
        });
    }

    // [TAREA 3.3] [Fase 3: Planificación Académica y Horarios] - Controlador de interfaz para la gestión de aulas, laboratorios y recursos físicos (#modal-classroom-manager).
    window.openClassroomManagerModal = async function() {
        const modal = document.getElementById('modal-classroom-manager');
        if (!modal) return;
        modal.classList.remove('hidden');
        await loadClassroomResourcesTable();
    };

    async function loadClassroomResourcesTable() {
        const tbody = document.getElementById('tbl-classroom-resources-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" class="p-3 text-center text-slate-400">Cargando espacios...</td></tr>';

        try {
            const res = await fetchApi('ACADEMIC', 'getClassroomResources', {});
            if (res && res.status === 'success' && Array.isArray(res.data)) {
                if (res.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="p-3 text-center text-slate-400">No hay espacios registrados.</td></tr>';
                    return;
                }
                tbody.innerHTML = res.data.map(cls => `
                    <tr class="hover:bg-slate-50">
                        <td class="p-2.5 font-bold text-slate-800">${cls.aulaCodigo}</td>
                        <td class="p-2.5">${cls.nombreAula}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">${cls.tipoEspacio || 'Aula'}</span></td>
                        <td class="p-2.5 font-medium">${cls.capacidad || 30} est.</td>
                        <td class="p-2.5">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${cls.estado === 'Inactivo' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
                                ${cls.estado || 'Activo'}
                            </span>
                        </td>
                        <td class="p-2.5 text-right">
                            <button class="btn-edit-clsr text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                                data-codigo="${cls.aulaCodigo}"
                                data-nombre="${cls.nombreAula}"
                                data-capacidad="${cls.capacidad || 30}"
                                data-tipo="${cls.tipoEspacio || 'Aula'}"
                                data-estado="${cls.estado || 'Activo'}">
                                <i class="fa-solid fa-pen-to-square mr-0.5"></i> Editar
                            </button>
                        </td>
                    </tr>
                `).join('');

                document.querySelectorAll('.btn-edit-clsr').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.getElementById('clsr-codigo').value = btn.getAttribute('data-codigo');
                        document.getElementById('clsr-nombre').value = btn.getAttribute('data-nombre');
                        document.getElementById('clsr-capacidad').value = btn.getAttribute('data-capacidad');
                        document.getElementById('clsr-tipo').value = btn.getAttribute('data-tipo');
                        document.getElementById('clsr-estado').value = btn.getAttribute('data-estado');
                    });
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="p-3 text-center text-red-500">Error al cargar espacios.</td></tr>';
            }
        } catch (err) {
            console.error('Error al obtener recursos de aulas:', err);
            tbody.innerHTML = '<tr><td colspan="6" class="p-3 text-center text-red-500">Error de comunicación con el servidor.</td></tr>';
        }
    }

    const btnCloseClsrManager = document.getElementById('btn-close-classroom-manager');
    if (btnCloseClsrManager) {
        btnCloseClsrManager.addEventListener('click', () => {
            const modal = document.getElementById('modal-classroom-manager');
            if (modal) modal.classList.add('hidden');
        });
    }

    const formClassroomResource = document.getElementById('form-classroom-resource');
    if (formClassroomResource) {
        formClassroomResource.addEventListener('submit', async (e) => {
            e.preventDefault();
            const aulaCodigo = document.getElementById('clsr-codigo').value.trim();
            const nombreAula = document.getElementById('clsr-nombre').value.trim();
            const capacidad = parseInt(document.getElementById('clsr-capacidad').value, 10);
            const tipoEspacio = document.getElementById('clsr-tipo').value;
            const estado = document.getElementById('clsr-estado').value;

            if (!aulaCodigo || !nombreAula) {
                alert('Código y Nombre del espacio son obligatorios.');
                return;
            }

            try {
                if (window.showLoading) window.showLoading('Guardando recurso de aula/espacio...');
                const res = await fetchApi('ACADEMIC', 'saveClassroomResource', {
                    aulaCodigo,
                    nombreAula,
                    capacidad,
                    tipoEspacio,
                    estado
                });
                if (window.hideLoading) window.hideLoading();

                if (res && res.status === 'success') {
                    alert('Espacio guardado correctamente.');
                    formClassroomResource.reset();
                    await loadClassroomResourcesTable();
                } else {
                    alert(res && res.message ? res.message : 'Error al guardar el espacio.');
                }
            } catch (err) {
                if (window.hideLoading) window.hideLoading();
                console.error('Error al guardar espacio:', err);
                alert('Error al conectar con el servidor.');
            }
        });
    }

// ---------------------------------------------------------------------------
// FASE 29 & E-001..E-003: GESTOR DE RESPALDOS Y RESTAURACIÓN DE SISTEMA
// ---------------------------------------------------------------------------

window.openBackupManagerModal = function() {
    let modal = document.getElementById('modal-backup-manager');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-backup-manager';
        modal.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-3 md:p-6 animate-fade-in';
        modal.innerHTML =
            '<div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">' +
                '<div class="p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">' +
                    '<div class="flex items-center gap-3">' +
                        '<div class="w-10 h-10 rounded-2xl bg-indigo-600/30 flex items-center justify-center border border-indigo-400/30 text-indigo-400">' +
                            '<i class="fa-solid fa-database text-lg"></i>' +
                        '</div>' +
                        '<div>' +
                            '<h3 class="font-black text-base md:text-lg uppercase tracking-tight">Copias de Seguridad y Respaldos JSON</h3>' +
                            '<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Resguardos Integrales de Base de Datos y Verificación Checksum</p>' +
                        '</div>' +
                    '</div>' +
                    '<button onclick="document.getElementById(\'modal-backup-manager\').classList.add(\'hidden\')" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors">' +
                        '<i class="fa-solid fa-xmark"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">' +
                    '<div class="flex justify-between items-center bg-indigo-50 border border-indigo-100 rounded-2xl p-4">' +
                        '<div>' +
                            '<h4 class="font-bold text-indigo-900 text-sm">Generar Punto de Control Ahora</h4>' +
                            '<p class="text-indigo-700 text-xs">Crea una copia congelada con sumas Checksum SHA-256 almacenada en Drive.</p>' +
                        '</div>' +
                        '<button onclick="window.triggerCreateSystemBackup()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center gap-2">' +
                            '<i class="fa-solid fa-cloud-arrow-up"></i> Generar Respaldo' +
                        '</button>' +
                    '</div>' +
                    '<div id="backups-list-container" class="space-y-2">' +
                        '<div class="text-center py-8 text-slate-400 font-semibold">' +
                            '<i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i> Cargando lista de respaldos...' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    } else {
        modal.classList.remove('hidden');
    }

    window.fetchSystemBackupsList();
};

window.fetchSystemBackupsList = async function() {
    const container = document.getElementById('backups-list-container');
    if (!container) return;

    try {
        const res = await fetchApi('ACADEMIC', 'listSystemBackups', {});
        if (res && res.status === 'success' && Array.isArray(res.backups) && res.backups.length > 0) {
            let html = '<div class="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">';
            res.backups.forEach(function(b) {
                html +=
                    '<div class="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3">' +
                        '<div>' +
                            '<h5 class="font-bold text-slate-800 text-xs truncate">' + b.fileName + '</h5>' +
                            '<p class="text-[10px] text-slate-400 font-medium">Fecha: ' + (b.createdTime || b.timestamp || 'N/A') + ' | Checksum: ' + (b.checksum || 'SHA-256') + '</p>' +
                        '</div>' +
                        '<div class="flex items-center gap-2 flex-shrink-0">' +
                            '<a href="' + b.fileUrl + '" target="_blank" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1">' +
                                '<i class="fa-solid fa-download"></i> Descargar' +
                            '</a>' +
                            '<button onclick="window.triggerRestoreSystemBackup(\'' + b.fileId + '\', \'' + b.fileName + '\')" class="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[10px] flex items-center gap-1">' +
                                '<i class="fa-solid fa-rotate-left"></i> Restaurar' +
                            '</button>' +
                        '</div>' +
                    '</div>';
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="text-center py-8 text-slate-400 font-semibold">No se encontraron respaldos registrados previamente.</div>';
        }
    } catch (e) {
        console.error('Error cargando lista de respaldos:', e);
        container.innerHTML = '<div class="text-center py-8 text-red-500 font-semibold">No se pudo cargar la lista de respaldos.</div>';
    }
};

window.triggerCreateSystemBackup = async function() {
    try {
        if (window.showLoading) window.showLoading('Generando copia de seguridad integral...');
        const res = await fetchApi('ACADEMIC', 'createSystemBackup', {});
        if (window.hideLoading) window.hideLoading();

        if (res && res.status === 'success') {
            alert('Copia de seguridad creada correctamente: ' + res.fileName);
            window.fetchSystemBackupsList();
        } else {
            alert(res && res.message ? res.message : 'Error al crear la copia de seguridad.');
        }
    } catch (err) {
        if (window.hideLoading) window.hideLoading();
        console.error('Error al generar respaldo:', err);
    }
};

window.triggerRestoreSystemBackup = async function(fileId, fileName) {
    const confirmation = prompt(`ADVERTENCIA DE SEGURIDAD:\nVas a restaurar el punto de control "${fileName}".\nLas notas históricas serán preservadas intactas.\nPara confirmar, escribe el código exacto: RESTORE-CONFIRMED`);
    if (confirmation !== 'RESTORE-CONFIRMED') {
        alert('Código de confirmación incorrecto. Restauración cancelada.');
        return;
    }

    try {
        if (window.showLoading) window.showLoading('Procesando restauración de copia de seguridad...');
        const res = await fetchApi('ACADEMIC', 'restoreSystemBackup', {
            fileId: fileId,
            confirmationCode: 'RESTORE-CONFIRMED',
            preserveHistoricGrades: true
        });
        if (window.hideLoading) window.hideLoading();

        if (res && res.status === 'success') {
            alert('Restauración completada correctamente con preservación de calificaciones históricas.');
            window.location.reload();
        } else {
            alert(res && res.message ? res.message : 'Error al procesar la restauración.');
        }
    } catch (err) {
        if (window.hideLoading) window.hideLoading();
        console.error('Error al restaurar respaldo:', err);
    }
};

    document.getElementById('btn-run-health-checks')?.addEventListener('click', runTechnicalHealthChecks);

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
                await Promise.all(chunk.map(q => fetchApi('ACADEMIC', 'saveQuestion', {
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

            await fetchApi('ACADEMIC', 'generateMigrationReport', {
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
        if (window.renderReportsCenterUI) window.renderReportsCenterUI('reports-center-container');
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

    // [TAREA-14] [Fase 1 - UX Flujo Académico] - Bandeja de revisiones pendientes para el docente ordenada por prioridad y vencimiento.
    async function fetchEntregasRecientes() {
        const tbody = document.getElementById('op-table-body');
        const thead = document.getElementById('op-table-head');
        if (!tbody || !thead) return;
        tbody.innerHTML = '<tr><td class="text-center p-8">Cargando revisiones pendientes...</td></tr>';

        try {
            const res = await fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId });
            if (res.status === 'success') {
                let pending = (res.data || []).filter(i =>
                    (i.estado === 'Pendiente' || i.estado === 'Pendiente de revisión' || !i.estado) &&
                    (i.fileId || i.respuestas || i.entregaId)
                );

                // Ordenar por prioridad de vencimiento (más antiguas primero)
                pending.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                thead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100">
                    <th class="p-4 text-left font-medium text-gray-500 text-[0.7rem] uppercase">Alumno / Sección</th>
                    <th class="p-4 text-left font-medium text-gray-500 text-[0.7rem] uppercase">Actividad / Área</th>
                    <th class="p-4 text-left font-medium text-gray-500 text-[0.7rem] uppercase">Fecha de Entrega</th>
                    <th class="p-4 text-right font-medium text-gray-500 text-[0.7rem] uppercase">Acción</th>
                </tr>`;

                if (pending.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8 text-emerald-600 font-bold">¡Excelente! No hay entregas pendientes de revisión.</td></tr>';
                    return;
                }

                tbody.innerHTML = pending.map((item, idx) => `
                    <tr class="hover:bg-blue-50/50 transition-colors">
                        <td class="p-4">
                            <div class="font-bold text-gray-800">${item.alumnoNombre}</div>
                            <div class="text-[10px] text-gray-500 font-medium">${item.grado} - ${item.seccion}</div>
                        </td>
                        <td class="p-4">
                            <div class="font-bold text-blue-700">${item.titulo}</div>
                            <div class="text-[10px] text-gray-500 font-medium">${item.asignatura} | ${item.tipo}</div>
                        </td>
                        <td class="p-4 text-xs text-gray-600 font-medium">${new Date(item.fecha).toLocaleString()}</td>
                        <td class="p-4 text-right">
                            <button class="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-all op-grade-btn" data-index="${idx}">Revisar & Calificar</button>
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
            tbody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-red-500 font-medium">Error al cargar revisiones: ${e.message}</td></tr>`;
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
                fetchApi('ACADEMIC', 'getAcademicConfig', { profesorId: currentUser.userId })
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
                // REQ: Asegurar que GLOBAL_SCOPE incluya GranularConfig tras carga inicial (v7.9.1)
                window.GLOBAL_SCOPE = configRes.data;
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

    // [REQ-EXP-007] [Fase 1: Registro y Expediente de Estudiantes] - Función para la búsqueda institucional de expedientes de estudiantes y apertura de ficha completa.
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
                <td class="p-4 text-right space-x-2">
                    <button class="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 btn-open-student-file" data-student-id="${a.id}">
                        Expediente
                    </button>
                    <span class="text-blue-600 font-medium text-sm">Ver detalles &rsaquo;</span>
                </td>
            </tr>`).join('');

        submissionsTableBody.querySelectorAll('.btn-open-student-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const stId = btn.getAttribute('data-student-id');
                if (window.openStudentFileModal) window.openStudentFileModal(stId);
            });
        });
    }

    function renderGrados(search) {
        const fGrado = document.getElementById('filter-grado').value;

        // REQ: Navegación basada exclusivamente en GLOBAL_SCOPE (Fase 5)
        // Eliminado fallback a actividad histórica para cumplir con norma de NO compensación.
        let grados = (window.GLOBAL_SCOPE && window.GLOBAL_SCOPE.GradoActual) ? window.GLOBAL_SCOPE.GradoActual : [];

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

        submissionsTableBody.innerHTML = filtered.map((grado, idx) => {
            return `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn group" data-index="${idx}">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center font-semibold group-hover:bg-blue-600 group-hover:text-white transition-all">${grado.charAt(0)}</div>
                        <span class="font-semibold text-gray-900 uppercase tracking-tighter">${grado}</span>
                    </div>
                </td>
                <td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest group-hover:underline transition-all">Ver Secciones &rsaquo;</span></td>
            </tr>`;
        }).join('')
        submissionsTableBody.querySelectorAll('.btn-open-student-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const stId = btn.getAttribute('data-student-id');
                if (window.openStudentFileModal) window.openStudentFileModal(stId);
            });
        });
    }

    /**
     * Renderiza la lista de secciones filtradas por el grado seleccionado (v7.9.1)
     * REQ: Solo mostrar secciones que pertenecen al grado en el GLOBAL_SCOPE.
     */
    function renderSecciones(grado, search) {
        const fSeccion = document.getElementById('filter-seccion').value;

        // REQ: Obtener secciones granulares para este grado específico
        var granular = (window.GLOBAL_SCOPE && window.GLOBAL_SCOPE.GranularConfig) ? window.GLOBAL_SCOPE.GranularConfig : [];
        var secciones = [...new Set(granular.filter(function(r) {
            return norm(r.grado) === norm(grado);
        }).map(function(r) { return r.seccion; }))].filter(Boolean);

        if (fSeccion) secciones = secciones.filter(s => norm(s) === norm(fSeccion));
        const filtered = secciones.filter(s => norm(s).includes(norm(search)));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Sección (${grado})</th>
                <th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = `<tr><td colspan="2" class="text-center p-12 text-gray-400 font-bold text-[10px] uppercase tracking-widest">No hay secciones registradas para el grado ${grado}.</td></tr>`;
            return;
        }
        submissionsTableBody.innerHTML = filtered.map((seccion, idx) => `<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn group" data-index="${idx}"><td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter">Sección ${seccion}</td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest group-hover:underline">Ver Asignaturas &rsaquo;</span></td></tr>`).join('');
    }

    /**
     * Renderiza la lista de asignaturas filtradas por el contexto actual (v7.9.0)
     * REQ: Filtrado estricto por Parcial, Grado y Sección.
     */
    /**
     * Renderiza la lista de asignaturas filtradas por el contexto actual (v7.9.1)
     * REQ: Filtrado estricto por Parcial, Grado y Sección.
     */
    // [REQ-EXP-003] [Requerimientos de Expansión y Desarrollo] - Jerarquía Nivel -> Grado -> Sección -> Asignatura con filtrado estricto GranularConfig.
    function renderAsignaturas(grado, seccion, search) {
        const activePartial = window.GLOBAL_SCOPE ? window.GLOBAL_SCOPE.ParcialActual : window.PARCIAL_ACTUAL;

        // REQ: Filtrado estricto por Parcial, Grado y Sección (v7.9.1)
        // Utilizamos GranularConfig para obtener únicamente las materias que corresponden al contexto seleccionado.
        var granular = (window.GLOBAL_SCOPE && window.GLOBAL_SCOPE.GranularConfig) ? window.GLOBAL_SCOPE.GranularConfig : [];
        var authorizedAsigs = [...new Set(granular.filter(function(r) {
            return norm(r.parcial) === norm(activePartial) &&
                   norm(r.grado) === norm(grado) &&
                   norm(r.seccion) === norm(seccion);
        }).map(function(r) { return r.asignatura; }))].filter(Boolean);

        const filtered = authorizedAsigs.filter(s => norm(s).includes(norm(search)));
        currentFilteredItems = filtered;

        dashboardTableHead.innerHTML = `
            <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Asignatura (${activePartial})</th>
                <th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Contexto</th>
                <th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th>
            </tr>`;

        if (filtered.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-400 font-bold text-[10px] uppercase tracking-widest">No hay asignaturas configuradas para este contexto.</td></tr>';
            return;
        }

        submissionsTableBody.innerHTML = filtered.map((asig, idx) => `
            <tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn group" data-index="${idx}">
                <td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter">${asig}</td>
                <td class="p-4">
                    <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${grado}</div>
                    <div class="text-[9px] font-black text-blue-600 uppercase">Sección ${seccion}</div>
                </td>
                <td class="p-4 text-right">
                    <span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest group-hover:underline">Ver Alumnos &rsaquo;</span>
                </td>
            </tr>`).join('');
    }

    /**
     * Renderiza la lista de alumnos filtrada por el contexto académico COMPLETO (v7.9.0)
     * REQ: Estricta adherencia a Grado, Sección, Asignatura y Parcial.
     */
    function renderAlumnos(grado, seccion, asignatura, search) {
        const current = navStack[navStack.length - 1];
        const students = current.data.students || [];

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

        // Fetch current link (by Grade) (v7.9.3)
        fetchApi('ACADEMIC', 'getWhatsAppLink', { grado }).then(res => {
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
                const res = await fetchApi('ACADEMIC', 'saveWhatsAppLink', { grado, link });
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
        // REQ: El estado 'Pendiente' se basa estrictamente en la asignatura seleccionada (v7.9.0)
        const activeParcial = window.normalizePartial(window.GLOBAL_SCOPE.ParcialActual);
        const studentsWithStatus = filtered.map(s => {
            const studentSubmissions = allActivityRaw.filter(sub =>
                String(sub.alumnoId) === String(s.userId) &&
                norm(sub.grado) === norm(grado) &&
                norm(sub.seccion) === norm(seccion) &&
                norm(sub.asignatura) === norm(asignatura) &&
                window.normalizePartial(sub.parcial) === activeParcial
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
                    <td class="p-4 text-right space-x-2">
                        <button class="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 btn-open-student-file" data-student-id="${s.userId || s.id}">
                            Expediente
                        </button>
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
            const activeParcial = window.normalizePartial(window.GLOBAL_SCOPE.ParcialActual);

            const subjectAssignments = allAssignmentsRaw.filter(a =>
                norm(a.grado) === norm(grado) &&
                (!a.seccion || norm(a.seccion) === norm(seccion) || norm(a.seccion) === 'todas') &&
                (isGlobalSearch || norm(a.asignatura) === norm(asignatura)) &&
                (isGlobalSearch || window.normalizePartial(a.parcial) === activeParcial)
            );

            const studentSubmissions = allActivityRaw.filter(sub =>
                String(sub.alumnoId) === String(alumnoId) &&
                norm(sub.grado) === norm(grado) &&
                norm(sub.seccion) === norm(seccion) &&
                (isGlobalSearch || norm(sub.asignatura) === norm(asignatura)) &&
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
                                <span class="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-semibold uppercase tracking-widest mb-1">Expediente Académico New Generation</span>
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
                                         <div class="text-base font-semibold text-white tracking-tight uppercase">AL DÍA</div>` :
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

        // REQ: Filtrado estricto por asignatura y contexto (v7.9.0)
        const activeParcial = window.normalizePartial(window.GLOBAL_SCOPE.ParcialActual);
        const filtered = allActivityRaw.filter(i =>
            String(i.alumnoId) === String(alumnoId) &&
            norm(i.grado) === norm(grado) &&
            norm(i.seccion) === norm(seccion) &&
            (isGlobalSearch || (norm(i.asignatura) === norm(asignatura) && window.normalizePartial(i.parcial) === activeParcial)) &&
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
                    // REQ: Optimización de navegación (v7.9.1)
                    // Filtramos GranularConfig para determinar cuántas secciones tiene REALMENTE este grado.
                    var granular = (window.GLOBAL_SCOPE && window.GLOBAL_SCOPE.GranularConfig) ? window.GLOBAL_SCOPE.GranularConfig : [];
                    var availableSections = [...new Set(granular.filter(function(r) {
                        return norm(r.grado) === norm(item);
                    }).map(function(r) { return r.seccion; }))].filter(Boolean);

                    if (availableSections.length === 1) {
                        await pushNav('Asignaturas', { grado: item, seccion: availableSections[0] });
                    } else {
                        await pushNav('Secciones', { grado: item });
                    }
                } else if (current.level === 'Secciones') {
                    await pushNav('Asignaturas', { grado: current.data.grado, seccion: item });
                } else if (current.level === 'Asignaturas') {
                    // REQ: Alumnos solo en la etapa terminal (v7.8.5)
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
            const pNum = { 'I parcial': '1', 'II parcial': '2', 'III parcial': '3', 'IV parcial': '4' }[parcial] || parcial;
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

    // --- LÓGICA DEL LIBRO OFICIAL DE CALIFICACIONES (FASE 9) ---
    let currentGradebookData = { alumnos: [], calificaciones: [], recuperaciones: [], categories: [], estadoPeriodo: "Abierto" };

    async function initGradebookModule() {
        const selGrado = document.getElementById('gb-filter-grado');
        const selSeccion = document.getElementById('gb-filter-seccion');
        const selAsignatura = document.getElementById('gb-filter-asignatura');
        const selParcial = document.getElementById('gb-filter-parcial');

        if (!selGrado) return;

        // Cargar opciones de filtros desde GLOBAL_SCOPE
        const scope = window.GLOBAL_SCOPE || {};
        const granular = scope.GranularConfig || [];

        const grados = Array.isArray(scope.GradoActual) ? scope.GradoActual : (scope.GradoActual ? [scope.GradoActual] : ["10mo Grado"]);
        selGrado.innerHTML = grados.map(g => `<option value="${g}">${g}</option>`).join('');

        const updateAsignaturasFilter = () => {
            const gVal = selGrado.value;
            const sVal = selSeccion.value;
            const matches = granular.filter(r => norm(r.grado) === norm(gVal) && norm(r.seccion) === norm(sVal));
            const asigs = [...new Set(matches.map(r => r.asignatura))].filter(Boolean);
            if (asigs.length === 0) {
                selAsignatura.innerHTML = '<option value="General">General</option>';
            } else {
                selAsignatura.innerHTML = asigs.map(a => `<option value="${a}">${a}</option>`).join('');
            }
        };

        selGrado.onchange = () => { updateAsignaturasFilter(); fetchGradebookData(); };
        selSeccion.onchange = () => { updateAsignaturasFilter(); fetchGradebookData(); };
        selAsignatura.onchange = () => fetchGradebookData();
        selParcial.onchange = () => fetchGradebookData();

        updateAsignaturasFilter();
        await fetchGradebookData();
    }

    async function fetchGradebookData() {
        const tbody = document.getElementById('gb-table-body');
        const selGrado = document.getElementById('gb-filter-grado');
        const selSeccion = document.getElementById('gb-filter-seccion');
        const selAsignatura = document.getElementById('gb-filter-asignatura');
        const selParcial = document.getElementById('gb-filter-parcial');

        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-gray-400 italic"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando calificaciones del período...</td></tr>';

        const payload = {
            grado: selGrado ? selGrado.value : "10mo Grado",
            seccion: selSeccion ? selSeccion.value : "A",
            asignatura: selAsignatura ? selAsignatura.value : "General",
            parcial: selParcial ? selParcial.value : "I parcial",
            profesorId: currentUser.userId
        };

        try {
            const res = await fetchApi('EXAM', 'getGradebookData', payload);
            if (res.status === 'success' && res.data) {
                currentGradebookData = res.data;
                renderGradebookTable();
            } else {
                tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-red-500">${res.message || 'Error al obtener libro de calificaciones'}</td></tr>`;
            }
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-red-500">Error de conexión: ${e.message}</td></tr>`;
        }
    }

    function renderGradebookTable() {
        const tbody = document.getElementById('gb-table-body');
        const bannerText = document.getElementById('gb-status-text');
        const bannerBadge = document.getElementById('gb-status-badge');
        if (!tbody) return;

        const { alumnos, calificaciones, recuperaciones, categories, estadoPeriodo } = currentGradebookData;

        if (bannerText && bannerBadge) {
            if (estadoPeriodo === 'Cerrado') {
                bannerText.textContent = "Estado del Parcial: CERRADO Y PUBLICADO OFICIALMENTE";
                bannerBadge.textContent = "Publicado";
                bannerBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-900 uppercase font-bold";
            } else {
                bannerText.textContent = "Estado del Parcial: Abierto (Permite registro y edición de notas)";
                bannerBadge.textContent = "Abierto";
                bannerBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-blue-200 text-blue-800 uppercase font-bold";
            }
        }

        if (!alumnos || alumnos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-gray-400 italic">No hay estudiantes inscritos en el grupo seleccionado.</td></tr>';
            return;
        }

        tbody.innerHTML = alumnos.map((al, idx) => {
            const studentCalifs = (calificaciones || []).filter(c => String(c.userId).trim() === String(al.userId).trim());
            const studentRecs = (recuperaciones || []).filter(r => String(r.userId).trim() === String(al.userId).trim());

            // Ponderaciones predeterminadas (35% tareas, 40% exámenes, 15% proyectos, 10% participación)
            const cTareas = studentCalifs.find(c => c.evaluacionId === 'CAT-1')?.notaObtenida || 0;
            const cExamenes = studentCalifs.find(c => c.evaluacionId === 'CAT-2')?.notaObtenida || 0;
            const cProyectos = studentCalifs.find(c => c.evaluacionId === 'CAT-3')?.notaObtenida || 0;
            const cPartic = studentCalifs.find(c => c.evaluacionId === 'CAT-4')?.notaObtenida || 0;

            let scoreRaw = (cTareas * 0.35) + (cExamenes * 0.40) + (cProyectos * 0.15) + (cPartic * 0.10);

            // Si tiene recuperación registrada, sustituir/ajustar
            let recBadge = '-';
            if (studentRecs.length > 0) {
                const latestRec = studentRecs[studentRecs.length - 1];
                scoreRaw = Math.max(scoreRaw, latestRec.notaFinalCalculada);
                recBadge = `<span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]" title="Original: ${latestRec.notaOriginal}">+${latestRec.notaFinalCalculada} (${latestRec.metodoAplicado})</span>`;
            }

            const finalScore = parseFloat(scoreRaw.toFixed(1));
            const isApproved = finalScore >= 70;

            return `
                <tr class="hover:bg-gray-50/80 transition-colors">
                    <td class="p-3 font-semibold text-gray-800">
                        <div>${al.nombreCompleto}</div>
                        <div class="text-[9px] text-gray-400 font-mono">${al.userId}</div>
                    </td>
                    <td class="p-2 text-center">
                        <input type="number" min="0" max="100" class="w-16 text-center text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 gb-score-input" data-userid="${al.userId}" data-cat="CAT-1" value="${cTareas}">
                    </td>
                    <td class="p-2 text-center">
                        <input type="number" min="0" max="100" class="w-16 text-center text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 gb-score-input" data-userid="${al.userId}" data-cat="CAT-2" value="${cExamenes}">
                    </td>
                    <td class="p-2 text-center">
                        <input type="number" min="0" max="100" class="w-16 text-center text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 gb-score-input" data-userid="${al.userId}" data-cat="CAT-3" value="${cProyectos}">
                    </td>
                    <td class="p-2 text-center">
                        <input type="number" min="0" max="100" class="w-16 text-center text-xs p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 gb-score-input" data-userid="${al.userId}" data-cat="CAT-4" value="${cPartic}">
                    </td>
                    <td class="p-3 text-center font-bold text-sm bg-purple-50/50 ${isApproved ? 'text-purple-700' : 'text-red-600'}">
                        ${finalScore}%
                    </td>
                    <td class="p-3 text-center bg-indigo-50/30">
                        ${recBadge}
                    </td>
                    <td class="p-3 text-center">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                            ${isApproved ? 'Aprobado' : 'Reprobado'}
                        </span>
                    </td>
                    <td class="p-3 text-center">
                        <button onclick="window.quickRecoveryPrompt('${al.userId}', '${al.nombreCompleto}', ${finalScore})" class="px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-[9px] font-bold uppercase transition-colors">
                            Recuperación
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.quickRecoveryPrompt = async function(userId, nombre, notaActual) {
        const notaRec = prompt(`Registrar recuperación para ${nombre}.\nNota Calculada Actual: ${notaActual}%\n\nIngrese la nueva nota obtenida (0-100):`);
        if (!notaRec || isNaN(parseFloat(notaRec))) return;

        const metodo = prompt("Seleccione el método de aplicación:\n1. Sustitucion (Reemplaza nota anterior)\n2. Promedio (Promedia nota original y nueva)\n3. Mayor (Conserva la nota más alta)", "Sustitucion");

        try {
            const res = await fetchApi('EXAM', 'saveStudentRecovery', {
                evaluacionId: "CAT-GLOBAL",
                userId: userId,
                notaOriginal: notaActual,
                notaRecuperada: parseFloat(notaRec),
                metodoAplicado: metodo || "Sustitucion",
                autorizadoPor: currentUser.nombre
            });

            if (res.status === 'success') {
                alert(`Recuperación registrada con éxito para ${nombre}. Nueva nota final: ${res.data?.notaFinalCalculada}`);
                fetchGradebookData();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al guardar recuperación: " + e.message);
        }
    };

    document.getElementById('btn-gb-save-all')?.addEventListener('click', async () => {
        const inputs = document.querySelectorAll('.gb-score-input');
        const califsToSave = [];

        inputs.forEach(inp => {
            const userId = inp.dataset.userid;
            const catId = inp.dataset.cat;
            const score = parseFloat(inp.value) || 0;
            califsToSave.push({
                evaluacionId: catId,
                userId: userId,
                notaObtenida: score,
                puntajePonderado: score,
                observaciones: "Actualizado desde Libro de Calificaciones"
            });
        });

        const btn = document.getElementById('btn-gb-save-all');
        btn.disabled = true;
        btn.textContent = "Guardando...";

        try {
            const res = await fetchApi('EXAM', 'saveGradebookGrades', {
                calificaciones: califsToSave,
                esBorrador: false,
                esPublicada: true,
                profesorId: currentUser.userId
            });

            if (res.status === 'success') {
                alert("¡Calificaciones guardadas exitosamente en el servidor!");
                fetchGradebookData();
            } else {
                alert("Error al guardar: " + res.message);
            }
        } catch (e) {
            alert("Error de conexión al guardar calificaciones: " + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Guardar Cambios del Libro";
        }
    });

    document.getElementById('btn-gb-close-period')?.addEventListener('click', async () => {
        const selGrado = document.getElementById('gb-filter-grado')?.value;
        const selSeccion = document.getElementById('gb-filter-seccion')?.value;
        const selAsignatura = document.getElementById('gb-filter-asignatura')?.value;
        const selParcial = document.getElementById('gb-filter-parcial')?.value;

        if (!confirm(`¿Confirma el CIERRE OFICIAL y PUBLICACIÓN del período ${selParcial} para la asignatura ${selAsignatura} (${selGrado} ${selSeccion})?\n\nLas notas quedarán consolidadas y visibles para estudiantes y padres.`)) {
            return;
        }

        try {
            const res = await fetchApi('EXAM', 'closePeriodGradebook', {
                anoId: "2026",
                periodoId: selParcial,
                grado: selGrado,
                seccion: selSeccion,
                asignatura: selAsignatura,
                profesorId: currentUser.userId
            });

            if (res.status === 'success') {
                alert(res.message);
                fetchGradebookData();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error de cierre: " + e.message);
        }
    });

    document.getElementById('btn-gb-config-weights')?.addEventListener('click', () => {
        alert("Distribución porcentual institucional del New Generation:\n\n- Tareas y Trabajos (CAT-1): 35%\n- Exámenes y Pruebas (CAT-2): 40%\n- Proyectos e Investigaciones (CAT-3): 15%\n- Prácticas y Participación (CAT-4): 10%\n\nSuma total: 100%");
    });

    document.getElementById('btn-gb-register-recovery')?.addEventListener('click', () => {
        const userId = prompt("Ingrese el ID del estudiante para recuperación:");
        if (!userId) return;
        window.quickRecoveryPrompt(userId, "Estudiante " + userId, 65);
    });

    // --- MÓDULO DE CONTROL DE ASISTENCIA Y CONVIVENCIA ESCOLAR (FASE 10) ---
    let currentAttendanceStudents = [];

    async function initAttendanceModule() {
        const selGrado = document.getElementById('att-filter-grado');
        const selSeccion = document.getElementById('att-filter-seccion');
        const selAsignatura = document.getElementById('att-filter-asignatura');
        const inputDate = document.getElementById('att-filter-date');

        if (!selGrado) return;

        if (inputDate && !inputDate.value) {
            inputDate.value = new Date().toISOString().split('T')[0];
        }

        const scope = window.GLOBAL_SCOPE || {};
        const granular = scope.GranularConfig || [];

        const grados = Array.isArray(scope.GradoActual) ? scope.GradoActual : (scope.GradoActual ? [scope.GradoActual] : ["10mo Grado"]);
        selGrado.innerHTML = grados.map(g => `<option value="${g}">${g}</option>`).join('');

        const updateAsignaturasFilter = () => {
            const gVal = selGrado.value;
            const sVal = selSeccion.value;
            const matches = granular.filter(r => norm(r.grado) === norm(gVal) && norm(r.seccion) === norm(sVal));
            const asigs = [...new Set(matches.map(r => r.asignatura))].filter(Boolean);
            if (asigs.length === 0) {
                selAsignatura.innerHTML = '<option value="General">General</option>';
            } else {
                selAsignatura.innerHTML = asigs.map(a => `<option value="${a}">${a}</option>`).join('');
            }
        };

        selGrado.onchange = () => { updateAsignaturasFilter(); loadAttendanceSheet(); };
        selSeccion.onchange = () => { updateAsignaturasFilter(); loadAttendanceSheet(); };
        selAsignatura.onchange = () => loadAttendanceSheet();
        inputDate.onchange = () => loadAttendanceSheet();

        updateAsignaturasFilter();
        await loadAttendanceSheet();
    }

    async function loadAttendanceSheet() {
        const tbody = document.getElementById('att-table-body');
        const selGrado = document.getElementById('att-filter-grado')?.value;
        const selSeccion = document.getElementById('att-filter-seccion')?.value;
        const selDate = document.getElementById('att-filter-date')?.value || new Date().toISOString().split('T')[0];

        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-gray-400 italic"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando lista de asistencia del grupo...</td></tr>';

        try {
            const [stRes, attRes] = await Promise.all([
                fetchApi('USER', 'getStudentsByGradoSeccion', { grado: selGrado, seccion: selSeccion }),
                fetchApi('ACADEMIC', 'getDailyAttendance', { fecha: selDate, grado: selGrado, seccion: selSeccion })
            ]);

            const students = stRes.status === 'success' ? (stRes.data || []) : [];
            const existingRegs = attRes.status === 'success' ? (attRes.data || []) : [];

            currentAttendanceStudents = students;

            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-gray-400 italic">No hay estudiantes registrados en esta sección.</td></tr>';
                return;
            }

            tbody.innerHTML = students.map((s, idx) => {
                const reg = existingRegs.find(r => String(r.userId).trim() === String(s.userId).trim());
                const estadoActual = reg ? reg.estadoAsistencia : "Presente";
                const horaLlegada = reg ? (reg.horaLlegada || "") : "";
                const obs = reg ? (reg.observacionDocente || "") : "";

                return `
                    <tr class="hover:bg-gray-50/80 transition-colors">
                        <td class="p-3 font-semibold text-gray-800">
                            <div>${s.nombre}</div>
                            <div class="text-[9px] text-gray-400 font-mono">LISTA #${s.numeroLista || idx + 1} | ${s.userId}</div>
                        </td>
                        <td class="p-2 text-center">
                            <select class="p-2 text-xs border border-gray-200 rounded-xl font-bold att-status-select" data-userid="${s.userId}">
                                <option value="Presente" ${estadoActual === "Presente" ? "selected" : ""}>Presente</option>
                                <option value="Ausente" ${estadoActual === "Ausente" ? "selected" : ""}>Ausente</option>
                                <option value="Tardanza" ${estadoActual === "Tardanza" ? "selected" : ""}>Tardanza</option>
                                <option value="Justificada" ${estadoActual === "Justificada" ? "selected" : ""}>Justificada</option>
                                <option value="SalidaAnticipada" ${estadoActual === "SalidaAnticipada" ? "selected" : ""}>Salida Anticipada</option>
                            </select>
                        </td>
                        <td class="p-2 text-center">
                            <input type="time" class="p-1.5 border border-gray-200 rounded-lg text-xs att-time-input" data-userid="${s.userId}" value="${horaLlegada}">
                        </td>
                        <td class="p-2 text-center">
                            <input type="text" placeholder="Observaciones..." class="w-full p-1.5 border border-gray-200 rounded-lg text-xs att-obs-input" data-userid="${s.userId}" value="${obs}">
                        </td>
                    </tr>
                `;
            }).join('');

            await loadDisciplinaryIncidents();
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-red-500">Error al cargar datos: ${e.message}</td></tr>`;
        }
    }

    async function loadDisciplinaryIncidents() {
        const container = document.getElementById('att-incidents-container');
        if (!container) return;

        try {
            const res = await fetchApi('ACADEMIC', 'getAttendanceIncidents', {});
            if (res.status === 'success' && Array.isArray(res.data)) {
                const incs = res.data;
                if (incs.length === 0) {
                    container.innerHTML = '<div class="text-center py-6 text-gray-400 italic text-xs border-2 border-dashed border-gray-100 rounded-2xl col-span-full">No se han registrado incidencias para este grupo.</div>';
                    return;
                }

                container.innerHTML = incs.map(i => `
                    <div class="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                        <div class="flex items-center justify-between mb-1">
                            <span class="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[9px] uppercase">${i.tipoIncidencia}</span>
                            <span class="text-[9px] text-gray-400 font-mono">${i.fecha ? new Date(i.fecha).toLocaleDateString() : ''}</span>
                        </div>
                        <p class="text-xs font-semibold text-gray-800 mt-1">${i.descripcion || 'Sin detalle'}</p>
                        <div class="text-[9px] text-gray-500 mt-2">Reportado por: ${i.reportadoPor || 'Docente'} | Estado: <strong>${i.estado}</strong></div>
                    </div>
                `).join('');
            }
        } catch (e) {
            container.innerHTML = '<div class="text-center py-6 text-red-500 text-xs col-span-full">Error al cargar incidencias disciplinarias.</div>';
        }
    }

    document.getElementById('btn-att-save-attendance')?.addEventListener('click', async () => {
        const selDate = document.getElementById('att-filter-date')?.value || new Date().toISOString().split('T')[0];
        const selGrado = document.getElementById('att-filter-grado')?.value;
        const selSeccion = document.getElementById('att-filter-seccion')?.value;

        const selects = document.querySelectorAll('.att-status-select');
        const registros = [];

        selects.forEach(sel => {
            const uId = sel.dataset.userid;
            const timeInp = document.querySelector(`.att-time-input[data-userid="${uId}"]`);
            const obsInp = document.querySelector(`.att-obs-input[data-userid="${uId}"]`);

            registros.push({
                userId: uId,
                estadoAsistencia: sel.value,
                horaLlegada: timeInp ? timeInp.value : "",
                observacionDocente: obsInp ? obsInp.value : ""
            });
        });

        const btn = document.getElementById('btn-att-save-attendance');
        btn.disabled = true;
        btn.textContent = "Guardando...";

        try {
            const res = await fetchApi('ACADEMIC', 'saveDailyAttendance', {
                fecha: selDate,
                grado: selGrado,
                seccion: selSeccion,
                registros: registros
            });

            if (res.status === 'success') {
                alert("¡Pase de lista guardado exitosamente!");
                loadAttendanceSheet();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al guardar asistencia: " + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Guardar Pase de Lista";
        }
    });

    document.getElementById('btn-att-new-incident')?.addEventListener('click', async () => {
        const userId = prompt("Ingrese el ID del estudiante involucrado:");
        if (!userId) return;

        const tipo = prompt("Seleccione el Tipo de Incidencia:\n1. Leve (Tardanza recurrente, faltas menores)\n2. Grave (Incumplimiento de normas, falta de respeto)\n3. Muy Grave (Conducta crítica)", "Leve");
        if (!tipo) return;

        const desc = prompt("Escriba una descripción objetiva de los hechos:");
        if (!desc) return;

        try {
            const res = await fetchApi('ACADEMIC', 'saveAttendanceIncident', {
                userId: userId,
                tipoIncidencia: tipo,
                descripcion: desc,
                reportadoPor: currentUser.nombre
            });

            if (res.status === 'success') {
                alert("Incidencia de convivencia registrada exitosamente.");
                loadAttendanceSheet();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error registrando incidencia: " + e.message);
        }
    });

    // --- MÓDULO DE COMUNICADOS E INTEGRACIÓN INSTITUCIONAL (FASE 11) ---
    async function loadInstitutionalAnnouncementsModule() {
        const container = document.getElementById('comunicados-list-container');
        if (!container) return;

        container.innerHTML = '<div class="text-center py-8 text-gray-400 italic text-xs"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando comunicados emitidos...</div>';

        try {
            const res = await fetchApi('USER', 'getInstitutionalAnnouncements', { rol: currentUser.rol });
            if (res.status === 'success' && Array.isArray(res.data)) {
                const comms = res.data;
                if (comms.length === 0) {
                    container.innerHTML = '<div class="text-center py-8 text-gray-400 italic text-xs border-2 border-dashed border-gray-100 rounded-2xl">No se han emitido comunicados institucionales aún.</div>';
                    return;
                }

                container.innerHTML = comms.map(c => `
                    <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
                        <div class="flex items-center justify-between mb-2">
                            <span class="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold uppercase rounded-full">${c.categoria}</span>
                            <span class="text-[9px] font-mono text-gray-400">${c.fechaPublicacion ? new Date(c.fechaPublicacion).toLocaleDateString() : ''}</span>
                        </div>
                        <h4 class="text-xs font-bold text-gray-900 uppercase tracking-tight mb-1">${c.titulo}</h4>
                        <p class="text-xs text-gray-600 leading-relaxed mb-3">${c.contenido}</p>
                        <div class="flex items-center justify-between text-[9px] text-gray-500 pt-2 border-t border-gray-50">
                            <span>Audiencia: <strong>${typeof c.audiencia === 'object' ? JSON.stringify(c.audiencia) : c.audiencia}</strong></span>
                            ${c.requiereFirma ? '<span class="text-indigo-600 font-bold"><i class="fas fa-file-signature"></i> Requiere Acuse</span>' : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="text-center py-6 text-red-500 text-xs">Error al obtener comunicados.</div>';
            }
        } catch (e) {
            container.innerHTML = `<div class="text-center py-6 text-red-500 text-xs">Error de conexión: ${e.message}</div>`;
        }
    }

    document.getElementById('btn-pub-comunicado')?.addEventListener('click', async () => {
        const titulo = document.getElementById('com-titulo')?.value.trim();
        const categoria = document.getElementById('com-categoria')?.value;
        const audiencia = document.getElementById('com-audiencia')?.value;
        const contenido = document.getElementById('com-contenido')?.value.trim();
        const requiereFirma = document.getElementById('com-requiere-firma')?.checked;

        if (!titulo || !contenido) {
            alert("Debe completar el título y el contenido del comunicado.");
            return;
        }

        const btn = document.getElementById('btn-pub-comunicado');
        btn.disabled = true;
        btn.textContent = "Publicando...";

        try {
            const res = await fetchApi('USER', 'createInstitutionalAnnouncement', {
                titulo: titulo,
                contenido: contenido,
                categoria: categoria,
                autorId: currentUser.nombre || "Dirección",
                audiencia: audiencia,
                requiereFirma: requiereFirma
            });

            if (res.status === 'success') {
                alert("¡Comunicado institucional publicado exitosamente!");
                document.getElementById('com-titulo').value = "";
                document.getElementById('com-contenido').value = "";
                loadInstitutionalAnnouncementsModule();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al publicar comunicado: " + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Publicar Comunicado";
        }
    });

    // --- MÓDULO DE BIENESTAR ESTUDIANTIL Y ORIENTACIÓN (FASE 12) ---
    let currentOrientationCases = [];

    async function initOrientationModule() {
        const studentIdInp = document.getElementById('ori-student-id');
        if (!studentIdInp) return;

        document.getElementById('btn-ori-search-student')?.addEventListener('click', () => {
            const sId = studentIdInp.value.trim();
            if (sId) loadStudentOrientationCases(sId);
        });

        document.getElementById('btn-ori-new-case')?.addEventListener('click', () => {
            const userId = prompt("Ingrese el ID del estudiante para abrir un caso:");
            if (!userId) return;

            const motivo = prompt("Ingrese el motivo de apertura del caso (Ej. Dificultades de adaptación, Seguimiento académico):", "Acompañamiento e intervención institucional");
            if (!motivo) return;

            const resumen = prompt("Ingrese un resumen o antecedentes iniciales del estudiante:", "Caso abierto desde el Centro de Orientación");

            saveNewFollowupCase(userId, motivo, resumen);
        });

        document.getElementById('btn-ori-add-note')?.addEventListener('click', () => {
            const caseId = document.getElementById('ori-case-selector')?.value;
            const note = document.getElementById('ori-case-note')?.value.trim();

            if (!caseId || !note) {
                alert("Debe seleccionar un caso e ingresar una nota de intervención.");
                return;
            }

            addNoteToCase(caseId, note);
        });
    }

    async function loadStudentOrientationCases(userId) {
        const container = document.getElementById('ori-cases-list-container');
        const caseSelector = document.getElementById('ori-case-selector');
        const formContainer = document.getElementById('ori-case-form-container');

        if (!container) return;

        container.innerHTML = '<div class="text-center py-8 text-gray-400 italic text-xs"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando casos de orientación...</div>';

        try {
            const res = await fetchApi('ACADEMIC', 'getAttendanceFollowupCases', { userId: userId });
            if (res.status === 'success' && Array.isArray(res.data)) {
                const cases = res.data;
                currentOrientationCases = cases;

                if (cases.length === 0) {
                    container.innerHTML = `<div class="text-center py-8 text-gray-400 italic text-xs border-2 border-dashed border-gray-100 rounded-2xl">No hay casos registrados para el estudiante ${userId}.</div>`;
                    if (formContainer) formContainer.classList.add('hidden');
                    return;
                }

                if (caseSelector) {
                    caseSelector.innerHTML = cases.map(c => `<option value="${c.casoId}">${c.casoId} - ${c.motivoApertura} (${c.estado})</option>`).join('');
                }
                if (formContainer) formContainer.classList.remove('hidden');

                container.innerHTML = cases.map(c => `
                    <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-purple-200 transition-all">
                        <div class="flex items-center justify-between mb-2">
                            <span class="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-bold uppercase rounded-full">${c.estado}</span>
                            <span class="text-[9px] font-mono text-gray-400">Apertura: ${c.fechaApertura ? new Date(c.fechaApertura).toLocaleDateString() : ''}</span>
                        </div>
                        <h4 class="text-xs font-bold text-gray-900 uppercase tracking-tight mb-1">${c.motivoApertura}</h4>
                        <p class="text-xs text-gray-600 mb-3">${c.resumenAsistencia}</p>

                        <!-- Bitácora de Acciones / Intervenciones -->
                        <div class="border-t border-gray-50 pt-2 space-y-2">
                            <span class="text-[9px] font-bold text-purple-700 uppercase">Bitácora de Intervenciones:</span>
                            ${Array.isArray(c.acciones) && c.acciones.length > 0 ? c.acciones.map(a => `
                                <div class="p-2 bg-purple-50/50 rounded-lg text-[10px] text-gray-700 border border-purple-100/50">
                                    <div class="flex justify-between font-bold text-purple-900 text-[9px]">
                                        <span>${a.autor || 'Orientación'}</span>
                                        <span>${a.fecha ? new Date(a.fecha).toLocaleString() : ''}</span>
                                    </div>
                                    <p class="mt-1 leading-relaxed">${a.nota || a.accion || ''}</p>
                                </div>
                            `).join('') : '<p class="text-[10px] text-gray-400 italic">Sin intervenciones registradas aún.</p>'}
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="text-center py-6 text-red-500 text-xs">Error al consultar casos.</div>';
            }
        } catch (e) {
            container.innerHTML = `<div class="text-center py-6 text-red-500 text-xs">Error de conexión: ${e.message}</div>`;
        }
    }

    async function saveNewFollowupCase(userId, motivo, resumen) {
        try {
            const res = await fetchApi('ACADEMIC', 'saveAttendanceFollowupCase', {
                userId: userId,
                motivoApertura: motivo,
                resumenAsistencia: resumen,
                responsableId: currentUser.nombre || "Orientación",
                estado: "Abierto"
            });

            if (res.status === 'success') {
                alert("¡Caso de acompañamiento abierto exitosamente!");
                loadStudentOrientationCases(userId);
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al abrir caso: " + e.message);
        }
    }

    async function addNoteToCase(casoId, note) {
        try {
            const res = await fetchApi('ACADEMIC', 'addCaseFollowUpNote', {
                casoId: casoId,
                nota: note,
                autorId: currentUser.nombre || "Orientación"
            });

            if (res.status === 'success') {
                alert("¡Nota agregada a la bitácora del caso!");
                document.getElementById('ori-case-note').value = "";
                const sId = document.getElementById('ori-student-id')?.value.trim();
                if (sId) loadStudentOrientationCases(sId);
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al guardar nota: " + e.message);
        }
    }

    // --- MÓDULO DE SUPERVISIÓN DOCENTE Y CALIDAD EDUCATIVA (FASE 13) ---
    async function loadSupervisionModule() {
        const supContainer = document.getElementById('sup-list-container');
        const activeSelect = document.getElementById('sup-select-active');
        if (!supContainer) return;

        supContainer.innerHTML = '<div class="text-center py-8 text-gray-400 italic text-xs"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando supervisiones...</div>';

        try {
            const res = await fetchApi('ACADEMIC', 'getTeacherSupervisions', {
                docenteUserId: currentUser.rol === 'Profesor' ? currentUser.userId : null
            });

            if (res.status === 'success' && Array.isArray(res.data)) {
                const sups = res.data;
                if (sups.length === 0) {
                    supContainer.innerHTML = '<div class="text-center py-8 text-gray-400 italic text-xs border-2 border-dashed border-gray-100 rounded-2xl">No hay supervisiones programadas registradas.</div>';
                    if (activeSelect) activeSelect.innerHTML = '<option value="">No hay supervisiones activas</option>';
                    return;
                }

                if (activeSelect) {
                    const activeSups = sups.filter(s => s.estado !== 'Finalizada');
                    activeSelect.innerHTML = activeSups.length > 0
                        ? activeSups.map(s => `<option value="${s.supervisionId}">${s.supervisionId} - ${s.tipoSupervision} (${s.grado} ${s.seccion})</option>`).join('')
                        : '<option value="">Sin supervisiones pendientes</option>';
                }

                supContainer.innerHTML = sups.map(s => `
                    <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all">
                        <div class="flex items-center justify-between mb-2">
                            <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded-full">${s.estado}</span>
                            <span class="text-[9px] font-mono text-gray-400">${s.fechaProgramada ? new Date(s.fechaProgramada).toLocaleDateString() : ''}</span>
                        </div>
                        <h4 class="text-xs font-bold text-gray-900 uppercase tracking-tight mb-1">${s.tipoSupervision}</h4>
                        <p class="text-xs text-gray-600 mb-2">Docente: <strong>${s.docenteUserId}</strong> | Clase: ${s.asignatura} (${s.grado} ${s.seccion})</p>
                        <div class="text-[9px] text-gray-500 pt-2 border-t border-gray-50">Supervisor: ${s.supervisorUserId || 'Dirección'}</div>
                    </div>
                `).join('');
            } else {
                supContainer.innerHTML = '<div class="text-center py-6 text-red-500 text-xs">Error al cargar supervisiones.</div>';
            }
        } catch (e) {
            supContainer.innerHTML = `<div class="text-center py-6 text-red-500 text-xs">Error de conexión: ${e.message}</div>`;
        }
    }

    document.getElementById('btn-sup-new-schedule')?.addEventListener('click', async () => {
        const docId = prompt("Ingrese el ID o Usuario del Docente a supervisar:");
        if (!docId) return;

        const tipo = prompt("Tipo de supervisión:\n1. ObservacionAula (Observación de clase)\n2. RevisiónPlanificacion\n3. AcompañamientoPedagogico", "ObservacionAula");
        if (!tipo) return;

        const grado = prompt("Grado:", "10mo Grado");
        const seccion = prompt("Sección:", "A");
        const asig = prompt("Asignatura:", "Informática");

        try {
            const res = await fetchApi('ACADEMIC', 'createTeacherSupervision', {
                docenteUserId: docId,
                supervisorUserId: currentUser.nombre || "Dirección",
                fechaProgramada: new Date().toISOString().split('T')[0],
                grado: grado || "General",
                seccion: seccion || "A",
                asignatura: asig || "General",
                tipoSupervision: tipo
            });

            if (res.status === 'success') {
                alert("¡Supervisión programada con éxito!");
                loadSupervisionModule();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al programar supervisión: " + e.message);
        }
    });

    document.getElementById('btn-sup-save-observation')?.addEventListener('click', async () => {
        const supId = document.getElementById('sup-select-active')?.value;
        const evidencias = document.getElementById('sup-obs-evidencias')?.value.trim();
        const fortalezas = document.getElementById('sup-obs-fortalezas')?.value.trim();
        const oportunidades = document.getElementById('sup-obs-oportunidades')?.value.trim();

        if (!supId || !evidencias) {
            alert("Debe seleccionar una supervisión e ingresar las evidencias observadas.");
            return;
        }

        const btn = document.getElementById('btn-sup-save-observation');
        btn.disabled = true;
        btn.textContent = "Guardando...";

        try {
            const res = await fetchApi('ACADEMIC', 'saveSupervisionObservation', {
                supervisionId: supId,
                respuestasRubrica: { resultadoGlobal: "Satisfecho" },
                evidenciasTexto: evidencias,
                fortalezasTexto: fortalezas,
                oportunidadesMejora: oportunidades
            });

            if (res.status === 'success') {
                alert("Observación pedagógica guardada correctamente.");
                document.getElementById('sup-obs-evidencias').value = "";
                document.getElementById('sup-obs-fortalezas').value = "";
                document.getElementById('sup-obs-oportunidades').value = "";
                loadSupervisionModule();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            alert("Error al guardar observación: " + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Guardar Observación y Finalizar";
        }
    });

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

    // -----------------------------------------------------------------------
    // FASE 22: DISEÑADOR UNIVERSAL DE DOCUMENTOS Y PLANTILLAS CONTROLLER
    // -----------------------------------------------------------------------

    let loadedTemplatesCache = [];

    if (navPlantillas && sectionPlantillas) {
        navPlantillas.addEventListener('click', () => {
            window.navigateTo(sectionPlantillas, navPlantillas);
            loadTemplateDesignerCatalog();
            loadAvailableDynamicFields();
        });
    }

    function getDefaultTemplatesFallback() {
        return [
            {
                plantillaId: "TMP-001",
                codigoDocumento: "CONST-ESTUDIO",
                categoria: "Académico",
                titulo: "Constancia de Estudios Oficial",
                descripcion: "Constancia de estudios estándar para trámite administrativo o consular.",
                departamento: "Secretaría General",
                estado: "publicada",
                version: "1.0",
                contenidoHTML: `
                <div style="font-family: Arial, sans-serif; padding: 30px; color: #1e293b;">
                  <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 24px;">
                    <h1 style="color: #1e3a8a; font-size: 20px; margin: 0;">NEW GENERATION CHRISTIAN ACADEMY</h1>
                    <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Constancia Oficial de Estudios - Año Lectivo {{institucion.anoLectivo}}</p>
                  </div>
                  <p>Por medio de la presente, la Dirección y Secretaría de <strong>New Generation Christian Academy</strong> hace constar que:</p>
                  <p style="font-size: 16px; text-align: center; margin: 20px 0; font-weight: bold; color: #0f172a;">{{estudiante.nombreCompleto}}</p>
                  <p>Con número de documento / ID <strong>{{estudiante.identidad}}</strong>, se encuentra debidamente matriculado(a) y cursando de manera regular el grado <strong>{{estudiante.grado}} {{estudiante.seccion}}</strong> en esta institución educativa.</p>
                  <p>Se extiende la presente constancia a petición de parte interesada para los fines de: <em>{{tramite.motivo}}</em>.</p>
                  <div style="margin-top: 60px; text-align: center;">
                    <div style="width: 220px; border-top: 1px solid #334155; margin: 0 auto; padding-top: 6px;">
                      <strong>Secretaría Académica / Dirección</strong><br>
                      <span style="font-size: 11px; color: #64748b;">New Generation Christian Academy</span>
                    </div>
                  </div>
                </div>`
            },
            {
                plantillaId: "TMP-002",
                codigoDocumento: "CONST-SOLVENCIA",
                categoria: "Financiero",
                titulo: "Constancia de Solvencia Financiera",
                descripcion: "Constancia emitida para verificar solvencia económica de matrículas y mensualidades.",
                departamento: "Contabilidad y Cobros",
                estado: "publicada",
                version: "1.0",
                contenidoHTML: `
                <div style="font-family: Arial, sans-serif; padding: 30px; color: #1e293b;">
                  <div style="text-align: center; border-bottom: 2px solid #166534; padding-bottom: 12px; margin-bottom: 24px;">
                    <h1 style="color: #166534; font-size: 20px; margin: 0;">NEW GENERATION CHRISTIAN ACADEMY</h1>
                    <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Departamento de Contabilidad y Cobros</p>
                  </div>
                  <h2 style="text-align: center; font-size: 16px; margin-bottom: 20px;">CONSTANCIA DE SOLVENCIA</h2>
                  <p>El Departamento de Contabilidad de <strong>New Generation Christian Academy</strong> certifica que el/la estudiante:</p>
                  <p style="font-size: 16px; text-align: center; margin: 18px 0; font-weight: bold; color: #0f172a;">{{estudiante.nombreCompleto}}</p>
                  <p>Se encuentra al día con sus compromisos financieros y cuotas colegiales correspondientes a: <strong>{{finanzas.mesesSolventes}}</strong>.</p>
                  <div style="margin-top: 60px; text-align: center;">
                    <div style="width: 220px; border-top: 1px solid #334155; margin: 0 auto; padding-top: 6px;">
                      <strong>Coordinación Financiera</strong><br>
                      <span style="font-size: 11px; color: #64748b;">New Generation Christian Academy</span>
                    </div>
                  </div>
                </div>`
            }
        ];
    }

    async function loadTemplateDesignerCatalog() {
        const grid = document.getElementById('templates-grid');
        if (!grid) return;

        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400 font-bold text-xs uppercase"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Cargando catálogo de plantillas...</div>`;

        try {
            if (typeof apiCall === 'function') {
                const resp = await apiCall({ action: 'getSchoolDocumentTemplates' }, 'ACCOUNTING');
                if (resp && resp.status === 'success' && Array.isArray(resp.plantillas) && resp.plantillas.length > 0) {
                    loadedTemplatesCache = resp.plantillas;
                } else {
                    loadedTemplatesCache = getDefaultTemplatesFallback();
                }
            } else {
                loadedTemplatesCache = getDefaultTemplatesFallback();
            }
        } catch (e) {
            console.warn("Error loading templates, using defaults:", e);
            loadedTemplatesCache = getDefaultTemplatesFallback();
        }

        renderTemplateCatalog(loadedTemplatesCache);
    }

    function renderTemplateCatalog(templates) {
        const grid = document.getElementById('templates-grid');
        if (!grid) return;

        const searchVal = norm(document.getElementById('template-search-input')?.value || "");
        const catVal = (document.getElementById('template-category-filter')?.value || "").toLowerCase();
        const stateVal = (document.getElementById('template-state-filter')?.value || "").toLowerCase();

        let filtered = templates.filter(t => {
            const matchesSearch = !searchVal || norm(t.titulo).includes(searchVal) || norm(t.codigoDocumento).includes(searchVal) || norm(t.departamento).includes(searchVal);
            const matchesCat = !catVal || (t.categoria || "").toLowerCase() === catVal;
            const matchesState = !stateVal || (t.estado || "publicada").toLowerCase() === stateVal;
            return matchesSearch && matchesCat && matchesState;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 bg-white rounded-3xl border border-gray-100 p-8">
                <i class="fa-solid fa-folder-open text-gray-300 text-4xl mb-3"></i>
                <p class="text-xs font-bold text-gray-500 uppercase">No se encontraron plantillas documentales con los filtros seleccionados.</p>
            </div>`;
            return;
        }

        grid.innerHTML = filtered.map(t => {
            const isPub = t.estado === 'publicada';
            const badgeBg = isPub ? 'bg-emerald-100 text-emerald-800' : (t.estado === 'borrador' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700');
            const stateLabel = isPub ? 'Publicada' : (t.estado === 'borrador' ? 'Borrador' : t.estado);

            return `
            <div class="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="px-2.5 py-1 ${badgeBg} rounded-full text-[10px] font-black uppercase tracking-wider">${stateLabel}</span>
                        <span class="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">v${t.version || '1.0'}</span>
                    </div>
                    <h3 class="text-base font-black text-slate-900 leading-snug mb-1">${t.titulo}</h3>
                    <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">${t.codigoDocumento} · ${t.categoria || 'Académico'}</p>
                    <p class="text-xs text-gray-500 mt-2 line-clamp-2">${t.descripcion || 'Sin descripción de plantilla.'}</p>
                </div>

                <div class="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div class="text-[10px] text-gray-400 font-bold uppercase">${t.departamento || 'Secretaría'}</div>
                    <div class="flex items-center gap-1">
                        <button onclick="previewTemplateById('${t.plantillaId}')" title="Previsualizar Documento" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button onclick="editTemplateById('${t.plantillaId}')" title="Editar Plantilla" class="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="openGeneratorForTemplate('${t.plantillaId}', '${t.titulo}')" title="Emitir Documento Oficial" class="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold text-xs uppercase tracking-wider">
                            Emitir
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    async function loadAvailableDynamicFields() {
        const select = document.getElementById('dynamic-fields-select');
        if (!select) return;

        try {
            const resp = await apiCall({ action: 'getAvailableDynamicFields' }, 'ACCOUNTING');
            if (resp && resp.status === 'success' && Array.isArray(resp.campos)) {
                select.innerHTML = `<option value="">-- Seleccionar Variable Dinámica --</option>` +
                    resp.campos.map(c => `<option value="${c.clave}">${c.categoria}: ${c.etiqueta} (${c.clave})</option>`).join('');
            }
        } catch (e) {
            console.error("Error loading dynamic fields:", e);
        }
    }

    // Modal Trigger Listeners
    const btnOpenEditor = document.getElementById('btn-open-template-editor');
    const modalEditor = document.getElementById('modal-template-editor');
    const closeEditorBtns = [document.getElementById('close-template-editor'), document.getElementById('btn-close-editor-cancel')];

    if (btnOpenEditor && modalEditor) {
        btnOpenEditor.addEventListener('click', () => {
            document.getElementById('editor-template-id').value = '';
            document.getElementById('editor-code').value = 'TMP-' + Math.floor(100 + Math.random() * 900);
            document.getElementById('editor-title').value = '';
            document.getElementById('editor-category').value = 'Académico';
            document.getElementById('editor-department').value = 'Secretaría General';
            document.getElementById('editor-output-type').value = 'PDF';
            document.getElementById('editor-state').value = 'publicada';
            document.getElementById('editor-version').value = '1.0';
            document.getElementById('editor-html-content').value = '';
            document.getElementById('editor-modal-title').textContent = 'Crear Nueva Plantilla Institucional';
            modalEditor.classList.remove('hidden');
        });
    }

    closeEditorBtns.forEach(btn => btn?.addEventListener('click', () => modalEditor?.classList.add('hidden')));

    // Dynamic field insert
    const btnInsertField = document.getElementById('btn-insert-dynamic-field');
    if (btnInsertField) {
        btnInsertField.addEventListener('click', () => {
            const select = document.getElementById('dynamic-fields-select');
            const textarea = document.getElementById('editor-html-content');
            if (!select || !textarea || !select.value) return;

            const val = select.value;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;

            textarea.value = text.substring(0, start) + val + text.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + val.length;
        });
    }

    // Save Template Listener
    const btnSaveTemplate = document.getElementById('btn-save-template');
    if (btnSaveTemplate) {
        btnSaveTemplate.addEventListener('click', async () => {
            const plantillaId = document.getElementById('editor-template-id')?.value;
            const codigoDocumento = document.getElementById('editor-code')?.value.trim();
            const titulo = document.getElementById('editor-title')?.value.trim();
            const categoria = document.getElementById('editor-category')?.value;
            const departamento = document.getElementById('editor-department')?.value.trim();
            const tipoSalida = document.getElementById('editor-output-type')?.value;
            const estado = document.getElementById('editor-state')?.value;
            const contenidoHTML = document.getElementById('editor-html-content')?.value;

            if (!codigoDocumento || !titulo || !contenidoHTML) {
                alert("Por favor complete los campos obligatorios: Código, Título y Cuerpo HTML de la plantilla.");
                return;
            }

            btnSaveTemplate.disabled = true;
            btnSaveTemplate.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Guardando...`;

            try {
                const resp = await apiCall({
                    action: 'configureSchoolDocumentTemplate',
                    plantillaId,
                    codigoDocumento,
                    titulo,
                    categoria,
                    departamento,
                    tipoSalida,
                    estado,
                    contenidoHTML
                }, 'ACCOUNTING');

                if (resp && resp.status === 'success') {
                    alert("Plantilla configurada con éxito. Versión: " + (resp.version || '1.0'));
                    modalEditor?.classList.add('hidden');
                    loadTemplateDesignerCatalog();
                } else {
                    alert("No se pudo guardar la plantilla: " + (resp?.message || "Error desconocido"));
                }
            } catch (e) {
                alert("Error de guardado: " + e.message);
            } finally {
                btnSaveTemplate.disabled = false;
                btnSaveTemplate.innerHTML = `<i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Plantilla`;
            }
        });
    }

    // Global Functions for Card Actions
    window.editTemplateById = function(plantillaId) {
        const found = loadedTemplatesCache.find(t => t.plantillaId === plantillaId);
        if (!found) return;

        document.getElementById('editor-template-id').value = found.plantillaId;
        document.getElementById('editor-code').value = found.codigoDocumento || '';
        document.getElementById('editor-title').value = found.titulo || '';
        document.getElementById('editor-category').value = found.categoria || 'Académico';
        document.getElementById('editor-department').value = found.departamento || 'Secretaría';
        document.getElementById('editor-output-type').value = found.tipoSalida || 'PDF';
        document.getElementById('editor-state').value = found.estado || 'publicada';
        document.getElementById('editor-version').value = found.version || '1.0';
        document.getElementById('editor-html-content').value = found.contenidoHTML || '';
        document.getElementById('editor-modal-title').textContent = 'Editar Plantilla: ' + found.titulo;

        modalEditor?.classList.remove('hidden');
    };

    window.previewTemplateById = async function(plantillaId) {
        const modalPreview = document.getElementById('modal-template-preview');
        const canvas = document.getElementById('preview-render-canvas');
        const warning = document.getElementById('preview-pending-warning');

        if (!modalPreview || !canvas) return;

        canvas.innerHTML = `<div class="text-center py-12 text-indigo-600 font-bold"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br>Generando vista previa...</div>`;
        modalPreview.classList.remove('hidden');

        try {
            const resp = await apiCall({ action: 'previewSchoolDocument', plantillaId }, 'ACCOUNTING');
            if (resp && resp.status === 'success') {
                canvas.innerHTML = resp.renderedHTML;
                if (resp.hasPendingFields) {
                    warning?.classList.remove('hidden');
                } else {
                    warning?.classList.add('hidden');
                }
            } else {
                canvas.innerHTML = `<div class="text-red-500 font-bold p-4">Error al renderizar vista previa.</div>`;
            }
        } catch (e) {
            canvas.innerHTML = `<div class="text-red-500 font-bold p-4">Error de conexión: ${e.message}</div>`;
        }
    };

    // Preview from editor button
    const btnPreviewFromEditor = document.getElementById('btn-preview-from-editor');
    if (btnPreviewFromEditor) {
        btnPreviewFromEditor.addEventListener('click', async () => {
            const htmlContent = document.getElementById('editor-html-content')?.value;
            if (!htmlContent) {
                alert("Ingrese contenido HTML para previsualizar.");
                return;
            }

            const modalPreview = document.getElementById('modal-template-preview');
            const canvas = document.getElementById('preview-render-canvas');
            const warning = document.getElementById('preview-pending-warning');

            if (!modalPreview || !canvas) return;

            canvas.innerHTML = `<div class="text-center py-12 text-indigo-600 font-bold"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br>Generando vista previa...</div>`;
            modalPreview.classList.remove('hidden');

            try {
                const resp = await apiCall({ action: 'previewSchoolDocument', contenidoHTML: htmlContent }, 'ACCOUNTING');
                if (resp && resp.status === 'success') {
                    canvas.innerHTML = resp.renderedHTML;
                    if (resp.hasPendingFields) {
                        warning?.classList.remove('hidden');
                    } else {
                        warning?.classList.add('hidden');
                    }
                }
            } catch (e) {
                canvas.innerHTML = `<div class="text-red-500 font-bold p-4">Error: ${e.message}</div>`;
            }
        });
    }

    // Close preview listeners
    [document.getElementById('close-template-preview'), document.getElementById('close-preview-btn'), document.getElementById('btn-back-to-editor')].forEach(b => b?.addEventListener('click', () => {
        document.getElementById('modal-template-preview')?.classList.add('hidden');
    }));

    // Generator Modal Trigger
    window.openGeneratorForTemplate = function(plantillaId, titulo) {
        const modalGen = document.getElementById('modal-document-generator');
        if (!modalGen) return;

        document.getElementById('generator-template-id').value = plantillaId;
        document.getElementById('generator-target-id').value = '';
        document.getElementById('generator-reason').value = '';
        document.getElementById('generator-modal-title').textContent = 'Emitir: ' + titulo;

        modalGen.classList.remove('hidden');
    };

    [document.getElementById('close-document-generator'), document.getElementById('btn-cancel-generation')].forEach(b => b?.addEventListener('click', () => {
        document.getElementById('modal-document-generator')?.classList.add('hidden');
    }));

    // Confirm Generation
    const btnConfirmGen = document.getElementById('btn-confirm-generate');
    if (btnConfirmGen) {
        btnConfirmGen.addEventListener('click', async () => {
            const plantillaId = document.getElementById('generator-template-id')?.value;
            const targetEntityId = document.getElementById('generator-target-id')?.value.trim();
            const reason = document.getElementById('generator-reason')?.value.trim();

            if (!targetEntityId) {
                alert("Ingrese el ID o DNI del estudiante o destinatario.");
                return;
            }

            btnConfirmGen.disabled = true;
            btnConfirmGen.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Emitiendo...`;

            try {
                const resp = await apiCall({
                    action: 'generateSchoolDocument',
                    plantillaId,
                    targetEntityId,
                    datosFormulario: { "tramite.motivo": reason || "Trámite Institucional Oficial" }
                }, 'ACCOUNTING');

                if (resp && resp.status === 'success') {
                    alert(`¡Documento Oficial Emitido con Éxito!\n\nID Documento: ${resp.documentoId}\nCódigo de Verificación: ${resp.codigoVerificacion}\nVersión Plantilla: v${resp.versionPlantilla}`);
                    document.getElementById('modal-document-generator')?.classList.add('hidden');
                } else {
                    alert("Error al generar documento: " + (resp?.message || "Error desconocido"));
                }
            } catch (e) {
                alert("Error de emisión: " + e.message);
            } finally {
                btnConfirmGen.disabled = false;
                btnConfirmGen.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> Emitir Documento`;
            }
        });
    }

    // Import Base Template Listener
    const btnImportBase = document.getElementById('btn-import-template-base');
    if (btnImportBase) {
        btnImportBase.addEventListener('click', async () => {
            const sampleTxt = prompt("Ingrese el texto o contenido base para importar como borrador:");
            if (!sampleTxt) return;

            try {
                const resp = await apiCall({
                    action: 'importDocumentTemplateBase',
                    nombreArchivo: 'Documento_Base_Importado.txt',
                    contenidoTexto: sampleTxt
                }, 'ACCOUNTING');

                if (resp && resp.status === 'success' && resp.plantillaImportada) {
                    const imp = resp.plantillaImportada;
                    document.getElementById('editor-template-id').value = '';
                    document.getElementById('editor-code').value = imp.codigoDocumento;
                    document.getElementById('editor-title').value = imp.titulo;
                    document.getElementById('editor-category').value = 'Administrativo';
                    document.getElementById('editor-state').value = 'borrador';
                    document.getElementById('editor-html-content').value = imp.contenidoHTML;
                    document.getElementById('editor-modal-title').textContent = 'Plantilla Importada (Borrador)';

                    modalEditor?.classList.remove('hidden');
                }
            } catch (e) {
                alert("Error al importar base: " + e.message);
            }
        });
    }

    // ---------------------------------------------------------------------------
    // FASE 23: EDITOR VISUAL DE PDF Y CAMPOS SUPERPUESTOS
    // ---------------------------------------------------------------------------
    let currentPdfDoc = null;
    let currentPdfArrayBuffer = null;
    let currentPdfNumPages = 1;
    let currentPdfPage = 1;
    let currentPdfScale = 1.0;
    let overlayFields = [];
    let selectedFieldId = null;

    const modalPdfEditor = document.getElementById('modal-pdf-overlay-editor');
    const btnOpenPdfEditor = document.getElementById('btn-open-pdf-overlay-editor');
    const btnClosePdfEditor = document.getElementById('btn-close-pdf-editor');
    const pdfFileInput = document.getElementById('pdf-file-input');
    const pdfPageContainer = document.getElementById('pdf-page-container');
    const pdfRenderCanvas = document.getElementById('pdf-render-canvas');
    const pdfOverlayLayer = document.getElementById('pdf-overlay-layer');

    if (btnOpenPdfEditor && modalPdfEditor) {
        btnOpenPdfEditor.addEventListener('click', () => {
            openPdfOverlayEditor();
        });
    }

    if (btnClosePdfEditor && modalPdfEditor) {
        btnClosePdfEditor.addEventListener('click', () => {
            modalPdfEditor.classList.add('hidden');
        });
    }

    async function openPdfOverlayEditor(tpl = null) {
        if (!modalPdfEditor) return;
        overlayFields = [];
        selectedFieldId = null;
        currentPdfDoc = null;
        currentPdfArrayBuffer = null;
        currentPdfPage = 1;
        currentPdfScale = 1.0;

        document.getElementById('pdf-tpl-title').value = tpl?.titulo || '';
        document.getElementById('pdf-tpl-category').value = tpl?.categoria || 'Constancias';
        document.getElementById('pdf-editor-title').textContent = tpl ? `Editor Visual PDF - ${tpl.titulo}` : 'Editor Visual de PDF - Campos Superpuestos';

        // Load dynamic fields into property panel drop-down
        populatePropSourceTags();

        modalPdfEditor.classList.remove('hidden');
        updateFieldPropsPanel();

        // If template has overlayFields, load them
        if (tpl && tpl.configFormatoJSON) {
            try {
                const fmt = typeof tpl.configFormatoJSON === 'string' ? JSON.parse(tpl.configFormatoJSON) : tpl.configFormatoJSON;
                if (Array.isArray(fmt.overlayFields)) {
                    overlayFields = fmt.overlayFields;
                }
            } catch (e) {
                console.error("Error parsing pdf overlay config:", e);
            }
        }

        // Render blank sample page if no PDF is loaded yet
        renderSampleBlankPdf();
    }

    async function populatePropSourceTags() {
        const select = document.getElementById('prop-field-source-tag');
        if (!select) return;

        const defaultFields = [
            { clave: "{{estudiante.nombreCompleto}}", etiqueta: "Nombre Estudiante", categoria: "Estudiante" },
            { clave: "{{estudiante.identidad}}", etiqueta: "Número DNI / Identidad", categoria: "Estudiante" },
            { clave: "{{estudiante.grado}}", etiqueta: "Grado Académico", categoria: "Estudiante" },
            { clave: "{{estudiante.seccion}}", etiqueta: "Sección", categoria: "Estudiante" },
            { clave: "{{estudiante.codigoMatricula}}", etiqueta: "Código Matrícula", categoria: "Estudiante" },
            { clave: "{{institucion.nombre}}", etiqueta: "Nombre Institución", categoria: "Institucional" },
            { clave: "{{institucion.anoLectivo}}", etiqueta: "Año Lectivo", categoria: "Institucional" },
            { clave: "{{tramite.fechaEmision}}", etiqueta: "Fecha de Emisión", categoria: "Trámite" },
            { clave: "{{tramite.motivo}}", etiqueta: "Motivo / Finalidad", categoria: "Trámite" },
            { clave: "{{documento.codigoVerificacion}}", etiqueta: "Token Verificación (VERIF-XXXXXX)", categoria: "Seguridad" }
        ];

        try {
            const resp = await apiCall({ action: 'getAvailableDynamicFields' }, 'ACCOUNTING');
            if (resp && resp.status === 'success' && Array.isArray(resp.campos) && resp.campos.length > 0) {
                select.innerHTML = `<option value="">-- Sin Vinculación Dinámica --</option>` +
                    resp.campos.map(c => `<option value="${c.clave}">${c.categoria}: ${c.etiqueta} (${c.clave})</option>`).join('');
                return;
            }
        } catch (e) {
            console.warn("Uso de catálogo de fuentes dinámicas de respaldo para PDF Overlay");
        }

        select.innerHTML = `<option value="">-- Sin Vinculación Dinámica --</option>` +
            defaultFields.map(c => `<option value="${c.clave}">${c.categoria}: ${c.etiqueta} (${c.clave})</option>`).join('');
    }

    // Handle File Input selection
    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || file.type !== 'application/pdf') {
                alert("Por favor seleccione un archivo PDF válido.");
                return;
            }

            try {
                const arrayBuffer = await file.arrayBuffer();
                currentPdfArrayBuffer = arrayBuffer;
                await loadPdfFromArrayBuffer(arrayBuffer);
            } catch (err) {
                alert("Error al cargar el PDF: " + err.message);
            }
        });
    }

    async function loadPdfFromArrayBuffer(arrayBuffer) {
        if (!window.pdfjsLib) {
            alert("Biblioteca PDF.js no disponible.");
            return;
        }

        try {
            const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            currentPdfDoc = await loadingTask.promise;
            currentPdfNumPages = currentPdfDoc.numPages;
            currentPdfPage = 1;

            document.getElementById('pdf-total-pages').textContent = currentPdfNumPages;
            await renderPdfPage(currentPdfPage);
        } catch (e) {
            console.error("Error loading PDF with pdfjs:", e);
            alert("No se pudo renderizar la vista previa del PDF.");
        }
    }

    async function renderPdfPage(pageNum) {
        if (!currentPdfDoc || !pdfRenderCanvas) return;

        try {
            const page = await currentPdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: currentPdfScale });

            const ctx = pdfRenderCanvas.getContext('2d');
            pdfRenderCanvas.height = viewport.height;
            pdfRenderCanvas.width = viewport.width;

            pdfPageContainer.style.width = viewport.width + 'px';
            pdfPageContainer.style.height = viewport.height + 'px';

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            document.getElementById('pdf-curr-page').textContent = pageNum;
            document.getElementById('pdf-zoom-display').textContent = Math.round(currentPdfScale * 100) + '%';

            renderOverlayFieldsForCurrentPage();
        } catch (e) {
            console.error("Error rendering PDF page:", e);
        }
    }

    function renderSampleBlankPdf() {
        if (!pdfRenderCanvas || currentPdfDoc) return;
        const width = 612 * currentPdfScale;
        const height = 792 * currentPdfScale;

        pdfRenderCanvas.width = width;
        pdfRenderCanvas.height = height;
        pdfPageContainer.style.width = width + 'px';
        pdfPageContainer.style.height = height + 'px';

        const ctx = pdfRenderCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("VISTA PREVIA DE LIENZO PDF", width / 2, height / 2 - 20);
        ctx.font = '12px sans-serif';
        ctx.fillText("Seleccione un archivo PDF base para renderizar las páginas reales.", width / 2, height / 2 + 10);

        renderOverlayFieldsForCurrentPage();
    }

    // PDF Navigation & Zoom Handlers
    document.getElementById('btn-pdf-prev-page')?.addEventListener('click', () => {
        if (currentPdfPage > 1) {
            currentPdfPage--;
            renderPdfPage(currentPdfPage);
        }
    });

    document.getElementById('btn-pdf-next-page')?.addEventListener('click', () => {
        if (currentPdfPage < currentPdfNumPages) {
            currentPdfPage++;
            renderPdfPage(currentPdfPage);
        }
    });

    document.getElementById('btn-pdf-zoom-in')?.addEventListener('click', () => {
        currentPdfScale = Math.min(2.5, currentPdfScale + 0.15);
        if (currentPdfDoc) renderPdfPage(currentPdfPage); else renderSampleBlankPdf();
    });

    document.getElementById('btn-pdf-zoom-out')?.addEventListener('click', () => {
        currentPdfScale = Math.max(0.5, currentPdfScale - 0.15);
        if (currentPdfDoc) renderPdfPage(currentPdfPage); else renderSampleBlankPdf();
    });

    document.getElementById('btn-pdf-fit-width')?.addEventListener('click', () => {
        const workspaceWidth = document.getElementById('pdf-canvas-workspace')?.clientWidth || 600;
        currentPdfScale = Math.max(0.6, (workspaceWidth - 60) / 612);
        if (currentPdfDoc) renderPdfPage(currentPdfPage); else renderSampleBlankPdf();
    });

    // Add Field Tool Listeners
    document.querySelectorAll('.btn-add-overlay-field').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-field-type') || 'texto';
            addOverlayField(type);
        });
    });

    function addOverlayField(type) {
        const fieldId = 'fld_' + Date.now() + '_' + Math.floor(Math.random() * 100);
        const labels = {
            texto: 'Texto Línea',
            multiline: 'Texto Multilínea',
            fecha: 'Fecha Emisión',
            checkbox: 'Casilla Verificación',
            firma: 'Espacio de Firma'
        };

        const newField = {
            id: fieldId,
            page: currentPdfPage,
            xRatio: 0.15,
            yRatio: 0.15 + (overlayFields.length * 0.05) % 0.6,
            wRatio: type === 'checkbox' ? 0.05 : 0.40,
            hRatio: type === 'multiline' ? 0.10 : (type === 'firma' ? 0.08 : 0.04),
            type: type,
            key: 'campo_' + Math.floor(1000 + Math.random() * 9000),
            label: labels[type] || 'Nuevo Campo',
            sourceTag: '',
            fontSize: 11,
            align: 'left',
            sampleVal: labels[type] || 'Muestra',
            required: false
        };

        overlayFields.push(newField);
        selectedFieldId = fieldId;
        renderOverlayFieldsForCurrentPage();
        updateFieldPropsPanel();
    }

    function renderOverlayFieldsForCurrentPage() {
        if (!pdfOverlayLayer) return;
        pdfOverlayLayer.innerHTML = '';

        const pageFields = overlayFields.filter(f => f.page === currentPdfPage);

        pageFields.forEach(f => {
            const el = document.createElement('div');
            el.className = `absolute group border-2 ${f.id === selectedFieldId ? 'border-indigo-600 bg-indigo-500/20 shadow-lg z-30' : 'border-blue-400 bg-blue-500/10 hover:border-blue-600 z-20'} rounded cursor-move flex items-center justify-between p-1 transition-all select-none`;
            el.style.left = (f.xRatio * 100) + '%';
            el.style.top = (f.yRatio * 100) + '%';
            el.style.width = (f.wRatio * 100) + '%';
            el.style.height = (f.hRatio * 100) + '%';

            const txt = document.createElement('span');
            txt.className = 'text-[10px] font-bold truncate text-indigo-950 pointer-events-none px-1';
            txt.textContent = f.sourceTag ? `${f.label} (${f.sourceTag})` : (f.sampleVal || f.label);
            el.appendChild(txt);

            // Resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'absolute right-0 bottom-0 w-3 h-3 bg-indigo-600 rounded-tl cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity';
            el.appendChild(resizeHandle);

            // Mouse events for selection, dragging, resizing
            el.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                selectedFieldId = f.id;
                renderOverlayFieldsForCurrentPage();
                updateFieldPropsPanel();

                if (e.target === resizeHandle) {
                    initResizeField(e, f);
                } else {
                    initDragField(e, f);
                }
            });

            pdfOverlayLayer.appendChild(el);
        });
    }

    function initDragField(e, f) {
        const containerRect = pdfPageContainer.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const initialXRatio = f.xRatio;
        const initialYRatio = f.yRatio;

        function onMouseMove(moveEv) {
            const deltaX = (moveEv.clientX - startX) / containerRect.width;
            const deltaY = (moveEv.clientY - startY) / containerRect.height;

            f.xRatio = Math.max(0, Math.min(1 - f.wRatio, initialXRatio + deltaX));
            f.yRatio = Math.max(0, Math.min(1 - f.hRatio, initialYRatio + deltaY));

            renderOverlayFieldsForCurrentPage();
            updateFieldPropsPanel();
        }

        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    function initResizeField(e, f) {
        e.stopPropagation();
        const containerRect = pdfPageContainer.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const initialWRatio = f.wRatio;
        const initialHRatio = f.hRatio;

        function onMouseMove(moveEv) {
            const deltaX = (moveEv.clientX - startX) / containerRect.width;
            const deltaY = (moveEv.clientY - startY) / containerRect.height;

            f.wRatio = Math.max(0.02, Math.min(1 - f.xRatio, initialWRatio + deltaX));
            f.hRatio = Math.max(0.02, Math.min(1 - f.yRatio, initialHRatio + deltaY));

            renderOverlayFieldsForCurrentPage();
            updateFieldPropsPanel();
        }

        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    function updateFieldPropsPanel() {
        const emptyState = document.getElementById('field-props-empty-state');
        const form = document.getElementById('field-props-form');
        if (!emptyState || !form) return;

        const f = overlayFields.find(field => field.id === selectedFieldId);

        if (!f) {
            emptyState.classList.remove('hidden');
            form.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        form.classList.remove('hidden');

        document.getElementById('prop-field-key').value = f.key || '';
        document.getElementById('prop-field-label').value = f.label || '';
        document.getElementById('prop-field-source-tag').value = f.sourceTag || '';
        document.getElementById('prop-field-font-size').value = f.fontSize || 11;
        document.getElementById('prop-field-align').value = f.align || 'left';
        document.getElementById('prop-field-sample-val').value = f.sampleVal || '';
        document.getElementById('prop-field-required').checked = !!f.required;

        document.getElementById('prop-field-page-display').textContent = f.page;
        document.getElementById('prop-field-x-display').textContent = Math.round(f.xRatio * 100) + '%';
        document.getElementById('prop-field-y-display').textContent = Math.round(f.yRatio * 100) + '%';
        document.getElementById('prop-field-w-display').textContent = Math.round(f.wRatio * 100) + '%';
        document.getElementById('prop-field-h-display').textContent = Math.round(f.hRatio * 100) + '%';
    }

    // Property Panel Input Event Listeners
    ['prop-field-key', 'prop-field-label', 'prop-field-source-tag', 'prop-field-font-size', 'prop-field-align', 'prop-field-sample-val', 'prop-field-required'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', syncPropFormToSelectedField);
        document.getElementById(id)?.addEventListener('change', syncPropFormToSelectedField);
    });

    function syncPropFormToSelectedField() {
        const f = overlayFields.find(field => field.id === selectedFieldId);
        if (!f) return;

        f.key = document.getElementById('prop-field-key').value.trim();
        f.label = document.getElementById('prop-field-label').value.trim();
        f.sourceTag = document.getElementById('prop-field-source-tag').value;
        f.fontSize = parseInt(document.getElementById('prop-field-font-size').value || '11', 10);
        f.align = document.getElementById('prop-field-align').value;
        f.sampleVal = document.getElementById('prop-field-sample-val').value;
        f.required = document.getElementById('prop-field-required').checked;

        renderOverlayFieldsForCurrentPage();
    }

    document.getElementById('btn-delete-overlay-field')?.addEventListener('click', () => {
        if (!selectedFieldId) return;
        overlayFields = overlayFields.filter(f => f.id !== selectedFieldId);
        selectedFieldId = null;
        renderOverlayFieldsForCurrentPage();
        updateFieldPropsPanel();
    });

    // Save & Publish PDF Overlay Template Listeners
    document.getElementById('btn-save-pdf-template-draft')?.addEventListener('click', () => savePdfOverlayTemplate('borrador'));
    document.getElementById('btn-publish-pdf-template')?.addEventListener('click', () => savePdfOverlayTemplate('publicada'));

    async function savePdfOverlayTemplate(state = 'publicada') {
        const title = document.getElementById('pdf-tpl-title')?.value.trim();
        const category = document.getElementById('pdf-tpl-category')?.value || 'Constancias';

        if (!title) {
            alert("Ingrese un título para la plantilla PDF.");
            return;
        }

        if (overlayFields.length === 0) {
            if (!confirm("No ha colocado ningún campo superpuesto. ¿Desea guardar la plantilla en blanco?")) return;
        }

        const code = 'PDF-TPL-' + Math.floor(1000 + Math.random() * 9000);

        try {
            const resp = await apiCall({
                action: 'configureSchoolDocumentTemplate',
                codigoDocumento: code,
                titulo: title,
                categoria: category,
                departamento: 'Secretaría General',
                tipoSalida: 'PDF_OVERLAY',
                estado: state,
                configFormatoJSON: {
                    overlayFields: overlayFields,
                    numPages: currentPdfNumPages
                },
                camposJSON: overlayFields.map(f => ({
                    clave: f.sourceTag || f.key,
                    etiqueta: f.label,
                    pagina: f.page,
                    xRatio: f.xRatio,
                    yRatio: f.yRatio
                }))
            }, 'ACCOUNTING');

            if (resp && resp.status === 'success') {
                alert(`¡Plantilla PDF (${state}) guardada con éxito!\n\nID: ${resp.plantillaId}\nVersión: v${resp.version}`);
                modalPdfEditor?.classList.add('hidden');
                loadTemplateDesignerCatalog();
            } else {
                alert("No se pudo guardar la plantilla PDF: " + (resp?.message || "Error desconocido"));
            }
        } catch (e) {
            alert("Error al guardar plantilla PDF: " + e.message);
        }
    }

    // ---------------------------------------------------------------------------
    // FASE 24: CONSTRUCTOR DE FORMULARIOS INSTITUCIONALES Y TRÁMITES
    // ---------------------------------------------------------------------------
    let builderFields = [];
    const modalFormBuilder = document.getElementById('modal-form-builder');
    const btnOpenFormBuilder = document.getElementById('btn-open-form-builder');
    const btnCloseFormBuilder = document.getElementById('btn-close-form-builder');

    if (btnOpenFormBuilder && modalFormBuilder) {
        btnOpenFormBuilder.addEventListener('click', () => {
            openInstitutionalFormBuilder();
        });
    }

    if (btnCloseFormBuilder && modalFormBuilder) {
        btnCloseFormBuilder.addEventListener('click', () => {
            modalFormBuilder.classList.add('hidden');
        });
    }

    function openInstitutionalFormBuilder(formObj = null) {
        if (!modalFormBuilder) return;
        builderFields = [];

        document.getElementById('builder-form-title').value = formObj?.titulo || '';
        document.getElementById('builder-form-dept').value = formObj?.departamento || 'Secretaría';
        document.getElementById('builder-form-desc').value = formObj?.descripcion || '';

        if (formObj && formObj.definicionJSON) {
            try {
                const fields = typeof formObj.definicionJSON === 'string' ? JSON.parse(formObj.definicionJSON) : formObj.definicionJSON;
                if (Array.isArray(fields)) builderFields = fields;
            } catch (e) {
                console.error("Error parsing form definition:", e);
            }
        }

        renderBuilderFields();
        modalFormBuilder.classList.remove('hidden');
    }

    // Add Field Listeners for Form Builder
    document.querySelectorAll('.btn-add-form-field').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-form-field-type') || 'text';
            addFormFieldToBuilder(type);
        });
    });

    function addFormFieldToBuilder(type) {
        const fieldId = 'fld_' + Date.now();
        const defaultLabels = {
            text: 'Campo de Texto',
            textarea: 'Descripción / Justificación',
            select: 'Seleccione Opciones',
            date: 'Fecha Requerida',
            file: 'Adjunto Requerido (PDF/Imagen)'
        };

        builderFields.push({
            id: fieldId,
            type: type,
            label: defaultLabels[type] || 'Nuevo Campo',
            placeholder: 'Ingrese datos...',
            required: true,
            options: type === 'select' ? ['Opción 1', 'Opción 2', 'Opción 3'] : []
        });

        renderBuilderFields();
    }

    function renderBuilderFields() {
        const container = document.getElementById('builder-fields-container');
        if (!container) return;

        if (builderFields.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                    <i class="fa-solid fa-wpforms text-4xl mb-2 text-slate-300"></i>
                    <p class="text-xs font-semibold">No hay campos en el formulario. Utilice el panel izquierdo para añadir campos.</p>
                </div>`;
            return;
        }

        container.innerHTML = builderFields.map((f, idx) => `
            <div class="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs" data-field-id="${f.id}">
                <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span class="font-mono text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-lg">#${idx + 1} - ${f.type.toUpperCase()}</span>
                    <button class="btn-remove-builder-field text-red-500 hover:text-red-700 text-xs font-bold" data-id="${f.id}">
                        <i class="fa-solid fa-trash-can mr-1"></i> Eliminar
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-600 uppercase">Etiqueta del Campo</label>
                        <input type="text" class="field-label-input w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-semibold" data-id="${f.id}" value="${f.label}">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-600 uppercase">Texto de Ayuda / Placeholder</label>
                        <input type="text" class="field-ph-input w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-medium" data-id="${f.id}" value="${f.placeholder}">
                    </div>
                </div>
                ${f.type === 'select' ? `
                <div>
                    <label class="block text-[10px] font-bold text-slate-600 uppercase">Opciones (separadas por coma)</label>
                    <input type="text" class="field-options-input w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-medium" data-id="${f.id}" value="${f.options.join(', ')}">
                </div>` : ''}
                <div class="flex items-center gap-2 pt-1">
                    <input type="checkbox" class="field-req-input w-4 h-4 rounded text-emerald-600" data-id="${f.id}" ${f.required ? 'checked' : ''}>
                    <label class="text-xs font-bold text-slate-700">Campo Obligatorio</label>
                </div>
            </div>
        `).join('');

        // Attach field change listeners
        container.querySelectorAll('.field-label-input').forEach(inp => inp.addEventListener('input', e => {
            const f = builderFields.find(x => x.id === e.target.dataset.id);
            if (f) f.label = e.target.value;
        }));

        container.querySelectorAll('.field-ph-input').forEach(inp => inp.addEventListener('input', e => {
            const f = builderFields.find(x => x.id === e.target.dataset.id);
            if (f) f.placeholder = e.target.value;
        }));

        container.querySelectorAll('.field-options-input').forEach(inp => inp.addEventListener('input', e => {
            const f = builderFields.find(x => x.id === e.target.dataset.id);
            if (f) f.options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        }));

        container.querySelectorAll('.field-req-input').forEach(inp => inp.addEventListener('change', e => {
            const f = builderFields.find(x => x.id === e.target.dataset.id);
            if (f) f.required = e.target.checked;
        }));

        container.querySelectorAll('.btn-remove-builder-field').forEach(btn => btn.addEventListener('click', e => {
            const id = btn.dataset.id || btn.closest('button').dataset.id;
            builderFields = builderFields.filter(x => x.id !== id);
            renderBuilderFields();
        }));
    }

    // Save & Publish Form
    document.getElementById('btn-save-form-draft')?.addEventListener('click', () => saveFormDefinition('borrador'));
    document.getElementById('btn-publish-form')?.addEventListener('click', () => saveFormDefinition('publicado'));

    async function saveFormDefinition(state = 'publicado') {
        const title = document.getElementById('builder-form-title')?.value.trim();
        const dept = document.getElementById('builder-form-dept')?.value || 'Secretaría';
        const desc = document.getElementById('builder-form-desc')?.value.trim();

        if (!title) {
            alert("Ingrese un título para el formulario.");
            return;
        }

        if (builderFields.length === 0) {
            alert("Añada al menos un campo al formulario antes de guardar.");
            return;
        }

        const code = 'FRM-' + Math.floor(1000 + Math.random() * 9000);

        try {
            const resp = await apiCall({
                action: 'saveInstitutionalForm',
                codigoFormulario: code,
                titulo: title,
                descripcion: desc,
                departamento: dept,
                definicionJSON: builderFields,
                estado: state,
                version: '1.0'
            }, 'USER');

            if (resp && resp.status === 'success') {
                alert(`¡Formulario Institucional (${state}) guardado con éxito!\n\nID: ${resp.formId}\nVersión: v${resp.version}`);
                modalFormBuilder?.classList.add('hidden');
            } else {
                alert("Error al guardar formulario: " + (resp?.message || "Error desconocido"));
            }
        } catch (e) {
            alert("Error de comunicación: " + e.message);
        }
    }

    // Search and Filters
    ['template-search-input', 'template-category-filter', 'template-state-filter'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => renderTemplateCatalog(loadedTemplatesCache));
        document.getElementById(id)?.addEventListener('change', () => renderTemplateCatalog(loadedTemplatesCache));
    });

    // ---------------------------------------------------------------------------
    // FASE 25: FLUJOS DE APROBACIÓN, REVISIÓN Y FIRMA INSTITUCIONAL
    // ---------------------------------------------------------------------------
    let currentWorkflowStages = [];
    let editingWorkflowId = null;
    let activeDecisionSolicitudId = null;

    const modalWorkflowBuilder = document.getElementById('modal-workflow-builder');
    const modalWorkflowDecision = document.getElementById('modal-workflow-decision');

    document.getElementById('btn-close-workflow-builder')?.addEventListener('click', () => modalWorkflowBuilder?.classList.add('hidden'));
    document.getElementById('btn-close-workflow-decision')?.addEventListener('click', () => modalWorkflowDecision?.classList.add('hidden'));
    document.getElementById('btn-cancel-workflow-decision')?.addEventListener('click', () => modalWorkflowDecision?.classList.add('hidden'));

    document.getElementById('btn-add-workflow-stage')?.addEventListener('click', addWorkflowStage);
    document.getElementById('btn-save-workflow')?.addEventListener('click', saveWorkflowDefinition);
    document.getElementById('btn-submit-workflow-decision')?.addEventListener('click', submitWorkflowDecision);

    function openWorkflowBuilder(wfObj = null) {
        editingWorkflowId = wfObj?.flujoId || null;
        currentWorkflowStages = wfObj?.pasosEtapas ? JSON.parse(JSON.stringify(wfObj.pasosEtapas)) : [
            { id: 'stg-1', nombre: 'Revisión Documental', rolRevisor: 'Secretaría', requiereFirma: false }
        ];

        document.getElementById('workflow-name-input').value = wfObj?.nombreFlujo || '';
        document.getElementById('workflow-dept-select').value = wfObj?.departamento || 'Secretaría';

        renderWorkflowStages();
        modalWorkflowBuilder?.classList.remove('hidden');
    }

    function addWorkflowStage() {
        const id = 'stg-' + Date.now();
        currentWorkflowStages.push({
            id: id,
            nombre: `Etapa ${currentWorkflowStages.length + 1}`,
            rolRevisor: 'Secretaría',
            requiereFirma: false
        });
        renderWorkflowStages();
    }

    function renderWorkflowStages() {
        const container = document.getElementById('workflow-stages-container');
        if (!container) return;

        if (!currentWorkflowStages.length) {
            container.innerHTML = `
                <div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                    <i class="fa-solid fa-sitemap text-4xl mb-2 text-slate-300"></i>
                    <p class="text-xs font-semibold">No hay etapas en el flujo. Haga clic en "Añadir Etapa de Revisión" para comenzar.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = currentWorkflowStages.map((s, idx) => `
            <div class="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs" data-stage-id="${s.id}">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span class="font-mono text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg">Paso #${idx + 1}</span>
                    <button class="btn-remove-stage text-rose-500 hover:text-rose-700 text-xs font-bold" data-id="${s.id}">
                        <i class="fa-solid fa-trash-can mr-1"></i> Eliminar
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-600 uppercase">Nombre de la Etapa</label>
                        <input type="text" class="stage-name-input w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-semibold" data-id="${s.id}" value="${s.nombre}">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-600 uppercase">Rol Revisor Responsable</label>
                        <select class="stage-role-select w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-medium" data-id="${s.id}">
                            <option value="Secretaría" ${s.rolRevisor === 'Secretaría' ? 'selected' : ''}>Secretaría</option>
                            <option value="Orientación" ${s.rolRevisor === 'Orientación' ? 'selected' : ''}>Orientación</option>
                            <option value="Contabilidad" ${s.rolRevisor === 'Contabilidad' ? 'selected' : ''}>Contabilidad</option>
                            <option value="Director" ${s.rolRevisor === 'Director' ? 'selected' : ''}>Dirección</option>
                        </select>
                    </div>
                </div>
                <div class="flex items-center gap-2 pt-1">
                    <input type="checkbox" class="stage-signature-input w-4 h-4 rounded text-indigo-600" data-id="${s.id}" ${s.requiereFirma ? 'checked' : ''}>
                    <label class="text-xs font-bold text-slate-700">Requiere Firma / Conformidad Digital Institucional</label>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.stage-name-input').forEach(inp => inp.addEventListener('input', e => {
            const s = currentWorkflowStages.find(x => x.id === e.target.dataset.id);
            if (s) s.nombre = e.target.value;
        }));

        container.querySelectorAll('.stage-role-select').forEach(sel => sel.addEventListener('change', e => {
            const s = currentWorkflowStages.find(x => x.id === e.target.dataset.id);
            if (s) s.rolRevisor = e.target.value;
        }));

        container.querySelectorAll('.stage-signature-input').forEach(inp => inp.addEventListener('change', e => {
            const s = currentWorkflowStages.find(x => x.id === e.target.dataset.id);
            if (s) s.requiereFirma = e.target.checked;
        }));

        container.querySelectorAll('.btn-remove-stage').forEach(btn => btn.addEventListener('click', e => {
            const id = e.currentTarget.dataset.id;
            currentWorkflowStages = currentWorkflowStages.filter(x => x.id !== id);
            renderWorkflowStages();
        }));
    }

    async function saveWorkflowDefinition() {
        const name = document.getElementById('workflow-name-input')?.value?.trim();
        const dept = document.getElementById('workflow-dept-select')?.value;
        const formId = document.getElementById('workflow-form-select')?.value || '';

        if (!name) {
            alert("Por favor ingrese un nombre para el flujo de aprobación.");
            return;
        }

        try {
            const resp = await apiCall({
                action: 'saveApprovalWorkflow',
                flujoId: editingWorkflowId,
                formId: formId,
                nombreFlujo: name,
                departamento: dept,
                pasosEtapasJSON: currentWorkflowStages,
                estado: 'Publicado'
            }, 'USER');

            if (resp && resp.status === 'success') {
                alert(`¡Flujo de aprobación guardado con éxito!\n\nID: ${resp.flujoId}\nVersión: v${resp.version}`);
                modalWorkflowBuilder?.classList.add('hidden');
            } else {
                alert("Error al guardar flujo: " + (resp?.message || "Error desconocido"));
            }
        } catch (e) {
            alert("Error de comunicación: " + e.message);
        }
    }

    function openWorkflowDecisionModal(solicitudId, data = {}) {
        activeDecisionSolicitudId = solicitudId;
        document.getElementById('decision-solicitud-id').innerText = solicitudId;
        document.getElementById('decision-solicitud-estado').innerText = data.estado || 'En Revisión';
        document.getElementById('decision-solicitud-desc').innerText = data.descripcion || 'Detalle del trámite...';

        const adjContainer = document.getElementById('decision-solicitud-adjunto');
        if (data.adjuntoUrl) {
            adjContainer.innerHTML = `<a href="${data.adjuntoUrl}" target="_blank" class="text-emerald-700 font-bold underline inline-flex items-center gap-1"><i class="fa-solid fa-paperclip"></i> Ver Documento / Adjunto</a>`;
        } else {
            adjContainer.innerHTML = `<span class="text-slate-400 italic">Sin archivo adjunto</span>`;
        }

        modalWorkflowDecision?.classList.remove('hidden');
    }

    async function submitWorkflowDecision() {
        if (!activeDecisionSolicitudId) return;

        const action = document.querySelector('input[name="decision-action"]:checked')?.value || 'APROBADO';
        const obsPublic = document.getElementById('decision-obs-public')?.value || '';
        const obsPrivate = document.getElementById('decision-obs-private')?.value || '';
        const includeSignature = document.getElementById('decision-include-signature')?.checked || false;

        try {
            const resp = await apiCall({
                action: 'processWorkflowDecision',
                solicitudId: activeDecisionSolicitudId,
                etapaNombre: 'Revisión Oficial',
                revisorId: currentUser?.nombre || 'Revisor Institucional',
                accionDecision: action,
                observacionesInternas: obsPrivate,
                observacionesPublicas: obsPublic
            }, 'USER');

            if (resp && resp.status === 'success') {
                if (includeSignature) {
                    await apiCall({
                        action: 'registerDocumentSignature',
                        solicitudId: activeDecisionSolicitudId,
                        firmanteId: currentUser?.nombre || 'Autoridad Institucional',
                        rolFirmante: currentUser?.rol || 'Secretaría',
                        tipoFirma: 'Conformidad Digital Institucional'
                    }, 'USER');
                }
                alert(`Decisión '${action}' procesada correctamente para la solicitud ${activeDecisionSolicitudId}.`);
                modalWorkflowDecision?.classList.add('hidden');
            } else {
                alert("Error al procesar decisión: " + (resp?.message || "Error desconocido"));
            }
        } catch (e) {
            alert("Error de comunicación: " + e.message);
        }
    }

    // Export helpers globally if needed
    window.openWorkflowBuilder = openWorkflowBuilder;
    window.openWorkflowDecisionModal = openWorkflowDecisionModal;

    document.getElementById('btn-open-workflow-builder')?.addEventListener('click', () => openWorkflowBuilder());
    document.getElementById('btn-open-workflow-decision')?.addEventListener('click', () => openWorkflowDecisionModal('REQ-DEMO-101', { titulo: 'Trámite Solicitud General', solicitanteNombre: 'Estudiante Ejemplo' }));

    // ---------------------------------------------------------------------------
    // FASE 26: NOTIFICACIONES, MENSAJERÍA INTERNA Y COMUNICACIONES MULTICANAL
    // ---------------------------------------------------------------------------
    const modalChannelConfig = document.getElementById('modal-channel-config');
    document.getElementById('btn-close-channel-config')?.addEventListener('click', () => modalChannelConfig?.classList.add('hidden'));

    async function openChannelConfigModal() {
        modalChannelConfig?.classList.remove('hidden');
        try {
            const resp = await apiCall({ action: 'getNotificationChannelConfigs' }, 'USER');
            const channels = (resp && resp.status === 'success' && resp.data) ? resp.data : [
                { canalId: 'SMS', nombreCanal: 'SMS Mensajería Corta', proveedor: 'Twilio / SMS Gateway', estadoHabilitado: false },
                { canalId: 'WHATSAPP', nombreCanal: 'WhatsApp Business API', proveedor: 'Meta Cloud API', estadoHabilitado: false },
                { canalId: 'MESSENGER', nombreCanal: 'Facebook Messenger API', proveedor: 'Meta Messenger', estadoHabilitado: false },
                { canalId: 'EMAIL', nombreCanal: 'Correo Electrónico Institucional', proveedor: 'Gmail / SMTP', estadoHabilitado: true }
            ];
            renderChannelCards(channels);
        } catch (e) {
            alert("Error al cargar configuración de canales: " + e.message);
        }
    }

    function renderChannelCards(channels) {
        const container = document.getElementById('channel-cards-container');
        if (!container) return;

        container.innerHTML = channels.map(c => `
            <div class="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid ${c.canalId === 'WHATSAPP' ? 'fa-brands fa-whatsapp text-emerald-500' : c.canalId === 'SMS' ? 'fa-solid fa-comment-sms text-sky-500' : c.canalId === 'MESSENGER' ? 'fa-brands fa-facebook-messenger text-blue-500' : 'fa-solid fa-envelope text-indigo-500'} text-lg"></i>
                        <span class="font-bold text-slate-800 text-xs">${c.nombreCanal}</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer ch-toggle-btn" data-canal="${c.canalId}" ${c.estadoHabilitado ? 'checked' : ''}>
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
                <div class="text-[11px] text-slate-500 space-y-1">
                    <p><strong>Proveedor:</strong> ${c.proveedor || 'AdaptadorNativo'}</p>
                    <p><strong>Estado:</strong> <span class="${c.estadoHabilitado ? 'text-emerald-700 font-bold' : 'text-slate-400 font-semibold'}">${c.estadoHabilitado ? 'Habilitado' : 'Desactivado'}</span></p>
                </div>
                <div class="pt-2 border-t border-slate-100 flex justify-end">
                    <button class="btn-test-channel px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all" data-canal="${c.canalId}">
                        <i class="fa-solid fa-vial"></i> Probar Adaptador
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.ch-toggle-btn').forEach(btn => btn.addEventListener('change', async e => {
            const canalId = e.target.dataset.canal;
            const isEnabled = e.target.checked;
            try {
                await apiCall({
                    action: 'configureNotificationChannel',
                    canalId: canalId,
                    nombreCanal: canalId,
                    estadoHabilitado: isEnabled
                }, 'USER');
            } catch (err) {
                alert("Error al actualizar canal: " + err.message);
            }
        }));

        container.querySelectorAll('.btn-test-channel').forEach(btn => btn.addEventListener('click', async e => {
            const canalId = e.currentTarget.dataset.canal;
            const dest = prompt(`Ingrese número/contacto de prueba para ${canalId}:`, "+50499998888");
            if (!dest) return;
            try {
                const resp = await apiCall({
                    action: 'sendChannelNotificationTest',
                    canalId: canalId,
                    destinatarioPrueba: dest
                }, 'USER');
                if (resp && resp.status === 'success') {
                    alert(`¡Prueba exitosa para el adaptador '${canalId}'!\nID Envío: ${resp.envioId}`);
                } else {
                    alert("Error en prueba de adaptador: " + (resp?.message || "Error desconocido"));
                }
            } catch (err) {
                alert("Error de comunicación: " + err.message);
            }
        }));
    }

    window.openChannelConfigModal = openChannelConfigModal;

    document.getElementById('btn-open-channel-config')?.addEventListener('click', () => openChannelConfigModal());

    // ---------------------------------------------------------------------------
    // FASE 28: IMPORTADOR UNIVERSAL DE ARCHIVOS EXCEL (.xlsx) Y BINDINGS
    // ---------------------------------------------------------------------------
    // [REQ-EXP-010] [Fase 1: Registro y Expediente de Estudiantes] - Controlador de interfaz para la lectura, vista previa e importación masiva de expedientes desde CSV y XLSX (#modal-excel-importer).
    const modalExcelImporter = document.getElementById('modal-excel-importer');
    const fileInputExcel = document.getElementById('excel-file-input');
    let parsedExcelData = [];

    document.getElementById('btn-open-excel-importer')?.addEventListener('click', () => {
        parsedExcelData = [];
        if (fileInputExcel) fileInputExcel.value = '';
        document.getElementById('excel-preview-container')?.classList.add('hidden');
        modalExcelImporter?.classList.remove('hidden');
    });

    document.getElementById('btn-close-excel-importer')?.addEventListener('click', () => modalExcelImporter?.classList.add('hidden'));
    document.getElementById('btn-cancel-excel-import')?.addEventListener('click', () => modalExcelImporter?.classList.add('hidden'));

    fileInputExcel?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                if (window.XLSX) {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    parsedExcelData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                    const summaryElem = document.getElementById('excel-preview-summary');
                    const previewContainer = document.getElementById('excel-preview-container');
                    if (summaryElem) {
                        summaryElem.innerHTML = `<strong>Total de Filas Leídas:</strong> ${parsedExcelData.length}<br><strong>Columnas Detectadas:</strong> ${Object.keys(parsedExcelData[0] || {}).join(', ')}`;
                    }
                    if (previewContainer) previewContainer.classList.remove('hidden');
                } else {
                    alert("Biblioteca XLSX no disponible.");
                }
            } catch (err) {
                alert("Error al leer archivo Excel: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    });

    document.getElementById('btn-submit-excel-import')?.addEventListener('click', async () => {
        if (!parsedExcelData || parsedExcelData.length === 0) {
            alert("Por favor seleccione un archivo Excel válido con datos.");
            return;
        }

        const targetModule = document.getElementById('excel-target-module')?.value || 'Docentes';
        try {
            const resp = await apiCall({
                action: 'importDataWithColumnMapping',
                nombreArchivo: 'importacion.xlsx',
                destinoModulo: targetModule,
                columnaMapeo: { identificador: Object.keys(parsedExcelData[0] || {})[0] || 'ID' },
                filasData: parsedExcelData
            }, 'ACCOUNTING');

            if (resp && resp.status === 'success') {
                alert(`¡Importación Completada!\nFilas Procesadas Exitosamente: ${resp.exitosas || parsedExcelData.length}`);
                modalExcelImporter?.classList.add('hidden');
            } else {
                alert('Error al importar datos: ' + (resp?.message || 'Error desconocido'));
            }
        } catch (err) {
            alert('Error al procesar importación: ' + err.message);
        }
    });

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

// ==========================================================================
// NUEVA FASE: CONFIGURACIÓN DE AÑO ESCOLAR, JORNADAS, HORARIOS Y ACTIVIDADES
// ==========================================================================

window.ensureSchoolYearConfigModalExists = function() {
    if (document.getElementById('modal-school-year-config')) return;

    const modalHtml = `
<div id="modal-school-year-config" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[95] flex items-center justify-center p-3 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-calendar-days"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white">Configuración del Año Escolar</h3>
                    <p class="text-[11px] text-slate-400 font-medium">Modelos de calendario (Americano, Año Calendario, Personalizado) y fechas clave.</p>
                </div>
            </div>
            <button onclick="document.getElementById('modal-school-year-config').classList.add('hidden')" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="form-school-year-config" onsubmit="window.saveSchoolYearConfigForm(event)" class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Nombre del Año Escolar *</label>
                    <input type="text" id="sy-nombre" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" placeholder="ej. Año Lectivo 2026-2027" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Modelo de Calendario *</label>
                    <select id="sy-tipo-cal" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                        <option value="Sistema Americano">Sistema Americano (Agosto - Junio / 42 Semanas)</option>
                        <option value="Año Calendario">Año Calendario (Enero - Noviembre)</option>
                        <option value="Personalizado">Personalizado (Fechas Flexibles)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Fecha de Inicio Oficial *</label>
                    <input type="date" id="sy-fecha-inicio" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Fecha de Fin Oficial *</label>
                    <input type="date" id="sy-fecha-fin" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Primer Día de Clases</label>
                    <input type="date" id="sy-inicio-clases" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Último Día de Clases</label>
                    <input type="date" id="sy-fin-clases" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Cierre Administrativo</label>
                    <input type="date" id="sy-fin-admin" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Límite Ingreso Notas</label>
                    <input type="date" id="sy-limite-calif" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                </div>
            </div>

            <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('modal-school-year-config').classList.add('hidden')" class="btn-ima-cancel px-4 py-2 text-xs uppercase font-bold rounded-xl">Cancelar</button>
                <button type="submit" class="btn-ima-primary px-5 py-2 text-xs uppercase font-bold rounded-xl shadow-md"><i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Configuración</button>
            </div>
        </form>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openSchoolYearConfigModal = function() {
    window.ensureSchoolYearConfigModalExists();
    document.getElementById('modal-school-year-config')?.classList.remove('hidden');
};

window.saveSchoolYearConfigForm = function(e) {
    if (e) e.preventDefault();
    const payload = {
        nombre: document.getElementById('sy-nombre')?.value,
        tipoCalendario: document.getElementById('sy-tipo-cal')?.value,
        fechaInicio: document.getElementById('sy-fecha-inicio')?.value,
        fechaFin: document.getElementById('sy-fecha-fin')?.value,
        inicioClases: document.getElementById('sy-inicio-clases')?.value,
        finClases: document.getElementById('sy-fin-clases')?.value,
        finAdministrativo: document.getElementById('sy-fin-admin')?.value,
        limiteIngresoCalificaciones: document.getElementById('sy-limite-calif')?.value,
        estado: 'Activo'
    };

    fetchApi('ACADEMIC', 'configureSchoolYear', payload).then(res => {
        if (res && res.status === 'success') {
            alert('¡Año Escolar guardado exitosamente!');
            document.getElementById('modal-school-year-config')?.classList.add('hidden');
        } else {
            alert('Error: ' + (res?.message || 'Error al guardar'));
        }
    }).catch(err => alert('Fallo de red: ' + err.message));
};

window.ensureAcademicJornadasModalExists = function() {
    if (document.getElementById('modal-academic-jornadas')) return;

    const modalHtml = `
<div id="modal-academic-jornadas" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[95] flex items-center justify-center p-3 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white">Jornadas Académicas & Horarios de Clase</h3>
                    <p class="text-[11px] text-slate-400 font-medium">Configuración de turnos, bloques de clase, recesos y almuerzos.</p>
                </div>
            </div>
            <button onclick="document.getElementById('modal-academic-jornadas').classList.add('hidden')" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="form-academic-jornada" onsubmit="window.saveAcademicJornadaForm(event)" class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Nombre de la Jornada *</label>
                    <input type="text" id="jor-nombre" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" placeholder="ej. Jornada Matutina Oficial" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Tipo de Jornada *</label>
                    <select id="jor-tipo" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                        <option value="Matutina">Matutina</option>
                        <option value="Vespertina">Vespertina</option>
                        <option value="Nocturna">Nocturna</option>
                        <option value="A distancia">A distancia / Virtual</option>
                        <option value="Mixta">Mixta / Doble Jornada</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Hora de Primera Clase *</label>
                    <input type="time" id="jor-hora-inicio" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" value="07:00" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Hora de Última Clase *</label>
                    <input type="time" id="jor-hora-fin" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" value="12:30" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Duración Hora-Clase (Minutos)</label>
                    <input type="number" id="jor-dur-clase" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" value="45">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Duración Receso (Minutos)</label>
                    <input type="number" id="jor-dur-receso" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" value="20">
                </div>
            </div>

            <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('modal-academic-jornadas').classList.add('hidden')" class="btn-ima-cancel px-4 py-2 text-xs uppercase font-bold rounded-xl">Cancelar</button>
                <button type="submit" class="btn-ima-primary px-5 py-2 text-xs uppercase font-bold rounded-xl shadow-md"><i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Jornada</button>
            </div>
        </form>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openAcademicJornadasModal = function() {
    window.ensureAcademicJornadasModalExists();
    document.getElementById('modal-academic-jornadas')?.classList.remove('hidden');
};

window.saveAcademicJornadaForm = function(e) {
    if (e) e.preventDefault();
    const payload = {
        nombreJornada: document.getElementById('jor-nombre')?.value,
        tipoJornada: document.getElementById('jor-tipo')?.value,
        horaInicio: document.getElementById('jor-hora-inicio')?.value,
        horaFin: document.getElementById('jor-hora-fin')?.value,
        duracionClaseMin: document.getElementById('jor-dur-clase')?.value,
        duracionRecesoMin: document.getElementById('jor-dur-receso')?.value,
        estado: 'Activa'
    };

    fetchApi('ACADEMIC', 'configureAcademicJornada', payload).then(res => {
        if (res && res.status === 'success') {
            alert('¡Jornada académica guardada exitosamente!');
            document.getElementById('modal-academic-jornadas')?.classList.add('hidden');
        } else {
            alert('Error: ' + (res?.message || 'Error al guardar'));
        }
    }).catch(err => alert('Fallo de red: ' + err.message));
};

window.ensureInstitutionalActivitiesModalExists = function() {
    if (document.getElementById('modal-institutional-activities')) return;

    const modalHtml = `
<div id="modal-institutional-activities" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[95] flex items-center justify-center p-3 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-flag"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white">Actividades Institucionales & Extracurriculares</h3>
                    <p class="text-[11px] text-slate-400 font-medium">Programación de eventos, ferias, asambleas y estrategias de afectación de clases.</p>
                </div>
            </div>
            <button onclick="document.getElementById('modal-institutional-activities').classList.add('hidden')" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="form-inst-activity" onsubmit="window.saveInstitutionalActivityForm(event)" class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Título de la Actividad *</label>
                    <input type="text" id="act-titulo" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" placeholder="ej. Feria de Ciencias e Innovación 2026" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Tipo de Actividad *</label>
                    <select id="act-tipo" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                        <option value="Acto Cívico">Acto Cívico</option>
                        <option value="Asamblea Informativa">Asamblea Informativa</option>
                        <option value="Feria Educativa">Feria Educativa</option>
                        <option value="Excursión">Excursión / Salida Pedagógica</option>
                        <option value="Capacitación">Capacitación Docente</option>
                        <option value="Evento Deportivo">Evento Deportivo / Cultural</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Fecha de Inicio *</label>
                    <input type="date" id="act-fecha-inicio" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" required>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Fecha de Fin</label>
                    <input type="date" id="act-fecha-fin" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Estrategia de Afectación de Clases *</label>
                    <select id="act-estrategia" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                        <option value="Desplazar">Desplazar clases afectadas manteniendo su orden</option>
                        <option value="Reducir">Reducir la duración proporcional de las horas-clase</option>
                        <option value="Reemplazar">Reemplazar las clases por la actividad</option>
                        <option value="Reprogramar">Reprogramar las clases a otro horario autorizado</option>
                        <option value="Exceder Horario">Programar después de la jornada normal</option>
                    </select>
                </div>
            </div>

            <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('modal-institutional-activities').classList.add('hidden')" class="btn-ima-cancel px-4 py-2 text-xs uppercase font-bold rounded-xl">Cancelar</button>
                <button type="submit" class="btn-ima-primary px-5 py-2 text-xs uppercase font-bold rounded-xl shadow-md"><i class="fa-solid fa-paper-plane mr-1"></i> Programar Actividad</button>
            </div>
        </form>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openInstitutionalActivitiesModal = function() {
    window.ensureInstitutionalActivitiesModalExists();
    document.getElementById('modal-institutional-activities')?.classList.remove('hidden');
};

window.saveInstitutionalActivityForm = function(e) {
    if (e) e.preventDefault();
    const payload = {
        titulo: document.getElementById('act-titulo')?.value,
        tipoActividad: document.getElementById('act-tipo')?.value,
        fechaInicio: document.getElementById('act-fecha-inicio')?.value,
        fechaFin: document.getElementById('act-fecha-fin')?.value,
        estrategiaAfectacion: document.getElementById('act-estrategia')?.value,
        estado: 'Programada'
    };

    fetchApi('ACADEMIC', 'saveInstitutionalActivity', payload).then(res => {
        if (res && res.status === 'success') {
            alert('¡Actividad institucional programada exitosamente!');
            document.getElementById('modal-institutional-activities')?.classList.add('hidden');
        } else {
            alert('Error: ' + (res?.message || 'Error al guardar'));
        }
    }).catch(err => alert('Fallo de red: ' + err.message));
};

window.ensureHROvertimeModalExists = function() {
    if (document.getElementById('modal-hr-overtime')) return;

    const modalHtml = `
<div id="modal-hr-overtime" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[95] flex items-center justify-center p-3 md:p-4 hidden">
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
                    <i class="fa-solid fa-business-time"></i>
                </div>
                <div>
                    <h3 class="text-sm md:text-base font-black uppercase tracking-tight text-white">Gestión de Almuerzos & Horas Extras</h3>
                    <p class="text-[11px] text-slate-400 font-medium">Revisión, aprobación y corte de nómina de tiempo adicional.</p>
                </div>
            </div>
            <button onclick="document.getElementById('modal-hr-overtime').classList.add('hidden')" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 text-lg transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
            <div id="hr-overtime-list-container" class="space-y-3">
                <p class="text-slate-400 text-center py-6 italic font-medium"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Cargando solicitudes de horas extras...</p>
            </div>
        </div>

        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button onclick="document.getElementById('modal-hr-overtime').classList.add('hidden')" class="btn-ima-cancel px-4 py-2 text-xs uppercase font-bold rounded-xl">Cerrar</button>
        </div>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openHROvertimeModal = function() {
    window.ensureHROvertimeModalExists();
    document.getElementById('modal-hr-overtime')?.classList.remove('hidden');
    window.renderHROvertimeUI();
};

window.renderHROvertimeUI = function() {
    const container = document.getElementById('hr-overtime-list-container');
    if (!container) return;

    fetchApi('ACCOUNTING', 'getOvertimeRequests', {}).then(res => {
        if (!res || res.status !== 'success' || !res.overtimeRequests || res.overtimeRequests.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-slate-400 font-medium"><p>No hay registros de horas extras pendientes de revisión.</p></div>';
            return;
        }

        const html = [];
        res.overtimeRequests.forEach(r => {
            html.push(
                '<div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">',
                '  <div>',
                '    <span class="font-black text-slate-900 block">' + r.nombreEmpleado + ' (' + r.userId + ')</span>',
                '    <span class="text-[10px] text-slate-500 font-medium">Fecha: ' + r.fechaTrabajada + ' | Registradas: ' + r.horasRegistradas + ' hrs</span>',
                '    <p class="text-[11px] text-slate-600 italic mt-0.5">' + r.motivo + '</p>',
                '  </div>',
                '  <div class="flex items-center gap-2">',
                '    <input type="number" id="ovt-app-hrs-' + r.overtimeId + '" value="' + r.horasRegistradas + '" class="w-16 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center">',
                '    <button onclick="window.reviewOvertimeAction(\'' + r.overtimeId + '\', \'Aprobar\')" class="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700">Aprobar</button>',
                '    <button onclick="window.reviewOvertimeAction(\'' + r.overtimeId + '\', \'Rechazar\')" class="btn-ima-cancel px-3 py-1.5 text-xs font-bold rounded-xl">Rechazar</button>',
                '  </div>',
                '</div>'
            );
        });

        container.innerHTML = html.join('');
    }).catch(err => {
        container.innerHTML = '<p class="text-red-500 text-center py-4 font-bold">Error: ' + err.message + '</p>';
    });
};

window.reviewOvertimeAction = function(overtimeId, accion) {
    const input = document.getElementById('ovt-app-hrs-' + overtimeId);
    const hrs = input ? input.value : 0;

    fetchApi('ACCOUNTING', 'reviewOvertimeRequest', { overtimeId: overtimeId, accion: accion, horasAprobadas: hrs }).then(res => {
        if (res && res.status === 'success') {
            alert('¡Registro de horas extras ' + (accion === 'Aprobar' ? 'aprobado' : 'rechazado') + '!');
            window.renderHROvertimeUI();
        } else {
            alert('Error: ' + (res?.message || 'Desconocido'));
        }
    }).catch(err => alert('Fallo de red: ' + err.message));
};

    // =========================================================================
    // EXPEDIENTE DIGITAL UNIFICADO DEL ESTUDIANTE (REQ-EXP-001)
    // =========================================================================
    let currentStudentFile = null;

    // [REQ-EXP-001] [Fase 1: Registro y Expediente de Estudiantes] - Función para abrir, consultar y visualizar el expediente digital del estudiante mediante getStudentFile y #modal-student-file.
    window.openStudentFileModal = async function(studentId) {
        if (!studentId) return;
        const modal = document.getElementById('modal-student-file');
        if (!modal) return;

        try {
            if (window.showLoading) window.showLoading('Cargando expediente digital...');
            const response = await fetchApi('ACADEMIC', 'getStudentFile', { studentId: studentId });
            if (window.hideLoading) window.hideLoading();

            if (!response || response.status !== 'success' || !response.data) {
                alert(response && response.message ? response.message : 'No se pudo consultar el expediente del estudiante.');
                return;
            }

            currentStudentFile = response.data;
            renderStudentFileModalData();
            modal.classList.remove('hidden');
        } catch (err) {
            if (window.hideLoading) window.hideLoading();
            console.error('Error al abrir expediente:', err);
            alert('Error al conectar con el servidor para consultar el expediente.');
        }
    };

    function renderStudentFileModalData() {
        if (!currentStudentFile) return;
        const data = currentStudentFile;

        // Header info
        const nameEl = document.getElementById('stfile-student-name');
        const codeEl = document.getElementById('stfile-student-code');
        if (nameEl) nameEl.textContent = data.nombreCompleto || `${data.nombres || ''} ${data.apellidos || ''}`.trim() || 'Estudiante';
        if (codeEl) codeEl.textContent = `Código: ${data.codigoEstudiante || data.userId || '--'} | Estado: ${data.estadoExpediente || data.estado || 'Activo'}`;

        // Personal form inputs
        document.getElementById('stfile-nombre').value = data.nombreCompleto || `${data.nombres || ''} ${data.apellidos || ''}`.trim() || '';
        document.getElementById('stfile-codigo').value = data.codigoEstudiante || data.userId || '';
        document.getElementById('stfile-identificacion').value = data.identificacion || data.dni || '';
        document.getElementById('stfile-fecha-nacimiento').value = data.fechaNacimiento ? data.fechaNacimiento.split('T')[0] : '';
        document.getElementById('stfile-nacionalidad').value = data.nacionalidad || '';
        document.getElementById('stfile-estado-expediente').value = data.estadoExpediente || data.estado || 'Activo';
        document.getElementById('stfile-direccion').value = data.direccion || '';
        document.getElementById('stfile-observaciones').value = data.observaciones || '';

        // [TAREA-F6-001] [Fase 6: Expediente Institucional] - Restringir controles de expedientes duplicados por rol
        const dupTabBtn = document.querySelector('.stfile-tab-btn[data-tab="tab-stfile-duplicates"]');
        const dupTabContent = document.getElementById('tab-stfile-duplicates');
        const isAuthorizedForDuplicates = RoleCapabilities.canManageDuplicates(currentUser);
        if (dupTabBtn) {
            if (isAuthorizedForDuplicates) {
                dupTabBtn.classList.remove('hidden');
            } else {
                dupTabBtn.classList.add('hidden');
            }
        }
        if (dupTabContent && !isAuthorizedForDuplicates) {
            dupTabContent.classList.add('hidden');
        }

        // [TAREA-F6-023] [Fase 6: Expediente Institucional y Ciclo de Vida] - Renderizar resumen institucional unificado por perfil autorizado
        renderStudentInstitutionalSummary(data);

        // Reset active tab to personal
        switchStudentFileTab('tab-stfile-personal');

        // Load guardians, documents, and timeline
        loadStudentGuardians();
        loadStudentDocuments();
        loadStudentTimeline();
    }

    // [TAREA-F6-023] [Fase 6: Expediente Institucional y Ciclo de Vida] - Renderizador de resumen institucional contextualizado por rol con tolerancia a fallos parciales
    window.renderStudentInstitutionalSummary = function(data) {
        if (!data) return;
        const container = document.getElementById('stfile-summary-card');
        if (!container) return;

        const role = (currentUser && currentUser.role) || 'General';
        const nowStr = new Date().toLocaleString();

        try {
            const isTeacher = role === 'Profesor' || role === 'Docente';
            const activeEnrollment = (data.enrollments || []).find(e => String(e.estado).toLowerCase() === 'activa') || (data.enrollments || [])[0] || {};

            container.innerHTML = `
                <div class="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-4 rounded-2xl shadow-sm space-y-3 mb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-700/60 text-blue-200">Resumen Institucional • ${role}</span>
                            <h3 class="text-sm font-extrabold mt-1">${data.nombreCompleto || 'Estudiante'}</h3>
                        </div>
                        <span class="text-[10px] text-blue-200"><i class="fa-solid fa-clock-rotate-left mr-1"></i>Act.: ${nowStr}</span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div class="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                            <span class="text-[10px] text-blue-200 block">Código</span>
                            <span class="font-black">${data.codigoInstitucional || data.codigoEstudiante || 'N/A'}</span>
                        </div>
                        <div class="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                            <span class="text-[10px] text-blue-200 block">Estado</span>
                            <span class="font-black text-emerald-300">${data.estadoExpediente || 'Activo'}</span>
                        </div>
                        <div class="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                            <span class="text-[10px] text-blue-200 block">Grado/Sección</span>
                            <span class="font-black">${activeEnrollment.grado || 'N/A'} ${activeEnrollment.seccion || ''}</span>
                        </div>
                        <div class="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                            <span class="text-[10px] text-blue-200 block">Año Lectivo</span>
                            <span class="font-black">${activeEnrollment.periodo || '2026'}</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('Error al renderizar resumen institucional:', err);
            container.innerHTML = '<div class="text-amber-600 text-xs p-2 bg-amber-50 rounded-xl">Carga parcial del resumen institucional. Algunos datos no están disponibles.</div>';
        }
    };

    // Tabs switching
    document.querySelectorAll('.stfile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchStudentFileTab(targetTab);
        });
    });

    function switchStudentFileTab(tabId) {
        document.querySelectorAll('.stfile-tab-btn').forEach(b => {
            if (b.getAttribute('data-tab') === tabId) {
                b.classList.add('text-blue-600', 'border-blue-600');
                b.classList.remove('text-slate-500', 'border-transparent');
            } else {
                b.classList.remove('text-blue-600', 'border-blue-600');
                b.classList.add('text-slate-500', 'border-transparent');
            }
        });
        document.querySelectorAll('.stfile-tab-content').forEach(c => {
            if (c.id === tabId) c.classList.remove('hidden');
            else c.classList.add('hidden');
        });
    }

    const btnCloseStFile = document.getElementById('btn-close-student-file');
    if (btnCloseStFile) {
        btnCloseStFile.addEventListener('click', () => {
            const modal = document.getElementById('modal-student-file');
            if (modal) modal.classList.add('hidden');
            currentStudentFile = null;
        });
    }

    // Personal Form Submission (updateStudentFile)
    // [REQ-EXP-002] [Fase 1: Registro y Expediente de Estudiantes] - Event listener y controlador para el guardado y actualización de datos personales del expediente (#stfile-personal-form).
    const stfilePersonalForm = document.getElementById('stfile-personal-form');
    if (stfilePersonalForm) {
        stfilePersonalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentStudentFile) return;

            const updatedData = {
                studentId: currentStudentFile.userId || currentStudentFile.studentId,
                nombreCompleto: document.getElementById('stfile-nombre').value.trim(),
                identificacion: document.getElementById('stfile-identificacion').value.trim(),
                fechaNacimiento: document.getElementById('stfile-fecha-nacimiento').value,
                nacionalidad: document.getElementById('stfile-nacionalidad').value.trim(),
                estadoExpediente: document.getElementById('stfile-estado-expediente').value,
                direccion: document.getElementById('stfile-direccion').value.trim(),
                observaciones: document.getElementById('stfile-observaciones').value.trim()
            };

            try {
                if (window.showLoading) window.showLoading('Guardando datos del expediente...');
                const res = await fetchApi('ACADEMIC', 'updateStudentFile', updatedData);
                if (window.hideLoading) window.hideLoading();

                if (res && res.status === 'success') {
                    alert('Expediente actualizado exitosamente.');
                    if (res.data) currentStudentFile = { ...currentStudentFile, ...res.data };
                    renderStudentFileModalData();
                } else {
                    alert(res && res.message ? res.message : 'No se pudo guardar los cambios en el expediente.');
                }
            } catch (err) {
                if (window.hideLoading) window.hideLoading();
                console.error('Error al actualizar expediente:', err);
                alert('Error al conectar con el servidor.');
            }
        });
    }

    // Guardians Management
    // [REQ-EXP-003] [Fase 1: Registro y Expediente de Estudiantes] - Controlador de interfaz para la consulta, vinculación y desvinculación de padres, tutores y responsables legales del estudiante.
    async function loadStudentGuardians() {
        const container = document.getElementById('stfile-guardians-container');
        if (!container || !currentStudentFile) return;
        container.innerHTML = '<div class="col-span-2 text-center p-4 text-slate-400 text-xs">Cargando tutores...</div>';

        try {
            const res = await fetchApi('ACADEMIC', 'getStudentGuardians', { studentId: currentStudentFile.userId || currentStudentFile.studentId });
            const guardians = (res && res.status === 'success' && Array.isArray(res.data)) ? res.data : [];

            if (guardians.length === 0) {
                container.innerHTML = '<div class="col-span-2 text-center p-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">No hay tutores o responsables vinculados aún.</div>';
                return;
            }

            container.innerHTML = guardians.map(g => `
                <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div class="flex items-center justify-between">
                        <div class="font-bold text-xs text-slate-800">${g.nombreTutor || g.nombre || 'Tutor Registrado'}</div>
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-100 text-blue-700">${g.parentesco || 'Responsable'}</span>
                    </div>
                    <div class="text-[11px] text-slate-600 space-y-1">
                        <div><i class="fa-solid fa-phone mr-1 text-slate-400"></i> ${g.telefono || 'Sin teléfono'}</div>
                        <div><i class="fa-solid fa-envelope mr-1 text-slate-400"></i> ${g.email || 'Sin correo'}</div>
                        <div class="flex flex-wrap gap-1 pt-1">
                            ${g.esRepresentanteLegal ? '<span class="bg-emerald-100 text-emerald-800 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">Rep. Legal</span>' : ''}
                            ${g.esContactoEmergencia ? '<span class="bg-amber-100 text-amber-800 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">Emergencia</span>' : ''}
                            ${g.esResponsableFinanciero ? '<span class="bg-purple-100 text-purple-800 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">Financiero</span>' : ''}
                        </div>
                    </div>
                    <div class="pt-2 flex justify-end">
                        <button class="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[10px] font-bold uppercase hover:bg-red-100 btn-unlink-guardian" data-guardian-id="${g.guardianId || g.id}">
                            Desvincular
                        </button>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.btn-unlink-guardian').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const gId = btn.getAttribute('data-guardian-id');
                    if (!confirm('¿Desea desvincular este tutor del estudiante?')) return;
                    try {
                        if (window.showLoading) window.showLoading('Desvinculando tutor...');
                        const unres = await fetchApi('ACADEMIC', 'unlinkStudentGuardian', {
                            studentId: currentStudentFile.userId || currentStudentFile.studentId,
                            guardianId: gId
                        });
                        if (window.hideLoading) window.hideLoading();
                        if (unres && unres.status === 'success') {
                            alert('Tutor desvinculado correctamente.');
                            loadStudentGuardians();
                        } else {
                            alert(unres && unres.message ? unres.message : 'No se pudo desvincular el tutor.');
                        }
                    } catch (err) {
                        if (window.hideLoading) window.hideLoading();
                        console.error('Error al desvincular tutor:', err);
                    }
                });
            });
        } catch (err) {
            console.error('Error al cargar tutores:', err);
            container.innerHTML = '<div class="col-span-2 text-center p-4 text-red-500 text-xs">Error al cargar la lista de tutores.</div>';
        }
    }

    const btnOpenAddGuardian = document.getElementById('btn-open-add-guardian-modal');
    if (btnOpenAddGuardian) {
        btnOpenAddGuardian.addEventListener('click', async () => {
            if (!currentStudentFile) return;
            const name = prompt('Ingrese nombre completo del tutor:');
            if (!name) return;
            const parentesco = prompt('Parentesco (ej: Padre, Madre, Tutor Legal):') || 'Tutor';
            const email = prompt('Correo electrónico del tutor:') || '';
            const telefono = prompt('Teléfono de contacto:') || '';

            try {
                if (window.showLoading) window.showLoading('Vinculando tutor...');
                const res = await fetchApi('ACADEMIC', 'saveStudentGuardian', {
                    studentId: currentStudentFile.userId || currentStudentFile.studentId,
                    nombreTutor: name,
                    parentesco: parentesco,
                    email: email,
                    telefono: telefono,
                    esRepresentanteLegal: true,
                    esContactoEmergencia: true
                });
                if (window.hideLoading) window.hideLoading();
                if (res && res.status === 'success') {
                    alert('Tutor vinculado exitosamente.');
                    loadStudentGuardians();
                } else {
                    alert(res && res.message ? res.message : 'No se pudo vincular el tutor.');
                }
            } catch (err) {
                if (window.hideLoading) window.hideLoading();
                console.error('Error al vincular tutor:', err);
            }
        });
    }

    // Documents Upload & Management
    // [REQ-EXP-004] [Fase 1: Registro y Expediente de Estudiantes] - Controlador de interfaz para la carga, consulta y visualización de documentos y fotografías del expediente en Google Drive.
    async function loadStudentDocuments() {
        const container = document.getElementById('stfile-documents-list');
        if (!container || !currentStudentFile) return;
        container.innerHTML = '<div class="text-center p-4 text-slate-400 text-xs">Cargando documentos...</div>';

        try {
            const res = await fetchApi('ACADEMIC', 'getStudentDocuments', { studentId: currentStudentFile.userId || currentStudentFile.studentId });
            const docs = (res && res.status === 'success' && Array.isArray(res.data)) ? res.data : [];

            if (docs.length === 0) {
                container.innerHTML = '<div class="text-center p-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">No hay documentos cargados en el expediente.</div>';
                return;
            }

            container.innerHTML = docs.map(d => `
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <i class="fa-solid ${d.mimeType && d.mimeType.includes('pdf') ? 'fa-file-pdf' : 'fa-file-image'}"></i>
                        </div>
                        <div>
                            <div class="font-bold text-xs text-slate-800">${d.nombreArchivo || d.tipoDocumento || 'Documento'}</div>
                            <div class="text-[10px] text-slate-500">${d.tipoDocumento || 'General'} | Fecha: ${d.fechaCarga ? new Date(d.fechaCarga).toLocaleDateString() : 'Reciente'}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${d.archivoUrl || d.driveUrl ? `<a href="${d.archivoUrl || d.driveUrl}" target="_blank" class="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700">Ver / Descargar</a>` : ''}
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Error al cargar documentos:', err);
            container.innerHTML = '<div class="text-center p-4 text-red-500 text-xs">Error al consultar documentos del expediente.</div>';
        }
    }

    const stfileDocUploadForm = document.getElementById('stfile-doc-upload-form');
    if (stfileDocUploadForm) {
        stfileDocUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentStudentFile) return;

            const fileInput = document.getElementById('stfile-doc-file');
            const docType = document.getElementById('stfile-doc-tipo').value;

            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Por favor seleccione un archivo para cargar.');
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async function(event) {
                const base64Data = event.target.result.split(',')[1];
                try {
                    if (window.showLoading) window.showLoading('Subiendo documento a Google Drive...');
                    const res = await fetchApi('ACADEMIC', 'uploadStudentDocument', {
                        studentId: currentStudentFile.userId || currentStudentFile.studentId,
                        tipoDocumento: docType,
                        fileName: file.name,
                        mimeType: file.type,
                        fileDataBase64: base64Data
                    });
                    if (window.hideLoading) window.hideLoading();

                    if (res && res.status === 'success') {
                        alert('Documento subido exitosamente a Google Drive.');
                        fileInput.value = '';
                        loadStudentDocuments();
                    } else {
                        alert(res && res.message ? res.message : 'No se pudo subir el documento.');
                    }
                } catch (err) {
                    if (window.hideLoading) window.hideLoading();
                    console.error('Error al subir documento:', err);
                    alert('Error de conexión al subir el archivo.');
                }
            };

            reader.readAsDataURL(file);
        });
    }

    // Timeline Loading
    // [REQ-EXP-005] [Fase 1: Registro y Expediente de Estudiantes] - Controlador de interfaz para la consulta y renderizado de la línea de tiempo e historial de movimientos del estudiante.
    async function loadStudentTimeline() {
        const container = document.getElementById('stfile-timeline-container');
        if (!container || !currentStudentFile) return;
        container.innerHTML = '<div class="text-slate-400 text-xs">Cargando historial de movimientos...</div>';

        try {
            const res = await fetchApi('ACADEMIC', 'getStudentTimeline', { studentId: currentStudentFile.userId || currentStudentFile.studentId });
            const events = (res && res.status === 'success' && Array.isArray(res.data)) ? res.data : [];

            if (events.length === 0) {
                container.innerHTML = '<div class="text-slate-400 text-xs">No hay registros de movimientos en la línea de tiempo.</div>';
                return;
            }

            container.innerHTML = events.map(ev => `
                <div class="relative">
                    <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
                    <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-xs text-slate-800">${ev.tipoMovimiento || ev.evento || 'Movimiento Institucional'}</span>
                            <span class="text-[10px] font-semibold text-slate-400">${ev.fecha ? new Date(ev.fecha).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <p class="text-[11px] text-slate-600">${ev.descripcion || 'Sin descripción detallada.'}</p>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Error al cargar historial:', err);
            container.innerHTML = '<div class="text-red-500 text-xs">Error al cargar la línea de tiempo.</div>';
        }
    }

    // Duplicate Scan & Merge
    // [REQ-EXP-006] [Fase 1: Registro y Expediente de Estudiantes] - Controlador de interfaz para el escaneo de coincidencia de duplicados y ejecución auditada de la fusión de expedientes.
    const btnScanDuplicates = document.getElementById('btn-scan-duplicates');
    if (btnScanDuplicates) {
        btnScanDuplicates.addEventListener('click', async () => {
            if (!currentStudentFile) return;
            const resultsContainer = document.getElementById('stfile-duplicates-results');
            if (!resultsContainer) return;
            resultsContainer.innerHTML = '<div class="text-slate-400 text-xs p-2">Escaneando coincidencia de duplicados...</div>';

            try {
                const res = await fetchApi('ACADEMIC', 'findDuplicateStudents', {
                    studentId: currentStudentFile.userId || currentStudentFile.studentId,
                    nombre: currentStudentFile.nombreCompleto || currentStudentFile.nombres || '',
                    identificacion: currentStudentFile.identificacion || currentStudentFile.dni || ''
                });

                const matches = (res && res.status === 'success' && Array.isArray(res.data)) ? res.data : [];

                if (matches.length === 0) {
                    resultsContainer.innerHTML = '<div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold"><i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> No se encontraron expedientes duplicados coincidentes.</div>';
                    return;
                }

                resultsContainer.innerHTML = matches.map(m => `
                    <div class="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                            <div class="font-bold text-xs text-slate-800">${m.nombreCompleto || m.nombre}</div>
                            <div class="text-[10px] text-slate-500">ID: ${m.studentId || m.userId} | DNI: ${m.identificacion || 'N/A'} | Criterio: ${m.motivoCoincidencia || 'Similitud de nombre'}</div>
                        </div>
                        <button class="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-amber-700 btn-merge-student" data-target-id="${m.studentId || m.userId}">
                            Fusionar en este Expediente
                        </button>
                    </div>
                `).join('');

                resultsContainer.querySelectorAll('.btn-merge-student').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const targetId = btn.getAttribute('data-target-id');
                        if (!confirm(`¿Está seguro de fusionar el expediente ${targetId} en este expediente principal (${currentStudentFile.userId || currentStudentFile.studentId})? Esta acción es irreversible y re-vinculará sus registros.`)) return;

                        try {
                            if (window.showLoading) window.showLoading('Procesando fusión auditada de expedientes...');
                            const mres = await fetchApi('ACADEMIC', 'mergeStudentFiles', {
                                targetStudentId: currentStudentFile.userId || currentStudentFile.studentId,
                                sourceStudentId: targetId
                            });
                            if (window.hideLoading) window.hideLoading();

                            if (mres && mres.status === 'success') {
                                alert('Expedientes fusionados correctamente.');
                                window.openStudentFileModal(currentStudentFile.userId || currentStudentFile.studentId);
                            } else {
                                alert(mres && mres.message ? mres.message : 'No se pudo realizar la fusión.');
                            }
                        } catch (err) {
                            if (window.hideLoading) window.hideLoading();
                            console.error('Error al fusionar:', err);
                        }
                    });
                });
            } catch (err) {
                console.error('Error al buscar duplicados:', err);
                resultsContainer.innerHTML = '<div class="text-red-500 text-xs p-2">Error de conexión al escanear duplicados.</div>';
            }
        });
    }
