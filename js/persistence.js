/**
 * Persistence & Synchronization Engine (Offline-First) - QuizPro v7.0
 * Utiliza IndexedDB para persistencia local de alto volumen.
 * ES5 Compliance Mandatory.
 */

window.PersistenceManager = {
    DB_NAME: 'IMA_Persistence_DB',
    DB_VERSION: 4,
    STORES: ['news', 'academic_stats', 'rankings', 'user_profile', 'local_progress', 'cache_estudiante_dashboard', 'cache_profesor_data', 'cache_teacher_projects', 'cache_teacher_logros', 'cache_teacher_reports', 'cache_estudiante_profile', 'cache_estudiante_tasks', 'cache_estudiante_exams'],
    _db: null,

    /**
     * Inicializa la base de datos IndexedDB.
     */
    init: function() {
        var self = this;
        if (this._db) return Promise.resolve(this._db);

        return new Promise(function(resolve, reject) {
            var request = indexedDB.open(self.DB_NAME, self.DB_VERSION);

            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                for (var i = 0; i < self.STORES.length; i++) {
                    var store = self.STORES[i];
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, { keyPath: 'id' });
                    }
                }
            };

            request.onsuccess = function(event) {
                self._db = event.target.result;
                console.log("[Persistence] IndexedDB Initialized.");
                self.getGuestId();
                resolve(self._db);
            };

            request.onerror = function(event) {
                console.error("[Persistence] Error opening IndexedDB:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    /**
     * Recupera o genera un GUEST_UUID único.
     */
    getGuestId: function() {
        var guestId = localStorage.getItem('GUEST_UUID');
        if (!guestId) {
            guestId = 'GUEST-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('GUEST_UUID', guestId);
            console.log("[Persistence] New GUEST_UUID generated:", guestId);
        }
        return guestId;
    },

    /**
     * Obtiene el identificador activo (User ID o Guest UUID).
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
     * Recupera datos de un store.
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
     * Persiste datos con timestamp.
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
     * Recupera todos los elementos de un store.
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
     * Elimina una clave de un store.
     */
    delete: function(store, key) {
        var self = this;
        return this.init().then(function() {
            return new Promise(function(resolve, reject) {
                var transaction = self._db.transaction([store], 'readwrite');
                var objectStore = transaction.objectStore(store);
                var request = objectStore.delete(key);

                request.onsuccess = function() { resolve(); };
                request.onerror = function() { reject(request.error); };
            });
        });
    },

    /**
     * Reconcilia datos del servidor con el caché local.
     */
    reconcile: function(store, serverData, onUpdate, key) {
        var self = this;
        var cacheKey = key || self.getActiveId();

        return this.get(store, cacheKey).then(function(local) {
            // REQ: Forzar actualización si vienen datos válidos del servidor (Hallazgo 6)
            // Muchos servicios no envían updated_at, por lo que confiamos en la llegada de datos.
            var hasNewData = serverData && (serverData.status === 'success' || Array.isArray(serverData) || (typeof serverData === 'object' && Object.keys(serverData).length > 0));

            var serverTimestamp = (serverData && serverData.updated_at) ? serverData.updated_at : Date.now();
            var isNewer = !local || !local.updated_at || serverTimestamp > local.updated_at;

            if (hasNewData && isNewer) {
                // REQ: Preservar estructura completa si contiene historial (A-78)
                var newData = (serverData && serverData.status === 'success' && serverData.data !== undefined) ? serverData.data : serverData;
                if (serverData && serverData.allHistory) { newData = serverData; }

                return self.set(store, newData, cacheKey).then(function() {
                    if (typeof onUpdate === 'function') onUpdate(newData);
                    return newData;
                });
            }
            return local ? local.data : null;
        });
    }
};
