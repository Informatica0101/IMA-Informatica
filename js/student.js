/**
 * QuizPro v7.5 - Student Dashboard Module (Manual ES5 Remediation)
 * Full Business Logic Restoration with Strict ES5 Compliance.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {

    document.addEventListener('DOMContentLoaded', function() {
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = userRaw ? JSON.parse(userRaw) : null;

        if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
            window.location.href = 'login.html';
            return;
        }

        var firstName = currentUser.nombre.split(' ')[0];
        var studentNameEl = document.getElementById('student-name');
        if (studentNameEl) studentNameEl.textContent = firstName;

        var tasksList = document.getElementById('tasks-list');
        var logoutButton = document.getElementById('logout-button');

        var PARCIAL_ORDER = {
            "Cuarto Parcial": 4,
            "Tercer Parcial": 3,
            "Segundo Parcial": 2,
            "Primer Parcial": 1
        };
        var allActivitiesData = [];

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
        var isSubmitting = false;

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

        function fetchAllActivities() {
            if (!tasksList) return;

            var hasLocalData = false;
            var renderPromise = Promise.resolve();

            if (window.PersistenceManager) {
                renderPromise = window.PersistenceManager.get('cache_estudiante_dashboard')
                    .then(function(cached) {
                        if (cached && cached.data) {
                            console.log("[Offline-First] Renderizando actividades desde caché local (cache_estudiante_dashboard).");
                            allActivitiesData = cached.data.allActivities || [];
                            renderStudentExpediente(allActivitiesData);
                            renderParcialTabs(allActivitiesData);
                            hasLocalData = true;
                        }
                    });
            }

            renderPromise.then(function() {
                if (!hasLocalData) {
                    var skeleton = '';
                    for (var i = 0; i < 6; i++) {
                        skeleton +=
                            '<div class="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-4">' +
                                '<div class="skeleton h-4 w-1/3 rounded"></div>' +
                                '<div class="skeleton h-6 w-3/4 rounded"></div>' +
                                '<div class="skeleton h-20 w-full rounded-2xl"></div>' +
                                '<div class="flex justify-between items-center">' +
                                    '<div class="skeleton h-8 w-1/2 rounded-xl"></div>' +
                                    '<div class="skeleton h-8 w-8 rounded-full"></div>' +
                                '</div>' +
                            '</div>';
                    }
                    tasksList.innerHTML = '<div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">' + skeleton + '</div>';
                }

                var payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };

                return Promise.all([
                    window.fetchApi('TASK', 'getStudentTasks', payload),
                    window.fetchApi('EXAM', 'getStudentExams', payload),
                    fetchAndRenderLearningProfile(true)
                ]);
            })
            .then(function(results) {
                var tasksResult = results[0];
                var examsResult = results[1];
                var profileResult = results[2];

                var allActivities = [];
                if (tasksResult.status === 'success' && tasksResult.data) {
                    for (var i = 0; i < tasksResult.data.length; i++) {
                        var task = tasksResult.data[i];
                        task.type = task.tipo || 'Tarea';
                        task.asignatura = (task.asignatura || 'General').trim();
                        task.parcial = (task.parcial || 'Sin Parcial').trim();
                        allActivities.push(task);
                    }
                }
                if (examsResult.status === 'success' && examsResult.data) {
                    for (var i = 0; i < examsResult.data.length; i++) {
                        var exam = examsResult.data[i];
                        exam.type = 'Examen';
                        exam.asignatura = (exam.asignatura || 'General').trim();
                        exam.parcial = (exam.parcial || 'Sin Parcial').trim();
                        allActivities.push(exam);
                    }
                }

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
                renderStudentExpediente(allActivities);
                if (profileResult) renderLearningProfileData(profileResult);

                if (allActivities.length > 0) {
                    renderParcialTabs(allActivities);
                } else {
                    tasksList.innerHTML =
                        '<div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100 animate-fade-in">' +
                            '<div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">' +
                                '<i class="fas fa-calendar-check"></i>' +
                            '</div>' +
                            '<h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Todo al día!</h3>' +
                            '<p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">' +
                                'No se han encontrado tareas ni exámenes asignados en este momento.' +
                            '</p>' +
                        '</div>';
                }
            })
            ["catch"](function(error) {
                console.error("[IMA-STUDENT] Error en fetchAllActivities:", error);
                tasksList.innerHTML =
                    '<div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100">' +
                        '<div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">' +
                            '<i class="fas fa-sync-alt"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Sincronizando!</h3>' +
                        '<p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">' +
                            'No hemos podido obtener tus tareas en este momento. Por favor, reintenta en unos instantes.' +
                        '</p>' +
                        '<button onclick="location.reload()" class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">Reintentar</button>' +
                    '</div>';
            })
            ["finally"](function() {
                if (window.GamesAdapter) window.GamesAdapter.showLoading(false);
            });
        }

        function renderStudentExpediente(inputActivities) {
            var container = document.getElementById('student-expediente');
            if (!container) return;

            var activities = (inputActivities && inputActivities.status === 'success' && Array.isArray(inputActivities.data)) ? inputActivities.data : (Array.isArray(inputActivities) ? inputActivities : []);

            var currentParcialActivities = [];
            for (var i = 0; i < activities.length; i++) {
                if (window.normalizePartial(activities[i].parcial) === window.normalizePartial(window.PARCIAL_ACTUAL)) {
                    currentParcialActivities.push(activities[i]);
                }
            }

            var baseActivities = [];
            for (var i = 0; i < currentParcialActivities.length; i++) {
                if (currentParcialActivities[i].type !== 'Credito Extra') {
                    baseActivities.push(currentParcialActivities[i]);
                }
            }
            var totalAssigned = baseActivities.length;

            var mandatoryCompleted = 0;
            var extraCreditCompleted = 0;
            var mandatoryDelivered = 0;
            var gradeSum = 0;
            var maxPossible = 0;

            for (var i = 0; i < currentParcialActivities.length; i++) {
                var a = currentParcialActivities[i];
                var isCompleted = a.entrega && (a.entrega.estado === 'Completada' || a.entrega.estado === 'Revisada' || a.entrega.estado === 'Finalizado');

                if (a.type !== 'Credito Extra') {
                    if (isCompleted) mandatoryCompleted++;
                    if (a.entrega) mandatoryDelivered++;
                    maxPossible += parseFloat(a.puntaje || 100);
                } else {
                    if (isCompleted) extraCreditCompleted++;
                }

                gradeSum += parseFloat(a.entrega && a.entrega.calificacion ? a.entrega.calificacion : 0);
            }

            var completed = Math.min(totalAssigned, mandatoryCompleted + extraCreditCompleted);
            var pending = Math.max(0, totalAssigned - completed);
            var deliveryRate = totalAssigned > 0 ? (mandatoryDelivered / totalAssigned) : 0;
            var academicPerformance = maxPossible > 0 ? Math.min(1, gradeSum / maxPossible) : 0;

            var onTimeCount = 0;
            var totalDeliveredCount = 0;
            for (var i = 0; i < activities.length; i++) {
                var a = activities[i];
                if (a.entrega) {
                    totalDeliveredCount++;
                    if (a.fechaLimite) {
                        var limit = new Date(a.fechaLimite);
                        var deliveryDate = new Date(a.entrega.fecha || Date.now());
                        if (deliveryDate <= limit) onTimeCount++;
                    } else {
                        onTimeCount++;
                    }
                }
            }
            var punctualityRate = totalDeliveredCount > 0 ? (onTimeCount / totalDeliveredCount) : 1;

            var compositeProgress = Math.round((deliveryRate * 0.3 + academicPerformance * 0.5 + punctualityRate * 0.2) * 100);

            var level = "Iniciando";
            var levelColor = "text-blue-600";
            var barColor = "bg-blue-600";

            if (compositeProgress >= 90) { level = "Excelencia"; levelColor = "text-emerald-600"; barColor = "bg-emerald-500"; }
            else if (compositeProgress >= 70) { level = "Satisfactorio"; levelColor = "text-green-600"; barColor = "bg-green-500"; }
            else if (compositeProgress >= 50) { level = "En Mejora"; levelColor = "text-yellow-600"; barColor = "bg-yellow-500"; }
            else if (compositeProgress > 0) { level = "En Riesgo"; levelColor = "text-orange-600"; barColor = "bg-orange-500"; }

            container.innerHTML =
                '<div class="card-ima bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">' +
                    '<div class="grid grid-cols-1 md:grid-cols-3 gap-8">' +
                        '<div class="space-y-4">' +
                            '<div class="flex items-center gap-3">' +
                                '<div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">' +
                                    '<i class="fas fa-id-card"></i>' +
                                '</div>' +
                                '<div>' +
                                    '<h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Estudiante</h3>' +
                                    '<p class="text-lg font-bold text-gray-900">' + currentUser.nombre + '</p>' +
                                '</div>' +
                            '</div>' +
                            '<div class="grid grid-cols-2 gap-4 pt-2">' +
                                '<div><span class="text-[10px] font-bold text-gray-400 uppercase">Grado</span><p class="text-sm font-semibold">' + currentUser.grado + '</p></div>' +
                                '<div><span class="text-[10px] font-bold text-gray-400 uppercase">Sección</span><p class="text-sm font-semibold">' + currentUser.seccion + '</p></div>' +
                                '<div><span class="text-[10px] font-bold text-gray-400 uppercase">No. Lista</span><p class="text-sm font-semibold">#' + (currentUser.numeroLista || 'N/A') + '</p></div>' +
                            '</div>' +
                        '</div>' +

                        '<div class="md:border-x border-gray-50 px-0 md:px-8 space-y-4">' +
                            '<div class="flex justify-between items-end">' +
                                '<div>' +
                                    '<h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progreso Académico</h3>' +
                                    '<p class="text-3xl font-black text-gray-900">' + compositeProgress + '%</p>' +
                                '</div>' +
                                '<div class="text-right">' +
                                    '<span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nivel</span>' +
                                    '<span class="text-xs font-bold ' + levelColor + ' uppercase tracking-tighter">' + level + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">' +
                                '<div class="' + barColor + ' h-full transition-all duration-1000" style="width: ' + compositeProgress + '%"></div>' +
                            '</div>' +
                        '</div>' +

                        '<div class="flex flex-col justify-center space-y-3">' +
                            '<div class="flex items-center justify-between p-3 bg-green-50 rounded-2xl">' +
                                '<div class="flex items-center gap-3">' +
                                    '<div class="w-8 h-8 bg-white text-green-600 rounded-xl flex items-center justify-center text-xs shadow-sm"><i class="fas fa-check"></i></div>' +
                                    '<span class="text-xs font-bold text-green-700 uppercase">Completadas</span>' +
                                '</div>' +
                                '<span class="text-lg font-black text-green-700">' + completed + '</span>' +
                            '</div>' +
                            '<div class="flex items-center justify-between p-3 bg-yellow-50 rounded-2xl">' +
                                '<div class="flex items-center gap-3">' +
                                    '<div class="w-8 h-8 bg-white text-yellow-600 rounded-xl flex items-center justify-center text-xs shadow-sm"><i class="fas fa-clock"></i></div>' +
                                    '<span class="text-xs font-bold text-yellow-700 uppercase">Pendientes</span>' +
                                '</div>' +
                                '<span class="text-lg font-black text-yellow-700">' + pending + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="learning-profile-integration"></div>' +
                '</div>';
            container.classList.remove('hidden');
        }

        function renderSubjectNav(activities, selectedParcial) {
            var container = document.getElementById('subject-nav-container');
            if (!container) return;

            var subjectSet = {};
            for (var i = 0; i < activities.length; i++) {
                if (activities[i].asignatura) subjectSet[activities[i].asignatura.trim()] = true;
            }
            var subjects = [];
            for (var s in subjectSet) { subjects.push(s); }
            subjects.sort();

            if (subjects.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-[10px] uppercase font-bold p-4">No hay asignaturas en este parcial.</p>';
                tasksList.innerHTML = '<p class="text-gray-500 text-center py-8">No hay actividades registradas.</p>';
                return;
            }

            var html = '';
            for (var i = 0; i < subjects.length; i++) {
                html += '<button class="subject-tab flex-none px-5 py-2.5 bg-white border border-gray-100 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm hover:border-blue-200 transition-all" data-subject="' + subjects[i] + '">' + subjects[i] + '</button>';
            }
            container.innerHTML = html;

            var tabs = container.querySelectorAll('.subject-tab');
            for (var i = 0; i < tabs.length; i++) {
                tabs[i].addEventListener('click', function(e) {
                    for (var j = 0; j < tabs.length; j++) {
                        tabs[j].classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
                    }
                    var target = e.currentTarget;
                    target.classList.add('bg-blue-600', 'text-white', 'border-blue-600');

                    var subj = target.getAttribute('data-subject');
                    var finalActivities = [];
                    for (var k = 0; k < activities.length; k++) {
                        if (activities[k].asignatura === subj) finalActivities.push(activities[k]);
                    }

                    renderActivities(finalActivities);
                    showSubjectInfo(subj);
                });
            }

            if (tabs.length > 0) tabs[0].click();
        }

        function showSubjectInfo(subject) {
            var container = document.getElementById('subject-info-container');
            if (!container) return;

            container.innerHTML = '<div class="p-5 bg-gray-50 rounded-2xl text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Sincronizando información de la asignatura...</div>';
            container.classList.remove('hidden');

            var activity = null;
            for (var i = 0; i < allActivitiesData.length; i++) {
                if ((allActivitiesData[i].asignatura || 'General') === subject && allActivitiesData[i].profesorId) {
                    activity = allActivitiesData[i];
                    break;
                }
            }
            var profesorId = activity ? activity.profesorId : null;

            var profInfo = {
                nombre: "ISEMED - Área de Informática",
                email: "informatica@isemed.edu.hn",
                telefono: ""
            };

            var profPromise = Promise.resolve();
            if (profesorId) {
                profPromise = window.fetchApi('USER', 'getUserInfo', { userId: profesorId })
                    .then(function(res) {
                        if (res.status === 'success' && res.data) {
                            profInfo = res.data;
                        }
                    });
            }

            profPromise.then(function() {
                return window.fetchApi('USER', 'getWhatsAppLink', { grado: currentUser.grado });
            })
            .then(function(groupRes) {
                var groupLink = (groupRes.status === 'success' && groupRes.link) ? groupRes.link : null;
                var waPhone = profInfo.telefono ? String(profInfo.telefono).replace(/\D/g, '') : '';
                var waLink = waPhone ? 'https://wa.me/504' + waPhone : null;

                container.innerHTML =
                    '<div class="card-ima bg-blue-50/50 border-blue-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">' +
                        '<div class="flex items-center gap-4">' +
                            '<div class="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm shadow-sm border border-blue-50">' +
                                '<i class="fas fa-chalkboard-teacher"></i>' +
                            '</div>' +
                            '<div class="text-center md:text-left">' +
                                '<h4 class="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Docente Asignado</h4>' +
                                '<p class="text-sm font-bold text-gray-900">' + profInfo.nombre + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex flex-wrap justify-center gap-3">' +
                            '<a href="mailto:' + profInfo.email + '" class="text-[10px] font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">' +
                                '<i class="fas fa-envelope text-blue-400"></i> ' + profInfo.email +
                            '</a>' +
                            (waLink ?
                                '<a href="' + waLink + '" target="_blank" class="bg-green-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-all transform hover:-translate-y-0.5">' +
                                    '<i class="fab fa-whatsapp text-sm"></i> WhatsApp Docente' +
                                '</a>' : '') +
                            (groupLink ?
                                '<a href="' + groupLink + '" target="_blank" class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">' +
                                    '<i class="fas fa-users text-sm"></i> Grupo de Clase' +
                                '</a>' : '') +
                        '</div>' +
                    '</div>';
            })
            ["catch"](function(e) {
                console.error("Error showing subject info:", e);
                container.innerHTML = '<div class="p-4 bg-red-50 rounded-xl text-center text-red-400 text-[10px] font-bold uppercase border border-red-100">Fallo en la sincronización de información docente.</div>';
            });
        }

        function renderParcialTabs(inputActivities) {
            var tabsContainer = document.getElementById('parcial-tabs-container');
            if (!tabsContainer) return;

            var activities = (inputActivities && inputActivities.status === 'success' && Array.isArray(inputActivities.data)) ? inputActivities.data : (Array.isArray(inputActivities) ? inputActivities : []);

            if (!activities || activities.length === 0) {
                tabsContainer.innerHTML = '';
                tasksList.innerHTML =
                    '<div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100 animate-fade-in">' +
                        '<div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">' +
                            '<i class="fas fa-calendar-check"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Sin pendientes!</h3>' +
                        '<p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">' +
                            'No se han encontrado tareas ni exámenes asignados para tu grado y sección en este momento.' +
                        '</p>' +
                    '</div>';
                return;
            }

            var parcialSet = {};
            for (var i = 0; i < activities.length; i++) {
                if (activities[i].parcial) parcialSet[activities[i].parcial] = true;
            }
            var parciales = [];
            for (var p in parcialSet) { parciales.push(p); }

            parciales.sort(function(a, b) {
                return (PARCIAL_ORDER[b] || 0) - (PARCIAL_ORDER[a] || 0);
            });

            var activeParcial = parciales[0];

            var tabsHtml = '';
            for (var i = 0; i < parciales.length; i++) {
                var p = parciales[i];
                var isActive = p === activeParcial;
                var activeClass = isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200';
                tabsHtml += '<button class="flex-none px-4 py-2 rounded-xl font-semibold transition-all text-[10px] uppercase tracking-widest ' + activeClass + ' parcial-tab" data-parcial="' + p + '">' + p + '</button>';
            }

            tabsContainer.innerHTML = '<div class="flex flex-nowrap overflow-x-auto gap-2 pb-2 scroll-horizontal-clean">' + tabsHtml + '</div>';

            var tabs = tabsContainer.querySelectorAll('.parcial-tab');
            for (var i = 0; i < tabs.length; i++) {
                tabs[i].addEventListener('click', function(e) {
                    for (var j = 0; j < tabs.length; j++) {
                        tabs[j].classList.remove('bg-blue-600', 'text-white');
                        tabs[j].classList.add('bg-gray-100', 'text-gray-500', 'hover:bg-gray-200');
                    }
                    var target = e.currentTarget;
                    target.classList.remove('bg-gray-100', 'text-gray-500', 'hover:bg-gray-200');
                    target.classList.add('bg-blue-600', 'text-white');

                    var p = target.getAttribute('data-parcial');
                    var activitiesInParcial = [];
                    for (var k = 0; k < allActivitiesData.length; k++) {
                        if (allActivitiesData[k].parcial === p) activitiesInParcial.push(allActivitiesData[k]);
                    }
                    renderSubjectNav(activitiesInParcial, p);
                });
            }

            if (tabs.length > 0) tabs[0].click();
        }

        function renderActivities(filtered) {
            if (!filtered || filtered.length === 0) {
                tasksList.innerHTML =
                    '<div class="col-span-full p-12 text-center bg-white rounded-[2rem] border border-gray-100 animate-fade-in">' +
                        '<div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">' +
                            '<i class="fas fa-check-circle"></i>' +
                        '</div>' +
                        '<h3 class="text-lg font-bold text-gray-800 uppercase tracking-tighter mb-2">¡Todo al día!</h3>' +
                        '<p class="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">' +
                            'No hay actividades pendientes ni registradas para esta materia en el parcial seleccionado.' +
                        '</p>' +
                    '</div>';
                return;
            }

            var html = '';
            for (var i = 0; i < filtered.length; i++) {
                var activity = filtered[i];
                var feedbackHtml = '';
                var actionButtonHtml = '';

                if (activity.type === 'Tarea' || activity.type === 'Credito Extra') {
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
                                ? 'https://drive.google.com/drive/folders/' + fileId
                                : 'https://drive.google.com/uc?id=' + fileId;
                            fileLinkHtml = '<div class="mt-2"><a href="' + url + '" target="_blank" class="text-blue-600 font-medium hover:underline text-sm flex items-center space-x-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg><span>Ver mi entrega</span></a></div>';
                        }

                        var deleteBtnHtml = isPending
                            ? '<button class="btn-ima-cancel px-3 py-1 text-[10px] delete-submission-btn" data-type="' + activity.type + '" data-entrega-id="' + activity.entrega.entregaId + '">Eliminar Entrega</button>'
                            : '';

                        var resubmitBtnHtml = '';
                        if (isResubmittable) {
                            resubmitBtnHtml = '<button class="btn-ima-primary mt-3 w-full py-2 text-xs open-submission-modal" ' +
                                'data-task-id="' + activity.tareaId + '" ' +
                                'data-task-title="' + activity.titulo + ' (Re-entrega)" ' +
                                'data-parcial="' + (activity.parcial || '') + '" ' +
                                'data-asignatura="' + (activity.asignatura || '') + '">Subir Parte Pendiente</button>';
                        }

                        feedbackHtml =
                            '<div class="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">' +
                                '<div class="flex justify-between items-start">' +
                                    '<div>' +
                                        '<h4 class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Estado de Entrega</h4>' +
                                        '<p class="text-sm font-semibold ' + statusColor + '">' + displayStatus + '</p>' +
                                        fileLinkHtml +
                                    '</div>' +
                                    deleteBtnHtml +
                                '</div>' +
                                (activity.entrega.calificacion ? '<div class="mt-3 pt-3 border-t border-gray-100"><span class="text-[10px] font-medium text-gray-400 uppercase">Nota:</span> <span class="text-sm font-semibold text-blue-600">' + activity.entrega.calificacion + '</span></div>' : '') +
                                (activity.entrega.comentario ? '<div class="mt-1"><span class="text-[10px] font-medium text-gray-400 uppercase">Obs:</span> <p class="text-xs text-gray-600 italic mt-1 leading-relaxed">' + activity.entrega.comentario + '</p></div>' : '') +
                                resubmitBtnHtml +
                            '</div>';
                    } else {
                        actionButtonHtml = '<button class="btn-ima-primary px-5 py-2 text-xs open-submission-modal" ' +
                            'data-task-id="' + activity.tareaId + '" ' +
                            'data-task-title="' + activity.titulo + '" ' +
                            'data-parcial="' + (activity.parcial || '') + '" ' +
                            'data-asignatura="' + (activity.asignatura || '') + '">Entregar Tarea</button>';
                    }
                } else if (activity.type === 'Examen') {
                    if (activity.entrega) {
                        var status = activity.entrega.estado;
                        var isPending = (status === 'Pendiente' || !status);
                        var statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' ? 'text-red-600' : 'text-yellow-600');
                        var displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                        var deleteBtnHtml = isPending
                            ? '<button class="btn-ima-cancel px-3 py-1 text-[10px] delete-submission-btn" data-type="Examen" data-entrega-id="' + activity.entrega.entregaId + '">Eliminar Entrega</button>'
                            : '';

                        feedbackHtml =
                            '<div class="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">' +
                                '<div class="flex justify-between items-start">' +
                                    '<div>' +
                                        '<h4 class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Estado de Examen</h4>' +
                                        '<p class="text-sm font-semibold ' + statusColor + '">' + displayStatus + '</p>' +
                                    '</div>' +
                                    deleteBtnHtml +
                                '</div>' +
                                (activity.entrega.calificacion ? '<div class="mt-3 pt-3 border-t border-gray-100"><span class="text-[10px] font-medium text-gray-400 uppercase">Nota:</span> <span class="text-sm font-semibold text-purple-600">' + activity.entrega.calificacion + '</span></div>' : '') +
                                (activity.entrega.comentario ? '<div class="mt-1"><span class="text-[10px] font-medium text-gray-400 uppercase">Obs:</span> <p class="text-xs text-gray-600 italic mt-1 leading-relaxed">' + activity.entrega.comentario + '</p></div>' : '') +
                            '</div>';
                    } else {
                        var estado = activity.estado || 'Inactivo';
                        if (estado === 'Activo') {
                            actionButtonHtml = '<a href="exam.html?examenId=' + activity.examenId + '" class="btn-ima-primary bg-purple-600 hover:bg-purple-700 px-6 py-2 text-xs">Realizar Examen</a>';
                        } else {
                            actionButtonHtml = '<button class="bg-gray-100 text-gray-400 px-5 py-2 rounded-xl text-[10px] font-medium uppercase cursor-not-allowed" disabled>' + estado + '</button>';
                        }
                    }
                }

                html +=
                    '<div class="card-ima assignment-card cursor-pointer group" data-task-id="' + (activity.tareaId || activity.examenId) + '">' +
                        '<div class="flex justify-between items-start">' +
                            '<div class="flex-grow">' +
                                '<div class="flex items-center gap-2 mb-1">' +
                                    '<span class="text-[9px] font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">' + activity.type + '</span>' +
                                    '<span class="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">' + (activity.asignatura || 'General') + '</span>' +
                                '</div>' +
                                '<h3 class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tighter">' + activity.titulo + '</h3>' +
                            '</div>' +
                            '<div class="flex flex-col items-end">' +
                                '<span class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">' + formatDate(activity.fechaLimite) + '</span>' +
                                '<svg class="w-4 h-4 text-gray-300 transform group-[.is-expanded]:rotate-180 transition-transform duration-200 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>' +
                            '</div>' +
                        '</div>' +
                        '<div class="assignment-content overflow-hidden max-h-0 transition-all duration-300 ease-in-out group-[.is-expanded]:max-h-[1200px]">' +
                            '<div class="pt-4 mt-4 border-t border-gray-50">' +
                                '<div class="assignment-content-scroll scroll-minimalist mb-4">' +
                                    '<div class="text-gray-600 text-sm font-medium mb-5 leading-relaxed quill-content">' + (window.sanitizarHTMLTecnico(activity.descripcion) || 'Sin descripción.') + '</div>' +
                                '</div>' +
                                '<div class="flex justify-center md:justify-start">' +
                                    actionButtonHtml +
                                '</div>' +
                                feedbackHtml +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }
            tasksList.innerHTML = html;
        }

        // --- Lógica del Modal ---
        function openSubmissionModal(taskId, taskTitle, parcial, asignatura) {
            currentTaskId = taskId;
            currentTaskParcial = parcial;
            currentTaskAsignatura = asignatura;
            modalTaskTitle.textContent = taskTitle;
            uploadedFiles = [];
            currentFolderId = null;
            isSubmitting = false;

            uploadedFilesList.innerHTML = '';
            uploadedFilesContainer.classList.add('hidden');
            filePreviewContainer.classList.add('hidden');
            fileInput.value = '';
            updateConfirmButtonState();

            submissionModal.classList.remove('hidden');
        }

        function closeSubmissionModal() {
            if (activeUploads > 0 && !isSubmitting) {
                if (!confirm('Hay una subida en progreso. ¿Estás seguro de cerrar el modal?')) return;
            }

            if (uploadedFiles.length > 0 && !isSubmitting) {
                if (confirm('«Los archivos cargados se perderán si abandona esta entrega. ¿Desea continuar?»')) {
                    var filesToDelete = [];
                    for (var i = 0; i < uploadedFiles.length; i++) {
                        filesToDelete.push(uploadedFiles[i]);
                    }
                    uploadedFiles = [];
                    for (var j = 0; j < filesToDelete.length; j++) {
                        window.fetchApi('TASK', 'deleteFile', { fileId: filesToDelete[j].fileId })["catch"](function(e) { console.warn("Fallo limpieza silenciosa:", e); });
                    }
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
            tasksList.addEventListener('click', function(e) {
                var assignmentCard = e.target.closest('.assignment-card');
                var isButton = e.target.closest('button, a');

                if (assignmentCard && !isButton) {
                    var alreadyExpanded = assignmentCard.classList.contains('is-expanded');
                    var cards = document.querySelectorAll('.assignment-card');
                    for (var i = 0; i < cards.length; i++) {
                        cards[i].classList.remove('is-expanded');
                    }
                    if (!alreadyExpanded) assignmentCard.classList.add('is-expanded');
                    return;
                }

                if (e.target && e.target.classList.contains('open-submission-modal')) {
                    var ds = e.target.dataset;
                    openSubmissionModal(ds.taskId, ds.taskTitle, ds.parcial, ds.asignatura);
                }

                if (e.target && e.target.classList.contains('delete-submission-btn')) {
                    var type = e.target.dataset.type;
                    var entregaId = e.target.dataset.entregaId;

                    if (confirm('ATENCIÓN: Al eliminar tu entrega podrías perder la nota de calificación')) {
                        var btn = e.target;
                        btn.disabled = true;
                        btn.textContent = 'Eliminando...';
                        var service = type === 'Examen' ? 'EXAM' : 'TASK';
                        var action = type === 'Examen' ? 'deleteExamSubmission' : 'deleteSubmission';

                        window.fetchApi(service, action, { entregaId: entregaId })
                            .then(function(result) {
                                if (result.status === 'success') {
                                    alert('Entrega eliminada correctamente.');
                                    fetchAllActivities();
                                } else {
                                    throw new Error(result.message);
                                }
                            })
                            ["catch"](function(error) {
                                alert('Error al eliminar entrega: ' + error.message);
                                btn.disabled = false;
                                btn.textContent = 'Eliminar Entrega';
                            });
                    }
                }
            });
        }

        // --- (Req 3.3) Optimizador de Subida de Alta Fidelidad ---

        /**
         * Segmentación Lógica por Páginas (Object-Level Parsing) para PDF (Tarea 1)
         * Divide un PDF en partes independientes válidas y legibles.
         */
        function splitPdfLogically(file, partsCount) {
            return file.arrayBuffer().then(function(arrayBuffer) {
                return PDFLib.PDFDocument.load(arrayBuffer);
            }).then(function(pdfDoc) {
                var totalPages = pdfDoc.getPageCount();
                var pagesPerPart = Math.ceil(totalPages / partsCount);
                var segments = [];

                var createSegment = function(index) {
                    if (index >= partsCount) return Promise.resolve(segments);

                    var startPage = index * pagesPerPart;
                    var endPage = Math.min((index + 1) * pagesPerPart, totalPages);
                    if (startPage >= totalPages) return Promise.resolve(segments);

                    return PDFLib.PDFDocument.create().then(function(newPdf) {
                        var pagesToCopy = [];
                        for (var i = startPage; i < endPage; i++) { pagesToCopy.push(i); }
                        return newPdf.copyPages(pdfDoc, pagesToCopy).then(function(copiedPages) {
                            for (var j = 0; j < copiedPages.length; j++) {
                                newPdf.addPage(copiedPages[j]);
                            }
                            return newPdf.save();
                        }).then(function(pdfBytes) {
                            segments.push(new Blob([pdfBytes], { type: 'application/pdf' }));
                            return createSegment(index + 1);
                        });
                    });
                };

                return createSegment(0);
            })["catch"](function(e) {
                console.error("[IMA-PDF] Error en segmentación lógica:", e);
                throw new Error("No se pudo procesar la estructura del PDF. El archivo podría estar protegido o dañado.");
            });
        }

        function compressImage(file) {
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

        function startAutomatedUpload(files) {
            if (files.length === 0 || activeUploads > 0) return;

            var CHUNK_THRESHOLD = 9.5 * 1024 * 1024;
            var CHUNK_SIZE = 5 * 1024 * 1024;

            filePreviewContainer.classList.remove('hidden');
            uploadedFilesContainer.classList.remove('hidden');

            var uploadFileSequence = function(index) {
                if (index >= files.length) {
                    filePreviewContainer.classList.add('hidden');
                    fileInput.value = '';
                    return;
                }

                var currentFile = files[index];
                var isAlreadyUploaded = false;
                for (var i = 0; i < uploadedFiles.length; i++) {
                    if (uploadedFiles[i].fileName === currentFile.name && uploadedFiles[i].size === currentFile.size) {
                        isAlreadyUploaded = true;
                        break;
                    }
                }
                if (isAlreadyUploaded) {
                    uploadFileSequence(index + 1);
                    return;
                }

                var currentFileName = currentFile.name;
                var currentFileSize = currentFile.size;

                var li = document.createElement('li');
                li.className = 'flex flex-col text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up gap-3';

                var thumbnailHtml = '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><i class="fas fa-file"></i></div>';
                var parts = currentFileName.split('.');
                var ext = parts[parts.length - 1].toLowerCase();

                if (currentFile.type.indexOf('image/') === 0 || ext === 'heic') {
                    if (ext === 'heic') {
                        thumbnailHtml = '<div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400"><i class="fas fa-image"></i></div>';
                    } else {
                        var tempUrl = URL.createObjectURL(currentFile);
                        thumbnailHtml = '<img src="' + tempUrl + '" class="w-12 h-12 object-cover rounded-lg shadow-inner">';
                    }
                } else if (currentFile.type === 'application/pdf' || ext === 'pdf') {
                    thumbnailHtml = '<div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-400"><i class="fas fa-file-pdf"></i></div>';
                } else if (['html', 'css', 'js', 'psc'].indexOf(ext) !== -1) {
                    var colors = { html: 'text-orange-500', css: 'text-blue-500', js: 'text-yellow-500', psc: 'text-green-500' };
                    var icons = { html: 'fa-code', css: 'fa-css3', js: 'fa-js', psc: 'fa-terminal' };
                    thumbnailHtml = '<div class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center ' + (colors[ext] || 'text-gray-400') + '"><i class="fas ' + (icons[ext] || 'fa-file-code') + '"></i></div>';
                }

                li.innerHTML =
                    '<div class="flex items-center justify-between">' +
                        '<div class="flex items-center gap-3 truncate">' +
                            thumbnailHtml +
                            '<div class="truncate">' +
                                '<p class="truncate text-xs font-bold text-gray-800 uppercase tracking-tighter">' + currentFileName + '</p>' +
                                '<p class="text-[10px] text-gray-400 font-medium uppercase tracking-widest" id="upload-progress-text">Preparando...</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex items-center">' +
                            '<svg class="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>' +
                        '</div>' +
                    '</div>' +
                    '<div class="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100">' +
                        '<div id="upload-progress-bar" class="bg-blue-600 h-full transition-all duration-300" style="width: 0%"></div>' +
                    '</div>';
                uploadedFilesList.appendChild(li);

                activeUploads++;
                updateConfirmButtonState();

                var progressSpan = li.querySelector('#upload-progress-text');
                var progressBar = li.querySelector('#upload-progress-bar');

                var getFileDataPromise = function() {
                    if (currentFile.type.indexOf('image/') === 0 && !currentFile.name.toLowerCase().endsWith('.heic')) {
                        progressSpan.textContent = "Optimizando...";
                        if (progressBar) progressBar.style.width = '10%';
                        return compressImage(currentFile).then(function(dataUrl) {
                            return dataUrl.split(',')[1];
                        });
                    } else {
                        return new Promise(function(resolve, reject) {
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
                };

                getFileDataPromise().then(function(fileData) {
                    var mimeType = currentFile.type;
                    if (currentFile.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';

                    if (currentFileSize >= CHUNK_THRESHOLD) {
                        var totalChunks = Math.ceil(currentFileSize / CHUNK_SIZE);

                        var getSegmentsPromise = function() {
                            if (mimeType === 'application/pdf') {
                                progressSpan.textContent = "Analizando estructura PDF...";
                                return splitPdfLogically(currentFile, totalChunks);
                            } else {
                                var segments = [];
                                for (var i = 0; i < totalChunks; i++) {
                                    var start = i * CHUNK_SIZE;
                                    var end = Math.min(start + CHUNK_SIZE, currentFileSize);
                                    segments.push(currentFile.slice(start, end, currentFile.type));
                                }
                                return Promise.resolve(segments);
                            }
                        };

                        return getSegmentsPromise().then(function(segments) {
                            var uploadChunks = function(chunkIndex) {
                                if (chunkIndex >= segments.length) {
                                    if (progressBar) progressBar.style.width = '100%';
                                    progressSpan.textContent = "Partes subidas";
                                    return Promise.resolve();
                                }

                                var percent = Math.round((chunkIndex / segments.length) * 100);
                                progressSpan.textContent = 'Parte ' + (chunkIndex + 1) + ' de ' + segments.length + ' (' + percent + '%)';
                                if (progressBar) progressBar.style.width = percent + '%';

                                var blobChunk = segments[chunkIndex];
                                return new Promise(function(resolve, reject) {
                                    var reader = new FileReader();
                                    reader.onload = function() { resolve(reader.result.split(',')[1]); };
                                    reader.onerror = reject;
                                    reader.readAsDataURL(blobChunk);
                                }).then(function(chunkData) {
                                    var partFileName = currentFileName.split('.')[0] + ' - Parte ' + (chunkIndex + 1) + ' de ' + segments.length + '.' + currentFileName.split('.').pop();

                                    var attemptUpload = function(attempt) {
                                        return window.fetchApi('TASK', 'uploadFile', {
                                            userId: currentUser.userId,
                                            tareaId: currentTaskId,
                                            fileName: partFileName,
                                            fileData: chunkData,
                                            parcial: currentTaskParcial,
                                            asignatura: currentTaskAsignatura
                                        }).then(function(chunkRes) {
                                            if (chunkRes.status === 'success') {
                                                currentFolderId = chunkRes.data.folderId;
                                                return chunkRes;
                                            } else throw new Error(chunkRes.message);
                                        })["catch"](function(err) {
                                            if (attempt < 5) {
                                                return new Promise(function(r) { setTimeout(r, 2000 * attempt); }).then(function() {
                                                    return attemptUpload(attempt + 1);
                                                });
                                            }
                                            throw err;
                                        });
                                    };

                                    return attemptUpload(1);
                                }).then(function() {
                                    return uploadChunks(chunkIndex + 1);
                                });
                            };

                            return uploadChunks(0).then(function() {
                                return { status: 'success', data: { folderId: currentFolderId, mimeType: 'folder', fileId: currentFolderId } };
                            });
                        });
                    } else {
                        progressSpan.textContent = "Subiendo...";
                        if (progressBar) progressBar.style.width = '50%';
                        return window.fetchApi('TASK', 'uploadFile', {
                            userId: currentUser.userId, tareaId: currentTaskId,
                            fileName: currentFileName, fileData: fileData,
                            parcial: currentTaskParcial, asignatura: currentTaskAsignatura
                        });
                    }
                }).then(function(uploadResult) {
                    if (uploadResult.status === 'success') {
                        var uploadedData = uploadResult.data;
                        var isChunked = currentFileSize >= CHUNK_THRESHOLD;
                        var finalMimeType = isChunked ? 'folder' : uploadedData.mimeType;
                        var finalFileId = isChunked ? uploadedData.folderId : uploadedData.fileId;

                        uploadedFiles.push({
                            fileId: finalFileId,
                            fileName: currentFileName,
                            size: currentFileSize,
                            mimeType: finalMimeType
                        });
                        currentFolderId = uploadedData.folderId;

                        li.innerHTML =
                            '<div class="flex items-center justify-between">' +
                                '<div class="flex items-center gap-3 truncate">' +
                                    thumbnailHtml +
                                    '<div class="truncate">' +
                                        '<p class="truncate text-xs font-bold text-gray-800 uppercase tracking-tighter">' + currentFileName + '</p>' +
                                        '<p class="text-[10px] text-green-600 font-bold uppercase tracking-widest">Listo</p>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="flex items-center gap-2">' +
                                    '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' +
                                    '<button type="button" class="text-red-400 hover:text-red-600 remove-file-btn p-1 transition-all hover:scale-110" data-file-id="' + uploadedData.fileId + '">' +
                                        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' +
                                    '</button>' +
                                '</div>' +
                            '</div>';
                    } else {
                        throw new Error(uploadResult.message);
                    }
                })["catch"](function(error) {
                    console.error("Error detallado de subida:", error);
                    var friendlyMsg = "Error inesperado";
                    var msg = error.message.toLowerCase();
                    if (msg.indexOf("network") !== -1 || msg.indexOf("fetch") !== -1) friendlyMsg = "Error de conexión";
                    else if (msg.indexOf("large") !== -1 || msg.indexOf("size") !== -1) friendlyMsg = "Archivo demasiado grande";
                    else if (msg.indexOf("quota") !== -1 || msg.indexOf("storage") !== -1) friendlyMsg = "Error de almacenamiento";
                    else if (msg.indexOf("corrupt") !== -1) friendlyMsg = "Archivo dañado";

                    li.innerHTML =
                        '<div class="flex items-center justify-between w-full p-1 bg-red-50 rounded border border-red-100">' +
                            '<div class="flex items-center gap-2 truncate">' +
                                '<i class="fas fa-exclamation-circle text-red-500 text-xs"></i>' +
                                '<span class="text-red-600 text-[10px] truncate font-bold uppercase tracking-tighter">' + friendlyMsg + ': ' + currentFileName + '</span>' +
                            '</div>' +
                            '<button class="text-[10px] text-red-800 font-black ml-2 hover:bg-red-100 px-1.5 py-0.5 rounded" onclick="this.closest(\'li\').remove()">✕</button>' +
                        '</div>';
                })["finally"](function() {
                    activeUploads--;
                    updateConfirmButtonState();
                    uploadFileSequence(index + 1);
                });
            };

            uploadFileSequence(0);
        }

        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                var files = [];
                for (var i = 0; i < e.target.files.length; i++) {
                    files.push(e.target.files[i]);
                }
                if (files.length === 0) return;

                var MAX_SIZE_MB = 50;
                var ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'pdf', 'html', 'css', 'js', 'psc'];

                var validFiles = [];
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var nameParts = file.name.split('.');
                    var ext = nameParts[nameParts.length - 1].toLowerCase();
                    var sizeMB = file.size / (1024 * 1024);

                    if (ALLOWED_EXT.indexOf(ext) === -1) {
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
            uploadedFilesList.addEventListener('click', function(e) {
                var btn = e.target.closest('.remove-file-btn');
                if (btn) {
                    var fileId = btn.getAttribute('data-file-id');
                    var li = btn.closest('li');

                    btn.disabled = true;
                    li.style.opacity = '0.5';

                    window.fetchApi('TASK', 'deleteFile', { fileId: fileId })["catch"](function(error) {
                        console.error("Error al eliminar archivo remoto:", error);
                    });

                    var newUploadedFiles = [];
                    for (var i = 0; i < uploadedFiles.length; i++) {
                        if (uploadedFiles[i].fileId !== fileId) newUploadedFiles.push(uploadedFiles[i]);
                    }
                    uploadedFiles = newUploadedFiles;
                    li.remove();
                    if (uploadedFiles.length === 0) {
                        uploadedFilesContainer.classList.add('hidden');
                    }
                    updateConfirmButtonState();
                }
            });
        }

        if (submissionForm) {
            submissionForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isSubmitting || uploadedFiles.length === 0 || activeUploads > 0) return;

                isSubmitting = true;
                confirmSubmissionBtn.disabled = true;
                confirmSubmissionBtn.classList.add('btn-loading');
                confirmSubmissionBtn.textContent = 'Procesando...';

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
                    mimeType: finalMimeType
                };

                window.fetchApi('TASK', 'submitAssignment', payload)
                    .then(function(result) {
                        if (result.status === 'success') {
                            uploadedFiles = [];
                            alert('¡Tarea entregada exitosamente!');
                            closeSubmissionModal();
                            fetchAllActivities();
                        } else {
                            throw new Error(result.message);
                        }
                    })
                    ["catch"](function(error) {
                        alert('Error al finalizar la entrega: ' + error.message);
                        isSubmitting = false;
                    })
                    ["finally"](function() {
                        confirmSubmissionBtn.disabled = false;
                        confirmSubmissionBtn.classList.remove('btn-loading');
                        confirmSubmissionBtn.textContent = 'Entregar Tarea';
                        updateConfirmButtonState();
                    });
            });
        }

        /**
         * WhatsApp Group Button Logic
         */
        window.initWhatsAppButton = function() {
            var waActive = document.getElementById('wa-group-btn');
            var waDisabled = document.getElementById('wa-group-btn-disabled');
            if (!waActive || !waDisabled) return;

            window.fetchApi('USER', 'getWhatsAppLink', { grado: currentUser.grado })
                .then(function(res) {
                    if (res.status === 'success' && res.link) {
                        waActive.href = res.link;
                        waActive.classList.remove('hidden');
                        waDisabled.classList.add('hidden');
                    } else {
                        waActive.classList.add('hidden');
                        waDisabled.classList.remove('hidden');
                        waDisabled.innerHTML = '<svg class="w-6 h-6 fill-current opacity-50" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.101.004.242-.038.379.292.144.35.492 1.2.535 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.231-.144.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg> Grupo no disponible para tu grado';
                    }
                })["catch"](function(e) {
                    console.error("Error fetching WhatsApp link:", e);
                    waActive.classList.add('hidden');
                    waDisabled.classList.remove('hidden');
                });
        };

        function fetchAndRenderLearningProfile(dataOnly) {
            if (dataOnly === undefined) dataOnly = false;
            return window.fetchApi('USER', 'getLearningProfile', { userId: currentUser.userId })
                .then(function(res) {
                    if (res.status === 'success' && res.data && res.data.length > 0) {
                        if (!dataOnly) renderLearningProfileData(res.data);
                        return res.data;
                    }
                    return null;
                })["catch"](function(e) {
                    console.error("Error al cargar perfil de dominio:", e);
                    return null;
                });
        }

        function renderLearningProfileData(profileData) {
            var profileContainer = document.getElementById('learning-profile-integration');
            if (!profileContainer) return;

            var validData = [];
            for (var i = 0; i < profileData.length; i++) {
                if (profileData[i].intentos >= 5) validData.push(profileData[i]);
            }

            if (validData.length === 0) {
                 profileContainer.innerHTML = '<div class="p-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-[2rem] border border-gray-100 mt-8">Datos insuficientes para generar diagnóstico psicométrico.</div>';
                 return;
            }

            try {
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

                var sortedByDominio = [].concat(validData);
                sortedByDominio.sort(function(a, b) { return b.dominio - a.dominio; });

                var strengths = [];
                for (var i = 0; i < sortedByDominio.length; i++) {
                    if (sortedByDominio[i].dominio >= 80 && sortedByDominio[i].tema !== 'General') {
                        strengths.push(sortedByDominio[i]);
                        if (strengths.length === 3) break;
                    }
                }

                var weaknesses = [];
                for (var i = sortedByDominio.length - 1; i >= 0; i--) {
                    if (sortedByDominio[i].dominio < 60 && sortedByDominio[i].tema !== 'General') {
                        weaknesses.push(sortedByDominio[i]);
                        if (weaknesses.length === 3) break;
                    }
                }

                var sumDominio = 0;
                for (var i = 0; i < validData.length; i++) { sumDominio += validData[i].dominio; }
                var avgDominio = Math.round(sumDominio / validData.length);

                var classification = "Requiere Refuerzo";
                var badgeClass = "bg-orange-50 text-orange-600";
                if (avgDominio >= 90) { classification = "Maestro"; badgeClass = "bg-purple-50 text-purple-600"; }
                else if (avgDominio >= 75) { classification = "Avanzado"; badgeClass = "bg-emerald-50 text-emerald-600"; }
                else if (avgDominio >= 60) { classification = "Competente"; badgeClass = "bg-blue-50 text-blue-600"; }
                else if (avgDominio >= 40) { classification = "En Desarrollo"; badgeClass = "bg-yellow-50 text-yellow-600"; }

                var alertBanner = '';
                var criticalTopic = null;
                for (var i = 0; i < weaknesses.length; i++) {
                    if (weaknesses[i].dominio < 50) {
                        criticalTopic = weaknesses[i];
                        break;
                    }
                }
                if (criticalTopic) {
                    var presFile = findPresentation(criticalTopic.tema);
                    alertBanner =
                        '<div class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between animate-pulse">' +
                            '<div>' +
                                '<p class="text-[10px] font-black text-red-600 uppercase tracking-widest">Alerta de Aprendizaje</p>' +
                                '<p class="text-xs font-bold text-gray-800">Dominio crítico en: ' + criticalTopic.tema + '</p>' +
                            '</div>' +
                            (presFile ? '<button onclick="window.open(\'' + presFile + '\', \'_blank\')" class="px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">Repasar Ahora</button>' : '') +
                        '</div>';
                }

                var strengthsHtml = '';
                if (strengths.length > 0) {
                    for (var i = 0; i < strengths.length; i++) {
                        strengthsHtml +=
                            '<div class="flex items-center justify-between">' +
                                '<span class="text-xs font-bold text-gray-700 uppercase tracking-tighter">' + strengths[i].tema + '</span>' +
                                '<span class="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-emerald-100">' + window.redondearMetrica(strengths[i].dominio) + '%</span>' +
                            '</div>';
                    }
                } else {
                    strengthsHtml = '<p class="text-[10px] text-gray-400 italic">Sigue practicando para identificar tus fortalezas</p>';
                }

                var weaknessesHtml = '';
                if (weaknesses.length > 0) {
                    for (var i = 0; i < weaknesses.length; i++) {
                        var w = weaknesses[i];
                        var file = findPresentation(w.tema);
                        var resSection = document.getElementById('resources-section');
                        var offsetT = resSection ? resSection.offsetTop : 0;
                        var action = file ? "window.open('" + file + "', '_blank')" : "window.scrollTo({top: " + offsetT + ", behavior: 'smooth'})";
                        weaknessesHtml +=
                            '<div class="flex flex-col gap-1">' +
                                '<div class="flex items-center justify-between">' +
                                    '<span class="text-xs font-bold text-gray-700 uppercase tracking-tighter">' + w.tema + '</span>' +
                                    '<span class="text-[10px] font-black text-orange-600">' + window.redondearMetrica(w.dominio) + '%</span>' +
                                '</div>' +
                                '<button onclick="' + action + '" class="w-max text-[9px] font-black text-orange-700 uppercase tracking-widest hover:underline flex items-center gap-1">' +
                                    '<i class="fas fa-book-open text-[8px]"></i> ' + (file ? 'Repasar Ahora' : 'Ver Presentación') +
                                '</button>' +
                            '</div>';
                    }
                } else {
                    weaknessesHtml = '<p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">¡Excelente! No tienes temas críticos pendientes</p>';
                }

                profileContainer.innerHTML =
                    alertBanner +
                    '<div class="mt-8 pt-8 border-t border-gray-50 animate-fade-in-up">' +
                        '<div class="flex items-center justify-between mb-6">' +
                            '<div>' +
                                '<h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Análisis de Desempeño</h4>' +
                                '<p class="text-base font-bold text-gray-800 tracking-tight">Tu Perfil de Aprendizaje Real</p>' +
                            '</div>' +
                            '<div class="text-right">' +
                                '<span class="px-3 py-1 ' + badgeClass + ' rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-current opacity-80">' + classification + '</span>' +
                                '<p class="text-[9px] text-gray-400 font-bold uppercase mt-2">Promedio General: ' + avgDominio + '%</p>' +
                            '</div>' +
                        '</div>' +

                        '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">' +
                            '<div class="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">' +
                                '<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Estado Cognitivo (Radar)</p>' +
                                '<div class="w-full max-w-[250px]">' +
                                    '<canvas id="student-radar-chart"></canvas>' +
                                '</div>' +
                            '</div>' +
                            '<div class="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">' +
                                '<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Curva de Aprendizaje</p>' +
                                '<div class="w-full h-[200px]">' +
                                    '<canvas id="student-trend-chart"></canvas>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">' +
                            '<div class="bg-emerald-50/30 border border-emerald-100/50 p-5 rounded-[2rem]">' +
                                '<div class="flex items-center gap-2 mb-4">' +
                                    '<div class="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs shadow-sm">' +
                                        '<i class="fas fa-arrow-trend-up"></i>' +
                                    '</div>' +
                                    '<h5 class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Tus Fortalezas</h5>' +
                                '</div>' +
                                '<div class="space-y-3">' + strengthsHtml + '</div>' +
                            '</div>' +

                            '<div class="bg-orange-50/30 border border-orange-100/50 p-5 rounded-[2rem]">' +
                                '<div class="flex items-center gap-2 mb-4">' +
                                    '<div class="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs shadow-sm">' +
                                        '<i class="fas fa-lightbulb"></i>' +
                                    '</div>' +
                                    '<h5 class="text-[10px] font-black text-orange-700 uppercase tracking-widest">Temas a Reforzar</h5>' +
                                '</div>' +
                                '<div class="space-y-4">' + weaknessesHtml + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                setTimeout(function() { renderStudentCharts(profileData); }, 100);
            } catch (e) {
                console.error("Error al renderizar perfil de dominio:", e);
            }
        }

        function renderStudentCharts(profileData) {
            var radarCanvas = document.getElementById('student-radar-chart');
            var trendCanvas = document.getElementById('student-trend-chart');
            if (!radarCanvas || !trendCanvas || !profileData || profileData.length === 0) return;

            var radarCtx = radarCanvas.getContext('2d');
            var trendCtx = trendCanvas.getContext('2d');

            var sumICR = 0;
            var sumMastery = 0;
            for (var i = 0; i < profileData.length; i++) {
                sumICR += (profileData[i].dominio || 0);
                sumMastery += (profileData[i].porcentaje || 0);
            }
            var avgICR = sumICR / profileData.length;
            var avgMastery = sumMastery / profileData.length;
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

            var recentProfileData = profileData.slice(-7);
            var trendData = [];
            var trendLabels = [];
            for (var i = 0; i < recentProfileData.length; i++) {
                trendData.push(recentProfileData[i].dominio);
                trendLabels.push(recentProfileData[i].tema.substring(0, 5));
            }

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

        fetchAllActivities();
        initWhatsAppButton();

    });

})(QuizProApp);
