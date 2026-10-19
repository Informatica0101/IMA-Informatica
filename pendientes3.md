# REGISTRO DE TAREAS PENDIENTES DE RESOLUCIÓN, OPTIMIZACIÓN Y MEJORA - FASE 3

Este documento almacena las tareas de resolución, optimización y mejora derivadas de las auditorías funcionales y técnicas de la plataforma.

**REGLA DE ORO INTERNA DE REGISTRO:**
- Bajo NINGUNA circunstancia se deben borrar, sobrescribir o eliminar tareas previamente registradas en este documento.
- Todas las nuevas tareas identificadas deben agregarse estrictamente al final del archivo (`append`).
- `Pendientes.md` y `pendientes2.md` se mantienen 100% intactos e inalterados.

---

## TAREAS DERIVADAS DE LA AUDITORÍA DE FASE 3: EXPERIENCIA DE USUARIO Y NAVEGACIÓN UNIFICADA

### TAREA T-UX-01 [P1]: Impulsar Manejador Centralizado de Expiración de Sesión y Excepciones HTTP
- **Archivos Afectados:** `js/api.js`, `js/ui-common.js`.
- **Descripción:** Interceptar códigos HTTP 401/403 en `fetchApi` para disparar una alerta modal limpia ("Su sesión ha expirado") y redirigir de forma segura al login, evitando que peticiones secundarias fallen en silencio.
- **Criterios de Aceptación:**
  1. Si un token/sesión caduca durante el uso de la aplicación, cualquier llamada a API abre un modal de advertencia en lugar de congelar la UI.
  2. Al presionar "Iniciar Sesión", redirige a `login.html` preservando la última URL intentada si es seguro.
- **Riesgo de Regresión:** Bajo.

### TAREA T-UX-02 [P1]: Implementar Buscador Global Unificado Omnibox (Shortcut Ctrl+K / Cmd+K)
- **Archivos Afectados:** `js/ui-common.js`, `backend/user-service/Code.gs`, HTML Headers.
- **Descripción:** Desarrollar un componente de búsqueda rápida modal (Omnibox) accesible universalmente mediante el atajo de teclado `Ctrl+K` / `Cmd+K`. Permite buscar simultáneamente estudiantes, empleados, facturas, comprobantes, solicitudes y opciones de menú desde cualquier pantalla.
- **Criterios de Aceptación:**
  1. Presionar `Ctrl+K` en cualquier dashboard despliega el modal Omnibox con foco automático.
  2. La consulta busca a través del backend (`getStudents`, `getInstitutionalReportCatalog`, etc.) y categoriza los resultados.
  3. Seleccionar un resultado redirige o abre la vista/modal de detalle correspondiente.
- **Riesgo de Regresión:** Bajo.

### TAREA T-UX-03 [P2]: Unificar Guardián de Cambios No Guardados (`Unsaved Changes Guard`) en Formularios y Modales
- **Archivos Afectados:** `js/ui-common.js`.
- **Descripción:** Implementar un mecanismo ligero que detecte cuando un formulario o modal secundario tiene campos modificados (`dirty state`) e intercepte el cierre accidental (por tecla ESC, clic fuera o navegación de pestaña) solicitando confirmación.
- **Criterios de Aceptación:**
  1. Al intentar cerrar un modal con datos no guardados, se presenta una ventana de confirmación "¿Desea salir sin guardar los cambios?".
  2. Si el usuario confirma, el modal se cierra; si cancela, el contenido permanece intacto.
- **Riesgo de Regresión:** Bajo.

### TAREA T-UX-04 [P2]: Añadir Timestamp de Frescura de Datos en Paneles y Controles de Recarga
- **Archivos Afectados:** `js/ui-common.js`, HTML Dashboards.
- **Descripción:** Incluir en las tarjetas de indicadores de los dashboards una etiqueta de hora de última actualización ("Actualizado a las 10:45 AM") junto a un botón de refresco rápido.
- **Criterios de Aceptación:**
  1. Cada panel de métricas muestra visiblemente el momento de la última sincronización.
  2. El botón de refresco permite actualizar los datos del panel sin recargar la página completa.
- **Riesgo de Regresión:** Nulo.

### TAREA T-UX-05 [P2]: Normalización Avanzada de Cadenas y Búsqueda Tolerante a Acentos/Espacios
- **Archivos Afectados:** `js/ui-common.js`.
- **Descripción:** Crear e integrar una función utility `normalizeSearchTerm` que elimine diacríticos (acentos, tildes) y espacios múltiples antes de aplicar filtros en tablas frontend.
- **Criterios de Aceptación:**
  1. Buscar "perez" encuentra registros como "Pérez".
  2. Espacios antes o después de la cadena de búsqueda se ignoran automáticamente.
- **Riesgo de Regresión:** Nulo.

### TAREA T-UX-06 [P3]: Badge Interactivo de Cola de Sincronización Offline PWA
- **Archivos Afectados:** `js/ui-common.js`, `sw.js`.
- **Descripción:** Enriquecer el badge de estado de conexión (`#online-status-badge`) para mostrar un contador flotante con la cantidad de transacciones/operaciones guardadas en IndexedDB pendientes de envío al servidor.
- **Criterios de Aceptación:**
  1. Cuando la aplicación está sin conexión y el usuario realiza acciones, el badge muestra "Sin conexión (3 pendientes)".
  2. Al recuperar la conexión, sincroniza automáticamente y actualiza el contador a 0.
- **Riesgo de Regresión:** Nulo.

### TAREA T-UX-07 [P3]: Agrupación Cronológica en Centro de Notificaciones Unificado
- **Archivos Afectados:** `js/ui-common.js`.
- **Descripción:** Organizar las notificaciones en el dropdown del encabezado en bloques cronológicos ("Hoy", "Ayer", "Esta semana", "Anteriores").
- **Criterios de Aceptación:**
  1. El desplegable de notificaciones clasifica los elementos por su antigüedad.
  2. Se mantiene la capacidad de marcar notificaciones individuales o masivas como leídas.
- **Riesgo de Regresión:** Nulo.
