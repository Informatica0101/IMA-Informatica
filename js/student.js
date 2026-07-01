document.addEventListener('DOMContentLoaded', function() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    var firstName = currentUser.nombre.split(' ')[0];
    var studentNameEl = document.getElementById('student-name');
    if (studentNameEl) studentNameEl.textContent = firstName;
    var tasksList = document.getElementById('tasks-list');
    var logoutButton = document.getElementById('logout-button');

    // --- Mi Perfil (Centralizado en ui-common.js) ---

    var PARCIAL_ORDER = {
        "IV parcial": 4,
        "III parcial": 3,
        "II parcial": 2,
        "I parcial": 1
    };
    var allActivitiesData = [];
    var academicHistory = []; // Tarea 4: Persistencia Histórica (v7.8.2)

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // --- Elementos del Modal ---
    var submissionModal = document.getElementById('submission-modal');
    var modalTaskTitle = document.getElementById('modal-task-title');
    var submissionForm = document.getElementById('submission-form');
    var fileInput = document.getElementById('file-input');
    var cancelSubmissionBtn = document.getElementById('cancel-submission-btn');
    var filePreviewContainer = document.getElementById('file-preview-container');
    var fileInfoPreview = document.getElementById('file-info-preview');
    var uploadedFilesContainer = document.getElementById('uploaded-files-container');
    var uploadedFilesList = document.getElementById('uploaded-files-list');
    var confirmSubmissionBtn = document.getElementById('confirm-submission-btn');

    var currentTaskId = null;
    var currentTaskParcial = null;
    var currentTaskAsignatura = null;
    var uploadedFiles = []; // [{fileId, fileName, mimeType}]
    var currentFolderId = null;
    var activeUploads = 0;
    var isSubmitting = false; // Flag para evitar avisos tras entrega exitosa (Tarea 3)

    // Tarea 3 (Fase Diagnóstico): Renderizar encabezado de perfil inmediatamente
    function renderStudentHeader() {
        var profileHeader = document.getElementById('student-profile-header');
        if (!profileHeader || !currentUser) return;

        profileHeader.innerHTML = `
            <div class="card-ima bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm animate-fade-in-up">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-100 relative">
                            ${currentUser.nombre.charAt(0)}
                            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-md">
                                <i class="fas fa-check text-[10px]"></i>
                            </div>
                        </div>
                        <div>
                            <span class="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest mb-1">Estudiante Informática</span>
                            <h2 class="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tighter">${currentUser.nombre}</h2>
                            <div class="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                <span>${currentUser.grado} - ${currentUser.seccion}</span>
                                <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>Lista #${currentUser.numeroLista || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div id="header-mini-stats" class="flex gap-4">
                        <!-- Se poblará con mini-métricas si es necesario -->
                    </div>
                </div>
            </div>
        `;
    }
    renderStudentHeader();

    function formatDate(isoString) {
        if (!isoString) return 'N/A';
        try {
            var date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            var day = String(date.getUTCDate()).padStart(2, '0');
            var month = String(date.getUTCMonth() + 1).padStart(2, '0');
            var year = date.getUTCFullYear();
            return day + '/' + month + '/' + year;
        } catch (e) {
            return isoString;
        }
    }

    // Tarea 4: Recuperar historial de configuraciones académicas anteriores
    async function fetchAcademicHistory() {
        try {
            var res = await fetchApi('USER', 'getAcademicHistory', {
                grado: currentUser.grado,
                seccion: currentUser.seccion
            });
            if (res && res.status === 'success') {
                academicHistory = res.data || [];
                console.log("[Student] Historial académico cargado:", academicHistory.length, "registros");
            }
        } catch (e) {
            console.warn("[Student] No se pudo cargar el historial académico:", e);
        }
    }

    // Función para obtener Tareas y Exámenes
    window.fetchAllActivities = async function() {
        if (!tasksList) return;

        // Tarea 4: Cargar historial en paralelo para optimizar (v7.8.2)
        var historyPromise = fetchAcademicHistory();

        // REQ: Eager Caching & Offline-First (Modulo 1)
        // Priorizar renderizado local de 0ms desde cache_estudiante_dashboard
        var hasLocalData = false;
        if (window.PersistenceManager) {
            var cached = await window.PersistenceManager.get('cache_estudiante_dashboard');
            if (cached && cached.data) {
                allActivitiesData = cached.data.allActivities || [];
                // Esperar al historial si es necesario para los botones
                await historyPromise;
                renderStudentExpediente(allActivitiesData);
                renderSubjectNavigation(allActivitiesData);
                // Si ya tenemos caché, procedemos a conciliación silenciosa sin bloquear la UI
                hasLocalData = true;
            }
        }

        if (!hasLocalData) {
            // REQ: Skeleton Screen (Modulo 3)
            tasksList.innerHTML = `
                <div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    ${Array(6).fill(0).map(function() { return `
                        <div class="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                            <div class="skeleton h-4 w-1/3 rounded"></div>
                            <div class="skeleton h-6 w-3/4 rounded"></div>
                            <div class="skeleton h-20 w-full rounded-2xl"></div>
                            <div class="flex justify-between items-center">
                                <div class="skeleton h-8 w-1/2 rounded-xl"></div>
                                <div class="skeleton h-8 w-8 rounded-full"></div>
                            </div>
                        </div>
                    `; }).join('')}
                </div>
            `;
        }

        try {
            var payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };

            // REQ 2: No disparar loader global si ya renderizamos desde caché
            if (!hasLocalData && window.GamesAdapter) window.GamesAdapter.showLoading(true);

            // REQ: Sync Global Scope from Server (v7.7.5 - Use unified syncAcademicScope)
            if (window.syncAcademicScope) {
                // Tarea 3: Garantizar carga síncrona/esperada de la configuración global
                await window.syncAcademicScope();
            }

            // Tarea 4: Asegurar que el historial esté listo
            await historyPromise;

            // REQ: Mitigación de Latencia mediante Paralelismo y Silent Reconciliation (Ticket 4)
            var results = await Promise.all([
                fetchApi('TASK', 'getStudentTasks', payload, 0, {
                    store: 'cache_estudiante_tasks',
                    onUpdate: function(data) {
                        if (!Array.isArray(data)) return;
                        var tasks = data.map(function(t) { return { ...t, type: t.tipo || 'Tarea' }; });
                        allActivitiesData = [
                            ...allActivitiesData.filter(function(a) { return a.type === 'Examen'; }),
                            ...tasks
                        ];
                        renderStudentExpediente(allActivitiesData);
                        renderSubjectNavigation(allActivitiesData);
                    }
                }),
                fetchApi('EXAM', 'getStudentExams', payload, 0, {
                    store: 'cache_estudiante_exams',
                    onUpdate: function(data) {
                        if (!Array.isArray(data)) return;
                        var exams = data.map(function(e) { return { ...e, type: 'Examen' }; });
                        allActivitiesData = [
                            ...allActivitiesData.filter(function(a) { return a.type !== 'Examen'; }),
                            ...exams
                        ];
                        renderStudentExpediente(allActivitiesData);
                        renderSubjectNavigation(allActivitiesData);
                    }
                }),
                fetchAndRenderLearningProfile(true) // Obtener datos de perfil sin renderizar aún
            ]);

            var tasksResult = results[0];
            var examsResult = results[1];
            var profileResult = results[2];

            var allActivities = [];
            try {
                if (tasksResult.status === 'success' && Array.isArray(tasksResult.data)) {
                    allActivities.push(...tasksResult.data.map(function(task) {
                        return {
                            ...task,
                            type: task.tipo || 'Tarea',
                            asignatura: (task.asignatura || 'General').trim(),
                            parcial: (task.parcial || 'Sin Parcial').trim()
                        };
                    }));
                }
                if (examsResult.status === 'success' && Array.isArray(examsResult.data)) {
                    allActivities.push(...examsResult.data.map(function(exam) {
                        return {
                            ...exam,
                            type: 'Examen',
                            asignatura: (exam.asignatura || 'General').trim(),
                            parcial: (exam.parcial || 'Sin Parcial').trim()
                        };
                    }));
                }

                // Persistir en cache_estudiante_dashboard para el próximo inicio (Modulo 1)
                if (window.PersistenceManager) {
                    window.PersistenceManager.set('cache_estudiante_dashboard', {
                        allActivities: allActivities,
                        timestamp: Date.now()
                    });
                }

                allActivities.sort(function(a, b) {
                    var isReviewed = function(act) {
                        if (!act.entrega) return false;
                        var s = act.entrega.estado;
                        return (s === 'Completada' || s === 'Revisada' || s === 'Finalizado' || s === 'Rechazada');
                    };
                    var revA = isReviewed(a);
                    var revB = isReviewed(b);
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
                renderSubjectNavigation(allActivities);
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

    window.renderStudentExpediente = function(inputActivities) {
        var container = document.getElementById('student-expediente');
        if (!container) return;

        // REQ: Normalización de entrada para soportar Offline-First (v3.3)
        var activities = (inputActivities && inputActivities.status === 'success' && Array.isArray(inputActivities.data)) ? inputActivities.data : (Array.isArray(inputActivities) ? inputActivities : []);

        // REQ: Filtro Estricto por Parcial (Incidencia 5)
        // No mezclar históricos en el cálculo de progreso actual
        var currentParcialActivities = activities.filter(function(a) {
            var isParcialOk = window.normalizePartial(a.parcial) === window.normalizePartial(window.PARCIAL_ACTUAL);
            // REQ: Contextual authorization (v7.7.5)
            var isAuthorized = window.isContentAuthorized(a.parcial, a.asignatura, a.tema, a.grado, a.seccion);
            return isParcialOk && isAuthorized;
        });

        // --- Ajuste de Lógica de Progreso (Req 2) ---
        // Excluir 'Credito Extra' del total asignado (baseline), ya que son de recuperación
        var baseActivities = currentParcialActivities.filter(function(a) {
            return a.type !== 'Credito Extra' && a.type !== 'Crédito Extra';
        });
        var totalAssigned = baseActivities.length;

        // Las completadas suman puntos al progreso real (separando obligatorias de recuperación)
        var mandatoryCompleted = currentParcialActivities.filter(function(a) {
            return (a.type !== 'Credito Extra' && a.type !== 'Crédito Extra') && a.entrega &&
                (a.entrega.estado === 'Completada' || a.entrega.estado === 'Revisada' || a.entrega.estado === 'Finalizado');
        }).length;

        var extraCreditCompleted = currentParcialActivities.filter(function(a) {
            return (a.type === 'Credito Extra' || a.type === 'Crédito Extra') && a.entrega &&
                (a.entrega.estado === 'Completada' || a.entrega.estado === 'Revisada' || a.entrega.estado === 'Finalizado');
        }).length;

        // El progreso visual (slots llenos) se beneficia del crédito extra para cubrir faltantes (Req 2)
        var completed = Math.min(totalAssigned, mandatoryCompleted + extraCreditCompleted);
        var pending = Math.max(0, totalAssigned - completed);

        // Tasa de entrega basada en tareas obligatorias (Req 2: Crédito extra no es obligatorio)
        var mandatoryDelivered = currentParcialActivities.filter(function(a) {
            return (a.type !== 'Credito Extra' && a.type !== 'Crédito Extra') && a.entrega;
        }).length;
        var deliveryRate = totalAssigned > 0 ? (mandatoryDelivered / totalAssigned) : 0;

        // Puntos totales obtenidos (incluye recuperación por créditos extra)
        var gradeSum = currentParcialActivities.reduce(function(sum, a) {
            return sum + parseFloat(a.entrega ? a.entrega.calificacion || 0 : 0);
        }, 0);

        // El máximo posible se basa en las tareas obligatorias
        var maxPossible = baseActivities.reduce(function(sum, a) {
            return sum + parseFloat(a.puntaje || 100);
        }, 0);
        var academicPerformance = maxPossible > 0 ? Math.min(1, gradeSum / maxPossible) : 0;

        var onTimeCount = 0;
        activities.forEach(function(a) {
            if (a.entrega && a.fechaLimite) {
                var limit = new Date(a.fechaLimite);
                var deliveryDate = new Date(a.entrega.fecha || Date.now());
                if (deliveryDate <= limit) onTimeCount++;
            }
        });
        var totalDelivered = activities.filter(function(a) { return a.entrega; }).length;
        var punctualityRate = totalDelivered > 0 ? (onTimeCount / totalDelivered) : 1;

        var compositeProgress = Math.round((deliveryRate * 0.3 + academicPerformance * 0.5 + punctualityRate * 0.2) * 100);

        var level = "Iniciando";
        var levelColor = "text-blue-600";
        var barColor = "bg-blue-600";

        if (compositeProgress >= 90) { level = "Excelencia"; levelColor = "text-emerald-600"; barColor = "bg-emerald-500"; }
        else if (compositeProgress >= 70) { level = "Satisfactorio"; levelColor = "text-green-600"; barColor = "bg-green-500"; }
        else if (compositeProgress >= 50) { level = "En Mejora"; levelColor = "text-yellow-600"; barColor = "bg-yellow-500"; }
        else if (compositeProgress > 0) { level = "En Riesgo"; levelColor = "text-orange-600"; barColor = "bg-orange-500"; }

        // Desglose por asignatura (Tarea 1)
        var subjectStats = {};
        activities.forEach(function(a) {
            var subj = a.asignatura || 'General';
            if (!subjectStats[subj]) {
                subjectStats[subj] = { total: 0, completed: 0, score: 0, maxScore: 0, delivered: 0, onTime: 0 };
            }
            if (a.type !== 'Credito Extra' && a.type !== 'Crédito Extra') {
                subjectStats[subj].total++;
                subjectStats[subj].maxScore += parseFloat(a.puntaje || 100);
            }
            if (a.entrega) {
                subjectStats[subj].delivered++;
                if (a.entrega.estado === 'Completada' || a.entrega.estado === 'Revisada' || a.entrega.estado === 'Finalizado') {
                    subjectStats[subj].completed++;
                }
                subjectStats[subj].score += parseFloat(a.entrega.calificacion || 0);

                if (a.fechaLimite) {
                    var limit = new Date(a.fechaLimite);
                    var deliveryDate = new Date(a.entrega.fecha || Date.now());
                    if (deliveryDate <= limit) subjectStats[subj].onTime++;
                }
            }
        });

        var subjectBreakdownHtml = Object.keys(subjectStats).map(function(subj) {
            var s = subjectStats[subj];
            var progress = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
            return `
                <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">${subj}</h4>
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-[10px] font-bold text-gray-400 uppercase">Puntaje: ${s.score.toFixed(1)} / ${s.maxScore}</span>
                        <span class="text-xs font-black text-gray-900">${progress}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="bg-blue-500 h-full" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        // Tarea 3 (Fase Diagnóstico): Actualizar mini-stats en el encabezado
        var headerMiniStats = document.getElementById('header-mini-stats');
        if (headerMiniStats) {
            headerMiniStats.innerHTML = `
                <div class="hidden sm:flex items-center gap-4 animate-fade-in">
                    <div class="text-right">
                        <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Progreso</p>
                        <p class="text-sm font-black text-blue-600">${compositeProgress}%</p>
                    </div>
                    <div class="w-px h-8 bg-gray-100"></div>
                    <div class="text-right">
                        <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Completadas</p>
                        <p class="text-sm font-black text-emerald-600">${completed}</p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="space-y-6">
                <div class="card-ima bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Métricas de Desempeño</h3>
                    <div id="student-metrics-table-container" class="mb-8 overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-gray-100">
                                    <th class="py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Métrica</th>
                                    <th class="py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
                                    <th class="py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody id="student-metrics-body">
                                <tr class="animate-pulse">
                                    <td colspan="3" class="py-4 text-center text-[10px] font-bold text-gray-300 uppercase">Cargando métricas...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- Fase 9: Integración de Perfil de Dominio -->
                    <div id="learning-profile-integration"></div>
                </div>

                <!-- Desglose por Asignatura (Tarea 1) -->
                <div class="card-ima bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Desglose por Asignatura</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${subjectBreakdownHtml}
                    </div>
                </div>
            </div>
        `;
        container.classList.remove('hidden');
    }


    async function showSubjectInfo(subject) {
        var container = document.getElementById('subject-info-container');
        if (!container) return;

        container.innerHTML = '<div class="p-5 bg-gray-50 rounded-2xl text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Sincronizando información de la asignatura...</div>';
        container.classList.remove('hidden');

        try {
            // Identificar profesorId desde las actividades cargadas para esta asignatura específica
            var activity = allActivitiesData.find(function(a) {
                return (a.asignatura || 'General') === subject && a.profesorId;
            });
            var profesorId = activity ? activity.profesorId : null;

            // Info por defecto (Área de Informática)
            var profInfo = {
                nombre: "ISEMED - Área de Informática",
                email: "informatica@isemed.edu.hn",
                telefono: ""
            };

            // Intentar obtener info real del docente (A-73/75)
            if (profesorId) {
                try {
                    var res = await fetchApi('USER', 'getUserInfo', { userId: profesorId });
                    if (res.status === 'success' && res.data) {
                        profInfo = res.data;
                    }
                } catch (e) {
                    console.warn("No se pudo cargar info del docente específico:", e);
                }
            }

            // Normalizar WhatsApp del Docente
            var waPhone = profInfo.telefono ? String(profInfo.telefono).replace(/\D/g, '') : '';
            var waLink = waPhone ? 'https://wa.me/504' + waPhone : null;

            // Obtener enlace del grupo de WhatsApp por Grado (Lógica A-66 preservada)
            var groupLink = null;
            try {
                var groupRes = await fetchApi('USER', 'getWhatsAppLink', { grado: currentUser.grado });
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

    window.renderSubjectNavigation = function(inputActivities) {
        var tabsContainer = document.getElementById('subject-tabs-container');
        var parcialLabel = document.getElementById('active-parcial-label');
        var historySelector = document.getElementById('parcial-history-selector');
        if (historySelector && !historySelector.dataset.listenerAdded) {
            historySelector.addEventListener('change', function() {
                historySelector.dataset.manuallyChanged = "true";
                renderSubjectNavigation(allActivitiesData);
            });
            historySelector.dataset.listenerAdded = "true";
        }

        if (!tabsContainer || !tasksList) return;

        var activities = (inputActivities && inputActivities.status === 'success' && Array.isArray(inputActivities.data)) ? inputActivities.data : (Array.isArray(inputActivities) ? inputActivities : []);

        var activePartial = window.GLOBAL_SCOPE ? window.GLOBAL_SCOPE.ParcialActual : window.PARCIAL_ACTUAL;
        if (historySelector && !historySelector.dataset.manuallyChanged) {
            historySelector.value = window.normalizePartial(activePartial);
        }

        var selectedPartial = historySelector ? historySelector.value : activePartial;
        if (parcialLabel) parcialLabel.textContent = selectedPartial;

        var currentActivities = activities.filter(function(a) {
            var isParcialOk = window.normalizePartial(a.parcial) === window.normalizePartial(selectedPartial);
            // Tarea 2: Persistencia Histórica (Bypass parcial restrictivo para historial)
            var isAuthorized = true;
            if (window.normalizePartial(selectedPartial) === window.normalizePartial(activePartial)) {
                isAuthorized = window.isContentAuthorized(a.parcial, a.asignatura, a.tema, a.grado, a.seccion);
            }
            return isParcialOk && isAuthorized;
        });

        var subjects = [...new Set(currentActivities.map(function(a) { return a.asignatura; }))];

        // Tarea 4: Persistencia Histórica - Incluir asignaturas registradas en el historial (v7.8.2)
        var historicalRecord = academicHistory.filter(function(h) {
            return window.normalizePartial(h.parcial) === window.normalizePartial(selectedPartial);
        });
        historicalRecord.forEach(function(rec) {
            if (Array.isArray(rec.asignaturas)) {
                rec.asignaturas.forEach(function(asig) {
                    if (subjects.indexOf(asig) === -1) subjects.push(asig);
                });
            }
        });

        // Tarea 3: Asegurar que se incluyan las asignaturas de la Configuración Global (si es el parcial actual)
        // Se añade validación de grado para evitar filtración de materias de otros cursos (Fase Diagnóstico v7.8.3)
        if (window.normalizePartial(selectedPartial) === window.normalizePartial(activePartial)) {
            var globalAsigs = window.GLOBAL_SCOPE ? window.GLOBAL_SCOPE.AsignaturaActual : [];
            globalAsigs.forEach(function(asig) {
                if (window.isContentAuthorized(selectedPartial, asig, null, currentUser.grado, currentUser.seccion)) {
                    if (subjects.indexOf(asig) === -1) subjects.push(asig);
                }
            });
        }

        subjects = subjects.filter(function(s) { return s && s.trim() !== ""; }).sort();

        if (subjects.length === 0) {
            tabsContainer.innerHTML = '<p class="text-gray-400 text-[10px] uppercase font-bold p-2">Sin materias.</p>';
            tasksList.innerHTML = '<p class="text-gray-500 text-center py-8">Sin actividades.</p>';
            return;
        }

        // Tarea 4: Resolución de Carga en la Lista de Asignaturas (Botones superiores)
        // Aseguramos que se generen botones de navegación rápida por materia
        tabsContainer.innerHTML = subjects.map(function(subj) {
            return `
            <button class="subject-tab flex-none px-4 py-2 bg-white border border-gray-100 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm hover:border-blue-200 transition-all hover:bg-blue-50" onclick="window.expandSubject('${subj.replace(/'/g, "\\'")}')">
                <i class="fas fa-tag mr-1.5 text-blue-400"></i> ${subj}
            </button>
        `; }).join('');

        // REQ: Tarjetas de Asignatura (Tarea 2)
        // En la vista inicial de Actividades, mostramos tarjetas por asignatura con solo pendientes.
        tasksList.innerHTML = subjects.map(function(subj) {
            var subjActivities = currentActivities.filter(function(a) { return a.asignatura === subj; });
            // Solo actividades no resueltas para el estado inicial
            var pendingActivities = subjActivities.filter(function(a) {
                return !a.entrega || (a.entrega.estado !== 'Completada' && a.entrega.estado !== 'Revisada' && a.entrega.estado !== 'Finalizado');
            });

            // Orden jerárquico: Más reciente primero
            pendingActivities.sort(function(a, b) {
                return new Date(b.fechaLimite || 0) - new Date(a.fechaLimite || 0);
            });

            var mostRecent = pendingActivities[0];
            var count = pendingActivities.length;

            if (count === 0) return ''; // No mostrar si no hay pendientes (Tarea 2)

            return `
                <div class="card-ima subject-card cursor-pointer group animate-fade-in-up" onclick="window.expandSubject('${subj.replace(/'/g, "\\'")}')">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                            <i class="fas fa-book"></i>
                        </div>
                        <span class="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full shadow-sm">${count} Pendientes</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2 uppercase tracking-tighter">${subj}</h3>
                    <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-blue-200 transition-colors">
                        <p class="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Actividad Reciente</p>
                        <p class="text-sm font-semibold text-gray-800 truncate">${mostRecent ? mostRecent.titulo : 'Sin tareas pendientes'}</p>
                        <p class="text-[10px] text-gray-400 font-medium uppercase mt-1">${mostRecent ? 'Vence: ' + formatDate(mostRecent.fechaLimite) : ''}</p>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Ver todas <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            `;
        }).join('');

        // Si todas las asignaturas fueron filtradas por no tener pendientes
        if (tasksList.innerHTML.trim() === '') {
            tasksList.innerHTML = `
                <div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100 animate-fade-in">
                    <div class="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        <i class="fas fa-check-double"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Felicidades!</h3>
                    <p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                        Has completado todas tus actividades para este parcial.
                    </p>
                </div>`;
        }

        // Tarea 2: Expansión Full-Viewport
        window.expandSubject = function(subj) {
            var expandedOverlay = document.createElement('div');
            expandedOverlay.id = 'expanded-subject-overlay';
            expandedOverlay.className = 'fixed inset-0 z-[2200] bg-white overflow-y-auto animate-expansion';

            var subjActivities = currentActivities.filter(function(a) { return a.asignatura === subj; });

            // Ordenar por fecha de vencimiento (más recientes primero)
            subjActivities.sort(function(a, b) {
                return new Date(b.fechaLimite || 0) - new Date(a.fechaLimite || 0);
            });

            expandedOverlay.innerHTML = `
                <div class="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
                    <div class="flex items-center justify-between mb-8 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-10 border-b border-gray-100">
                        <div class="flex items-center gap-4">
                            <button onclick="window.closeExpandedSubject()" class="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <div>
                                <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tighter">${subj}</h2>
                                <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">${selectedPartial}</p>
                            </div>
                        </div>
                        <div class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase tracking-widest border border-blue-100">
                            ${subjActivities.length} Actividades Totales
                        </div>
                    </div>

                    <div id="expanded-tasks-list" class="grid grid-cols-1 gap-6 pb-20">
                        <!-- Se poblará dinámicamente -->
                    </div>
                </div>
            `;
            document.body.appendChild(expandedOverlay);
            document.body.style.overflow = 'hidden';

            var expandedList = document.getElementById('expanded-tasks-list');
            // Reutilizar lógica de renderizado de tareas (con todas las tareas)
            renderActivitiesIntoContainer(subjActivities, expandedList);
        };

        window.closeExpandedSubject = function() {
            var overlay = document.getElementById('expanded-subject-overlay');
            if (overlay) {
                overlay.classList.remove('animate-expansion');
                overlay.classList.add('animate-shrink');
                setTimeout(function() {
                    overlay.remove();
                    document.body.style.overflow = '';
                }, 400);
            }
        };
    }

    // Helper para renderizar tareas en un contenedor específico (necesario para el modo expandido)
    function renderActivitiesIntoContainer(activities, container) {
        if (!container) return;
        container.innerHTML = activities.map(function(a) { return getActivityHtml(a, true); }).join('');
    }

    function getActivityHtml(activity, isExpandedView) {
        var feedbackHtml = '';
        var actionButtonHtml = '';

        if (activity.type === 'Tarea' || activity.type === 'Credito Extra' || activity.type === 'Crédito Extra') {
            if (activity.entrega) {
                var status = activity.entrega.estado;
                var isPending = (status === 'Pendiente de revisión' || status === 'Pendiente' || !status);
                var isResubmittable = (status === 'Rechazada' || status === 'Tarea incompleta');

                var statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' || status === 'Tarea incompleta' ? 'text-red-600' : 'text-yellow-600');
                var displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                var fileLinkHtml = '';
                if (isPending && activity.entrega.fileId) {
                    var fileId = activity.entrega.fileId;
                    var url = activity.entrega.mimeType === 'folder'
                        ? `https://drive.google.com/drive/folders/${fileId}`
                        : `https://drive.google.com/uc?id=${fileId}`;
                    fileLinkHtml = `<div class="mt-2"><a href="${url}" target="_blank" class="text-blue-600 font-medium hover:underline text-sm flex items-center space-x-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg><span>Ver mi entrega</span></a></div>`;
                }

                var deleteBtnHtml = isPending
                    ? `<button class="btn-ima-cancel px-3 py-1 text-[10px] delete-submission-btn" data-type="${activity.type}" data-entrega-id="${activity.entrega.entregaId}">Eliminar Entrega</button>`
                    : '';

                var resubmitBtnHtml = '';
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
                    data-asignatura="${activity.asignatura || ''}"
                    data-fecha-limite="${activity.fechaLimite || ''}">Entregar Tarea</button>`;
            }
        } else if (activity.type === 'Examen') {
            if (activity.entrega) {
                var status = activity.entrega.estado;
                var isPending = (status === 'Pendiente' || !status);
                var statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' ? 'text-red-600' : 'text-yellow-600');
                var displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                var deleteBtnHtml = isPending
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
                var estado = activity.estado || 'Inactivo';
                if (estado === 'Activo') {
                    actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="btn-ima-primary bg-purple-600 hover:bg-purple-700 px-6 py-2 text-xs">Realizar Examen</a>`;
                } else {
                    actionButtonHtml = `<button class="bg-gray-100 text-gray-400 px-5 py-2 rounded-xl text-[10px] font-medium uppercase cursor-not-allowed" disabled>${estado}</button>`;
                }
            }
        }

        var statusLabel = "";
        if (activity.entrega) {
            var s = activity.entrega.estado;
            if (s === 'Completada' || s === 'Revisada' || s === 'Finalizado') {
                statusLabel = '<span class="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded shadow-sm">Completada</span>';
            } else if (s === 'Rechazada') {
                statusLabel = '<span class="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase rounded shadow-sm">Rechazada</span>';
            } else if (s === 'Tarea incompleta') {
                statusLabel = '<span class="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-black uppercase rounded shadow-sm">Incompleta</span>';
            } else {
                statusLabel = '<span class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] font-black uppercase rounded shadow-sm">Pendiente de revisión</span>';
            }
        }

        // Tarea 3: Sistema de Feedback de Vencimiento
        var alertBadgeHtml = '';
        if (!activity.entrega) {
            var now = new Date();
            var limit = new Date(activity.fechaLimite);
            var diffDays = (limit - now) / (1000 * 60 * 60 * 24);

            if (diffDays < 0) {
                alertBadgeHtml = '<span class="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase rounded shadow-sm"><i class="fas fa-exclamation-circle mr-1"></i> Vencida (-50% Pts)</span>';
            } else if (diffDays <= 3) {
                alertBadgeHtml = '<span class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] font-black uppercase rounded shadow-sm"><i class="fas fa-clock mr-1"></i> Por Vencer</span>';
            } else if (diffDays <= 7) {
                alertBadgeHtml = '<span class="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase rounded shadow-sm">A tiempo</span>';
            }
        }

        return `
            <div class="card-ima assignment-card cursor-pointer group ${isExpandedView ? 'is-expanded' : ''}" data-task-id="${activity.tareaId || activity.examenId}">
                <div class="flex justify-between items-start">
                    <div class="flex-grow">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[9px] font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${activity.type}</span>
                            <span class="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">${activity.asignatura || 'General'}</span>
                            ${alertBadgeHtml}
                        </div>
                        <h3 class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tighter flex items-center flex-wrap">
                            ${activity.titulo}
                            ${statusLabel}
                        </h3>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">${formatDate(activity.fechaLimite)}</span>
                        ${!isExpandedView ? `<svg class="w-4 h-4 text-gray-300 transform group-[.is-expanded]:rotate-180 transition-transform duration-200 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>` : ''}
                    </div>
                </div>
                <div class="assignment-content overflow-hidden ${isExpandedView ? 'max-h-[1200px]' : 'max-h-0'} transition-all duration-300 ease-in-out group-[.is-expanded]:max-h-[1200px]">
                    <div class="pt-4 mt-4 border-t border-gray-50">
                        <div class="assignment-content-scroll scroll-minimalist mb-4">
                            <div class="text-gray-600 text-sm font-medium mb-5 leading-relaxed quill-content">${window.sanitizarHTMLTecnico(activity.descripcion) || 'Sin descripción.'}</div>
                        </div>
                        <div class="flex justify-center md:justify-start">
                            ${actionButtonHtml}
                        </div>
                        ${feedbackHtml}
                    </div>
                </div>
            </div>
        `;
    }

    function renderActivities(inputFiltered) {
        // REQ: Extra Credit Visibility Logic (v7.6.1)
        var hasRejected = allActivitiesData.some(function(a) {
            return a.entrega && (a.entrega.estado === 'Rechazada' || a.entrega.estado === 'Tarea incompleta');
        });

        var filtered = inputFiltered.filter(function(a) {
            if (a.type === 'Crédito Extra' || a.type === 'Credito Extra') {
                return hasRejected;
            }
            return true;
        });

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
        tasksList.innerHTML = filtered.map(function(a) { return getActivityHtml(a); }).join('');
    }

    // --- Lógica del Modal ---
    var currentTaskFechaLimite = null;
    function openSubmissionModal(taskId, taskTitle, parcial, asignatura, fechaLimite) {
        currentTaskId = taskId;
        currentTaskParcial = parcial;
        currentTaskAsignatura = asignatura;
        currentTaskFechaLimite = fechaLimite;
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
                var filesToDelete = [...uploadedFiles];
                uploadedFiles = [];
                filesToDelete.forEach(function(f) {
                    fetchApi('TASK', 'deleteFile', { fileId: f.fileId }).catch(function(e) { console.warn("Fallo limpieza silenciosa:", e); });
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

    function handleActivityClick(e) {
        var assignmentCard = e.target.closest('.assignment-card');
        var isButton = e.target.closest('button, a');

        if (assignmentCard && !isButton) {
            var alreadyExpanded = assignmentCard.classList.contains('is-expanded');
            // Collapse all in current container
            var container = assignmentCard.parentElement;
            container.querySelectorAll('.assignment-card').forEach(function(card) {
                card.classList.remove('is-expanded');
            });
            // Toggle if not already expanded
            if (!alreadyExpanded) {
                assignmentCard.classList.add('is-expanded');
                if (window.setupCodeCopyButtons) {
                    setTimeout(function() { window.setupCodeCopyButtons(); }, 350);
                }
            }
            return;
        }

        if (e.target && e.target.classList.contains('open-submission-modal')) {
            var ds = e.target.dataset;
            openSubmissionModal(ds.taskId, ds.taskTitle, ds.parcial, ds.asignatura, ds.fechaLimite);
        }

        if (e.target && e.target.classList.contains('delete-submission-btn')) {
            var type = e.target.dataset.type;
            var entregaId = e.target.dataset.entregaId;

            if (confirm('ATENCIÓN: Al eliminar tu entrega podrías perder la nota de calificación')) {
                var btn = e.target;
                btn.disabled = true;
                btn.textContent = 'Eliminando...';
                fetchApi(type === 'Examen' ? 'EXAM' : 'TASK', type === 'Examen' ? 'deleteExamSubmission' : 'deleteSubmission', { entregaId: entregaId })
                    .then(function(result) {
                        if (result.status === 'success') {
                            alert('Entrega eliminada correctamente.');
                            fetchAllActivities();
                            if (window.closeExpandedSubject) window.closeExpandedSubject();
                        } else {
                            throw new Error(result.message);
                        }
                    })
                    .catch(function(error) {
                        alert('Error al eliminar entrega: ' + error.message);
                        btn.disabled = false;
                        btn.textContent = 'Eliminar Entrega';
                    });
            }
        }
    }

    if (tasksList) {
        tasksList.addEventListener('click', handleActivityClick);
    }

    // --- (Req 3.3) Optimizador de Subida de Alta Fidelidad ---
    var uploadQueue = [];

    /**
     * Segmentación Lógica por Páginas (Object-Level Parsing) para PDF (Tarea 1)
     * Divide un PDF en partes independientes válidas y legibles.
     */
    async function splitPdfLogically(file, partsCount) {
        try {
            var arrayBuffer = await file.arrayBuffer();
            var pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            var totalPages = pdfDoc.getPageCount();
            var pagesPerPart = Math.ceil(totalPages / partsCount);
            var segments = [];

            for (var i = 0; i < partsCount; i++) {
                var startPage = i * pagesPerPart;
                var endPage = Math.min((i + 1) * pagesPerPart, totalPages);

                if (startPage >= totalPages) break;

                var newPdf = await PDFLib.PDFDocument.create();
                var pagesToCopy = [];
                for (var j = 0; j < (endPage - startPage); j++) {
                    pagesToCopy.push(startPage + j);
                }
                var copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);

                copiedPages.forEach(function(page) { newPdf.addPage(page); });

                var pdfBytes = await newPdf.save();
                segments.push(new Blob([pdfBytes], { type: 'application/pdf' }));
            }
            return segments;
        } catch (e) {
            console.error("[IMA-PDF] Error en segmentación lógica:", e);
            throw new Error("No se pudo procesar la estructura del PDF. El archivo podría estar protegido o dañado.");
        }
    }

    async function compressImage(file) {
        return new Promise(function(resolve) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var width = img.width;
                    var height = img.height;
                    var MAX_SIZE = 1200;
                    if (width > height) {
                        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    } else {
                        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    }
                    canvas.width = width; canvas.height = height;
                    var ctx = canvas.getContext('2d');
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
        var CHUNK_THRESHOLD = 9.5 * 1024 * 1024; // 9.5MB (Activador de Esquema de Segmentación Binaria Autónoma)
        var CHUNK_SIZE = 5 * 1024 * 1024; // 5MB por fragmento (Optimizado para evitar Gateway Timeout)

        filePreviewContainer.classList.remove('hidden');
        uploadedFilesContainer.classList.remove('hidden');

        for (var i_f = 0; i_f < files.length; i_f++) {
            var currentFile = files[i_f];
            if (uploadedFiles.some(function(u) { return u.fileName === currentFile.name && u.size === currentFile.size; })) continue;

            var currentFileName = currentFile.name;
            var currentFileSize = currentFile.size;

            var li = document.createElement('li');
            li.className = 'flex flex-col text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up gap-3';

            var thumbnailHtml = '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><i class="fas fa-file"></i></div>';
            var ext = currentFileName.split('.').pop().toLowerCase();

            if (currentFile.type.startsWith('image/') || ext === 'heic') {
                if (ext === 'heic') {
                    thumbnailHtml = '<div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400"><i class="fas fa-image"></i></div>';
                } else {
                    var tempUrl = URL.createObjectURL(currentFile);
                    thumbnailHtml = `<img src="${tempUrl}" class="w-12 h-12 object-cover rounded-lg shadow-inner">`;
                }
            } else if (currentFile.type === 'application/pdf' || ext === 'pdf') {
                thumbnailHtml = '<div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-400"><i class="fas fa-file-pdf"></i></div>';
            } else if (['html', 'css', 'js', 'psc'].includes(ext)) {
                var colors = { html: 'text-orange-500', css: 'text-blue-500', js: 'text-yellow-500', psc: 'text-green-500' };
                var icons = { html: 'fa-code', css: 'fa-css3', js: 'fa-js', psc: 'fa-terminal' };
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
                var uploadResult;
                var progressSpan = li.querySelector('#upload-progress-text');
                var progressBar = li.querySelector('#upload-progress-bar');
                var fileData;
                var mimeType = currentFile.type;

                if (currentFile.name.toLowerCase().endsWith('.pdf')) {
                    mimeType = 'application/pdf';
                }

                if (currentFile.type.startsWith('image/') && !currentFile.name.toLowerCase().endsWith('.heic')) {
                    progressSpan.textContent = "Optimizando...";
                    if (progressBar) progressBar.style.width = '10%';
                    var optimizedDataUrl = await compressImage(currentFile);
                    fileData = optimizedDataUrl.split(',')[1];
                } else {
                    fileData = await new Promise(function(resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function() {
                            var base64 = reader.result.split(',')[1];
                            if (!base64) reject(new Error("Fallo en conversión Base64"));
                            resolve(base64);
                        };
                        reader.onerror = function() { reject(new Error("Error de lectura de archivo")); };
                        reader.readAsDataURL(currentFile);
                    });
                }

                var fileSize = currentFile.size;

                // REQ: Segmentación Libre de Corrupción (Tarea 1: Reingeniería)
                if (fileSize >= CHUNK_THRESHOLD) {
                    var totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
                    var segments = [];

                    if (mimeType === 'application/pdf') {
                        progressSpan.textContent = "Analizando estructura PDF...";
                        segments = await splitPdfLogically(currentFile, totalChunks);
                    } else {
                        // Fallback para otros binarios (rebanado plano)
                        for (var i = 0; i < totalChunks; i++) {
                            var start = i * CHUNK_SIZE;
                            var end = Math.min(start + CHUNK_SIZE, fileSize);
                            segments.push(currentFile.slice(start, end, currentFile.type));
                        }
                    }

                    for (var i = 0; i < segments.length; i++) {
                        var percent = Math.round((i / segments.length) * 100);
                        progressSpan.textContent = 'Parte ' + (i + 1) + ' de ' + segments.length + ' (' + percent + '%)';
                        if (progressBar) progressBar.style.width = percent + '%';

                        var blobChunk = segments[i];
                        var chunkData = await new Promise(function(resolve, reject) {
                            var reader = new FileReader();
                            reader.onload = function() {
                                var base64 = reader.result.split(',')[1];
                                if (!base64) reject(new Error("Fallo en conversión Base64"));
                                resolve(base64);
                            };
                            reader.onerror = function() { reject(new Error("Error de lectura de archivo")); };
                            reader.readAsDataURL(blobChunk);
                        });

                        // Nombramiento Estructurado (Tarea 1)
                        var partFileName = currentFileName.split('.')[0] + ' - Parte ' + (i + 1) + ' de ' + segments.length + '.' + currentFileName.split('.').pop();

                        var success = false;
                        var attempts = 0;
                        while (!success && attempts < 5) {
                            try {
                                // Subida Directa e Independiente (Evita Timeout en Reconstrucción)
                                var chunkRes = await fetchApi('TASK', 'uploadFile', {
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
                                console.warn('[IMA-UPLOAD] Intento ' + attempts + '/5 fallido para parte ' + (i + 1));
                                if (attempts >= 5) throw e;
                                await new Promise(function(r) { setTimeout(r, 2000 * attempts); });
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
                    var uploadedData = uploadResult.data;
                    // REQ: Si el archivo fue segmentado (o hay varios), la entrega final debe apuntar a la carpeta (Tarea 1)
                    var finalMimeType = fileSize >= CHUNK_THRESHOLD ? 'folder' : uploadedData.mimeType;
                    var finalFileId = fileSize >= CHUNK_THRESHOLD ? uploadedData.folderId : uploadedData.fileId;

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
                var friendlyMsg = "Error inesperado";
                var msg = error.message.toLowerCase();
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
        fileInput.addEventListener('change', async function(e) {
            var files = Array.from(e.target.files);
            if (files.length === 0) return;

            var MAX_SIZE_MB = 50;
            var ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'pdf', 'html', 'css', 'js', 'psc'];

            var validFiles = [];
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var ext = file.name.split('.').pop().toLowerCase();
                var sizeMB = file.size / (1024 * 1024);

                if (!ALLOWED_EXT.includes(ext)) {
                    alert('El archivo "' + file.name + '" no tiene un formato permitido.');
                    continue;
                }
                if (sizeMB > MAX_SIZE_MB) {
                    alert('El archivo "' + file.name + '" excede el límite de ' + MAX_SIZE_MB + 'MB.');
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
        uploadedFilesList.addEventListener('click', async function(e) {
            var btn = e.target.closest('.remove-file-btn');
            if (btn) {
                var fileId = btn.dataset.fileId;
                var li = btn.closest('li');

                // (A-30) Eliminar archivo remoto
                btn.disabled = true;
                li.style.opacity = '0.5';

                try {
                    // Se intenta eliminar de Drive pero no bloqueamos si falla la red
                    await fetchApi('TASK', 'deleteFile', { fileId: fileId });
                } catch (error) {
                    console.error("Error al eliminar archivo remoto:", error);
                }

                uploadedFiles = uploadedFiles.filter(function(f) { return f.fileId !== fileId; });
                li.remove();
                if (uploadedFiles.length === 0) {
                    uploadedFilesContainer.classList.add('hidden');
                }
                updateConfirmButtonState();
            }
        });
    }

    if (submissionForm) {
        submissionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            // Protección contra duplicados y subidas incompletas (Req 3)
            if (isSubmitting || uploadedFiles.length === 0 || activeUploads > 0) return;

            isSubmitting = true; // Bloquear nuevas acciones (Req 3.1)
            confirmSubmissionBtn.disabled = true;
            confirmSubmissionBtn.classList.add('btn-loading');
            confirmSubmissionBtn.textContent = 'Procesando...'; // Estado de procesamiento (Req 3.3)

            try {
                // Tarea 3: Regla de Puntuación Tardía y Aviso al Usuario
                var isLate = false;
                if (currentTaskFechaLimite) {
                    var now = new Date();
                    var limit = new Date(currentTaskFechaLimite);
                    if (now > limit) isLate = true;
                }

                if (isLate) {
                    if (!confirm('¡ATENCIÓN! Esta actividad ya venció. Al realizar la entrega fuera de tiempo, el sistema aplicará automáticamente una penalización del 50% sobre la calificación obtenida. ¿Desea continuar con la entrega tardía?')) {
                        isSubmitting = false;
                        confirmSubmissionBtn.disabled = false;
                        confirmSubmissionBtn.classList.remove('btn-loading');
                        confirmSubmissionBtn.textContent = 'Entregar Tarea';
                        return;
                    }
                }

                var finalFileId = uploadedFiles[0].fileId;
                var finalMimeType = uploadedFiles[0].mimeType;

                if (uploadedFiles.length > 1) {
                    finalFileId = currentFolderId;
                    finalMimeType = 'folder';
                }

                var payload = {
                    userId: currentUser.userId,
                    tareaId: currentTaskId,
                    fileId: finalFileId,
                    mimeType: finalMimeType,
                    isLate: isLate // Informar al backend sobre la entrega tardía (Tarea 3)
                };

                var result = await fetchApi('TASK', 'submitAssignment', payload);
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
                alert('Error al finalizar la entrega: ' + error.message);
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
        var waActive = document.getElementById('wa-group-btn');
        var waDisabled = document.getElementById('wa-group-btn-disabled');
        if (!waActive || !waDisabled) return;

        try {
            // WhatsApp links are now assigned by GRADO only
            var res = await fetchApi('USER', 'getWhatsAppLink', {
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

    // --- Sistema de Pestañas Principal (Tarea 1 - Fase Diagnóstico) ---
    var tabActivities = document.getElementById('tab-activities');
    var tabProgress = document.getElementById('tab-progress');
    var viewActivities = document.getElementById('view-activities');
    var viewProgress = document.getElementById('view-progress');

    if (tabActivities && tabProgress && viewActivities && viewProgress) {
        tabActivities.addEventListener('click', function() {
            tabActivities.className = "px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-blue-600 text-white shadow-lg shadow-blue-100";
            tabProgress.className = "px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 text-gray-500 hover:bg-white hover:text-blue-600";
            viewActivities.classList.remove('hidden');
            viewProgress.classList.add('hidden');
        });

        tabProgress.addEventListener('click', function() {
            tabProgress.className = "px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-blue-600 text-white shadow-lg shadow-blue-100";
            tabActivities.className = "px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 text-gray-500 hover:bg-white hover:text-blue-600";
            viewProgress.classList.remove('hidden');
            viewActivities.classList.add('hidden');
            // Asegurar que las métricas se rendericen al cambiar a la pestaña
            window.renderStudentExpediente(allActivitiesData);
        });
    }

    fetchAllActivities();
    initWhatsAppButton();

    // REQ: Reactive Scope Synchronization (v7.7.1)
    document.addEventListener('academic-scope-updated', function() {
        console.log("[Student] Academic scope updated, refreshing activities...");
        // Forzar limpieza de cache local para asegurar datos frescos tras cambio de alcance
        if (window.PersistenceManager) {
            window.PersistenceManager.delete('cache_estudiante_dashboard').then(function() {
                fetchAllActivities();
            });
        } else {
            fetchAllActivities();
        }
    });

    async function fetchAndRenderLearningProfile(dataOnly = false) {
        // REQ: Eager Caching for Learning Profile (Ticket: Optimización de Caché)
        if (window.PersistenceManager) {
            var cached = await window.PersistenceManager.get('cache_estudiante_profile');
            if (cached && cached.data && !dataOnly) {
                renderLearningProfileData(cached.data);
            }
        }

        try {
            var res = await fetchApi('USER', 'getLearningProfile', { userId: currentUser.userId }, 0, {
                store: 'cache_estudiante_profile',
                onUpdate: function(data) {
                    if (!dataOnly) renderLearningProfileData(data.data || data);
                }
            });
            if (res.status === 'success' && res.data && res.data.length > 0) {
                if (dataOnly) return res.data;
                renderLearningProfileData(res.data);
            }
            return null;
        } catch (e) {
            console.error("Error al cargar perfil de dominio:", e);
            if (!dataOnly) renderLearningProfileData([]);
            return null;
        }
    }

    function renderLearningProfileData(profileData) {
        var profileContainer = document.getElementById('learning-profile-integration');
        var metricsBody = document.getElementById('student-metrics-body');

        // REQ: Defensive Data Validation (v7.7.1)
        if (!Array.isArray(profileData)) profileData = [];

        // REQ 3: Muestra mínima local para renderizado de tabla (Modulo 3.1)
        var validData = (profileData || []).filter(function(i) { return i.intentos >= 5; });

        if (metricsBody) {
            if (validData.length > 0) {
                // Calcular promedios para la tabla superior
                var sumIAK = 0, sumRCE = 0, sumCONS = 0, count = 0;
                validData.forEach(function(d) {
                    if (d.iak !== undefined) {
                        sumIAK += d.iak;
                        sumRCE += (d.rce || 0);
                        sumCONS += (d.consistencia || 100);
                        count++;
                    }
                });

                if (count > 0) {
                    var avgIAK = sumIAK / count;
                    var avgRCE = sumRCE / count;
                    var avgCONS = sumCONS / count;

                    var getStatus = function(val, type) {
                        if (type === 'risk') {
                            if (val < 20) return { label: 'Bajo', class: 'text-emerald-500' };
                            if (val < 50) return { label: 'Medio', class: 'text-yellow-500' };
                            return { label: 'Alto', class: 'text-red-500' };
                        }
                        if (val > 80) return { label: 'Excelente', class: 'text-emerald-500' };
                        if (val > 60) return { label: 'Bueno', class: 'text-blue-500' };
                        return { label: 'Crítico', class: 'text-red-500' };
                    };

                    var iakStat = getStatus(avgIAK, 'auth');
                    var rceStat = getStatus(avgRCE, 'risk');
                    var consStat = getStatus(avgCONS, 'cons');

                    metricsBody.innerHTML = `
                        <tr>
                            <td class="py-3 text-[11px] font-bold text-gray-600 uppercase">Autenticidad del Conocimiento</td>
                            <td class="py-3 text-sm font-black text-gray-900 text-right">${Math.round(avgIAK)}%</td>
                            <td class="py-3 text-center"><span class="text-[9px] font-black uppercase ${iakStat.class}">${iakStat.label}</span></td>
                        </tr>
                        <tr>
                            <td class="py-3 text-[11px] font-bold text-gray-600 uppercase">Riesgo de Consulta Externa</td>
                            <td class="py-3 text-sm font-black text-gray-900 text-right">${Math.round(avgRCE)}%</td>
                            <td class="py-3 text-center"><span class="text-[9px] font-black uppercase ${rceStat.class}">${rceStat.label}</span></td>
                        </tr>
                        <tr>
                            <td class="py-3 text-[11px] font-bold text-gray-600 uppercase">Consistencia Académica</td>
                            <td class="py-3 text-sm font-black text-gray-900 text-right">${Math.round(avgCONS)}%</td>
                            <td class="py-3 text-center"><span class="text-[9px] font-black uppercase ${consStat.class}">${consStat.label}</span></td>
                        </tr>
                    `;
                } else {
                    metricsBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-[10px] font-bold text-gray-400 uppercase">Datos psicométricos pendientes de calibración.</td></tr>';
                }
            } else {
                metricsBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-[10px] font-bold text-gray-400 uppercase">Se requiere mayor actividad para generar métricas.</td></tr>';
            }
        }

        if (!profileContainer) return;

        if (validData.length === 0) {
             profileContainer.innerHTML = '<div class="p-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-[2rem] border border-gray-100 mt-8">Datos insuficientes para generar diagnóstico psicométrico.</div>';
             return;
        }

        try {
                // REQ: Recomendaciones académicas con enlaces directos
                var findPresentation = function(tema) {
                    if (!window.presentationData) return null;
                    for (var i = 0; i < window.presentationData.length; i++) {
                        var grade = window.presentationData[i];
                        for (var j = 0; j < grade.subjects.length; j++) {
                            var subject = grade.subjects[j];
                            for (var k = 0; k < subject.topics.length; k++) {
                                var topic = subject.topics[k];
                                if (topic.title.toLowerCase().indexOf(tema.toLowerCase()) !== -1 ||
                                    tema.toLowerCase().indexOf(topic.title.toLowerCase()) !== -1) {
                                    return topic.file;
                                }
                            }
                        }
                    }
                    return null;
                };

                var sortedByDominio = [...validData].sort(function(a, b) { return b.dominio - a.dominio; });

                // REQ: Filtrar temas genéricos (v3.2)
                var strengths = sortedByDominio.filter(function(i) { return i.dominio >= 80 && i.tema !== 'General'; }).slice(0, 3);
                var weaknesses = sortedByDominio.filter(function(i) { return i.dominio < 60 && i.tema !== 'General'; }).reverse().slice(0, 3);

                var sumDominio = 0;
                for (var i = 0; i < validData.length; i++) {
                    sumDominio += validData[i].dominio;
                }
                var avgDominio = Math.round(sumDominio / validData.length);

                var classification = "Requiere Refuerzo";
                var badgeClass = "bg-orange-50 text-orange-600";
                if (avgDominio >= 90) { classification = "Maestro"; badgeClass = "bg-purple-50 text-purple-600"; }
                else if (avgDominio >= 75) { classification = "Avanzado"; badgeClass = "bg-emerald-50 text-emerald-600"; }
                else if (avgDominio >= 60) { classification = "Competente"; badgeClass = "bg-blue-50 text-blue-600"; }
                else if (avgDominio >= 40) { classification = "En Desarrollo"; badgeClass = "bg-yellow-50 text-yellow-600"; }

                // REQ: Recomendación Directa (v3.2) - Banner de Alerta Crítica
                var alertBanner = '';
                var criticalTopic = weaknesses.find(function(w) { return w.dominio < 50; });
                if (criticalTopic) {
                    var presFile = findPresentation(criticalTopic.tema);
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

                        <!-- REQ: Gráficos Psicométricos (Modulo 5) -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Estado Cognitivo (Radar)</p>
                                <div class="w-full max-w-[250px]">
                                    <canvas id="student-radar-chart"></canvas>
                                </div>
                            </div>
                            <div class="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Curva de Aprendizaje</p>
                                <div class="w-full h-[200px]">
                                    <canvas id="student-trend-chart"></canvas>
                                </div>
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
                                    ${strengths.length > 0 ? strengths.map(function(s) { return `
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-gray-700 uppercase tracking-tighter">${s.tema}</span>
                                            <span class="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-emerald-100">${window.redondearMetrica(s.dominio)}%</span>
                                        </div>
                                    `; }).join('') : '<p class="text-[10px] text-gray-400 italic">Sigue practicando para identificar tus fortalezas</p>'}
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
                                    ${weaknesses.length > 0 ? weaknesses.map(function(w) {
                                        var file = findPresentation(w.tema);
                                        var action = file ? "window.open('" + file + "', '_blank')" : "window.scrollTo({top: document.getElementById('resources-section')?.offsetTop || 0, behavior: 'smooth'})";
                                        return `
                                        <div class="flex flex-col gap-1">
                                            <div class="flex items-center justify-between">
                                                <span class="text-xs font-bold text-gray-700 uppercase tracking-tighter">${w.tema}</span>
                                                <span class="text-[10px] font-black text-orange-600">${window.redondearMetrica(w.dominio)}%</span>
                                            </div>
                                            <button onclick="${action}" class="w-max text-[9px] font-black text-orange-700 uppercase tracking-widest hover:underline flex items-center gap-1">
                                                <i class="fas fa-book-open text-[8px]"></i> ${file ? 'Repasar Ahora' : 'Ver Presentación'}
                                            </button>
                                        </div>
                                    `; }).join('') : '<p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">¡Excelente! No tienes temas críticos pendientes</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Inicializar Gráficos con Chart.js
                setTimeout(function() { renderStudentCharts(profileData); }, 100);
        } catch (e) {
            console.error("Error al renderizar perfil de dominio:", e);
        }
    }

    /**
     * REQ: Gráficos Psicométricos Interactivos (Modulo 5)
     */
    function renderStudentCharts(profileData) {
        var radarCtx = document.getElementById('student-radar-chart')?.getContext('2d');
        var trendCtx = document.getElementById('student-trend-chart')?.getContext('2d');

        if (!radarCtx || !trendCtx || !profileData || profileData.length === 0) return;

        // 1. Datos para Radar (Promedios de las métricas principales)
        var sumICR = 0, sumMastery = 0;
        for (var i = 0; i < profileData.length; i++) {
            sumICR += (profileData[i].dominio || 0);
            sumMastery += (profileData[i].porcentaje || 0);
        }
        var avgICR = sumICR / profileData.length;
        var avgMastery = sumMastery / profileData.length;
        // IA simulada inversamente proporcional al dominio para visualización
        var avgIA = 100 - avgICR;

        if (window.studentRadarChart) window.studentRadarChart.destroy();
        window.studentRadarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Confianza', 'Dominio', 'Estabilidad'],
                datasets: [{
                    data: [avgICR, avgMastery, 100 - avgIA],
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } },
                plugins: { legend: { display: false } }
            }
        });

        // 2. Trend Line (Histórico de dominio por tema)
        var trendItems = profileData.slice(-7);
        var trendData = trendItems.map(function(i) { return i.dominio; });
        var trendLabels = trendItems.map(function(i) { return i.tema.substring(0, 5); });

        if (window.studentTrendChart) window.studentTrendChart.destroy();
        window.studentTrendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: 'Dominio por Tema',
                    data: trendData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { font: { size: 8 } } },
                    x: { ticks: { font: { size: 8 } } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    window.addEventListener('beforeunload', function(e) {
        if (!isSubmitting && (activeUploads > 0 || uploadedFiles.length > 0)) {
            e.preventDefault();
            e.returnValue = '«Los archivos cargados se perderán si abandona esta entrega. ¿Desea continuar?»';
        }
    });
});

/**
 * REQ: Soporte para copia de código en el dashboard (v7.6.4)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Escuchar cambios en el dashboard para re-inyectar botones
    var observer = new MutationObserver(function() {
        if (window.setupCodeCopyButtons) window.setupCodeCopyButtons();
    });

    var dashboard = document.getElementById('dashboard-content');
    if (dashboard) {
        observer.observe(dashboard, { childList: true, subtree: true });
    }
});
