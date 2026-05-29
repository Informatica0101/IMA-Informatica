document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.rol !== 'Estudiante' && currentUser.rol !== 'Alumno')) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('student-name').textContent = currentUser.nombre;
    const tasksList = document.getElementById('tasks-list');
    const logoutButton = document.getElementById('logout-button');

    const PARCIAL_ORDER = {
        "Cuarto Parcial": 4,
        "Tercer Parcial": 3,
        "Segundo Parcial": 2,
        "Primer Parcial": 1
    };
    let allActivitiesData = [];

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
                    const activeClass = isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200';
                    return `<button class="flex-none px-4 py-2 rounded-xl font-bold transition-all text-sm ${activeClass} parcial-tab" data-parcial="${p}">${p}</button>`;
                }).join('')}
            </div>
        `;

        // Interactividad
        tabsContainer.querySelectorAll('.parcial-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabsContainer.querySelectorAll('.parcial-tab').forEach(b => {
                    b.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
                    b.classList.add('bg-white', 'text-gray-700', 'hover:bg-blue-50', 'border', 'border-gray-200');
                });
                e.target.classList.remove('bg-white', 'text-gray-700', 'hover:bg-blue-50', 'border', 'border-gray-200');
                e.target.classList.add('bg-blue-600', 'text-white', 'shadow-md');

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
                    const isPending = (status === 'Pendiente' || !status);
                    const statusColor = (status === 'Completada' || status === 'Revisada' || status === 'Finalizado') ? 'text-green-600' : (status === 'Rechazada' ? 'text-red-600' : (status === 'Tarea incompleta' ? 'text-pink-500' : 'text-yellow-600'));
                    const displayStatus = (status === 'Revisada' || status === 'Finalizado' ? 'Completada' : status);

                    let fileLinkHtml = '';
                    if (isPending && activity.entrega.fileId) {
                        const fileId = activity.entrega.fileId;
                        const url = activity.entrega.mimeType === 'folder'
                            ? `https://drive.google.com/drive/folders/${fileId}`
                            : `https://drive.google.com/uc?id=${fileId}`;
                        fileLinkHtml = `<div class="mt-2"><a href="${url}" target="_blank" class="text-blue-600 font-bold hover:underline text-sm flex items-center space-x-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg><span>Ver mi entrega</span></a></div>`;
                    }

                    const deleteBtnHtml = (isPending || status === 'Tarea incompleta')
                        ? `<button class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors delete-submission-btn" data-type="${activity.type}" data-entrega-id="${activity.entrega.entregaId}">${status === 'Tarea incompleta' ? 'Re-intentar Entrega' : 'Eliminar Entrega'}</button>`
                        : '';

                    feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-md">Estado de tu Entrega:</h4>
                                    <p class="font-semibold ${statusColor}">${displayStatus}</p>
                                    ${fileLinkHtml}
                                </div>
                                ${deleteBtnHtml}
                            </div>
                            ${activity.entrega.calificacion ? `<p><strong>Calificación:</strong> ${activity.entrega.calificacion}</p>` : ''}
                            ${activity.entrega.comentario ? `<p><strong>Comentario:</strong> ${activity.entrega.comentario}</p>` : ''}
                        </div>`;

                    if (status === 'Tarea incompleta') {
                         actionButtonHtml = `<button class="bg-pink-500 text-white px-4 py-2 rounded-lg open-submission-modal mt-4"
                            data-task-id="${activity.tareaId}"
                            data-task-title="${activity.titulo} (Complemento)"
                            data-parcial="${activity.parcial || ''}"
                            data-asignatura="${activity.asignatura || ''}">Completar Tarea</button>`;
                    }
                } else {
                    actionButtonHtml = `<button class="bg-blue-500 text-white px-4 py-2 rounded-lg open-submission-modal"
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
                        ? `<button class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors delete-submission-btn" data-type="Examen" data-entrega-id="${activity.entrega.entregaId}">Eliminar Entrega</button>`
                        : '';

                    feedbackHtml = `
                        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-md">Estado de tu Examen:</h4>
                                    <p class="font-semibold ${statusColor}">${displayStatus}</p>
                                </div>
                                ${deleteBtnHtml}
                            </div>
                            ${activity.entrega.calificacion ? `<p><strong>Calificación:</strong> ${activity.entrega.calificacion}</p>` : ''}
                            ${activity.entrega.comentario ? `<p><strong>Comentario:</strong> ${activity.entrega.comentario}</p>` : ''}
                        </div>`;
                } else {
                    const estado = activity.estado || 'Inactivo';
                    if (estado === 'Activo') {
                        actionButtonHtml = `<a href="exam.html?examenId=${activity.examenId}" class="bg-purple-500 text-white px-4 py-2 rounded-lg">Realizar Examen</a>`;
                    } else {
                        actionButtonHtml = `<button class="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed" disabled>${estado}</button>`;
                    }
                }
            }

            return `
                <div class="dashboard-card assignment-card cursor-pointer group" data-task-id="${activity.tareaId || activity.examenId}">
                    <div class="flex justify-between items-start">
                        <div class="flex-grow">
                            <h3 class="text-lg font-bold group-hover:text-blue-600 transition-colors">${activity.titulo} <span class="text-xs font-normal text-gray-500">(${activity.type})</span></h3>
                            <p class="text-sm text-gray-500 mb-2"><strong>Asignatura:</strong> ${activity.asignatura || 'No especificada'}</p>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-sm font-semibold text-gray-600">${formatDate(activity.fechaLimite)}</span>
                            <svg class="w-5 h-5 text-gray-400 transform group-[.is-expanded]:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <div class="assignment-content overflow-hidden max-h-0 transition-all duration-500 ease-in-out group-[.is-expanded]:max-h-[1000px]">
                        <div class="pt-4 border-t border-gray-100 mt-2">
                            <p class="text-gray-700 font-medium mb-4">${activity.descripcion || 'Sin descripción.'}</p>
                            <div class="mt-4">
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

    // --- WhatsApp Group Logic ---
    async function setupWhatsAppButton() {
        const container = document.getElementById('whatsapp-group-container');
        if (!container || !currentUser.grado) return;

        try {
            const res = await fetchApi('TASK', 'getWhatsAppGroups');
            if (res.status === 'success' && res.data) {
                const group = res.data.find(g => String(g.grado).toLowerCase().includes(String(currentUser.grado).toLowerCase()));
                if (group && group.enlaceGrupo) {
                    container.innerHTML = `
                        <a href="${group.enlaceGrupo}" target="_blank" class="flex items-center space-x-3 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.438-9.889 9.886 0 2.225.587 3.841 1.578 5.49l-.903 3.303 3.393-.89zm11.375-7.679c-.161-.268-.589-.428-1.232-.75-.643-.321-3.793-1.872-4.382-2.086-.589-.214-1.018-.321-1.446.321-.428.643-1.661 2.089-2.036 2.518-.375.429-.75.482-1.393.161-.643-.321-2.712-1.001-5.166-3.192-1.91-1.704-3.199-3.808-3.573-4.451-.375-.643-.041-.991.28-1.31.289-.287.643-.75.964-1.125.321-.375.429-.643.643-1.071.214-.428.107-.803-.054-1.125-.161-.321-1.446-3.482-1.982-4.768-.522-1.253-1.054-1.081-1.446-1.101-.375-.02-1.101-.023-1.101-.023s-.75 0-1.125.428c-.375.429-1.446 1.411-1.446 3.442s2.089 3.991 2.303 4.286c.214.295 4.114 6.279 9.957 8.796 1.39.599 2.474.957 3.319 1.224 1.398.444 2.671.381 3.677.23 1.12-.168 3.793-1.554 4.329-3.054.536-1.5 0-2.839-.161-3.107z"/></svg>
                            <span>Grupo de WhatsApp</span>
                        </a>
                    `;
                } else {
                    container.innerHTML = `<span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">Grupo no disponible actualmente</span>`;
                }
            }
        } catch (err) {
            console.error("Error al obtener grupos de WhatsApp:", err);
        }
    }

    // --- High-Fidelity Sequential Multi-Uploader ---
    async function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max = 1200;
                    if (width > height) {
                        if (width > max) { height *= max / width; width = max; }
                    } else {
                        if (height > max) { width *= max / height; height = max; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            filePreviewContainer.classList.remove('hidden');

            // Procesar secuencialmente
            for (const file of files) {
                await processSingleFile(file);
            }
            fileInput.value = ''; // Limpiar input para permitir re-selección
            filePreviewContainer.classList.add('hidden');
        });
    }

    async function processSingleFile(file) {
        if (file.size > 50 * 1024 * 1024) {
            alert(`El archivo ${file.name} excede el límite de 50MB.`);
            return;
        }

        // Filtro Anti-Duplicados (A-33)
        const isDuplicate = uploadedFiles.some(f => f.fileName === file.name && f.fileSize === file.size);
        if (isDuplicate) {
            console.log(`Archivo duplicado ignorado: ${file.name}`);
            return;
        }

        activeUploads++;
        updateConfirmButtonState();

        const li = document.createElement('li');
        li.className = 'flex items-center justify-between text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up';

        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

        li.innerHTML = `
            <div class="flex items-center space-x-3 truncate flex-grow">
                ${previewUrl ? `<img src="${previewUrl}" class="w-10 h-10 rounded-lg object-cover">` : `<div class="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-lg"><span class="text-[10px] font-bold text-blue-600">${file.name.split('.').pop().toUpperCase()}</span></div>`}
                <div class="truncate">
                    <p class="font-bold truncate text-gray-800">${file.name}</p>
                    <div class="flex items-center space-x-2">
                        <div class="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div class="progress-bar h-full bg-blue-500 w-0 transition-all duration-300"></div>
                        </div>
                        <span class="status-text text-[10px] text-blue-500 font-bold uppercase">Subiendo</span>
                    </div>
                </div>
            </div>
        `;
        uploadedFilesList.appendChild(li);
        uploadedFilesContainer.classList.remove('hidden');

        const progressBar = li.querySelector('.progress-bar');
        const statusText = li.querySelector('.status-text');

        try {
            let fileData;
            if (file.type.startsWith('image/')) {
                fileData = await compressImage(file);
                progressBar.style.width = '30%';
            } else {
                fileData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
                progressBar.style.width = '20%';
            }

            const payload = {
                userId: currentUser.userId,
                tareaId: currentTaskId,
                fileName: file.name,
                fileData: fileData,
                parcial: currentTaskParcial,
                asignatura: currentTaskAsignatura
            };

            const result = await fetchApi('TASK', 'uploadFile', payload);
            if (result.status === 'success') {
                progressBar.style.width = '100%';
                progressBar.classList.replace('bg-blue-500', 'bg-green-500');
                statusText.textContent = 'Completado';
                statusText.classList.replace('text-blue-500', 'text-green-500');

                const uploadedData = result.data;
                uploadedFiles.push({
                    fileId: uploadedData.fileId,
                    fileName: file.name,
                        fileSize: file.size,
                    mimeType: uploadedData.mimeType
                });
                currentFolderId = uploadedData.folderId;

                li.innerHTML += `
                    <button type="button" class="ml-4 text-gray-400 hover:text-red-500 transition-colors remove-file-btn p-1" data-file-id="${uploadedData.fileId}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                `;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            progressBar.classList.replace('bg-blue-500', 'bg-red-500');
            statusText.textContent = 'Error';
            statusText.classList.replace('text-blue-500', 'text-red-500');
            alert(`Error en ${file.name}: ${error.message}`);
        } finally {
            activeUploads--;
            updateConfirmButtonState();
        }
    }

    fetchAllActivities();
    setupWhatsAppButton();
});
