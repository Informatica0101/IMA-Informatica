document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Si el usuario ya está logueado, redirigir al dashboard correspondiente (buscando en ambos storages)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (currentUser) {
        if (currentUser.rol === 'Profesor') {
            window.location.href = 'teacher-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
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
                    const storage = rememberMe ? localStorage : sessionStorage;

                    // REQ: Persistencia de datos académicos reales (v3.3)
                    const userData = {
                        ...result.data,
                        loginTimestamp: Date.now()
                    };

                    storage.setItem('currentUser', JSON.stringify(userData));
                    console.log(`[IMA-AUTH] Sesión iniciada para ${userData.nombre} (${userData.rol})`);

                    if (result.data.rol === 'Profesor') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                } else {
                    // Feedback detallado según respuesta del servidor
                    let msg = "Error al iniciar sesión.";
                    if (result.message?.includes("password")) msg = "La contraseña ingresada es incorrecta.";
                    else if (result.message?.includes("not found")) msg = "El usuario o correo no existe en el sistema.";
                    else msg = result.message || msg;

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
