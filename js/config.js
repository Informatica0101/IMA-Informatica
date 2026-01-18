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
  USER: 'https://script.google.com/macros/s/AKfycbyUmaNw4N_bC99PuX_9PeoRwZk70yR9jP9yGDrI8Q6fk486m0WszApz1PgqrJ4P7LvS/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbyILal440wcxW9ZfJ1YkbqV_3rIIv2Hvt3c3NNWuHuCGYuc2s2zVBbCR7gXE_pZavo/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbzDl2IO9RoMgf0JsZjku12JyovxjG3DqRrYpvrwDCvHZ0ZWshXqIt6MRga2VSU_Bm8h/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';
