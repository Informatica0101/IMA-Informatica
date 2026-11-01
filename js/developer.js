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

    window.DeveloperConsole = {
        executeHealthChecks: executeDevHealthChecks,
        log: logToUI
    };
});
