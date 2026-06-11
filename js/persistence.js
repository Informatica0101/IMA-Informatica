/**
 * Persistence & Synchronization Engine (Offline-First) - QuizPro v7.5
 * Utilizes IndexedDB for structured, high-volume local persistence.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {
    app.PersistenceManager = {
        DB_NAME: 'IMA_Persistence_DB',
        DB_VERSION: 2,
        STORES: ['news', 'academic_stats', 'rankings', 'user_profile', 'local_progress', 'cache_estudiante_dashboard', 'cache_profesor_data'],
        _db: null,

        /**
         * Initializes the IndexedDB database.
         */
        init: function() {
            var self = this;
            if (this._db) return Promise.resolve(this._db);

            return new Promise(function(resolve, reject) {
                var request = indexedDB.open(self.DB_NAME, self.DB_VERSION);

                request.onupgradeneeded = function(event) {
                    var db = event.target.result;
                    self.STORES.forEach(function(store) {
                        if (!db.objectStoreNames.contains(store)) {
                            db.createObjectStore(store, { keyPath: 'id' });
                        }
                    });
                };

                request.onsuccess = function(event) {
                    self._db = event.target.result;
                    console.log("[Persistence] IndexedDB Initialized.");
                    self.getGuestId(); // Ensure GUEST_UUID exists
                    resolve(self._db);
                };

                request.onerror = function(event) {
                    console.error("[Persistence] Error opening IndexedDB:", event.target.error);
                    reject(event.target.error);
                };
            });
        },

        /**
         * Retrieves or generates a unique GUEST_UUID.
         */
        getGuestId: function() {
            var guestId = localStorage.getItem('GUEST_UUID');
            if (!guestId) {
                var uuid = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2);
                guestId = 'GUEST-' + uuid;
                localStorage.setItem('GUEST_UUID', guestId);
                console.log("[Persistence] New GUEST_UUID generated:", guestId);
            }
            return guestId;
        },

        /**
         * Gets the active identifier (User ID or Guest UUID).
         */
        getActiveId: function() {
            var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            if (userRaw) {
                try {
                    var user = JSON.parse(userRaw);
                    return user.userId;
                } catch (e) {}
            }
            return localStorage.getItem('GUEST_UUID') || this.getGuestId();
        },

        /**
         * Retrieves data from a store.
         */
        get: function(store, key) {
            var self = this;
            return this.init().then(function() {
                var id = key || self.getActiveId();
                return new Promise(function(resolve) {
                    var transaction = self._db.transaction([store], 'readonly');
                    var objectStore = transaction.objectStore(store);
                    var request = objectStore.get(id);

                    request.onsuccess = function() { resolve(request.result); };
                    request.onerror = function() { resolve(null); };
                });
            });
        },

        /**
         * Persists data with a timestamp.
         */
        set: function(store, data, key) {
            var self = this;
            return this.init().then(function() {
                var id = key || self.getActiveId();
                var payload = {
                    id: id,
                    data: data,
                    updated_at: Date.now()
                };

                return new Promise(function(resolve, reject) {
                    var transaction = self._db.transaction([store], 'readwrite');
                    var objectStore = transaction.objectStore(store);
                    var request = objectStore.put(payload);

                    request.onsuccess = function() { resolve(payload); };
                    request.onerror = function(event) { reject(event.target.error); };
                });
            });
        },

        /**
         * Retrieves all items from a specific store.
         */
        getAll: function(store) {
            var self = this;
            return this.init().then(function() {
                return new Promise(function(resolve, reject) {
                    var transaction = self._db.transaction([store], 'readonly');
                    var objectStore = transaction.objectStore(store);
                    var request = objectStore.getAll();
                    request.onsuccess = function() { resolve(request.result); };
                    request.onerror = function() { reject(request.error); };
                });
            });
        },

        /**
         * Deletes an item from a store.
         */
        delete: function(store, key) {
            var self = this;
            return this.init().then(function() {
                return new Promise(function(resolve, reject) {
                    var transaction = self._db.transaction([store], 'readwrite');
                    var objectStore = transaction.objectStore(store);
                    var request = objectStore["delete"](key);
                    request.onsuccess = function() { resolve(); };
                    request.onerror = function(event) { reject(event.target.error); };
                });
            });
        },

        /**
         * Reconciliation Logic.
         */
        reconcile: function(store, serverData, onUpdate) {
            var self = this;
            return this.get(store).then(function(local) {
                var serverTimestamp = serverData.updated_at || Date.now();

                if (!local || serverTimestamp > local.updated_at) {
                    console.log("[Persistence] Server data is newer for " + store + ". Updating local...");
                    var newData = (serverData.status === 'success' && serverData.data) ? serverData : (serverData.data || serverData);
                    return self.set(store, newData).then(function() {
                        if (onUpdate) onUpdate(newData);
                        return 'server_win';
                    });
                }
                return 'synced';
            });
        },

        /**
         * REQ v7.5: Telemetry Cleanup Logic.
         * Clears ONLY raw telemetry data (keys starting with 'pending_anl_')
         * after successful sync. Consolidated progress (XP, levels) is PRESERVED.
         */
        clearTelemetry: function() {
            var self = this;
            console.log("[Persistence] Cleaning up raw telemetry payloads...");
            return this.init().then(function() {
                return new Promise(function(resolve, reject) {
                    var transaction = self._db.transaction(['local_progress'], 'readwrite');
                    var objectStore = transaction.objectStore('local_progress');
                    var request = objectStore.openKeyCursor();

                    request.onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            var key = cursor.key;
                            // Only delete raw analytical records, preserve consolidated state
                            if (typeof key === 'string' && key.indexOf('pending_anl_') === 0) {
                                objectStore["delete"](key);
                            }
                            cursor["continue"]();
                        } else {
                            console.log("[Persistence] Telemetry cache optimized. Consolidated data preserved.");
                            resolve();
                        }
                    };
                    request.onerror = function(e) { reject(e); };
                });
            })["catch"](function(e) {
                console.warn("[Persistence] Error clearing telemetry:", e);
            });
        }
    };

    // Initialize
    app.PersistenceManager.init()["catch"](console.error);
    window.PersistenceManager = app.PersistenceManager;

    /**
     * Global background sync for pending telemetry (REQ v7.5)
     * Safely transmits data before clearing local cache.
     */
    window.addEventListener('online', function() {
        if (window.fetchApi && app.PersistenceManager) {
            app.PersistenceManager.getAll('local_progress').then(function(pending) {
                if (pending && pending.length > 0) {
                    console.log("[Sync] Found " + pending.length + " pending actions. Syncing...");

                    var syncPromises = [];
                    var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                    var user = userRaw ? JSON.parse(userRaw) : null;

                    for (var i = 0; i < pending.length; i++) {
                        var action = pending[i].data;
                        var promise = fetchApi('USER', 'recordAnalytics', {
                            userId: app.PersistenceManager.getActiveId(),
                            grado: user ? user.grado : 'Invitado',
                            gameId: action.gameId || 'QuizPro',
                            gameName: action.gameId || 'QuizPro',
                            isGuest: !user,
                            offline_sync: true,
                            original_timestamp: pending[i].updated_at,
                            asignatura: action.asignatura,
                            nivel: action.nivel,
                            preguntaId: action.preguntaId,
                            tema: action.tema,
                            respuestaSeleccionada: action.respuestaSeleccionada,
                            respuestaCorrecta: action.respuestaCorrecta,
                            esCorrecta: action.esCorrecta,
                            tiempoRespuesta: action.tiempoRespuesta,
                            cambiosRespuesta: action.cambiosRespuesta
                        });
                        syncPromises.push(promise);
                    }

                    Promise.all(syncPromises).then(function() {
                        console.log("[Sync] All pending actions transmitted successfully.");
                        app.PersistenceManager.clearTelemetry();
                    })["catch"](function(e) {
                        console.warn("[Sync] Some actions failed to sync. Cleanup postponed.", e);
                    });
                }
            });
        }
    });

})(QuizProApp);
