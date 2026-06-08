document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    const firstName = currentUser.nombre.split(' ')[0];
    const studentNameEl = document.getElementById('student-name');
    if (studentNameEl) studentNameEl.textContent = firstName;
    const tasksList = document.getElementById('tasks-list');
    const logoutButton = document.getElementById('logout-button');

    // --- Mi Perfil (Centralizado en ui-common.js) ---

    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const PARCIAL_ORDER = {
        "Cuarto Parcial": 4,
        "Tercer Parcial": 3,
        "Segundo Parcial": 2,
        "Primer Parcial": 1
    };
    let allActivitiesData = [];

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // --- Elementos del Modal ---
    const submissionModal = document.getElementById('submission-modal');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const submissionForm = document.getElementById('submission-form');
    const fileInput = document.getElementById('file-input');
    const cancelSubmissionBtn = document.getElementById('cancel-submission-btn');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const fileInfoPreview = document.getElementById('file-info-preview');
    const uploadedFilesContainer = document.getElementById('uploaded-files-container');
    const uploadedFilesList = document.getElementById('uploaded-files-list');
    const confirmSubmissionBtn = document.getElementById('confirm-submission-btn');

    let currentTaskId = null;
    let currentTaskParcial = null;
    let currentTaskAsignatura = null;
    let uploadedFiles = []; // [{fileId, fileName, mimeType}]
    let currentFolderId = null;
    let activeUploads = 0;
    let isSubmitting = false; // Flag para evitar avisos tras entrega exitosa (Tarea 3)

    function formatDate(isoString) {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const year = date.getUTCFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return isoString;
        }
    }

    // Función para obtener Tareas y Exámenes
    async function fetchAllActivities() {
        if (!tasksList) return;

        // REQ: Spinner Contextual (Ticket 3) - No bloquea la UI global
        if (window.GamesAdapter) {
            window.GamesAdapter.showLoading(true, tasksList);
        } else {
            tasksList.innerHTML = '<div class="p-12 text-center"><i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i><p class="text-gray-500 font-medium">Sincronizando expediente académico...</p></div>';
        }

        try {
            const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };

            // REQ: Mitigación de Latencia mediante Paralelismo (Ticket 4)
            const [tasksResult, examsResult, profileResult] = await Promise.all([
                fetchApi('TASK', 'getStudentTasks', payload),
                fetchApi('EXAM', 'getStudentExams', payload),
                fetchAndRenderLearningProfile(true) // Obtener datos de perfil sin renderizar aún
            ]);

            const allActivities = [];
            try {
                if (tasksResult.status === 'success' && tasksResult.data) {
                    allActivities.push(...tasksResult.data.map(task => ({
                        ...task,
                        type: task.tipo || 'Tarea',
                        asignatura: (task.asignatura || 'General').trim(),
                        parcial: (task.parcial || 'Sin Parcial').trim()
                    })));
                }
                if (examsResult.status === 'success' && examsResult.data) {
                    allActivities.push(...examsResult.data.map(exam => ({
                        ...exam,
                        type: 'Examen',
                        asignatura: (exam.asignatura || 'General').trim(),
                        parcial: (exam.parcial || 'Sin Parcial').trim()
                    })));
                }

                allActivities.sort((a, b) => {
                    const isReviewed = (act) => {
                        if (!act.entrega) return false;
                        const s = act.entrega.estado;
                        return (s === 'Completada' || s === 'Revisada' || s === 'Finalizado' || s === 'Rechazada');
                    };
                    const revA = isReviewed(a);
                    const revB = isReviewed(b);
                    if (revA !== revB) return revA ? 1 : -1;
                    return new Date(b.fechaLimite) - new Date(a.fechaLimite);
                });

                allActivitiesData = allActivities;

                // Renderizado Sincronizado de Componentes
                renderStudentExpediente(allActivities);

                // Renderizar perfil si los datos fueron exitosos
                if (profileResult) renderLearningProfileData(profileResult);
            } catch (innerError) {
                console.error("[IMA-STUDENT] Fallo en procesamiento de actividades:", innerError);
            }

            if (allActivities.length > 0) {
                renderParcialTabs(allActivities);
            } else {
                // REQ: Manejo de respuesta vacía amigable (v3.3)
                tasksList.innerHTML = `
                    <div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100 animate-fade-in">
                        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Todo al día!</h3>
                        <p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                            No se han encontrado tareas ni exámenes asignados en este momento.
                        </p>
                    </div>`;
            }

        } catch (error) {
            console.error("[IMA-STUDENT] Error en fetchAllActivities:", error);
            // REQ: Manejo de respuesta vacía amigable (v3.3)
            tasksList.innerHTML = `
                <div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100">
                    <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        <i class="fas fa-sync-alt"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Sincronizando!</h3>
                    <p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                        No hemos podido obtener tus tareas en este momento. Por favor, reintenta en unos instantes.
                    </p>
                    <button onclick="location.reload()" class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">Reintentar</button>
                </div>`;
        } finally {
            if (window.GamesAdapter) window.GamesAdapter.showLoading(false);
        }
    }

    function renderStudentExpediente(activities) {
        const container = document.getElementById('student-expediente');
        if (!container) return;

        // REQ: Filtro Estricto por Parcial (Incidencia 5)
        // No mezclar históricos en el cálculo de progreso actual
        const currentParcialActivities = activities.filter(a =>
            window.normalizePartial(a.parcial) === window.normalizePartial(window.PARCIAL_ACTUAL)
        );

        // --- Ajuste de Lógica de Progreso (Req 2) ---
        // Excluir 'Credito Extra' del total asignado (baseline), ya que son de recuperación
        const baseActivities = currentParcialActivities.filter(a => a.type !== 'Credito Extra');
        const totalAssigned = baseActivities.length;

        // Las completadas suman puntos al progreso real (separando obligatorias de recuperación)
        const mandatoryCompleted = currentParcialActivities.filter(a => a.type !== 'Credito Extra' && a.entrega &&
            (a.entrega.estado === 'Completada' || a.entrega.estado === 'Revisada' || a.entrega.estado === 'Finalizado')
        ).length;

        const extraCreditCompleted = currentParcialActivities.filter(a => a.type === 'Credito Extra' && a.entrega &&
            (a.entrega.estado === 'Completada' || a.entrega.estado === 'Revisada' || a.entrega.estado === 'Finalizado')
        ).length;

        // El progreso visual (slots llenos) se beneficia del crédito extra para cubrir faltantes (Req 2)
        const completed = Math.min(totalAssigned, mandatoryCompleted + extraCreditCompleted);
        const pending = Math.max(0, totalAssigned - completed);

        // Tasa de entrega basada en tareas obligatorias (Req 2: Crédito extra no es obligatorio)
        const mandatoryDelivered = currentParcialActivities.filter(a => a.type !== 'Credito Extra' && a.entrega).length;
        const deliveryRate = totalAssigned > 0 ? (mandatoryDelivered / totalAssigned) : 0;

        // Puntos totales obtenidos (incluye recuperación por créditos extra)
        const gradeSum = currentParcialActivities.reduce((sum, a) => sum + parseFloat(a.entrega?.calificacion || 0), 0);

        // El máximo posible se basa en las tareas obligatorias
        const maxPossible = baseActivities.reduce((sum, a) => sum + parseFloat(a.puntaje || 100), 0);
        const academicPerformance = maxPossible > 0 ? Math.min(1, gradeSum / maxPossible) : 0;

        let onTimeCount = 0;
        activities.forEach(a => {
            if (a.entrega && a.fechaLimite) {
                const limit = new Date(a.fechaLimite);
                const deliveryDate = new Date(a.entrega.fecha || Date.now());
                if (deliveryDate <= limit) onTimeCount++;
            }
        });
        const totalDelivered = activities.filter(a => a.entrega).length;
        const punctualityRate = totalDelivered > 0 ? (onTimeCount / totalDelivered) : 1;

        const compositeProgress = Math.round((deliveryRate * 0.3 + academicPerformance * 0.5 + punctualityRate * 0.2) * 100);

        let level = "Iniciando";
        let levelColor = "text-blue-600";
        let barColor = "bg-blue-600";

        if (compositeProgress >= 90) { level = "Excelencia"; levelColor = "text-emerald-600"; barColor = "bg-emerald-500"; }
        else if (compositeProgress >= 70) { level = "Satisfactorio"; levelColor = "text-green-600"; barColor = "bg-green-500"; }
        else if (compositeProgress >= 50) { level = "En Mejora"; levelColor = "text-yellow-600"; barColor = "bg-yellow-500"; }
        else if (compositeProgress > 0) { level = "En Riesgo"; levelColor = "text-orange-600"; barColor = "bg-orange-500"; }

        container.innerHTML = `
            <div class="card-ima bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                                <i class="fas fa-id-card"></i>
                            </div>
                            <div>
                                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Estudiante</h3>
                                <p class="text-lg font-bold text-gray-900">${currentUser.nombre}</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 pt-2">
                            <div><span class="text-[10px] font-bold text-gray-400 uppercase">Grado</span><p class="text-sm font-semibold">${currentUser.grado}</p></div>
                            <div><span class="text-[10px] font-bold text-gray-400 uppercase">Sección</span><p class="text-sm font-semibold">${currentUser.seccion}</p></div>
                            <div><span class="text-[10px] font-bold text-gray-400 uppercase">No. Lista</span><p class="text-sm font-semibold">#${currentUser.numeroLista || 'N/A'}</p></div>
                        </div>
                    </div>

                    <div class="md:border-x border-gray-50 px-0 md:px-8 space-y-4">
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progreso Académico</h3>
                                <p class="text-3xl font-black text-gray-900">${compositeProgress}%</p>
                            </div>
                            <div class="text-right">
                                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nivel</span>
                                <span class="text-xs font-bold ${levelColor} uppercase tracking-tighter">${level}</span>
                            </div>
                        </div>
                        <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div class="${barColor} h-full transition-all duration-1000" style="width: ${compositeProgress}%"></div>
                        </div>
                    </div>

                    <div class="flex flex-col justify-center space-y-3">
                        <div class="flex items-center justify-between p-3 bg-green-50 rounded-2xl">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-white text-green-600 rounded-xl flex items-center justify-center text-xs shadow-sm"><i class="fas fa-check"></i></div>
                                <span class="text-xs font-bold text-green-700 uppercase">Completadas</span>
                            </div>
                            <span class="text-lg font-black text-green-700">${completed}</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-2xl">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-white text-yellow-600 rounded-xl flex items-center justify-center text-xs shadow-sm"><i class="fas fa-clock"></i></div>
                                <span class="text-xs font-bold text-yellow-700 uppercase">Pendientes</span>
                            </div>
                            <span class="text-lg font-black text-yellow-700">${pending}</span>
                        </div>
                    </div>
                </div>
                <!-- Fase 9: Integración de Perfil de Dominio -->
                <div id="learning-profile-integration"></div>
            </div>
        `;
        container.classList.remove('hidden');
    }

    function renderSubjectNav(activities, selectedParcial) {
        const container = document.getElementById('subject-nav-container');
        if (!container) return;

        // Obtener asignaturas dinámicamente filtradas por el parcial seleccionado
        const subjects = [...new Set(activities.map(a => a.asignatura))]
            .filter(s => s && s.trim() !== "")
            .sort();

        if (subjects.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-[10px] uppercase font-bold p-4">No hay asignaturas en este parcial.</p>';
            tasksList.innerHTML = '<p class="text-gray-500 text-center py-8">No hay actividades registradas.</p>';
            return;
        }

        container.innerHTML = subjects.map(subj => `
            <button class="subject-tab flex-none px-5 py-2.5 bg-white border border-gray-100 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm hover:border-blue-200 transition-all" data-subject="${subj}">
                ${subj}
            </button>
        `).join('');

        // Listener para filtrar por asignatura
        container.querySelectorAll('.subject-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.subject-tab').forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600'));
                const target = e.currentTarget;
                target.classList.add('bg-blue-600', 'text-white', 'border-blue-600');

                const subj = target.dataset.subject;
                const finalActivities = activities.filter(a => a.asignatura === subj);

                renderActivities(finalActivities);
                showSubjectInfo(subj);
            });
        });

        // Activar la primera por defecto
        container.querySelector('.subject-tab').click();
    }

    async function showSubjectInfo(subject) {
        const container = document.getElementById('subject-info-container');
        if (!container) return;

        container.innerHTML = '<div class="p-5 bg-gray-50 rounded-2xl text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Sincronizando información de la asignatura...</div>';
        container.classList.remove('hidden');

        try {
            // Identificar profesorId desde las actividades cargadas para esta asignatura específica
            const activity = allActivitiesData.find(a => (a.asignatura || 'General') === subject && a.profesorId);
            const profesorId = activity ? activity.profesorId : null;

            // Info por defecto (Área de Informática)
            let profInfo = {
                nombre: "ISEMED - Área de Informática",
                email: "informatica@isemed.edu.hn",
                telefono: ""
            };

            // Intentar obtener info real del docente (A-73/75)
            if (profesorId) {
                try {
                    const res = await fetchApi('USER', 'getUserInfo', { userId: profesorId });
                    if (res.status === 'success' && res.data) {
                        profInfo = res.data;
                    }
                } catch (e) {
                    console.warn("No se pudo cargar info del docente específico:", e);
                }
            }

            // Normalizar WhatsApp del Docente
            const waPhone = profInfo.telefono ? String(profInfo.telefono).replace(/\D/g, '') : '';
            const waLink = waPhone ? `https://wa.me/504${waPhone}` : null;

            // Obtener enlace del grupo de WhatsApp por Grado (Lógica A-66 preservada)
            let groupLink = null;
            try {
                const groupRes = await fetchApi('USER', 'getWhatsAppLink', { grado: currentUser.grado });
                if (groupRes.status === 'success' && groupRes.link) {
                    groupLink = groupRes.link;
                }
            } catch (e) {
                console.warn("No se pudo cargar enlace de grupo de grado.");
            }

            container.innerHTML = `
                <div class="card-ima bg-blue-50/50 border-blue-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm shadow-sm border border-blue-50">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div class="text-center md:text-left">
                            <h4 class="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Docente Asignado</h4>
                            <p class="text-sm font-bold text-gray-900">${profInfo.nombre}</p>
                        </div>
                    </div>
                    <div class="flex flex-wrap justify-center gap-3">
                        <a href="mailto:${profInfo.email}" class="text-[10px] font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                            <i class="fas fa-envelope text-blue-400"></i> ${profInfo.email}
                        </a>
                        ${waLink ? `
                            <a href="${waLink}" target="_blank" class="bg-green-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-all transform hover:-translate-y-0.5">
                                <i class="fab fa-whatsapp text-sm"></i> WhatsApp Docente
                            </a>
                        ` : ''}
                        ${groupLink ? `
                            <a href="${groupLink}" target="_blank" class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                                <i class="fas fa-users text-sm"></i> Grupo de Clase
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        } catch (e) {
            console.error("Error showing subject info:", e);
            container.innerHTML = '<div class="p-4 bg-red-50 rounded-xl text-center text-red-400 text-[10px] font-bold uppercase border border-red-100">Fallo en la sincronización de información docente.</div>';
        }
    }

    function renderParcialTabs(activities) {
        const tabsContainer = document.getElementById('parcial-tabs-container');
        if (!tabsContainer) return;

        if (!activities || activities.length === 0) {
            tabsContainer.innerHTML = '';
            tasksList.innerHTML = `
                <div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100 animate-fade-in">
                    <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Sin pendientes!</h3>
                    <p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                        No se han encontrado tareas ni exámenes asignados para tu grado y sección en este momento.
                    </p>
                </div>`;
            return;
        }

        const parciales = [...new Set(activities.map(a => a.parcial))];
        parciales.sort((a, b) => (PARCIAL_ORDER[b] || 0) - (PARCIAL_ORDER[a] || 0));

        const activeParcial = parciales[0];

        tabsContainer.innerHTML = `
            <div class="flex flex-nowrap overflow-x-auto gap-2 pb-2 scroll-horizontal-clean">
                ${parciales.map(p => {
                    const isActive = p === activeParcial;
                    const activeClass = isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200';
                    return `<button class="flex-none px-4 py-2 rounded-xl font-semibold transition-all text-[10px] uppercase tracking-widest ${activeClass} parcial-tab" data-parcial="${p}">${p}</button>`;
                }).join('')}
            </div>
        `;

        // Interactividad
        tabsContainer.querySelectorAll('.parcial-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabsContainer.querySelectorAll('.parcial-tab').forEach(b => {
                    b.classList.remove('bg-blue-600', 'text-white');
                    b.classList.add('bg-gray-100', 'text-gray-500', 'hover:bg-gray-200');
                });
                const target = e.currentTarget;
                target.classList.remove('bg-gray-100', 'text-gray-500', 'hover:bg-gray-200');
                target.classList.add('bg-blue-600', 'text-white');

                const p = target.dataset.parcial;
                const activitiesInParcial = allActivitiesData.filter(a => a.parcial === p);
                renderSubjectNav(activitiesInParcial, p);
            });
        });

        // Seleccionar primer parcial por defecto
        tabsContainer.querySelector('.parcial-tab').click();
    }

    function renderActivities(filtered) {
        if (!filtered || filtered.length === 0) {
            tasksList.innerHTML = `
                <div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100 animate-fade-in">
                    <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Todo al día!</h3>
                    <p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                        No hay actividades pendientes ni registradas para esta materia en el parcial seleccionado.
                    </p>
                </div>`;
            return;
        }
        tasksList.innerHTML = filtered.map(activity => {
            let feedbackHtml = '';
            let actionButtonHtml = '';

            if (activity.type === 'Tarea' || activity.type === 'Credito Extra') {
                if (activity.entrega) {
                    const status = activity.entrega.estado;
                    const isPending = (status === 'Pendiente de revisión' || status === 'Pendiente' || !status);
                    const isResubmittable = (status === 'Rechazada' || status === 'Tarea incompleta');

                    const statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' || status === 'Tarea incompleta' ? 'text-red-600' : 'text-yellow-600');
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                    let fileLinkHtml = '';
                    if (isPending && activity.entrega.fileId) {
                        const fileId = activity.entrega.fileId;
                        const url = activity.entrega.mimeType === 'folder'
                            ? `https://drive.google.com/drive/folders/${fileId}`
                            : `https://drive.google.com/uc?id=${fileId}`;
                        fileLinkHtml = `<div class="mt-2"><a href="${url}" target="_blank" class="text-blue-600 font-medium hover:underline text-sm flex items-center space-x-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg><span>Ver mi entrega</span></a></div>`;
                    }

                    const deleteBtnHtml = isPending
                        ? `<button class="btn-ima-cancel px-3 py-1 text-[10px] delete-submission-btn" data-type="${activity.type}" data-entrega-id="${activity.entrega.entregaId}">Eliminar Entrega</button>`
                        : '';

                    let resubmitBtnHtml = '';
                    if (isResubmittable) {
                        resubmitBtnHtml = `<button class="btn-ima-primary mt-3 w-full py-2 text-xs open-submission-modal"
                            data-task-id="${activity.tareaId}"
                            data-task-title="${activity.titulo} (Re-entrega)"
                            data-parcial="${activity.parcial || ''}"
                            data-asignatura="${activity.asignatura || ''}">Subir Parte Pendiente</button>`;
                    }

                    feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Estado de Entrega</h4>
                                    <p class="text-sm font-semibold ${statusColor}">${displayStatus}</p>
                                    ${fileLinkHtml}
                                </div>
                                ${deleteBtnHtml}
                            </div>
                            ${activity.entrega.calificacion ? `<div class="mt-3 pt-3 border-t border-gray-100"><span class="text-[10px] font-medium text-gray-400 uppercase">Nota:</span> <span class="text-sm font-semibold text-blue-600">${activity.entrega.calificacion}</span></div>` : ''}
                            ${activity.entrega.comentario ? `<div class="mt-1"><span class="text-[10px] font-medium text-gray-400 uppercase">Obs:</span> <p class="text-xs text-gray-600 italic mt-1 leading-relaxed">${activity.entrega.comentario}</p></div>` : ''}
                            ${resubmitBtnHtml}
                        </div>`;
                } else {
                    actionButtonHtml = `<button class="btn-ima-primary px-5 py-2 text-xs open-submission-modal"
                        data-task-id="${activity.tareaId}"
                        data-task-title="${activity.titulo}"
                        data-parcial="${activity.parcial || ''}"
                        data-asignatura="${activity.asignatura || ''}">Entregar Tarea</button>`;
                }
            } else if (activity.type === 'Examen') {
                if (activity.entrega) {
                    const status = activity.entrega.estado;
                    const isPending = (status === 'Pendiente' || !status);
                    const statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' ? 'text-red-600' : 'text-yellow-600');
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                    const deleteBtnHtml = isPending
                        ? `<button class="btn-ima-cancel px-3 py-1 text-[10px] delete-submission-btn" data-type="Examen" data-entrega-id="${activity.entrega.entregaId}">Eliminar Entrega</button>`
                        : '';

                    feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Estado de Examen</h4>
                                    <p class="text-sm font-semibold ${statusColor}">${displayStatus}</p>
                                </div>
                                ${deleteBtnHtml}
                            </div>
                            ${activity.entrega.calificacion ? `<div class="mt-3 pt-3 border-t border-gray-100"><span class="text-[10px] font-medium text-gray-400 uppercase">Nota:</span> <span class="text-sm font-semibold text-purple-600">${activity.entrega.calificacion}</span></div>` : ''}
                            ${activity.entrega.comentario ? `<div class="mt-1"><span class="text-[10px] font-medium text-gray-400 uppercase">Obs:</span> <p class="text-xs text-gray-600 italic mt-1 leading-relaxed">${activity.entrega.comentario}</p></div>` : ''}
                        </div>`;
                } else {
                    const estado = activity.estado || 'Inactivo';
                    if (estado === 'Activo') {
                        actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="btn-ima-primary bg-purple-600 hover:bg-purple-700 px-6 py-2 text-xs">Realizar Examen</a>`;
                    } else {
                        actionButtonHtml = `<button class="bg-gray-100 text-gray-400 px-5 py-2 rounded-xl text-[10px] font-medium uppercase cursor-not-allowed" disabled>${estado}</button>`;
                    }
                }
            }

            return `
                <div class="card-ima assignment-card cursor-pointer group" data-task-id="${activity.tareaId || activity.examenId}">
                    <div class="flex justify-between items-start">
                        <div class="flex-grow">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[9px] font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${activity.type}</span>
                                <span class="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">${activity.asignatura || 'General'}</span>
                            </div>
                            <h3 class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tighter">${activity.titulo}</h3>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">${formatDate(activity.fechaLimite)}</span>
                            <svg class="w-4 h-4 text-gray-300 transform group-[.is-expanded]:rotate-180 transition-transform duration-200 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <div class="assignment-content overflow-hidden max-h-0 transition-all duration-300 ease-in-out group-[.is-expanded]:max-h-[1200px]">
                        <div class="pt-4 mt-4 border-t border-gray-50">
                            <div class="assignment-content-scroll scroll-minimalist mb-4">
                                <div class="text-gray-600 text-sm font-medium mb-5 leading-relaxed quill-content">${activity.descripcion || 'Sin descripción.'}</div>
                            </div>
                            <div class="flex justify-center md:justify-start">
                                ${actionButtonHtml}
                            </div>
                            ${feedbackHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- Lógica del Modal ---
    function openSubmissionModal(taskId, taskTitle, parcial, asignatura) {
        currentTaskId = taskId;
        currentTaskParcial = parcial;
        currentTaskAsignatura = asignatura;
        modalTaskTitle.textContent = taskTitle;
        uploadedFiles = [];
        currentFolderId = null;
        isSubmitting = false; // Resetear flag al abrir

        uploadedFilesList.innerHTML = '';
        uploadedFilesContainer.classList.add('hidden');
        filePreviewContainer.classList.add('hidden');
        fileInput.value = '';
        updateConfirmButtonState();

        submissionModal.classList.remove('hidden');
    }

    async function closeSubmissionModal() {
        if (activeUploads > 0 && !isSubmitting) {
            if (!confirm('Hay una subida en progreso. ¿Estás seguro de cerrar el modal?')) return;
        }

        // Solo mostrar advertencia si NO estamos en proceso de submit y hay archivos (Req 2)
        if (uploadedFiles.length > 0 && !isSubmitting) {
            if (confirm('«Los archivos cargados se perderán si abandona esta entrega. ¿Desea continuar?»')) {
                // Eliminar archivos temporales silenciosamente en segundo plano
                const filesToDelete = [...uploadedFiles];
                uploadedFiles = [];
                filesToDelete.forEach(f => {
                    fetchApi('TASK', 'deleteFile', { fileId: f.fileId }).catch(e => console.warn("Fallo limpieza silenciosa:", e));
                });
            } else {
                return;
            }
        }

        submissionModal.classList.add('hidden');
        submissionForm.reset();
        uploadedFilesList.innerHTML = '';
        uploadedFilesContainer.classList.add('hidden');
        updateConfirmButtonState();
        isSubmitting = false;
    }

    function updateConfirmButtonState() {
        if (!confirmSubmissionBtn) return;
        if (uploadedFiles.length > 0 && activeUploads === 0) {
            confirmSubmissionBtn.disabled = false;
            confirmSubmissionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            confirmSubmissionBtn.disabled = true;
            confirmSubmissionBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    if (tasksList) {
        tasksList.addEventListener('click', async (e) => {
            const assignmentCard = e.target.closest('.assignment-card');
            const isButton = e.target.closest('button, a');

            if (assignmentCard && !isButton) {
                const alreadyExpanded = assignmentCard.classList.contains('is-expanded');
                // Collapse all
                document.querySelectorAll('.assignment-card').forEach(card => card.classList.remove('is-expanded'));
                // Toggle if not already expanded
                if (!alreadyExpanded) assignmentCard.classList.add('is-expanded');
                return;
            }

            if (e.target && e.target.classList.contains('open-submission-modal')) {
                const ds = e.target.dataset;
                openSubmissionModal(ds.taskId, ds.taskTitle, ds.parcial, ds.asignatura);
            }

            if (e.target && e.target.classList.contains('delete-submission-btn')) {
                const type = e.target.dataset.type;
                const entregaId = e.target.dataset.entregaId;

                if (confirm('ATENCIÓN: Al eliminar tu entrega podrías perder la nota de calificación')) {
                    e.target.disabled = true;
                    e.target.textContent = 'Eliminando...';
                    try {
                        const service = type === 'Examen' ? 'EXAM' : 'TASK';
                        const action = type === 'Examen' ? 'deleteExamSubmission' : 'deleteSubmission';
                        const result = await fetchApi(service, action, { entregaId });
                        if (result.status === 'success') {
                            alert('Entrega eliminada correctamente.');
                            fetchAllActivities();
                        } else {
                            throw new Error(result.message);
                        }
                    } catch (error) {
                        alert('Error al eliminar entrega: ' + error.message);
                        e.target.disabled = false;
                        e.target.textContent = 'Eliminar Entrega';
                    }
                }
            }
        });
    }

    // --- (Req 3.3) Optimizador de Subida de Alta Fidelidad ---
    let uploadQueue = [];

    async function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1200;
                    if (width > height) {
                        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    } else {
                        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function startAutomatedUpload(files) {
        if (files.length === 0 || activeUploads > 0) return;

        // Configuración de Límites y Fragmentación (Tarea 1: Multipart Reengineering)
        const CHUNK_THRESHOLD = 9.5 * 1024 * 1024; // 9.5MB (Activador de Esquema de Segmentación Binaria Autónoma)
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB por fragmento (Optimizado para evitar Gateway Timeout)

        filePreviewContainer.classList.remove('hidden');
        uploadedFilesContainer.classList.remove('hidden');

        for (const currentFile of files) {
            if (uploadedFiles.some(u => u.fileName === currentFile.name && u.size === currentFile.size)) continue;

            const currentFileName = currentFile.name;
            const currentFileSize = currentFile.size;

            const li = document.createElement('li');
            li.className = 'flex flex-col text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up gap-3';

            let thumbnailHtml = `<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><i class="fas fa-file"></i></div>`;
            const ext = currentFileName.split('.').pop().toLowerCase();

            if (currentFile.type.startsWith('image/') || ext === 'heic') {
                if (ext === 'heic') {
                    thumbnailHtml = `<div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400"><i class="fas fa-image"></i></div>`;
                } else {
                    const tempUrl = URL.createObjectURL(currentFile);
                    thumbnailHtml = `<img src="${tempUrl}" class="w-12 h-12 object-cover rounded-lg shadow-inner">`;
                }
            } else if (currentFile.type === 'application/pdf' || ext === 'pdf') {
                thumbnailHtml = `<div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-400"><i class="fas fa-file-pdf"></i></div>`;
            } else if (['html', 'css', 'js', 'psc'].includes(ext)) {
                const colors = { html: 'text-orange-500', css: 'text-blue-500', js: 'text-yellow-500', psc: 'text-green-500' };
                const icons = { html: 'fa-code', css: 'fa-css3', js: 'fa-js', psc: 'fa-terminal' };
                thumbnailHtml = `<div class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center ${colors[ext] || 'text-gray-400'}"><i class="fas ${icons[ext] || 'fa-file-code'}"></i></div>`;
            }

            li.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 truncate">
                        ${thumbnailHtml}
                        <div class="truncate">
                            <p class="truncate text-xs font-bold text-gray-800 uppercase tracking-tighter">${currentFileName}</p>
                            <p class="text-[10px] text-gray-400 font-medium uppercase tracking-widest" id="upload-progress-text">Preparando...</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                </div>
                <div class="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100">
                    <div id="upload-progress-bar" class="bg-blue-600 h-full transition-all duration-300" style="width: 0%"></div>
                </div>
            `;
            uploadedFilesList.appendChild(li);

            activeUploads++;
            updateConfirmButtonState();

            try {
                let uploadResult;
                const progressSpan = li.querySelector('#upload-progress-text');
                const progressBar = li.querySelector('#upload-progress-bar');
                let fileData;
                let mimeType = currentFile.type;

                if (currentFile.name.toLowerCase().endsWith('.pdf')) {
                    mimeType = 'application/pdf';
                }

                if (currentFile.type.startsWith('image/') && !currentFile.name.toLowerCase().endsWith('.heic')) {
                    progressSpan.textContent = "Optimizando...";
                    if (progressBar) progressBar.style.width = '10%';
                    fileData = await compressImage(currentFile);
                } else {
                    fileData = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(currentFile);
                    });
                }

                const fileSize = currentFile.size;

                // REQ: Segmentación Binaria Autónoma if >= CHUNK_THRESHOLD (Tarea 1)
                if (fileSize >= CHUNK_THRESHOLD) {
                    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
                    const uploadId = "UP-" + Date.now();

                    for (let i = 0; i < totalChunks; i++) {
                        const percent = Math.round((i / totalChunks) * 100);
                        progressSpan.textContent = `Parte ${i+1} de ${totalChunks} (${percent}%)`;
                        if (progressBar) progressBar.style.width = `${percent}%`;

                        const start = i * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, fileSize);
                        // Segmentación Binaria Autónoma (MIME Integrity)
                        const blobChunk = currentFile.slice(start, end, currentFile.type);

                        const chunkData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = () => reject(new Error("Error de lectura de archivo"));
                            reader.readAsDataURL(blobChunk);
                        });

                        // Nombramiento Estructurado (Tarea 1)
                        const partFileName = `${currentFileName.split('.')[0]} - Parte ${i + 1} de ${totalChunks}.${currentFileName.split('.').pop()}`;

                        let success = false;
                        let attempts = 0;
                        while (!success && attempts < 3) {
                            try {
                                // Subida Directa e Independiente (Evita Timeout en Reconstrucción)
                                const chunkRes = await fetchApi('TASK', 'uploadFile', {
                                    userId: currentUser.userId,
                                    tareaId: currentTaskId,
                                    fileName: partFileName,
                                    fileData: chunkData,
                                    parcial: currentTaskParcial,
                                    asignatura: currentTaskAsignatura
                                });

                                if (chunkRes.status === 'success') {
                                    success = true;
                                    uploadResult = chunkRes; // El último chunk define el folderId final
                                    currentFolderId = chunkRes.data.folderId;
                                } else throw new Error(chunkRes.message || "Error en subida de parte");
                            } catch (e) {
                                attempts++;
                                console.warn(`[IMA-UPLOAD] Intento ${attempts}/3 fallido para parte ${i + 1}`);
                                if (attempts >= 3) throw e;
                                await new Promise(r => setTimeout(r, 1500 * attempts));
                            }
                        }
                    }
                    if (progressBar) progressBar.style.width = '100%';
                    progressSpan.textContent = "Partes subidas";
                } else {
                    progressSpan.textContent = "Subiendo...";
                    if (progressBar) progressBar.style.width = '50%';
                    uploadResult = await fetchApi('TASK', 'uploadFile', {
                        userId: currentUser.userId, tareaId: currentTaskId,
                        fileName: currentFileName, fileData: fileData,
                        parcial: currentTaskParcial, asignatura: currentTaskAsignatura
                    });
                    if (progressBar) progressBar.style.width = '100%';
                }

                if (uploadResult.status === 'success') {
                    const uploadedData = uploadResult.data;
                    // REQ: Si el archivo fue segmentado (o hay varios), la entrega final debe apuntar a la carpeta (Tarea 1)
                    const finalMimeType = fileSize >= CHUNK_THRESHOLD ? 'folder' : uploadedData.mimeType;
                    const finalFileId = fileSize >= CHUNK_THRESHOLD ? uploadedData.folderId : uploadedData.fileId;

                    uploadedFiles.push({
                        fileId: finalFileId,
                        fileName: currentFileName,
                        size: currentFileSize,
                        mimeType: finalMimeType
                    });
                    currentFolderId = uploadedData.folderId;

                    li.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3 truncate">
                                ${thumbnailHtml}
                                <div class="truncate">
                                    <p class="truncate text-xs font-bold text-gray-800 uppercase tracking-tighter">${currentFileName}</p>
                                    <p class="text-[10px] text-green-600 font-bold uppercase tracking-widest">Listo</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                <button type="button" class="text-red-400 hover:text-red-600 remove-file-btn p-1 transition-all hover:scale-110" data-file-id="${uploadedData.fileId}">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>
                    `;
                } else throw new Error(uploadResult.message);

            } catch (error) {
                console.error("Error detallado de subida:", error);
                let friendlyMsg = "Error inesperado";
                const msg = error.message.toLowerCase();
                if (msg.includes("network") || msg.includes("fetch")) friendlyMsg = "Error de conexión";
                else if (msg.includes("large") || msg.includes("size")) friendlyMsg = "Archivo demasiado grande";
                else if (msg.includes("quota") || msg.includes("storage")) friendlyMsg = "Error de almacenamiento";
                else if (msg.includes("corrupt")) friendlyMsg = "Archivo dañado";
                else if (msg.includes("permission") || msg.includes("access")) friendlyMsg = "Error de permisos";

                li.innerHTML = `
                    <div class="flex items-center justify-between w-full p-1 bg-red-50 rounded border border-red-100">
                        <div class="flex items-center gap-2 truncate">
                            <i class="fas fa-exclamation-circle text-red-500 text-xs"></i>
                            <span class="text-red-600 text-[10px] truncate font-bold uppercase tracking-tighter">${friendlyMsg}: ${currentFileName}</span>
                        </div>
                        <button class="text-[10px] text-red-800 font-black ml-2 hover:bg-red-100 px-1.5 py-0.5 rounded" onclick="this.closest('li').remove()">✕</button>
                    </div>`;
            } finally {
                activeUploads--;
                updateConfirmButtonState();
            }
        }
        filePreviewContainer.classList.add('hidden');
        fileInput.value = '';
    }

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            const MAX_SIZE_MB = 50;
            const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'pdf', 'html', 'css', 'js', 'psc'];

            const validFiles = [];
            for (const file of files) {
                const ext = file.name.split('.').pop().toLowerCase();
                const sizeMB = file.size / (1024 * 1024);

                if (!ALLOWED_EXT.includes(ext)) {
                    alert(`El archivo "${file.name}" no tiene un formato permitido.`);
                    continue;
                }
                if (sizeMB > MAX_SIZE_MB) {
                    alert(`El archivo "${file.name}" excede el límite de ${MAX_SIZE_MB}MB.`);
                    continue;
                }
                validFiles.push(file);
            }

            if (validFiles.length > 0) {
                startAutomatedUpload(validFiles);
            } else {
                fileInput.value = '';
            }
        });
    }

    if (cancelSubmissionBtn) cancelSubmissionBtn.addEventListener('click', closeSubmissionModal);

    if (uploadedFilesList) {
        uploadedFilesList.addEventListener('click', async (e) => {
            const btn = e.target.closest('.remove-file-btn');
            if (btn) {
                const fileId = btn.dataset.fileId;
                const li = btn.closest('li');

                // (A-30) Eliminar archivo remoto
                btn.disabled = true;
                li.style.opacity = '0.5';

                try {
                    // Se intenta eliminar de Drive pero no bloqueamos si falla la red
                    await fetchApi('TASK', 'deleteFile', { fileId });
                } catch (error) {
                    console.error("Error al eliminar archivo remoto:", error);
                }

                uploadedFiles = uploadedFiles.filter(f => f.fileId !== fileId);
                li.remove();
                if (uploadedFiles.length === 0) {
                    uploadedFilesContainer.classList.add('hidden');
                }
                updateConfirmButtonState();
            }
        });
    }

    if (submissionForm) {
        submissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Protección contra duplicados y subidas incompletas (Req 3)
            if (isSubmitting || uploadedFiles.length === 0 || activeUploads > 0) return;

            isSubmitting = true; // Bloquear nuevas acciones (Req 3.1)
            confirmSubmissionBtn.disabled = true;
            confirmSubmissionBtn.classList.add('btn-loading');
            confirmSubmissionBtn.textContent = 'Procesando...'; // Estado de procesamiento (Req 3.3)

            try {
                let finalFileId = uploadedFiles[0].fileId;
                let finalMimeType = uploadedFiles[0].mimeType;

                if (uploadedFiles.length > 1) {
                    finalFileId = currentFolderId;
                    finalMimeType = 'folder';
                }

                const payload = {
                    userId: currentUser.userId,
                    tareaId: currentTaskId,
                    fileId: finalFileId,
                    mimeType: finalMimeType
                };

                const result = await fetchApi('TASK', 'submitAssignment', payload);
                if (result.status === 'success') {
                    // Operación exitosa: limpiar archivos para evitar advertencia (Caso 2)
                    uploadedFiles = [];
                    alert('¡Tarea entregada exitosamente!');
                    closeSubmissionModal();
                    fetchAllActivities();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                alert(`Error al finalizar la entrega: ${error.message}`);
                isSubmitting = false; // Permitir re-intento si falló el servidor
            } finally {
                confirmSubmissionBtn.disabled = false;
                confirmSubmissionBtn.classList.remove('btn-loading');
                confirmSubmissionBtn.textContent = 'Entregar Tarea';
                updateConfirmButtonState();
            }
        });
    }



    /**
     * WhatsApp Group Button Logic
     */
    window.initWhatsAppButton = async function() {
        const waActive = document.getElementById('wa-group-btn');
        const waDisabled = document.getElementById('wa-group-btn-disabled');
        if (!waActive || !waDisabled) return;

        try {
            // WhatsApp links are now assigned by GRADO only
            const res = await fetchApi('USER', 'getWhatsAppLink', {
                grado: currentUser.grado
            });

            if (res.status === 'success' && res.link) {
                waActive.href = res.link;
                waActive.classList.remove('hidden');
                waDisabled.classList.add('hidden');
            } else {
                waActive.classList.add('hidden');
                waDisabled.classList.remove('hidden');
                waDisabled.innerHTML = '<svg class="w-6 h-6 fill-current opacity-50" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.101.004.242-.038.379.292.144.35.492 1.2.535 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.231-.144.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg> Grupo no disponible para tu grado';
            }
        } catch (e) {
            console.error("Error fetching WhatsApp link:", e);
            waActive.classList.add('hidden');
            waDisabled.classList.remove('hidden');
        }
    };

    fetchAllActivities();
    initWhatsAppButton();

    async function fetchAndRenderLearningProfile(dataOnly = false) {
        try {
            const res = await fetchApi('USER', 'getLearningProfile', { userId: currentUser.userId });
            if (res.status === 'success' && res.data && res.data.length > 0) {
                if (dataOnly) return res.data;
                renderLearningProfileData(res.data);
            }
            return null;
        } catch (e) {
            console.error("Error al cargar perfil de dominio:", e);
            return null;
        }
    }

    function renderLearningProfileData(profileData) {
        const profileContainer = document.getElementById('learning-profile-integration');
        if (!profileContainer) return;

        try {
                // REQ: Recomendaciones académicas con enlaces directos
                const findPresentation = (tema) => {
                    if (!window.presentationData) return null;
                    for (const grade of window.presentationData) {
                        for (const subject of grade.subjects) {
                            for (const topic of subject.topics) {
                                if (topic.title.toLowerCase().includes(tema.toLowerCase()) ||
                                    tema.toLowerCase().includes(topic.title.toLowerCase())) {
                                    return topic.file;
                                }
                            }
                        }
                    }
                    return null;
                };

                const sortedByDominio = [...profileData].sort((a, b) => b.dominio - a.dominio);

                // REQ: Filtrar temas genéricos (v3.2)
                const strengths = sortedByDominio.filter(i => i.dominio >= 80 && i.tema !== 'General').slice(0, 3);
                const weaknesses = sortedByDominio.filter(i => i.dominio < 60 && i.tema !== 'General').reverse().slice(0, 3);

                const avgDominio = Math.round(profileData.reduce((sum, item) => sum + item.dominio, 0) / profileData.length);

                let classification = "Requiere Refuerzo";
                let badgeClass = "bg-orange-50 text-orange-600";
                if (avgDominio >= 90) { classification = "Maestro"; badgeClass = "bg-purple-50 text-purple-600"; }
                else if (avgDominio >= 75) { classification = "Avanzado"; badgeClass = "bg-emerald-50 text-emerald-600"; }
                else if (avgDominio >= 60) { classification = "Competente"; badgeClass = "bg-blue-50 text-blue-600"; }
                else if (avgDominio >= 40) { classification = "En Desarrollo"; badgeClass = "bg-yellow-50 text-yellow-600"; }

                // REQ: Recomendación Directa (v3.2) - Banner de Alerta Crítica
                let alertBanner = '';
                const criticalTopic = weaknesses.find(w => w.dominio < 50);
                if (criticalTopic) {
                    const presFile = findPresentation(criticalTopic.tema);
                    alertBanner = `
                        <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between animate-pulse">
                            <div>
                                <p class="text-[10px] font-black text-red-600 uppercase tracking-widest">Alerta de Aprendizaje</p>
                                <p class="text-xs font-bold text-gray-800">Dominio crítico en: ${criticalTopic.tema}</p>
                            </div>
                            ${presFile ? `<button onclick="window.open('${presFile}', '_blank')" class="px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">Repasar Ahora</button>` : ''}
                        </div>
                    `;
                }

                profileContainer.innerHTML = `
                    ${alertBanner}
                    <div class="mt-8 pt-8 border-t border-gray-50 animate-fade-in-up">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Análisis de Desempeño</h4>
                                <p class="text-base font-bold text-gray-800 tracking-tight">Tu Perfil de Aprendizaje Real</p>
                            </div>
                            <div class="text-right">
                                <span class="px-3 py-1 ${badgeClass} rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-current opacity-80">${classification}</span>
                                <p class="text-[9px] text-gray-400 font-bold uppercase mt-2">Promedio General: ${avgDominio}%</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Fortalezas -->
                            <div class="bg-emerald-50/30 border border-emerald-100/50 p-5 rounded-[2rem]">
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs shadow-sm">
                                        <i class="fas fa-arrow-trend-up"></i>
                                    </div>
                                    <h5 class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Tus Fortalezas</h5>
                                </div>
                                <div class="space-y-3">
                                    ${strengths.length > 0 ? strengths.map(s => `
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-gray-700 uppercase tracking-tighter">${s.tema}</span>
                                            <span class="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-emerald-100">${s.dominio}%</span>
                                        </div>
                                    `).join('') : '<p class="text-[10px] text-gray-400 italic">Sigue practicando para identificar tus fortalezas</p>'}
                                </div>
                            </div>

                            <!-- Debilidades / Recomendaciones -->
                            <div class="bg-orange-50/30 border border-orange-100/50 p-5 rounded-[2rem]">
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs shadow-sm">
                                        <i class="fas fa-lightbulb"></i>
                                    </div>
                                    <h5 class="text-[10px] font-black text-orange-700 uppercase tracking-widest">Temas a Reforzar</h5>
                                </div>
                                <div class="space-y-4">
                                    ${weaknesses.length > 0 ? weaknesses.map(w => {
                                        const file = findPresentation(w.tema);
                                        const action = file ? `window.open('${file}', '_blank')` : "window.scrollTo({top: document.getElementById('resources-section')?.offsetTop || 0, behavior: 'smooth'})";
                                        return `
                                        <div class="flex flex-col gap-1">
                                            <div class="flex items-center justify-between">
                                                <span class="text-xs font-bold text-gray-700 uppercase tracking-tighter">${w.tema}</span>
                                                <span class="text-[10px] font-black text-orange-600">${w.dominio}%</span>
                                            </div>
                                            <button onclick="${action}" class="w-max text-[9px] font-black text-orange-700 uppercase tracking-widest hover:underline flex items-center gap-1">
                                                <i class="fas fa-book-open text-[8px]"></i> ${file ? 'Repasar Ahora' : 'Ver Presentación'}
                                            </button>
                                        </div>
                                    `;}).join('') : '<p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">¡Excelente! No tienes temas críticos pendientes</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        } catch (e) {
            console.error("Error al renderizar perfil de dominio:", e);
        }
    }

    window.addEventListener('beforeunload', (e) => {
        if (!isSubmitting && (activeUploads > 0 || uploadedFiles.length > 0)) {
            e.preventDefault();
            e.returnValue = '«Los archivos cargados se perderán si abandona esta entrega. ¿Desea continuar?»';
        }
    });
});
