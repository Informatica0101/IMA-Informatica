/**
 * Adaptador Unificado para Minijuegos (Fase 1) - QuizPro v7.5
 * Strict ES5 Implementation with Namespacing.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {
    app.GamesAdapter = {
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

        init: function(gameId, autoHide) {
            var self = this;
            if (autoHide === undefined) autoHide = true;
            console.log("[GamesAdapter] Iniciando sesión para: " + gameId);

            this.state.currentSession = {
                gameId: gameId,
                startTime: Date.now(),
                actions: []
            };

            return this.showLoading(true).then(function() {
                var timeoutPromise = new Promise(function(resolve) {
                    setTimeout(function() { resolve('TIMEOUT'); }, 5000);
                });

                var dataPromise = Promise.all([
                    self.getLeaderboard(gameId)["catch"](function() { return null; }),
                    self.getPersonalRecord()["catch"](function() { return {}; })
                ]);

                return Promise.race([dataPromise, timeoutPromise]);
            }).then(function(results) {
                if (results === 'TIMEOUT') {
                    console.warn("[GamesAdapter] Timeout en pre-carga de datos.");
                    self.state.personalRecords = {};
                    if (autoHide) return self.showLoading(false).then(function() { return { lb: { global: [], subjectTops: {} }, record: {} }; });
                    return { lb: { global: [], subjectTops: {} }, record: {} };
                }

                var lb = results[0];
                var record = results[1];
                self.state.personalRecords = record || {};
                var safeLb = lb || { global: [], subjectTops: {} };

                if (autoHide) {
                    return self.showLoading(false).then(function() {
                        return { lb: safeLb, record: record || {} };
                    });
                }
                return { lb: safeLb, record: record || {} };
            })["catch"](function(e) {
                console.error("[GamesAdapter] Error crítico en init:", e);
                self.state.personalRecords = {};
                if (autoHide) return self.showLoading(false).then(function() { return { lb: { global: [], subjectTops: {} }, record: {} }; });
                return { lb: { global: [], subjectTops: {} }, record: {} };
            });
        },

        showLoading: function(active, container) {
            var self = this;
            if (active === undefined) active = true;

            // REQ: Soporte para Spinner Contextual (Ticket 3)
            if (container && active) {
                container.innerHTML = '<div class="flex flex-col items-center justify-center p-8 animate-fade-in contextual-loader w-full col-span-full">' +
                        '<div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>' +
                        '<p class="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">' + self.loadingMessages[Math.floor(Math.random() * self.loadingMessages.length)] + '</p>' +
                    '</div>';
                return Promise.resolve();
            }

            var overlay = document.getElementById('loading-overlay');
            var msgEl = document.getElementById('loading-msg');
            var bar = document.getElementById('loading-bar');

            if (!overlay) return Promise.resolve();

            if (active) {
                overlay.classList.remove('pointer-events-none');
                overlay.classList.add('opacity-100');
                if (bar) bar.style.width = '30%';

                var i = 0;
                this.loadingInterval = setInterval(function() {
                    if (msgEl) msgEl.textContent = self.loadingMessages[i % self.loadingMessages.length];
                    if (bar) bar.style.width = Math.min(90, 30 + (i * 10)) + '%';
                    i++;
                }, 800);
                return Promise.resolve();
            } else {
                var contextualLoaders = document.querySelectorAll('.contextual-loader');
                for (var j = 0; j < contextualLoaders.length; j++) contextualLoaders[j].parentNode.removeChild(contextualLoaders[j]);

                clearInterval(this.loadingInterval);
                if (bar) bar.style.width = '100%';

                return new Promise(function(resolve) {
                    setTimeout(function() {
                        overlay.classList.add('opacity-0', 'pointer-events-none');
                        overlay.classList.remove('opacity-100');
                        resolve();
                    }, 800);
                });
            }
        },

        recordAction: function(data) {
            if (!this.state.currentSession) return;

            var action = {};
            for (var key in data) { if (Object.prototype.hasOwnProperty.call(data, key)) action[key] = data[key]; }

            action.timestamp = Date.now();
            action.timeFromStart = Date.now() - this.state.currentSession.startTime;
            action.tipoActividad = data.tipoActividad || data.type;

            this.state.currentSession.actions.push(action);

            if (!this.pendingAnalytics) this.pendingAnalytics = [];

            var persistence = app.PersistenceManager || QuizProApp.PersistenceManager;
            var activeId = persistence ? persistence.getActiveId() : 'GUEST-FALLBACK';
            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            var user = userRaw ? JSON.parse(userRaw) : null;

            var payload = {
                userId: activeId,
                grado: user ? user.grado : 'Invitado',
                gameId: this.state.currentSession.gameId,
                gameName: this.state.currentSession.gameId,
                isGuest: !user
            };
            for (var k in action) { if (Object.prototype.hasOwnProperty.call(action, k)) payload[k] = action[k]; }

            var self = this;
            var promise = window.fetchApi('USER', 'recordAnalytics', payload)["catch"](function(e) {
                console.warn("[GamesAdapter] Fallo registro analítico. Guardando localmente...");
                if (persistence) {
                    persistence.set('local_progress', action, "pending_anl_" + Date.now());
                }
            });

            this.pendingAnalytics.push(promise);
            promise["finally"](function() {
                self.pendingAnalytics = self.pendingAnalytics.filter(function(p) { return p !== promise; });
            });
        },

        finishSession: function(asignatura, level, finalScore, xpGanada) {
            var session = this.state.currentSession;
            if (!session) return Promise.resolve();
            if (xpGanada === undefined) xpGanada = 0;

            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            var user = userRaw ? JSON.parse(userRaw) : null;
            var totalTime = Date.now() - session.startTime;

            if (!user) {
                var guestRecords = JSON.parse(localStorage.getItem('guest_records') || '{}');
                if (!guestRecords[session.gameId] || finalScore > guestRecords[session.gameId].score) {
                    guestRecords[session.gameId] = {
                        score: finalScore,
                        date: new Date().toISOString(),
                        level: level,
                        asignatura: asignatura,
                        xp: xpGanada
                    };
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

            window.fetchApi('USER', 'saveGameResult', payload)["catch"](function(e) {
                console.warn("[GamesAdapter] Fallo sincronización de fin de sesión.", e);
            });

            return Promise.resolve({ status: 'success', message: 'Resultado registrado localmente.' });
        },

        saveResult: function(gameId, gameName, asignatura, level, score, behavioralData) {
            return this.finishSession(asignatura, level, score);
        },

        getLeaderboard: function(gameId) {
            var self = this;
            var persistence = app.PersistenceManager || QuizProApp.PersistenceManager;
            var promise = Promise.resolve();

            if (persistence) {
                promise = persistence.get('rankings').then(function(cached) {
                    if (cached && cached.data) self.state.leaderboard = cached.data;
                });
            }

            return promise.then(function() {
                return window.fetchApi('USER', 'getGlobalTop', { gameId: gameId }, 0, { store: 'rankings' });
            }).then(function(res) {
                if (res && res.status === 'success') {
                    self.state.leaderboard = res;
                    return res;
                }
                return self.state.leaderboard || { status: 'success', global: [], subjectTops: {} };
            })["catch"](function() {
                return self.state.leaderboard || { status: 'success', global: [], subjectTops: {} };
            });
        },

        getPersonalRecord: function() {
            var self = this;
            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            var user = userRaw ? JSON.parse(userRaw) : null;

            if (!user) {
                var guestRecords = JSON.parse(localStorage.getItem('guest_records') || '{}');
                return Promise.resolve(guestRecords);
            }

            var persistence = app.PersistenceManager || QuizProApp.PersistenceManager;
            var promise = Promise.resolve();

            if (persistence) {
                promise = persistence.get('academic_stats').then(function(cached) {
                    if (cached && cached.data) self.state.personalRecords = cached.data;
                });
            }

            return promise.then(function() {
                return window.fetchApi('USER', 'getGameStats', { userId: user.userId }, 0, { store: 'academic_stats' });
            }).then(function(res) {
                if (res && res.status === 'success' && res.data) {
                    self.state.personalRecords = res.data;
                    return res.data;
                }
                return self.state.personalRecords || {};
            })["catch"](function() {
                return self.state.personalRecords || {};
            });
        }
    };

    window.GamesAdapter = app.GamesAdapter;

    var wakeLock = null;
    app.requestWakeLock = function() {
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').then(function(lock) {
                wakeLock = lock;
                console.log('[GamesAdapter] Wake Lock activado');
            })["catch"](function(err) {
                console.warn('[GamesAdapter] Fallo Wake Lock:', err);
            });
        }
    };
    window.requestWakeLock = app.requestWakeLock;

    console.log("[GamesAdapter] Cargado correctamente.");

})(QuizProApp);
