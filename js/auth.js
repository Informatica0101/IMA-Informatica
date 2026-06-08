document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Si el usuario ya está logueado, redirigir al dashboard correspondiente (evitando bucles)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (currentUser) {
        const isTeacher = currentUser.rol === 'Profesor';
        const dest = isTeacher ? 'teacher-dashboard.html' : 'student-dashboard.html';
        const onAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html') || window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

        if (onAuthPage) {
            window.location.href = dest;
        }
    }

    // REQ: Cliente para obtención de Access Token (Tarea 1 - Parte C)
    let tokenClient;
    if (window.google) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: '810005963548-0916n9af4tsjfu4tohi1c7qrgal6dhmc.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    console.log("[IMA-AUTH] Google Access Token obtenido para Drive");
                    localStorage.setItem('google_access_token', tokenResponse.access_token);
                    // Si hay una subida pendiente, dispararla aquí (se manejará en student.js)
                    window.dispatchEvent(new CustomEvent('google-token-ready', { detail: tokenResponse.access_token }));
                }
            },
        });
    }

    window.requestGoogleDriveToken = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: 'none' }); // Intentar silenciosamente primero
        }
    };

    // REQ: Manejador de respuesta de Google GIS (Tarea 1)
    window.handleCredentialResponse = async (response) => {
        console.log("[IMA-AUTH] Google ID Token recibido");
        const idToken = response.credential;

        try {
            if (window.GamesAdapter) window.GamesAdapter.showLoading(true);

            // Enviar token al backend para validación y login/registro automático
            const result = await fetchApi('USER', 'loginWithGoogle', { idToken });

            if (result.status === 'success' && result.data) {
                const userData = {
                    userId: result.data.userId,
                    google_sub: result.data.google_sub,
                    nombre: result.data.nombre,
                    email: result.data.email,
                    rol: result.data.rol || 'Estudiante',
                    grado: result.data.grado,
                    seccion: result.data.seccion,
                    account_status: result.data.account_status,
                    loginTimestamp: Date.now(),
                    authMode: 'google'
                };

                // Persistencia de sesión
                localStorage.setItem('currentUser', JSON.stringify(userData));
                sessionStorage.setItem('currentUser', JSON.stringify(userData));

                console.log(`[IMA-AUTH] Sesión Google iniciada para ${userData.nombre}. Status: ${userData.account_status}`);

                // Solicitar token de acceso para Drive de forma proactiva
                if (tokenClient) {
                    tokenClient.requestAccessToken();
                }

                // Redirección basada en estado de perfil
                if (userData.account_status === 'incomplete') {
                    window.location.href = 'student-dashboard.html?onboarding=true';
                } else {
                    if (userData.rol === 'Profesor') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                }
            } else {
                alert("Error en la autenticación con Google: " + (result.message || "Fallo en la validación del servidor."));
            }
        } catch (error) {
            console.error('[IMA-AUTH] Error en login Google:', error);
            alert("No se pudo completar el inicio de sesión con Google. Revisa tu conexión.");
        } finally {
            if (window.GamesAdapter) window.GamesAdapter.showLoading(false);
        }
    };

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
                    // Si el usuario marcó "Recordarme", usamos localStorage (persiste tras cerrar navegador)
                    // Si no, usamos sessionStorage (se borra al cerrar la pestaña)
                    // Además, para evitar conflictos, limpiamos el otro storage.
                    const storage = rememberMe ? localStorage : sessionStorage;
                    const otherStorage = rememberMe ? sessionStorage : localStorage;

                    otherStorage.removeItem('currentUser');

                    // REQ: Persistencia de datos académicos reales (v3.3)
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
                    console.log(`[IMA-AUTH] Sesión iniciada para ${userData.nombre} (${userData.rol}). Recordar: ${rememberMe}`);

                    if (result.data.rol === 'Profesor') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
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
