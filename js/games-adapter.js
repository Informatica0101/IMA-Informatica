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
            clearInterval(this.loadingInterval);
            if (bar) bar.style.width = '100%';
            setTimeout(() => {
                overlay.classList.add('opacity-0', 'pointer-events-none');
                overlay.classList.remove('opacity-100');
            }, 500);
        }
    },

    async saveResult(gameId, gameName, asignatura, level, score, behavioralData = {}) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;

        const payload = {
            userId: user.userId,
            gameId,
            gameName,
            asignatura,
            grado: user.grado,
            nivel: level,
            puntaje: score,
            ...behavioralData
        };

        try {
            // Guardar resultado tradicional para compatibilidad (Logros)
            await fetchApi('USER', 'saveGameResult', {
                ...payload,
                nombreAlumno: user.nombre,
                juego: gameName
            });

            // Guardar analítica detallada (Fase 2)
            // Esto se llamará por cada pregunta en juegos modales, o al final en otros
            if (behavioralData.isSessionEnd) {
                // Registro consolidado si aplica
            }
        } catch (e) {
            console.error("Error saving game result:", e);
        }
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
