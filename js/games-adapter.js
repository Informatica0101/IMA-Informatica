/**
 * Adaptador para integrar minijuegos con el portal.
 */
const GamesAdapter = {
    async saveResult(gameName, achievement, score = 0) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.warn("GamesAdapter: Modo invitado. Guardando localmente.");
            const guestData = JSON.parse(localStorage.getItem('guestGameData')) || {};
            if (!guestData[gameName] || score > (guestData[gameName].maxScore || 0)) {
                guestData[gameName] = { maxScore: score, lastLogro: achievement, date: new Date() };
                localStorage.setItem('guestGameData', JSON.stringify(guestData));
            }
            // Disparar evento para mostrar prompt de login
            document.dispatchEvent(new CustomEvent('guest-game-finished', { detail: { gameName, score } }));
            return;
        }

        const payload = {
            userId: currentUser.userId,
            nombreAlumno: currentUser.nombre,
            juego: gameName,
            logro: achievement,
            puntaje: score
        };

        try {
            if (typeof fetchApi !== 'function') {
                console.error("GamesAdapter: fetchApi no está definido.");
                return;
            }

            const res = await fetchApi('USER', 'saveGameResult', payload);
            if (res.status === 'success') {
                console.log(`GamesAdapter: Logro "${achievement}" guardado.`);
            }
        } catch (error) {
            console.error("GamesAdapter: Error de conexión:", error.message);
        }
    },

    async getPersonalRecord() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            return JSON.parse(localStorage.getItem('guestGameData')) || {};
        }

        try {
            const res = await fetchApi('USER', 'getGameStats', { userId: currentUser.userId });
            if (res.status === 'success') {
                return res.data; // { "Juego": { maxScore: 100, ... } }
            }
        } catch (error) {
            console.error("GamesAdapter: Error al obtener récord:", error);
        }
        return {};
    }
};

window.GamesAdapter = GamesAdapter;
