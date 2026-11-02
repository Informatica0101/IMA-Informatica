# INVENTARIO Y MAPA DE DEPENDENCIAS DEL REPOSOTORIO (F8-Task02)

## 1. VISTAS Y PANELES PRINCIPALES (HTML)
- `index.html`: Portal principal público de la institución.
- `login.html`: Autenticación y acceso al sistema.
- `register.html`: Registro público de nuevos usuarios/aspirantes.
- `forgot-password.html` / `reset-password.html`: Flujo de recuperación de credenciales.
- `admision.html`: Formulario público de admisiones y consulta de estado de trámite.
- `student-dashboard.html`: Panel para estudiantes y tutores (Portal Familiar).
- `teacher-dashboard.html`: Panel docente para calificaciones, entregas, exámenes y planificación.
- `dashboard-coordinacion.html`: Panel de referencia para coordinadores académicos y jefes de área.
- `dashboard-direccion.html`: Consola administrativa de dirección general, aprobaciones y roles.
- `dashboard-secretaria.html`: Consola de secretaría general y admisiones.
- `dashboard-recursos-humanos.html`: Panel de gestión laboral, planillas e incidencias de personal.
- `dashboard-contabilidad.html`: Panel financiero, facturación, cuentas por cobrar/pagar y CUV.
- `dashboard-tienda.html` / `dashboard-cafeteria.html`: Módulos comerciales y de servicios.
- `app/html/dashboards/dynamic-dashboard.html`: Interfaz dinámica adaptable por rol y capacidades.

## 2. CLIENTE Y MÓDULOS DE CONTROL (JavaScript)
- `js/config.js`: Configuración global, catálogo de capacidades, módulos, responsabilidades y contratos dinámicos.
- `js/api.js`: Cliente HTTP universal (`fetchApi`) con descubrimiento de servicios, reintentos y fallback.
- `js/auth.js`: Lógica de autenticación, almacenamiento de sesión HMAC-SHA256 y enrutamiento post-login.
- `js/ui-common.js`: Componentes compartidos UI, Omnibox (Ctrl+K), modales, paginación y utilidades de ámbito.
- `js/student.js`: Controladores del Portal Familiar, multiestudiante, trámites y calificaciones.
- `js/teacher.js`: Controladores docentes para evaluación por rúbricas, exámenes, horarios y PDF preview.
- `js/secretary.js`: Controladores de secretaría, admisiones, dirección y coordinación académica.
- `js/accounting.js`: Controladores de finanzas, recursos humanos y comercio.

## 3. MICROSERVICIOS BACKEND (Google Apps Script)
- `backend/user-service/Code.gs`: Servicio USER para autenticación, roles, ámbitos, notificaciones y usuarios.
- `backend/academic-service/Code.gs`: Servicio ACADEMIC para expedientes, matrículas, horarios, admisiones y sílabos.
- `backend/task-service/Code.gs`: Servicio TASK para tareas, entregas, rúbricas, PDF preview y cuotas Drive.
- `backend/exam-service/Code.gs`: Servicio EXAM para cuestionarios, exámenes, bancos de reactivos y analíticas.
- `backend/accounting-service/Code.gs`: Servicio ACCOUNTING para cobros, facturas, CUV, planillas y recursos humanos.
- `backend/developer-service/Code.gs`: Servicio DEVELOPER para plano de control, logs centralizados y regresión.

## 4. ESTILOS Y ASSETS
- `css/style.css`: Hoja de estilos institucionales, variables cromáticas y reglas de impresión.
- `imagenes/`: Logotipos, diagramas y recursos gráficos institucionales.
