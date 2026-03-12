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
            tasksList.innerHTML = '<div class="col-12 text-center py-5 text-muted">No hay actividades pendientes.</div>';
            return;
        }
        tasksList.innerHTML = activities.map(activity => {
            let feedbackHtml = '';
            let actionButtonHtml = '';

            if (activity.type === 'Tarea' || activity.type === 'Credito Extra') {
                if (activity.entrega) {
                    const status = activity.entrega.estado;
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);
                    const badgeClass = status === 'Rechazada' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success';

                    feedbackHtml = `
                        <div class="mt-4 p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="small fw-bold text-secondary text-uppercase">Tu Entrega</span>
                                <button class="btn btn-outline-danger btn-sm border-0 delete-submission-btn" data-type="${activity.type}" data-entrega-id="${activity.entrega.entregaId}">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge ${badgeClass} rounded-pill px-3">
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
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);
                    const badgeClass = status === 'Rechazada' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success';

                    feedbackHtml = `
                        <div class="mt-4 p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="small fw-bold text-secondary text-uppercase">Resultado del Examen</span>
                                <button class="btn btn-outline-danger btn-sm border-0 delete-submission-btn" data-type="Examen" data-entrega-id="${activity.entrega.entregaId}">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge ${badgeClass} rounded-pill px-3">
                                    ${displayStatus}
                                </span>
                                ${activity.entrega.calificacion ? `<span class="fw-bold text-dark fs-5 ms-auto">${activity.entrega.calificacion}/100</span>` : ''}
                            </div>
                            ${activity.entrega.comentario ? `<p class="small text-muted mb-0 italic mt-2 border-top pt-2">"${activity.entrega.comentario}"</p>` : ''}
                        </div>`;
                } else {
                    const estado = activity.estado || 'Inactivo';
                    if (estado === 'Activo') {
                        actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="btn w-100 rounded-3 text-white fw-bold shadow-sm" style="background-color: #8b5cf6;">
                            <i class="fa-solid fa-play me-2"></i> Iniciar Examen
                        </a>`;
                    } else {
                        actionButtonHtml = `<button class="btn btn-secondary w-100 rounded-3 cursor-not-allowed" disabled>${estado}</button>`;
                    }
                }
            }

            const isExamen = activity.type === 'Examen';
            const cardBorderColor = isExamen ? '#e9d5ff' : '#bfdbfe';
            const icon = isExamen ? 'fa-pen-to-square' : 'fa-file-lines';
            const iconColor = isExamen ? 'text-purple' : 'text-primary';

            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card-ima h-100 p-4 border-start border-4" style="border-left-color: ${cardBorderColor} !important;">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="bg-light p-2 rounded-3">
                                <i class="fa-solid ${icon} ${iconColor} fs-4"></i>
                            </div>
                            <span class="badge bg-light text-secondary border fw-medium rounded-pill px-3">
                                <i class="fa-regular fa-calendar me-1"></i> ${formatDate(activity.fechaLimite)}
                            </span>
                        </div>

                        <h3 class="h5 fw-bold mb-1">${activity.titulo}</h3>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <p class="text-primary small fw-bold mb-0 text-uppercase" style="letter-spacing: 0.5px;">
                                ${activity.asignatura || 'Informática'}
                            </p>
                            <span class="text-muted expansion-hint" style="font-size: 0.7rem;"><i class="fa-solid fa-maximize"></i></span>
                        </div>

                        <p class="text-muted small mb-4 text-truncate-2">
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

        if (window.showSubmissionModal) window.showSubmissionModal();
    }

    function closeSubmissionModal() {
        if (activeUploads > 0) {
            if (!confirm('Hay una subida en progreso. ¿Estás seguro de cerrar el modal?')) return;
        }
        if (window.hideSubmissionModal) window.hideSubmissionModal();
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
            const target = e.target;

            // Si el clic fue en un botón o enlace de acción, no procesar expansión
            const actionElement = target.closest('button, a');
            if (actionElement) {
                const openBtn = actionElement.closest('.open-submission-modal');
                if (openBtn) {
                    const ds = openBtn.dataset;
                    openSubmissionModal(ds.taskId, ds.taskTitle, ds.parcial, ds.asignatura);
                    return;
                }

                const deleteBtn = actionElement.closest('.delete-submission-btn');
                if (deleteBtn) {
                    const type = deleteBtn.dataset.type;
                    const entregaId = deleteBtn.dataset.entregaId;

                    if (confirm('Al eliminar tu entrega es posible que pierdas la calificar de tu tarea si ya fue revisada.')) {
                        deleteBtn.disabled = true;
                        const originalHtml = deleteBtn.innerHTML;
                        deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
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
                            deleteBtn.disabled = false;
                            deleteBtn.innerHTML = originalHtml;
                        }
                    }
                    return;
                }
                // Si es otro botón o link (como "Iniciar Examen"), dejar que el navegador lo maneje
                return;
            }

            // Expansión de carta (solo una a la vez)
            const card = target.closest('.card-ima');
            if (card) {
                const wasExpanded = card.classList.contains('is-expanded');

                // Colapsar todas las tarjetas de la lista
                const allCards = tasksList.querySelectorAll('.card-ima');
                allCards.forEach(c => {
                    if (c !== card) c.classList.remove('is-expanded');
                });

                // Toggle para la tarjeta actual
                card.classList.toggle('is-expanded', !wasExpanded);
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
            li.className = 'list-group-item d-flex align-items-center justify-content-between py-2 px-3 bg-white border-0 shadow-sm mb-2 rounded-3';
            li.innerHTML = `
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span class="text-truncate small fw-medium">${currentFileName}</span>
                </div>
                <span class="badge bg-primary-subtle text-primary rounded-pill px-2" style="font-size: 0.65rem;">SUBIENDO...</span>
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
                            <div class="d-flex align-items-center gap-2 overflow-hidden">
                                <i class="fa-solid fa-check text-success fs-6"></i>
                                <span class="text-truncate small fw-medium">${currentFileName}</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-success-subtle text-success rounded-pill px-2" style="font-size: 0.65rem;">LISTO</span>
                                <button type="button" class="btn btn-link text-danger p-0 border-0 remove-file-btn" data-file-id="${uploadedData.fileId}">
                                    <i class="fa-solid fa-xmark fs-6"></i>
                                </button>
                            </div>
                        `;
                    } else {
                        li.innerHTML = `
                            <div class="d-flex align-items-center gap-2 overflow-hidden text-danger">
                                <i class="fa-solid fa-circle-exclamation fs-6"></i>
                                <span class="text-truncate small fw-medium">${currentFileName}</span>
                            </div>
                            <span class="badge bg-danger-subtle text-danger rounded-pill px-2" style="font-size: 0.65rem;">ERROR</span>
                        `;
                        alert('Error al subir ' + currentFileName + ': ' + result.message);
                    }
                } catch (error) {
                    acceptFileBtn.disabled = false;
                    acceptFileBtn.classList.remove('btn-loading');
                    li.innerHTML = `
                        <div class="d-flex align-items-center gap-2 text-danger">
                            <i class="fa-solid fa-wifi-slash fs-6"></i>
                            <span class="small fw-bold">Error de conexión: ${currentFileName}</span>
                        </div>`;
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
