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
