/**
 * QuizPro v7.5 - Authentication Module (Manual ES5 Remediation)
 * Strict ES5 Implementation with Namespacing and IIFE.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {

    app.initAuth = function() {
        var loginForm = document.getElementById('login-form');
        var registerForm = document.getElementById('register-form');

        // Si el usuario ya está logueado, redirigir al dashboard correspondiente (buscando en ambos storages)
        var currentUserRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

        if (currentUser) {
            app.handlePostLoginRedirection(currentUser);
        }

        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var submitBtn = loginForm.querySelector('button[type="submit"]');
                var identifier = e.target.email.value;
                var password = e.target.password.value;
                var rememberMeEl = document.getElementById('remember-me');
                var rememberMe = rememberMeEl ? rememberMeEl.checked : false;

                submitBtn.classList.add('btn-loading');
                submitBtn.disabled = true;

                app.fetchApi('USER', 'loginUser', { identifier: identifier, password: password })
                    .then(function(result) {
                        if (result.status === 'success' && result.data) {
                            // REQ: Implementar lógica de "Recordarme" (v4.0)
                            var storage = rememberMe ? localStorage : sessionStorage;
                            var otherStorage = rememberMe ? sessionStorage : localStorage;
                            otherStorage.removeItem('currentUser');

                            var userData = {
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
                            console.log("[IMA-AUTH] Sesión iniciada para " + userData.nombre + ". Recordar: " + rememberMe);

                            app.handlePostLoginRedirection(userData);
                        } else {
                            // Feedback detallado según respuesta del servidor
                            var msg = "Error al iniciar sesión.";
                            var serverMsg = (result.message || "").toLowerCase();

                            if (serverMsg.indexOf("password") !== -1 || serverMsg.indexOf("contrasena") !== -1) {
                                msg = "La contraseña ingresada es incorrecta. Por favor, verifica e intenta de nuevo.";
                            } else if (serverMsg.indexOf("not found") !== -1 || serverMsg.indexOf("no encontrado") !== -1 || serverMsg.indexOf("exist") !== -1) {
                                msg = "El usuario o correo no existe en nuestro sistema. Verifica que esté bien escrito o regístrate.";
                            } else {
                                msg = result.message || msg;
                            }
                            alert(msg);
                        }
                    })
                    ["catch"](function(error) {
                        console.error('Error en el login:', error);
                        if (navigator.onLine === false) {
                            alert('No tienes conexión a internet. Por favor verifica tu red.');
                        } else {
                            alert('Error de conexión con el servidor. Reintente en unos momentos.');
                        }
                    })
                    ["finally"](function() {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                    });
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var submitBtn = registerForm.querySelector('button[type="submit"]');
                var payload = {
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

                app.fetchApi('USER', 'registerUser', payload)
                    .then(function(result) {
                        if (result.exists) {
                            var confirmUpdate = confirm(result.message + "\n\nDatos encontrados:\nNombre: " + result.data.nombre + "\nGrado Actual: " + result.data.gradoActual + "\nSección: " + result.data.seccionActual + "\n\n¿Deseas actualizar tus datos y promover tu cuenta al nuevo grado/sección ingresado?");
                            if (confirmUpdate) {
                                payload.forceUpdate = true;
                                return app.fetchApi('USER', 'registerUser', payload);
                            } else {
                                throw new Error("CANCELLED");
                            }
                        }
                        return result;
                    })
                    .then(function(result) {
                        if (result.status === 'success') {
                            var userData = {
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
                    })
                    ["catch"](function(error) {
                        if (error.message === "CANCELLED") return;
                        console.error('Error en el registro:', error);
                        alert('Hubo un problema de conexión. Revisa la consola.');
                    })
                    ["finally"](function() {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                    });
            });
        }
    };

    app.handlePostLoginRedirection = function(user) {
        // Rutina de fusión si venimos de una sesión de invitado
        var promise = Promise.resolve();
        if (QuizProApp.PersistenceManager) {
            promise = app.mergeGuestData(user.userId);
        }

        promise.then(function() {
            // REQ: Intent Recovery (Modulo 5.2)
            var interruptedIntentRaw = localStorage.getItem('quizpro_interrupted_intent');
            if (interruptedIntentRaw) {
                var intent = JSON.parse(interruptedIntentRaw);
                if (Date.now() - intent.timestamp < 15 * 60 * 1000) {
                    localStorage.removeItem('quizpro_interrupted_intent');
                    console.log("[IMA-AUTH] Recuperando intención de juego interrumpida...");
                    window.location.href = "index.html?loadGame=" + intent.activityId;
                    return;
                }
                localStorage.removeItem('quizpro_interrupted_intent');
            }

            if (user.rol === 'Profesor') {
                window.location.href = 'teacher-dashboard.html';
            } else {
                window.location.href = 'student-dashboard.html';
            }
        });
    };

    /**
     * REQ: Guest Data Migration & Anti-Rollback Policy (Modulo 2.3)
     * Transmite el historial local del GUEST_UUID al servidor tras login
     * aplicando la Regla del Máximo Promedio.
     */
    app.mergeGuestData = function(userId) {
        var guestId = localStorage.getItem('GUEST_UUID');
        if (!guestId) return Promise.resolve();

        console.log("[IMA-AUTH] Iniciando fusión de datos: " + guestId + " -> " + userId);

        var localRecords = [];
        var localScoreSum = 0;
        var localCount = 0;

        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(guestId) !== -1 || key.indexOf('xp_') === 0) {
                try {
                    var raw = localStorage.getItem(key);
                    var entry = (key.indexOf('xp_') === 0) ? { data: { xpGanada: parseInt(raw) } } : JSON.parse(raw);
                    var data = entry.data || entry;
                    localRecords.push({ key: key, data: data, storage: 'localStorage', updated_at: entry.updated_at || Date.now() });
                } catch (e) {}
            }
        }

        var persistence = QuizProApp.PersistenceManager;
        var getIDBProgress = (persistence) ? persistence.getAll('local_progress') : Promise.resolve([]);

        return getIDBProgress.then(function(idbProgress) {
            if (idbProgress) {
                for (var j = 0; j < idbProgress.length; j++) {
                    var item = idbProgress[j];
                    if (item.id.indexOf(guestId) !== -1 || item.id.indexOf('pending_anl') !== -1) {
                        localRecords.push({ key: item.id, data: item.data, storage: 'indexedDB', updated_at: item.updated_at });
                        if (item.data.puntaje !== undefined) {
                            localScoreSum += parseFloat(item.data.puntaje);
                            localCount++;
                        }
                    }
                }
            }

            var localAvg = localCount > 0 ? (localScoreSum / localCount) : 0;

            if (localRecords.length > 0) {
                return app.fetchApi('USER', 'getGameStats', { userId: userId })
                    .then(function(serverStats) {
                        var serverAvg = 0;
                        if (serverStats.status === 'success' && serverStats.data) {
                            var statsMap = serverStats.data;
                            var stats = [];
                            for (var k in statsMap) {
                                if (Object.prototype.hasOwnProperty.call(statsMap, k)) {
                                    stats.push(statsMap[k]);
                                }
                            }
                            var scoreSum = 0;
                            for (var l = 0; l < stats.length; l++) {
                                scoreSum += parseFloat(stats[l].maxScore || 0);
                            }
                            serverAvg = stats.length > 0 ? (scoreSum / stats.length) : 0;
                        }

                        console.log("[IMA-AUTH] Comparación: Local(" + localAvg.toFixed(1) + "%) vs Server(" + serverAvg.toFixed(1) + "%)");

                        if (localAvg > serverAvg) {
                            console.log("[IMA-AUTH] Caso A: Progreso local superior. Sobrescribiendo servidor...");
                            return app.fetchApi('USER', 'mergeGuestData', {
                                userId: userId,
                                guestId: guestId,
                                history: localRecords,
                                overwrite: true
                            }).then(function(res) {
                                if (res.status === 'success') alert("¡Avance detectado! Tu progreso de invitado ha sido sincronizado exitosamente.");
                            });
                        }
                    })
                    .then(function() {
                        var cleanupPromises = [];
                        for (var m = 0; m < localRecords.length; m++) {
                            var item = localRecords[m];
                            if (item.storage === 'localStorage') localStorage.removeItem(item.key);
                            else if (persistence) cleanupPromises.push(persistence["delete"]('local_progress', item.key));
                        }
                        return Promise.all(cleanupPromises);
                    })
                    .then(function() {
                        localStorage.removeItem('GUEST_UUID');
                        if (persistence) persistence.getGuestId();
                    });
            }
        })["catch"](function(e) {
            console.error("[IMA-AUTH] Error en política de conciliación:", e);
        });
    };

    // Initialize on DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
        app.initAuth();
    });

})(QuizProApp);
