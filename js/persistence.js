/**
 * Persistence & Synchronization Engine (Offline-First) - QuizPro v7.0
 * Utilizes IndexedDB for structured, high-volume local persistence.
 */

window.PersistenceManager = {
    DB_NAME: 'IMA_Persistence_DB',
    DB_VERSION: 1,
    STORES: ['news', 'academic_stats', 'rankings', 'user_profile', 'local_progress', 'cache_estudiante_dashboard', 'cache_profesor_data'],
    _db: null,

    /**
     * Initializes the IndexedDB database.
     */
    async init() {
        if (this._db) return this._db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.STORES.forEach(store => {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, { keyPath: 'id' });
                    }
                });
            };

            request.onsuccess = (event) => {
                this._db = event.target.result;
                console.log("[Persistence] IndexedDB Initialized.");
                this.getGuestId(); // Ensure GUEST_UUID exists
                resolve(this._db);
            };

            request.onerror = (event) => {
                console.error("[Persistence] Error opening IndexedDB:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    /**
     * Retrieves or generates a unique GUEST_UUID.
     */
    getGuestId() {
        let guestId = localStorage.getItem('GUEST_UUID');
        if (!guestId) {
            guestId = 'GUEST-' + crypto.randomUUID();
            localStorage.setItem('GUEST_UUID', guestId);
            console.log("[Persistence] New GUEST_UUID generated:", guestId);
        }
        return guestId;
    },

    /**
     * Gets the active identifier (User ID or Guest UUID).
     */
    getActiveId() {
        const userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                return user.userId;
            } catch (e) {}
        }
        return localStorage.getItem('GUEST_UUID') || this.getGuestId();
    },

    /**
     * Retrieves data from a store.
     */
    async get(store, key) {
        await this.init();
        const id = key || this.getActiveId();
        return new Promise((resolve) => {
            const transaction = this._db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    },

    /**
     * Persists data with a timestamp.
     */
    async set(store, data, key) {
        await this.init();
        const id = key || this.getActiveId();
        const payload = {
            id: id,
            data: data,
            updated_at: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.put(payload);

            request.onsuccess = () => resolve(payload);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Retrieves all items from a specific store.
     */
    async getAll(store) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Deletes an item from a store.
     */
    async delete(store, key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Reconciliation Logic.
     */
    async reconcile(store, serverData, onUpdate) {
        const local = await this.get(store);
        const serverTimestamp = serverData.updated_at || Date.now();

        if (!local || serverTimestamp > local.updated_at) {
            console.log(`[Persistence] Server data is newer for ${store}. Updating local...`);
            // REQ: Preservación de estructura (Modulo 1)
            // Si el objeto ya tiene una propiedad 'data', lo guardamos tal cual para no perder hermanos (ej. allHistory)
            const newData = (serverData.status === 'success' && serverData.data) ? serverData : (serverData.data || serverData);
            await this.set(store, newData);
            if (onUpdate) onUpdate(newData);
            return 'server_win';
        }
        return 'synced';
    }
};

// Start initialization
window.PersistenceManager.init().catch(console.error);
