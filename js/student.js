document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    if (document.getElementById('student-name')) {
        document.getElementById('student-name').textContent = currentUser.nombre;
    }
    const tasksList = document.getElementById('tasks-list');

    // --- Elementos del Modal ---
    const submissionModal = document.getElementById('submission-modal');
    let submissionModalInstance = null;
    if (submissionModal) {
        submissionModalInstance = new bootstrap.Modal(submissionModal);
    }

    const modalTaskTitle = document.getElementById('modal-task-title');
    const submissionForm = document.getElementById('submission-form');
    const fileInput = document.getElementById('file-input');
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
        tasksList.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Cargando actividades...</p>
            </div>`;
        try {
            const payload = { userId: currentUser.userId, grado: currentUser.grado, seccion: currentUser.seccion };

            const [tasksResult, examsResult] = await Promise.all([
                fetchApi('TASK', 'getStudentTasks', payload),
                fetchApi('EXAM', 'getStudentExams', payload)
            ]);

            const allActivities = [];
            if (tasksResult.status === 'success' && tasksResult.data) {
                allActivities.push(...tasksResult.data.map(task => ({ ...task, type: task.tipo || 'Tarea' })));
            }
            if (examsResult.status === 'success' && examsResult.data) {
                allActivities.push(...examsResult.data.map(exam => ({ ...exam, type: 'Examen' })));
            }

            allActivities.sort((a, b) => {
                const deliveredA = !!a.entrega;
                const deliveredB = !!b.entrega;
                if (deliveredA !== deliveredB) return deliveredA ? 1 : -1;
                return new Date(a.fechaLimite) - new Date(b.fechaLimite);
            });

            renderActivities(allActivities);
        } catch (error) {
            tasksList.innerHTML = `<div class="col-12 alert alert-danger">Error al cargar actividades: ${error.message}</div>`;
        }
    }

    function renderActivities(activities) {
        if (!activities || activities.length === 0) {
            tasksList.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No hay actividades pendientes.</p></div>';
            return;
        }
        tasksList.innerHTML = activities.map(activity => {
            let feedbackHtml = '';
            let actionButtonHtml = '';

            if (activity.type === 'Tarea' || activity.type === 'Credito Extra') {
                if (activity.entrega) {
                    const status = activity.entrega.estado;
                    const statusBadge = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'bg-success' : (status === 'Rechazada' ? 'bg-danger' : 'bg-warning text-dark');
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                    feedbackHtml = `
                        <div class="mt-3 p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge ${statusBadge}">${displayStatus}</span>
                                <button class="btn btn-sm btn-outline-danger delete-submission-btn" data-type="${activity.type}" data-entrega-id="${activity.entrega.entregaId}">
                                    <i class="fas fa-trash-alt me-1"></i> Eliminar
                                </button>
                            </div>
                            ${activity.entrega.calificacion ? `<p class="mb-1 small"><strong>Nota:</strong> ${activity.entrega.calificacion}/100</p>` : ''}
                            ${activity.entrega.comentario ? `<p class="mb-0 small text-muted italic">"${activity.entrega.comentario}"</p>` : ''}
                        </div>`;
                } else {
                    actionButtonHtml = `<button class="btn btn-ima-primary w-100 open-submission-modal"
                        data-task-id="${activity.tareaId}"
                        data-task-title="${activity.titulo}"
                        data-parcial="${activity.parcial || ''}"
                        data-asignatura="${activity.asignatura || ''}">
                        <i class="fas fa-upload me-2"></i> Entregar Tarea
                    </button>`;
                }
            } else if (activity.type === 'Examen') {
                if (activity.entrega) {
                    const status = activity.entrega.estado;
                    const statusBadge = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'bg-success' : (status === 'Rechazada' ? 'bg-danger' : 'bg-warning text-dark');
                    feedbackHtml = `
                        <div class="mt-3 p-3 bg-light rounded-3 border text-center">
                            <span class="badge ${statusBadge} mb-2">${status === 'Revisada' ? 'Completada' : status}</span>
                            <p class="small mb-0">Calificación: <strong>${activity.entrega.calificacion || 'Pendiente'}</strong></p>
                            <button class="btn btn-link btn-sm text-danger mt-2 delete-submission-btn" data-type="Examen" data-entrega-id="${activity.entrega.entregaId}">Eliminar</button>
                        </div>`;
                } else {
                    const estado = activity.estado || 'Inactivo';
                    if (estado === 'Activo') {
                        actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="btn btn-primary w-100 bg-purple-600 border-0 shadow-sm">
                            <i class="fas fa-edit me-2"></i> Realizar Examen
                        </a>`;
                    } else {
                        actionButtonHtml = `<button class="btn btn-secondary w-100" disabled>${estado}</button>`;
                    }
                }
            }

            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card-ima h-100 p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">${activity.type}</span>
                            <small class="text-muted fw-bold"><i class="far fa-calendar-alt me-1"></i> ${formatDate(activity.fechaLimite)}</small>
                        </div>
                        <h5 class="fw-bold mb-1">${activity.titulo}</h5>
                        <p class="text-primary small mb-3"><strong>${activity.asignatura || 'General'}</strong></p>
                        <p class="text-muted small flex-grow-1">${activity.descripcion || 'Sin descripción adicional.'}</p>
                        <div class="mt-3">
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

        if (submissionModalInstance) submissionModalInstance.show();
    }

    function closeSubmissionModal() {
        if (activeUploads > 0) {
            if (!confirm('Hay una subida en progreso. ¿Deseas cerrar el modal?')) return;
        }
        if (submissionModalInstance) submissionModalInstance.hide();
        submissionForm.reset();
    }

    function updateConfirmButtonState() {
        if (!confirmSubmissionBtn) return;
        confirmSubmissionBtn.disabled = !(uploadedFiles.length > 0 && activeUploads === 0);
    }

    if (tasksList) {
        tasksList.addEventListener('click', async (e) => {
            const target = e.target.closest('.open-submission-modal') || e.target;
            if (target.classList.contains('open-submission-modal')) {
                const ds = target.dataset;
                openSubmissionModal(ds.taskId, ds.taskTitle, ds.parcial, ds.asignatura);
            }

            if (target.classList.contains('delete-submission-btn') || target.closest('.delete-submission-btn')) {
                const btn = target.closest('.delete-submission-btn');
                const { type, entregaId } = btn.dataset;

                if (confirm('Al eliminar tu entrega es posible que pierdas la calificar de tu tarea si ya fue revisada.')) {
                    btn.disabled = true;
                    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                    try {
                        const service = type === 'Examen' ? 'EXAM' : 'TASK';
                        const action = type === 'Examen' ? 'deleteExamSubmission' : 'deleteSubmission';
                        const result = await fetchApi(service, action, { entregaId });
                        if (result.status === 'success') {
                            fetchAllActivities();
                        } else throw new Error(result.message);
                    } catch (error) {
                        alert('Error: ' + error.message);
                        btn.disabled = false;
                        btn.textContent = 'Eliminar';
                    }
                }
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) { filePreviewContainer.classList.add('hidden'); return; }
            filePreviewContainer.classList.remove('hidden');
            if (file.type.startsWith('image/')) {
                imagePreview.classList.remove('hidden');
                fileInfoPreview.classList.add('hidden');
                const reader = new FileReader();
                reader.onload = (e) => imagePreview.querySelector('img').src = e.target.result;
                reader.readAsDataURL(file);
            } else {
                imagePreview.classList.add('hidden');
                fileInfoPreview.classList.remove('hidden');
                fileInfoPreview.textContent = file.name;
            }
        });
    }

    if (acceptFileBtn) {
        acceptFileBtn.addEventListener('click', async () => {
            const file = fileInput.files[0];
            if (!file || activeUploads > 0) return;

            acceptFileBtn.disabled = true;
            acceptFileBtn.classList.add('btn-loading');

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center small';
            li.innerHTML = `<span class="text-truncate" style="max-width: 150px;">${file.name}</span><span class="badge bg-info">Subiendo...</span>`;
            uploadedFilesList.appendChild(li);
            uploadedFilesContainer.classList.remove('hidden');
            filePreviewContainer.classList.add('hidden');
            fileInput.value = '';

            activeUploads++;
            updateConfirmButtonState();

            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const result = await fetchApi('TASK', 'uploadFile', {
                        userId: currentUser.userId, tareaId: currentTaskId,
                        fileName: file.name, fileData: reader.result,
                        parcial: currentTaskParcial, asignatura: currentTaskAsignatura
                    });
                    if (result.status === 'success') {
                        uploadedFiles.push({ fileId: result.data.fileId, fileName: file.name, mimeType: result.data.mimeType });
                        currentFolderId = result.data.folderId;
                        li.innerHTML = `
                            <span class="text-truncate" style="max-width: 150px;"><i class="fas fa-check-circle text-success me-1"></i> ${file.name}</span>
                            <button type="button" class="btn btn-sm btn-link text-danger remove-file-btn" data-file-id="${result.data.fileId}"><i class="fas fa-times"></i></button>`;
                    } else throw new Error(result.message);
                } catch (error) {
                    li.innerHTML = `<span class="text-danger">Error: ${file.name}</span>`;
                    alert('Error: ' + error.message);
                } finally {
                    activeUploads--;
                    acceptFileBtn.disabled = false;
                    acceptFileBtn.classList.remove('btn-loading');
                    updateConfirmButtonState();
                }
            };
            reader.readAsDataURL(file);
        });
    }

    if (uploadedFilesList) {
        uploadedFilesList.addEventListener('click', async (e) => {
            const btn = e.target.closest('.remove-file-btn');
            if (!btn) return;
            const fileId = btn.dataset.fileId;
            const li = btn.closest('li');
            li.style.opacity = '0.5';
            try { await fetchApi('TASK', 'deleteFile', { fileId }); } catch (e) {}
            uploadedFiles = uploadedFiles.filter(f => f.fileId !== fileId);
            li.remove();
            if (uploadedFiles.length === 0) uploadedFilesContainer.classList.add('hidden');
            updateConfirmButtonState();
        });
    }

    if (submissionForm) {
        submissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (uploadedFiles.length === 0 || activeUploads > 0) return;
            confirmSubmissionBtn.disabled = true;
            confirmSubmissionBtn.classList.add('btn-loading');
            try {
                const res = await fetchApi('TASK', 'submitAssignment', {
                    userId: currentUser.userId, tareaId: currentTaskId,
                    fileId: uploadedFiles.length > 1 ? currentFolderId : uploadedFiles[0].fileId,
                    mimeType: uploadedFiles.length > 1 ? 'folder' : uploadedFiles[0].mimeType
                });
                if (res.status === 'success') {
                    alert('¡Tarea entregada!');
                    closeSubmissionModal();
                    fetchAllActivities();
                } else throw new Error(res.message);
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                confirmSubmissionBtn.disabled = false;
                confirmSubmissionBtn.classList.remove('btn-loading');
                updateConfirmButtonState();
            }
        });
    }

    fetchAllActivities();
});
