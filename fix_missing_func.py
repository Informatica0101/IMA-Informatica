with open('js/teacher.js', 'r') as f:
    content = f.read()

# I might have accidentally replaced it or it was not saved properly due to multi-step replacement.
# Let's re-insert fetchEntregasRecientes (Operational Dashboard)

op_logic = '''
    async function fetchEntregasRecientes() {
        const tbody = document.getElementById('op-table-body');
        const thead = document.getElementById('op-table-head');
        if (!tbody || !thead) return;
        tbody.innerHTML = '<tr><td class="text-center p-8">Cargando pendientes...</td></tr>';

        try {
            const res = await fetchApi('TASK', 'getTeacherActivity', { profesorId: currentUser.userId });
            if (res.status === 'success') {
                const pending = (res.data || []).filter(i =>
                    (i.estado === 'Pendiente' || i.estado === 'Pendiente de revisión' || !i.estado) &&
                    (i.fileId || i.respuestas || i.entregaId)
                );

                thead.innerHTML = `<tr class="bg-gray-50 border-b border-gray-100">
                    <th class="p-4 text-left font-bold text-gray-500 text-[0.7rem] uppercase">Alumno</th>
                    <th class="p-4 text-left font-bold text-gray-500 text-[0.7rem] uppercase">Actividad</th>
                    <th class="p-4 text-left font-bold text-gray-500 text-[0.7rem] uppercase">Fecha</th>
                    <th class="p-4 text-right font-bold text-gray-500 text-[0.7rem] uppercase">Acción</th>
                </tr>`;

                if (pending.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8 text-gray-500">No hay tareas pendientes de revisión. ¡Buen trabajo!</td></tr>';
                    return;
                }

                tbody.innerHTML = pending.map((item, idx) => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4">
                            <div class="font-bold text-gray-800">${item.alumnoNombre}</div>
                            <div class="text-[10px] text-gray-400">${item.grado} - ${item.seccion}</div>
                        </td>
                        <td class="p-4">
                            <div class="font-bold text-blue-700">${item.titulo}</div>
                            <div class="text-[10px] text-gray-400">${item.asignatura} | ${item.tipo}</div>
                        </td>
                        <td class="p-4 text-xs text-gray-500">${new Date(item.fecha).toLocaleString()}</td>
                        <td class="p-4 text-right">
                            <button class="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 op-grade-btn" data-index="${idx}">Calificar</button>
                        </td>
                    </tr>
                `).join('');

                tbody.querySelectorAll('.op-grade-btn').forEach(btn => {
                    btn.onclick = () => {
                        const item = pending[btn.dataset.index];
                        openGradeModal(item);
                    };
                });
            }
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-red-500">Error: ${e.message}</td></tr>`;
        }
    }
'''

# Insert it before fetchTeacherActivity
content = content.replace('    async function fetchTeacherActivity() {', op_logic + '\n\n    async function fetchTeacherActivity() {')

with open('js/teacher.js', 'w') as f:
    f.write(content)
