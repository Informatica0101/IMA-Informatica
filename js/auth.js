document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nombre: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                grado: document.getElementById('grade').value,
                seccion: document.getElementById('section').value
            };

            if (!payload.nombre || !payload.email || !payload.password || !payload.grado) {
                alert('Por favor, complete todos los campos requeridos.');
                return;
            }

            try {
                document.body.style.cursor = 'wait';
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'register', payload: payload }),
                    // *** CORRECCIÓN CORS: Enviar como texto plano para evitar preflight ***
                    headers: { 'Content-Type': 'text/plain' }
                });

                // Como el backend responde con MimeType.TEXT, leemos la respuesta como texto...
                const responseText = await response.text();
                // ...y luego la parseamos como JSON.
                const result = JSON.parse(responseText);

                if (result.status === 'success') {
                    alert('¡Registro exitoso! Ahora puede iniciar sesión.');
                    window.location.href = 'login.html';
                } else {
                    alert('Error en el registro: ' + result.message);
                }

            } catch (error) {
                console.error('Error durante el registro:', error);
                alert('Ocurrió un error técnico. Revisa la consola para más detalles.');
            } finally {
                document.body.style.cursor = 'default';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            if (!payload.email || !payload.password) {
                alert('Por favor, ingrese su correo y contraseña.');
                return;
            }

            try {
                document.body.style.cursor = 'wait';
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'login', payload: payload }),
                    // *** CORRECCIÓN CORS: Enviar como texto plano ***
                    headers: { 'Content-Type': 'text/plain' }
                });

                const result = JSON.parse(await response.text());

                if (result.status === 'success' && result.data) {
                    localStorage.setItem('currentUser', JSON.stringify(result.data));
                    if (result.data.rol === 'Profesor') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                } else {
                    alert('Error de inicio de sesión: ' + result.message);
                }

            } catch (error) {
                console.error('Error durante el inicio de sesión:', error);
                alert('Ocurrió un error técnico.');
            } finally {
                document.body.style.cursor = 'default';
            }
        });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});
