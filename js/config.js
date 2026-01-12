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
  USER: 'https://script.google.com/macros/s/AKfycbyHF0DDhzlm22LqUWrkgWdSf-eMfn8uMR1Pf50y-_DThTaOOnKPN5S9Z_ztASe_00yX/exec',

  // Pega aquí la URL del despliegue del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbyDR-o42-X5badbVmaOKA0iXWQDcefJRzKbWtvh5r4zMn1jce7LApaI2OQFo8J0nMM/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbygkT668Up66_VEYc75AWyLY1j_JNfFtm9xJYKe425fEmWVnrGQyMgbTZhuCwGMqmGP/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';
