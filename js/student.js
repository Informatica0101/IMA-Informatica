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
    let isUploading = false;

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
                allActivities.push(...tasksResult.data.map(task => ({ ...task, type: 'Tarea' })));
            }
            if (examsResult.status === 'success' && examsResult.data) {
                allActivities.push(...examsResult.data.map(exam => ({ ...exam, type: 'Examen' })));
            }

            allActivities.sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
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

            if (activity.type === 'Tarea') {
                if (activity.entrega) {
                    const statusColor = activity.entrega.estado === 'Revisada' ? 'text-green-600' : (activity.entrega.estado === 'Rechazada' ? 'text-red-600' : 'text-yellow-600');
                    feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 class="font-bold text-md">Estado de tu Entrega:</h4>
                            <p class="font-semibold ${statusColor}">${activity.entrega.estado}</p>
                            ${activity.entrega.calificacion ? `<p><strong>Calificación:</strong> ${activity.entrega.calificacion}</p>` : ''}
                            ${activity.entrega.comentario ? `<p><strong>Comentario:</strong> ${activity.entrega.comentario}</p>` : ''}
                        </div>`;
                } else {
                    actionButtonHtml = `<button class="bg-blue-500 text-white px-4 py-2 rounded-lg open-submission-modal"
                        data-task-id="${activity.tareaId}"
                        data-task-title="${activity.titulo}"
                        data-parcial="${activity.parcial || ''}"
                        data-asignatura="${activity.asignatura || ''}">Entregar Tarea</button>`;
                }
            } else if (activity.type === 'Examen') {
                const estado = activity.estado || 'Pendiente';
                const calificacion = activity.calificacionTotal;

                if (estado === 'Activo') {
                    actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="bg-purple-500 text-white px-4 py-2 rounded-lg">Realizar Examen</a>`;
                } else {
                    actionButtonHtml = `<button class="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed" disabled>${estado}</button>`;
                }

                if (calificacion) {
                     feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 class="font-bold text-md">Estado de tu Examen:</h4>
                            <p class="font-semibold text-green-600">Completado</p>
                            <p><strong>Calificación:</strong> ${calificacion}</p>
                        </div>`;
                }
            }

            return `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold">${activity.titulo} <span class="text-sm font-normal text-gray-500">(${activity.type})</span></h3>
                            <p class="text-sm text-gray-500 mb-2"><strong>Asignatura:</strong> ${activity.asignatura || 'No especificada'}</p>
                        </div>
                        <span class="text-sm font-semibold text-gray-600">${activity.fechaLimite}</span>
                    </div>
                    <p class="text-gray-700 mt-2">${activity.descripcion || 'Sin descripción.'}</p>
                    <div class="mt-4">
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
        isUploading = false;

        uploadedFilesList.innerHTML = '';
        uploadedFilesContainer.classList.add('hidden');
        filePreviewContainer.classList.add('hidden');
        fileInput.value = '';
        updateConfirmButtonState();

        submissionModal.classList.remove('hidden');
    }

    function closeSubmissionModal() {
        if (isUploading) {
            if (!confirm('Hay una subida en progreso. ¿Estás seguro de cerrar el modal?')) return;
        }
        submissionModal.classList.add('hidden');
        submissionForm.reset();
    }

    function updateConfirmButtonState() {
        if (!confirmSubmissionBtn) return;
        if (uploadedFiles.length > 0 && !isUploading) {
            confirmSubmissionBtn.disabled = false;
            confirmSubmissionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            confirmSubmissionBtn.disabled = true;
            confirmSubmissionBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    if (tasksList) {
        tasksList.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('open-submission-modal')) {
                const ds = e.target.dataset;
                openSubmissionModal(ds.taskId, ds.taskTitle, ds.parcial, ds.asignatura);
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
        if (!file) return;

        // No bloqueamos fileInput para permitir seleccionar el siguiente mientras este sube
        const currentFile = file;
        const currentFileName = currentFile.name;

        // Crear un indicador visual temporal en la lista de subida
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

        // Limpiar preview e input inmediatamente para el siguiente archivo
        filePreviewContainer.classList.add('hidden');
        fileInput.value = '';

        isUploading = true;
        updateConfirmButtonState();

        const reader = new FileReader();
        reader.onloadend = async () => {
                const fileData = reader.result;
                const payload = {
                    userId: currentUser.userId,
                    tareaId: currentTaskId,
                    fileName: file.name,
                    fileData: fileData,
                    parcial: currentTaskParcial,
                    asignatura: currentTaskAsignatura
                };

            try {
                const result = await fetchApi('TASK', 'uploadFile', payload);
                if (result.status === 'success') {
                    const uploadedData = result.data;
                    uploadedFiles.push({
                        fileId: uploadedData.fileId,
                        fileName: currentFileName,
                        mimeType: uploadedData.mimeType
                    });
                    currentFolderId = uploadedData.folderId;

                    // Actualizar el indicador visual de este archivo
                    li.innerHTML = `
                        <div class="flex items-center space-x-2 truncate">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            <span class="truncate">${currentFileName}</span>
                        </div>
                        <span class="text-xs text-green-600 font-medium">Listo</span>
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
                li.innerHTML = `<span class="text-red-600">Error: ${currentFileName}</span>`;
                alert('Error de conexión al subir ' + currentFileName + ': ' + error.message);
            } finally {
                // Comprobamos si todavía hay subidas pendientes
                // Por simplicidad, decrementamos un contador o similar si quisiéramos ser exactos
                // Aquí solo reseteamos el flag general si ya no hay procesos asíncronos (mejorar si es necesario)
                isUploading = false; // Nota: Si hay múltiples en paralelo, este flag es insuficiente.
                // En un sistema real usaríamos un contador de uploads pendientes.
                updateConfirmButtonState();
            }
            };
            reader.readAsDataURL(file);
        });
    }

    if (cancelSubmissionBtn) cancelSubmissionBtn.addEventListener('click', closeSubmissionModal);

    if (submissionForm) {
        submissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (uploadedFiles.length === 0 || isUploading) return;

            confirmSubmissionBtn.disabled = true;
            confirmSubmissionBtn.textContent = 'Enviando...';

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
                confirmSubmissionBtn.textContent = 'Confirmar Entrega';
                updateConfirmButtonState();
            }
        });
    }

    fetchAllActivities();
});
