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
        personalRecords: {}
    },

    async init(gameId, autoHide = true) {
        console.log(`[GamesAdapter] Iniciando sesión para: ${gameId}`);
        this.state.currentSession = {
            gameId,
            startTime: Date.now(),
            actions: []
        };
        await this.showLoading(true);

        // REQ: Pre-carga segura con timeout (Fase 2)
        try {
            const timeout = (ms) => new Promise(resolve => setTimeout(() => resolve('TIMEOUT'), ms));

            const results = await Promise.race([
                Promise.all([
                    this.getLeaderboard(gameId).catch(e => null),
                    this.getPersonalRecord().catch(e => ({}))
                ]),
                timeout(5000)
            ]);

            if (results === 'TIMEOUT') {
                console.warn("[GamesAdapter] Timeout en pre-carga de datos, continuando con valores por defecto.");
                this.state.personalRecords = {};
                if (autoHide) await this.showLoading(false);
                return { lb: { global: [], subjectTops: {} }, record: {} };
            }

            const [lb, record] = results;
            this.state.personalRecords = record || {};

            // REQ: Asegurar que el ranking tenga estructura base (v3.2)
            const safeLb = lb || { global: [], subjectTops: {} };

            return { lb: safeLb, record: record || {} };
        } catch (e) {
            console.error("[GamesAdapter] Error crítico en init:", e);
            this.state.personalRecords = {};
            return { lb: { global: [], subjectTops: {} }, record: {} };
        } finally {
            // REQ: Liberar loader siempre ( QA Automático )
            // Si autoHide es false, el llamador es responsable de cerrar el loader tras renderizar.
            if (autoHide) await this.showLoading(false);
        }
    },

    async showLoading(active = true, container = null) {
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

    recordAction(data) {
        if (!this.state.currentSession) return;

        const action = {
            ...data,
            timestamp: Date.now(),
            timeFromStart: Date.now() - this.state.currentSession.startTime
        };
        this.state.currentSession.actions.push(action);

        // Envío asíncrono para no bloquear UI
        const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
        if (user) {
            fetchApi('USER', 'recordAnalytics', {
                userId: user.userId,
                grado: user.grado,
                gameId: this.state.currentSession.gameId,
                gameName: this.state.currentSession.gameId, // Por ahora igual
                ...action
            }).catch(e => console.warn("[GamesAdapter] Fallo registro analítico:", e));
        }
    },

    async finishSession(asignatura, level, finalScore) {
        const session = this.state.currentSession;
        if (!session) return;

        const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
        const totalTime = Date.now() - session.startTime;

        // REQ: Persistencia local para Invitados (Ticket 2)
        if (!user) {
            console.log("[GamesAdapter] Modo Invitado: Guardando récord local.");
            const guestRecords = JSON.parse(localStorage.getItem('guest_records') || '{}');
            if (!guestRecords[session.gameId] || finalScore > guestRecords[session.gameId].score) {
                guestRecords[session.gameId] = {
                    score: finalScore,
                    date: new Date().toISOString(),
                    level,
                    asignatura
                };
                localStorage.setItem('guest_records', JSON.stringify(guestRecords));
            }
            return Promise.resolve({ status: 'success', mode: 'guest' });
        }

        try {
            await fetchApi('USER', 'saveGameResult', {
                userId: user.userId,
                nombreAlumno: user.nombre,
                juego: session.gameId,
                asignatura,
                nivel: level,
                puntaje: finalScore,
                grado: user.grado,
                totalTime
            });
            console.log(`[GamesAdapter] Sesión finalizada: ${finalScore}%`);
        } catch (e) {
            console.error("[GamesAdapter] Error al finalizar sesión:", e);
        }
    },

    async saveResult(gameId, gameName, asignatura, level, score, behavioralData = {}) {
        // Método legacy para compatibilidad
        return this.finishSession(asignatura, level, score);
    },

    async getLeaderboard(gameId) {
        try {
            const res = await fetchApi('USER', 'getGlobalTop', { gameId });
            // REQ: Manejo seguro de datos vacíos (v3.2)
            if (res && res.status === 'success') return res;
            return { status: 'success', global: [], subjectTops: {} };
        } catch (e) {
            console.warn(`[GamesAdapter] Error obteniendo leaderboard para ${gameId}:`, e);
            return { status: 'success', global: [], subjectTops: {} };
        }
    },

    async getPersonalRecord() {
        const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));

        // REQ: Consultar récords locales para Invitados
        if (!user) {
            const guestRecords = JSON.parse(localStorage.getItem('guest_records') || '{}');
            return guestRecords;
        }

        try {
            const res = await fetchApi('USER', 'getGameStats', { userId: user.userId });
            // REQ: Manejo seguro de datos vacíos (v3.2)
            if (res && res.status === 'success' && res.data) return res.data;
            return {};
        } catch (e) {
            console.warn("[GamesAdapter] Error obteniendo record personal:", e);
            return {};
        }
    }
};

/**
 * REQ: Wake Lock API (v3.2)
 * Evita que la pantalla se apague durante el juego.
 */
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('[GamesAdapter] Wake Lock activado');
        }
    } catch (err) {
        console.warn('[GamesAdapter] Fallo Wake Lock:', err);
    }
}
window.requestWakeLock = requestWakeLock;


// REQ: Garantía de disponibilidad para Incidencia 1
console.log("[GamesAdapter] Cargado correctamente.");
