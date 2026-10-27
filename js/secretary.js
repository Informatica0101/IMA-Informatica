// ---------------------------------------------------------------------------
// [TAREA-F5-005] [Fase 5: Admisiones y Portal de Familias] - Consola Administrativa de Secretaría & Admisiones
// Proporciona la interfaz de consulta, filtrado avanzado, revisión de expedientes de aspirantes,
// máquina de estados de admisión y conversión atómica a estudiante matriculado en el Dashboard de Secretaría.
// ---------------------------------------------------------------------------

window.allAdmissionRequests = [];

window.loadAdmissionRequestsList = async function() {
    const tblBody = document.getElementById('tbl-admisiones-body');
    if (tblBody) {
        tblBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400 font-medium"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando solicitudes de admisión desde el servidor...</td></tr>`;
    }

    try {
        const res = await window.fetchApi('ACADEMIC', 'getAdmissionRequests', {});
        if (res && res.status === 'success' && Array.isArray(res.requests)) {
            window.allAdmissionRequests = res.requests;
            window.updateAdmissionMetricsCards(res.requests);
            window.filterAdmissionRequestsLocal();
        } else {
            if (tblBody) {
                tblBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500 font-medium">Error al recuperar solicitudes de admisión: ${((res && res.message) || 'Inconveniente del servidor.')}</td></tr>`;
            }
        }
    } catch (err) {
        if (tblBody) {
            tblBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500 font-medium">Error de conexión: ${err.message}</td></tr>`;
        }
    }
};

window.updateAdmissionMetricsCards = function(requests) {
    if (!Array.isArray(requests)) return;

    let recibidas = 0, revision = 0, evaluacion = 0, admitidas = 0, convertidas = 0;

    requests.forEach(r => {
        const st = r.estadoSolicitud || 'Recibida';
        if (st === 'Recibida') recibidas++;
        else if (st === 'En_Revision') revision++;
        else if (st === 'Evaluacion') evaluacion++;
        else if (st === 'Admitida') admitidas++;
        else if (st === 'Convertida') convertidas++;
    });

    const elRec = document.getElementById('metric-adm-recibidas');
    const elRev = document.getElementById('metric-adm-revision');
    const elEva = document.getElementById('metric-adm-evaluacion');
    const elAdm = document.getElementById('metric-adm-admitidas');
    const elCvt = document.getElementById('metric-adm-convertidas');

    if (elRec) elRec.textContent = recibidas;
    if (elRev) elRev.textContent = revision;
    if (elEva) elEva.textContent = evaluacion;
    if (elAdm) elAdm.textContent = admitidas;
    if (elCvt) elCvt.textContent = convertidas;
};

window.filterAdmissionRequestsLocal = function() {
    const tblBody = document.getElementById('tbl-admisiones-body');
    if (!tblBody) return;

    const filterAno = document.getElementById('filter-adm-ano')?.value || '';
    const filterGrado = document.getElementById('filter-adm-grado')?.value || '';
    const filterEstado = document.getElementById('filter-adm-estado')?.value || '';
    const filterSearch = (document.getElementById('filter-adm-search')?.value || '').trim().toLowerCase();

    let filtered = window.allAdmissionRequests || [];

    if (filterAno) filtered = filtered.filter(r => String(r.anolectivo).trim() === filterAno);
    if (filterGrado) filtered = filtered.filter(r => String(r.gradoSolicitado).trim() === filterGrado);
    if (filterEstado) filtered = filtered.filter(r => String(r.estadoSolicitud).trim() === filterEstado);

    if (filterSearch) {
        filtered = filtered.filter(r => {
            const nom = `${r.nombresAspirante || ''} ${r.apellidosAspirante || ''}`.toLowerCase();
            const ident = (r.identificacion || '').toLowerCase();
            const cod = (r.solicitudId || '').toLowerCase();
            const resp = (r.nombreResponsable || '').toLowerCase();
            return nom.includes(filterSearch) || ident.includes(filterSearch) || cod.includes(filterSearch) || resp.includes(filterSearch);
        });
    }

    if (filtered.length === 0) {
        tblBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400 font-medium">No se encontraron solicitudes de admisión con los filtros seleccionados.</td></tr>`;
        return;
    }

    tblBody.innerHTML = filtered.map(r => {
        let badgeColor = "bg-gray-100 text-gray-700";
        if (r.estadoSolicitud === 'En_Revision') badgeColor = "bg-amber-100 text-amber-800 border border-amber-200";
        if (r.estadoSolicitud === 'Evaluacion') badgeColor = "bg-blue-100 text-blue-800 border border-blue-200";
        if (r.estadoSolicitud === 'En_Espera') badgeColor = "bg-indigo-100 text-indigo-800 border border-indigo-200";
        if (r.estadoSolicitud === 'Admitida') badgeColor = "bg-green-100 text-green-800 border border-green-200";
        if (r.estadoSolicitud === 'Rechazada') badgeColor = "bg-red-100 text-red-800 border border-red-200";
        if (r.estadoSolicitud === 'Convertida') badgeColor = "bg-purple-100 text-purple-800 border border-purple-200";

        const fFecha = r.fechaSolicitud ? new Date(r.fechaSolicitud).toLocaleDateString('es-HN') : '-';

        return `
            <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="p-3">
                    <strong class="text-blue-600 block">${r.solicitudId}</strong>
                    <span class="text-[10px] text-gray-400">${fFecha}</span>
                </td>
                <td class="p-3">
                    <strong class="text-gray-900 block">${r.nombresAspirante} ${r.apellidosAspirante}</strong>
                    <span class="text-[10px] text-gray-500">DNI: ${r.identificacion || 'N/A'}</span>
                </td>
                <td class="p-3 font-semibold text-gray-700">
                    ${r.gradoSolicitado}
                    <span class="block text-[10px] text-gray-400">${r.anolectivo}</span>
                </td>
                <td class="p-3">
                    <span class="text-gray-800 font-medium block">${r.nombreResponsable || '-'}</span>
                    <span class="text-[10px] text-gray-500">${r.telefonoContacto || ''} | ${r.emailContacto || ''}</span>
                </td>
                <td class="p-3">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}">${r.estadoSolicitud || 'Recibida'}</span>
                </td>
                <td class="p-3 text-right space-x-1">
                    <button onclick="window.openAdmissionDetailModal('${r.solicitudId}')" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all">
                        <i class="fa-solid fa-eye"></i> Detalle
                    </button>
                    ${r.estadoSolicitud === 'Admitida' ? `
                        <button onclick="window.convertAdmissionToStudentAction('${r.solicitudId}')" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-sm">
                            <i class="fa-solid fa-user-check"></i> Convertir
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
};

window.openAdmissionDetailModal = function(solicitudId) {
    const found = (window.allAdmissionRequests || []).find(r => r.solicitudId === solicitudId);
    if (!found) {
        alert('Solicitud no encontrada.');
        return;
    }

    const modal = document.getElementById('modal-admission-detail');
    const titleEl = document.getElementById('modal-adm-title');
    const contentEl = document.getElementById('modal-adm-content');
    const actionsEl = document.getElementById('modal-adm-actions-container');
    const txtJust = document.getElementById('adm-justificacion-text');

    if (titleEl) titleEl.textContent = `Solicitud de Admisión ${found.solicitudId}`;
    if (txtJust) txtJust.value = '';

    const fFecha = found.fechaSolicitud ? new Date(found.fechaSolicitud).toLocaleString('es-HN') : '-';

    if (contentEl) {
        contentEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div><strong class="text-gray-600">Aspirante:</strong> <span class="text-gray-900 font-bold">${found.nombresAspirante} ${found.apellidosAspirante}</span></div>
                <div><strong class="text-gray-600">DNI / Identificación:</strong> <span class="text-gray-900 font-bold">${found.identificacion || 'N/A'}</span></div>
                <div><strong class="text-gray-600">Fecha Nacimiento:</strong> ${found.fechaNacimiento || '-'}</div>
                <div><strong class="text-gray-600">Grado / Año:</strong> ${found.gradoSolicitado} (${found.anolectivo})</div>
                <div><strong class="text-gray-600">Responsable:</strong> ${found.nombreResponsable || '-'}</div>
                <div><strong class="text-gray-600">Contacto Teléfono:</strong> ${found.telefonoContacto || '-'}</div>
                <div><strong class="text-gray-600">Correo Electrónico:</strong> ${found.emailContacto || '-'}</div>
                <div><strong class="text-gray-600">Canal de Ingreso:</strong> ${found.canalIngreso || 'Web'}</div>
                <div><strong class="text-gray-600">Fecha de Recepción:</strong> ${fFecha}</div>
                <div><strong class="text-gray-600">Estado Actual:</strong> <span class="font-bold text-blue-700">${found.estadoSolicitud}</span></div>
            </div>
            ${found.observaciones ? `<div class="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900"><strong>Observaciones / Histórico:</strong> ${found.observaciones}</div>` : ''}
        `;
    }

    // [TAREA-F5-006] Cargar y renderizar documentos adjuntos de la solicitud
    window.loadAdmissionApplicantDocuments(found.solicitudId);

    // [TAREA-F5-007] Cargar entrevistas y evaluaciones
    window.currentActiveSolicitudId = found.solicitudId;
    window.loadAdmissionInterviews(found.solicitudId);
    window.loadAdmissionEvaluations(found.solicitudId);

    // [TAREA-F5-008] Cargar lista de espera
    window.loadAdmissionWaitlistStatus(found.solicitudId);

    // [TAREA-F5-009] Cargar vinculación de tutor
    window.loadGuardianLinkageStatus(found);

    // [TAREA-F5-010] Cargar disponibilidad de cupos
    window.loadAdmissionCapacityStatus(found.anolectivo, found.gradoSolicitado);

    // [TAREA-F5-011] Cargar seguimiento de notificaciones enviadas
    window.loadAdmissionNotificationLogs(found.solicitudId);

    // [TAREA-F5-014] Cargar línea de tiempo de trazabilidad
    window.loadAdmissionAuditTrail(found.solicitudId);

    // [TAREA-F5-017] Cargar evaluación de duplicados y coincidencia
    window.checkAdmissionDuplicates(found.solicitudId);

    if (actionsEl) {
        const allowedTransitions = {
            "Recibida": ["En_Revision", "Rechazada", "Retirada"],
            "En_Revision": ["Evaluacion", "Admitida", "Rechazada", "En_Espera", "Retirada"],
            "Evaluacion": ["Admitida", "Rechazada", "En_Espera", "Retirada"],
            "En_Espera": ["Admitida", "Rechazada", "Retirada"],
            "Admitida": ["Convertida", "Rechazada", "Retirada"],
            "Rechazada": ["Reabierta"],
            "Convertida": [],
            "Retirada": ["Reabierta"],
            "Reabierta": ["En_Revision", "Evaluacion"]
        };

        const current = found.estadoSolicitud || 'Recibida';
        const nextStates = allowedTransitions[current] || [];

        let btnsHtml = '';

        nextStates.forEach(st => {
            let label = `Pasar a ${st.replace('_', ' ')}`;
            let btnClass = "bg-blue-600 text-white hover:bg-blue-700";

            if (st === 'Admitida') { label = "Aprobar y Admitir"; btnClass = "bg-green-600 text-white hover:bg-green-700"; }
            if (st === 'Rechazada') { label = "Rechazar Solicitud"; btnClass = "bg-red-600 text-white hover:bg-red-700"; }
            if (st === 'En_Espera') { label = "Mover a Lista de Espera"; btnClass = "bg-indigo-600 text-white hover:bg-indigo-700"; }
            if (st === 'Reabierta') { label = "Reabrir Expediente"; btnClass = "bg-amber-600 text-white hover:bg-amber-700"; }

            if (st === 'Convertida') {
                btnsHtml += `<button onclick="window.convertAdmissionToStudentAction('${found.solicitudId}')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"><i class="fa-solid fa-user-check mr-1"></i> Convertir a Matrícula</button>`;
            } else {
                btnsHtml += `<button onclick="window.updateAdmissionStatusAction('${found.solicitudId}', '${st}')" class="px-4 py-2 ${btnClass} font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm">${label}</button>`;
            }
        });

        actionsEl.innerHTML = btnsHtml || `<span class="text-xs text-gray-400 font-semibold">Solicitud en estado final '${current}'.</span>`;
    }

    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }
};

window.closeAdmissionDetailModal = function() {
    const modal = document.getElementById('modal-admission-detail');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
};

window.updateAdmissionStatusAction = async function(solicitudId, nuevoEstado) {
    const txtJust = document.getElementById('adm-justificacion-text');
    const justificacion = txtJust ? txtJust.value.trim() : '';

    if ((nuevoEstado === 'Rechazada' || nuevoEstado === 'Retirada') && justificacion.length < 10) {
        alert('Debe ingresar una justificación obligatoria de al menos 10 caracteres para rechazar o retirar la solicitud.');
        return;
    }

    try {
        const payload = {
            solicitudId: solicitudId,
            nuevoEstado: nuevoEstado,
            justificacion: justificacion
        };

        const res = await window.fetchApi('ACADEMIC', 'updateAdmissionStatus', payload);
        if (res && res.status === 'success') {
            alert(res.message || `Estado de solicitud actualizado a ${nuevoEstado}.`);
            window.closeAdmissionDetailModal();
            window.loadAdmissionRequestsList();
        } else {
            alert('Error al cambiar el estado: ' + ((res && res.message) || 'Inconveniente del servidor.'));
        }
    } catch (err) {
        alert('Error de conexión con el servidor: ' + err.message);
    }
};

window.convertAdmissionToStudentAction = async function(solicitudId) {
    if (!confirm(`¿Confirma la conversión de la solicitud ${solicitudId} a estudiante matriculado? Se creará el expediente y el registro de matrícula inicial.`)) {
        return;
    }

    try {
        const res = await window.fetchApi('ACADEMIC', 'convertAdmissionToStudent', { solicitudId });
        if (res && res.status === 'success') {
            alert(`¡Conversión completada exitosamente!\nExpediente Estudiantil: ${res.expedienteId}\nMatrícula: ${res.matriculaId}`);
            window.closeAdmissionDetailModal();
            window.loadAdmissionRequestsList();
        } else {
            alert('Error al realizar la conversión: ' + ((res && res.message) || 'Inconveniente con el servidor.'));
        }
    } catch (err) {
        alert('Error de conexión al convertir la solicitud: ' + err.message);
    }
};

// [TAREA-F5-006] [Fase 5: Admisiones y Matrícula] - Módulo de consulta y revisión documental de aspirantes en Secretaría
window.loadAdmissionApplicantDocuments = async function(solicitudId) {
    const docsContainer = document.getElementById('modal-adm-docs-container');
    if (!docsContainer) return;

    docsContainer.innerHTML = `<p class="text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Consultando documentos del aspirante...</p>`;

    try {
        const res = await window.fetchApi('ACADEMIC', 'getStudentDocuments', { solicitudId });
        if (res && res.status === 'success' && Array.isArray(res.documents) && res.documents.length > 0) {
            docsContainer.innerHTML = res.documents.map(d => {
                let badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                if (d.estadoRevision === 'Aceptado' || d.estadoRevision === 'Aprobado') badgeClass = "bg-green-100 text-green-800 border-green-200";
                if (d.estadoRevision === 'Rechazado' || d.estadoRevision === 'Requiere_Sustitucion') badgeClass = "bg-red-100 text-red-800 border-red-200";

                return `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-xl border border-gray-100 gap-2 shadow-sm">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-gray-900">${d.tipoDocumento}</span>
                                <span class="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${badgeClass}">${d.estadoRevision || 'EnRevision'}</span>
                            </div>
                            <span class="text-[10px] text-gray-500 block truncate max-w-xs">${d.nombreArchivo || 'Archivo adjunto'}</span>
                            ${d.observaciones ? `<span class="text-[10px] text-amber-700 block mt-0.5">Nota: ${d.observaciones}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            ${d.driveUrl ? `<a href="${d.driveUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-[10px] uppercase transition-all"><i class="fa-solid fa-file-arrow-down"></i> Ver</a>` : ''}
                            <button onclick="window.updateApplicantDocumentStatusAction('${d.documentoId}', 'Aceptado', '${solicitudId}')" class="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 font-bold rounded-lg text-[10px] uppercase transition-all" title="Aprobar Documento"><i class="fa-solid fa-check"></i> Aprobar</button>
                            <button onclick="window.updateApplicantDocumentStatusAction('${d.documentoId}', 'Rechazado', '${solicitudId}')" class="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg text-[10px] uppercase transition-all" title="Rechazar Documento"><i class="fa-solid fa-xmark"></i> Rechazar</button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            docsContainer.innerHTML = `<p class="text-gray-400 italic">No se han registrado documentos o requisitos adjuntos para esta solicitud.</p>`;
        }
    } catch (err) {
        docsContainer.innerHTML = `<p class="text-red-500 font-medium">Error al cargar documentos: ${err.message}</p>`;
    }
};

window.updateApplicantDocumentStatusAction = async function(documentoId, nuevoEstado, solicitudId) {
    const obs = prompt(`Ingrese observaciones para cambiar el estado del documento a '${nuevoEstado}':`, '');
    if (obs === null) return; // Cancelado

    try {
        const res = await window.fetchApi('ACADEMIC', 'updateDocumentStatus', {
            documentoId: documentoId,
            nuevoEstado: nuevoEstado,
            observaciones: obs
        });

        if (res && res.status === 'success') {
            alert(`Documento actualizado a ${nuevoEstado}.`);
            window.loadAdmissionApplicantDocuments(solicitudId);
        } else {
            alert('Error al actualizar estado del documento: ' + ((res && res.message) || 'Inconveniente del servidor.'));
        }
    } catch (err) {
        alert('Error de comunicación: ' + err.message);
    }
};

// [TAREA-F5-007] [Fase 5: Admisiones y Matrícula] - Controladores de interfaz para Entrevistas y Evaluaciones de Admisión
window.loadAdmissionInterviews = async function(solicitudId) {
    const container = document.getElementById('modal-adm-interviews-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Cargando entrevistas...</p>`;

    try {
        const res = await window.fetchApi('ACADEMIC', 'getAdmissionInterviews', { solicitudId });
        if (res && res.status === 'success' && Array.isArray(res.interviews) && res.interviews.length > 0) {
            container.innerHTML = res.interviews.map(i => {
                let badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                if (i.estado === 'Completada') badgeClass = "bg-green-100 text-green-800 border-green-200";
                if (i.estado === 'Cancelada' || i.estado === 'No_Asistio') badgeClass = "bg-red-100 text-red-800 border-red-200";

                return `
                    <div class="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-1">
                        <div class="flex justify-between items-center">
                            <strong class="text-gray-900">${i.fecha} (${i.horaInicio} - ${i.horaFin})</strong>
                            <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${badgeClass}">${i.estado}</span>
                        </div>
                        <p class="text-[10px] text-gray-500">Evaluador: ${i.evaluadorUserId} | ${i.modalidad} (${i.lugarEnlace})</p>
                        ${i.observaciones ? `<p class="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-100">${i.observaciones}</p>` : ''}
                        ${i.estado === 'Programada' ? `
                            <div class="flex gap-1 pt-1 justify-end">
                                <button onclick="window.recordInterviewOutcomeAction('${i.entrevistaId}', 'Completada')" class="px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded text-[9px]">Completar</button>
                                <button onclick="window.recordInterviewOutcomeAction('${i.entrevistaId}', 'No_Asistio')" class="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded text-[9px]">No Asistió</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `<p class="text-gray-400 italic">No hay entrevistas agendadas.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
};

window.promptScheduleInterview = async function() {
    const solicitudId = window.currentActiveSolicitudId;
    if (!solicitudId) return;

    const fecha = prompt("Fecha de la entrevista (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!fecha) return;

    const horaInicio = prompt("Hora inicio (HH:MM):", "09:00");
    if (!horaInicio) return;

    const horaFin = prompt("Hora fin (HH:MM):", "09:30");
    if (!horaFin) return;

    const evaluadorUserId = prompt("ID del Evaluador/Docente:", "DOCENTE-001");
    if (!evaluadorUserId) return;

    const modalidad = prompt("Modalidad (Presencial / Virtual):", "Presencial") || "Presencial";
    const lugarEnlace = prompt("Lugar / Enlace:", "Campus Principal - Salón A") || "Campus Principal";

    try {
        const res = await window.fetchApi('ACADEMIC', 'scheduleAdmissionInterview', {
            solicitudId, fecha, horaInicio, horaFin, evaluadorUserId, modalidad, lugarEnlace
        });

        if (res && res.status === 'success') {
            alert("Entrevista agendada exitosamente.");
            window.loadAdmissionInterviews(solicitudId);
        } else {
            alert("Error al agendar entrevista: " + ((res && res.message) || "Error desconocido"));
        }
    } catch (err) {
        alert("Error de comunicación: " + err.message);
    }
};

window.recordInterviewOutcomeAction = async function(entrevistaId, estado) {
    const obs = prompt(`Observaciones de la entrevista (${estado}):`, '');
    if (obs === null) return;

    try {
        const res = await window.fetchApi('ACADEMIC', 'recordInterviewOutcome', {
            entrevistaId, estado, observaciones: obs
        });

        if (res && res.status === 'success') {
            alert("Estado de entrevista actualizado.");
            if (window.currentActiveSolicitudId) window.loadAdmissionInterviews(window.currentActiveSolicitudId);
        } else {
            alert("Error: " + ((res && res.message) || "Inconveniente del servidor."));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
};

/*
 * [TAREA-F7-IMP-17] [Fase 7: Planificación Académica, Horarios y Recursos]
 * Módulo de Gestión de Eventos, Actividades e Infraestructura para Secretaría, Coordinación y Dirección.
 */
window.openAcademicEventManagerModal = function(defaultTipo = "Academico") {
    const modal = document.getElementById('modal-academic-event-manager');
    if (!modal) return;

    const tipoSelect = document.getElementById('evm-tipo-dia');
    const inicioInput = document.getElementById('evm-fecha-inicio');

    if (tipoSelect) tipoSelect.value = defaultTipo || "Academico";
    if (inicioInput) inicioInput.value = new Date().toISOString().split('T')[0];

    modal.classList.remove('hidden');
};

window.handleCreateAcademicEventSubmit = async function(e) {
    if (e) e.preventDefault();

    const nombre = document.getElementById('evm-nombre')?.value?.trim();
    const tipoDia = document.getElementById('evm-tipo-dia')?.value;
    const visibilidad = document.getElementById('evm-visibilidad')?.value;
    const fechaInicio = document.getElementById('evm-fecha-inicio')?.value;
    const fechaFin = document.getElementById('evm-fecha-fin')?.value;
    const aulaCodigo = document.getElementById('evm-aula-codigo')?.value?.trim();
    const recursosReservados = document.getElementById('evm-recursos')?.value?.trim();
    const gruposAfectados = document.getElementById('evm-grupos')?.value?.trim();
    const descripcion = document.getElementById('evm-descripcion')?.value?.trim();

    if (!nombre || !fechaInicio) {
        alert("Por favor ingrese el nombre del evento y la fecha de inicio.");
        return;
    }

    try {
        if (window.showLoading) window.showLoading("Procesando reserva de evento y recursos...");
        const res = await window.fetchApi('ACADEMIC', 'createCalendarEvent', {
            anoId: 'ANO-CURRENT',
            nombre,
            tipoDia,
            fechaInicio,
            fechaFin: fechaFin || fechaInicio,
            visibilidad,
            aulaCodigo,
            recursosReservados,
            gruposAfectados,
            responsableUserId: (window.currentUser ? window.currentUser.nombre || window.currentUser.userId : 'Secretaría'),
            descripcion
        });
        if (window.hideLoading) window.hideLoading();

        if (res && res.status === 'warning' && res.hasConflict) {
            alert(`Advertencia de Reserva:\n${res.message}`);
        } else if (res && res.status === 'success') {
            alert(`Evento y reserva registrados exitosamente. ID: ${res.data?.eventoId || 'N/A'}`);
            document.getElementById('modal-academic-event-manager')?.classList.add('hidden');
            if (window.loadAcademicCalendar) window.loadAcademicCalendar();
        } else {
            alert(res?.message || "Ocurrió un error al registrar el evento.");
        }
    } catch (err) {
        if (window.hideLoading) window.hideLoading();
        console.error("Error al registrar evento:", err);
        alert("Error al procesar la solicitud: " + err.message);
    }
};

/*
 * [TAREA-F7-IMP-06] [Fase 7: Planificación Académica, Horarios y Recursos]
 * Gestión de Aulas, Espacios Físicos, Equipamiento e Indisponibilidad.
 */
window.openClassroomManagerModal = async function() {
    const modal = document.getElementById('modal-classroom-manager');
    if (!modal) return;
    modal.classList.remove('hidden');
    await window.loadClassroomResourcesTable();
};

window.loadClassroomResourcesTable = async function() {
    const tbody = document.getElementById('tbl-classroom-resources-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="p-3 text-center text-slate-400">Cargando espacios...</td></tr>';

    try {
        const res = await window.fetchApi('ACADEMIC', 'getClassroomResources', {});
        if (res && res.status === 'success' && Array.isArray(res.data)) {
            if (res.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="p-3 text-center text-slate-400">No hay espacios registrados.</td></tr>';
                return;
            }
            tbody.innerHTML = res.data.map(cls => `
                <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-bold text-slate-800">${cls.aulaCodigo}</td>
                    <td class="p-2.5">${cls.nombreAula}</td>
                    <td class="p-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">${cls.tipoEspacio || 'Aula'}</span></td>
                    <td class="p-2.5 font-medium">${cls.capacidad || 30} est.</td>
                    <td class="p-2.5 text-[11px] text-slate-600">${cls.equipamiento || 'Básico'}</td>
                    <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${cls.estado === 'Inactivo' ? 'bg-red-100 text-red-700' : cls.estado === 'Indisponible' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
                            ${cls.estado || 'Activo'}
                        </span>
                    </td>
                    <td class="p-2.5 text-right space-x-1">
                        <button class="btn-edit-clsr text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                            data-codigo="${cls.aulaCodigo}"
                            data-nombre="${cls.nombreAula}"
                            data-capacidad="${cls.capacidad || 30}"
                            data-tipo="${cls.tipoEspacio || 'Aula'}"
                            data-equipamiento="${cls.equipamiento || ''}"
                            data-estado="${cls.estado || 'Activo'}">
                            <i class="fa-solid fa-pen-to-square mr-0.5"></i> Editar
                        </button>
                        <button class="btn-maint-clsr text-amber-600 hover:text-amber-800 font-bold text-[11px]"
                            data-codigo="${cls.aulaCodigo}">
                            <i class="fa-solid fa-screwdriver-wrench mr-0.5"></i> Mantenimiento
                        </button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.btn-edit-clsr').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('clsr-codigo').value = btn.getAttribute('data-codigo');
                    document.getElementById('clsr-nombre').value = btn.getAttribute('data-nombre');
                    document.getElementById('clsr-capacidad').value = btn.getAttribute('data-capacidad');
                    document.getElementById('clsr-tipo').value = btn.getAttribute('data-tipo');
                    document.getElementById('clsr-estado').value = btn.getAttribute('data-estado');
                    const eqInput = document.getElementById('clsr-equipamiento');
                    if (eqInput) eqInput.value = btn.getAttribute('data-equipamiento');
                });
            });

            document.querySelectorAll('.btn-maint-clsr').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const aulaCodigo = btn.getAttribute('data-codigo');
                    await window.openClassroomMaintenanceModal(aulaCodigo);
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="p-3 text-center text-red-500">Error al cargar espacios.</td></tr>';
        }
    } catch (err) {
        console.error('Error al obtener recursos de aulas:', err);
        tbody.innerHTML = '<tr><td colspan="7" class="p-3 text-center text-red-500">Error de comunicación con el servidor.</td></tr>';
    }
};

window.openClassroomMaintenanceModal = async function(aulaCodigo) {
    const motivo = prompt(`Ingrese el motivo del mantenimiento/indisponibilidad para el aula ${aulaCodigo}:`, 'Mantenimiento preventivo de equipos y climatización');
    if (!motivo) return;

    const hoyStr = new Date().toISOString().split('T')[0];
    try {
        if (window.showLoading) window.showLoading('Registrando mantenimiento de aula...');
        const res = await window.fetchApi('ACADEMIC', 'saveClassroomMaintenance', {
            aulaCodigo,
            motivo,
            fechaInicio: hoyStr,
            fechaFin: hoyStr,
            estado: 'Indisponible'
        });
        if (window.hideLoading) window.hideLoading();

        if (res && res.status === 'success') {
            alert(`Mantenimiento registrado e indisponibilidad aplicada al aula ${aulaCodigo}.`);
            await window.loadClassroomResourcesTable();
        } else {
            alert(res && res.message ? res.message : 'Error al registrar mantenimiento.');
        }
    } catch (err) {
        if (window.hideLoading) window.hideLoading();
        console.error('Error al guardar mantenimiento de aula:', err);
        alert('Error al conectar con el servidor.');
    }
};

/*
 * [TAREA-13] [Fase 1 - Planificación de Carga Académica]
 * Controlador del modal de planificación de carga académica, jefaturas y vacantes.
 */
window.openAcademicLoadPlanningModal = function() {
    const modalAcademicPlanning = document.getElementById('modal-academic-load-planning');
    if (modalAcademicPlanning) {
        modalAcademicPlanning.classList.remove('hidden');
        window.refreshAcademicPlanningData();
    }
};

window.refreshAcademicPlanningData = async function() {
    const tableBody = document.getElementById('table-academic-planning-vacancies');
    if (!tableBody) return;

    try {
        tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">Cargando planificación y vacantes...</td></tr>';
        const res = await window.fetchApi('ACADEMIC', 'getDepartmentAcademicPlanning', {});
        if (res && res.status === 'success' && res.data) {
            const vacantes = res.data.vacantes || [];
            if (vacantes.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-emerald-600 font-bold">¡Todas las ofertas académicas tienen docente asignado! No hay vacantes.</td></tr>';
            } else {
                tableBody.innerHTML = vacantes.map(v => `
                    <tr>
                        <td class="p-2.5 font-bold text-slate-800">${v.ofertaId}</td>
                        <td class="p-2.5">${v.asignatura}</td>
                        <td class="p-2.5">${v.grado} ${v.seccion || 'A'}</td>
                        <td class="p-2.5">${v.departamento || 'General'}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">VACANTE</span></td>
                    </tr>
                `).join('');
            }
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Error al cargar la planificación.</td></tr>';
        }
    } catch (err) {
        console.error('Error al obtener planificación:', err);
        tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Error de conexión con el servidor.</td></tr>';
    }
};

/*
 * [TAREA-F6-019] Analítica y Reportes de Rendimiento y Cobertura Académica.
 */
window.openAcademicAnalyticsModal = function() {
    const modal = document.getElementById('modal-academic-analytics');
    if (!modal) return;
    modal.classList.remove('hidden');
    window.loadAcademicAnalyticsData();
};

window.loadAcademicAnalyticsData = async function() {
    const container = document.getElementById('academic-analytics-content');
    if (!container) return;
    container.innerHTML = '<div class="p-6 text-center text-slate-400 font-bold text-xs uppercase"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Cargando analíticas de rendimiento...</div>';

    try {
        const res = await window.fetchApi('ACADEMIC', 'getCurricularAnalyticsReport', {});
        if (res && res.status === 'success' && res.data) {
            const d = res.data;
            container.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div class="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                        <span class="text-[10px] font-bold text-blue-600 uppercase block">Promedio Institucional</span>
                        <span class="text-2xl font-black text-blue-900">${d.promedioGeneral || '0.0'}%</span>
                    </div>
                    <div class="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                        <span class="text-[10px] font-bold text-emerald-600 uppercase block">Aprobación Ponderada</span>
                        <span class="text-2xl font-black text-emerald-900">${d.porcentajeAprobados || '0'}%</span>
                    </div>
                    <div class="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                        <span class="text-[10px] font-bold text-amber-600 uppercase block">Alertas Acompañamiento</span>
                        <span class="text-2xl font-black text-amber-900">${d.alertasConde || 0}</span>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="p-6 text-center text-slate-500 font-bold text-xs uppercase">No hay datos analíticos disponibles.</div>';
        }
    } catch (err) {
        console.error("Error al cargar analíticas:", err);
        container.innerHTML = '<div class="p-6 text-center text-red-500 font-bold text-xs uppercase">Error de comunicación con el servidor.</div>';
    }
};

// [TAREA-F6-026] [Fase 6: Expediente Institucional y Ciclo de Vida] - Consulta y exportación controlada de informes administrativos del expediente
window.loadStudentAdministrativeReport = async function(reporteTipo, filters) {
    try {
        const payload = Object.assign({ reporteTipo: reporteTipo || 'ESTADO_EXPEDIENTES' }, filters || {});
        const res = await window.fetchApi('ACADEMIC', 'getStudentFileAdministrativeReports', payload);
        if (res && res.status === 'success' && Array.isArray(res.reporte)) {
            window._lastAdminReportData = res.reporte;
            window._lastAdminReportType = reporteTipo;
            return res.reporte;
        } else {
            alert("Error al consultar reporte: " + ((res && res.message) || "Sin datos disponibles."));
            return [];
        }
    } catch (err) {
        alert("Error al conectar para consultar el reporte: " + err.message);
        return [];
    }
};

window.exportAdministrativeReportCSV = async function(reporteTipo, filters) {
    try {
        const payload = Object.assign({ reporteTipo: reporteTipo || 'ESTADO_EXPEDIENTES', exportLog: true }, filters || {});
        const res = await window.fetchApi('ACADEMIC', 'getStudentFileAdministrativeReports', payload);

        if (!res || res.status !== 'success' || !Array.isArray(res.reporte) || res.reporte.length === 0) {
            alert("No hay registros disponibles para exportar con los filtros seleccionados.");
            return;
        }

        const data = res.reporte;
        const keys = Object.keys(data[0]);
        const headers = keys.join(",");
        const rows = data.map(item => keys.map(k => `"${String(item[k] || '').replace(/"/g, '""')}"`).join(","));

        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Reporte_Administrativo_${reporteTipo}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showToast === 'function') {
            showToast("Reporte administrativo exportado exitosamente con registro de auditoría PII.", "success");
        } else {
            alert("Reporte administrativo exportado exitosamente con registro de auditoría PII.");
        }
    } catch (err) {
        alert("Error al exportar reporte administrativo: " + err.message);
    }
};

// [TAREA-F6-025] [Fase 6: Expediente Institucional y Ciclo de Vida] - Pre-visualización comparativa previa a fusión de expedientes y desvinculación administrativa
window.previewStudentMergeComparison = async function(targetExpedienteId, sourceExpedienteId) {
    if (!targetExpedienteId || !sourceExpedienteId) {
        alert("Especifique ambos expedientes para pre-visualizar la comparación.");
        return;
    }

    try {
        const res = await window.fetchApi('ACADEMIC', 'getMergePreviewComparison', { targetExpedienteId, sourceExpedienteId });
        if (res && res.status === 'success' && res.comparison) {
            const comp = res.comparison;
            let msg = `--- COMPARACIÓN PREVIA DE FUSIÓN DE EXPEDIENTES ---\n\n`;
            msg += `EXPEDIENTE DESTINO (${comp.expedienteDestino.expedienteId}):\n`;
            msg += `• Código: ${comp.expedienteDestino.codigoInstitucional} | Estado: ${comp.expedienteDestino.estado}\n`;
            msg += `• Matrículas: ${comp.expedienteDestino.totalMatriculas} | Documentos: ${comp.expedienteDestino.totalDocumentos}\n\n`;
            msg += `EXPEDIENTE ORIGEN (${comp.expedienteOrigen.expedienteId}):\n`;
            msg += `• Código: ${comp.expedienteOrigen.codigoInstitucional} | Estado: ${comp.expedienteOrigen.estado}\n`;
            msg += `• Matrículas: ${comp.expedienteOrigen.totalMatriculas} | Documentos: ${comp.expedienteOrigen.totalDocumentos}\n\n`;

            if (comp.totalContradicciones > 0) {
                msg += `⚠️ CONTRADICCIONES DETECTADAS (${comp.totalContradicciones}):\n`;
                comp.contradictions.forEach(c => {
                    msg += `• ${c.campo}: Destino='${c.destino}' vs Origen='${c.origen}'\n`;
                });
            } else {
                msg += `✓ Sin contradicciones de datos personales detectadas.\n`;
            }

            alert(msg);
        } else {
            alert("Error: " + ((res && res.message) || "No se pudo recuperar la pre-visualización."));
        }
    } catch (err) {
        alert("Error al obtener la pre-visualización: " + err.message);
    }
};

window.unmergeStudentFilesAction = async function(sourceExpedienteId) {
    const expedienteId = sourceExpedienteId || prompt("Ingrese el ID del expediente fusionado a desvincular/restaurar:", "");
    if (!expedienteId) return;

    const motivoJustificado = prompt("Justificación administrativa obligatoria para la desvinculación (mínimo 10 caracteres):", "");
    if (!motivoJustificado || motivoJustificado.trim().length < 10) {
        alert("Motivo obligatorio requerido con al menos 10 caracteres.");
        return;
    }

    try {
        const res = await window.fetchApi('ACADEMIC', 'unmergeStudentFiles', {
            sourceExpedienteId: expedienteId,
            motivoJustificado
        });

        if (res && res.status === 'success') {
            alert(`Expediente ${expedienteId} desvinculado exitosamente. Estado restaurado a Activo.`);
        } else {
            alert("Error: " + ((res && res.message) || "Fallo del servidor al desvincular."));
        }
    } catch (err) {
        alert("Error al desvincular expediente: " + err.message);
    }
};

// [TAREA-F6-024] [Fase 6: Expediente Institucional y Ciclo de Vida] - Carga y renderizado del historial de notificaciones y seguimiento de trámites en el expediente
window.loadStudentProcedureNotificationLogs = async function(expedienteId, containerId) {
    const container = document.getElementById(containerId || 'stfile-notifications-container');
    if (!container || !expedienteId) return;

    container.innerHTML = '<div class="text-slate-400 text-xs py-4 text-center"><i class="fa-solid fa-spinner fa-spin mr-1"></i>Cargando historial de notificaciones...</div>';

    try {
        const res = await window.fetchApi('USER', 'getStudentProcedureNotificationLogs', { expedienteId });
        const logs = (res && res.status === 'success' && Array.isArray(res.logs)) ? res.logs : [];

        if (logs.length === 0) {
            container.innerHTML = '<div class="text-slate-400 text-xs py-4 text-center font-semibold">No se han registrado notificaciones ni alertas para este expediente.</div>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 mb-2">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-slate-800">${log.titulo || 'Notificación de Trámite'}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${log.estadoEntrega === 'Entregado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${log.estadoEntrega}</span>
                </div>
                <p class="text-xs text-slate-600">${log.mensaje || ''}</p>
                <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Categoría: ${log.categoria || 'Expediente'}</span>
                    <span>${log.fechaEmision ? new Date(log.fechaEmision).toLocaleString() : 'N/A'}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error al cargar notificaciones de expediente:', err);
        container.innerHTML = '<div class="text-amber-600 text-xs py-4 text-center">No se pudo recuperar la bitácora de notificaciones.</div>';
    }
};

// [TAREA-F6-019] [Fase 6: Expediente Institucional y Ciclo de Vida] - Exportación del historial de trazabilidad del estudiante a formato CSV
window.exportLifeCycleAuditTrailCSV = function(timelineEvents, studentCode) {
    if (!Array.isArray(timelineEvents) || timelineEvents.length === 0) {
        if (typeof showToast === "function") {
            showToast("No hay eventos en la línea de tiempo para exportar.", "warning");
        } else {
            alert("No hay eventos en la línea de tiempo para exportar.");
        }
        return;
    }

    const headers = ["Fecha", "Categoría", "Tipo", "Título", "Periodo", "Actor", "Detalle", "RefID"];
    const rows = timelineEvents.map(ev => [
        `"${String(ev.fecha || '').replace(/"/g, '""')}"`,
        `"${String(ev.categoria || '').replace(/"/g, '""')}"`,
        `"${String(ev.tipo || '').replace(/"/g, '""')}"`,
        `"${String(ev.titulo || '').replace(/"/g, '""')}"`,
        `"${String(ev.periodo || '').replace(/"/g, '""')}"`,
        `"${String(ev.actor || '').replace(/"/g, '""')}"`,
        `"${String(ev.detalle || '').replace(/"/g, '""')}"`,
        `"${String(ev.refId || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Historial_Expediente_${studentCode || 'Estudiante'}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof showToast === "function") {
        showToast("Historial de trazabilidad exportado exitosamente.", "success");
    } else {
        alert("Historial de trazabilidad exportado exitosamente.");
    }
};

// [TAREA-F5-009] [Fase 5: Admisiones y Portal de Familias] - Controladores UI de Vinculación Familiar e Invitaciones por Token
window.loadGuardianLinkageStatus = function(solicitudObj) {
    const container = document.getElementById('modal-adm-tutors-container');
    if (!container) return;

    if (!solicitudObj) {
        container.innerHTML = `<p class="text-gray-400">Sin datos de la solicitud.</p>`;
        return;
    }

    const email = solicitudObj.emailContacto || '';
    const name = solicitudObj.nombreResponsable || 'Responsable Declarado';

    container.innerHTML = `
        <div class="p-3 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
            <div class="flex justify-between items-center">
                <strong class="text-gray-900">${name}</strong>
                <span class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Declarado</span>
            </div>
            <p class="text-[10px] text-gray-500">Correo Electrónico: ${email || 'N/A'}</p>
            <div class="flex gap-2 justify-end pt-1">
                <button onclick="window.promptIssueTutorInvitation('${solicitudObj.solicitudId}', '${solicitudObj.expedienteId || ''}', '${email}')" class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-[10px] uppercase"><i class="fa-solid fa-key"></i> Generar Token de Invitación</button>
            </div>
        </div>
    `;

    if (solicitudObj.expedienteId) {
        window.loadStudentGuardianConsolidatedList(solicitudObj.expedienteId);
    }
};

// [TAREA-F7-IMP-10] [Fase 7: Planificación Académica, Horarios y Recursos] - Controlador UI de consulta de historial de notificaciones de cambios de horario
window.loadScheduleChangeNotificationLogs = async function(horarioId) {
    try {
        if (window.showLoading) window.showLoading('Consultando notificaciones de cambio de horario...');
        const res = await fetchApi('USER', 'getScheduleChangeNotificationLogs', { horarioId });
        if (window.hideLoading) window.hideLoading();

        if (res && res.status === 'success' && Array.isArray(res.data)) {
            alert(`Historial de Notificaciones de Cambio de Horario:\n\nTotal notificaciones: ${res.data.length}\n` +
                  (res.data.length > 0 ? res.data.map(n => `[${n.estadoEntrega || 'Entregado'}] ${n.titulo} -> Destino: ${n.destinatario} (${n.fecha ? new Date(n.fecha).toLocaleDateString() : ''})`).slice(0, 5).join('\n') : 'Sin notificaciones recientes.'));
        } else {
            alert('Error al consultar notificaciones: ' + (res ? res.message : 'Error desconocido'));
        }
    } catch (err) {
        if (window.hideLoading) window.hideLoading();
        alert('Error de comunicación: ' + err.message);
    }
};

// [TAREA-F6-018] [Fase 6: Expediente Institucional y Ciclo de Vida] - Gestión de autorizaciones, responsables legales y lista consolidada de tutores
window.loadStudentGuardianConsolidatedList = async function(expedienteId) {
    const container = document.getElementById('modal-adm-tutors-container');
    if (!container || !expedienteId) return;

    // Limpiar previo consolidado si existe para evitar duplicación en re-renderizados
    const existingList = container.querySelector('.consolidated-tutors-wrapper');
    if (existingList) existingList.remove();

    try {
        const res = await fetchApi('USER', 'getStudentGuardianConsolidatedList', { expedienteId });
        if (res && res.status === 'success' && Array.isArray(res.tutores) && res.tutores.length > 0) {
            let html = `<div class="consolidated-tutors-wrapper space-y-2 pt-2 border-t border-gray-100">
                <p class="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Consolidado de Tutores y Restricciones Judiciales:</p>`;
            res.tutores.forEach(t => {
                const restBadge = t.restriccionActiva
                    ? `<span class="px-2 py-0.5 text-[8px] font-black rounded bg-red-100 text-red-800 border border-red-200">RESTRICCIÓN: ${t.restriccionActiva.tipoRestriccion}</span>`
                    : `<span class="px-2 py-0.5 text-[8px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Sin Restricciones</span>`;
                html += `
                    <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-gray-900">${t.nombreTutor} (${t.parentesco})</span>
                            ${restBadge}
                        </div>
                        <p class="text-[9px] text-gray-500">ID Usuario Tutor: <code class="bg-gray-200 px-1 rounded">${t.tutorUserId}</code> | Estado Vínculo: <strong>${t.estadoVinculo}</strong></p>
                        ${t.restriccionActiva ? `<p class="text-[9px] text-red-600 font-medium">Ref. Judicial: ${t.restriccionActiva.ordenJudicialRef || 'N/A'} | Prohibir Contacto: ${t.restriccionActiva.prohibirContacto}</p>` : ''}
                    </div>
                `;
            });
            html += `</div>`;
            container.insertAdjacentHTML('beforeend', html);
        }
    } catch (err) {
        console.warn("No se pudo cargar la lista consolidada de tutores:", err);
    }
};

window.promptRegisterCustodyRestriction = async function(expedienteIdInput) {
    const expedienteId = expedienteIdInput || (window.currentActiveSolicitudObj && window.currentActiveSolicitudObj.expedienteId) || prompt("Ingrese el ID de Expediente del estudiante:", "");
    if (!expedienteId) return;

    const tutorUserId = prompt("Ingrese el UserId del tutor/responsable a restringir:", "");
    if (!tutorUserId) return;

    const tipoRestriccion = prompt("Tipo de Restricción Legal (ej. RestriccionTotal, ParcialLectura, ContactoProhibido):", "RestriccionTotal");
    if (!tipoRestriccion) return;

    const ordenJudicialRef = prompt("Número o Referencia de la Orden Judicial / Resolución:", "");
    const prohibirContacto = confirm("¿Desea prohibir todo contacto y revocar automáticamente permisos del tutor?");
    const observaciones = prompt("Observaciones justificativas de la restricción legal:", "");

    try {
        const res = await fetchApi('USER', 'registerLegalCustodyRestriction', {
            expedienteId,
            tutorUserId,
            tipoRestriccion,
            ordenJudicialRef,
            prohibirContacto,
            observaciones
        });
        if (res && res.status === 'success') {
            alert("Restricción judicial de custodia legal registrada correctamente. ID: " + res.restriccionId);
            if (expedienteId) window.loadStudentGuardianConsolidatedList(expedienteId);
        } else {
            alert("Error al registrar restricción: " + (res ? res.message : "Error desconocido"));
        }
    } catch (err) {
        alert("Error de comunicación: " + err.message);
    }
};

window.promptIssueTutorInvitation = async function(solicitudIdInput, expedienteIdInput, emailInput) {
    const solicitudId = solicitudIdInput || window.currentActiveSolicitudId;
    const email = emailInput || prompt("Correo electrónico del responsable/tutor:", "");
    if (!email) return;

    try {
        const res = await window.fetchApi('USER', 'createLinkInvitation', {
            solicitudId: solicitudId,
            expedienteId: expedienteIdInput || "",
            emailResponsable: email
        });

        if (res && res.status === 'success' && res.data) {
            alert(`¡Invitación por Token Emitida Exitosamente!\n\nToken Seguro: ${res.data.token}\nDestinatario: ${email}\nVigencia: 7 días\n\nEl tutor podrá vincularse ingresando este token en su Portal Familiar.`);
        } else {
            alert("Error al emitir invitación: " + ((res && res.message) || "Inconveniente del servidor."));
        }
    } catch (err) {
        alert("Error de red: " + err.message);
    }
};

// [TAREA-F5-014] [Fase 5: Trazabilidad y Auditoría] - Carga y despliegue del historial de cambios de la solicitud de admisión
window.loadAdmissionAuditTrail = async function(solicitudId) {
    const container = document.getElementById('modal-adm-audit-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Consultando línea de tiempo de trazabilidad...</p>`;

    try {
        const res = await window.fetchApi('USER', 'getEntityAuditHistory', { entityType: 'SolicitudAdmision', entityId: solicitudId, limit: 15 });
        if (res && res.status === 'success' && Array.isArray(res.data)) {
            if (res.data.length === 0) {
                container.innerHTML = `<p class="text-gray-400 italic">No se registran cambios de estado o modificaciones auditadas en la bitácora.</p>`;
                return;
            }

            let html = `<div class="space-y-2 max-h-48 overflow-y-auto pr-1">`;
            res.data.forEach(chg => {
                const dateStr = chg.fechaCambio ? new Date(chg.fechaCambio).toLocaleString('es-HN') : 'Sin fecha';
                html += `
                    <div class="p-2 bg-white rounded-lg border border-gray-100 flex flex-col gap-1 shadow-sm">
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="font-bold text-gray-800 flex items-center gap-1">
                                <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> ${window.escapeHtml ? window.escapeHtml(chg.accion) : chg.accion}
                            </span>
                            <span class="text-gray-400">${dateStr}</span>
                        </div>
                        <p class="text-gray-600 text-[11px] leading-tight">Por: <strong>${chg.ejecutadoPor}</strong></p>
                        ${chg.valoresNuevos ? `<div class="text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100 font-mono overflow-x-auto">${window.escapeHtml ? window.escapeHtml(JSON.stringify(chg.valoresNuevos)) : JSON.stringify(chg.valoresNuevos)}</div>` : ''}
                    </div>
                `;
            });
            html += `</div>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = `<p class="text-gray-400 italic">No fue posible cargar el historial de auditoría.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">Error al cargar bitácora: ${err.message}</p>`;
    }
};

// [TAREA-F5-017] Detección de duplicados, calidad de datos y resolución de alertas
window.checkAdmissionDuplicates = async function(solicitudIdTarget) {
    const sId = solicitudIdTarget || window.currentActiveSolicitudId;
    const container = document.getElementById('modal-adm-duplicates-container');
    if (!container) return;

    const found = (window.allAdmissionRequests || []).find(r => r.solicitudId === sId);
    if (!found) {
        container.innerHTML = `<p class="text-gray-400">Seleccione una solicitud para evaluar coincidencias.</p>`;
        return;
    }

    container.innerHTML = `<p class="text-gray-500 text-xs"><i class="fas fa-spinner fa-spin mr-1"></i> Analizando base de datos en busca de posibles duplicados...</p>`;

    try {
        const resp = await window.callAppsScript('findDuplicateStudents', {
            solicitudId: found.solicitudId,
            nombres: found.nombresAspirante,
            apellidos: found.apellidosAspirante,
            identificacion: found.identificacion,
            fechaNacimiento: found.fechaNacimiento,
            email: found.emailContacto,
            telefono: found.telefonoContacto
        });

        if (resp && resp.status === 'success') {
            const candidates = resp.candidates || [];
            if (candidates.length === 0) {
                container.innerHTML = `
                    <div class="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex items-center justify-between">
                        <div>
                            <span class="font-bold"><i class="fa-solid fa-circle-check text-green-600 mr-1"></i> Sin duplicados detectados</span>
                            <p class="text-[10px] text-green-700 mt-0.5">No se encontraron registros de estudiantes ni solicitudes coincidentes con ${found.nombresAspirante} ${found.apellidosAspirante}.</p>
                        </div>
                        <span class="px-2 py-0.5 bg-green-100 text-green-800 font-bold text-[9px] rounded-full uppercase">100% Único</span>
                    </div>
                `;
            } else {
                let html = `
                    <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-rose-700"><i class="fa-solid fa-triangle-exclamation text-rose-600 mr-1"></i> Se encontraron ${candidates.length} posible(s) coincidencia(s)</span>
                            <button onclick="window.promptResolveAdmissionDuplicate('${sId}')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all">
                                Resolver Alerta
                            </button>
                        </div>
                        <div class="space-y-1.5 pt-1">
                `;

                candidates.forEach(c => {
                    const levelColor = c.nivelCoincidencia === 'COINCIDENCIA_EXACTA' ? 'bg-rose-100 text-rose-800 border-rose-300' : (c.nivelCoincidencia === 'COINCIDENCIA_ALTA' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300');
                    html += `
                        <div class="p-2 bg-white rounded-lg border border-amber-100 flex items-center justify-between text-[11px]">
                            <div>
                                <span class="font-bold text-gray-900">${c.nombreCompleto}</span>
                                <span class="text-gray-500 text-[10px] ml-1">(${c.tipo === 'EXPEDIENTE_ESTUDIANTE' ? 'Estudiante Matriculado' : 'Solicitud de Admisión'})</span>
                                <div class="text-[10px] text-gray-600">ID: ${c.codigoInstitucional || c.id} | DNI: ${c.identificacion || 'N/D'} | Motivo: <span class="font-bold">${c.coincidencia}</span></div>
                            </div>
                            <span class="px-2 py-0.5 font-bold text-[9px] rounded-full border ${levelColor}">${c.nivelCoincidencia || 'COINCIDENCIA'}</span>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
                container.innerHTML = html;
            }
        } else {
            container.innerHTML = `<p class="text-rose-600 text-xs font-bold">No se pudo verificar la detección de duplicados.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-rose-600 text-xs">Error evaluando duplicados: ${err.message}</p>`;
    }
};

window.promptResolveAdmissionDuplicate = async function(sIdTarget) {
    const sId = sIdTarget || window.currentActiveSolicitudId;
    if (!sId) return;

    const action = prompt(`Resolución de alerta de duplicidad para solicitud ${sId}:\n\nSeleccione el número de la acción a ejecutar:\n1. Aprobar como nuevo postulante (Sin duplicado real)\n2. Vincular a expediente de estudiante existente\n3. Rechazar solicitud por ser un registro duplicado`, "1");

    if (!action) return;

    let resolucion = null;
    let expedienteDestinoId = "";

    if (action.trim() === "1") {
        resolucion = "AprobarNuevo";
    } else if (action.trim() === "2") {
        resolucion = "VincularExistente";
        expedienteDestinoId = prompt("Ingrese el identificador del expediente de estudiante destino (ej. EXP-2026-00001):");
        if (!expedienteDestinoId) {
            alert("Operación cancelada: Debe proporcionar el expediente de estudiante destino.");
            return;
        }
    } else if (action.trim() === "3") {
        resolucion = "RechazarDuplicado";
    } else {
        alert("Opción no válida.");
        return;
    }

    const motivoJustificado = prompt("Ingrese la justificación de la decisión (mínimo 10 caracteres):", "Verificado por Secretaría. Expediente verificado y validado.");
    if (!motivoJustificado || motivoJustificado.trim().length < 10) {
        alert("Operación cancelada: Debe proporcionar una motivación justificada de al menos 10 caracteres.");
        return;
    }

    try {
        const resp = await window.callAppsScript('resolveAdmissionDuplicate', {
            solicitudId: sId,
            resolucion: resolucion,
            expedienteDestinoId: expedienteDestinoId,
            motivoJustificado: motivoJustificado
        });

        if (resp && resp.status === 'success') {
            alert(resp.message || 'Alerta de duplicidad resuelta correctamente.');
            await window.loadAdmissionRequestsList();
            window.openAdmissionDetailModal(sId);
        } else {
            alert('Error resolviendo duplicado: ' + (resp ? resp.message : 'Error en servidor'));
        }
    } catch (err) {
        alert('Fallo procesando resolución de duplicado: ' + err.message);
    }
};

// [TAREA-F5-011] [Fase 5: Admisiones y Portal de Familias] - Consulta e inspección de notificaciones despachadas por solicitud
window.loadAdmissionNotificationLogs = async function(solicitudId) {
    const container = document.getElementById('modal-adm-notifications-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Consultando historial de avisos...</p>`;

    try {
        const res = await window.fetchApi('USER', 'getAdmissionNotificationLogs', { solicitudId, limit: 10 });
        if (res && res.status === 'success' && Array.isArray(res.notificaciones)) {
            if (res.notificaciones.length === 0) {
                container.innerHTML = `<p class="text-gray-400 italic">No se registran notificaciones despachadas para este código de seguimiento.</p>`;
                return;
            }

            let html = `<div class="space-y-2 max-h-48 overflow-y-auto pr-1">`;
            res.notificaciones.forEach(n => {
                const dateStr = n.fechaEnvio ? new Date(n.fechaEnvio).toLocaleString('es-HN') : 'Sin fecha';
                const isEmail = n.emailDestino || (n.canalUtilizado && n.canalUtilizado.includes('Correo'));
                html += `
                    <div class="p-2 bg-white rounded-lg border border-gray-100 flex flex-col gap-1 shadow-sm">
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="font-bold text-gray-800 flex items-center gap-1">
                                <i class="fa-solid fa-paper-plane text-indigo-500"></i> ${window.escapeHtml ? window.escapeHtml(n.titulo) : n.titulo}
                            </span>
                            <span class="text-gray-400">${dateStr}</span>
                        </div>
                        <p class="text-gray-600 text-[11px] leading-tight">${window.escapeHtml ? window.escapeHtml(n.mensaje) : n.mensaje}</p>
                        <div class="flex items-center justify-between mt-1 text-[9px] text-gray-400 border-t border-gray-50 pt-1">
                            <span>Destino: <strong>${n.emailDestino || n.usuarioDestino}</strong></span>
                            <span class="px-1.5 py-0.5 rounded font-semibold ${n.estadoEntrega === 'Entregado' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}">
                                ${n.estadoEntrega || 'Entregado'}
                            </span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = `<p class="text-gray-400 italic">No fue posible cargar el historial de notificaciones.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">Error al cargar notificaciones: ${err.message}</p>`;
    }
};

// [TAREA-F5-010] [Fase 5: Admisiones y Matrícula] - Consulta y visualización del desglose de capacidad de cupos por grado
window.loadAdmissionCapacityStatus = async function(anolectivo, grado) {
    const container = document.getElementById('modal-adm-capacity-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Consultando disponibilidad de cupos...</p>`;

    try {
        const res = await window.fetchApi('ACADEMIC', 'checkEnrollmentCapacity', { anolectivo, grado });
        if (res && res.status === 'success') {
            let statusBadge = "bg-green-100 text-green-800 border-green-200";
            let statusText = "Cupos Disponibles";

            if (!res.hayCupo) {
                statusBadge = "bg-red-100 text-red-800 border-red-200";
                statusText = "Capacidad Agotada";
            } else if (res.cuposDisponibles <= 3) {
                statusBadge = "bg-amber-100 text-amber-800 border-amber-200";
                statusText = "Últimos Cupos";
            }

            container.innerHTML = `
                <div class="p-3 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-gray-900">${grado} (${anolectivo})</span>
                        <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${statusBadge}">${statusText}</span>
                    </div>
                    <div class="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div class="p-1.5 bg-gray-50 rounded-lg">
                            <span class="text-gray-400 block font-bold">Capacidad</span>
                            <span class="font-black text-gray-800 text-sm">${res.capacidadMaxima}</span>
                        </div>
                        <div class="p-1.5 bg-blue-50 rounded-lg">
                            <span class="text-blue-600 block font-bold">Matriculados</span>
                            <span class="font-black text-blue-800 text-sm">${res.inscritosActuales}</span>
                        </div>
                        <div class="p-1.5 bg-indigo-50 rounded-lg">
                            <span class="text-indigo-600 block font-bold">Reservados</span>
                            <span class="font-black text-indigo-800 text-sm">${res.plazasReservadas || 0}</span>
                        </div>
                        <div class="p-1.5 bg-green-50 rounded-lg">
                            <span class="text-green-600 block font-bold">Disponibles</span>
                            <span class="font-black text-green-800 text-sm">${res.cuposDisponibles}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `<p class="text-red-500 font-medium">Error al consultar capacidad: ${((res && res.message) || 'Error del servidor')}</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-red-500 font-medium">Error de conexión: ${err.message}</p>`;
    }
};

window.loadAdmissionEvaluations = async function(solicitudId) {
    const container = document.getElementById('modal-adm-evaluations-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Cargando evaluaciones...</p>`;

    try {
        const res = await window.fetchApi('ACADEMIC', 'getAdmissionEvaluations', { solicitudId });
        if (res && res.status === 'success' && Array.isArray(res.evaluations) && res.evaluations.length > 0) {
            container.innerHTML = res.evaluations.map(e => {
                let badgeClass = "bg-green-100 text-green-800 border-green-200";
                if (e.dictamen === 'Reprobado') badgeClass = "bg-red-100 text-red-800 border-red-200";
                if (e.dictamen === 'Pendiente') badgeClass = "bg-amber-100 text-amber-800 border-amber-200";

                return `
                    <div class="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-1">
                        <div class="flex justify-between items-center">
                            <strong class="text-gray-900">${e.tipoEvaluacion} ${e.esObligatoria ? '<span class="text-red-500 font-bold">*</span>' : ''}</strong>
                            <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${badgeClass}">${e.dictamen}</span>
                        </div>
                        <p class="text-[10px] text-gray-500">Puntaje: ${e.puntajeNum} pts (${e.escalaQual || 'Standard'}) | Evaluador: ${e.evaluadorUserId}</p>
                        ${e.observaciones ? `<p class="text-[10px] text-gray-600 bg-gray-50 p-1.5 rounded-lg">${e.observaciones}</p>` : ''}
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `<p class="text-gray-400 italic">No se han registrado evaluaciones de ingreso.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
};

window.promptSaveEvaluation = async function() {
    const solicitudId = window.currentActiveSolicitudId;
    if (!solicitudId) return;

    const tipoEvaluacion = prompt("Tipo de Evaluación (Examen de Admisión / Diagnóstico Psicopedagógico):", "Examen de Admisión");
    if (!tipoEvaluacion) return;

    const puntajeNum = parseFloat(prompt("Puntaje Obtenido (0 - 100):", "85")) || 0;
    const dictamen = prompt("Dictamen Final (Aprobado / Reprobado / Pendiente):", puntajeNum >= 70 ? "Aprobado" : "Reprobado") || "Aprobado";
    const esObligatoria = confirm("¿Es esta una evaluación obligatoria para la admisión?");
    const observaciones = prompt("Observaciones / Dictamen Pedagógico:", "Cumple con los requisitos académicos de ingreso.") || "";

    try {
        const res = await window.fetchApi('ACADEMIC', 'saveAdmissionEvaluation', {
            solicitudId, tipoEvaluacion, puntajeNum, dictamen, esObligatoria, observaciones
        });

        if (res && res.status === 'success') {
            alert("Evaluación registrada correctamente.");
            window.loadAdmissionEvaluations(solicitudId);
        } else {
            alert("Error al registrar evaluación: " + ((res && res.message) || "Inconveniente del servidor."));
        }
    } catch (err) {
        alert("Error de red: " + err.message);
    }
};

// [TAREA-F5-008] [Fase 5: Admisiones y Matrícula] - Controladores de interfaz para Lista de Espera de Admisión
window.loadAdmissionWaitlistStatus = async function(solicitudId) {
    const container = document.getElementById('modal-adm-waitlist-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Consultando lista de espera...</p>`;

    try {
        const res = await window.fetchApi('ACADEMIC', 'getWaitlist', {});
        if (res && res.status === 'success' && Array.isArray(res.waitlist)) {
            const match = res.waitlist.find(w => String(w.solicitudId).trim() === String(solicitudId).trim());
            if (match) {
                let badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                if (match.estadoOferta === 'Plaza_Ofrecida') badgeClass = "bg-indigo-100 text-indigo-800 border-indigo-200";
                if (match.estadoOferta === 'Oferta_Aceptada') badgeClass = "bg-green-100 text-green-800 border-green-200";
                if (match.estadoOferta === 'Oferta_Rechazada') badgeClass = "bg-red-100 text-red-800 border-red-200";

                container.innerHTML = `
                    <div class="p-3 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
                        <div class="flex justify-between items-center">
                            <strong class="text-gray-900">Posición #${match.posicion} (Puntaje Prioridad: ${match.puntajePrioridad} pts)</strong>
                            <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${badgeClass}">${match.estadoOferta}</span>
                        </div>
                        ${match.fechaExpiracionOferta ? `<p class="text-[10px] text-indigo-700">Vigencia oferta hasta: ${new Date(match.fechaExpiracionOferta).toLocaleString('es-HN')}</p>` : ''}
                        ${match.justificacionManual ? `<p class="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-lg">${match.justificacionManual}</p>` : ''}
                        <div class="flex gap-2 justify-end pt-1">
                            ${match.estadoOferta === 'En_Espera' ? `
                                <button onclick="window.offerWaitlistSlotAction('${match.esperaId}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[10px] uppercase"><i class="fa-solid fa-gift"></i> Ofrecer Vacante</button>
                                <button onclick="window.reorderWaitlistAction('${match.esperaId}')" class="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-[10px] uppercase"><i class="fa-solid fa-arrow-up-down"></i> Reordenar</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `<p class="text-gray-400 italic">Esta solicitud no ha sido ingresada a la lista de espera.</p>`;
            }
        } else {
            container.innerHTML = `<p class="text-gray-400 italic">Lista de espera vacía.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
};

window.promptAddToWaitlist = async function() {
    const solicitudId = window.currentActiveSolicitudId;
    if (!solicitudId) return;

    const tieneHermanos = confirm("¿Tiene hermanos matriculados en la institución?");
    const esHijoExalumno = confirm("¿Es hijo de exalumnos de la institución?");
    const esHijoPersonal = confirm("¿Es hijo de personal docente o administrativo?");

    const criteriosJSON = {
        tieneHermanosMatriculados: tieneHermanos,
        esHijoExalumno: esHijoExalumno,
        esHijoPersonal: esHijoPersonal
    };

    try {
        const res = await window.fetchApi('ACADEMIC', 'addToWaitlist', {
            solicitudId, criteriosJSON
        });

        if (res && res.status === 'success') {
            alert(res.message || "Incorporado a lista de espera.");
            window.loadAdmissionWaitlistStatus(solicitudId);
        } else {
            alert("Error: " + ((res && res.message) || "Error desconocido"));
        }
    } catch (err) {
        alert("Error de red: " + err.message);
    }
};

window.offerWaitlistSlotAction = async function(esperaId) {
    const horas = prompt("Horas de vigencia para responder la oferta (ej. 48 o 72):", "72");
    if (!horas) return;

    try {
        const res = await window.fetchApi('ACADEMIC', 'offerWaitlistSlot', {
            esperaId, horasVigencia: horas
        });

        if (res && res.status === 'success') {
            alert("Plaza ofrecida exitosamente a la familia.");
            if (window.currentActiveSolicitudId) window.loadAdmissionWaitlistStatus(window.currentActiveSolicitudId);
        } else {
            alert("Error: " + ((res && res.message) || "Error del servidor."));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
};

window.reorderWaitlistAction = async function(esperaId) {
    const nuevaPosicion = parseInt(prompt("Ingrese la nueva posición numérica en la lista:", "1"), 10);
    if (isNaN(nuevaPosicion) || nuevaPosicion < 1) return;

    const justificacionManual = prompt("Justificación obligatoria de Dirección/Secretaría (mínimo 10 caracteres):", "");
    if (!justificacionManual || justificacionManual.trim().length < 10) {
        alert("Justificación obligatoria requerida de al menos 10 caracteres.");
        return;
    }

    try {
        const res = await window.fetchApi('ACADEMIC', 'reorderWaitlist', {
            esperaId, nuevaPosicion, justificacionManual
        });

        if (res && res.status === 'success') {
            alert("Posición en lista de espera reordenada.");
            if (window.currentActiveSolicitudId) window.loadAdmissionWaitlistStatus(window.currentActiveSolicitudId);
        } else {
            alert("Error: " + ((res && res.message) || "Error del servidor."));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
};
