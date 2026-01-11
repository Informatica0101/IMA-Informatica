// ... (código anterior sin cambios) ...

    // --- Lógica de Entregas y Calificación ---
    async function fetchTeacherActivity() {
        submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Cargando...</td></tr>';
        try {
            const result = await fetchApi('getTeacherActivity', {});
            if (result.status === 'success') {
                renderActivity(result.data);
            } else { throw new Error(result.message); }
        } catch (error) {
            submissionsTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-red-500">Error: ${error.message}</td></tr>`;
        }
    }

    function renderActivity(activity) {
        if (!activity || activity.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No hay actividad.</td></tr>';
            return;
        }
        submissionsTableBody.innerHTML = activity.map(item => {
            let actionHtml = '';
            if (item.tipo === 'Tarea') {
                actionHtml = `<button class="bg-blue-500 text-white px-2 py-1 rounded" onclick='openGradeModal(${JSON.stringify(item)})'>Calificar</button>`;
            } else if (item.tipo === 'Examen' && item.estado === 'Bloqueado') {
                actionHtml = `<button class="bg-yellow-500 text-white px-2 py-1 rounded" onclick='reactivateExam("${item.entregaId}")'>Reactivar</button>`;
            }

            return `
                <tr class="border-b">
                    <td class="p-4">${item.alumnoNombre}</td>
                    <td class="p-4">${item.titulo} (${item.tipo})</td>
                    <td class="p-4">${item.fecha}</td>
                    <td class="p-4">${item.archivoUrl ? `<a href="${item.archivoUrl}" target="_blank" class="text-blue-500">Ver Archivo</a>` : 'N/A'}</td>
                    <td class="p-4">${item.calificacion || 'N/A'}</td>
                    <td class="p-4">${item.estado || 'Pendiente'}</td>
                    <td class="p-4">${actionHtml}</td>
                </tr>
            `;
        }).join('');
    }

    window.reactivateExam = async (entregaExamenId) => {
        if (!confirm("¿Estás seguro de que quieres reactivar este examen para el estudiante?")) return;
        try {
            const result = await fetchApi('reactivateExam', { entregaExamenId });
            if (result.status === 'success') {
                alert('Examen reactivado.');
                fetchTeacherActivity();
            } else { throw new Error(result.message); }
        } catch (error) { alert(`Error: ${error.message}`); }
    };

// ... (resto del código, asegurándose de llamar a fetchTeacherActivity en lugar de fetchSubmissions) ...
