document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    const firstName = currentUser.nombre.split(' ')[0];
    document.getElementById('student-name').textContent = firstName;
    const tasksList = document.getElementById('tasks-list');
    const logoutButton = document.getElementById('logout-button');

    // --- Elementos de Perfil ---
    const profileModal = document.getElementById('profile-modal');
    const openProfileBtn = document.getElementById('open-profile-btn');
    const closeProfileModal = document.getElementById('close-profile-modal');
    const profileForm = document.getElementById('profile-form');

    const CHUNK_SIZE = 1024 * 1024 * 2; // 1MB chunks
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
        tasksList.innerHTML = '<p class="text-gray-500">Cargando actividades...</p>';
        try {
            const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };

            const [tasksResult, examsResult] = await Promise.all([
                fetchApi('TASK', 'getStudentTasks', payload),
                fetchApi('EXAM', 'getStudentExams', payload)
            ]);

            const allActivities = [];
            if (tasksResult.status === 'success' && tasksResult.data) {
                // Conservar el tipo original (Tarea o Credito Extra)
                allActivities.push(...tasksResult.data.map(task => ({ ...task, type: task.tipo || 'Tarea' })));
            }
            if (examsResult.status === 'success' && examsResult.data) {
                allActivities.push(...examsResult.data.map(exam => ({ ...exam, type: 'Examen' })));
            }

            // Ordenar: No revisadas primero, luego por fecha límite (descendente - más reciente arriba)
            allActivities.sort((a, b) => {
                const isReviewed = (act) => {
                    if (!act.entrega) return false;
                    const s = act.entrega.estado;
                    return (s === 'Completada' || s === 'Revisada' || s === 'Finalizado' || s === 'Rechazada');
                };

                const revA = isReviewed(a);
                const revB = isReviewed(b);

                // sin revisar (false) viene antes que calificadas (true)
                if (revA !== revB) {
                    return revA ? 1 : -1;
                }

                // Dentro del mismo grupo, fecha más reciente primero (descendente)
                return new Date(b.fechaLimite) - new Date(a.fechaLimite);
            });

            allActivitiesData = allActivities;
            renderParcialTabs(allActivities);

        } catch (error) {
            tasksList.innerHTML = `<p class="text-red-500">Error al cargar actividades: ${error.message}</p>`;
        }
    }

    function renderParcialTabs(activities) {
        const tabsContainer = document.getElementById('parcial-tabs-container');
        if (!tabsContainer) return;

        if (!activities || activities.length === 0) {
            tabsContainer.innerHTML = '';
            renderActivities([]);
            return;
        }

        const parciales = [...new Set(activities.map(a => (a.parcial && a.parcial.trim()) || 'Sin Parcial'))];
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
                e.target.classList.remove('bg-gray-100', 'text-gray-500', 'hover:bg-gray-200');
                e.target.classList.add('bg-blue-600', 'text-white');

                renderActivities(allActivitiesData, e.target.dataset.parcial);
            });
        });

        renderActivities(activities, activeParcial);
    }

    function renderActivities(activities, filterParcial = null) {
        const filtered = filterParcial
            ? activities.filter(a => ((a.parcial && a.parcial.trim()) || 'Sin Parcial') === filterParcial)
            : activities;

        if (!filtered || filtered.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500">No hay actividades para este parcial.</p>';
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
                            <div class="text-gray-600 text-sm font-medium mb-5 leading-relaxed quill-content">${activity.descripcion || 'Sin descripción.'}</div>
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

        uploadedFilesList.innerHTML = '';
        uploadedFilesContainer.classList.add('hidden');
        filePreviewContainer.classList.add('hidden');
        fileInput.value = '';
        updateConfirmButtonState();

        submissionModal.classList.remove('hidden');
    }

    function closeSubmissionModal() {
        if (activeUploads > 0) {
            if (!confirm('Hay una subida en progreso. ¿Estás seguro de cerrar el modal?')) return;
        }
        submissionModal.classList.add('hidden');
        submissionForm.reset();
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

        filePreviewContainer.classList.remove('hidden');
        uploadedFilesContainer.classList.remove('hidden');

        // Procesar Cola Secuencialmente (Req 3.3)
        for (const currentFile of files) {
            // Filtro Anti-Duplicados
            if (uploadedFiles.some(u => u.fileName === currentFile.name && u.size === currentFile.size)) continue;

            const currentFileName = currentFile.name;
            const currentFileSize = currentFile.size;

            const li = document.createElement('li');
            li.className = 'flex items-center justify-between text-sm text-gray-700 bg-white p-2 rounded border shadow-sm animate-fade-in-up';
            li.innerHTML = `
                <div class="flex items-center space-x-2 truncate">
                    <svg class="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span class="truncate text-xs">${currentFileName}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-[10px] text-blue-500 font-medium" id="upload-progress-text">Preparando...</span>
                </div>
            `;
            uploadedFilesList.appendChild(li);

            activeUploads++;
            updateConfirmButtonState();

            try {
                let uploadResult;
                const progressSpan = li.querySelector('#upload-progress-text');
                let fileData;
                let mimeType = currentFile.type;

                // Optimización Móvil: Compresión de imágenes (Req 3.3)
                if (currentFile.type.startsWith('image/')) {
                    progressSpan.textContent = "Optimizando...";
                    fileData = await compressImage(currentFile);
                } else {
                    fileData = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(currentFile);
                    });
                }

                const blobSize = Math.floor((fileData.length - (fileData.indexOf(',') + 1)) * 0.75);

                if (blobSize > CHUNK_SIZE) {
                    const totalChunks = Math.ceil(blobSize / CHUNK_SIZE);
                    const uploadId = "UP-" + Date.now();
                    const rawBase64 = fileData.split(',')[1];

                    for (let i = 0; i < totalChunks; i++) {
                        progressSpan.textContent = `${Math.round((i/totalChunks)*100)}%`;
                        const start = i * (CHUNK_SIZE * 1.33);
                        const chunk = rawBase64.substring(start, start + (CHUNK_SIZE * 1.33));
                        await fetchApi('TASK', 'uploadChunk', { uploadId, chunkIndex: i, chunkData: chunk });
                    }

                    progressSpan.textContent = "Finalizando...";
                    uploadResult = await fetchApi('TASK', 'finishChunkedUpload', {
                        uploadId, userId: currentUser.userId, tareaId: currentTaskId,
                        parcial: currentTaskParcial, asignatura: currentTaskAsignatura,
                        fileName: currentFileName, mimeType: mimeType, totalChunks
                    });
                } else {
                    progressSpan.textContent = "Subiendo...";
                    uploadResult = await fetchApi('TASK', 'uploadFile', {
                        userId: currentUser.userId, tareaId: currentTaskId,
                        fileName: currentFileName, fileData: fileData,
                        parcial: currentTaskParcial, asignatura: currentTaskAsignatura
                    });
                }

                if (uploadResult.status === 'success') {
                    const uploadedData = uploadResult.data;
                    uploadedFiles.push({
                        fileId: uploadedData.fileId,
                        fileName: currentFileName,
                        size: currentFileSize,
                        mimeType: uploadedData.mimeType
                    });
                    currentFolderId = uploadedData.folderId;

                    li.innerHTML = `
                        <div class="flex items-center space-x-2 truncate">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            <span class="truncate text-xs font-medium text-gray-800">${currentFileName}</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <span class="text-[10px] text-green-600 font-medium uppercase tracking-tighter">Listo</span>
                            <button type="button" class="text-red-400 hover:text-red-600 remove-file-btn p-1" data-file-id="${uploadedData.fileId}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    `;
                } else throw new Error(uploadResult.message);

            } catch (error) {
                li.innerHTML = `<div class="flex items-center justify-between w-full p-1 bg-red-50 rounded"><span class="text-red-600 text-[10px] truncate font-medium">FALLÓ: ${currentFileName}</span><button class="text-[10px] text-red-800 font-semibold ml-2" onclick="this.closest('li').remove()">✕</button></div>`;
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
            startAutomatedUpload(files);
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
            if (uploadedFiles.length === 0 || activeUploads > 0) return;

            confirmSubmissionBtn.disabled = true;
            confirmSubmissionBtn.classList.add('btn-loading');

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
                    alert('¡Tarea entregada exitosamente!');
                    closeSubmissionModal();
                    fetchAllActivities();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                alert(`Error al finalizar la entrega: ${error.message}`);
            } finally {
                confirmSubmissionBtn.disabled = false;
                confirmSubmissionBtn.classList.remove('btn-loading');
                updateConfirmButtonState();
            }
        });
    }

    // --- Lógica de Perfil ---
    if (openProfileBtn) {
        openProfileBtn.onclick = () => {
            document.getElementById('profile-nombre').value = currentUser.nombre;
            document.getElementById('profile-email').value = currentUser.email || '';
            document.getElementById('profile-telefono').value = currentUser.telefono || '';
            document.getElementById('profile-numeroLista').value = currentUser.numeroLista || '';
            profileModal.classList.remove('hidden');
        };
    }

    if (closeProfileModal) {
        closeProfileModal.onclick = () => profileModal.classList.add('hidden');
    }

    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const newPassword = document.getElementById('profile-password').value;
            const currentPassword = document.getElementById('profile-current-password').value;

            if (newPassword && !currentPassword) {
                alert('Debe ingresar su contraseña actual para realizar cambios de seguridad.');
                return;
            }

            const payload = {
                userId: currentUser.userId,
                nombre: document.getElementById('profile-nombre').value,
                email: document.getElementById('profile-email').value,
                telefono: document.getElementById('profile-telefono').value,
                numeroLista: document.getElementById('profile-numeroLista').value,
                currentPassword: currentPassword || undefined,
                password: newPassword || undefined
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            try {
                const result = await fetchApi('USER', 'updateUserProfile', payload);
                if (result.status === 'success') {
                    currentUser.nombre = payload.nombre;
                    currentUser.email = payload.email;
                    currentUser.telefono = payload.telefono;
                    currentUser.numeroLista = payload.numeroLista;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    document.getElementById('student-name').textContent = currentUser.nombre;
                    alert('Perfil actualizado correctamente.');
                    profileModal.classList.add('hidden');
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (err) {
                alert('Error de conexión.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Cambios';
            }
        };
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
});
