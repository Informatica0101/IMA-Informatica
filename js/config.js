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
  USER: 'https://script.google.com/macros/s/AKfycbyMJzjyGT5MW3vS72cmDM3M94p-MvV719MxTai0rhAjUPb9NLH_b0oHtr4g4Ofqgzuh/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbw-YEGeeKhoVrJQtjejaaHp6TzvV_0-3CpF63Zea62NqLt2PnCiGvH9OgscKaRKE30/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbwxzCbud6qeXH9vxsoSnMQVDwCs_hZbivfWuimAe0fDnDslNtgsrbuZD9X0v8xVS3ci/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';
