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
  USER: 'https://script.google.com/macros/s/AKfycbwgkTOOxqxeCJB0s5iLcwywmAx6C-EEHKgDO7cKMsS3e8XzzU-iUrIUkBh5mwPkF7uf/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycby2mX2UHrGe0KyhBMomwmgYNvHge2Yw0HON6_jm4-mCmYrkpiZHoerwxMUm0M4Nbtg/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbwyLYiXI3KHmBm8tr7-Gr8QXP-k5jPe8wlX622C8nvwRD2EV0Uu5ViwT6RVyLb4wz4/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';

/**
 * CONFIGURACIÓN ACADÉMICA CENTRALIZADA
 * Punto único de verdad para el período escolar vigente.
 * Valores: "Primer Parcial", "Segundo Parcial", "Tercer Parcial", "Cuarto Parcial"
 */
window.PARCIAL_ACTUAL = "Segundo Parcial";
