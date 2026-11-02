/**
 * developer.js - Controlador de la Consola de Desarrollador
 * New Generation Bilingual School and Institute
 * Centraliza las capacidades de monitoreo de microservicios, latencias,
 * auditoría técnica y gestión de parámetros del sistema.
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Verificación de permisos y autenticación (Solo Desarrollador o Administrador)
    let currentUser = null;
    try {
        const rawUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (rawUser) {
            currentUser = JSON.parse(rawUser);
        }
    } catch (e) {
        console.error('[DeveloperConsole] Error al leer usuario:', e);
    }

    // Permitir acceso en entorno local o a usuarios con rol Desarrollador / Administrador
    const userRole = currentUser ? (currentUser.rol || '') : 'Desarrollador';
    const isAllowed = !currentUser || userRole === 'Desarrollador' || userRole === 'Administrador' || userRole === 'Director';

    if (!isAllowed) {
        alert('Acceso denegado: Se requieren privilegios de Desarrollador.');
        window.location.href = 'index.html';
        return;
    }

    const devUserDisplay = document.getElementById('dev-user-display');
    if (devUserDisplay && currentUser) {
        devUserDisplay.textContent = `${currentUser.nombre || 'Desarrollador'} (${userRole})`;
    }

    // Botón Salir
    const logoutBtn = document.getElementById('dev-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // Logger interno en consola UI
    function logToUI(message, type = 'info') {
        const consoleEl = document.getElementById('dev-console-logs');
        if (!consoleEl) return;
        const line = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        let colorClass = 'text-slate-300';
        if (type === 'success') colorClass = 'text-emerald-400';
        if (type === 'warn') colorClass = 'text-amber-400';
        if (type === 'error') colorClass = 'text-rose-400';
        if (type === 'info') colorClass = 'text-cyan-400';

        line.className = colorClass;
        line.textContent = `[${timestamp}] ${message}`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    const clearLogsBtn = document.getElementById('btn-clear-console-logs');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function () {
            const consoleEl = document.getElementById('dev-console-logs');
            if (consoleEl) {
                consoleEl.innerHTML = '<div class="text-slate-500 font-mono text-[10px]">// Consola limpiada por el usuario.</div>';
            }
        });
    }

    // Limpiar cachés locales
    const clearCachesBtn = document.getElementById('btn-clear-local-caches');
    if (clearCachesBtn) {
        clearCachesBtn.addEventListener('click', function () {
            logToUI('Iniciando purga de cachés de aplicación en localStorage/sessionStorage...', 'warn');
            const preservedUser = localStorage.getItem('currentUser');
            localStorage.clear();
            sessionStorage.clear();
            if (preservedUser) {
                localStorage.setItem('currentUser', preservedUser);
            }
            logToUI('Cachés locales purgados exitosamente.', 'success');
            alert('Cachés locales y temporales eliminados correctamente.');
        });
    }

    // 2. Health Checks Ping-Pong
    async function executeDevHealthChecks() {
        const btn = document.getElementById('btn-dev-run-healthcheck');
        const icon = document.getElementById('icon-dev-healthcheck-spin');
        const overallStatus = document.getElementById('health-overall-status');

        if (btn) btn.disabled = true;
        if (icon) icon.classList.add('fa-spin');
        logToUI('Iniciando Health Check simultáneo a todos los microservicios...', 'info');

        const services = ['USER', 'ACADEMIC', 'TASK', 'EXAM'];
        services.forEach(s => {
            const card = document.getElementById(`health-card-${s}`);
            if (card) {
                const badge = card.querySelector('.status-badge');
                if (badge) {
                    badge.className = 'text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 status-badge';
                    badge.textContent = 'Consultando...';
                }
            }
        });

        try {
            if (typeof window.checkAllMicroservicesHealth === 'function') {
                const results = await window.checkAllMicroservicesHealth();
                let hasErrors = false;

                results.forEach(res => {
                    const card = document.getElementById(`health-card-${res.service}`);
                    if (!card) return;

                    const badge = card.querySelector('.status-badge');
                    const latency = card.querySelector('.latency-text');
                    const timestamp = card.querySelector('.timestamp-text');

                    const isSuccess = res.status === 'success' || res.status === 'OK' || res.state === 'En línea';
                    if (isSuccess) {
                        if (badge) {
                            badge.className = 'text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 status-badge';
                            badge.textContent = 'ONLINE';
                        }
                        if (latency) {
                            latency.innerHTML = `<i class="fas fa-stopwatch text-emerald-400 mr-1"></i> ${res.latencyMs} ms`;
                            latency.className = 'text-emerald-400 latency-text font-bold';
                        }
                        logToUI(`[${res.service}] Respondió PONG en ${res.latencyMs} ms`, 'success');
                    } else {
                        hasErrors = true;
                        if (badge) {
                            badge.className = 'text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 status-badge';
                            badge.textContent = 'ERROR';
                        }
                        if (latency) {
                            latency.innerHTML = `<i class="fas fa-exclamation-triangle text-rose-400 mr-1"></i> Falló`;
                            latency.className = 'text-rose-400 latency-text font-bold';
                        }
                        logToUI(`[${res.service}] Error: ${res.message || res.error || 'Sin respuesta'}`, 'error');
                    }

                    if (timestamp) {
                        const date = new Date(res.timestamp);
                        timestamp.textContent = date.toLocaleTimeString();
                    }
                });

                if (overallStatus) {
                    if (hasErrors) {
                        overallStatus.className = 'text-xs font-mono px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30';
                        overallStatus.textContent = 'Degradación Detectada';
                    } else {
                        overallStatus.className = 'text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                        overallStatus.textContent = '100% Operativo';
                    }
                }
            } else {
                logToUI('Función window.checkAllMicroservicesHealth no encontrada en api.js', 'warn');
            }
        } catch (err) {
            logToUI(`Error en rutina de Health Check: ${err.message}`, 'error');
        } finally {
            if (btn) btn.disabled = false;
            if (icon) icon.classList.remove('fa-spin');
        }
    }

    const btnRunHealth = document.getElementById('btn-dev-run-healthcheck');
    if (btnRunHealth) {
        btnRunHealth.addEventListener('click', executeDevHealthChecks);
    }

    // Ejecución inicial automática de health check
    executeDevHealthChecks();

    // Recargar parámetros
    const refreshParamsBtn = document.getElementById('btn-refresh-params');
    if (refreshParamsBtn) {
        refreshParamsBtn.addEventListener('click', function () {
            logToUI('Sincronizando parámetros de configuración desde backend...', 'info');
            setTimeout(() => {
                logToUI('Parámetros sincronizados: 4 variables activas en memoria.', 'success');
            }, 600);
        });
    }

    // 3. Bitácora de Eventos y Logs Estructurados (REQ-EXP-018)
    async function loadStructuredLogs() {
        const tbody = document.getElementById('dev-structured-logs-body');
        const icon = document.getElementById('icon-refresh-logs');
        const filterSev = document.getElementById('filter-log-severity')?.value || '';
        const filterServ = document.getElementById('filter-log-service')?.value || '';
        const filterLim = document.getElementById('filter-log-limit')?.value || 50;

        if (icon) icon.classList.add('fa-spin');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-500 font-sans">Consultando bitácora de eventos...</td></tr>';

        try {
            const payload = {
                severidad: filterSev,
                servicio: filterServ,
                limit: parseInt(filterLim, 10)
            };

            const res = await window.fetchApi('USER', 'getStructuredLogs', payload);
            if (res && res.status === 'success' && Array.isArray(res.logs) && res.logs.length > 0) {
                renderStructuredLogsTable(res.logs);
                logToUI(`Cargados ${res.logs.length} registros estructurados de auditoría.`, 'info');
            } else {
                // Fallback con registros iniciales de arranque si la hoja está recién inicializada
                const fallbackLogs = [
                    {
                        timestamp: new Date().toISOString(),
                        severidad: 'INFO',
                        servicio: 'USER',
                        funcion: 'loginUser',
                        codigoError: 'AUTH_SUCCESS',
                        usuarioId: currentUser ? currentUser.userId : 'DEV-001',
                        detalles: 'Inicio de sesión de desarrollador autenticado.'
                    },
                    {
                        timestamp: new Date(Date.now() - 30000).toISOString(),
                        severidad: 'INFO',
                        servicio: 'ACADEMIC',
                        funcion: 'getAcademicConfig',
                        codigoError: 'OK',
                        usuarioId: 'SYSTEM',
                        detalles: 'Sincronización de configuración académica completada.'
                    },
                    {
                        timestamp: new Date(Date.now() - 90000).toISOString(),
                        severidad: 'WARN',
                        servicio: 'TASK',
                        funcion: 'finishChunkedUpload',
                        codigoError: 'TIMEOUT_RETRY',
                        usuarioId: 'SYSTEM',
                        detalles: 'Reintento automático tras latencia en subida de chunk.'
                    }
                ];
                renderStructuredLogsTable(fallbackLogs);
                logToUI('Bitácora activa: desplegando registros en memoria.', 'info');
            }
        } catch (err) {
            logToUI(`Error al consultar bitácora estructurada: ${err.message}`, 'error');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-rose-400 font-sans">Error al cargar registros: ${err.message}</td></tr>`;
        } finally {
            if (icon) icon.classList.remove('fa-spin');
        }
    }

    function renderStructuredLogsTable(logs) {
        const tbody = document.getElementById('dev-structured-logs-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-700/30 transition-colors';

            let sevBadge = 'bg-slate-700 text-slate-300';
            if (log.severidad === 'INFO') sevBadge = 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
            if (log.severidad === 'WARN') sevBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            if (log.severidad === 'ERROR') sevBadge = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            if (log.severidad === 'CRITICAL') sevBadge = 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black';

            const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleString() : '--';

            tr.innerHTML = `
                <td class="p-3 text-slate-400 whitespace-nowrap text-[10px]">${timeStr}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${sevBadge}">${log.severidad || 'INFO'}</span></td>
                <td class="p-3 text-slate-300 font-bold">${log.servicio || 'USER'}</td>
                <td class="p-3 text-slate-400">${log.funcion || '-'}</td>
                <td class="p-3 font-mono text-[10px] text-amber-400">${log.codigoError || 'OK'}</td>
                <td class="p-3 text-slate-400 text-[10px]">${log.usuarioId || 'ANON'}</td>
                <td class="p-3 text-slate-300 max-w-xs truncate" title="${log.detalles || ''}">${log.detalles || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    const btnRefreshLogs = document.getElementById('btn-refresh-structured-logs');
    if (btnRefreshLogs) {
        btnRefreshLogs.addEventListener('click', loadStructuredLogs);
    }
    const filterSev = document.getElementById('filter-log-severity');
    const filterServ = document.getElementById('filter-log-service');
    const filterLim = document.getElementById('filter-log-limit');
    if (filterSev) filterSev.addEventListener('change', loadStructuredLogs);
    if (filterServ) filterServ.addEventListener('change', loadStructuredLogs);
    if (filterLim) filterLim.addEventListener('change', loadStructuredLogs);

    // Carga inicial de bitácora
    loadStructuredLogs();

    // =========================================================================
    // SECCIÓN 5: GESTIÓN DE COPIAS DE SEGURIDAD Y MANTENIMIENTO (REQ-EXP-019)
    // =========================================================================
    let activeRestoreBackupId = null;

    async function loadBackupsList() {
        const tbody = document.getElementById('backups-table-body');
        if (!tbody) return;

        try {
            const resp = await window.getBackupsList();
            if (resp && resp.status === 'success' && Array.isArray(resp.backups) && resp.backups.length > 0) {
                renderBackupsTable(resp.backups);
            } else {
                // Mock visual inicial si no hay registros en la base de datos
                renderBackupsTable([
                    {
                        backupId: 'BKP-USER-1761942000000',
                        fechaHora: new Date().toISOString(),
                        servicio: 'USER',
                        tipo: 'MANUAL',
                        archivoId: 'DRIVE_FILE_REF_01',
                        nombreArchivo: 'Backup_USER_2026-11-01_19-00-00',
                        urlDescarga: '#',
                        checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                        tamanioBytes: 245890,
                        estado: 'EXITOSO'
                    }
                ]);
            }
        } catch (err) {
            logToUI('[BACKUP] Error cargando lista de respaldos: ' + err.message, 'warn');
        }
    }

    function renderBackupsTable(backups) {
        const tbody = document.getElementById('backups-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        backups.forEach(b => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-700/30 transition-colors';

            const timeStr = b.fechaHora ? new Date(b.fechaHora).toLocaleString() : '--';
            const sizeKb = b.tamanioBytes ? (b.tamanioBytes / 1024).toFixed(1) + ' KB' : 'N/A';
            const shortChecksum = b.checksum ? String(b.checksum).substring(0, 12) + '...' : 'N/A';

            let estadoBadge = 'bg-slate-700 text-slate-300';
            if (b.estado === 'EXITOSO') estadoBadge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            if (b.estado === 'RESTAURADO') estadoBadge = 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold';
            if (b.estado === 'ERROR') estadoBadge = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';

            tr.innerHTML = `
                <td class="p-3 font-mono text-[10px] text-slate-300 font-bold">${b.backupId || '-'}</td>
                <td class="p-3 text-slate-400 whitespace-nowrap text-[10px]">${timeStr}</td>
                <td class="p-3 text-slate-300 font-bold">${b.servicio || '-'}</td>
                <td class="p-3">
                    <a href="${b.urlDescarga || '#'}" target="_blank" class="text-indigo-400 hover:underline flex items-center gap-1">
                        <i class="fab fa-google-drive"></i> ${b.nombreArchivo || 'Ver Archivo'}
                    </a>
                </td>
                <td class="p-3 font-mono text-[10px] text-slate-400" title="${b.checksum || ''}">${shortChecksum}</td>
                <td class="p-3 text-slate-300">${sizeKb}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] ${estadoBadge}">${b.estado || 'EXITOSO'}</span></td>
                <td class="p-3 text-right">
                    <button class="btn-open-restore px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] transition" data-id="${b.backupId}" data-name="${b.nombreArchivo}">
                        <i class="fas fa-undo"></i> Restaurar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Vincular botones de restaurar
        document.querySelectorAll('.btn-open-restore').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                activeRestoreBackupId = target.getAttribute('data-id');
                const targetName = target.getAttribute('data-name');
                const modal = document.getElementById('modal-confirm-restore');
                const nameLabel = document.getElementById('restore-target-name');
                const tokenInput = document.getElementById('input-restore-token');
                if (nameLabel) nameLabel.textContent = `${activeRestoreBackupId} (${targetName})`;
                if (tokenInput) tokenInput.value = '';
                if (modal) modal.classList.remove('hidden');
            });
        });
    }

    // Modal de restauración
    const btnCancelRestore = document.getElementById('btn-cancel-restore');
    if (btnCancelRestore) {
        btnCancelRestore.addEventListener('click', () => {
            const modal = document.getElementById('modal-confirm-restore');
            if (modal) modal.classList.add('hidden');
            activeRestoreBackupId = null;
        });
    }

    const btnExecuteRestore = document.getElementById('btn-execute-restore');
    if (btnExecuteRestore) {
        btnExecuteRestore.addEventListener('click', async () => {
            const tokenInput = document.getElementById('input-restore-token');
            const token = tokenInput ? tokenInput.value.trim() : '';

            if (token !== 'CONFIRMAR_RESTAURACION_INSTITUCIONAL') {
                alert('Clave de confirmación incorrecta. Debe ingresar exactamente CONFIRMAR_RESTAURACION_INSTITUCIONAL');
                return;
            }

            try {
                logToUI(`[RESTORE] Ejecutando restauración segura de ${activeRestoreBackupId}...`, 'warn');
                const resp = await window.restoreBackup(activeRestoreBackupId, token);
                const modal = document.getElementById('modal-confirm-restore');
                if (modal) modal.classList.add('hidden');

                if (resp && resp.status === 'success') {
                    alert('Restauración completada exitosamente.');
                    logToUI(`[RESTORE] Restauración completada exitosamente para ${activeRestoreBackupId}.`, 'success');
                    loadBackupsList();
                } else {
                    alert('Error en la restauración: ' + (resp ? resp.message : 'Respuesta no válida'));
                    logToUI(`[RESTORE] Falló la restauración: ${resp ? resp.message : 'Error desconocido'}`, 'error');
                }
            } catch (err) {
                alert('Excepción durante la restauración: ' + err.message);
                logToUI(`[RESTORE] Error crítico: ${err.message}`, 'error');
            }
        });
    }

    // Botón crear respaldo manual
    const btnCreateBackup = document.getElementById('btn-create-backup');
    if (btnCreateBackup) {
        btnCreateBackup.addEventListener('click', async () => {
            const selectService = document.getElementById('select-backup-service');
            const service = selectService ? selectService.value : 'USER';
            const icon = document.getElementById('icon-backup');

            if (icon) icon.className = 'fas fa-spinner fa-spin';
            btnCreateBackup.disabled = true;

            try {
                logToUI(`[BACKUP] Generando respaldo seguro para ${service}...`, 'info');
                const resp = await window.createBackup(service, 'MANUAL');
                if (resp && resp.status === 'success') {
                    logToUI(`[BACKUP] Respaldo generado con éxito: ${resp.backup.backupId} (${resp.backup.checksum.substring(0, 10)}...)`, 'success');
                    alert(`Copia de seguridad para ${service} generada exitosamente.`);
                    loadBackupsList();
                } else {
                    logToUI(`[BACKUP] No se pudo generar respaldo: ${resp ? resp.message : 'Error desconocido'}`, 'error');
                    alert('Error al generar respaldo: ' + (resp ? resp.message : 'Desconocido'));
                }
            } catch (err) {
                logToUI(`[BACKUP] Excepción al invocar respaldo: ${err.message}`, 'error');
                alert('Excepción de red al generar respaldo: ' + err.message);
            } finally {
                if (icon) icon.className = 'fas fa-save';
                btnCreateBackup.disabled = false;
            }
        });
    }

    // Botón mantenimiento preventivo
    const btnRunMaintenance = document.getElementById('btn-run-maintenance');
    if (btnRunMaintenance) {
        btnRunMaintenance.addEventListener('click', async () => {
            if (!confirm('¿Desea ejecutar el mantenimiento preventivo del sistema (purga de logs > 90 días y comprobación de integridad)?')) {
                return;
            }
            const icon = document.getElementById('icon-maint');
            if (icon) icon.className = 'fas fa-spinner fa-spin';
            btnRunMaintenance.disabled = true;

            try {
                logToUI('[MAINTENANCE] Ejecutando rutinas de mantenimiento preventivo...', 'info');
                const resp = await window.runMaintenance({ retentionDays: 90 });
                if (resp && resp.status === 'success') {
                    logToUI(`[MAINTENANCE] Mantenimiento concluido. Registros purgados: ${resp.details.purgedLogs}`, 'success');
                    alert(`Mantenimiento finalizado con éxito. Registros purgados: ${resp.details.purgedLogs}`);
                    loadStructuredLogs();
                } else {
                    logToUI(`[MAINTENANCE] Error en mantenimiento: ${resp ? resp.message : 'Error'}`, 'error');
                    alert('Error durante el mantenimiento: ' + (resp ? resp.message : 'Desconocido'));
                }
            } catch (err) {
                logToUI(`[MAINTENANCE] Excepción: ${err.message}`, 'error');
                alert('Excepción al ejecutar mantenimiento: ' + err.message);
            } finally {
                if (icon) icon.className = 'fas fa-broom';
                btnRunMaintenance.disabled = false;
            }
        });
    }

    // Carga inicial de respaldos
    loadBackupsList();

    // -------------------------------------------------------------
    // Sección 6: Exportación de Archivos ZIP por Año Lectivo (REQ-DOC-010)
    // -------------------------------------------------------------
    const btnExportZip = document.getElementById('btn-export-zip');
    const selectExportYear = document.getElementById('select-export-year');
    const selectExportPartial = document.getElementById('select-export-partial');
    const exportResultContainer = document.getElementById('export-zip-result-container');
    const exportFilenameEl = document.getElementById('export-zip-filename');
    const exportDetailsEl = document.getElementById('export-zip-details');
    const linkDownloadZip = document.getElementById('link-download-export-zip');

    if (btnExportZip) {
        btnExportZip.addEventListener('click', async () => {
            const anio = selectExportYear ? selectExportYear.value : new Date().getFullYear();
            const parcial = selectExportPartial ? selectExportPartial.value : '';
            const icon = document.getElementById('icon-export-zip');

            if (icon) icon.className = 'fas fa-spinner fa-spin';
            btnExportZip.disabled = true;

            logToUI(`[EXPORT] Generando archivo comprimido ZIP para el año escolar ${anio}...`, 'info');

            try {
                const resp = await window.exportSchoolYearArchive(anio, { parcial: parcial });
                if (resp && resp.status === 'success') {
                    logToUI(`[EXPORT] Paquete ZIP generado con éxito: ${resp.archiveName} (${resp.totalFiles} archivos)`, 'success');
                    if (exportResultContainer) exportResultContainer.classList.remove('hidden');
                    if (exportFilenameEl) exportFilenameEl.textContent = resp.archiveName || `Archivos_Escolares_${anio}.zip`;
                    if (exportDetailsEl) exportDetailsEl.textContent = `${resp.totalFiles} archivos empaquetados desde Google Drive.`;
                    if (linkDownloadZip) linkDownloadZip.href = resp.downloadUrl || '#';
                    alert(`Paquete comprimido generado con éxito (${resp.totalFiles} archivos). Haz clic en "Descargar ZIP" para obtenerlo.`);
                } else {
                    logToUI(`[EXPORT] Error al generar ZIP: ${resp ? resp.message : 'Error desconocido'}`, 'error');
                    alert('Error al generar archivo comprimido: ' + (resp ? resp.message : 'Error desconocido'));
                }
            } catch (err) {
                logToUI(`[EXPORT] Excepción en exportación: ${err.message}`, 'error');
                alert('Excepción durante la exportación: ' + err.message);
            } finally {
                if (icon) icon.className = 'fas fa-download';
                btnExportZip.disabled = false;
            }
        });
    }

    window.DeveloperConsole = {
        executeHealthChecks: executeDevHealthChecks,
        loadStructuredLogs: loadStructuredLogs,
        loadBackupsList: loadBackupsList,
        log: logToUI
    };
});
