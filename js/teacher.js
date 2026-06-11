/**
 * QuizPro v7.5 - Teacher Dashboard Module (Manual ES5 Remediation)
 * Full Business Logic Restoration with Strict ES5 Compliance.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {
    "use strict";

    var tRadar = null;
    var tTrend = null;

    document.addEventListener('DOMContentLoaded', function() {
        var RoleCapabilities = {
            canGrade: function(user) { return user && user.rol === 'Profesor'; },
            canManageExams: function(user) { return user && user.rol === 'Profesor'; }
        };

        var submissionsTableBody = document.getElementById('submissions-table-body');
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = userRaw ? JSON.parse(userRaw) : null;

        if (!currentUser || !RoleCapabilities.canManageExams(currentUser)) {
            window.location.href = 'login.html';
            return;
        }
        var firstName = currentUser.nombre.split(' ')[0];
        var teacherNameEl = document.getElementById('teacher-name');
        if (teacherNameEl) teacherNameEl.textContent = firstName;

        // --- Elementos de Navegación ---
        var navDashboard = document.getElementById('nav-dashboard');
        var navTareas = document.getElementById('nav-tareas');
        var navProyectos = document.getElementById('nav-proyectos');
        var navLogros = document.getElementById('nav-logros');
        var navNews = document.getElementById('nav-news');
        var navAdmin = document.getElementById('nav-admin');
        var navReportsOld = document.getElementById('nav-reportes');

        var sectionAcademicReports = document.getElementById('section-dashboard');
        var sectionTareas = document.getElementById('section-tareas');
        var sectionProyectos = document.getElementById('section-proyectos');
        var sectionLogros = document.getElementById('section-logros');
        var sectionNews = document.getElementById('section-news');
        var sectionAdmin = document.getElementById('section-admin');
        var sectionReportes = document.getElementById('section-reportes');

        var tareasListView = document.getElementById('tareas-list-view');
        var tareasCreateView = document.getElementById('tareas-create-view');
        var formContainerTarea = document.getElementById('form-container-crear-tarea');
        var formContainerExamen = document.getElementById('form-container-crear-examen');

        var createAssignmentForm = document.getElementById('create-assignment-form');
        var createExamForm = document.getElementById('create-exam-form');
        var logoutButton = document.getElementById('logout-button');
        var studentSearchInput = document.getElementById('student-search');
        var backNavBtn = document.getElementById('back-nav-btn');
        var backBtnContainer = document.getElementById('back-btn-container');
        var filtersContainer = document.getElementById('filters-container');
        var dashboardLevelTitle = document.getElementById('dashboard-level-title');
        var dashboardTableHead = document.getElementById('dashboard-table-head');

        var allActivityRaw = [];
        var allAssignmentsRaw = [];
        var currentFilteredItems = [];
        var navStack = [{ level: 'Grados', data: null }];
        var isNavigating = false;
        var studentSort = { column: 'nombre', direction: 'asc' };

        var allSections = [sectionAcademicReports, sectionTareas, sectionProyectos, sectionLogros, sectionNews, sectionAdmin, sectionReportes];
        var allNavLinks = [navDashboard, navTareas, navProyectos, navLogros, navNews, navAdmin, navReportsOld];

        var norm = function(s) {
            return (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        app.navigateTo = function(targetSection, navElement, pushState) {
            if (pushState === undefined) pushState = true;
            for (var i = 0; i < allSections.length; i++) {
                if (allSections[i]) allSections[i].classList.add('hidden');
            }
            if (targetSection) targetSection.classList.remove('hidden');

            var infoCard = document.getElementById('student-details-info-card');
            if (infoCard) infoCard.remove();

            var waContainer = document.querySelector('.bg-green-50');
            if (waContainer && targetSection !== sectionAcademicReports) waContainer.classList.add('hidden');

            for (var j = 0; j < allNavLinks.length; j++) {
                var link = allNavLinks[j];
                if (link) {
                    link.classList.remove('bg-blue-600', 'text-white');
                    link.classList.add('bg-gray-100', 'text-gray-500');
                }
            }
            if (navElement) {
                navElement.classList.add('bg-blue-600', 'text-white');
                navElement.classList.remove('bg-gray-100', 'text-gray-500');
            }

            if (pushState) {
                history.pushState({ type: 'dashboard-section', sectionId: targetSection ? targetSection.id : '', navId: navElement ? navElement.id : '' }, '');
            }
        };

        if (navDashboard) navDashboard.addEventListener('click', function() {
            app.navigateTo(sectionAcademicReports, navDashboard);
            app.fetchTeacherActivity();
        });
        if (navTareas) navTareas.addEventListener('click', function() {
            app.navigateTo(sectionTareas, navTareas);
            if (tareasListView) tareasListView.classList.remove('hidden');
            if (tareasCreateView) tareasCreateView.classList.add('hidden');
            fetchManagementData();
        });
        if (navProyectos) navProyectos.addEventListener('click', function() {
            app.navigateTo(sectionProyectos, navProyectos);
            fetchProjects();
        });
        if (navLogros) navLogros.addEventListener('click', function() {
            app.navigateTo(sectionLogros, navLogros);
            fetchLogros();
        });
        if (navNews) navNews.addEventListener('click', function() {
            app.navigateTo(sectionNews, navNews);
            fetchNewsManagement();
        });
        if (navAdmin) navAdmin.addEventListener('click', function() {
            app.navigateTo(sectionAdmin, navAdmin);
            loadAcademicAdminData();
        });
        if (navReportsOld) navReportsOld.addEventListener('click', function() {
            app.navigateTo(sectionReportes, navReportsOld);
        });

        function loadAcademicAdminData() {
            var parcialSelect = document.getElementById('admin-parcial-actual');
            if (!parcialSelect) return;

            app.fetchApi('USER', 'getAcademicConfig')
                .then(function(configRes) {
                    if (configRes.status === 'success' && configRes.data.ParcialActual) {
                        parcialSelect.value = configRes.data.ParcialActual;
                        QuizProApp.PARCIAL_ACTUAL = configRes.data.ParcialActual;
                    }
                    renderAsignaturasCheckboxes();
                });
        }

        function renderAsignaturasCheckboxes() {
            var asigList = document.getElementById('admin-asignaturas-list');
            var pSel = document.getElementById('admin-parcial-actual');
            if (!asigList || !pSel) return;
            var parcial = pSel.value;

            var baseAsignaturas = [
                "Informática Aplicada", "Ofimática", "Diseño Web",
                "Programación", "Análisis y Diseño", "Bases de Datos",
                "Redes", "Programación Orientada a Objetos", "Informática I"
            ];

            app.fetchApi('USER', 'getAsignaturasActivas', { parcial: parcial })
                .then(function(activeRes) {
                    var activeList = activeRes.data || [];
                    var html = '';
                    for (var i = 0; i < baseAsignaturas.length; i++) {
                        var asig = baseAsignaturas[i];
                        var checked = false;
                        for (var j = 0; j < activeList.length; j++) {
                            if (activeList[j] === asig) { checked = true; break; }
                        }
                        html +=
                            '<label class="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">' +
                                '<input type="checkbox" class="admin-asig-checkbox w-4 h-4 text-blue-600 rounded focus:ring-blue-500" value="' + asig + '" ' + (checked ? 'checked' : '') + '>' +
                                '<span class="text-[10px] font-bold text-gray-700 uppercase">' + asig + '</span>' +
                            '</label>';
                    }
                    asigList.innerHTML = html;
                })["catch"](function() {
                    asigList.innerHTML = '<p class="text-[10px] text-red-500 p-2">Error al cargar asignaturas.</p>';
                });
        }

        var admParcial = document.getElementById('admin-parcial-actual');
        if (admParcial) admParcial.addEventListener('change', renderAsignaturasCheckboxes);

        var btnSaveAdm = document.getElementById('btn-save-academic-config');
        if (btnSaveAdm) btnSaveAdm.addEventListener('click', function() {
            var parcial = document.getElementById('admin-parcial-actual').value;
            var checkboxes = document.querySelectorAll('.admin-asig-checkbox:checked');
            var selectedAsignaturas = [];
            for (var i = 0; i < checkboxes.length; i++) { selectedAsignaturas.push(checkboxes[i].value); }

            btnSaveAdm.disabled = true;
            btnSaveAdm.textContent = 'Guardando...';

            Promise.all([
                app.fetchApi('USER', 'updateAcademicConfig', { key: 'ParcialActual', value: parcial }),
                app.fetchApi('USER', 'updateAsignaturasActivas', { parcial: parcial, asignaturas: selectedAsignaturas })
            ]).then(function() {
                alert('Configuración académica actualizada correctamente.');
            })["catch"](function(e) {
                alert('Error al guardar configuración: ' + e.message);
            })["finally"](function() {
                btnSaveAdm.disabled = false;
                btnSaveAdm.textContent = 'Guardar Configuración';
            });
        });

        // --- Lógica de Migración del Banco de Preguntas ---
        var btnMigrate = document.getElementById('btn-migrate-questions');
        if (btnMigrate) {
            btnMigrate.addEventListener('click', function() {
                if (!confirm('Esta acción escaneará el repositorio y migrará todas las preguntas detectadas al Banco Central en Google Sheets. ¿Deseas continuar?')) return;

                var statusMsg = document.getElementById('migration-status-msg');
                btnMigrate.disabled = true;
                btnMigrate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Migrando...';
                if (statusMsg) { statusMsg.classList.remove('hidden'); statusMsg.textContent = 'Iniciando escaneo...'; }

                fetch('migrated_questions.json')
                    .then(function(res) {
                        if (!res.ok) throw new Error("No se encontró el archivo de migración.");
                        return res.json();
                    })
                    .then(function(questions) {
                        if (statusMsg) statusMsg.textContent = 'Listas ' + questions.length + ' preguntas. Sincronizando...';

                        var successCount = 0;
                        var chunkSize = 10;

                        var processChunk = function(index) {
                            if (index >= questions.length) {
                                alert('¡Migración Exitosa! ' + successCount + ' preguntas sincronizadas.');
                                if (statusMsg) statusMsg.textContent = 'Completado.';
                                btnMigrate.disabled = false;
                                btnMigrate.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar / Migrar Banco';
                                return;
                            }

                            var chunk = questions.slice(index, index + chunkSize);
                            var promises = [];
                            for (var i = 0; i < chunk.length; i++) {
                                var q = chunk[i];
                                promises.push(app.fetchApi('USER', 'saveQuestion', {
                                    Asignatura: q.Asignatura, Nivel: q.Nivel, Tema: q.Tema || "General",
                                    TipoActividad: q.TipoActividad || "Selección múltiple", Pregunta: q.Pregunta,
                                    OpcionA: q.OpcionA, OpcionB: q.OpcionB, OpcionC: q.OpcionC || "",
                                    OpcionD: q.OpcionD || "", RespuestaCorrecta: q.RespuestaCorrecta, Activa: true
                                }));
                            }

                            Promise.all(promises).then(function() {
                                successCount += chunk.length;
                                if (statusMsg) statusMsg.textContent = 'Progreso: ' + successCount + ' / ' + questions.length;
                                processChunk(index + chunkSize);
                            })["catch"](function(err) {
                                alert('Error en bloque: ' + err.message);
                                btnMigrate.disabled = false;
                            });
                        };

                        processChunk(0);
                    })["catch"](function(err) {
                        alert('Error: ' + err.message);
                        btnMigrate.disabled = false;
                    });
            });
        }

        // Lógica de Navegación de Tareas
        var btnShowCreateTask = document.getElementById('btn-show-create-task');
        var btnShowCreateExam = document.getElementById('btn-show-create-exam');
        var btnBackToTareas = document.getElementById('btn-back-to-tareas');

        if (btnShowCreateTask) btnShowCreateTask.onclick = function() {
            tareasListView.classList.add('hidden');
            tareasCreateView.classList.remove('hidden');
            formContainerTarea.classList.remove('hidden');
            formContainerExamen.classList.add('hidden');
            document.getElementById('tareas-form-title').textContent = "Crear Nueva Tarea";
            initEditors();
        };
        if (btnShowCreateExam) btnShowCreateExam.onclick = function() {
            tareasListView.classList.add('hidden');
            tareasCreateView.classList.remove('hidden');
            formContainerTarea.classList.add('hidden');
            formContainerExamen.classList.remove('hidden');
            document.getElementById('tareas-form-title').textContent = "Crear Nuevo Examen";
            initEditors();
        };
        if (btnBackToTareas) btnBackToTareas.onclick = function() {
            tareasListView.classList.remove('hidden');
            tareasCreateView.classList.add('hidden');
        };

        // --- Navegación Jerárquica ---
        app.pushNav = function(level, data, pushState) {
            if (isNavigating) return Promise.resolve();
            if (pushState === undefined) pushState = true;
            isNavigating = true;

            var p = Promise.resolve();
            if (studentSearchInput) studentSearchInput.value = '';

            if (level === 'Alumnos') {
                if (submissionsTableBody) submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center p-8">Cargando lista de alumnos...</td></tr>';
                p = app.fetchApi('USER', 'getStudentsByGradoSeccion', { grado: data.grado, seccion: data.seccion })
                    .then(function(res) {
                        data.students = res.data || [];
                    })["catch"](function() {
                        data.students = [];
                    });
            }

            return p.then(function() {
                navStack.push({ level: level, data: data });
                if (pushState) {
                    history.pushState({ type: 'hierarchical-nav', stack: navStack }, '');
                }
                renderCurrentLevel();
                isNavigating = false;
            });
        };

        app.popNav = function(doPop) {
            if (isNavigating) return;
            if (doPop === undefined) doPop = true;
            if (navStack.length > 1) {
                if (studentSearchInput) studentSearchInput.value = '';
                navStack.pop();
                if (doPop) history.back();
                else renderCurrentLevel();
            }
        };

        app.syncNavWithState = function(state) {
            if (state.stack) {
                navStack = [].concat(state.stack);
                renderCurrentLevel();
            }
        };

        if (backNavBtn) backNavBtn.addEventListener('click', function() { app.popNav(); });

        var allTasksExams = [];
        function fetchManagementData() {
            var tbody = document.getElementById('tasks-management-table-body');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Cargando...</td></tr>';

            Promise.all([
                app.fetchApi('TASK', 'getAllTasks', { profesorId: currentUser.userId }),
                app.fetchApi('EXAM', 'getAllExams', { profesorId: currentUser.userId })
            ]).then(function(results) {
                var tasks = (results[0].data || []).map(function(t) { t.tipoReal = 'Tarea'; return t; });
                var exams = (results[1].data || []).map(function(e) { e.tipoReal = 'Examen'; return e; });

                allTasksExams = [].concat(tasks).concat(exams).filter(function(item) { return item.estado !== 'Inactiva'; });
                allTasksExams.sort(function(a, b) { return new Date(b.fechaLimite) - new Date(a.fechaLimite); });
                renderManagementTable();
            })["catch"](function(err) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-500">Error: ' + err.message + '</td></tr>';
            });
        }

        function renderManagementTable() {
            var tbody = document.getElementById('tasks-management-table-body');
            if (!tbody) return;
            var html = '';
            for (var i = 0; i < allTasksExams.length; i++) {
                var item = allTasksExams[i];
                html +=
                    '<tr class="hover:bg-gray-50 transition-colors cursor-pointer group" onclick="QuizProApp.openTaskDetail(' + i + ')">' +
                        '<td class="p-4">' +
                            '<div class="font-semibold text-gray-900 uppercase tracking-tighter">' + item.titulo + '</div>' +
                            '<div class="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">' + item.tipoReal + '</div>' +
                        '</td>' +
                        '<td class="p-4">' +
                            '<div class="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">' + item.asignatura + '</div>' +
                            '<div class="text-[10px] text-gray-400 font-medium">' + (item.parcial || 'Sin parcial') + '</div>' +
                        '</td>' +
                        '<td class="p-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">' + item.grado + ' - ' + (item.seccion || 'Todas') + '</td>' +
                        '<td class="p-4 text-[10px] font-semibold ' + (new Date(item.fechaLimite) < new Date() ? 'text-red-500' : 'text-green-600') + ' uppercase tracking-widest">' +
                            new Date(item.fechaLimite).toLocaleDateString() +
                        '</td>' +
                        '<td class="p-4 text-right">' +
                            '<button class="bg-gray-50 text-gray-400 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">' +
                                '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>' +
                            '</button>' +
                        '</td>' +
                    '</tr>';
            }
            tbody.innerHTML = html;
        }

        app.openTaskDetail = function(idx) {
            var item = allTasksExams[idx];
            document.getElementById('detail-titulo').textContent = item.titulo;
            document.getElementById('detail-descripcion').innerHTML = QuizProApp.sanitizarHTMLTecnico(item.descripcion) || 'Sin descripción.';
            document.getElementById('detail-asignatura').textContent = item.asignatura;
            document.getElementById('detail-parcial').textContent = item.parcial || 'N/A';
            document.getElementById('detail-grado').textContent = item.grado;
            document.getElementById('detail-seccion').textContent = item.seccion || 'Todas';
            document.getElementById('detail-fecha').textContent = new Date(item.fechaLimite).toLocaleDateString();
            document.getElementById('detail-puntaje').textContent = (item.puntaje || 100) + '%';

            var fc = document.getElementById('detail-archivo-container');
            var fl = document.getElementById('detail-archivo-link');
            if (item.archivoUrl) {
                fc.classList.remove('hidden');
                fl.href = item.archivoUrl;
            } else {
                fc.classList.add('hidden');
            }

            var modal = document.getElementById('task-details-modal');
            modal.setAttribute('data-current-index', idx);
            modal.classList.remove('hidden');
        };

        var clsTaskBtn = document.getElementById('close-task-modal-btn');
        if (clsTaskBtn) clsTaskBtn.onclick = function() { document.getElementById('task-details-modal').classList.add('hidden'); };

        var edtTaskBtn = document.getElementById('edit-task-btn');
        if (edtTaskBtn) edtTaskBtn.onclick = function() {
            var idx = document.getElementById('task-details-modal').getAttribute('data-current-index');
            var item = allTasksExams[idx];

            document.getElementById('edit-id').value = item.tareaId || item.examenId;
            document.getElementById('edit-tipo-orig').value = item.tipoReal;
            document.getElementById('edit-titulo').value = item.titulo;

            if (quillEdit) quillEdit.root.innerHTML = item.descripcion || '';

            document.getElementById('edit-asignatura').value = item.asignatura;
            document.getElementById('edit-parcial').value = item.parcial || 'Primer Parcial';
            document.getElementById('edit-grado').value = item.grado;
            document.getElementById('edit-seccion').value = item.seccion || '';
            document.getElementById('edit-fecha').value = item.fechaLimite ? item.fechaLimite.split('T')[0] : '';
            document.getElementById('edit-puntaje').value = item.puntaje || 100;
            document.getElementById('edit-archivo').value = item.archivoUrl || '';

            var examFields = document.getElementById('edit-exam-only-fields');
            if (item.tipoReal === 'Examen') {
                examFields.classList.remove('hidden');
                document.getElementById('edit-tiempo').value = item.tiempoLimite || '';
            } else {
                examFields.classList.add('hidden');
            }

            document.getElementById('task-details-modal').classList.add('hidden');
            document.getElementById('edit-task-modal').classList.remove('hidden');
        };

        var cnclEdtBtn = document.getElementById('cancel-edit-btn');
        if (cnclEdtBtn) cnclEdtBtn.onclick = function() { document.getElementById('edit-task-modal').classList.add('hidden'); };

        var edtAsigForm = document.getElementById('edit-assignment-form');
        if (edtAsigForm) edtAsigForm.onsubmit = function(e) {
            e.preventDefault();
            var submitBtn = e.target.querySelector('button[type="submit"]');
            var tipo = document.getElementById('edit-tipo-orig').value;
            var payload = {
                titulo: document.getElementById('edit-titulo').value,
                descripcion: quillEdit ? quillEdit.root.innerHTML : document.getElementById('edit-descripcion').value,
                asignatura: document.getElementById('edit-asignatura').value,
                parcial: document.getElementById('edit-parcial').value,
                gradoAsignado: document.getElementById('edit-grado').value,
                seccionAsignada: document.getElementById('edit-seccion').value,
                fechaLimite: document.getElementById('edit-fecha').value,
                puntaje: document.getElementById('edit-puntaje').value,
                archivoUrl: document.getElementById('edit-archivo').value
            };

            if (tipo === 'Tarea') { payload.tareaId = document.getElementById('edit-id').value; }
            else { payload.examenId = document.getElementById('edit-id').value; payload.tiempoLimite = document.getElementById('edit-tiempo').value; }

            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            var service = tipo === 'Tarea' ? 'TASK' : 'EXAM';
            var action = tipo === 'Tarea' ? 'updateTask' : 'updateExam';
            app.fetchApi(service, action, payload)
                .then(function(res) {
                    if (res.status === 'success') {
                        alert('Actualizado correctamente.');
                        document.getElementById('edit-task-modal').classList.add('hidden');
                        fetchManagementData();
                    } else throw new Error(res.message);
                })["catch"](function(err) {
                    alert('Error: ' + err.message);
                })["finally"](function() {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                });
        };

        app.fetchTeacherActivity = function() {
            if (!submissionsTableBody) return;

            var hasLocalData = false;
            var renderP = Promise.resolve();

            if (QuizProApp.PersistenceManager) {
                renderP = QuizProApp.PersistenceManager.get('cache_profesor_data')
                    .then(function(cached) {
                        if (cached && cached.data) {
                            console.log("[Offline-First] Panel docente desde caché.");
                            allActivityRaw = cached.data.activity || [];
                            allAssignmentsRaw = cached.data.assignments || [];
                            renderCurrentLevel();
                            hasLocalData = true;
                        }
                    });
            }

            renderP.then(function() {
                if (!hasLocalData) {
                    var sk = '';
                    for (var i = 0; i < 8; i++) {
                        sk += '<tr class="animate-pulse"><td class="p-4"><div class="skeleton h-4 w-3/4 rounded"></div></td><td class="p-4 text-right"><div class="skeleton h-4 w-1/4 rounded ml-auto"></div></td></tr>';
                    }
                    submissionsTableBody.innerHTML = sk;
                }

                var payload = { profesorId: currentUser.userId };

                return Promise.all([
                    app.fetchApi('TASK', 'getTeacherActivity', payload),
                    app.fetchApi('EXAM', 'getTeacherExamActivity', payload),
                    app.fetchApi('TASK', 'getAllTasks', payload),
                    app.fetchApi('EXAM', 'getAllExams', payload),
                    app.fetchApi('USER', 'getAcademicConfig')
                ]);
            })
            .then(function(results) {
                var taskSub = results[0].data || [];
                var examSub = results[1].data || [];
                var tasksRes = results[2].data || [];
                var examsRes = results[3].data || [];
                var configRes = results[4];

                if (configRes && configRes.status === 'success' && configRes.data.ParcialActual) {
                    QuizProApp.PARCIAL_ACTUAL = configRes.data.ParcialActual;
                }

                allActivityRaw = [];
                for (var i = 0; i < taskSub.length; i++) { taskSub[i].tipo = 'Tarea'; allActivityRaw.push(taskSub[i]); }
                for (var j = 0; j < examSub.length; j++) { examSub[j].tipo = 'Examen'; allActivityRaw.push(examSub[j]); }

                allAssignmentsRaw = [];
                for (var k = 0; k < tasksRes.length; k++) {
                    if (tasksRes[k].estado !== 'Inactiva') { tasksRes[k].tipoReal = 'Tarea'; allAssignmentsRaw.push(tasksRes[k]); }
                }
                for (var l = 0; l < examsRes.length; l++) {
                    if (examsRes[l].estado !== 'Inactiva') { examsRes[l].tipoReal = 'Examen'; allAssignmentsRaw.push(examsRes[l]); }
                }

                if (QuizProApp.PersistenceManager) {
                    QuizProApp.PersistenceManager.set('cache_profesor_data', { activity: allActivityRaw, assignments: allAssignmentsRaw });
                }

                renderCurrentLevel();
            })
            ["catch"](function(err) {
                console.error("[IMA-TEACHER] Error:", err);
                submissionsTableBody.innerHTML =
                    '<tr><td colspan="6" class="text-center p-12">' +
                        '<div class="text-gray-400 italic mb-4 text-sm">Fallo en la comunicación con el servidor.</div>' +
                        '<button onclick="location.reload()" class="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">Reintentar</button>' +
                    '</td></tr>';
            })
            ["finally"](function() {
                if (QuizProApp.GamesAdapter) QuizProApp.GamesAdapter.showLoading(false);
            });
        }

        function renderCurrentLevel() {
            var current = navStack[navStack.length - 1];
            var title = current.level;

            var infoCard = document.getElementById('student-details-info-card');
            if (infoCard) infoCard.remove();
            var waContainer = document.querySelector('.bg-green-50');
            if (waContainer) waContainer.classList.add('hidden');

            if (current.level === 'Detalles') title = 'Actividades de ' + current.data.alumnoNombre;
            if (dashboardLevelTitle) dashboardLevelTitle.textContent = title;

            if (backBtnContainer) {
                if (navStack.length > 1) backBtnContainer.classList.remove('hidden');
                else backBtnContainer.classList.add('hidden');
            }

            if (filtersContainer) {
                if (current.level === 'Grados' || current.level === 'Detalles') filtersContainer.classList.remove('hidden');
                else filtersContainer.classList.add('hidden');
            }

            var searchTerm = (studentSearchInput ? studentSearchInput.value : '').trim().toLowerCase();

            if (searchTerm !== '' && current.level !== 'Detalles') {
                renderGlobalSearch(searchTerm);
                return;
            }

            switch (current.level) {
                case 'Grados': renderGrados(searchTerm); break;
                case 'Secciones': renderSecciones(current.data.grado, searchTerm); break;
                case 'Asignaturas': renderAsignaturas(current.data.grado, current.data.seccion, searchTerm); break;
                case 'Parciales': renderParciales(current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
                case 'Alumnos': renderAlumnos(current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
                case 'Detalles': renderDetallesAlumno(current.data.alumnoId, current.data.grado, current.data.seccion, current.data.asignatura, searchTerm); break;
            }
        }

        function renderGlobalSearch(search) {
            if (dashboardLevelTitle) dashboardLevelTitle.textContent = "Resultados de Búsqueda Global";
            var alumnosGlobal = [];
            var seen = {};
            for (var i = 0; i < allActivityRaw.length; i++) {
                var item = allActivityRaw[i];
                if (!item.alumnoNombre) continue;
                if (!seen[item.alumnoId] && norm(item.alumnoNombre).indexOf(norm(search)) !== -1) {
                    alumnosGlobal.push({ id: item.alumnoId, nombre: item.alumnoNombre, email: item.email, grado: item.grado, seccion: item.seccion });
                    seen[item.alumnoId] = true;
                }
            }
            currentFilteredItems = alumnosGlobal;
            dashboardTableHead.innerHTML = '<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Alumno</th><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Grado/Secc</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>';

            if (alumnosGlobal.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-8 text-gray-500">No se encontraron alumnos.</td></tr>'; return; }

            var html = '';
            for (var j = 0; j < alumnosGlobal.length; j++) {
                var a = alumnosGlobal[j];
                html += '<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="' + j + '"><td class="p-4 font-medium text-blue-700">' + a.nombre + '</td><td class="p-4 text-sm text-gray-500">' + a.grado + ' - ' + (a.seccion || 'N/A') + '</td><td class="p-4 text-right"><span class="text-blue-600 font-medium text-sm">Ver detalles &rsaquo;</span></td></tr>';
            }
            submissionsTableBody.innerHTML = html;
        }

        function renderGrados(search) {
            var fGrado = document.getElementById('filter-grado').value;
            var gradoSet = {};
            for (var i = 0; i < allActivityRaw.length; i++) { if (allActivityRaw[i].grado) gradoSet[allActivityRaw[i].grado] = true; }
            for (var j = 0; j < allAssignmentsRaw.length; j++) { if (allAssignmentsRaw[j].grado) gradoSet[allAssignmentsRaw[j].grado] = true; }

            var grados = [];
            for (var g in gradoSet) { if (!fGrado || norm(g) === norm(fGrado)) grados.push(g); }

            var filtered = [];
            for (var k = 0; k < grados.length; k++) { if (norm(grados[k]).indexOf(norm(search)) !== -1) filtered.push(grados[k]); }

            currentFilteredItems = filtered;
            dashboardTableHead.innerHTML = '<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Grado Académico</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Navegación</th></tr>';

            if (filtered.length === 0) {
                submissionsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-12 text-gray-400 font-bold text-[10px] uppercase tracking-widest">No se encontraron grados.</td></tr>';
                return;
            }

            var html = '';
            for (var l = 0; l < filtered.length; l++) {
                var grado = filtered[l];
                html += '<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn group" data-index="' + l + '"><td class="p-4"><div class="flex items-center gap-3"><div class="w-8 h-8 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center font-semibold group-hover:bg-blue-600 group-hover:text-white transition-all">' + grado.charAt(0) + '</div><span class="font-semibold text-gray-900 uppercase tracking-tighter">' + grado + '</span></div></td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest group-hover:underline transition-all">Ver Secciones &rsaquo;</span></td></tr>';
            }
            submissionsTableBody.innerHTML = html;
        }

        function renderSecciones(grado, search) {
            var fSeccion = document.getElementById('filter-seccion').value;
            var seccSet = {};
            for (var i = 0; i < allActivityRaw.length; i++) {
                var item = allActivityRaw[i];
                if (norm(item.grado) === norm(grado) && item.seccion && norm(item.seccion) !== 'todas') seccSet[item.seccion] = true;
            }
            for (var j = 0; j < allAssignmentsRaw.length; j++) {
                var a = allAssignmentsRaw[j];
                if (norm(a.grado) === norm(grado) && a.seccion && norm(a.seccion) !== 'todas') seccSet[a.seccion] = true;
            }

            var hasTodas = false;
            for (var k = 0; k < allAssignmentsRaw.length; k++) {
                if (norm(allAssignmentsRaw[k].grado) === norm(grado) && (norm(allAssignmentsRaw[k].seccion) === 'todas' || !allAssignmentsRaw[k].seccion)) { hasTodas = true; break; }
            }
            if (hasTodas) { var def = ['A', 'B', 'C']; for (var l = 0; l < def.length; l++) { seccSet[def[l]] = true; } }

            var secciones = [];
            for (var s in seccSet) { if (!fSeccion || norm(s) === norm(fSeccion)) secciones.push(s); }

            var filtered = [];
            for (var m = 0; m < secciones.length; m++) { if (norm(secciones[m]).indexOf(norm(search)) !== -1) filtered.push(secciones[m]); }

            currentFilteredItems = filtered;
            dashboardTableHead.innerHTML = '<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Sección</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>';

            var html = '';
            for (var n = 0; n < filtered.length; n++) {
                html += '<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="' + n + '"><td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter">Sección ' + filtered[n] + '</td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest">Ver Asignaturas &rsaquo;</span></td></tr>';
            }
            submissionsTableBody.innerHTML = html;
        }

        function renderAsignaturas(grado, seccion, search) {
            var asigSet = {};
            for (var i = 0; i < allActivityRaw.length; i++) {
                var item = allActivityRaw[i];
                if (norm(item.grado) === norm(grado) && norm(item.seccion) === norm(seccion) && item.asignatura) asigSet[item.asignatura] = true;
            }
            for (var j = 0; j < allAssignmentsRaw.length; j++) {
                var a = allAssignmentsRaw[j];
                if (norm(a.grado) === norm(grado) && (norm(a.seccion) === norm(seccion) || !a.seccion || norm(a.seccion) === 'todas') && a.asignatura) asigSet[a.asignatura] = true;
            }
            var filtered = [];
            for (var asig in asigSet) { if (norm(asig).indexOf(norm(search)) !== -1) filtered.push(asig); }

            currentFilteredItems = filtered;
            dashboardTableHead.innerHTML = '<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Asignatura</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>';

            var html = '';
            for (var k = 0; k < filtered.length; k++) {
                html += '<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="' + k + '"><td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter">' + filtered[k] + '</td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest">Ver Parciales &rsaquo;</span></td></tr>';
            }
            submissionsTableBody.innerHTML = html;
        }

        function renderParciales(grado, seccion, asignatura, search) {
            var parcSet = {};
            for (var i = 0; i < allActivityRaw.length; i++) {
                var item = allActivityRaw[i];
                if (norm(item.grado) === norm(grado) && norm(item.seccion) === norm(seccion) && norm(item.asignatura) === norm(asignatura) && item.parcial) parcSet[item.parcial] = true;
            }
            for (var j = 0; j < allAssignmentsRaw.length; j++) {
                var a = allAssignmentsRaw[j];
                if (norm(a.grado) === norm(grado) && (norm(a.seccion) === norm(seccion) || !a.seccion || norm(a.seccion) === 'todas') && norm(a.asignatura) === norm(asignatura) && a.parcial) parcSet[a.parcial] = true;
            }

            var PO = ['Primer Parcial', 'Segundo Parcial', 'Tercer Parcial', 'Cuarto Parcial'];
            var parcArr = [];
            for (var p in parcSet) { parcArr.push(p); }
            parcArr.sort(function(a, b) { return PO.indexOf(a) - PO.indexOf(b); });

            var filtered = [];
            for (var k = 0; k < parcArr.length; k++) { if (norm(parcArr[k]).indexOf(norm(search)) !== -1) filtered.push(parcArr[k]); }

            currentFilteredItems = filtered;
            dashboardTableHead.innerHTML = '<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Parcial Académico</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>';

            var html = '';
            for (var l = 0; l < filtered.length; l++) {
                html += '<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn" data-index="' + l + '"><td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter">' + filtered[l] + '</td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest">Ver Alumnos &rsaquo;</span></td></tr>';
            }
            submissionsTableBody.innerHTML = html;
        }

        function renderAlumnos(grado, seccion, asignatura, search) {
            var current = navStack[navStack.length - 1];
            var students = current.data.students || [];
            var parcial = current.data.parcial;

            var waContainer = document.querySelector('.bg-green-50');
            if (waContainer) waContainer.classList.remove('hidden');

            var filtered = [];
            for (var i = 0; i < students.length; i++) {
                if (norm(students[i].nombre).indexOf(norm(search)) !== -1) filtered.push(students[i]);
            }

            var studentsWithStatus = filtered.map(function(s) {
                var isPending = false;
                for (var j = 0; j < allActivityRaw.length; j++) {
                    var sub = allActivityRaw[j];
                    if (sub.alumnoId == s.userId && norm(sub.grado) === norm(grado) && norm(sub.seccion) === norm(seccion) && norm(sub.asignatura) === norm(asignatura) && norm(sub.parcial) === norm(parcial)) {
                        var status = sub.estado;
                        if ((status === 'Pendiente' || status === 'Pendiente de revisión' || !status) && (sub.fileId || sub.respuestas || sub.entregaId)) {
                            isPending = true; break;
                        }
                    }
                }
                return { id: s.userId, nombre: s.nombre, numeroLista: s.numeroLista, statusText: isPending ? 'Pendiente' : 'Al día', isPending: isPending, rawData: s };
            });

            studentsWithStatus.sort(function(a, b) {
                var valA, valB;
                if (studentSort.column === 'numeroLista') { valA = parseInt(a.numeroLista) || 999; valB = parseInt(b.numeroLista) || 999; }
                else if (studentSort.column === 'estado') { valA = a.statusText; valB = b.statusText; }
                else { valA = norm(a.nombre); valB = norm(b.nombre); }
                if (valA < valB) return studentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return studentSort.direction === 'asc' ? 1 : -1;
                return 0;
            });

            currentFilteredItems = studentsWithStatus;
            dashboardTableHead.innerHTML = '<tr class="bg-gray-50 border-b border-gray-100"><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="numeroLista">No. Lista</th><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="nombre">Alumno</th><th class="p-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.7rem] cursor-pointer sort-btn" data-sort="estado">Estado</th><th class="p-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.7rem]">Acción</th></tr>';

            var html = '';
            for (var k = 0; k < studentsWithStatus.length; k++) {
                var s = studentsWithStatus[k];
                var statusClass = s.isPending ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700';
                html += '<tr class="hover:bg-gray-50 transition-colors cursor-pointer nav-btn group" data-index="' + k + '"><td class="p-4 text-gray-400 font-mono text-xs">' + (s.numeroLista || '-') + '</td><td class="p-4 font-semibold text-gray-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">' + s.nombre + '</td><td class="p-4"><span class="px-2 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-widest ' + statusClass + '">' + s.statusText + '</span></td><td class="p-4 text-right"><span class="text-blue-600 font-semibold text-[9px] uppercase tracking-widest">Detalles &rsaquo;</span></td></tr>';
            }
            submissionsTableBody.innerHTML = html;
        }

        function renderDetallesAlumno(alumnoId, grado, seccion, asignatura, search) {
            var fEstado = document.getElementById('filter-estado').value;
            var current = navStack[navStack.length - 1];
            var parcial = current.data.parcial;
            var isGlobalSearch = (asignatura === 'Búsqueda Global');

            var studentInfo = current.data.studentInfo || null;
            if (studentInfo) {
                app.fetchApi("USER", "getLearningProfile", { userId: studentInfo.userId || studentInfo.id })
                    .then(function(res) {
                        if (res.status === "success" && res.data) renderTeacherPsychometricModule(res.data);
                    });

                var existing = document.getElementById('student-details-info-card');
                if (existing) existing.remove();

                var activeParcial = QuizProApp.normalizePartial(QuizProApp.PARCIAL_ACTUAL);
                var studentSubmissions = [];
                for (var i = 0; i < allActivityRaw.length; i++) {
                    var sub = allActivityRaw[i];
                    if (sub.alumnoId == alumnoId && norm(sub.grado) === norm(grado) && norm(sub.seccion) === norm(seccion) && (isGlobalSearch || norm(sub.asignatura) === norm(asignatura)) && (isGlobalSearch || QuizProApp.normalizePartial(sub.parcial) === activeParcial)) {
                        studentSubmissions.push(sub);
                    }
                }

                var mandatoryCompleted = 0;
                var gradeSum = 0;
                var totalBase = 0;
                for (var j = 0; j < studentSubmissions.length; j++) {
                    var s = studentSubmissions[j];
                    if (s.estado === 'Completada' || s.estado === 'Revisada' || s.estado === 'Finalizado') mandatoryCompleted++;
                    gradeSum += parseFloat(s.calificacion || 0);
                    totalBase++;
                }

                var compositeProgress = totalBase > 0 ? Math.round((mandatoryCompleted / totalBase) * 100) : 0;

                var infoCard = document.createElement('div');
                infoCard.id = 'student-details-info-card';
                infoCard.className = "bg-white rounded-[2.5rem] shadow-xl border border-gray-100 mb-8 overflow-hidden animate-fade-in-up";
                infoCard.innerHTML =
                    '<div class="p-6">' +
                        '<div class="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">' +
                            '<div class="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-semibold">' + studentInfo.nombre.charAt(0) + '</div>' +
                            '<div>' +
                                '<h3 class="text-xl font-semibold text-gray-900">' + studentInfo.nombre + '</h3>' +
                                '<p class="text-[10px] text-gray-400 font-bold uppercase">' + grado + ' - ' + seccion + ' | ' + parcial + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">' +
                            '<div>' +
                                '<p class="text-[8px] font-bold text-gray-400 uppercase mb-2">Progreso del Parcial</p>' +
                                '<div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden">' +
                                    '<div class="bg-blue-600 h-full transition-all duration-1000" style="width: ' + compositeProgress + '%"></div>' +
                                '</div>' +
                                '<p class="text-right text-[10px] font-bold mt-1">' + compositeProgress + '%</p>' +
                            '</div>' +
                            '<div id="teacher-learning-analytics" class="hidden"></div>' +
                        '</div>' +
                    '</div>';

                var table = submissionsTableBody.closest('table');
                if (table) table.parentNode.insertBefore(infoCard, table);
            }

            var filtered = [];
            for (var k = 0; k < allActivityRaw.length; k++) {
                var item = allActivityRaw[k];
                if (item.alumnoId == alumnoId && (isGlobalSearch || (norm(item.asignatura) === norm(asignatura) && norm(item.parcial) === norm(parcial))) && norm(item.titulo).indexOf(norm(search)) !== -1) {
                    filtered.push(item);
                }
            }
            filtered.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });

            var finalFiltered = [];
            for (var l = 0; l < filtered.length; l++) {
                var item = filtered[l];
                var itemEstado = 'Pendiente';
                if (item.estado === 'Completada' || item.estado === 'Revisada') itemEstado = 'Completada';
                else if (item.estado === 'Rechazada') itemEstado = 'Rechazada';
                else if (item.fileId || item.respuestas || item.entregaId) itemEstado = 'Por calificar';

                if (!fEstado || itemEstado === fEstado) finalFiltered.push(item);
            }

            currentFilteredItems = finalFiltered;
            dashboardTableHead.innerHTML = '<tr class="bg-gray-50 border-b border-gray-100"><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Actividad</th><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Estado</th><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Archivo</th><th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Nota</th><th class="px-2 py-2 text-right font-medium text-gray-500 uppercase tracking-wider text-[0.65rem]">Acción</th></tr>';

            if (finalFiltered.length === 0) { submissionsTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">Sin entregas.</td></tr>'; return; }

            var html = '';
            for (var m = 0; m < finalFiltered.length; m++) {
                var it = finalFiltered[m];
                var sCls = 'bg-gray-50 text-gray-500';
                var sTxt = it.estado || 'Pendiente';

                if (it.estado === 'Completada' || it.estado === 'Revisada') { sTxt = 'Completada'; sCls = 'bg-green-50 text-green-700'; }
                else if (it.estado === 'Rechazada' || it.estado === 'Tarea incompleta') { sCls = 'bg-red-50 text-red-700'; }
                else if (it.estado === 'Pendiente de revisión' || it.fileId || it.respuestas || it.entregaId) { sTxt = 'Por calificar'; sCls = 'bg-yellow-50 text-yellow-700'; }

                var fileH = '<span class="text-gray-300">-</span>';
                if (it.fileId) {
                    fileH = '<a href="https://drive.google.com/uc?id=' + it.fileId + '" target="_blank" class="text-blue-600 font-semibold text-[10px] uppercase tracking-widest hover:underline">Ver</a>';
                }

                html += '<tr class="hover:bg-gray-50 transition-colors"><td class="px-1 py-2"><div class="font-semibold text-gray-900 uppercase tracking-tighter text-[11px] line-clamp-1">' + it.titulo + '</div><div class="text-[8px] font-semibold text-gray-400 uppercase tracking-widest">' + it.asignatura + '</div></td><td class="px-1 py-2"><span class="px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-widest ' + sCls + '">' + sTxt + '</span></td><td class="px-1 py-2">' + fileH + '</td><td class="px-1 py-2 font-semibold text-gray-900 text-[10px]">' + (it.calificacion || '-') + '</td><td class="px-1 py-2 text-right space-x-1"><button class="bg-blue-600 text-white px-2 py-1 rounded-md text-[8px] font-bold uppercase grade-btn" data-index="' + m + '">Calcular</button></td></tr>';
            }
            submissionsTableBody.innerHTML = html;
        }

        if (studentSearchInput) studentSearchInput.addEventListener('input', function() { renderCurrentLevel(); });
        var fltIds = ['filter-grado', 'filter-seccion', 'filter-estado'];
        for (var i = 0; i < fltIds.length; i++) {
            var el = document.getElementById(fltIds[i]);
            if (el) el.addEventListener('change', function() { renderCurrentLevel(); });
        }

        if (submissionsTableBody) {
            submissionsTableBody.addEventListener('click', function(e) {
                var target = e.target;
                if (target.classList.contains('grade-btn')) {
                    var idx = target.getAttribute('data-index');
                    var item = currentFilteredItems[idx];
                    if (item) openGradeModal(item);
                    return;
                }

                var navBtn = target.closest('.nav-btn');
                if (navBtn && !isNavigating) {
                    var idxNav = parseInt(navBtn.getAttribute('data-index'));
                    var itemNav = currentFilteredItems[idxNav];
                    var current = navStack[navStack.length - 1];

                    if (current.level === 'Grados') app.pushNav('Secciones', { grado: itemNav });
                    else if (current.level === 'Secciones') app.pushNav('Asignaturas', { grado: current.data.grado, seccion: itemNav });
                    else if (current.level === 'Asignaturas') app.pushNav('Parciales', { grado: current.data.grado, seccion: current.data.seccion, asignatura: itemNav });
                    else if (current.level === 'Parciales') app.pushNav('Alumnos', { grado: current.data.grado, seccion: current.data.seccion, asignatura: current.data.asignatura, parcial: itemNav });
                    else if (current.level === 'Alumnos') app.pushNav('Detalles', { alumnoId: itemNav.id, alumnoNombre: itemNav.nombre, grado: current.data.grado, seccion: current.data.seccion, asignatura: current.data.asignatura, parcial: current.data.parcial, studentInfo: itemNav.rawData });
                }
            });
        }

        // --- Gestión de Noticias ---
        var newsModal = document.getElementById('news-modal');
        var btnCreateNews = document.getElementById('btn-create-news');
        var newsForm = document.getElementById('news-form');
        var newsManagementContainer = document.getElementById('news-management-container');

        if (btnCreateNews) {
            btnCreateNews.onclick = function() {
                if (newsForm) newsForm.reset();
                if (quillNews) quillNews.setContents([]);
                if (newsModal) newsModal.classList.remove('hidden');
            };
        }

        function fetchNewsManagement() {
            if (!newsManagementContainer) return;
            newsManagementContainer.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Cargando noticias...</div>';
            app.fetchApi('USER', 'getNews', {})
                .then(function(res) {
                    var data = res.data || [];
                    if (data.length === 0) {
                        newsManagementContainer.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No hay noticias publicadas.</div>';
                        return;
                    }
                    var html = '';
                    for (var i = 0; i < data.length; i++) {
                        var n = data[i];
                        html +=
                            '<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-5">' +
                                '<div class="flex justify-between items-center mb-2">' +
                                    '<span class="text-[9px] font-medium uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">' + n.categoria + '</span>' +
                                    '<span class="text-[10px] text-gray-400">' + n.fecha + '</span>' +
                                '</div>' +
                                '<h3 class="font-medium text-gray-800 mb-2">' + n.titulo + '</h3>' +
                            '</div>';
                    }
                    newsManagementContainer.innerHTML = html;
                });
        }

        if (newsForm) {
            newsForm.onsubmit = function(e) {
                e.preventDefault();
                var saveBtn = document.getElementById('save-news-btn');
                saveBtn.disabled = true;
                saveBtn.textContent = 'Publicando...';

                var payload = {
                    titulo: document.getElementById('news-title').value,
                    categoria: document.getElementById('news-category').value,
                    contenido: quillNews ? quillNews.root.innerHTML : document.getElementById('news-content').value
                };

                app.fetchApi('USER', 'createNews', payload)
                    .then(function(res) {
                        if (res.status === 'success') {
                            alert('Noticia publicada exitosamente.');
                            if (newsModal) newsModal.classList.add('hidden');
                            fetchNewsManagement();
                        } else alert(res.message);
                    })["catch"](function() { alert('Error al publicar.'); })
                    ["finally"](function() { saveBtn.disabled = false; saveBtn.textContent = 'Publicar'; });
            };
        }

        // --- Calificación Modal ---
        var gradeModal = document.getElementById('grade-modal');
        var saveGradeBtn = document.getElementById('save-grade-btn');
        var cancelGradeBtn = document.getElementById('cancel-grade-btn');
        var currentEditingEntregaId = null;

        function openGradeModal(entrega) {
            currentEditingEntregaId = entrega.entregaId;
            document.getElementById('student-name-modal').textContent = entrega.alumnoNombre || entrega.nombre;
            saveGradeBtn.disabled = false;
            saveGradeBtn.classList.remove('btn-loading');

            document.getElementById('grade-modal-task-title').textContent = entrega.titulo || 'N/A';
            if (entrega.fecha) {
                var d = new Date(entrega.fecha);
                document.getElementById('grade-modal-date').textContent = d.toLocaleDateString();
                document.getElementById('grade-modal-time').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            var flm = document.getElementById('file-link-modal');
            if (entrega.tipo === 'Examen') { flm.href = 'results.html?entregaExamenId=' + entrega.entregaId; flm.textContent = "Ver Respuestas"; }
            else if (entrega.fileId) { flm.href = 'https://drive.google.com/uc?id=' + entrega.fileId; flm.textContent = "Ver Archivo"; }

            document.getElementById('calificacion').value = entrega.calificacion || '';
            document.getElementById('estado').value = (entrega.estado === 'Revisada' ? 'Completada' : (entrega.estado || 'Completada'));
            document.getElementById('comentario').value = entrega.comentario || '';

            saveGradeBtn.setAttribute('data-type', entrega.tipo);
            gradeModal.classList.remove('hidden');
        }

        if (cancelGradeBtn) cancelGradeBtn.onclick = function() { gradeModal.classList.add('hidden'); };
        if (saveGradeBtn) saveGradeBtn.onclick = function() {
            var type = saveGradeBtn.getAttribute('data-type');
            var payload = {
                entregaId: currentEditingEntregaId,
                calificacion: document.getElementById('calificacion').value,
                estado: document.getElementById('estado').value,
                comentario: document.getElementById('comentario').value
            };

            saveGradeBtn.disabled = true;
            saveGradeBtn.classList.add('btn-loading');

            app.fetchApi(type === 'Tarea' ? 'TASK' : 'EXAM', type === 'Tarea' ? 'gradeSubmission' : 'gradeExamSubmission', payload)
                .then(function(res) {
                    if (res.status === 'success') {
                        alert('¡Calificación guardada!');
                        gradeModal.classList.add('hidden');
                        app.fetchTeacherActivity();
                    } else throw new Error(res.message);
                })["catch"](function(err) { alert(err.message); })
                ["finally"](function() { saveGradeBtn.disabled = false; saveGradeBtn.classList.remove('btn-loading'); });
        };

        function fetchLogros() {
            var tbody = document.getElementById('logros-table-body');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8">Cargando...</td></tr>';
            app.fetchApi('USER', 'getGameStats', {})
                .then(function(res) {
                    var data = res.data || [];
                    var html = '';
                    for (var i = 0; i < data.length; i++) {
                        var r = data[i];
                        html += '<tr class="hover:bg-gray-50 transition-colors"><td class="p-4 text-gray-400 font-mono">' + (i + 1) + '</td><td class="p-4 font-medium text-gray-800">' + r[2] + '</td><td class="p-4 text-purple-600 font-medium">' + r[3] + '</td><td class="p-4"><span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">' + r[5] + '</span></td><td class="p-4 text-xs text-gray-400">' + new Date(r[0]).toLocaleString() + '</td></tr>';
                    }
                    tbody.innerHTML = html || '<tr><td colspan="5" class="text-center p-8 text-gray-500">Sin datos.</td></tr>';
                });
        }

        var quillTask, quillExam, quillEdit, quillNews;
        function initEditors() {
            if (!quillTask && document.getElementById('editor-task-container')) {
                quillTask = new Quill('#editor-task-container', { theme: 'snow', placeholder: 'Descripción...' });
            }
            if (!quillExam && document.getElementById('editor-exam-container')) {
                quillExam = new Quill('#editor-exam-container', { theme: 'snow', placeholder: 'Instrucciones...' });
            }
            if (!quillEdit && document.getElementById('editor-edit-container')) {
                quillEdit = new Quill('#editor-edit-container', { theme: 'snow' });
            }
            if (!quillNews && document.getElementById('editor-news-container')) {
                quillNews = new Quill('#editor-news-container', { theme: 'snow' });
            }
        }

        function renderTeacherPsychometricModule(profileData) {
            var div = document.getElementById("teacher-learning-analytics");
            if (!div) return;
            div.innerHTML = '<h5 class="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-4">Análisis Cognitivo</h5>';
            div.classList.remove("hidden");

            var sumD = 0;
            var sumP = 0;
            for (var i = 0; i < profileData.length; i++) { sumD += profileData[i].dominio; sumP += (profileData[i].porcentaje || 0); }
            var avgD = profileData.length > 0 ? Math.round(sumD / profileData.length) : 0;
            var avgP = profileData.length > 0 ? Math.round(sumP / profileData.length) : 0;

            div.innerHTML +=
                '<div class="grid grid-cols-3 gap-2 mb-4">' +
                    '<div class="text-center p-2 bg-gray-50 rounded-lg"><p class="text-[6px] text-gray-400 uppercase">Dom</p><p class="text-[10px] font-bold">' + avgD + '%</p></div>' +
                    '<div class="text-center p-2 bg-gray-50 rounded-lg"><p class="text-[6px] text-gray-400 uppercase">Acc</p><p class="text-[10px] font-bold">' + avgP + '%</p></div>' +
                    '<div class="text-center p-2 bg-gray-50 rounded-lg"><p class="text-[6px] text-gray-400 uppercase">Stb</p><p class="text-[10px] font-bold">' + avgD + '%</p></div>' +
                '</div>' +
                '<div class="grid grid-cols-2 gap-2"><canvas id="teacher-radar-chart" height="100"></canvas><canvas id="teacher-trend-chart" height="100"></canvas></div>';

            setTimeout(function() {
                var rEl = document.getElementById('teacher-radar-chart');
                var tEl = document.getElementById('teacher-trend-chart');
                var rCtx = rEl ? rEl.getContext('2d') : null;
                var tCtx = tEl ? tEl.getContext('2d') : null;
                if (!rCtx || !tCtx) return;

                if (tRadar) tRadar.destroy();
                tRadar = new Chart(rCtx, {
                    type: 'radar',
                    data: { labels: ['ICR','MST','STB'], datasets: [{ data: [avgD, avgP, avgD], backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3b82f6', borderWidth: 1, pointRadius: 0 }] },
                    options: { scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } }
                });

                var trendData = profileData.slice(-5).map(function(item) { return item.dominio; });
                if (tTrend) tTrend.destroy();
                tTrend = new Chart(tCtx, {
                    type: 'line',
                    data: { labels: trendData.map(function(_,i){return i+1;}), datasets: [{ data: trendData, borderColor: '#10b981', borderWidth: 2, tension: 0.4, pointRadius: 0, fill: false }] },
                    options: { scales: { y: { display: false }, x: { display: false } }, plugins: { legend: { display: false } } }
                });
            }, 100);
        }

        if (logoutButton) logoutButton.addEventListener('click', function() { localStorage.removeItem('currentUser'); window.location.href = 'login.html'; });

        history.replaceState({ type: 'dashboard-section', sectionId: sectionAcademicReports.id, navId: navDashboard.id }, '');
        app.navigateTo(sectionAcademicReports, navDashboard, false);
        app.fetchTeacherActivity();
    });

})(QuizProApp);
