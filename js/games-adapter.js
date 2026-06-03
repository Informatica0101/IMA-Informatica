/**
 * Adaptador Unificado para Minijuegos (Fase 1)
 */
const GamesAdapter = {
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

    async init(gameId) {
        console.log(`[GamesAdapter] Iniciando sesión para: ${gameId}`);
        this.state.currentSession = {
            gameId,
            startTime: Date.now(),
            actions: []
        };
        await this.showLoading(true);
        // Pre-carga de datos críticos
        const [lb, record] = await Promise.all([
            this.getLeaderboard(gameId),
            this.getPersonalRecord()
        ]);
        this.state.personalRecords = record;
        return { lb, record };
    },

    async showLoading(active = true) {
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
        const user = JSON.parse(localStorage.getItem('currentUser'));
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

        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;

        const totalTime = Date.now() - session.startTime;

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
            return res.status === 'success' ? res : null;
        } catch (e) {
            return null;
        }
    },

    async getPersonalRecord() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return {};
        try {
            const res = await fetchApi('USER', 'getGameStats', { userId: user.userId });
            return res.status === 'success' ? res.data : {};
        } catch (e) {
            return {};
        }
    }
};

window.GamesAdapter = GamesAdapter;

// REQ: Garantía de disponibilidad para Incidencia 1
console.log("[GamesAdapter] Cargado correctamente.");
