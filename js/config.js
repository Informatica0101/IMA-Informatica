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
  USER: 'https://script.google.com/macros/s/AKfycbxjA5G8M50hI0f1uXObnUxM3JI9UiRbeTtKYtW6LgD0gOX8tI_H2_Es7LVeC9Fri4dP/exec',

  // Pega aquí la URL del despliegue del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbzfL9-9o-XXFHFfFgsa60RJkmsbTzPoFdf_6FFkWZU0nq-hewjMgvbKdHtzUxiVwa0/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbwCJ3Lqnx6fZZdw-mLt_qacdB0FtS6UCNkAEHSlmQ35aAvGBTD0AiGSfRC-lq8P5qsG/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';
