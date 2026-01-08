document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Si el usuario ya está logueado, redirigir al dashboard correspondiente
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
            const email = e.target.email.value;
            const password = e.target.password.value;

            try {
                const result = await fetchApi('USER', 'loginUser', { email, password });

                if (result.status === 'success' && result.data) {
                    localStorage.setItem('currentUser', JSON.stringify(result.data));
                    if (result.data.rol === 'Profesor') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                } else {
                    alert(result.message || 'Error al iniciar sesión.');
                }
            } catch (error) {
                console.error('Error en el fetch:', error);
                alert('Hubo un problema de conexión. Revisa la consola.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nombre: e.target.nombre.value,
                grado: e.target.grado.value,
                seccion: e.target.seccion.value,
                email: e.target.email.value,
                password: e.target.password.value
            };

            try {
                const result = await fetchApi('USER', 'registerUser', payload);

                if (result.status === 'success') {
                    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                    window.location.href = 'login.html';
                } else {
                    alert(result.message || 'Error en el registro.');
                }
            } catch (error) {
                console.error('Error en el fetch:', error);
                alert('Hubo un problema de conexión. Revisa la consola.');
            }
        });
    }
});
