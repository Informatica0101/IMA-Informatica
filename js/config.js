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
  USER: 'https://script.google.com/macros/s/AKfycbzsDF7TIq0ccOBIeLULCi7JErq0NZ6H2Z6GbUwEe48_mNxEp29xSh9maRoUe3hlgeVg/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbwDKCvCSl55eekJRK3PfcPg_Q9sWij0n52JzFV5JO2HRmaAlm2NFRdfauygchyNXzg/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbwnpVr_rgjm6fYlQFiF95BSroQ2jfvl-jLf4Ulu6QgWVsr6BtalFtW1bLtdzk8GwYad/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';
