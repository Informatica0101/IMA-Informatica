// --- INSTRUCCIONES DE DESPLIEGUE DE MICROSERVICIOS ---
// 1. Para cada carpeta en el directorio `backend` (ej. `user-service`), crea un NUEVO proyecto de Google Apps Script.
// 2. Copia el contenido del archivo `Code.gs` de esa carpeta en el proyecto de Apps Script.
// 3. Haz clic en "Implementar" > "Nueva implementación".
// 4. Selecciona "Aplicación web" como tipo, dale una descripción (ej. "User Service v1").
// 5. En "Quién tiene acceso", selecciona "Cualquiera".
// 6. Haz clic en "Implementar" y copia la URL de la aplicación web.
// 7. Pega esa URL en el campo correspondiente de este objeto de configuración.
// 8. Repite este proceso para CADA microservicio.
// ----------------------------------------------------------

const SERVICE_URLS = {
  // Pega aquí la URL del despliegue del microservicio de usuarios.
  USER: 'https://script.google.com/macros/s/AKfycbx4iO9-5XFU-VPWAx6hkUNzDxeaL9TDUxY-K5iMIh3gXn5ckZ9UAeiWeQ5bY7b2aFlk/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbxZg12QFgJh9QxIcSNmWqgWO3xItmEBP_ejSzidfCBmogqfSBtCA3jiPDh33SL4DC4/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbxpO5Y-aXXUkatVEfby7USZhW9n_vwOZjOD8vSl7QanqkMUFXM2v4jkj6-5AFjOf-8/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';
