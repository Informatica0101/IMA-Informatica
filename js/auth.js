document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const grado = document.getElementById('grade').value;
            const section = document.getElementById('section').value;

            if (!nombre || !email || !password || !grado) {
                alert('Por favor, complete todos los campos requeridos.');
                return;
            }
            const payload = { nombre, email, password, grado, seccion: section };

            try {
                document.body.style.cursor = 'wait';
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'register', payload: payload }),
                    headers: { 'Content-Type': 'application/json' }
                });

                // --- INICIO DE LA LÓGICA DE DEPURACIÓN ---
                // Clona la respuesta para poder leerla dos veces (una como texto, otra como JSON)
                const responseClone = response.clone();

                // Lee la respuesta como texto y la imprime en la consola.
                const rawResponse = await responseClone.text();
                console.log("--- RESPUESTA CRUDA DEL SERVIDOR ---");
                console.log(rawResponse);
                console.log("------------------------------------");
                // --- FIN DE LA LÓGICA DE DEPURACIÓN ---

                // Ahora, intenta procesar la respuesta original como JSON
                const result = await response.json();

                if (result.status === 'success') {
                    alert('¡Registro exitoso! Ahora puede iniciar sesión.');
                    window.location.href = 'login.html';
                } else {
                    // Muestra el error específico del backend que ahora sí debería ser JSON
                    alert('Error en el registro: ' + result.message);
                }

            } catch (error) {
                console.error('Error de red o de parseo JSON:', error);
                alert('Ocurrió un error técnico al intentar registrar. Por favor, revise la consola del navegador para más detalles.');
            } finally {
                document.body.style.cursor = 'default';
            }
        });
    }

    if (loginForm) {
        // ... (lógica de login sin cambios)
    }
    // ... (lógica de logout sin cambios)
});
