# PENDIENTES - FASE 8 Y ANEXO: DASHBOARDS DINÁMICOS Y MODULARIZACIÓN

## PRIORIDAD P1 - CRÍTICA Y ALTA PRIORIDAD OPERATIVA

---

### [X] [TAREA-F8-MANT-01] Implementar el seguimiento preventivo de las cuotas y la disponibilidad de almacenamiento en Google Drive
- **Origen del Hallazgo:** `AUDITORIA_FASE_8_AULA_VIRTUAL_APRENDIZAJE.md` / Tarea F8-MANT-01 (P1 · Supervisión de Almacenamiento Drive)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Mantenimiento preventivo y observabilidad)
- **Archivos Involucrados:**
  - `backend/task-service/Code.gs`
  - Componentes de administración, configuración y supervisión
- **Dependencias Expuestas:** Carga de archivos, almacenamiento de materiales, entregas estudiantiles y servicios de supervisión
- **Descripción del Alcance:**
  Verificar periódicamente las cuotas de almacenamiento de Google Drive utilizadas por el aula virtual para materiales, entregas y versiones, detectando riesgos de capacidad antes de que impidan la entrega de trabajos o publicación de contenidos.

  Requisitos Funcionales:
  1. Identificar las ubicaciones y carpetas de Google Drive utilizadas por el servicio para materiales, tareas, entregas y versiones.
  2. Implementar un mecanismo de supervisión periódica que consulte capacidad total, espacio utilizado, espacio disponible y tendencia.
  3. Establecer umbrales configurables de advertencia (e.g. 80%, 90%, 95%) y generar alertas administrativas.
  4. En cargas fragmentadas o fallos por cuota, no confirmar entregas cuyos archivos no se hayan almacenado correctamente.
  5. Evitar archivos huérganos y mostrar mensajes explicativos sin eliminar archivos académicos válidos automáticamente.
  6. Registrar eventos de supervisión distinguiendo entre estado normal, advertencia, riesgo elevado y error confirmado.
- **Criterios de Aceptación:**
  - CA-F8-010: Se identifican y monitorean las ubicaciones de almacenamiento utilizadas por el aula virtual.
  - CA-F8-011: La simulación de cuota cercana al límite genera alertas preventivas para administradores.
  - CA-F8-012: Las cargas fallidas por espacio no se confirman como entregas registradas exitosamente.
- **Estado:** [X] Completado

---

### [ ] [TAREA-AD-01] Crear una arquitectura de dashboards dinámicos para roles configurables
- **Origen del Hallazgo:** Anexo de Tareas: Dashboards dinámicos / Tarea AD-01 (P1 · Arquitectura de Dashboards)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Arquitectura base de interfaz adaptable)
- **Archivos Involucrados:**
  - `app/html/dashboards/dynamic-dashboard.html`
  - `js/ui-common.js`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Autenticación, asignación de roles, contratos de integración y RBAC
- **Descripción del Alcance:**
  Permitir incorporar nuevos roles institucionales y asignarles funciones dinámicas adaptadas a sus responsabilidades, permisos y ámbito académico asignado sin desarrollar páginas HTML independientes para cada cargo.

  Requisitos Funcionales:
  1. Crear una interfaz HTML dedicada a dashboards dinámicos separada de páginas estáticas.
  2. Implementar una estructura reutilizable que construya la interfaz según la configuración del rol y permisos efectivos.
  3. Permitir configurar nuevos roles desde herramientas administrativas asignando nombre, descripción, área, capacidades y ámbitos.
  4. Soportar múltiples roles o responsabilidades simultáneas por usuario y ámbitos variables por asignación individual.
  5. Permitir desactivar roles conservando el historial institucional.
  6. Definir comportamiento controlado para roles sin módulos asignados o incompletos sin depender de nombres de roles en código.
- **Criterios de Aceptación:**
  - CA-AD-101: Se puede crear un rol nuevo desde la interfaz administrativa autorizada.
  - CA-AD-102: El dashboard presenta únicamente los módulos correspondientes a la configuración efectiva del usuario.
  - CA-AD-103: Los roles desconocidos o sin permisos no obtienen acceso por defecto.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-AD-02] Implementar un catálogo central de responsabilidades, capacidades y módulos
- **Origen del Hallazgo:** Anexo de Tareas: Dashboards dinámicos / Tarea AD-02 (P1 · Catálogo de Responsabilidades)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Catálogo de capacidades reutilizables)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/developer-service/Code.gs`
  - `js/config.js`
- **Dependencias Expuestas:** Permisos RBAC, módulos institucionales, control de acceso
- **Descripción del Alcance:**
  Construir roles a partir de responsabilidades reutilizables compuestas por capacidades granulares (Consultar, Crear, Editar, Eliminar, Aprobar, Asignar, Exportar, Administrar).

  Requisitos Funcionales:
  1. Definir un catálogo central de módulos y capacidades representando las funciones reales disponibles.
  2. Agrupar capacidades en responsabilidades institucionales (Coordinación, Planificación, Gestión de Docentes, Supervisión, Horarios, etc.).
  3. Asignar responsabilidades a roles y roles a usuarios especificando ámbito de actuación.
  4. Diferenciar operaciones explícitas (Consultar, Crear, Editar, Eliminar, Aprobar, Asignar, Exportar, Administrar).
  5. Registrar auditoría de creación y modificación de roles y mantener referencias históricas al desactivar responsabilidades.
- **Criterios de Aceptación:**
  - CA-AD-104: Una misma capacidad se reutiliza en diferentes roles con permisos y ámbitos independientes.
  - CA-AD-105: Retirar permisos de una responsabilidad no elimina funciones compartidas por otros roles.
  - CA-AD-106: Las asignaciones de roles y responsabilidades registran trazabilidad completa.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-AD-03] Implementar la gestión del ámbito de actuación de los roles
- **Origen del Hallazgo:** Anexo de Tareas: Dashboards dinámicos / Tarea AD-03 (P1 · Ámbito de Actuación)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Aislamiento contextual de datos)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** Unidades académicas, departamentos, grados, secciones y validación de contexto
- **Descripción del Alcance:**
  Asignar ámbitos específicos de actuación (nivel educativo, departamento, carrera, asignatura, grado, sección o período) a cada responsabilidad de usuario, verificando el ámbito en lectura y escritura.

  Requisitos Funcionales:
  1. Permitir asignar un ámbito específico (Prebásica, Básica, Media, Departamentos, Carreras, Asignaturas, Secciones) a cada responsabilidad.
  2. Soportar coordinaciones por departamento o por carrera de bachillerato.
  3. Validar el ámbito tanto en consultas frontend/backend como en operaciones de mutación.
  4. Impedir la inferencia de permisos adicionales fuera del alcance explícito configurado.
- **Criterios de Aceptación:**
  - CA-AD-107: Los filtros, listas y búsquedas respetan estrictamente los ámbitos asignados al usuario.
  - CA-AD-108: Intentos de consultar o modificar registros fuera del ámbito autorizado son rechazados por el backend.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-AD-04] Desarrollar el dashboard de coordinador académico como implementación de referencia
- **Origen del Hallazgo:** Anexo de Tareas: Dashboards dinámicos / Tarea AD-04 (P1 · Referencia Coordinación)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Caso de referencia funcional)
- **Archivos Involucrados:**
  - `dashboard-coordinacion.html`
  - `js/secretary.js` / `js/teacher.js`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Asignaciones docentes, jornalizaciones, sílabos, eventos, horarios y reportes
- **Descripción del Alcance:**
  Construir el dashboard de coordinación académica como primer caso de referencia completo para verificar roles con múltiples responsabilidades, herramientas compartidas y ámbitos variables.

  Requisitos Funcionales:
  1. Panel de resumen académico con indicadores reales de docentes coordinados, jornalizaciones, sílabos, eventos y tareas pendientes.
  2. Supervisión de docentes, cargas académicas y detección de asignaturas sin docente asignado.
  3. Supervisión, observaciones, solicitudes de corrección, aprobación y rechazo de jornalizaciones y sílabos reutilizando flujos existentes.
  4. Supervisión de documentación académica, calendario de eventos, revisión de horarios y generación de reportes de cumplimiento.
- **Criterios de Aceptación:**
  - CA-AD-109: El dashboard se adapta dinámicamente a las responsabilidades y ámbitos configurados para el coordinador.
  - CA-AD-110: Es posible crear coordinadores por nivel, departamento o carrera sin duplicar código.
  - CA-AD-111: Todas las aprobaciones y revisiones conservan trazabilidad institucional.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-AD-05] Integrar los dashboards dinámicos con los módulos y servicios existentes
- **Origen del Hallazgo:** Anexo de Tareas: Dashboards dinámicos / Tarea AD-05 (P1 · Integración de Módulos)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Reutilización de servicios)
- **Archivos Involucrados:**
  - `js/api.js`
  - `js/config.js`
  - Backend microservices (`USER`, `ACADEMIC`, `TASK`, `EXAM`, `ACCOUNTING`)
- **Dependencias Expuestas:** Descubrimiento de servicios, contratos API, adaptadores frontend
- **Descripción del Alcance:**
  Conectar los dashboards dinámicos con la lógica y servicios backend existentes mediante adaptadores y contratos de integración estables sin duplicar funciones ni fuentes de datos.

  Requisitos Funcionales:
  1. Inventariar funciones existentes y crear adaptadores de interfaz para invocar operaciones mediante contratos vigentes.
  2. Definir un contrato de integración por módulo (ID estable, capacidades, servicio responsable, operaciones, parámetros, permisos).
  3. Garantizar que fallos en un módulo opcional no bloqueen la carga del resto del dashboard.
  4. Registrar errores de integración con contexto técnico para diagnóstico.
- **Criterios de Aceptación:**
  - CA-AD-112: Los módulos dinámicos reutilizan las operaciones backend existentes sin fuentes de datos duplicadas.
  - CA-AD-113: Los errores en módulos individuales son aislados sin impedir la navegación en otros componentes.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-AD-06] Centralizar y verificar la autorización efectiva de cada operación
- **Origen del Hallazgo:** Anexo de Tareas: Seguridad y roles / Tarea AD-06 (P1 · Verificación Backend)
- **Prioridad:** P1
- **Severidad/Clasificación:** Crítica (Seguridad y denegación por defecto)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/task-service/Code.gs`
- **Dependencias Expuestas:** Tokens HMAC-SHA256, verificación de roles, validación de ámbito
- **Descripción del Alcance:**
  Garantizar que toda operación protegida en el backend valide la identidad, rol, responsabilidad, operación solicitada y ámbito de datos, aplicando denegación por defecto.

  Requisitos Funcionales:
  1. Validar identidad, permisos y ámbito en el servidor en cada solicitud HTTP.
  2. No confiar en parámetros o identificadores enviados por el cliente sin validación en base de datos.
  3. Aplicar denegación por defecto y rechazar solicitudes ante configuraciones no verificables.
  4. Invalidate o actualizar permisos efectivos de inmediato al retirar o modificar una responsabilidad.
  5. Registrar intentos no autorizados y escalamientos de privilegios.
- **Criterios de Aceptación:**
  - CA-AD-114: Intentos de invocar endpoints directamente sin autorización son rechazados en el backend.
  - CA-AD-115: Manipulación de parámetros en el navegador no permite acceder a datos fuera del ámbito autorizado.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-AD-07] Crear una interfaz administrativa para configurar los dashboards y las responsabilidades
- **Origen del Hallazgo:** Anexo de Tareas: Seguridad y roles / Tarea AD-07 (P1 · Consola Administrativa de Roles)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Administración de roles)
- **Archivos Involucrados:**
  - `dashboard-direccion.html` / `dashboard-secretaria.html`
  - `js/secretary.js`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Gestión de usuarios, catálogo de capacidades, vista previa de interfaz
- **Descripción del Alcance:**
  Proporcionar una interfaz administrativa para crear, editar, consultar, activar y desactivar roles, asociar responsabilidades y capacidades, y previsualizar dashboards.

  Requisitos Funcionales:
  1. Consola visual para crear, editar y desactivar roles asociando responsabilidades y ámbitos.
  2. Permitir previsualizar el dashboard resultante sin conceder permisos reales ni exponer datos.
  3. Impedir la eliminación física de configuraciones requeridas por registros históricos.
  4. Disponer de mecanismo de recuperación a la última configuración válida ante errores de rol.
- **Criterios de Aceptación:**
  - CA-AD-116: Administradores autorizados pueden configurar nuevos roles sin modificar archivos HTML fuente.
  - CA-AD-117: Las configuraciones inválidas son rechazadas en el servidor antes de guardarse como activas.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-MOD-01] Auditar los archivos existentes y elaborar un inventario de dependencias
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-01 (P1 · Inventario de Dependencias)
- **Prioridad:** P1
- **Severidad/Clasificación:** Crítica (Análisis de dependencias)
- **Archivos Involucrados:**
  - Todo el repositorio (`app/`, `backend/`, `js/`, `css/`, `index.htm`)
- **Dependencias Expuestas:** Todas las referencias cruzadas de scripts, links, importaciones y endpoints
- **Descripción del Alcance:**
  Auditar minuciosamente todos los archivos del repositorio (respetando `index.htm`) y mapear dependencias directas e indirectas, referencias de scripts, llamadas API y funciones compartidas.

  Requisitos Funcionales:
  1. Inventariar todos los archivos HTML, JS, CSS, motores, servicios, plantillas y assets.
  2. Identificar funciones duplicadas, dependencias circulares, variables globales y acoplamientos.
  3. Mapear referencias en etiquetas script, link, importaciones, llamadas backend y rutas.
  4. Documentar contratos de comunicación y puntos de entrada sin alterar el nombre de `index.htm`.
- **Criterios de Aceptación:**
  - CA-MOD-101: El inventario cubre el 100% de los archivos del repositorio y sus dependencias explícitas.
  - CA-MOD-102: Se genera el mapa de dependencias formal antes de iniciar traslados de archivos.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-MOD-02] Definir y aplicar una estructura modular de carpetas
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-02 (P1 · Estructura Modular)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Organización de código)
- **Archivos Involucrados:**
  - Estructura de carpetas del proyecto
- **Dependencias Expuestas:** Procesos de despliegue, clasp, servidores locales, rutas de importación
- **Descripción del Alcance:**
  Organizar el repositorio en una estructura modular limpia (`app/html`, `app/js`, `app/css`, `app/assets`, `backend/`, `tests/`, `docs/`) conservando `index.htm` en la raíz.

  Requisitos Funcionales:
  1. Mantener `index.htm` en la raíz conservando su comportamiento.
  2. Separar HTMLs de páginas/componentes, scripts JS, CSS, motores y recursos estáticos en la carpeta `app/`.
  3. Garantizar que la herramienta de despliegue (e.g. clasp para Google Apps Script) reconozca la estructura.
  4. Prevenir la exposición de archivos sensibles o credenciales en carpetas públicas.
- **Criterios de Aceptación:**
  - CA-MOD-103: Los archivos se agrupan por función y responsabilidad dentro de `app/` y `backend/`.
  - CA-MOD-104: `index.htm` permanece en la raíz y la plataforma carga correctamente todos sus recursos.
\n\n> **Nota de Arquitectura:** Las estructuras que están en el anexo A (carpetas del repositorio) y en el anexo B (hojas y spreadsheets por rol) son ejemplos de una estructura recomendable, y no una estructura obligatoria.\n- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-MOD-03] Modularizar los archivos grandes sin eliminar ni duplicar funciones
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-03 (P1 · Descomposición de Archivos Monolíticos)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Descomposición de código)
- **Archivos Involucrados:**
  - `js/ui-common.js`, `js/secretary.js`, `js/teacher.js`, `js/student.js`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Contratos de funciones públicas, namespaces, adaptadores de compatibilidad
- **Descripción del Alcance:**
  Dividir archivos monolíticos extensos por responsabilidad funcional (presentación, estado UI, lógica de negocio, servicios, validación) manteniendo contratos públicos.

  Requisitos Funcionales:
  1. Dividir archivos grandes por responsabilidad funcional sin perder funciones.
  2. Mantener nombres de operaciones públicas o proveer adaptadores de compatibilidad.
  3. Centralizar utilidades compartidas evitando redefiniciones duplicadas.
  4. Eliminar implementaciones antiguas únicamente tras verificar la ausencia de consumidores activos.
- **Criterios de Aceptación:**
  - CA-MOD-105: Cada función existente conserva un contrato de invocación válido y compatible.
  - CA-MOD-106: No existen funciones duplicadas ni colisiones en el ámbito global.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-MOD-04] Actualizar todas las rutas y dependencias después de reorganizar el repositorio
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-04 (P1 · Actualización de Rutas)
- **Prioridad:** P1
- **Severidad/Clasificación:** Crítica (Integridad de referencias)
- **Archivos Involucrados:**
  - Todos los archivos HTML, JS, CSS y configuraciones de despliegue
- **Dependencias Expuestas:** Enlaces, etiquetas script/link, importaciones dinámicas, rutas de assets
- **Descripción del Alcance:**
  Actualizar y verificar cada ruta, script tag, hoja de estilo, imagen e importación afectada por la reorganización modular.

  Requisitos Funcionales:
  1. Actualizar rutas de scripts, CSS, imágenes, fuentes e importaciones estáticas/dinámicas.
  2. Actualizar referencias a plantillas, navegación y endpoints.
  3. Garantizar compatibilidad de rutas relativas y sensibilidad a mayúsculas/minúsculas.
  4. Eliminar referencias obsoletas o residuales.
- **Criterios de Aceptación:**
  - CA-MOD-107: No existen errores HTTP 404 ni cargas fallidas de scripts o assets en consola.
  - CA-MOD-108: Todos los módulos estáticos y dinámicos se resuelven correctamente en producción.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-MOD-05] Actualizar el mapa de dependencias y la documentación arquitectónica
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-05 (P1 · Documentación Arquitectónica)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Documentación de arquitectura)
- **Archivos Involucrados:**
  - `MapaDependencias.md`
  - `docs/architecture/`
- **Dependencias Expuestas:** Estructura completa del repositorio, contratos de módulos y orden de inicialización
- **Descripción del Alcance:**
  Documentar el mapa definitivo de dependencias, árbol del repositorio, catálogo de módulos, contratos e inventario de funciones trasladadas.

  Requisitos Funcionales:
  1. Documentar dependencias directas e indirectas entre HTMLs, JS, CSS, microservicios y fuentes de datos.
  2. Especificar contratos de módulos reutilizables, orden de carga e inicialización.
  3. Documentar procesos de compilación y reglas para incorporar nuevos archivos.
- **Criterios de Aceptación:**
  - CA-MOD-109: `MapaDependencias.md` y la documentación de arquitectura corresponden con exactitud a la estructura del código.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-MOD-06] Crear pruebas de regresión para la modularización y los dashboards dinámicos
- **Origen del Hallazgo:** Anexo de Tareas: Regresión / Tarea MOD-06 (P1 · Suite de Regresión Arquitectónica)
- **Prioridad:** P1
- **Severidad/Clasificación:** Crítica (Pruebas de regresión)
- **Archivos Involucrados:**
  - `tests/regression/`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** Flujos de autenticación, dashboards, seguridad, operaciones académicas
- **Descripción del Alcance:**
  Construir y ejecutar suites de prueba automatizadas para verificar que la reorganización modular y los dashboards dinámicos conservan el 100% de la funcionalidad anterior.

  Requisitos Funcionales:
  1. Pruebas de inicio de sesión, navegación, dashboards, roles configurables y ámbitos.
  2. Pruebas de seguridad (denegación de acceso no autorizado, IDOR, revocaciones).
  3. Pruebas de flujos académicos (docentes, jornalizaciones, sílabos, eventos, horarios, tareas).
  4. Pruebas de carga de scripts, CSS, módulos dinámicos y endpoints backend.
- **Criterios de Aceptación:**
  - CA-MOD-110: La suite de regresión ejecuta el 100% de las pruebas con resultado PASS sin degradación de funciones.
  - CA-MOD-111: Los bloqueos de seguridad y restricciones de ámbito son confirmados por las pruebas.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-MOD-07] Ejecutar la reorganización mediante etapas verificables
- **Origen del Hallazgo:** Anexo de Tareas: Regresión / Tarea MOD-07 (P1 · Ejecución por Etapas)
- **Prioridad:** P1
- **Severidad/Clasificación:** Crítica (Control de migración segura)
- **Archivos Involucrados:**
  - Repositorio completo
- **Dependencias Expuestas:** Control de versiones, línea base, procedimiento de reversión
- **Descripción del Alcance:**
  Ejecutar la reestructuración del proyecto por fases verificables (Línea base -> Mapa dependencias -> Estructura carpetas -> Módulos compartidos -> Rutas -> Pruebas de regresión) con plan de rollback probado.

  Requisitos Funcionales:
  1. Establecer línea base antes de modificar archivos.
  2. Separar cambios puramente estructurales de cambios funcionales.
  3. Validar cada etapa con pruebas de regresión antes de avanzar a la siguiente.
  4. Mantener procedimiento probado de reversión en caso de fallos.
- **Criterios de Aceptación:**
  - CA-MOD-112: Cada etapa de reorganización se ejecuta y verifica de forma aislada sin romper la aplicación.
  - CA-MOD-113: Existe trazabilidad completa y procedimiento de reversión validado.
- **Estado:** [ ] Pendiente

---

## PRIORIDAD P2 - MEJORAS DE PRODUCTIVIDAD Y ANALÍTICA DE APRENDIZAJE

---

### [X] [TAREA-F8-OPT-01] Implementar la previsualización integrada de documentos PDF en la revisión de entregas
- **Origen del Hallazgo:** `AUDITORIA_FASE_8_AULA_VIRTUAL_APRENDIZAJE.md` / Tarea F8-OPT-01 (P2 · Previsualización PDF)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Mejora de usabilidad y eficiencia docente)
- **Archivos Involucrados:**
  - `backend/task-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** Sistema existente de entregas, almacenamiento en Google Drive, controles de acceso RBAC
- **Descripción del Alcance:**
  Incorporar un visor integrado de documentos PDF dentro del modal de revisión de entregas para permitir al docente examinar los trabajos adjuntos directamente sin necesidad de descargarlos previamente.

  Requisitos Funcionales:
  1. Abrir la previsualización de archivos PDF adjuntos desde el modal de revisión conservando el contexto del estudiante y la actividad.
  2. Ofrecer controles del visor: navegación entre páginas, indicador de página, zoom, ajuste a ancho y página completa.
  3. Detectar el tipo real del archivo PDF mediante metadatos validados.
  4. Mantener disponibles las opciones de descarga, rúbricas, comentarios cualitativos y asignación de notas.
  5. Reutilizar la autorización RBAC sin convertir recursos privados en enlaces públicos.
  6. Liberar recursos de memoria al cerrar el visor o cambiar de estudiante/archivo.
- **Criterios de Aceptación:**
  - CA-F8-013: Al abrir una entrega con un PDF válido, se muestra el visor directamente dentro del modal.
  - CA-F8-014: Un PDF dañado o no compatible produce un mensaje claro y mantiene la opción de descarga.
  - CA-F8-015: La previsualización no altera la evaluación, rúbrica ni el historial de entregas.
- **Estado:** [X] Completado

---

### [ ] [TAREA-F8-OPT-02] Incorporar estadísticas descriptivas y una visualización de la distribución de calificaciones de exámenes
- **Origen del Hallazgo:** `AUDITORIA_FASE_8_AULA_VIRTUAL_APRENDIZAJE.md` / Tarea F8-OPT-02 (P2 · Analítica de Exámenes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación analítica)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** Cuestionarios, resultados de exámenes, libro de calificaciones y permisos docentes
- **Descripción del Alcance:**
  Proporcionar un resumen estadístico descriptivo y un gráfico de distribución de calificaciones por intervalos para cada examen, permitiendo al docente analizar el desempeño del grupo e incluir opcionalmente una curva normal de referencia.

  Requisitos Funcionales:
  1. Filtrar resultados por curso, asignatura, examen, grupo y período académico respetando permisos docentes.
  2. Calcular métricas descriptivas: total de evaluados, pendientes, nota promedio, mediana, mínimo, máximo, desviación estándar y % de aprobación.
  3. Renderizar gráfico de frecuencia por intervalos de puntuación identificando concentración y dispersión.
  4. Incluir curva de distribución normal de referencia únicamente cuando sea estadísticamente pertinente.
  5. Distinguir claramente los datos reales observados de las curvas de referencia.
  6. Garantizar que la generación de estadísticas sea de solo lectura y no altere las calificaciones del libro oficial.
- **Criterios de Aceptación:**
  - CA-F8-016: El informe estadístico y gráfico corresponde exactamente al examen y grupo seleccionado.
  - CA-F8-017: La generación del gráfico de distribución no modifica ni recalcula las notas oficiales.
  - CA-F8-018: Un grupo sin calificaciones muestra un estado vacío comprensible en lugar de un gráfico erróneo.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-CAL-01] Garantizar accesibilidad, usabilidad y adaptación de los dashboards
- **Origen del Hallazgo:** Anexo de Tareas: Calidad / Tarea CAL-01 (P2 · Accesibilidad y Adaptación)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Usabilidad y accesibilidad WCAG)
- **Archivos Involucrados:**
  - Todos los HTMLs de dashboards y `css/style.css`
- **Dependencias Expuestas:** Normativa WCAG 2.2 AA, diseño responsivo, navegación por teclado
- **Descripción del Alcance:**
  Garantizar que todos los dashboards dinámicos y adaptados cumplan los estándares WCAG 2.2 nivel AA en escritorio, tabletas y teléfonos móviles.

  Requisitos Funcionales:
  1. Diseñar interfaces responsivas adaptadas a diferentes resoluciones de pantalla.
  2. Operar todas las funciones mediante navegación por teclado e indicadores visibles de foco.
  3. Mantener contraste, etiquetas accesibles y estados de carga/error descriptivos.
- **Criterios de Aceptación:**
  - CA-CAL-101: Los dashboards cumplen con la pauta WCAG 2.2 AA y son navegables íntegramente con teclado y lectores de pantalla.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-CAL-02] Garantizar rendimiento y mantenimiento del sistema modular
- **Origen del Hallazgo:** Anexo de Tareas: Calidad / Tarea CAL-02 (P2 · Rendimiento y Mantenibilidad)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Rendimiento y eficiencia)
- **Archivos Involucrados:**
  - `js/api.js`, `js/config.js` y motores del frontend
- **Dependencias Expuestas:** Carga bajo demanda, almacenamiento en caché, optimización de peticiones HTTP
- **Descripción del Alcance:**
  Optimizar los tiempos de carga y respuesta de los módulos dinámicos cargando únicamente los componentes autorizados y reutilizando cachés locales.

  Requisitos Funcionales:
  1. Cargar módulos bajo demanda sin descargar código no autorizado.
  2. Prevenir solicitudes HTTP duplicadas al backend y reutilizar cachés.
  3. Invalidar la configuración almacenada ante cambios de permisos o asignaciones.
- **Criterios de Aceptación:**
  - CA-CAL-102: La carga dinámica no degrada la latencia percibida y elimina llamadas duplicadas al servidor.
- **Estado:** [ ] Pendiente
---

### [ ] [TAREA-ARQ-01] Implementar los principios de independencia funcional y comunicación entre roles
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-01 (P1 · Independencia Funcional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Arquitectura de datos y fuentes oficiales)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** Spreadsheets maestros (`Personas`, `ExpedientesEstudiantes`, `Matriculas`, `HistorialAcademico`), Spreadsheets funcionales por rol y Vistas/Proyecciones
- **Descripción del Alcance:**
  Establecer la separación entre Spreadsheets Maestros (única fuente de verdad oficial), Spreadsheets Funcionales por Rol (gestión operativa y solicitudes) y Vistas/Proyecciones Derivadas, evitando copias duplicadas o inconsistentes de datos.

  Requisitos Funcionales:
  1. Definir catálogo de responsabilidades, permisos, ámbitos y herramientas por rol.
  2. Garantizar que cada rol disponga de un espacio funcional asociado a su plantilla de trabajo sin duplicar datos maestros.
  3. Permitir que los usuarios tengan múltiples roles y responsabilidades simultáneas.
  4. Realizar comunicaciones inter-rol mediante identificadores estables, solicitudes, notificaciones y eventos.
  5. Asegurar la configurabilidad de roles y ámbitos sin modificar código ante cambios organizacionales.
- **Criterios de Aceptación:**
  - CA-ARQ-101: Los datos oficiales de matrículas, expedientes e historial conservan una única fuente de verdad.
  - CA-ARQ-102: Las comunicaciones inter-rol utilizan servicios y eventos sin duplicar registros maestros en Spreadsheets locales.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-ARQ-02] Estandarizar convenciones de identificadores estables y columnas comunes de control
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-02 (P1 · Identificadores y Columnas Comunes)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Estandarización de relaciones y metadatos)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/task-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** Catálogo estandarizado de identificadores y metadatos de control
- **Descripción del Alcance:**
  Estandarizar el uso de identificadores estables (`persona_id`, `usuario_id`, `rol_id`, `responsabilidad_id`, `asignacion_id`, `periodo_id`, `nivel_id`, `grado_id`, `seccion_id`, `carrera_id`, `departamento_id`, `asignatura_id`, `docente_id`, `estudiante_id`, `matricula_id`, `curso_id`, `tarea_id`, `entrega_id`, `evaluacion_id`, `calificacion_id`, `documento_id`, `solicitud_id`, `evento_id`, `notificacion_id`, `correlacion_id`, `archivo_id`) y columnas comunes de control (`id`, `estado`, `creado_por`, `creado_en`, `actualizado_por`, `actualizado_en`, `version`, `activo`).

  Requisitos Funcionales:
  1. Reutilizar la nomenclatura estándar de IDs para todas las entidades del sistema sin establecer relaciones por nombre o correo.
  2. Incorporar las columnas comunes de control en todas las tablas operativas de la plataforma.
  3. Preservar la inmutabilidad de registros históricos de auditoría y calificaciones.
- **Criterios de Aceptación:**
  - CA-ARQ-103: Todas las relaciones entre hojas se basan en identificadores estables.
  - CA-ARQ-104: Las tablas operativas incorporan las columnas estándar de auditoría y versión de registro.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-ARQ-03] Implementar hojas estandarizadas de eventos, errores y auditoría por Spreadsheet funcional
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-03 (P1 · Observabilidad por Spreadsheet)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Bitácoras descentralizadas de operación)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/task-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `EventosSistema`, `ErroresSistema`, `AuditoriaCambios`
- **Descripción del Alcance:**
  Implementar las hojas estandarizadas `EventosSistema`, `ErroresSistema` y `AuditoriaCambios` en todos los Spreadsheets funcionales para registrar eventos operativos, fallos técnicos (sin exponer tokens o contraseñas) y auditoría de cambios.

  Requisitos Funcionales:
  1. Crear la hoja `EventosSistema` (`evento_log_id`, `fecha_hora`, `usuario_id`, `rol_id`, `tipo_evento`, `entidad_tipo`, `entidad_id`, `accion`, `resultado`, `correlacion_id`, `origen`, `detalle_resumido`).
  2. Crear la hoja `ErroresSistema` (`error_id`, `fecha_hora`, `usuario_id`, `rol_id`, `servicio_id`, `modulo_id`, `operacion`, `codigo_error`, `mensaje_resumido`, `correlacion_id`, `reintentable`, `estado_resolucion`, `resuelto_por`, `resuelto_en`).
  3. Crear la hoja `AuditoriaCambios` (`auditoria_id`, `fecha_hora`, `actor_usuario_id`, `actor_rol_id`, `entidad_tipo`, `entidad_id`, `accion`, `campo_afectado`, `referencia_version_anterior`, `referencia_version_nueva`, `motivo`, `correlacion_id`).
  4. Garantizar la separación de categorías sin mezclar eventos operativos, fallos técnicos y auditoría de seguridad.
- **Criterios de Aceptación:**
  - CA-ARQ-105: Los Spreadsheets funcionales incorporan las tres hojas estandarizadas de trazabilidad.
  - CA-ARQ-106: La hoja de errores no almacena datos sensibles, contraseñas o tokens de acceso.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-ARQ-04] Implementar el Spreadsheet central de configuración y aprovisionamiento
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-04 (P1 · Registro Central)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Registro de configuración y aprovisionamiento)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `Roles`, `Responsabilidades`, `Capacidades`, `RolResponsabilidades`, `ResponsabilidadCapacidades`, `AsignacionesRoles`, `RegistroSpreadsheets`, `RegistroModulos`, `ConfiguracionInstitucional`, `PlantillasSpreadsheets`, `HistorialProvisionamiento`
- **Descripción del Alcance:**
  Implementar las hojas del Spreadsheet Central de Configuración para administrar la definición de roles, responsabilidades, capacidades, asignaciones por ámbito, registro de archivos Drive provisionados, plantilla de esquemas e historial de aprovisionamiento.

  Requisitos Funcionales:
  1. Implementar las tablas centrales de configuración y catálogo de permisos.
  2. Mantener la tabla `RegistroSpreadsheets` para asociar cada rol/usuario/ámbito con su archivo `spreadsheet_id` en Google Drive.
  3. Consultar identificadores de recursos desde el registro central sin hardcodear URLs o IDs en el código.
- **Criterios de Aceptación:**
  - CA-ARQ-107: La asignación de roles, ámbitos y Spreadsheets se consulta dinámicamente desde el registro central.
  - CA-ARQ-108: `HistorialProvisionamiento` registra el estado y resultado de cada aprovisionamiento de recursos.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-ARQ-05] Implementar el catálogo de Spreadsheets funcionales por rol institucional
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-05 (P1 · Catalogo de Espacios Funcionales)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Estructura de espacios funcionales)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** Espacios funcionales para Administrador, Dirección, Secretaría, Coordinaciones, Docente, Estudiante, Tutores, Admisiones, Finanzas, Orientación, Biblioteca, Recursos Humanos, Eventos, Soporte y Auditoría
- **Descripción del Alcance:**
  Implementar la estructura de esquemas y tablas operativas para los Spreadsheets funcionales por rol (`SP_AdminPlataforma`, `SP_Direccion`, `SP_DireccionAcademica`, `SP_Secretaria`, `SP_CoordinacionNivel`, `SP_CoordinacionDepartamento`, `SP_Docente`, `SP_Estudiante`, `SP_Tutores`, `SP_Admisiones`, `SP_Finanzas`, `SP_Orientacion`, `SP_Biblioteca`, `SP_RecursosHumanos`, `SP_Eventos`, `SP_Soporte`, `SP_Auditoria`).

  Requisitos Funcionales:
  1. Crear las plantillas de esquemas operativos para cada rol institucional manteniendo la independencia funcional.
  2. Garantizar que la información personal o confidencial (e.g. orientación, finanzas, recursos humanos) permanezca en su espacio autorizado.
  3. Prever la configuración de opciones en disputa entre roles mediante parámetros ajustables en la plataforma.

  > **Nota de Arquitectura:** Las estructuras que están en el anexo A (carpetas del repositorio) y en el anexo B (hojas y spreadsheets por rol) son ejemplos de una estructura recomendable, y no una estructura obligatoria.

- **Criterios de Aceptación:**
  - CA-ARQ-109: Cada espacio funcional cuenta con su esquema de tablas operativas para la gestión propia del rol.
  - CA-ARQ-110: Los datos sensibles conservan aislamiento y permisos restrictivos por dominio de responsabilidad.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-ARQ-06] Implementar el modelo común de comunicaciones institucionales y solicitudes
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-06 (P1 · Servicio de Comunicaciones)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Servicio inter-rol de comunicaciones)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `js/ui-common.js`
- **Dependencias Expuestas:** `SP_ComunicacionesInstitucionales` (`Solicitudes`, `ParticipantesSolicitud`, `HistorialSolicitudes`, `Notificaciones`, `Conversaciones`, `ParticipantesConversacion`, `Mensajes`)
- **Descripción del Alcance:**
  Implementar el servicio de comunicaciones institucionales para gestionar solicitudes, avisos, notificaciones e hilos de conversación entre diferentes roles con identificadores estables y trazabilidad de transiciones.

  Requisitos Funcionales:
  1. Crear la estructura del Spreadsheet `SP_ComunicacionesInstitucionales`.
  2. Administrar el flujo de estados de solicitudes (Pendiente, Asignada, En Proceso, Resuelta, Rechazada, Cancelada).
  3. Validar permisos en la apertura de solicitudes y evitar notificaciones duplicadas mediante claves de idempotencia.
  4. Mantener la privacidad de conversaciones y archivos adjuntos mediante enlaces de acceso controlado.
- **Criterios de Aceptación:**
  - CA-ARQ-111: Las solicitudes inter-rol se gestionan con trazabilidad completa de transiciones de estado.
  - CA-ARQ-112: El envío de notificaciones es idempotente y no genera avisos repetidos ante reintentos.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-ARQ-07] Implementar el aprovisionamiento automático, versionado de esquemas y migración de Spreadsheets
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-07 (P1 · Aprovisionamiento Dinámico)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Aprovisionamiento e historia de esquemas)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `PlantillasSpreadsheets`, `RegistroSpreadsheets`, `HistorialProvisionamiento`, Google Drive API
- **Descripción del Alcance:**
  Implementar el aprovisionamiento automático e idempotente de Spreadsheets a partir del catálogo de plantillas, aplicando permisos de Google Drive de privilegio mínimo y control de versión de esquemas para migraciones de tablas.

  Requisitos Funcionales:
  1. Verificar si ya existe un Spreadsheet compatible en `RegistroSpreadsheets` antes de crear uno nuevo.
  2. Aprovisionar automáticamente el archivo en Google Drive, aplicar protecciones de hojas y registrar en `RegistroSpreadsheets` e `HistorialProvisionamiento`.
  3. Ejecutar migraciones de esquemas agregando columnas u hojas requeridas sin destruir datos existentes.

  > **Nota de Arquitectura:** Las estructuras que están en el anexo A (carpetas del repositorio) y en el anexo B (hojas y spreadsheets por rol) son ejemplos de una estructura recomendable, y no una estructura obligatoria.

- **Criterios de Aceptación:**
  - CA-ARQ-113: La creación de espacios de trabajo es idempotente y no duplica archivos en Google Drive.
  - CA-ARQ-114: La actualización de esquemas migra estructuras de tablas de forma no destructiva.
- **Estado:** [ ] Pendiente

---

### [ ] [TAREA-ARQ-08] Implementar la independencia de servicios backend, seguridad Drive y límites de Google Sheets
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-08 (P1 · Seguridad y Escalabilidad)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Aislamiento de servicios y gestión de límites)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
  - `js/api.js`
- **Dependencias Expuestas:** Contratos entre microservicios, permisos Drive de privilegio mínimo, monitoreo de cuotas
- **Descripción del Alcance:**
  Garantizar la independencia entre microservicios backend proscribiendo la escritura directa en hojas privadas de otros dominios, aplicando el principio de privilegio mínimo en Google Drive y gestionando límites de rendimiento.

  Requisitos Funcionales:
  1. Interceder comunicaciones inter-servicio únicamente a través de endpoints y contratos API stablables.
  2. Aplicar permisos de privilegio mínimo a archivos y carpetas en Google Drive.
  3. Implementar estrategias de lecturas agrupadas y cachés invalidables para prevenir el agotamiento de cuotas en Google Sheets.
- **Criterios de Aceptación:**
  - CA-ARQ-115: Ningún microservicio escribe directamente en las tablas privadas de otro dominio sin contrato API.
  - CA-ARQ-116: Las operaciones agrupadas previenen el agotamiento de cuotas de lectura y escritura en Google Sheets.
- **Estado:** [ ] Pendiente
