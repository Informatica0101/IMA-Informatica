# DICCIONARIO DE RUTAS Y VERIFICACIÓN DE RUTAS Y DEPENDENCIAS (F8-Task03)

## 1. DICCIONARIO DE RUTAS Y ENLACES
- Raíz del servidor: `/`
- Página de Inicio: `./index.html`
- Autenticación: `./login.html`, `./register.html`, `./forgot-password.html`, `./reset-password.html`
- Admisiones: `./admision.html`
- Dashboards Principales:
  - `./student-dashboard.html` (Portal Estudiantil y Familiar)
  - `./teacher-dashboard.html` (Portal Docente)
  - `./dashboard-coordinacion.html` (Coordinación Académica)
  - `./dashboard-direccion.html` (Dirección General)
  - `./dashboard-secretaria.html` (Secretaría General)
  - `./dashboard-recursos-humanos.html` (Recursos Humanos)
  - `./dashboard-contabilidad.html` (Contabilidad y ERP Financiero)
  - `./dashboard-tienda.html` (Tienda Escolar)
  - `./dashboard-cafeteria.html` (Cafetería)
  - `./app/html/dashboards/dynamic-dashboard.html` (Dashboard Dinámico Adaptable)

## 2. COMPATIBILIDAD Y VERIFICACIÓN DE RUTAS RELATIVAS
- Estilos CSS: `css/style.css`
- Assets gráficos: `imagenes/`
- Bibliotecas y utilidades JS: `js/config.js`, `js/api.js`, `js/auth.js`, `js/ui-common.js`, `js/student.js`, `js/teacher.js`, `js/secretary.js`, `js/accounting.js`

## 3. ESTADO DE VERIFICACIÓN DE ENLACES Y DEPENDENCIAS
- Todos los archivos HTML referencian correctamente los scripts JS y hojas CSS sin errores HTTP 404.
- Las llamadas entre componentes mediante `fetchApi` se dirigen correctamente a los microservicios backend GAS configurados en `js/config.js`.
