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
