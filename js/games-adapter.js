/**
 * Adaptador Unificado para Minijuegos (Fase 1)
 */
window.GamesAdapter = {
    // REQ: Mensajes dinámicos de carga
    loadingMessages: [
        "Cargando estadísticas...",
        "Preparando actividad...",
        "Calculando progreso académico...",
        "Obteniendo ranking global...",
        "Analizando desempeño anterior..."
    ],

    state: {
        currentSession: null,
        currentUser: null,
        personalRecords: {},
        currentStreak: 0
    },

    // REQ: Acceso resiliente a sesión
    getCurrentUser: function() {
        if (this.state.currentUser) return this.state.currentUser;
        var raw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (raw) {
            try {
                this.state.currentUser = JSON.parse(raw);
                return this.state.currentUser;
            } catch(e) {}
        }
        return null;
    },

    // REQ: Gamificación Estandarizada v7.6 (Rebalanceo Global)
    XP_CONFIG: {
        BASE: 40,
        FACTORS: {
            basico: 0.8,
            intermedio: 1.1,
            avanzado: 1.4,
            especial: 1.6
        },
        TIME: {
            MIN: 3000,
            OPTIMAL: 10000,
            MAX: 20000
        },
        STREAK: {
            BONUS_PER_HIT: 0.03,
            MAX: 1.2
        },
        RANGES: [
            { label: 'Básico', min: 0, max: 1000 },
            { label: 'Promedio', min: 1001, max: 3500 },
            { label: 'Avanzado', min: 3501, max: 9000 },
            { label: 'Experto', min: 9001, max: 20000 },
            { label: 'Maestro', min: 20001, max: 45000 },
            { label: 'Leyenda', min: 45001, max: Infinity }
        ]
    },

    /**
     * Calcula XP basada en desempeño psicométrico (v7.6)
     */
    calculateXP(isCorrect, level, responseTime, gameId) {
        if (!isCorrect) {
            this.state.currentStreak = 0;
            return 0;
        }

        this.state.currentStreak++;

        // 1. Factor Dificultad
        const fDificultad = this.XP_CONFIG.FACTORS[(level || "").toLowerCase()] || 1.0;

        // 2. Factor Tiempo (Adivinación / Reflexión)
        let fTiempo = 1.0;
        if (responseTime < this.XP_CONFIG.TIME.MIN) fTiempo = 0.5;
        else if (responseTime <= this.XP_CONFIG.TIME.OPTIMAL) fTiempo = 1.1;
        else {
            const overshoot = responseTime - this.XP_CONFIG.TIME.OPTIMAL;
            const window = this.XP_CONFIG.TIME.MAX - this.XP_CONFIG.TIME.OPTIMAL;
            fTiempo = Math.max(0.7, 1.1 - (overshoot / window) * 0.4);
        }

        // 3. Bono Racha
        const bonoRacha = Math.min(this.XP_CONFIG.STREAK.MAX, 1.0 + (this.state.currentStreak * this.XP_CONFIG.STREAK.BONUS_PER_HIT));

        // 4. Degradación por Repetición Agresiva (Evitar Grinding v7.6)
        const attemptsKey = `attempts_${gameId}_${level}`;
        const prevAttempts = parseInt(localStorage.getItem(attemptsKey) || '0');
        let attemptMultiplier = 1.0;

        if (prevAttempts === 1) attemptMultiplier = 0.4;
        else if (prevAttempts === 2) attemptMultiplier = 0.2;
        else if (prevAttempts >= 3) attemptMultiplier = 0.1;

        const totalXP = Math.round(this.XP_CONFIG.BASE * fDificultad * fTiempo * bonoRacha * attemptMultiplier);

        console.log(`[XP-ADAPTER] +${totalXP} XP (Racha: ${this.state.currentStreak})`);
        return totalXP;
    },

    init: function(gameId, autoHide) {
        if (autoHide === undefined) autoHide = true;
        var self = this;
        console.log("[GamesAdapter] Iniciando sesión para: " + gameId);

        this.getCurrentUser();

        this.state.currentSession = {
            gameId: gameId,
            startTime: Date.now(),
            actions: []
        };
        this.state.currentStreak = 0;
        this.pendingAnalytics = []; // REQ: Reset de promesas pendientes

        var checkCache = function() {
            if (window.PersistenceManager) {
                return window.PersistenceManager.get("academic_stats").then(function(cachedStats) {
        // REQ 2: Optimización de Hidratación. No disparar loader si ya hay datos en caché (0ms logic)
                    return cachedStats && (cachedStats.data || cachedStats.allHistory);
                });
            }
            return Promise.resolve(false);
        };

        return checkCache().then(function(cacheFound) {
            if (!cacheFound) {
                return self.showLoading(true).then(function() { return self.startSync(gameId, autoHide); });
            }
            return self.startSync(gameId, autoHide);
        });
    },

    startSync: function(gameId, autoHide) {
        var self = this;
        // REQ: Pre-carga No Bloqueante (Hallazgo 2)
        // Disparar sincronización en segundo plano sin esperar a la red si hay caché
        try {
            this.getLeaderboard(gameId);
            this.getPersonalRecord();

            var result = {
                lb: this.state.leaderboard || { global: [], subjectTops: {} },
                record: this.state.personalRecords || {}
            };

            if (autoHide) {
                return self.showLoading(false).then(function() { return result; });
            }
            return Promise.resolve(result);
        } catch (e) {
            console.error("[GamesAdapter] Error crítico en init:", e);
            this.state.personalRecords = {};
            var fallback = { lb: { global: [], subjectTops: {} }, record: {} };
            if (autoHide) return self.showLoading(false).then(function() { return fallback; });
            return Promise.resolve(fallback);
        }
    },

    showLoading: function(active = true, container = null) {
        // REQ: Soporte para Spinner Contextual (Ticket 3)
        if (container && active) {
            console.log("[GamesAdapter] Mostrando loader contextual en:", container.id || container.className);
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center p-8 animate-fade-in contextual-loader w-full col-span-full">
                    <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">${this.loadingMessages[Math.floor(Math.random() * this.loadingMessages.length)]}</p>
                </div>
            `;
            return Promise.resolve();
        }

        const overlay = document.getElementById('loading-overlay');
        const msgEl = document.getElementById('loading-msg');
        const bar = document.getElementById('loading-bar');

        if (!overlay) return;

        if (active) {
            overlay.classList.remove('pointer-events-none');
            overlay.classList.add('opacity-100');
            if (bar) bar.style.width = '30%';

            let i = 0;
            this.loadingInterval = setInterval(() => {
                if (msgEl) msgEl.textContent = this.loadingMessages[i % this.loadingMessages.length];
                if (bar) bar.style.width = Math.min(90, 30 + (i * 10)) + '%';
                i++;
            }, 800);
        } else {
            // Limpiar loaders contextuales si existen
            document.querySelectorAll('.contextual-loader').forEach(el => el.remove());

            // REQ 9: Asegurar renderizado final antes de ocultar (Fase 9)
            clearInterval(this.loadingInterval);
            if (bar) bar.style.width = '100%';

            return new Promise(resolve => {
                setTimeout(() => {
                    overlay.classList.add('opacity-0', 'pointer-events-none');
                    overlay.classList.remove('opacity-100');
                    console.log("[GamesAdapter] Loader finalizado. Render completo.");
                    resolve();
                }, 800); // Buffer para suavizar transición visual
            });
        }
    },

    recordAction: function(data) {
        if (!this.state.currentSession) return;

        var action = {};
        for (var k in data) { action[k] = data[k]; }
        action.timestamp = Date.now();
        action.timeFromStart = Date.now() - this.state.currentSession.startTime;
        action.tipoActividad = data.tipoActividad || data.type;

        this.state.currentSession.actions.push(action);

        if (!this.pendingAnalytics) this.pendingAnalytics = [];

        var user = this.getCurrentUser();
        var activeId = user ? user.userId : (window.PersistenceManager ? window.PersistenceManager.getActiveId() : 'GUEST-FALLBACK');

        var payload = {
            userId: activeId,
            grado: user ? user.grado : 'Invitado',
            gameId: this.state.currentSession.gameId,
            gameName: this.state.currentSession.gameId,
            isGuest: !user
        };
        for (var key in action) { payload[key] = action[key]; }

        var promise = fetchApi('USER', 'recordAnalytics', payload).catch(function(e) {
            console.warn("[GamesAdapter] Fallo registro analítico. Guardando localmente...", e);
            if (window.PersistenceManager) {
                window.PersistenceManager.set('local_progress', action, 'pending_anl_' + Date.now());
            }
        });

        this.pendingAnalytics.push(promise);
        var self = this;
        promise.finally(function() {
            self.pendingAnalytics = self.pendingAnalytics.filter(function(p) { return p !== promise; });
        });
    },

    /**
     * Finaliza sesión integrando métricas extendidas (v7.6)
     */
    finishSession: function(asignatura, level, finalScore, xpGanada, extraMetrics) {
        var session = this.state.currentSession;
        if (!session) return Promise.resolve();

        xpGanada = xpGanada || 0;
        extraMetrics = extraMetrics || {};

        var attemptsKey = 'attempts_' + session.gameId + '_' + level;
        var prevAttempts = parseInt(localStorage.getItem(attemptsKey) || '0');
        localStorage.setItem(attemptsKey, prevAttempts + 1);

        var user = this.getCurrentUser();
        var totalTime = Date.now() - session.startTime;

        if (!user) {
            console.log("[GamesAdapter] Modo Invitado: Guardando récord local.");
            var guestRecords = JSON.parse(localStorage.getItem('guest_records') || '{}');
            if (!guestRecords[session.gameId] || finalScore > guestRecords[session.gameId].score) {
                var record = {
                    score: finalScore,
                    date: new Date().toISOString(),
                    level: level,
                    asignatura: asignatura,
                    xp: xpGanada
                };
                for (var m in extraMetrics) { record[m] = extraMetrics[m]; }
                guestRecords[session.gameId] = record;
                localStorage.setItem('guest_records', JSON.stringify(guestRecords));
            }
            return Promise.resolve({ status: 'success', mode: 'guest' });
        }

        var payload = {
            userId: user.userId,
            nombreAlumno: user.nombre,
            juego: session.gameId,
            asignatura: asignatura,
            nivel: level,
            puntaje: finalScore,
            grado: user.grado,
            totalTime: totalTime,
            xpGanada: xpGanada
        };
        for (var x in extraMetrics) { payload[x] = extraMetrics[x]; }

        fetchApi('USER', 'saveGameResult', payload).then(function(res) {
            console.log("[GamesAdapter] Sesión finalizada y sincronizada: " + finalScore + "%");
        }).catch(function(e) {
            console.warn("[GamesAdapter] Fallo sincronización de fin de sesión.", e);
        });

        return Promise.resolve({ status: 'success', message: 'Resultado registrado localmente.' });
    },

    saveResult: function(gameId, gameName, asignatura, level, score, behavioralData) {
        // Método legacy para compatibilidad
        return this.finishSession(asignatura, level, score, 0, behavioralData);
    },

    /**
     * REQ: Estrategia Caché Primero para Rankings (v7.6)
     */
    getLeaderboard: function(gameId, onUpdate) {
        var self = this;
        // 1. Intentar recuperar desde caché inmediatamente con clave global (Hallazgo 3/4)
        if (window.PersistenceManager) {
            window.PersistenceManager.get('rankings', 'global_rankings').then(function(cached) {
                if (cached && (cached.data || cached.global)) {
                    var data = cached.data || cached;
                    self.state.leaderboard = data;
                    if (typeof onUpdate === 'function') onUpdate(data);
                }
            });
        }

        // 2. Sincronización en segundo plano (silenciosa)
        return fetchApi('USER', 'getGlobalTop', { gameId: gameId }, 0, {
            store: 'rankings',
            key: 'global_rankings',
            onUpdate: function(data) {
                self.state.leaderboard = data;
                if (typeof onUpdate === 'function') onUpdate(data);
            }
        }).then(function(res) {
            return res || self.state.leaderboard || { status: 'success', global: [], subjectTops: {} };
        }).catch(function(e) {
            console.warn("[GamesAdapter] Error en sync de leaderboard:", e);
            return self.state.leaderboard || { status: 'success', global: [], subjectTops: {} };
        });
    },

    /**
     * REQ: Estrategia Caché Primero para Récords Personales (v7.6)
     */
    getPersonalRecord: function(onUpdate) {
        var self = this;
        var user = this.getCurrentUser();
        var cacheKey = user ? user.userId : 'GUEST_STATS';

        // REQ: Consultar récords locales para Invitados
        if (!user) {
            var guestRecords = JSON.parse(localStorage.getItem('guest_records') || '{}');
            if (typeof onUpdate === 'function') onUpdate(guestRecords);
            return Promise.resolve(guestRecords);
        }

        // 1. Carga inmediata desde IndexedDB
        if (window.PersistenceManager) {
            window.PersistenceManager.get('academic_stats', cacheKey).then(function(cached) {
                if (cached && (cached.data || cached.allHistory)) {
                    var cleanData = (cached && cached.data !== undefined) ? cached.data : cached;
                    self.state.personalRecords = cleanData;
                    if (typeof onUpdate === 'function') onUpdate(cleanData);
                }
            });
        }

        // 2. Sincronización silenciosa con servidor
        return fetchApi('USER', 'getGameStats', { userId: user.userId }, 0, {
            store: 'academic_stats',
            key: cacheKey,
            onUpdate: function(data) {
                var cleanData = (data && data.status === 'success') ? data.data : (data && data.data ? data.data : data);
                self.state.personalRecords = cleanData;
                if (typeof onUpdate === 'function') onUpdate(cleanData);
            }
        }).then(function(res) {
            var finalRes = (res && res.status === 'success') ? res.data : (res && res.data ? res.data : res);
            return finalRes || self.state.personalRecords || {};
        }).catch(function(e) {
            console.warn("[GamesAdapter] Error en sync de record personal:", e);
            return self.state.personalRecords || {};
        });
    }
};

/**
 * REQ: Wake Lock API (v3.2)
 * Evita que la pantalla se apague durante el juego.
 */
var wakeLock = null;
function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').then(function(lock) {
                wakeLock = lock;
                console.log('[GamesAdapter] Wake Lock activado');
            })["catch"](function(err) {
                console.warn('[GamesAdapter] Fallo Wake Lock:', err);
            });
        }
    } catch (err) {
        console.warn('[GamesAdapter] Fallo Wake Lock:', err);
    }
}
window.requestWakeLock = requestWakeLock;


// REQ: Garantía de disponibilidad para Incidencia 1
console.log("[GamesAdapter] Cargado correctamente.");
