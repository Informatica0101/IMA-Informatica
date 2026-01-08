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
  USER: 'URL_DEL_NUEVO_SERVICIO_DE_AUTENTICACION_SIMPLIFICADO',

  // Pega aquí la URL del desplieg-ue del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbzqQDzogIwMMZxMSRGd-OKTUG16Um6xlFNz5S4yA2yrHitdra708Op5-_SyGs33TgmO/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbzz04XLSkhzhUboxpHYjaSP8B8jevpePbkW7UD7PUjWsRlOmKaQK0xEekVaBGNSW0m5/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';
