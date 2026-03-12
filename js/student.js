document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre;
    const tasksList = document.getElementById('tasks-list');
    const logoutButton = document.getElementById('logout-button');

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // --- Elementos del Modal ---
    const submissionModal = document.getElementById('submission-modal');
    const modalTaskTitle = document.getElementById('modal-task-title');
    const submissionForm = document.getElementById('submission-form');
    const fileInput = document.getElementById('file-input');
    const cancelSubmissionBtn = document.getElementById('cancel-submission-btn');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const fileInfoPreview = document.getElementById('file-info-preview');
    const acceptFileBtn = document.getElementById('accept-file-btn');
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

            // Ordenar: No entregadas primero, luego por fecha límite (ascendente)
            allActivities.sort((a, b) => {
                const deliveredA = !!a.entrega;
                const deliveredB = !!b.entrega;

                if (deliveredA !== deliveredB) {
                    return deliveredA ? 1 : -1; // false (no entregada) viene antes que true
                }

                return new Date(a.fechaLimite) - new Date(b.fechaLimite);
            });

            renderActivities(allActivities);

        } catch (error) {
            tasksList.innerHTML = `<p class="text-red-500">Error al cargar actividades: ${error.message}</p>`;
        }
    }

    function renderActivities(activities) {
        if (!activities || activities.length === 0) {
            tasksList.innerHTML = '<p class="text-gray-500">No hay actividades pendientes.</p>';
            return;
        }
        tasksList.innerHTML = activities.map(activity => {
            let feedbackHtml = '';
            let actionButtonHtml = '';

            if (activity.type === 'Tarea' || activity.type === 'Credito Extra') {
                if (activity.entrega) {
                    const status = activity.entrega.estado;
                    const statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' ? 'text-red-600' : 'text-yellow-600');
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                    feedbackHtml = `
                        <div class="mt-4 p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="small fw-bold text-secondary text-uppercase">Tu Entrega</span>
                                <button class="btn btn-outline-danger btn-sm border-0 delete-submission-btn" data-type="${activity.type}" data-entrega-id="${activity.entrega.entregaId}">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge ${status === 'Rechazada' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill px-3">
                                    ${displayStatus}
                                </span>
                                ${activity.entrega.calificacion ? `<span class="fw-bold text-dark fs-5 ms-auto">${activity.entrega.calificacion}/100</span>` : ''}
                            </div>
                            ${activity.entrega.comentario ? `<p class="small text-muted mb-0 italic mt-2 border-top pt-2">"${activity.entrega.comentario}"</p>` : ''}
                        </div>`;
                } else {
                    actionButtonHtml = `<button class="btn btn-ima-primary w-100 rounded-3 open-submission-modal"
                        data-task-id="${activity.tareaId}"
                        data-task-title="${activity.titulo}"
                        data-parcial="${activity.parcial || ''}"
                        data-asignatura="${activity.asignatura || ''}">
                            <i class="fa-solid fa-upload me-2"></i> Entregar Tarea
                        </button>`;
                }
            } else if (activity.type === 'Examen') {
                if (activity.entrega) {
                    const status = activity.entrega.estado;
                    const statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' ? 'text-red-600' : 'text-yellow-600');
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                    feedbackHtml = `
                        <div class="mt-4 p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="small fw-bold text-secondary text-uppercase">Resultado del Examen</span>
                                <button class="btn btn-outline-danger btn-sm border-0 delete-submission-btn" data-type="Examen" data-entrega-id="${activity.entrega.entregaId}">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge ${status === 'Rechazada' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill px-3">
                                    ${displayStatus}
                                </span>
                                ${activity.entrega.calificacion ? `<span class="fw-bold text-dark fs-5 ms-auto">${activity.entrega.calificacion}/100</span>` : ''}
                            </div>
                            ${activity.entrega.comentario ? `<p class="small text-muted mb-0 italic mt-2 border-top pt-2">"${activity.entrega.comentario}"</p>` : ''}
                        </div>`;
                } else {
                    const estado = activity.estado || 'Inactivo';
                    if (estado === 'Activo') {
                        actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="btn btn-purple w-100 rounded-3 text-white fw-bold" style="background-color: #8b5cf6;">
                            <i class="fa-solid fa-play me-2"></i> Iniciar Examen
                        </a>`;
                    } else {
                        actionButtonHtml = `<button class="btn btn-secondary w-100 rounded-3 cursor-not-allowed" disabled>${estado}</button>`;
                    }
                }
            }

            const isExamen = activity.type === 'Examen';
            const cardBorder = isExamen ? 'border-purple-200' : 'border-blue-200';
            const icon = isExamen ? 'fa-pen-to-square' : 'fa-file-lines';
            const iconColor = isExamen ? 'text-purple-500' : 'text-blue-500';

            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card-ima h-100 p-4 border-start border-4 ${cardBorder}">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="bg-light p-2 rounded-3">
                                <i class="fa-solid ${icon} ${iconColor} fs-4"></i>
                            </div>
                            <span class="badge bg-light text-secondary border fw-medium rounded-pill px-3">
                                <i class="fa-regular fa-calendar me-1"></i> ${formatDate(activity.fechaLimite)}
                            </span>
                        </div>

                        <h3 class="h5 fw-bold mb-1">${activity.titulo}</h3>
                        <p class="text-primary small fw-bold mb-3 text-uppercase" style="letter-spacing: 0.5px;">
                            ${activity.asignatura || 'Informática'}
                        </p>

                        <p class="text-muted small mb-4 text-truncate-2" style="height: 2.8rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${activity.descripcion || 'Sin descripción adicional disponible.'}
                        </p>

                        <div class="mt-auto pt-3 border-top">
                            ${actionButtonHtml}
                        </div>
                        ${feedbackHtml}
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
            if (e.target && e.target.classList.contains('open-submission-modal')) {
                const ds = e.target.dataset;
                openSubmissionModal(ds.taskId, ds.taskTitle, ds.parcial, ds.asignatura);
            }

            if (e.target && e.target.classList.contains('delete-submission-btn')) {
                const type = e.target.dataset.type;
                const entregaId = e.target.dataset.entregaId;

                if (confirm('Al eliminar tu entrega es posible que pierdas la calificar de tu tarea si ya fue revisada.')) {
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

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                filePreviewContainer.classList.add('hidden');
                return;
            }
            filePreviewContainer.classList.remove('hidden');
            if (file.type.startsWith('image/')) {
                imagePreview.classList.remove('hidden');
                fileInfoPreview.classList.add('hidden');
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.querySelector('img').src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.classList.add('hidden');
                fileInfoPreview.classList.remove('hidden');
                fileInfoPreview.textContent = `Archivo seleccionado: ${file.name}`;
            }
        });
    }

    if (acceptFileBtn) {
        acceptFileBtn.addEventListener('click', async () => {
            const file = fileInput.files[0];
            if (!file || activeUploads > 0) return;

            acceptFileBtn.disabled = true;
            acceptFileBtn.classList.add('btn-loading');

            const currentFile = file;
            const currentFileName = currentFile.name;

            const li = document.createElement('li');
            li.className = 'flex items-center justify-between text-sm text-gray-700 bg-white p-2 rounded border shadow-sm';
            li.innerHTML = `
                <div class="flex items-center space-x-2 truncate">
                    <svg class="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span class="truncate">${currentFileName}</span>
                </div>
                <span class="text-xs text-blue-500 font-medium">Subiendo...</span>
            `;
            uploadedFilesList.appendChild(li);
            uploadedFilesContainer.classList.remove('hidden');

            filePreviewContainer.classList.add('hidden');
            fileInput.value = '';

            activeUploads++;
            updateConfirmButtonState();

            const reader = new FileReader();
            reader.onloadend = async () => {
                const fileData = reader.result;
                const payload = {
                    userId: currentUser.userId,
                    tareaId: currentTaskId,
                    fileName: currentFileName,
                    fileData: fileData,
                    parcial: currentTaskParcial,
                    asignatura: currentTaskAsignatura
                };

                try {
                    const result = await fetchApi('TASK', 'uploadFile', payload);

                    acceptFileBtn.disabled = false;
                    acceptFileBtn.classList.remove('btn-loading');

                    if (result.status === 'success') {
                        const uploadedData = result.data;
                        uploadedFiles.push({
                            fileId: uploadedData.fileId,
                            fileName: currentFileName,
                            mimeType: uploadedData.mimeType
                        });
                        currentFolderId = uploadedData.folderId;

                        li.innerHTML = `
                            <div class="flex items-center space-x-2 truncate">
                                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                <span class="truncate">${currentFileName}</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <span class="text-xs text-green-600 font-medium">Listo</span>
                                <button type="button" class="text-red-500 hover:text-red-700 remove-file-btn" data-file-id="${uploadedData.fileId}">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        `;
                    } else {
                        li.innerHTML = `
                            <div class="flex items-center space-x-2 truncate">
                                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                <span class="truncate text-red-600">${currentFileName}</span>
                            </div>
                            <span class="text-xs text-red-600 font-medium">Error</span>
                        `;
                        alert('Error al subir ' + currentFileName + ': ' + result.message);
                    }
                } catch (error) {
                    acceptFileBtn.disabled = false;
                    acceptFileBtn.classList.remove('btn-loading');
                    li.innerHTML = `<span class="text-red-600">Error: ${currentFileName}</span>`;
                    alert('Error de conexión al subir ' + currentFileName + ': ' + error.message);
                } finally {
                    activeUploads--;
                    updateConfirmButtonState();
                }
            };
            reader.readAsDataURL(currentFile);
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

    fetchAllActivities();
});
