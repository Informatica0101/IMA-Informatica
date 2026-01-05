document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    // =================================================================
    // LÓGICA DE REGISTRO
    // =================================================================
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener todos los valores del formulario.
            const nombre = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const grado = document.getElementById('grade').value;
            const section = document.getElementById('section').value;

            // Validación simple de campos.
            if (!nombre || !email || !password || !grado) {
                alert('Por favor, complete todos los campos requeridos.');
                return;
            }

            // El payload debe coincidir con la estructura esperada por el backend.
            const payload = { nombre, email, password, grado, seccion: section };

            try {
                // Muestra un indicador de carga.
                document.body.style.cursor = 'wait';

                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'register', payload: payload }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await response.json();

                if (result.status === 'success') {
                    alert('¡Registro exitoso! Ahora puede iniciar sesión.');
                    window.location.href = 'login.html';
                } else {
                    // Muestra un mensaje de error específico del backend.
                    alert('Error en el registro: ' + result.message);
                }

            } catch (error) {
                console.error('Error de red o de parseo:', error);
                alert('Ocurrió un error técnico al intentar registrar. Por favor, intente de nuevo.');
            } finally {
                // Oculta el indicador de carga.
                document.body.style.cursor = 'default';
            }
        });
    }

    // =================================================================
    // LÓGICA DE INICIO DE SESIÓN
    // =================================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ahora se usa 'email' en lugar de 'username'.
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Por favor, ingrese su correo y contraseña.');
                return;
            }

            // El payload debe coincidir con la nueva estructura.
            const payload = { email, password };

            try {
                document.body.style.cursor = 'wait';

                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'login', payload: payload }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await response.json();

                if (result.status === 'success' && result.data) {
                    // Almacena los datos del usuario en localStorage para la sesión.
                    localStorage.setItem('currentUser', JSON.stringify(result.data));

                    // Redirige según el rol del usuario.
                    if (result.data.rol === 'Profesor') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                } else {
                    alert('Error de inicio de sesión: ' + result.message);
                }

            } catch (error) {
                console.error('Error de red o de parseo:', error);
                alert('Ocurrió un error técnico al intentar iniciar sesión.');
            } finally {
                document.body.style.cursor = 'default';
            }
        });
    }

    // =================================================================
    // LÓGICA DE CIERRE DE SESIÓN
    // =================================================================
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Limpia los datos de la sesión.
            localStorage.removeItem('currentUser');
            // Redirige a la página de inicio de sesión.
            window.location.href = 'login.html';
        });
    }
});
