document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Si el usuario ya está logueado, redirigir al dashboard correspondiente (buscando en ambos storages)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));

    async function handlePostLoginRedirection(user) {
        // Rutina de fusión si venimos de una sesión de invitado
        if (window.PersistenceManager) {
            await mergeGuestData(user.userId);
        }

        // REQ: Intent Recovery (Modulo 5.2)
        const interruptedIntentRaw = localStorage.getItem('quizpro_interrupted_intent');
        if (interruptedIntentRaw) {
            const intent = JSON.parse(interruptedIntentRaw);
            if (Date.now() - intent.timestamp < 15 * 60 * 1000) {
                localStorage.removeItem('quizpro_interrupted_intent');
                console.log("[IMA-AUTH] Recuperando intención de juego interrumpida...");
                window.location.href = `index.html?loadGame=${intent.activityId}`;
                return;
            }
            localStorage.removeItem('quizpro_interrupted_intent');
        }

        if (user.rol === 'Profesor') {
            window.location.href = 'teacher-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
    }

    if (currentUser) {
        handlePostLoginRedirection(currentUser);
    }

    /**
     * REQ: Guest Data Migration & Anti-Rollback Policy (Modulo 2.3)
     * Transmite el historial local del GUEST_UUID al servidor tras login
     * aplicando la Regla del Máximo Promedio.
     */
    async function mergeGuestData(userId) {
        const guestId = localStorage.getItem('GUEST_UUID');
        if (!guestId) return;

        console.log(`[IMA-AUTH] Iniciando fusión de datos: ${guestId} -> ${userId}`);

        // 1. Extraer métricas locales (LocalStorage + IndexedDB)
        const localRecords = [];
        let localScoreSum = 0;
        let localCount = 0;

        // A. LocalStorage: QuizPro XP y otros marcadores rápidos
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Buscar llaves que contengan el guestId o sean prefijos conocidos de QuizPro (xp_Subject_Grade)
            if (key.includes(guestId) || key.startsWith('xp_')) {
                try {
                    const raw = localStorage.getItem(key);
                    const entry = key.startsWith('xp_') ? { data: { xpGanada: parseInt(raw) } } : JSON.parse(raw);
                    const data = entry.data || entry;
                    localRecords.push({ key, data, storage: 'localStorage', updated_at: entry.updated_at || Date.now() });
                } catch (e) {}
            }
        }

        // B. IndexedDB: Analítica y progreso estructurado
        if (window.PersistenceManager) {
            const idbProgress = await window.PersistenceManager.getAll('local_progress');
            idbProgress.forEach(item => {
                if (item.id.includes(guestId) || item.id.includes('pending_anl')) {
                    localRecords.push({ key: item.id, data: item.data, storage: 'indexedDB', updated_at: item.updated_at });
                    if (item.data.puntaje !== undefined) {
                        localScoreSum += parseFloat(item.data.puntaje);
                        localCount++;
                    }
                }
            });
        }

        const localAvg = localCount > 0 ? (localScoreSum / localCount) : 0;

        if (localRecords.length > 0) {
            try {
                // 2. Obtener métricas del servidor para comparación
                const serverStats = await fetchApi('USER', 'getGameStats', { userId });
                let serverAvg = 0;

                if (serverStats.status === 'success' && serverStats.data) {
                    const stats = Object.values(serverStats.data);
                    const scores = stats.map(s => parseFloat(s.maxScore || 0));
                    serverAvg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                }

                // 3. Resolución por Mayoría Absoluta (Regla del Máximo Promedio)
                console.log(`[IMA-AUTH] Comparación: Local(${localAvg.toFixed(1)}%) vs Server(${serverAvg.toFixed(1)}%)`);

                if (localAvg > serverAvg) {
                    console.log("[IMA-AUTH] Caso A: Progreso local superior. Sobrescribiendo servidor...");
                    const res = await fetchApi('USER', 'mergeGuestData', {
                        userId: userId,
                        guestId: guestId,
                        history: localRecords,
                        overwrite: true
                    });
                    if (res.status === 'success') alert("¡Avance detectado! Tu progreso de invitado ha sido sincronizado exitosamente.");
                }

                // 4. Limpieza final profunda
                for (const item of localRecords) {
                    if (item.storage === 'localStorage') localStorage.removeItem(item.key);
                    else if (window.PersistenceManager) await window.PersistenceManager.delete('local_progress', item.key);
                }
                localStorage.removeItem('GUEST_UUID');
                if (window.PersistenceManager) window.PersistenceManager.getGuestId();

            } catch (e) {
                console.error("[IMA-AUTH] Error en política de conciliación:", e);
            }
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const identifier = e.target.email.value;
            const password = e.target.password.value;
            const rememberMe = document.getElementById('remember-me')?.checked;

            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            try {
                const result = await fetchApi('USER', 'loginUser', { identifier, password });

                if (result.status === 'success' && result.data) {
                    // REQ: Implementar lógica de "Recordarme" (v4.0)
                    const storage = rememberMe ? localStorage : sessionStorage;
                    const otherStorage = rememberMe ? sessionStorage : localStorage;
                    otherStorage.removeItem('currentUser');

                    const userData = {
                        userId: result.data.userId || result.data.id,
                        nombre: result.data.nombre,
                        email: result.data.email,
                        rol: result.data.rol || 'Estudiante',
                        grado: result.data.grado,
                        seccion: result.data.seccion,
                        numeroLista: result.data.numeroLista,
                        telefono: result.data.telefono,
                        loginTimestamp: Date.now(),
                        remembered: rememberMe
                    };

                    storage.setItem('currentUser', JSON.stringify(userData));
                    console.log(`[IMA-AUTH] Sesión iniciada para ${userData.nombre}. Recordar: ${rememberMe}`);

                    await handlePostLoginRedirection(userData);
                } else {
                    // Feedback detallado según respuesta del servidor
                    let msg = "Error al iniciar sesión.";
                    const serverMsg = (result.message || "").toLowerCase();

                    if (serverMsg.includes("password") || serverMsg.includes("contraseña")) {
                        msg = "La contraseña ingresada es incorrecta. Por favor, verifica e intenta de nuevo.";
                    } else if (serverMsg.includes("not found") || serverMsg.includes("no encontrado") || serverMsg.includes("exist")) {
                        msg = "El usuario o correo no existe en nuestro sistema. Verifica que esté bien escrito o regístrate.";
                    } else {
                        msg = result.message || msg;
                    }

                    alert(msg);
                }
            } catch (error) {
                console.error('Error en el fetch:', error);
                // Manejo de errores de conexión/CORS
                if (navigator.onLine === false) {
                    alert('No tienes conexión a internet. Por favor verifica tu red.');
                } else {
                    alert('Error de conexión con el servidor. Es posible que el servicio esté saturado o bloqueado por red (CORS). Inténtalo de nuevo en unos momentos.');
                }
            } finally {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const payload = {
                nombre: e.target.nombre.value,
                grado: e.target.grado.value,
                seccion: e.target.seccion.value,
                email: e.target.email.value,
                password: e.target.password.value,
                telefono: e.target.telefono.value,
                numeroLista: e.target.numeroLista.value
            };

            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            try {
                let result = await fetchApi('USER', 'registerUser', payload);

                if (result.exists) {
                    const confirmUpdate = confirm(`${result.message}\n\nDatos encontrados:\nNombre: ${result.data.nombre}\nGrado Actual: ${result.data.gradoActual}\nSección: ${result.data.seccionActual}\n\n¿Deseas actualizar tus datos y promover tu cuenta al nuevo grado/sección ingresado?`);
                    if (confirmUpdate) {
                        payload.forceUpdate = true;
                        result = await fetchApi('USER', 'registerUser', payload);
                    } else {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                        return;
                    }
                }

                if (result.status === 'success') {
                    // Login automático tras registro exitoso
                    const userData = {
                        userId: result.userId,
                        nombre: payload.nombre,
                        grado: payload.grado,
                        seccion: payload.seccion,
                        rol: 'Estudiante',
                        telefono: payload.telefono,
                        numeroLista: payload.numeroLista
                    };
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    alert('¡Registro exitoso! Bienvenido, ' + payload.nombre.split(' ')[0]);
                    window.location.href = 'student-dashboard.html';
                } else {
                    alert(result.message || 'Error en el registro.');
                }
            } catch (error) {
                console.error('Error en el fetch:', error);
                alert('Hubo un problema de conexión. Revisa la consola.');
            } finally {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        });
    }
});
