document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    async function fetchAuth(action, payload) {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload }),
            headers: { 'Content-Type': 'text/plain' }
        });
        return await response.json();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const result = await fetchAuth('loginUser', { email, password });
                if (result.status === 'success') {
                    localStorage.setItem('currentUser', JSON.stringify(result.data));
                    if (result.data.rol === 'Profesor') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                grado: document.getElementById('grado').value,
                seccion: document.getElementById('seccion').value,
                password: document.getElementById('password').value
            };
            try {
                const result = await fetchAuth('registerUser', payload);
                if (result.status === 'success') {
                    alert('Registro exitoso. Ahora puedes iniciar sesión.');
                    window.location.href = 'login.html';
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }
});
