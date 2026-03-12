document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre;
    if (document.getElementById('student-grado-display')) {
        document.getElementById('student-grado-display').textContent = currentUser.grado || 'N/A';
    }
    if (document.getElementById('student-seccion-display')) {
        document.getElementById('student-seccion-display').textContent = currentUser.seccion || 'N/A';
    }
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
            tasksList.innerHTML = `
                <div class="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                    <p class="text-gray-400 font-medium italic">No se encontraron actividades registradas.</p>
                </div>`;
            return;
        }

        tasksList.innerHTML = activities.map(activity => {
            let feedbackHtml = '';
            let actionButtonHtml = '';
            let statusBadgeHtml = '';

            if (activity.entrega) {
                const status = activity.entrega.estado;
                let badgeClass = 'badge-info';
                if (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') badgeClass = 'badge-success';
                else if (status === 'Rechazada') badgeClass = 'badge-danger';
                else if (status === 'Pendiente') badgeClass = 'badge-warning';

                const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);
                statusBadgeHtml = `<span class="status-badge ${badgeClass}">${displayStatus}</span>`;

                feedbackHtml = `
                    <div class="mt-6 pt-6 border-t border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Resultado de Entrega</h4>
                            <button class="text-danger font-bold text-[10px] uppercase tracking-tighter hover:underline delete-submission-btn" data-type="${activity.type}" data-entrega-id="${activity.entrega.entregaId}">
                                ELIMINAR ENTREGA
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            ${activity.entrega.calificacion !== undefined ? `
                                <div class="bg-gray-50 p-3 rounded-lg">
                                    <span class="block text-[10px] font-bold text-gray-400 uppercase">Nota</span>
                                    <span class="text-lg font-black text-primary">${activity.entrega.calificacion}/100</span>
                                </div>
                            ` : ''}
                            <div class="bg-gray-50 p-3 rounded-lg ${activity.entrega.calificacion === undefined ? 'col-span-2' : ''}">
                                <span class="block text-[10px] font-bold text-gray-400 uppercase">Estado Final</span>
                                <span class="text-sm font-bold text-gray-700">${displayStatus}</span>
                            </div>
                        </div>
                        ${activity.entrega.comentario ? `
                            <div class="mt-4 p-3 bg-blue-50 border-l-4 border-primary rounded-r-lg">
                                <span class="block text-[10px] font-bold text-primary uppercase mb-1">Retroalimentación del Docente</span>
                                <p class="text-xs text-gray-700 leading-relaxed italic">"${activity.entrega.comentario}"</p>
                            </div>
                        ` : ''}
                    </div>`;
            } else {
                statusBadgeHtml = `<span class="status-badge badge-warning">Pendiente</span>`;

                if (activity.type === 'Examen') {
                    const estado = activity.estado || 'Inactivo';
                    if (estado === 'Activo') {
                        actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="btn-academic btn-primary w-full py-3 shadow-md">INICIAR EVALUACIÓN</a>`;
                    } else {
                        actionButtonHtml = `<button class="btn-academic btn-secondary w-full py-3 opacity-50 cursor-not-allowed" disabled>EVALUACIÓN NO DISPONIBLE</button>`;
                    }
                } else {
                    actionButtonHtml = `
                        <button class="btn-academic btn-primary w-full py-3 shadow-md open-submission-modal"
                            data-task-id="${activity.tareaId}"
                            data-task-title="${activity.titulo}"
                            data-parcial="${activity.parcial || ''}"
                            data-asignatura="${activity.asignatura || ''}">
                            REALIZAR ENTREGA
                        </button>`;
                }
            }

            return `
                <div class="card-academic flex flex-col h-full">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-[10px] font-black uppercase tracking-widest text-primary bg-primary-light px-2 py-1 rounded">
                            ${activity.type}
                        </span>
                        ${statusBadgeHtml}
                    </div>

                    <div class="flex-grow">
                        <h3 class="text-lg font-bold text-gray-800 leading-tight mb-1">${activity.titulo}</h3>
                        <div class="flex items-center text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-4">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            ${activity.asignatura || 'General'}
                        </div>
                        <p class="text-sm text-gray-600 line-clamp-3 mb-6">${activity.descripcion || 'No se proporcionaron detalles adicionales para esta asignación.'}</p>
                    </div>

                    <div class="mt-auto">
                        <div class="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
                            <div class="flex flex-col">
                                <span class="text-[9px] font-bold text-gray-400 uppercase">Fecha Límite</span>
                                <span class="text-xs font-bold text-gray-700">${formatDate(activity.fechaLimite)}</span>
                            </div>
                            <div class="text-right">
                                <span class="text-[9px] font-bold text-gray-400 uppercase">Valor</span>
                                <span class="text-xs font-bold text-primary">${activity.puntajeMaximo || 10} pts</span>
                            </div>
                        </div>
                        ${actionButtonHtml}
                    </div>
                    ${feedbackHtml}
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
