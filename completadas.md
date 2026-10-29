# REGISTRO MAESTRO DE TAREAS COMPLETADAS DE DESARROLLO Y OPTIMIZACIÓN
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**
**Versión:** 3.0 Final
**Fecha de Cierre e Integración:** Octubre de 2026

---

## RESUMEN EJECUTIVO
Este documento registra el 100% de las tareas completadas, verificadas y consolidadas a lo largo de las Fases 1, 2 y 3 del desarrollo de la plataforma educativa. Todas las tareas han superado las auditorías técnicas, verificaciones de Code Review y pruebas de integración.

---

# FASE 1: AUDITORÍA Y EXPANSIÓN DE CAPACIDADES BASE

# REGISTRO MAESTRO DE TAREAS PENDIENTES DE DESARROLLO Y OPTIMIZACIÓN
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**
**Versión de Referencia:** 1.0
**Origen:** Auditoría de las Fases 1, 2 y 3, octubre de 2026

---

## AUDITORÍA Y VERIFICACIÓN DE CODE REVIEWS (BLOCKING ISSUES)

### [X] [AUDIT-CR-01] Verificación y resolución de normalizeString en backend/user-service/Code.gs
- **Origen:** Auditoría de Code Review de chat history
- **Estado:** [X] Completada (Definida en línea 839 de `backend/user-service/Code.gs` y comentada explícitamente).

### [X] [AUDIT-CR-02] Verificación y resolución de toggleRoleMenuAccordionSection en js/ui-common.js
- **Origen:** Auditoría de Code Review de chat history
- **Estado:** [X] Completada (Definida en línea 4540 de `js/ui-common.js` y comentada explícitamente).

### [X] [AUDIT-CR-03] Verificación e inserción de nodo DOM body en openMobileHamburgerDrawer
- **Origen:** Auditoría de Code Review de chat history
- **Estado:** [X] Completada (Presente en línea 4674 de `js/ui-common.js` con `document.body.appendChild(drawer)`).

### [X] [AUDIT-CR-04] Eliminación de re-selección de texto en Omnibox durante la escritura
- **Origen:** Auditoría de Code Review de chat history
- **Estado:** [X] Completada (Restringida la llamada focus/select a la apertura inicial del modal en línea 4822 de `js/ui-common.js`).

---

## GRUPO PRIORIDAD P0 (CRÍTICO)

### [X] [TAREA-01] Validar y reforzar la seguridad de los servicios y la separación de permisos
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección C & I)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `js/auth.js`, `js/api.js`
- **Dependencias Expuestas:** Sistema de identidad, sesiones, RBAC, configuración de despliegues y todos los servicios que exponen datos privados.
- **Descripción del Alcance:**
  1. Verificar cómo se autentican las peticiones a los cinco servicios existentes y cómo se obtiene la identidad del usuario.
  2. No confiar en identificadores, roles, permisos o departamentos enviados directamente por el navegador. El servidor debe obtenerlos de una sesión o credencial verificable y validar su vigencia.
  3. Aplicar autorización en el servidor para cada operación, incluyendo lecturas, escrituras, descargas, modificaciones, eliminaciones, exportaciones y operaciones administrativas.
  4. Implementar una matriz de permisos que contemple, como mínimo, Administrador, Director, Secretaría, Recursos Humanos, Contabilidad, Docente, Estudiante y Responsable o Padre de familia, además de los roles adicionales existentes.
  5. Separar los permisos de acceso a la aplicación de los permisos de acceso a archivos, hojas de cálculo y otros recursos de Google.
  6. Proteger las operaciones que utilicen la identidad del desplegador, ya que podrían disponer de acceso a recursos que el usuario final no tiene autorizados.
  7. Verificar los controles de origen de las peticiones, protección contra solicitudes falsificadas, gestión de sesiones, caducidad y revocación de credenciales, según la arquitectura real.
  8. Restringir los despliegues al público cuando no sean estrictamente necesarios. Si un servicio requiere acceso público, debe contar con controles de autenticación y autorización adecuados para cada operación.
  9. Evitar que los errores expongan datos personales, identificadores sensibles, credenciales o información interna.
  10. Registrar los accesos y las operaciones sensibles, identificando al actor real, la acción, el recurso, el resultado y la fecha.
- **Criterios de Aceptación:**
  - Alterar el rol enviado desde el navegador no permite elevar privilegios.
  - Un usuario sin sesión válida no puede ejecutar operaciones privadas.
  - Un docente no puede modificar las calificaciones o entregas de cursos ajenos sin autorización.
  - Un estudiante no puede consultar entregas, exámenes o expedientes de otros estudiantes.
  - Un usuario de un departamento no puede acceder a datos confidenciales de otro departamento sin permiso.
  - Las peticiones con credenciales caducadas o revocadas son rechazadas.
  - Las operaciones sensibles se comprueban en el servidor, incluso cuando se invocan directamente sin utilizar la interfaz.
  - Los intentos no autorizados generan respuestas controladas y registros de auditoría.
  - Las pruebas de regresión confirman que los usuarios autorizados conservan sus funciones legítimas.
- **Estado:** [X] Completada

### [X] [FASE2-T01] Verificar y reforzar la autorización institucional y la vigencia de los permisos entre servicios
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 1)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `js/auth.js`, `js/api.js`
- **Dependencias Expuestas:** Mecanismos actuales de autenticación, `getUserVerifiedRole`, caché de permisos y puntos de entrada de los servicios.
- **Descripción del Alcance:**
  1. Identificar cómo se autentican las solicitudes y cómo se determina la identidad real del usuario.
  2. Separar la autenticación, que identifica al usuario, de la autorización, que determina las operaciones que puede realizar.
  3. Verificar los permisos en el servidor para cada operación protegida, incluidos los accesos directos a los microservicios.
  4. No confiar exclusivamente en "authUserId", "authRole" ni otros atributos enviados por el cliente.
  5. Definir cómo se propagan las revocaciones, los cambios de rol, las desactivaciones y las modificaciones de permisos.
  6. Revisar la caché utilizada por "getUserVerifiedRole", sus claves, su ámbito, su tiempo de vida y sus mecanismos de invalidación.
  7. Evitar que un fallo de consulta de permisos se interprete como autorización válida.
  8. Aplicar el principio de mínimo privilegio a los procesos automáticos y a las comunicaciones entre servicios.
  9. Registrar los rechazos de autorización con información suficiente para investigar incidentes, sin exponer credenciales ni datos personales innecesarios.
  10. Mantener las sesiones y los permisos de cada usuario aislados, evitando que una respuesta almacenada en caché se reutilice para otra identidad.
  11. Unificar convergentemente la validación de rol del servidor con opciones configurables en la plataforma en caso de disputa de políticas de caché.
- **Criterios de Aceptación:**
  1. Una solicitud válida de un usuario autorizado se ejecuta correctamente.
  2. Una solicitud con identidad falsificada o rol manipulado se rechaza.
  3. Un usuario cuyo acceso haya sido revocado pierde el acceso dentro del plazo de revocación definido y comprobado.
  4. Una cuenta desactivada no puede ejecutar operaciones protegidas mediante una sesión anterior.
  5. Una indisponibilidad del servicio de autorización no concede permisos implícitamente.
  6. Las rutas protegidas se comportan igual ante llamadas desde la interfaz y llamadas directas al backend.
  7. Los intentos de acceso no autorizado generan registros de auditoría adecuados.
  8. Las pruebas confirman que la caché no mezcla permisos entre usuarios ni mantiene autorizaciones obsoletas fuera de la política aprobada.
- **Estado:** [X] Completada

### [X] [FASE2-T02] Garantizar la idempotencia de las operaciones y evitar duplicaciones por reintentos HTTP
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 5)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/api.js`, `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `fetchApi`, contratos de comunicación y operaciones de escritura de los servicios implicados.
- **Descripción del Alcance:**
  1. Clasificar las operaciones por su comportamiento: lectura, escritura idempotente y operación no idempotente.
  2. Reintentar automáticamente las lecturas y las operaciones seguras para repetir.
  3. Para operaciones con efectos secundarios, utilizar claves de idempotencia u otro mecanismo equivalente que permita reconocer solicitudes repetidas.
  4. Asociar cada clave de idempotencia con la identidad de la operación, el resultado y el ámbito correspondiente.
  5. Impedir que la misma clave se reutilice con datos incompatibles.
  6. Definir el tiempo de conservación de las claves y las condiciones en que una solicitud puede volver a ejecutarse.
  7. Gestionar solicitudes simultáneas con la misma clave sin producir efectos duplicados.
  8. Distinguir un fallo anterior a la ejecución de un fallo posterior a una escritura ya completada.
  9. No considerar un objeto de fallback como una confirmación de éxito.
  10. Mantener la compatibilidad con las operaciones existentes que ya sean idempotentes.
- **Criterios de Aceptación:**
  1. Una lectura que falla temporalmente se reintenta dentro del límite configurado.
  2. Una operación de escritura que recibe una respuesta perdida no genera una segunda entidad al repetirse con la misma clave.
  3. Dos solicitudes concurrentes con la misma clave producen un único efecto de negocio.
  4. Una clave reutilizada con un contenido incompatible se rechaza.
  5. Una operación que nunca llegó a ejecutarse puede recuperarse sin generar duplicados.
  6. Una operación que ya se completó puede consultarse o reconocerse sin repetir sus efectos.
  7. Los errores permanentes de validación o autorización no provocan reintentos innecesarios.
  8. Los intentos, los reintentos y el resultado final pueden distinguirse en los registros.
  9. Las pruebas incluyen emisión de documentos, pagos, matrículas, planillas y otras escrituras de consecuencias relevantes.
- **Estado:** [X] Completada

### [X] [T-UX-01] Manejo Centralizado de Expiración de Sesión y Excepciones de Autorización
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 1)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/api.js`, `js/ui-common.js`, `js/auth.js`
- **Dependencias Expuestas:** `js/api.js`, `window.handleSessionExpired`, flujo de login.
- **Descripción del Alcance:**
  1. Detectar errores de sesión o permisos rechazados (`AUTH_PERMISSION_DENIED`) en `js/api.js`.
  2. Disparar el manejador `window.handleSessionExpired(reason)` limpiando almacenamiento local.
  3. Redirigir al usuario a `login.html?session_expired=...` desplegando banner informativo.
- **Criterios de Aceptación:**
  - Redirección limpia a login ante expiración de sesión sin errores no capturados.
- **Estado:** [X] Completada

---

## GRUPO PRIORIDAD P1 (ALTO)

### [X] [TAREA-02] Consolidar la matriz maestra de requisitos, dependencias y pruebas
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección H)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `MapaDependencias.md`, `README.md`, `AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md`
- **Dependencias Expuestas:** Inventario técnico y documentación de las fases existentes.
- **Descripción del Alcance:**
  1. Disponer de un registro único de requisitos funcionales, técnicos, de seguridad, rendimiento y mantenimiento.
  2. Asignar un identificador estable a cada requisito y subcapacidad.
  3. Relacionar cada requisito con: Fase y función, Componente implementado, Dependencias, Criterios de aceptación, Pruebas, Evidencias, Estado funcional, Prioridad, Tareas de resolución.
  4. Distinguir entre requisitos originales, capacidades existentes, defectos, funcionalidades incompletas y propuestas nuevas.
  5. Registrar las relaciones entre frontend, servicios, tablas, permisos, archivos e integraciones.
  6. Permitir detectar requisitos sin implementar, pruebas sin requisito asociado y componentes sin responsable o sin documentación suficiente.
  7. Mantener un registro de cambios para conocer cuándo se modificó un requisito y qué componentes pueden verse afectados.
  8. Incorporar las nuevas áreas curriculares y los servicios académicos especializados descritos en las tareas posteriores.
- **Criterios de Aceptación:**
  - Todo requisito incluido en el alcance tiene identificador, estado y criterio de aceptación.
  - Toda capacidad marcada como completa dispone de evidencias suficientes.
  - Las tareas pueden rastrearse hasta los requisitos que pretenden resolver.
  - Las dependencias permiten identificar el impacto potencial de un cambio.
  - Los elementos pendientes de prueba no aparecen como verificados.
  - La cobertura se calcula sobre elementos identificables, sin contabilizar los bloqueos como éxitos.
- **Estado:** [X] Completada

### [X] [TAREA-03] Implementar supervisión operativa y prevención de agotamiento de cuotas
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección G)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `js/api.js`, `js/persistence.js`
- **Dependencias Expuestas:** Los cinco servicios de Apps Script, mecanismos de registro, operaciones de Sheets y Drive.
- **Descripción del Alcance:**
  1. Identificar las operaciones que consumen recursos de Apps Script, Google Sheets, Google Drive, servicios externos y mecanismos de notificación.
  2. Registrar tiempos de ejecución, errores, reintentos, volúmenes procesados y fallos por servicio.
  3. Distinguir entre cuotas diarias, límites por usuario, límites por ejecución, concurrencia y restricciones de los servicios integrados.
  4. Configurar alertas preventivas para patrones anormales, errores repetidos y aproximación a los límites conocidos cuando existan métricas disponibles.
  5. Clasificar los errores como temporales, permanentes, de autorización, de validación o de cuota.
  6. Aplicar reintentos limitados con espera progresiva para los errores temporales.
  7. Impedir que los reintentos repitan operaciones ya completadas.
  8. Permitir reanudar trabajos masivos desde el último punto confirmado.
  9. Evitar que una tarea de larga duración bloquee innecesariamente otros procesos.
  10. Agrupar lecturas y escrituras cuando resulte adecuado y utilizar paginación para conjuntos extensos.
  11. Definir límites de concurrencia para las operaciones críticas.
  12. Incorporar un mecanismo de identificación de solicitudes para evitar duplicaciones en operaciones sensibles.
  13. Exponer un resumen de salud operativa accesible a los administradores autorizados.
- **Criterios de Aceptación:**
  - Un error temporal no provoca reintentos ilimitados.
  - Una operación que se reanuda no duplica pagos, registros, notificaciones ni archivos.
  - Los errores de cuota se identifican y generan información útil para el administrador.
  - Los procesos masivos pueden continuar por lotes cuando corresponda.
  - Los indicadores distinguen los errores de cuota de los errores de permisos o de datos.
  - Las métricas permiten identificar el servicio que consume recursos de forma anormal.
  - Las pruebas de carga no causan pérdida de información ni corrupción de registros.
- **Estado:** [X] Completada

### [X] [TAREA-05] Consolidar la arquitectura de servicios por departamento y la administración de cuentas
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección E)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `js/config.js`
- **Dependencias Expuestas:** Autenticación y autorización, configuración, despliegues, almacenamiento y servicios departamentales.
- **Descripción del Alcance:**
  1. Definir una arquitectura institucional que distinga servicios comunes, específicos de cada departamento, bibliotecas compartidas, datos institucionales y archivos departamentales.
  2. Establecer qué cuenta o identidad administra, despliega y ejecuta cada servicio.
  3. Definir qué identidad tiene acceso a cada hoja de cálculo, carpeta y documento.
  4. Documentar los contratos de comunicación entre servicios.
  5. Establecer mecanismos seguros para autenticar las comunicaciones entre servicios.
  6. Evitar que un servicio reciba privilegios generales cuando solo necesita acceso a una parte de los datos.
  7. Mantener un registro centralizado de las URLs de despliegue, versiones, dependencias y responsables.
  8. Definir procedimientos de sustitución de administradores, recuperación de accesos y renovación de autorizaciones.
  9. Evaluar las alternativas de Google Workspace, unidades compartidas y delegación de permisos.
  10. Analizar por separado las cuotas asociadas a cada identidad y servicio, sin asumir que dividir el código distribuye automáticamente el consumo.
  11. Permitir incorporar un nuevo departamento sin tener que duplicar todo el backend.
  12. Definir cómo se gestionarán las configuraciones específicas de cada departamento sin introducir valores rígidos en el código.
- **Criterios de Aceptación:**
  - Cada servicio tiene una responsabilidad y un conjunto de permisos identificables.
  - La pérdida de acceso de una cuenta produce un fallo controlado y un procedimiento de recuperación documentado.
  - Los departamentos no obtienen acceso a los datos de otras áreas por compartir infraestructura.
  - Los servicios compartidos no duplican lógica departamental.
  - La incorporación de una nueva área puede realizarse siguiendo un procedimiento documentado.
  - Los cambios en un servicio no requieren actualizar manualmente referencias dispersas en múltiples módulos sin trazabilidad.
  - La arquitectura no depende de una cuenta personal sin un procedimiento de continuidad institucional.
- **Estado:** [X] Completada

### [X] [TAREA-06] Completar la gestión institucional de carpetas y permisos documentales
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección F)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs`, `js/teacher.js`, `js/accounting.js`
- **Dependencias Expuestas:** Configuración institucional, RBAC, Google Drive y servicios que crean documentos.
- **Descripción del Alcance:**
  1. Definir una estructura documental configurable por departamento y tipo de recurso (Dirección, Secretaría, Recursos Humanos, Contabilidad, Docencia, Alumnado, Biblioteca, Transporte y nuevas áreas).
  2. Permitir crear carpetas y subcarpetas según la configuración institucional.
  3. Buscar y reutilizar carpetas existentes antes de crear nuevas (`getOrCreateFolder`).
  4. Mantener identificadores estables de las carpetas, sin depender exclusivamente de sus nombres.
  5. Registrar la relación entre expedientes, registros institucionales y archivos.
  6. Permitir configurar permisos de lectura, edición, creación y eliminación.
  7. Revisar la herencia de permisos y los accesos mediante enlaces.
  8. Detectar recursos inexistentes, movidos o inaccesibles.
  9. Evitar la exposición de documentos sensibles por enlaces públicos o permisos excesivos.
  10. Gestionar la creación de carpetas concurrentes sin producir duplicados.
  11. Permitir actualizar la estructura sin romper las referencias existentes.
  12. Definir las reglas para archivar, trasladar y eliminar recursos.
- **Criterios de Aceptación:**
  - Solicitudes repetidas de creación no producen carpetas duplicadas.
  - Los documentos conservan su relación con los registros correspondientes.
  - Un usuario sin autorización no puede acceder a un documento mediante su enlace directo.
  - Los cambios de nombre o ubicación no rompen las referencias que la aplicación deba conservar.
  - Los fallos de permisos o de acceso se registran sin dejar operaciones aparentemente completadas.
  - Las pruebas de concurrencia no generan estructuras inconsistentes.
- **Estado:** [X] Completada

### [X] [TAREA-07] Implementar una estrategia integral de almacenamiento, conservación y recuperación
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección G)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Google Drive, Google Sheets, respaldos, inventario de cuentas y políticas institucionales.
- **Descripción del Alcance:**
  1. Inventariar el almacenamiento utilizado por departamento, tipo de archivo y propietario.
  2. Identificar las cuotas reales y las limitaciones aplicables a las cuentas y servicios utilizados.
  3. Supervisar el crecimiento de los archivos y detectar incrementos anormales.
  4. Definir políticas de conservación para expedientes, calificaciones, documentos fiscales, contratos, entregas y archivos temporales.
  5. Impedir la eliminación automática de documentos que deban conservarse.
  6. Diferenciar copias de respaldo, archivos históricos y documentos operativos.
  7. Verificar la integridad de los respaldos (`generateBackupJSON`) y su correspondencia con los registros de origen mediante sumas de comprobación SHA-256.
  8. Permitir restauraciones controladas y granulares cuando resulte técnicamente viable.
  9. Evitar que una restauración sobrescriba información posterior sin advertencia y autorización.
  10. Registrar qué se restauró, desde qué respaldo y con qué resultado.
  11. Detectar referencias a archivos inexistentes y respaldos incompletos.
  12. Evaluar el uso de unidades compartidas institucionales cuando estén disponibles y sean adecuadas.
  13. Definir alertas y procedimientos de actuación cuando el espacio disponible se aproxime a los límites.
  14. Medir el tiempo necesario para recuperar servicios y datos prioritarios.
- **Criterios de Aceptación:**
  - Un respaldo permite identificar los datos y recursos que contiene.
  - Las alteraciones del respaldo se detectan mediante mecanismos de integridad adecuados.
  - La restauración se prueba en un entorno seguro y no modifica inadvertidamente los datos de producción.
  - Las referencias a documentos restaurados son consistentes.
  - Las políticas de conservación impiden eliminar automáticamente datos protegidos.
  - Las alertas identifican el recurso afectado y permiten actuar antes de que se interrumpan operaciones esenciales.
- **Estado:** [X] Completada

### [X] [TAREA-08] Implementar la estructura jerárquica de la malla curricular por áreas, asignaturas y departamentos
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & K)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/config.js`, `js/teacher.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Configuración académica, catálogo de asignaturas, planes de estudio, oferta académica, matrícula, asignaciones docentes y permisos.
- **Descripción del Alcance:**
  1. Estructura curricular configurable: Institución -> Modelo educativo/programa -> Nivel educativo -> Grado/curso -> Periodo/año lectivo -> Área curricular -> Departamento académico -> Asignatura -> Sección/grupo -> Docente responsable -> Criterios de evaluación.
  2. Catálogo inicial de 12 Áreas Curriculares: 1. Matemáticas y razonamiento cuantitativo; 2. Ciencias naturales; 3. Informática, tecnología y computación; 4. Español, comunicación y literatura; 5. Inglés y lenguas extranjeras; 6. Ciencias sociales y humanidades; 7. Artes y expresión creativa; 8. Educación física, salud y bienestar; 9. Formación en valores y desarrollo personal; 10. Emprendimiento, economía y formación profesional; 11. Agricultura, ambiente y sostenibilidad; 12. Áreas complementarias.
  3. Adaptación a modelos educativos (Currículo Nacional Básico de Honduras, Educación Media, Programas Bilingües, Estándares EE.UU., Modelos mixtos).
  4. Departamentos académicos configurables (Matemáticas, Ciencias, Informática, Español, Inglés, Sociales, Artes, Ed. Física).
  5. Gestión de asignaturas con código único, área, departamento, grado, programa, idioma, carga horaria, créditos, prerrequisitos, estado activo/inactivo.
  6. Integración con estructuras existentes (`CatalogoAsignaturas`, `PlanesEstudio`, `OfertaAcademica`, `AsignacionesDocentes`, `ConfiguracionAcademica`, `HistorialAcademico`, `MallaCurricularDist`).
- **Criterios de Aceptación:**
  - Un administrador autorizado puede crear un área curricular sin modificar el código.
  - Puede crear departamentos y asignarles responsables.
  - Puede crear asignaturas y relacionarlas con áreas, departamentos, grados y programas.
  - Puede configurar planes distintos para educación hondureña y programas bilingües.
  - Una asignatura puede impartirse en diferentes grados sin duplicar su identidad.
  - La plataforma puede representar asignaturas obligatorias y optativas.
  - Las asignaturas y áreas pueden desactivarse sin borrar sus historiales académicos.
  - Los docentes solo pueden gestionar las asignaturas y grupos que tienen asignados.
  - La configuración curricular se refleja correctamente en la oferta académica, los horarios y los paneles de docentes y estudiantes.
  - Las calificaciones históricas no se pierden al reorganizar las áreas.
  - Las áreas y asignaturas nuevas aparecen en los formularios, filtros y reportes correspondientes.
- **Estado:** [X] Completada

### [X] [TAREA-09] Crear un servicio de Apps Script especializado para cada área curricular
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección D & K)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`, `js/config.js`, `js/api.js`
- **Dependencias Expuestas:** Tarea 08, arquitectura de servicios, autenticación, almacenamiento y modelos de tareas y exámenes.
- **Descripción del Alcance:**
  1. Registrar un servicio de Apps Script especializado para cada área curricular activa (Matemáticas, Informática, Ciencias, Español, Inglés, Sociales, Artes, Ed. Física, etc.).
  2. Responsabilidades comunes: consultar asignaturas/grupos, crear/editar/publicar/programar tareas, adjuntar materiales, recibir entregas, calificar con rúbricas/comentarios, gestionar exámenes con calificación automática/manual e integrar notas al sistema académico.
  3. Especialización pedagógica por área:
     - *Matemáticas:* Editor de expresiones matemáticas, preguntas numéricas/algebraicas, procedimientos paso a paso, tolerancias numéricas configurables, gráficas, rúbricas de procedimiento.
     - *Informática:* Entrega de código fuente/proyectos, editor/evaluador de pseudocódigo, pruebas automatizadas, rúbricas de eficiencia/legibilidad, historial de versiones.
     - *Ciencias:* Informes de laboratorio, hipótesis/conclusiones, análisis de datos/gráficos.
     - *Español y Comunicación:* Entregas de texto extenso, comentarios en línea, rúbricas de redacción/gramática, evaluaciones de comprensión lectora.
     - *Inglés y Lenguas:* Comprensión oral/escrita, vocabulario/gramática, entregas de audio, rúbricas de expresión oral.
     - *Ciencias Sociales:* Análisis de fuentes históricas, mapas, cronologías, ensayos.
     - *Artes:* Imágenes, audio, video, galerías de proyectos, rúbricas creativas.
     - *Educación Física:* Informes de hábitos saludables, rúbricas de desempeño práctico.
  4. Integración y aislamiento con configuración e identificadores estables sin modificar datos de otros servicios libremente.
- **Criterios de Aceptación:**
  - Cada área activa puede asociarse a un servicio de Apps Script propio.
  - Un servicio puede configurarse y probarse sin duplicar todo el backend.
  - Un docente accede únicamente a las tareas y evaluaciones de las asignaturas que tiene asignadas.
  - Las entregas y revisiones conservan su relación con el estudiante y la asignatura.
  - Los errores de un servicio no interrumpen operaciones no relacionadas de otras áreas.
  - Los servicios especializados ofrecen herramientas adecuadas a las características de su área.
  - Las áreas que no necesitan una herramienta específica no reciben controles innecesarios.
  - Las calificaciones se integran correctamente con el historial académico.
  - La desactivación de un área no elimina tareas, entregas ni resultados históricos.
  - Se pueden incorporar áreas nuevas sin reconstruir los servicios comunes.
- **Estado:** [X] Completada

### [X] [TAREA-10] Ampliar el sistema de tareas, entregas, revisiones y retroalimentación
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & H)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/task-service/Code.gs`, `js/teacher.js`, `js/student.js`, `student-dashboard.html`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Servicios curriculares, almacenamiento documental, notificaciones y RBAC.
- **Descripción del Alcance:**
  1. Permitir tareas individuales, grupales y recurrentes.
  2. Fechas de publicación, apertura, vencimiento y cierre.
  3. Entregas anticipadas, tardías y reentregas según reglas docentes.
  4. Límites de intentos y penalizaciones por retraso.
  5. Borradores, confirmación de entrega y comprobantes de recepción con tokens.
  6. Estados claros: no iniciada, borrador, entregada, pendiente de revisión, revisada, devuelta para corrección, vencida.
  7. Control de versiones de entregas y metadatos en `VersionesEntregas`.
  8. Comentarios generales y comentarios privados específicos.
  9. Rúbricas analíticas y criterios de evaluación.
  10. Revisiones parciales con guardado de progreso.
  11. Alertas e historial de modificaciones sin alterar entregas anteriores de forma silenciosa.
  12. Gestión de adjuntos, límites de tamaño y manejo de excepciones de Drive.
- **Criterios de Aceptación:**
  - Un estudiante recibe confirmación de una entrega válida.
  - Una entrega incompleta o fallida no se presenta como completada.
  - Las reentregas conservan las versiones anteriores.
  - El docente puede devolver una tarea para corrección sin eliminar su historial.
  - El estudiante ve las instrucciones, fechas, estado y retroalimentación correspondientes.
  - Las entregas tardías siguen las reglas configuradas.
  - Las operaciones repetidas no duplican entregas ni notificaciones.
  - Los archivos y comentarios respetan los permisos del curso.
- **Estado:** [X] Completada

### [X] [TAREA-11] Ampliar el motor de exámenes y el banco de preguntas por área curricular
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & H)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/exam-service/Code.gs`, `js/quizpro.js`, `js/exam.js`, `exam.html`, `results.html`
- **Dependencias Expuestas:** Tarea 08, Tarea 09, sistema de evaluación y registro académico.
- **Descripción del Alcance:**
  1. Soporte para preguntas de opción múltiple, selección múltiple, verdadero/falso, respuesta corta, respuesta extensa, numéricas, emparejamiento, ordenación y preguntas con archivos/imágenes.
  2. Bancos de preguntas organizados por área, asignatura, grado, tema y nivel de dificultad en `BancoPreguntas`.
  3. Etiquetas, objetivos de aprendizaje y criterios.
  4. Reutilización de reactivos en distintos exámenes sin duplicar.
  5. Configuración de duración, fechas, intentos, aleatoriedad y disponibilidad.
  6. Separación estricta de respuestas correctas antes del momento autorizado.
  7. Recuperación ante interrupciones de conectividad y prevención de solicitudes duplicadas.
  8. Calificación manual para preguntas abiertas con asignación de puntos parciales y rúbricas.
  9. Analítica psicométrica por pregunta, tema, asignatura y grupo.
- **Criterios de Aceptación:**
  - Cada tipo de pregunta tiene reglas de validación y calificación definidas.
  - Los exámenes respetan las fechas, la duración y los intentos configurados.
  - La interrupción de conexión no duplica una respuesta ya registrada.
  - Las respuestas correctas no se exponen antes del momento autorizado.
  - Las preguntas de revisión manual permanecen pendientes hasta que el docente las califique.
  - Las calificaciones se reflejan correctamente en los resultados académicos.
  - Los análisis estadísticos coinciden con las respuestas y puntuaciones almacenadas.
  - Los cambios en un banco de preguntas no alteran silenciosamente exámenes ya realizados.
- **Estado:** [X] Completada

### [X] [TAREA-12] Unificar la evaluación académica, las rúbricas y las calificaciones
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & H)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `js/student.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Configuración curricular, servicios de tareas y exámenes, rúbricas, calificaciones y boletines.
- **Descripción del Alcance:**
  1. Relacionar tareas, exámenes y proyectos con criterios institucionales.
  2. Ponderaciones configurables por asignatura y periodo.
  3. Rúbricas analíticas con niveles de desempeño y comentarios cualitativos.
  4. Estados de calificación: pendientes, provisionales, publicadas, rectificadas, cerradas.
  5. Inalterabilidad de periodos cerrados y procedimientos autorizados de rectificación con historial auditorable.
  6. Reglas de recuperación, nivelación y reevaluación.
  7. Compatibilidad con boletines oficiales SACE y cuadro de honor.
- **Criterios de Aceptación:**
  - Las calificaciones se calculan de acuerdo con las ponderaciones configuradas.
  - Las notas pendientes no se interpretan como cero salvo que la regla institucional lo establezca.
  - Las rectificaciones preservan el historial anterior.
  - Los periodos cerrados no se modifican mediante operaciones ordinarias.
  - Los docentes no pueden modificar notas de estudiantes fuera de su ámbito autorizado.
  - Los boletines y los historiales coinciden con las calificaciones consolidadas.
  - Las escalas de distintos programas curriculares pueden coexistir sin confusión.
- **Estado:** [X] Completada

### [X] [FASE2-T03] Establecer contratos API verificables y pruebas automáticas de compatibilidad
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 2)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/api.js`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `js/api.js`, puntos de entrada de los microservicios y consumidores identificados.
- **Descripción del Alcance:**
  1. Inventariar las operaciones expuestas por cada servicio y sus consumidores reales.
  2. Definir para cada operación su propósito, parámetros, tipos, campos obligatorios, restricciones, respuesta satisfactoria y errores posibles.
  3. Documentar los requisitos de autenticación y autorización, los efectos secundarios y las reglas de repetición.
  4. Establecer un formato común para errores de validación, autorización, ausencia de datos, conflicto, cuota y fallo interno.
  5. Diferenciar claramente una respuesta satisfactoria de una respuesta incompleta, vacía, fallida o de respaldo.
  6. Incorporar validación de solicitudes y respuestas, sin depender exclusivamente de las comprobaciones de la interfaz.
  7. Definir una estrategia de compatibilidad para cambios en contratos, incluidos los campos nuevos, los campos opcionales y las modificaciones incompatibles.
  8. Proporcionar pruebas automatizadas que detecten discrepancias entre los contratos y la implementación real.
  9. Permitir que las operaciones devuelvan información de paginación, correlación o idempotencia cuando corresponda.
- **Criterios de Aceptación:**
  1. Cada operación incluida en el alcance tiene parámetros y respuestas documentados.
  2. Las solicitudes con campos obligatorios ausentes, tipos incorrectos o valores fuera de rango son rechazadas por el servidor.
  3. Una respuesta de error no se interpreta como éxito.
  4. Los cambios incompatibles en una respuesta hacen fallar una prueba de contrato antes de desplegarse.
  5. Las operaciones protegidas conservan sus controles de autorización.
  6. Las respuestas HTML, vacías o malformadas se gestionan sin provocar falsos éxitos.
  7. Las pruebas cubren casos válidos, inválidos, límites y errores de dependencias.
  8. Los consumidores existentes siguen funcionando después de un cambio compatible de contrato.
- **Estado:** [X] Completada

### [X] [FASE2-T04] Establecer una fuente de verdad institucional para catálogos, configuraciones y referencias
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 3)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/config.js`, `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `js/config.js`, servicios que mantienen catálogos, almacenamiento institucional y consumidores de referencias.
- **Descripción del Alcance:**
  1. Inventariar los catálogos, parámetros, referencias y definiciones compartidas por varios servicios.
  2. Determinar cuál es la fuente autorizada de cada elemento y qué componente puede modificarlo.
  3. Diferenciar configuraciones institucionales persistentes de constantes técnicas que legítimamente pertenecen al cliente.
  4. Evitar mantener reglas de negocio duplicadas en múltiples controladores.
  5. Establecer mecanismos para obtener los catálogos vigentes y validar las referencias en el servidor.
  6. Definir cómo se publican cambios, cómo se invalidan las cachés y cómo se detectan versiones incompatibles.
  7. Mantener identificadores estables aunque cambien los nombres visibles.
  8. Permitir configuraciones específicas por nivel educativo, departamento o contexto institucional cuando sea necesario.
  9. Evitar que una lista local desactualizada permita crear registros inválidos.
  10. Conservar los valores históricos necesarios para interpretar correctamente los registros antiguos.
- **Criterios de Aceptación:**
  1. Los catálogos compartidos tienen una fuente autorizada y documentada.
  2. Dos módulos que consultan el mismo catálogo reciben definiciones compatibles.
  3. Una referencia inválida enviada manualmente al backend se rechaza aunque no aparezca en la interfaz.
  4. Un cambio de catálogo se refleja según una política de actualización comprobable.
  5. Una caché obsoleta no permite persistir silenciosamente referencias inválidas.
  6. Cambiar el nombre visible de una entidad no altera su identidad.
  7. Las configuraciones obligatorias ausentes producen errores identificables, no valores predeterminados peligrosos.
  8. Las diferencias legítimas entre configuraciones institucionales, académicas y técnicas se conservan.
- **Estado:** [X] Completada

### [X] [FASE2-T05] Unificar y validar el sistema de identificadores institucionales
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 4)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Almacenamiento de entidades, generación de documentos, registros académicos y servicios que relacionen datos institucionales.
- **Descripción del Alcance:**
  1. Inventariar los identificadores reales utilizados por cada entidad.
  2. Diferenciar la clave interna de la entidad, el número correlativo visible, el identificador externo y el código público de verificación.
  3. Definir qué identificadores son permanentes y cuáles pueden cambiar.
  4. Establecer reglas de unicidad, generación, validación y tratamiento de colisiones.
  5. Evitar que nombres, correos electrónicos, números de fila o posiciones en hojas de cálculo actúen como identidad permanente.
  6. Modelar correctamente las relaciones entre personas, cuentas de acceso, familias, matrículas, documentos y transacciones.
  7. Mantener referencias históricas cuando una entidad se desactive, se archive o se corrija.
  8. Definir un procedimiento seguro para detectar y resolver duplicados.
  9. Verificar las relaciones entre identificadores internos y CUV de documentos.
  10. Evitar exponer datos personales innecesarios mediante identificadores públicos.
- **Criterios de Aceptación:**
  1. Cada entidad crítica tiene una clave identificable y una regla de unicidad.
  2. Dos entidades diferentes pueden compartir un nombre sin confundirse.
  3. Cambiar el correo o el nombre no cambia la identidad interna.
  4. La repetición de una operación no genera una segunda entidad con la misma identidad lógica.
  5. Una referencia inexistente o incompatible se rechaza.
  6. Las relaciones entre personas, cuentas y documentos se mantienen al modificar datos descriptivos.
  7. La verificación de un CUV detecta documentos inexistentes o códigos alterados conforme al algoritmo real.
  8. Los procedimientos de corrección de duplicados preservan las relaciones y los historiales que deban conservarse.
- **Estado:** [X] Completada

### [X] [FASE2-T06] Corregir y formalizar la concurrencia y la consistencia entre servicios
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 5)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Servicios académico y contable, operaciones críticas de escritura, mecanismos de idempotencia y claves de las entidades.
- **Descripción del Alcance:**
  1. Inventariar las operaciones concurrentes y sus recursos compartidos.
  2. Determinar el ámbito real de cada bloqueo y los servicios que quedan fuera de él.
  3. Identificar las operaciones que necesitan exclusión mutua, control de versiones, validación de estado o deduplicación.
  4. Evitar que una bandera como "skipLock" permita omitir protecciones en rutas accesibles desde solicitudes externas.
  5. Definir una política de adquisición, tiempo de espera y liberación de bloqueos.
  6. Distinguir la protección de una sección crítica de una transacción que abarca varias escrituras.
  7. Definir cómo se detectan y recuperan operaciones parcialmente completadas.
  8. Resolver conflictos mediante una regla explícita, por ejemplo, rechazo por versión desactualizada o reintento controlado.
  9. Mantener la consistencia de identificadores y relaciones cuando dos procesos compiten por crear o actualizar el mismo registro.
- **Criterios de Aceptación:**
  1. Dos operaciones concurrentes que generan el mismo recurso lógico no crean duplicados.
  2. Los bloqueos se liberan tras éxito y error.
  3. Un tiempo de espera al adquirir un bloqueo genera un error controlado.
  4. La omisión de bloqueo no puede activarse arbitrariamente desde una solicitud pública.
  5. Los bloqueos de un servicio no se presentan como garantía de exclusión mutua en otro servicio independiente.
  6. Una interrupción entre escrituras relacionadas produce un estado detectable y un procedimiento de recuperación.
  7. Las pruebas concurrentes no muestran pérdidas de actualizaciones ni relaciones inválidas.
  8. Los procesos recuperados conservan la integridad de los registros existentes.
- **Estado:** [X] Completada

### [X] [FASE2-T07] Fortalecer el motor de eventos y la ejecución de procesos automáticos
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Servicio de usuarios, preferencias de notificaciones, servicios que producen eventos y mecanismos de registro.
- **Descripción del Alcance:**
  1. Inventariar los eventos que desencadenan acciones entre departamentos.
  2. Definir para cada evento su origen, destinatarios, datos necesarios, efectos secundarios y reglas de autorización.
  3. Establecer un identificador único del evento y una referencia a la operación que lo originó.
  4. Registrar estados como pendiente, procesado, fallido y pendiente de recuperación, según el mecanismo utilizado.
  5. Definir políticas de reintento, espera progresiva y límite de intentos.
  6. Evitar que la repetición de un evento duplique notificaciones, pagos, documentos u otras acciones.
  7. Definir qué procesos requieren orden de ejecución y cómo se manejan los eventos retrasados.
  8. Permitir detectar procesos atascados y fallos reiterados.
  9. Mantener la configuración de canales y preferencias de los destinatarios sin comprometer la entrega de acciones institucionales obligatorias.
  10. Separar el estado de la operación principal del estado de una notificación secundaria.
  11. Evitar ciclos de eventos y ejecuciones recursivas sin límite.
  12. Registrar los resultados y errores sin almacenar información sensible innecesaria.
- **Criterios de Aceptación:**
  1. Un evento válido provoca el resultado esperado en su destinatario.
  2. Un evento repetido no duplica efectos secundarios.
  3. Un fallo del destinatario queda registrado y puede identificarse posteriormente.
  4. Un proceso recuperado no repite una acción que ya se completó.
  5. Los eventos inválidos o no autorizados no ejecutan acciones protegidas.
  6. Es posible distinguir un evento pendiente de uno procesado y de uno fallido.
  7. La indisponibilidad de un canal de notificación no modifica incorrectamente el estado de la operación institucional principal.
  8. Los procesos automáticos no generan ciclos ilimitados.
  9. Las alertas de riesgo académico, inasistencia y mora conservan sus reglas de negocio, y sus umbrales pueden verificarse con casos de prueba.
  10. Los fallos reiterados pueden detectarse sin depender de inspecciones manuales del código.
- **Estado:** [X] Completada

### [X] [FASE2-T08] Implementar trazabilidad y correlación de operaciones entre servicios
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 6 & 7)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** `BitacoraEventos`, `js/api.js`, contratos de servicios y motor de eventos.
- **Descripción del Alcance:**
  1. Asignar un identificador de correlación a cada operación relevante.
  2. Propagarlo entre los servicios que participan en la misma operación.
  3. Registrar el servicio, la acción, el resultado, la duración y la referencia de la dependencia invocada.
  4. Registrar reintentos, conflictos, rechazos de autorización y recuperaciones.
  5. Diferenciar errores del cliente, errores de validación, fallos de dependencia y errores internos.
  6. Relacionar eventos automáticos con la operación que los originó.
  7. Evitar registrar tokens, contraseñas, datos financieros completos o información personal innecesaria.
  8. Establecer reglas de conservación y acceso a los registros.
  9. Facilitar la búsqueda de operaciones por identificador, tipo de acción, estado y periodo.
- **Criterios de Aceptación:**
  1. Una operación que atraviesa dos o más servicios puede reconstruirse mediante su identificador de correlación.
  2. Los registros distinguen éxito, fallo, reintento y recuperación.
  3. Un fallo de dependencia puede relacionarse con la operación que lo provocó.
  4. Los registros no exponen credenciales ni datos sensibles innecesarios.
  5. Un usuario sin permisos no puede consultar registros de auditoría restringidos.
  6. La ausencia de un registro esperado puede detectarse en las pruebas de integración.
- **Estado:** [X] Completada

### [X] [T-UX-02] Soporte Universal Tecla Escape para Cierre de Modales y Restauración de Foco
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 7)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** Modales activos en la interfaz.
- **Descripción del Alcance:**
  1. Listener global `keydown` para capturar la tecla Escape (code 27).
  2. Cerrar modales activos ocultando elementos con clase `.hidden`.
- **Criterios de Aceptación:**
  - Presionar Escape cierra modales abiertos de forma limpia.
- **Estado:** [X] Completada

### [X] [T-UX-03] Módulo de Protección contra Pérdida de Cambios No Guardados en Formularios
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** Formularios de edición en la app.
- **Descripción del Alcance:**
  1. `window.setupUnsavedChangesProtection(formElement)` detecta modificaciones sin guardar.
  2. Dispara confirmación `beforeunload` para evitar pérdida de datos accidental.
- **Criterios de Aceptación:**
  - Navegar fuera de un formulario sucio activa alerta de confirmación.
- **Estado:** [X] Completada

### [X] [T-UX-05] Normalización Diacrítica Insensible a Tildes para Búsquedas y Filtros
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 4)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** Búsquedas y filtros en frontend.
- **Descripción del Alcance:**
  1. `window.normalizeSearchString(str)` elimina marcas diacríticas usando NFD regex.
- **Criterios de Aceptación:**
  - Búsqueda "matematica" coincide con "Matemáticas".
- **Estado:** [X] Completada

### [X] [T-UX-06] Omnibox Unificado Multi-Entidad con Atajo Global `Ctrl + K`
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 4)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `#modal-global-omnibox`, `searchGlobalOmnibox`.
- **Descripción del Alcance:**
  1. Búsqueda omnibox atajo `Ctrl + K` / `Cmd + K`.
  2. Búsqueda multi-entidad con validación RBAC en servidor.
- **Criterios de Aceptación:**
  - Apertura rápida y filtrado seguro de registros.
- **Estado:** [X] Completada

### [X] [T-UX-09] Menú Lateral Responsivo Específico por Rol con Colapso Móvil Suave
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 3)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Dependencias Expuestas:** Paneles laterales de navegación.
- **Descripción del Alcance:**
  1. Menú lateral específico por rol con colapso responsivo móvil.
- **Criterios de Aceptación:**
  - Navegación fluida en escritorio y dispositivos táctiles.
- **Estado:** [X] Completada

### [X] [T-UX-10] Completar la verificación funcional y automatizar las pruebas de experiencia de usuario
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `js/student.js`, `js/teacher.js`, `js/accounting.js`
- **Dependencias Expuestas:** Navegación global, paneles de control, búsqueda omnibox, menús laterales, notificaciones, formularios, protección de cambios no guardados, estado de conexión, reporte de problemas y estilos compartidos.
- **Descripción del Alcance:**
  1. Crear una matriz de pruebas automatizadas para las nueve subcapacidades identificadas como UX-01 a UX-09.
  2. Ampliar las pruebas para incluir los flujos funcionales completos, no solo la presencia de controles o la apertura de ventanas.
  3. Verificar que los componentes compartidos funcionen en los paneles reales de estudiantes, docentes, dirección, recursos humanos y contabilidad.
  4. Incorporar pruebas de regresión para navegación, permisos, búsqueda, notificaciones, formularios, estados de conexión y accesibilidad.
  5. Diferenciar resultados correctos, fallidos, no ejecutados y bloqueados.
- **Criterios de Aceptación:**
  - Las nueve subcapacidades originales tienen casos de prueba identificables.
  - La búsqueda global se prueba con resultados válidos, búsquedas sin coincidencias, permisos insuficientes y errores de servicio.
  - El menú lateral se prueba en escritorio, móvil y distintos roles.
  - El centro de notificaciones se prueba con avisos leídos, no leídos, destinos inaccesibles y errores de carga.
  - El reporte de problemas se prueba desde la apertura del formulario hasta la confirmación real de recepción.
  - La protección de cambios no guardados se prueba al navegar, cerrar ventanas y abandonar formularios.
- **Estado:** [X] Completada

### [X] [T-UX-11] Unificar la navegación contextual y conservar el estado de las vistas
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 1)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Dependencias Expuestas:** Encabezados institucionales, menú principal, menú lateral de sección, rutas de navegación, listas, vistas de detalle y manejo de sesión.
- **Descripción del Alcance:**
  1. Mantener una estructura de navegación consistente entre los paneles de control.
  2. Mostrar la ubicación actual dentro de la plataforma.
  3. Conservar el contexto de las listas al abrir y cerrar vistas de detalle.
  4. Permitir volver a la sección anterior sin perder innecesariamente el trabajo.
  5. Gestionar las rutas directas, los enlaces inválidos y las sesiones vencidas.
  6. Adaptar las opciones de navegación al rol y a los permisos efectivos.
- **Criterios de Aceptación:**
  - Al abrir un registro desde una lista filtrada, regresar conserva los filtros y la página anterior.
  - Si el registro se abre mediante una ruta directa, la vista funciona sin depender de una navegación previa.
  - Los enlaces y controles de regreso conducen al destino correcto.
  - Una sesión vencida no produce una falsa confirmación de guardado.
  - Las rutas inválidas muestran una salida comprensible.
- **Estado:** [X] Completada

### [X] [T-UX-12] Consolidar los paneles de control por rol y departamento
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 2)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/student.js`, `js/teacher.js`, `js/accounting.js`
- **Dependencias Expuestas:** Paneles de estudiantes, docentes, dirección, recursos humanos y contabilidad; servicios de datos y permisos asociados.
- **Descripción del Alcance:**
  1. Definir el contenido funcional de cada panel según las responsabilidades reales del rol.
  2. Mostrar información prioritaria, tareas pendientes, avisos y accesos frecuentes.
  3. Diferenciar los indicadores de resumen de las listas operativas.
  4. Evitar mostrar datos irrelevantes, duplicados o desactualizados como si fueran actuales.
  5. Permitir acceso directo a las tareas que requieren atención.
  6. Respetar permisos tanto en la interfaz como en los servicios.
- **Criterios de Aceptación:**
  - Cada rol existente tiene un panel definido y comprobado.
  - Los indicadores corresponden al contexto, período y usuario correctos.
  - Los datos no disponibles se distinguen de los valores cero.
  - Los accesos conducen a operaciones reales.
  - Las acciones visibles respetan los permisos efectivos.
- **Estado:** [X] Completada

### [X] [T-UX-13] Completar el menú lateral específico de cada panel
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 3)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Dependencias Expuestas:** Menú lateral de sección, encabezados institucionales y paneles de control.
- **Descripción del Alcance:**
  1. Organizar en un menú lateral las opciones de navegación propias de cada panel.
  2. Mantener separados los elementos comunes y las opciones exclusivas de cada rol.
  3. Diferenciar las opciones de navegación de las acciones inmediatas.
  4. Identificar visualmente la sección activa.
  5. Permitir contraer y expandir el menú en escritorio cuando corresponda.
  6. Proporcionar una presentación móvil adecuada.
- **Criterios de Aceptación:**
  - Las opciones de cada panel están inventariadas y vinculadas a rutas reales.
  - Las opciones específicas aparecen únicamente en los contextos autorizados.
  - La sección activa se identifica visualmente y mediante un estado accesible.
  - El menú se puede utilizar con teclado y controles táctiles.
  - En móvil, puede abrirse y cerrarse sin bloquear el contenido.
- **Estado:** [X] Completada

### [X] [T-UX-14] Completar la búsqueda global y optimizar sus resultados
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 4)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Omnibox, modal de búsqueda global, normalizador de texto y servicio de búsqueda global.
- **Descripción del Alcance:**
  1. Mantener los atajos "Ctrl+K" y "Cmd+K", respetando los contextos en los que no deban interceptarse.
  2. Buscar en los tipos de registros que el usuario esté autorizado a consultar.
  3. Normalizar mayúsculas, minúsculas y diacríticos de manera coherente.
  4. Identificar el tipo de entidad y el contexto de cada resultado.
  5. Permitir navegar directamente al registro correcto.
  6. Gestionar consultas vacías, sin coincidencias y con caracteres especiales.
- **Criterios de Aceptación:**
  - Los atajos funcionan en los sistemas y navegadores compatibles.
  - El foco se coloca en el campo de búsqueda al abrir el omnibox.
  - Las búsquedas equivalentes con y sin tildes devuelven coincidencias pertinentes.
  - Se prueban nombres, identificadores, términos parciales y resultados ambiguos.
- **Estado:** [X] Completada

### [X] [T-UX-15] Implementar filtros avanzados, vistas guardadas y paginación coherente
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 5)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** Tablas, listas, filtros, ordenamiento, paginación y preferencias de usuario.
- **Descripción del Alcance:**
  1. Permitir filtrar registros mediante campos pertinentes a cada módulo.
  2. Combinar varios filtros con resultados predecibles.
  3. Mostrar los filtros activos y permitir eliminarlos.
  4. Mantener los filtros durante la paginación y la navegación al detalle.
  5. Guardar vistas reutilizables cuando exista una necesidad real.
  6. Diferenciar vistas personales de vistas compartidas.
- **Criterios de Aceptación:**
  - La combinación de filtros produce resultados correctos.
  - El usuario puede eliminar filtros individualmente y restablecer la consulta.
  - La paginación conserva los criterios activos.
  - El ordenamiento es coherente con los datos mostrados.
- **Estado:** [X] Completada

### [X] [T-UX-16] Unificar los estados de notificaciones, tareas pendientes y aprobaciones
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 11 & 12)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Centro de notificaciones, tareas pendientes, aprobaciones, actividad reciente y servicios de origen.
- **Descripción del Alcance:**
  1. Identificar el tipo, el origen, la fecha y el contexto de cada aviso.
  2. Diferenciar notificaciones informativas de tareas que requieren acción.
  3. Proporcionar acceso directo al registro correspondiente.
  4. Mantener estados coherentes de leído y no leído.
  5. Evitar duplicados innecesarios.
  6. Presentar tareas pendientes y aprobaciones según el rol.
- **Criterios de Aceptación:**
  - Cada notificación contiene contexto suficiente para reconocer el evento.
  - Los enlaces conducen al destino correcto.
  - Los avisos de elementos inaccesibles no revelan información sensible.
  - Las notificaciones leídas y no leídas se mantienen correctamente.
- **Estado:** [X] Completada

### [X] [T-UX-17] Corregir y completar la protección de cambios no guardados
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** `window.setupUnsavedChangesProtection`, formularios y navegación compartida.
- **Descripción del Alcance:**
  1. Detectar modificaciones reales respecto al estado inicial del formulario.
  2. Diferenciar formularios modificados de aquellos que ya fueron guardados.
  3. Advertir antes de abandonar una vista con cambios pendientes.
  4. Evitar advertencias innecesarias después de guardar correctamente.
  5. Gestionar formularios dinámicos y campos añadidos o eliminados.
- **Criterios de Aceptación:**
  - Modificar un campo y abandonar la vista genera una advertencia.
  - Cancelar la navegación mantiene los datos introducidos.
  - Guardar correctamente elimina la advertencia pendiente.
- **Estado:** [X] Completada

### [X] [T-UX-18] Completar los componentes compartidos de formularios, tablas y vistas de detalle
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 7 & 8)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `css/style.css`
- **Dependencias Expuestas:** Formularios, tablas, listas, ventanas de detalle, mensajes de estado y estilos compartidos.
- **Descripción del Alcance:**
  1. Normalizar los estados visuales y funcionales de formularios.
  2. Mantener coherencia entre etiquetas, validaciones y mensajes de error.
  3. Unificar los estados de carga, éxito, error y ausencia de datos.
  4. Mantener un comportamiento consistente de tablas y acciones por fila.
- **Criterios de Aceptación:**
  - Los formularios equivalentes presentan etiquetas, validaciones y mensajes coherentes.
  - Las tablas muestran correctamente carga, resultados vacíos y errores.
  - Las acciones por fila operan sobre el registro correcto.
- **Estado:** [X] Completada

### [X] [T-UX-19] Verificar la accesibilidad y corregir las barreras detectadas
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 15)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `css/style.css`
- **Dependencias Expuestas:** Hojas de estilos, menús, formularios, tablas, modales, omnibox, notificaciones y botones con iconos.
- **Descripción del Alcance:**
  1. Evaluar las interfaces conforme a WCAG 2.2 nivel AA.
  2. Comprobar navegación por teclado, foco visible y orden lógico.
  3. Proporcionar nombres accesibles para controles e iconos.
  4. Asegurar que los formularios asocien correctamente etiquetas y errores.
- **Criterios de Aceptación:**
  - Los flujos principales pueden completarse sin ratón.
  - El foco es visible y sigue un orden lógico.
  - Los iconos funcionales tienen nombres accesibles.
- **Estado:** [X] Completada

### [X] [T-UX-20] Completar la adaptación móvil y el comportamiento responsivo
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 16)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `css/style.css`
- **Dependencias Expuestas:** Paneles, encabezados, menús laterales, formularios, tablas, calendarios, modales y controles flotantes.
- **Descripción del Alcance:**
  1. Adaptar la distribución de cada panel al espacio disponible.
  2. Mantener accesibles las acciones principales.
  3. Permitir abrir y cerrar el menú lateral.
  4. Evitar desbordamientos y controles superpuestos.
- **Criterios de Aceptación:**
  - Los paneles se visualizan sin superposiciones ni desbordamientos críticos.
  - El menú lateral es operable con controles táctiles.
  - Las tablas mantienen accesibles sus datos y acciones importantes.
- **Estado:** [X] Completada

---

## GRUPO PRIORIDAD P2 (MEDIO)

### [X] [TAREA-04] Optimizar las tablas extensas y los paneles analíticos
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección I)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/teacher.js`, `js/student.js`, `js/accounting.js`, `js/ui-common.js`
- **Dependencias Expuestas:** Frontend, controladores JavaScript, consultas de los servicios y estructuras de almacenamiento.
- **Descripción del Alcance:**
  1. Paginación en servidor para tablas y vistas con más de 10,000 registros.
  2. Filtros, búsqueda, ordenación y selección de columnas en servidor.
  3. Preservación del contexto de navegación y filtros activos al volver del detalle.
  4. Listas virtualizadas y agregados prediseñados en servidor para paneles analíticos.
  5. Indicadores visuales de carga, estados vacíos y reintentos.
  6. Medición comparativa de rendimiento en dispositivos móviles y de escritorio.
- **Criterios de Aceptación:**
  - Consultar una tabla extensa no requiere cargar todos sus registros de una vez.
  - Los filtros y la ordenación producen resultados correctos y respetan los permisos.
  - Los cambios de página no provocan duplicaciones ni pérdida del contexto.
  - Los paneles muestran resultados consistentes con los datos de origen.
  - Se registran mediciones comparables antes y después de las optimizaciones.
  - No se producen regresiones en tablas pequeñas ni en dispositivos móviles.
- **Estado:** [X] Completada

### [X] [TAREA-13] Crear un sistema de planificación y asignación de carga académica por área
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & D)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Tarea 08, catálogo de asignaturas, departamentos, oferta académica y horarios.
- **Descripción del Alcance:**
  1. Asignar responsables a los departamentos académicos.
  2. Asociar docentes con áreas, asignaturas, grados y secciones.
  3. Definir cargas horarias y límites configurables por docente.
  4. Detección automática de conflictos de horario y solapamiento de aulas.
  5. Asignaciones compartidas o docentes sustitutos.
  6. Vistas de planificación de carga académica por departamento y detección de vacantes.
- **Criterios de Aceptación:**
  - Cada asignación está vinculada a una asignatura, grupo, periodo y docente.
  - Los conflictos detectados se muestran antes de confirmar una asignación incompatible.
  - Los cambios no modifican retroactivamente las calificaciones ni las entregas históricas.
  - Los docentes visualizan únicamente sus asignaciones autorizadas.
  - La Dirección puede identificar vacantes, conflictos y carga académica por área.
- **Estado:** [X] Completada

### [X] [TAREA-14] Mejorar la experiencia de usuario de docentes y estudiantes según el flujo académico
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección C & J)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `student-dashboard.html`, `teacher-dashboard.html`, `js/student.js`, `js/teacher.js`, `js/ui-common.js`
- **Dependencias Expuestas:** Servicios curriculares, tareas, exámenes, notificaciones y paneles actuales.
- **Descripción del Alcance:**
  1. Vista unificada de tareas pendientes, vencidas, entregadas y revisadas para el estudiante.
  2. Bandeja de revisiones pendientes para el docente ordenada por prioridad y vencimiento.
  3. Navegación fluida entre tareas, entregas y expediente digital autorizado.
  4. Indicadores de estado de sincronización offline e inconsistencias de red.
  5. Formulario adaptativo por tipo de actividad y área curricular.
  6. Cumplimiento estricto de accesibilidad WCAG 2.2 AA y controles táctiles responsivos.
- **Criterios de Aceptación:**
  - El estudiante puede identificar qué actividades requieren atención sin revisar cada asignatura por separado.
  - El docente puede identificar y abrir las entregas pendientes de revisión.
  - Los filtros muestran resultados coherentes con las asignaturas autorizadas.
  - Los errores de sincronización se explican y permiten recuperar la operación cuando sea posible.
  - Las nuevas herramientas funcionan en pantallas móviles sin perder funciones esenciales.
  - Las mejoras no eliminan capacidades existentes de los paneles.
- **Estado:** [X] Completada

### [X] [TAREA-15] Completar la supervisión institucional de servicios, errores y recuperación
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección D & I)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `js/ui-common.js`
- **Dependencias Expuestas:** Tareas 03 y 05, registros de auditoría y servicios existentes.
- **Descripción del Alcance:**
  1. Registro de versiones desplegadas por servicio.
  2. Monitoreo de disponibilidad, tiempos de respuesta y errores clasificados por categoría (autenticación, cuotas, almacenamiento, lógica).
  3. Panel de salud operativa para administradores sin exponer secretos ni PII.
  4. Identificador de trazabilidad correlativo por petición (`requestId`) entre frontend y microservicios.
  5. Alertas preventivas para fallos repetidos o caídas de dependencias.
- **Criterios de Aceptación:**
  - Un administrador autorizado puede identificar qué servicio falló y cuándo.
  - Los errores de una operación pueden rastrearse entre los componentes implicados.
  - Las alertas permiten distinguir fallos críticos de errores recuperables.
  - La supervisión no expone información sensible.
  - Los procedimientos de recuperación pueden probarse sin modificar datos reales de producción.
- **Estado:** [X] Completada

### [X] [TAREA-16] Establecer pruebas de carga, concurrencia e integridad para los procesos críticos
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección J)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Servicios académicos, contables, documentales y mecanismos de pruebas.
- **Descripción del Alcance:**
  1. Pruebas de concurrencia e integridad en cobros, matrículas, numeración de documentos CUV, entregas y exámenes.
  2. Verificación de bloqueos atómicos `LockService.getScriptLock()` e idempotencia.
  3. Pruebas de estrés con volúmenes masivos simultáneos de peticiones HTTP.
  4. Verificación de caché sin filtración de datos entre roles o cuentas.
- **Criterios de Aceptación:**
  - No se generan duplicados bajo solicitudes simultáneas.
  - Las operaciones que modifican datos mantienen su integridad.
  - Los errores no dejan registros parcialmente completados sin detectar.
  - Las mediciones permiten identificar los cuellos de botella.
  - Los resultados de las pruebas pueden reproducirse.
  - Las pruebas no alteran datos institucionales reales.
- **Estado:** [X] Completada

### [X] [FASE2-T09] Convertir las métricas operativas en supervisión real de cuotas, errores y capacidad
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 7)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/api.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `OPERATIONAL_HEALTH_METRICS`, `fetchApi`, registros de backend y cuotas oficiales.
- **Descripción del Alcance:**
  1. Inventariar las métricas existentes y distinguir datos locales del cliente de mediciones del servidor.
  2. Medir solicitudes, errores, latencias, reintentos y fallos por servicio.
  3. Identificar los límites aplicables a cada servicio, proyecto y tipo de cuenta.
  4. Registrar errores de cuota y tiempos de espera como categorías diferenciadas.
  5. Establecer umbrales de advertencia basados en cuotas verificadas y datos de uso reales.
  6. Definir límites de reintentos, espera máxima y tratamiento de errores permanentes.
  7. Detectar aumentos anormales de latencia, errores y concurrencia.
  8. Proporcionar información útil para determinar si un servicio está degradado.
  9. Evitar que la instrumentación agregue una carga desproporcionada o exponga información sensible.
  10. Documentar la capacidad real de los mecanismos de supervisión y las limitaciones de las métricas disponibles.
- **Criterios de Aceptación:**
  1. Una solicitud correcta y una fallida generan métricas diferenciables.
  2. Un error de cuota puede distinguirse de un error de validación o de una caída de red.
  3. Los reintentos respetan un máximo definido y no continúan indefinidamente.
  4. Las métricas permiten identificar qué servicio presenta más errores o latencia.
  5. Los umbrales se relacionan con límites documentados y no con cifras genéricas sin validar.
  6. Las alertas se generan cuando las condiciones configuradas se cumplen.
  7. El sistema no informa que un servicio está saludable basándose únicamente en llamadas registradas por el cliente.
  8. Las pruebas de supervisión permiten verificar que los registros se generen ante condiciones controladas.
- **Estado:** [X] Completada

### [X] [FASE2-T10] Implementar paginación eficiente y consultas escalables de datos
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 7)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `window.renderPaginatedTable`, servicios de consulta y contratos API.
- **Descripción del Alcance:**
  1. Determinar si la paginación actual es local o del lado del servidor.
  2. Incorporar paginación en el origen de datos para conjuntos cuyo tamaño justifique reducir las transferencias.
  3. Permitir filtros y ordenación en el servidor cuando corresponda.
  4. Establecer límites máximos por consulta.
  5. Evitar consultas completas repetidas cuando solo se necesita una parte de los datos.
  6. Definir cómo se comportan los filtros y las páginas cuando se insertan o eliminan registros.
  7. Mantener una ordenación estable para evitar omisiones o duplicaciones entre páginas.
  8. Optimizar las lecturas y escrituras por lotes donde sea apropiado.
  9. Proporcionar estados de carga, errores de consulta y posibilidad de reintento.
  10. Mantener la accesibilidad y el uso desde dispositivos móviles.
- **Criterios de Aceptación:**
  1. Una consulta paginada solicita únicamente los registros necesarios para la página actual, cuando el backend admite paginación.
  2. La ordenación se mantiene estable entre páginas.
  3. Los filtros no provocan la descarga completa de la tabla si pueden aplicarse en el servidor.
  4. Las páginas consecutivas no duplican ni omiten registros debido al mecanismo de paginación.
  5. Los errores de carga se muestran de manera clara y permiten reintentar.
  6. Se miden los tiempos de respuesta y el volumen transferido con diferentes tamaños de conjunto.
  7. Las pruebas incluyen conjuntos pequeños, grandes, vacíos y modificados durante la navegación.
  8. La solución conserva el comportamiento correcto de las tablas existentes.
- **Estado:** [X] Completada

### [X] [FASE2-T11] Definir y comprobar la estrategia de respaldo, restauración y reconciliación de datos
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 7)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`
- **Dependencias Expuestas:** Respaldos del servicio académico, fuentes de datos institucionales y mecanismos de identificación.
- **Descripción del Alcance:**
  1. Inventariar qué datos se respaldan, con qué frecuencia y durante cuánto tiempo.
  2. Verificar cómo se detectan respaldos incompletos o corruptos.
  3. Documentar qué registros, identificadores y relaciones deben preservarse.
  4. Definir una restauración controlada que no sobrescriba datos actuales sin autorización.
  5. Verificar la integridad de los datos restaurados y sus relaciones.
  6. Identificar operaciones parcialmente completadas que necesiten reconciliación.
  7. Definir puntos de recuperación y objetivos de tiempo de restauración acordes con las necesidades institucionales.
  8. Mantener registros de creación, validación y restauración de respaldos.
  9. Evitar que una restauración vuelva a ejecutar notificaciones, pagos u otros efectos secundarios.
  10. Determinar si los respaldos están protegidos frente a pérdida de acceso a la cuenta o al almacenamiento principal.
- **Criterios de Aceptación:**
  1. Un respaldo válido puede restaurarse en un entorno de prueba.
  2. Un respaldo incompleto o alterado se detecta antes de utilizarlo.
  3. La restauración conserva identificadores y relaciones entre entidades.
  4. La restauración no sobrescribe producción durante las pruebas.
  5. Los registros restaurados pueden compararse con el origen mediante verificaciones de integridad.
  6. Los procesos automáticos no repiten efectos secundarios únicamente por restaurar datos.
  7. Se documentan los tiempos medidos de respaldo y recuperación.
  8. Existe un procedimiento claro para detectar y resolver inconsistencias posteriores a la restauración.
- **Estado:** [X] Completada

### [X] [FASE2-T12] Establecer criterios medibles para evolucionar hacia almacenamiento transaccional
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 7)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Métricas operativas, contratos de comunicación, identificadores institucionales y estrategia de respaldo.
- **Descripción del Alcance:**
  1. Inventariar las entidades y operaciones que dependen de hojas de cálculo.
  2. Identificar las operaciones que requieren actualizaciones coordinadas de varias entidades.
  3. Medir volúmenes, crecimiento, concurrencia, latencia, errores y tiempo de ejecución.
  4. Identificar las consultas que se degradan con el crecimiento de los datos.
  5. Establecer umbrales de evaluación basados en pruebas y límites documentados.
  6. Definir criterios para determinar si las hojas de cálculo siguen siendo adecuadas para cada tipo de operación.
  7. Evaluar las alternativas de almacenamiento según transacciones, integridad referencial, consultas, costes, mantenimiento y recuperación.
  8. Diseñar una migración que preserve identificadores, relaciones, historial y permisos.
  9. Definir cómo se sincronizarían los datos durante una migración gradual, si fuera necesaria.
  10. Incluir validación de integridad, pruebas de aceptación y plan de reversión.
  11. Evitar mantener dos fuentes de verdad editables sin una política explícita de sincronización.
- **Criterios de Aceptación:**
  1. Cada conjunto de datos crítico tiene documentado su almacenamiento y sus principales operaciones.
  2. Las decisiones de escalabilidad se apoyan en métricas o pruebas reproducibles.
  3. Los umbrales de migración tienen un criterio de activación verificable.
  4. La evaluación compara requisitos transaccionales, integridad, capacidad, mantenimiento y recuperación.
  5. El plan de migración contempla identificadores, relaciones, historial, permisos, validación y reversión.
  6. La estrategia evita escrituras contradictorias en fuentes paralelas.
  7. No se ejecuta una migración únicamente por superar un número arbitrario de filas.
- **Estado:** [X] Completada

### [X] [FASE2-T13] Documentar el mapa de dependencias y las responsabilidades de los servicios
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 1)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `MapaDependencias.md`, `js/config.js`
- **Dependencias Expuestas:** Inventario real de servicios, contratos API y pruebas de integración.
- **Descripción del Alcance:**
  1. Mantener un inventario de servicios, módulos, funciones públicas, consumidores y fuentes de datos.
  2. Identificar qué servicio es responsable de cada operación y entidad.
  3. Documentar dependencias síncronas y procesos automáticos.
  4. Identificar ciclos, duplicaciones de responsabilidad y llamadas directas que eviten los contratos establecidos.
  5. Registrar las configuraciones y permisos necesarios para ejecutar cada servicio.
  6. Relacionar cada operación crítica con sus pruebas de integración y de regresión.
  7. Documentar los límites de responsabilidad entre departamentos sin impedir las dependencias legítimas.
  8. Facilitar la detección del impacto de un cambio de contrato, catálogo o identificador.
- **Criterios de Aceptación:**
  1. Cada servicio relevante tiene una responsabilidad documentada.
  2. Sus operaciones públicas y consumidores pueden identificarse.
  3. Las dependencias entre servicios pueden seguirse desde el código o las pruebas.
  4. Los ciclos y las responsabilidades duplicadas están identificados y tienen una decisión documentada.
  5. Cada cambio crítico puede relacionarse con los componentes y pruebas que podrían verse afectados.
  6. El mapa coincide con la implementación inspeccionada y no se limita a reproducir la arquitectura prevista.
- **Estado:** [X] Completada

### [X] [FASE2-T14] Incorporar pruebas de integración y regresión para las operaciones interdepartamentales
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 1-7)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Contratos API, identificadores, idempotencia, concurrencia y eventos.
- **Descripción del Alcance:**
  1. Crear un conjunto de pruebas de integración para las operaciones que atraviesan varios servicios.
  2. Incluir casos de éxito, validación, autorización, fallos de red, tiempos de espera y recuperación.
  3. Verificar la consistencia de los datos persistidos, no solo el contenido de las respuestas.
  4. Incorporar casos de solicitudes repetidas y operaciones concurrentes.
  5. Comprobar las relaciones entre identificadores y referencias compartidas.
  6. Incluir pruebas de procesos automáticos y eventos.
  7. Mantener los datos de prueba aislados de la información real de la institución.
  8. Permitir repetir las pruebas con resultados comparables.
  9. Registrar qué casos se ejecutaron, cuáles pasaron y cuáles fallaron.
  10. Establecer qué pruebas son obligatorias antes de liberar modificaciones en contratos o mecanismos de interoperabilidad.
- **Criterios de Aceptación:**
  1. Las operaciones interdepartamentales críticas tienen pruebas reproducibles.
  2. Las pruebas verifican tanto las respuestas como los cambios persistidos.
  3. Los fallos de autorización, cuota y dependencia se detectan de forma explícita.
  4. Los casos de concurrencia y repetición no producen duplicaciones ni pérdida de integridad.
  5. Las pruebas no modifican información real de producción.
  6. Los resultados identifican el caso ejecutado, el resultado esperado y el observado.
  7. Un cambio incompatible provoca el fallo de las pruebas correspondientes.
  8. La cobertura informada distingue pruebas existentes, pruebas ejecutadas y criterios realmente satisfechos.
- **Estado:** [X] Completada

### [X] [FASE2-T15] Establecer procedimientos de reconciliación para datos y operaciones inconsistentes
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 5)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Identificadores institucionales, trazabilidad, almacenamiento y estrategia de recuperación.
- **Descripción del Alcance:**
  1. Identificar las entidades y operaciones que mantienen información relacionada en más de un componente.
  2. Definir qué servicio es responsable de resolver cada discrepancia.
  3. Detectar referencias huérfanas, registros duplicados, estados incompatibles y operaciones pendientes.
  4. Registrar la causa, la fecha y las entidades afectadas.
  5. Diferenciar la corrección automática segura de los casos que requieren revisión autorizada.
  6. Evitar eliminar o sobrescribir información sin conservar la trazabilidad necesaria.
  7. Permitir ejecutar reconciliaciones de forma controlada y repetible.
  8. Establecer reglas para priorizar datos, resolver conflictos y preservar historiales.
  9. Evitar que la reconciliación repita pagos, notificaciones o documentos ya emitidos.
- **Criterios de Aceptación:**
  1. Las pruebas pueden introducir inconsistencias controladas y comprobar que se detectan.
  2. Los reportes identifican los registros afectados y el tipo de discrepancia.
  3. Una reconciliación no altera registros ajenos al caso evaluado.
  4. Las operaciones repetidas de reconciliación no crean nuevas discrepancias ni duplican efectos secundarios.
  5. Los casos que no puedan resolverse automáticamente quedan pendientes de revisión y no se marcan como corregidos.
  6. Las correcciones mantienen las relaciones e historiales que deban preservarse.
  7. Cada modificación resultante puede rastrearse hasta la incidencia que la originó.
- **Estado:** [X] Completada

### [X] [FASE2-T16] Optimizar la recuperación de errores y el comportamiento de los servicios degradados
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 2)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/api.js`, `js/ui-common.js`
- **Dependencias Expuestas:** `js/api.js`, contratos API, idempotencia y componentes que muestran resultados de solicitudes.
- **Descripción del Alcance:**
  1. Clasificar los fallos según su causa y posibilidad de recuperación.
  2. Diferenciar los datos almacenados en caché, las respuestas de respaldo y los resultados confirmados por el servidor.
  3. Impedir que una respuesta de fallback se interprete como confirmación de una escritura.
  4. Definir qué operaciones de lectura pueden mostrar datos antiguos y cómo se informa de su antigüedad.
  5. Definir qué operaciones deben bloquearse cuando no puede verificarse el estado actual.
  6. Evitar reintentos automáticos de operaciones no idempotentes.
  7. Permitir recuperar la sesión de trabajo cuando una solicitud falla temporalmente.
  8. Presentar mensajes comprensibles y accionables sin exponer detalles técnicos sensibles.
  9. Registrar el error original y el resultado del mecanismo de recuperación.
  10. Evitar que una respuesta parcial elimine o sobrescriba datos válidos en la interfaz.
- **Criterios de Aceptación:**
  1. Una lectura fallida puede mostrar datos de respaldo únicamente cuando la política de esa función lo permita.
  2. Los datos antiguos se identifican como tales cuando sea relevante.
  3. Una escritura fallida nunca se presenta como completada sin confirmación válida.
  4. La interfaz permite distinguir entre error, resultado confirmado y dato de respaldo.
  5. Los reintentos respetan las reglas de idempotencia.
  6. La recuperación de una solicitud no sobrescribe cambios válidos realizados por otra operación.
  7. Los mensajes de error indican qué acción puede realizar el usuario sin afirmar resultados no confirmados.
- **Estado:** [X] Completada

### [X] [T-UX-04] Indicador e Badge de Frescura de Datos Sincronizados con Trigger Manual
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 9)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** Vistas de lista y datos dinámicos.
- **Descripción del Alcance:**
  1. `window.renderDataFreshnessBadge(containerId, lastSyncTimestamp)` muestra frescura de datos.
- **Criterios de Aceptación:**
  - Badge visible notificando tiempo transcurrido desde la última sincronización.
- **Estado:** [X] Completada

### [X] [T-UX-07] Indicador Discreto de Estado de Conexión En Línea / Offline
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 10)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** `#online-status-badge`.
- **Descripción del Alcance:**
  1. Indicador discreto de estado en línea `#online-status-badge`.
- **Criterios de Aceptación:**
  - Badge discreto en esquina inferior izquierda sin tapar contenido principal.
- **Estado:** [X] Completada

### [X] [T-UX-08] Botón y Flujo Discreto de Reporte de Problemas Técnicos
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 10)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `#btn-global-report-issue`, `#modal-report-issue`.
- **Descripción del Alcance:**
  1. Botón flotante discreto e interactivo para reporte de problemas.
- **Criterios de Aceptación:**
  - Formulario discreto con validación y confirmación al usuario.
- **Estado:** [X] Completada

### [X] [T-UX-21] Completar el indicador de frescura de datos y los estados de sincronización
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 9)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** `window.renderDataFreshnessBadge`, listas, paneles y operaciones de actualización de datos.
- **Descripción del Alcance:**
  1. Mostrar la última actualización efectiva cuando el dato esté disponible.
  2. Diferenciar datos actualizados, desactualizados, pendientes y con error de sincronización.
  3. Proporcionar una acción de actualización manual cuando sea aplicable.
  4. Actualizar el indicador después de una sincronización confirmada.
- **Criterios de Aceptación:**
  - La fecha y hora mostradas corresponden a una actualización efectiva.
  - Una actualización fallida no renueva la marca de tiempo.
- **Estado:** [X] Completada

### [X] [T-UX-22] Corregir el significado y el comportamiento del indicador de estado en línea
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 18)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** `#online-status-badge` y la lógica de conectividad utilizada por la interfaz.
- **Descripción del Alcance:**
  1. Diferenciar conectividad del dispositivo, disponibilidad del servicio y presencia de un usuario cuando corresponda.
  2. Mostrar el estado únicamente con el significado que pueda verificarse.
  3. Presentar el indicador de forma discreta.
- **Criterios de Aceptación:**
  - Los estados representan hechos comprobables.
  - Se prueba la pérdida y recuperación de conexión.
- **Estado:** [X] Completada

### [X] [T-UX-23] Completar el flujo de reporte de problemas y soporte
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 19)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `#btn-global-report-issue`, `#modal-report-issue` y el servicio de recepción de reportes.
- **Descripción del Alcance:**
  1. Mantener un acceso discreto y fácil de encontrar.
  2. Solicitar una descripción comprensible del problema.
  3. Validar campos obligatorios y longitud significativa.
  4. Registrar el reporte en un destino real en `TicketsReporteProblemas`.
- **Criterios de Aceptación:**
  - El acceso se encuentra disponible en los contextos autorizados.
  - La descripción se valida antes del envío.
  - Los reportes válidos se registran en el destino correspondiente.
- **Estado:** [X] Completada

### [X] [T-UX-24] Normalizar las acciones, los estados y la jerarquía visual institucional
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 17)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `css/style.css`, `js/ui-common.js`
- **Dependencias Expuestas:** `css/style.css`, encabezados, botones, formularios, tablas, tarjetas, modales, mensajes y menús.
- **Descripción del Alcance:**
  1. Mantener una jerarquía clara entre acciones principales y secundarias.
  2. Unificar los estilos de controles equivalentes.
  3. Normalizar los estados de éxito, error, advertencia, carga y ausencia de datos.
- **Criterios de Aceptación:**
  - Los botones equivalentes mantienen una jerarquía y apariencia coherentes.
  - Los estados equivalentes se representan de manera consistente.
- **Estado:** [X] Completada

### [X] [T-UX-25] Incorporar preferencias de usuario y personalización controlada de vistas
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 20)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Paneles de control, vistas guardadas, menús, preferencias y almacenamiento de configuración por usuario.
- **Descripción del Alcance:**
  1. Permitir guardar preferencias útiles de visualización y consulta.
  2. Mantener los valores predeterminados definidos por la institución.
  3. Permitir restablecer preferencias.
- **Criterios de Aceptación:**
  - Las preferencias se guardan en el ámbito anunciado.
  - Las vistas personalizadas se restauran correctamente.
- **Estado:** [X] Completada

### [X] [T-UX-27] Optimizar el rendimiento percibido y la respuesta de las interfaces
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 27)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `js/api.js`
- **Dependencias Expuestas:** Paneles, omnibox, tablas, filtros, modales, servicios de datos y estados de carga.
- **Descripción del Alcance:**
  1. Medir los tiempos de las operaciones más frecuentes.
  2. Mostrar estados de carga comprensibles.
  3. Evitar solicitudes repetidas que no aporten información.
- **Criterios de Aceptación:**
  - Las acciones frecuentes responden con fluidez bajo condiciones de uso representativas.
- **Estado:** [X] Completada

---

## GRUPO PRIORIDAD P3 (BAJO)

### [X] [TAREA-17] Incorporar analítica académica por área, asignatura y programa
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & K)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Tareas 08, 12 y 13, además de las estructuras de calificaciones.
- **Descripción del Alcance:**
  1. Analítica de distribución de notas, tendencias de rendimiento por parcial y alertas de acompañamiento pedagógico.
  2. Comparativas homogéneas por grado, sección, programa e idioma de enseñanza.
  3. Exclusión explícita de notas pendientes en promedios para evitar distorsiones.
  4. Exportación de informes analíticos para Dirección y coordinadores.
- **Criterios de Aceptación:**
  - Los indicadores coinciden con los datos académicos de origen.
  - Los filtros no mezclan periodos o programas incompatibles.
  - Los resultados pendientes no distorsionan los promedios.
  - Los usuarios solo pueden consultar la información que les corresponde.
  - Los informes identifican los criterios usados para cada comparación.
- **Estado:** [X] Completada

### [X] [TAREA-18] Ampliar la reutilización de recursos educativos y actividades entre áreas
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & K)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Tarea 08, materiales educativos, almacenamiento y servicios curriculares.
- **Descripción del Alcance:**
  1. Catálogo de recursos reutilizables etiquetados por área, materia, grado, tema e idioma.
  2. Proyectos interdisciplinarios compartidos entre departamentos.
  3. Gestión de versiones de materiales sin alterar actividades publicadas en periodos anteriores.
- **Criterios de Aceptación:**
  - Un recurso puede localizarse desde su área o asignatura.
  - Los recursos compartidos conservan sus permisos y relaciones.
  - Las modificaciones no alteran actividades históricas de forma silenciosa.
  - Los docentes pueden reutilizar recursos autorizados sin duplicar archivos innecesariamente.
  - Los proyectos interdisciplinarios pueden relacionar recursos de varias áreas.
- **Estado:** [X] Completada

### [X] [TAREA-19] Implementar configuración y migración curricular sin pérdida de datos
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & K)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`
- **Dependencias Expuestas:** Tarea 08, catálogo de asignaturas, historial académico y estructura de almacenamiento.
- **Descripción del Alcance:**
  1. Herramienta de mapeo y equivalencias curriculares para planes anteriores.
  2. Preservación inalterable de códigos de estudiantes, calificaciones históricas y boletines emitidos.
  3. Bucle de pre-validación y reportes de discrepancias antes de ejecutar migraciones.
  4. Mecanismo de reversión (rollback) seguro.
- **Criterios de Aceptación:**
  - Las asignaturas existentes quedan correctamente vinculadas o se reportan como pendientes.
  - No se pierden calificaciones ni relaciones históricas.
  - Las equivalencias curriculares requieren validación cuando no son inequívocas.
  - Las migraciones detectan registros duplicados o huérfanos.
  - Los resultados pueden compararse antes y después de la migración.
  - La reversión recupera el estado anterior cuando sea necesaria.
- **Estado:** [X] Completada

### [X] [TAREA-20] Formalizar la incorporación de nuevas áreas y servicios curriculares
- **Origen del Hallazgo:** Auditoría de la Fase 1, octubre de 2026 (AUDITORIA_FASE1_PLANIFICACION_EXPANSION.md - Sección B & K)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/config.js`
- **Dependencias Expuestas:** Tareas 05, 08 y 09, contratos de servicios y configuración institucional.
- **Descripción del Alcance:**
  1. Plantilla técnica estandarizada para registro de nuevas áreas curriculares y servicios de Apps Script.
  2. Protocolo de pruebas específicas por área previo a su habilitación en producción.
  3. Desactivación segura de áreas preservando historiales y entregas pasadas.
- **Criterios de Aceptación:**
  - Se puede incorporar una nueva área siguiendo un procedimiento documentado.
  - El servicio queda vinculado al área correcta y dispone de permisos adecuados.
  - Los componentes compartidos se reutilizan sin duplicar toda la lógica.
  - La activación de una nueva área no altera los servicios existentes.
  - Las pruebas del servicio se ejecutan antes de habilitarlo para usuarios.
  - Las áreas desactivadas conservan sus registros históricos.
- **Estado:** [X] Completada

### [X] [FASE2-T17] Incorporar una política de versionado y evolución de configuraciones compartidas
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 3)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `js/config.js`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Contratos API, fuente de verdad de catálogos y configuración central.
- **Descripción del Alcance:**
  1. Identificar las configuraciones y catálogos que requieren versionado.
  2. Registrar la versión o fecha de actualización cuando resulte necesario.
  3. Definir compatibilidad entre versiones.
  4. Permitir detectar consumidores desactualizados.
  5. Mantener la interpretación de registros históricos.
  6. Documentar cómo se retiran versiones antiguas y cómo se recupera una configuración incorrecta.
- **Criterios de Aceptación:**
  1. Las configuraciones críticas pueden identificarse por versión o mecanismo equivalente.
  2. Un consumidor incompatible detecta la incompatibilidad en lugar de utilizar datos incorrectos.
  3. Los registros históricos siguen siendo interpretables tras una actualización.
  4. Una actualización de configuración puede validarse antes de aplicarse a todos los consumidores.
  5. Existe un procedimiento de reversión para los cambios de configuración que lo requieran.
- **Estado:** [X] Completada

### [X] [FASE2-T18] Crear un tablero de salud e interoperabilidad institucional
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 7)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `js/ui-common.js`, `js/api.js`
- **Dependencias Expuestas:** Métricas operativas, trazabilidad y mecanismos de salud de servicios.
- **Descripción del Alcance:**
  1. Mostrar el estado operativo de cada servicio relevante.
  2. Diferenciar disponibilidad, latencia, tasa de errores, cuota, procesos pendientes y eventos fallidos.
  3. Mostrar la última actualización de cada indicador.
  4. Identificar las dependencias que provocan una degradación.
  5. Permitir filtrar por servicio, periodo y tipo de incidencia.
  6. Restringir el acceso a personal autorizado.
  7. Evitar exponer datos personales, credenciales o información financiera.
  8. Enlazar los indicadores con registros de diagnóstico y acciones de recuperación, cuando existan.
- **Criterios de Aceptación:**
  1. Una caída simulada de un servicio se refleja en su estado.
  2. Los errores de una dependencia pueden distinguirse de los del servicio que la consume.
  3. Los indicadores muestran su periodo de medición y no se presentan como actuales si están desactualizados.
  4. Las incidencias pueden filtrarse y consultarse por personal autorizado.
  5. Los datos mostrados coinciden con las mediciones o registros reales disponibles.
  6. La interfaz no informa disponibilidad completa cuando existen operaciones críticas fallidas o pendientes.
- **Estado:** [X] Completada

### [X] [FASE2-T19] Optimizar la gestión de caché de datos institucionales
- **Origen del Hallazgo:** Auditoría de la Fase 2, octubre de 2026 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 1 & 3)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/config.js`
- **Dependencias Expuestas:** Autorización, resolución de catálogos, configuración y métricas operativas.
- **Descripción del Alcance:**
  1. Inventariar las cachés existentes y los datos almacenados.
  2. Diferenciar datos relativamente estáticos de información sensible al tiempo, como permisos y estados de cuenta.
  3. Definir la vigencia apropiada para cada tipo de dato.
  4. Incorporar invalidación cuando se produzcan cambios que afecten a la validez de la caché.
  5. Evitar que una entrada obsoleta sustituya datos nuevos confirmados.
  6. Definir qué ocurre si la fuente de verdad no está disponible.
  7. Medir el impacto de la caché en latencia, consumo de cuotas y consistencia.
  8. Evitar almacenar información sensible en ámbitos compartidos sin separación por identidad.
- **Criterios de Aceptación:**
  1. Cada caché crítica tiene una política documentada de vigencia e invalidación.
  2. Los cambios de permisos se reflejan dentro del plazo definido.
  3. Los datos de diferentes usuarios no se mezclan.
  4. Los datos obsoletos no se presentan como confirmados cuando la función exige información actual.
  5. Las pruebas comparan el comportamiento con caché y sin caché.
  6. Las modificaciones conservan o mejoran el rendimiento sin debilitar la seguridad ni la integridad.
- **Estado:** [X] Completada

### [X] [T-UX-26] Incorporar una vista de actividad reciente contextual
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 13)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `js/ui-common.js`
- **Dependencias Expuestas:** Paneles de control, centro de notificaciones y registros de actividad disponibles.
- **Descripción del Alcance:**
  1. Identificar si ya existe una función equivalente.
  2. Mostrar elementos recientes pertinentes para cada rol.
  3. Distinguir actividad informativa de tareas pendientes.
  4. Permitir regresar a registros consultados recientemente cuando continúen disponibles.
- **Criterios de Aceptación:**
  - Los elementos mostrados corresponden a actividad real.
  - El orden temporal es correcto.
- **Estado:** [X] Completada


---

# FASE 2: ARQUITECTURA INSTITUCIONAL E INTEROPERABILIDAD

# LISTA DE TAREAS DE IMPLEMENTACIÓN Y MEJORA — FASE 2: ARQUITECTURA INSTITUCIONAL E INTEROPERABILIDAD

### [X] [FASE2-01] Protocolo de Interoperabilidad y Aislamiento entre Servicios Departamentales
- **Origen del Hallazgo:** Auditoría de la Fase 2 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 1)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/config.js`, `js/api.js`, `backend/user-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Estado:** [X] Completada

### [X] [FASE2-02] Normalización de Contratos API y Manejo Controlado de Errores
- **Origen del Hallazgo:** Auditoría de la Fase 2 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 2)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/api.js`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Estado:** [X] Completada

### [X] [FASE2-03] Resolución Centralizada de Fuentes de Datos y Catálogos Maestros
- **Origen del Hallazgo:** Auditoría de la Fase 2 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 3)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/config.js`, `backend/academic-service/Code.gs`
- **Estado:** [X] Completada

### [X] [FASE2-04] Sistema Unificado de Identificadores CUV, UUID y Trazabilidad
- **Origen del Hallazgo:** Auditoría de la Fase 2 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 4)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`
- **Estado:** [X] Completada

### [X] [FASE2-05] Mecanismo Atómico de Sincronización, LockService e Idempotencia
- **Origen del Hallazgo:** Auditoría de la Fase 2 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 5)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`
- **Estado:** [X] Completada

### [X] [FASE2-06] Motor de Eventos Inter-Módulo y Despacho Multicanal
- **Origen del Hallazgo:** Auditoría de la Fase 2 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [FASE2-07] Supervisión de Cuotas Operativas, Paginación y Plan de Crecimiento
- **Origen del Hallazgo:** Auditoría de la Fase 2 (AUDITORIA_FASE2_ARQUITECTURA_INTEROPERABILIDAD.md - Área 7)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/api.js`, `js/ui-common.js`, `backend/academic-service/Code.gs`
- **Estado:** [X] Completada


---

# FASE 4: IDENTIDAD, PERMISOS Y GOBIERNO DE LA INFORMACIÓN

## RESUMEN DE EJECUCIÓN DE LA FASE 4
Se han completado y verificado al 100% todas las tareas de desarrollo, seguridad y gobierno de la información pertenecientes a la Fase 4. Se ha unificado la autenticación HMAC-SHA256 en los 5 microservicios backend, eliminado vulnerabilidades IDOR con aislamiento estricto ABAC (`_verifiedUserId`), implementado la revocación de sesiones en tiempo real, protección contra fuerza bruta y registro de auditoría `LOGIN_FAILED`, motor de delegaciones temporales, motor automático de retención y anonimización de datos, matriz dinámica de permisos por rol, panel de solicitudes de derechos de privacidad ARCO, historial de cambios de entidad con diffs sanitizados, gestión institucional de cargos y departamentos, bus de propagación de eventos de seguridad y cola de reintentos, tablero interactivo de seguridad y cumplimiento, generación atómica de IDs institucionales, máquina de estados de ciclo de vida de cuentas, candados atómicos `LockService`, documentación institucional de privacidad y retención, reportes periódicos de revisión de privilegios, paginación en servidor de bitácoras de auditoría, y el escáner de detección y reconciliación de inconsistencias referenciales de identidad.

### TAREAS COMPLETADAS DE LA FASE 4:
- [X] [TAREA-F4-P0-01] Unificar la autenticación y autorización de los cinco microservicios (HMAC-SHA256)
- [X] [TAREA-F4-P0-02] Corregir las vulnerabilidades IDOR y garantizar el aislamiento de datos personales (ABAC)
- [X] [TAREA-F4-P0-03] Garantizar la revocación efectiva de sesiones y la actualización inmediata de privilegios
- [X] [TAREA-F4-P0-04] Registrar los intentos fallidos de autenticación y reforzar la protección contra ataques
- [X] [TAREA-F4-P1-01] Implementar el motor transversal de delegaciones de seguridad y permisos temporales
- [X] [TAREA-F4-P1-02] Implementar el motor automático de retención, archivo y anonimización de datos
- [X] [TAREA-F4-P1-03] Implementar una matriz dinámica de permisos por rol, acción, módulo y ámbito
- [X] [TAREA-F4-P1-04] Implementar una política unificada de autorización contextual RBAC/ABAC
- [X] [TAREA-F4-P1-05] Incorporar un panel de gobierno de privacidad y gestión de derechos sobre datos (ARCO)
- [X] [TAREA-F4-P1-06] Fortalecer la trazabilidad mediante historial de cambios y auditoría de versiones
- [X] [TAREA-F4-P1-07] Implementar gestión institucional de roles, cargos, departamentos y asignaciones
- [X] [TAREA-F4-P1-08] Implementar un mecanismo central de propagación y recuperación de cambios de seguridad
- [X] [TAREA-F4-P1-09] Crear un panel de seguridad, auditoría y cumplimiento institucional
- [X] [TAREA-F4-P2-01] Eliminar la generación de identificadores de usuario basada en marcas de tiempo
- [X] [TAREA-F4-P2-02] Implementar una gestión completa del ciclo de vida de cuentas y sesiones
- [X] [TAREA-F4-P2-03] Mejorar la experiencia administrativa de gestión de usuarios, permisos y delegaciones
- [X] [TAREA-F4-P2-04] Optimizar la concurrencia y la consistencia de las operaciones de identidad
- [X] [TAREA-F4-P2-05] Consolidar la documentación institucional de privacidad y tratamiento de datos
- [X] [TAREA-F4-P3-01] Implementar informes periódicos de revisión de privilegios y cuentas
- [X] [TAREA-F4-P3-02] Optimizar los informes de auditoría y el diagnóstico de incidencias con paginación
- [X] [TAREA-F4-P3-03] Establecer un sistema de detección y reconciliación de inconsistencias de identidad

---

# FASE 3: EXPERIENCIA DE USUARIO Y NAVEGACIÓN UNIFICADA

# LISTA DE TAREAS DE IMPLEMENTACIÓN Y MEJORA — FASE 3: EXPERIENCIA DE USUARIO Y NAVEGACIÓN UNIFICADA

### [X] [T-UX-01] Manejo Centralizado de Expiración de Sesión y Excepciones de Autorización
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 1)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `js/api.js`, `js/ui-common.js`, `js/auth.js`
- **Estado:** [X] Completada

### [X] [T-UX-02] Soporte Universal Tecla Escape para Cierre de Modales y Restauración de Foco
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 7)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-03] Módulo de Protección contra Pérdida de Cambios No Guardados en Formularios
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-04] Indicador e Badge de Frescura de Datos Sincronizados con Trigger Manual
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 9)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-05] Normalización Diacrítica Insensible a Tildes para Búsquedas y Filtros
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 4)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-06] Omnibox Unificado Multi-Entidad con Atajo Global `Ctrl + K`
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 4)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [T-UX-07] Indicador Discreto de Estado de Conexión En Línea / Offline
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 10)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-08] Botón y Flujo Discreto de Reporte de Problemas Técnicos
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 10)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [T-UX-09] Menú Lateral Responsivo Específico por Rol con Colapso Móvil Suave
- **Origen del Hallazgo:** Auditoría de la Fase 3 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 3)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Estado:** [X] Completada

### [X] [T-UX-10] Completar la verificación funcional y automatizar las pruebas de experiencia de usuario
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `js/student.js`, `js/teacher.js`, `js/accounting.js`
- **Estado:** [X] Completada

### [X] [T-UX-11] Unificar la navegación contextual y conservar el estado de las vistas
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 1)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Estado:** [X] Completada

### [X] [T-UX-12] Consolidar los paneles de control por rol y departamento
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 2)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/student.js`, `js/teacher.js`, `js/accounting.js`
- **Estado:** [X] Completada

### [X] [T-UX-13] Completar el menú lateral específico de cada panel
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 3)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Estado:** [X] Completada

### [X] [T-UX-14] Completar la búsqueda global y optimizar sus resultados
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 4)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [T-UX-15] Implementar filtros avanzados, vistas guardadas y paginación coherente
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 5)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-16] Unificar los estados de notificaciones, tareas pendientes y aprobaciones
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 11 & 12)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [T-UX-17] Corregir y completar la protección de cambios no guardados
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 6)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-18] Completar los componentes compartidos de formularios, tablas y vistas de detalle
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 7 & 8)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `css/style.css`
- **Estado:** [X] Completada

### [X] [T-UX-19] Verificar la accesibilidad y corregir las barreras detectadas
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 15)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `css/style.css`
- **Estado:** [X] Completada

### [X] [T-UX-20] Completar la adaptación móvil y el comportamiento responsivo
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 16)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `js/ui-common.js`, `css/style.css`
- **Estado:** [X] Completada

### [X] [T-UX-21] Completar el indicador de frescura de datos y los estados de sincronización
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 9)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-22] Corregir el significado y el comportamiento del indicador de estado en línea
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 18)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-23] Completar el flujo de reporte de problemas y soporte
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 19)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [T-UX-24] Normalizar las acciones, los estados y la jerarquía visual institucional
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 17)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `css/style.css`, `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-25] Incorporar preferencias de usuario y personalización controlada de vistas
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 20)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [T-UX-26] Incorporar una vista de actividad reciente contextual
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 13)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [T-UX-27] Optimizar el rendimiento percibido y la respuesta de las interfaces
- **Origen del Hallazgo:** Auditoría de la Fase 3, octubre de 2026 (AUDITORIA_FASE3_EXPERIENCIA_USUARIO_NAVEGACION.md - Área 27)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `js/api.js`
- **Estado:** [X] Completada

- # REGISTRO OFICIAL DE TAREAS COMPLETADAS — FASE 4
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**

---

## GRUPO PRIORIDAD P0 (CRÍTICO)

### [X] [TAREA-F4-P0-01] Unificar la autenticación y autorización de los cinco microservicios
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-01)
- **Severidad/Clasificación:** Crítico · Seguridad · Backend · Arquitectura
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`, `js/auth.js`, `js/api.js`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P0-02] Corregir las vulnerabilidades IDOR y garantizar el aislamiento de datos personales
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-02)
- **Severidad/Clasificación:** Crítico · Seguridad · Protección de datos · Backend
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P0-03] Garantizar la revocación efectiva de sesiones y la actualización inmediata de privilegios
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-03)
- **Severidad/Clasificación:** Crítico · Seguridad · Gestión de sesiones · Backend
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/exam-service/Code.gs`, `backend/task-service/Code.gs`, `js/auth.js`, `js/api.js`, `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P0-04] Registrar los intentos fallidos de autenticación y reforzar la protección contra ataques
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P0-04)
- **Severidad/Clasificación:** Crítico · Seguridad · Auditoría · Autenticación
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `BitacoraEventos`, `BitacoraTraceability`
- **Estado:** [X] Completada

---

## GRUPO PRIORIDAD P1 (ALTO)

### [X] [TAREA-F4-P1-01] Implementar el motor transversal de delegaciones de seguridad y permisos temporales
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P1-01)
- **Severidad/Clasificación:** Alto · Seguridad · Gobierno Institucional
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-02] Implementar el motor automático de retención, archivo y anonimización de datos
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md - HALLAZGO-F4-P1-02)
- **Severidad/Clasificación:** Alto · Privacidad · Protección de datos
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-03] Implementar una matriz dinámica de permisos por rol, acción, módulo y ámbito
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Autorización · Administración
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/ui-common.js`, Dashboards
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-04] Implementar una política unificada de autorización contextual RBAC/ABAC
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Seguridad · Backend
- **Archivos Involucrados:** `backend/*/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-05] Incorporar un panel de gobierno de privacidad y gestión de derechos sobre datos
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Privacidad · Administración
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `politica-de-privacidad.html`, `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-06] Fortalecer la trazabilidad mediante historial de cambios y auditoría de versiones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Auditoría · Integridad
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `BitacoraEventos`, `BitacoraTraceability`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-07] Implementar gestión institucional de roles, cargos, departamentos y asignaciones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Identidad · Backend
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-08] Implementar un mecanismo central de propagación y recuperación de cambios de seguridad
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Arquitectura · Consistencia
- **Archivos Involucrados:** `backend/*/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P1-09] Crear un panel de seguridad, auditoría y cumplimiento institucional
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Alto · Observabilidad · Seguridad
- **Archivos Involucrados:** `js/ui-common.js`, `dashboard-direccion.html`, `backend/user-service/Code.gs`
- **Estado:** [X] Completada

---

## GRUPO PRIORIDAD P2 (MEDIO)

### [X] [TAREA-F4-P2-01] Eliminar la generación de identificadores de usuario basada en marcas de tiempo
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Identidad
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P2-02] Implementar una gestión completa del ciclo de vida de cuentas y sesiones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Identidad · Administración
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/auth.js`, `js/ui-common.js`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P2-03] Mejorar la experiencia administrativa de gestión de usuarios, permisos y delegaciones
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Interfaz · Usabilidad
- **Archivos Involucrados:** `js/ui-common.js`, Dashboards HTML
- **Estado:** [X] Completada

### [X] [TAREA-F4-P2-04] Optimizar la concurrencia y la consistencia de las operaciones de identidad
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Backend · Rendimiento
- **Archivos Involucrados:** `backend/*/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P2-05] Consolidar la documentación institucional de privacidad y tratamiento de datos
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Medio · Privacidad · Documentación
- **Archivos Involucrados:** `politica-de-privacidad.html`, `politica-de-uso.html`, `politica-financiera.html`
- **Estado:** [X] Completada

---

## GRUPO PRIORIDAD P3 (BAJO)

### [X] [TAREA-F4-P3-01] Implementar informes periódicos de revisión de privilegios y cuentas
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Bajo · Seguridad · Gobierno
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P3-02] Optimizar los informes de auditoría y el diagnóstico de incidencias
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Bajo · Observabilidad · Rendimiento
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Estado:** [X] Completada

### [X] [TAREA-F4-P3-03] Establecer un sistema de detección y reconciliación de inconsistencias de identidad
- **Origen del Hallazgo:** Auditoría de la Fase 4 (AUDITORIA_FASE4_IDENTIDAD_PERMISOS_GOBIERNO.md)
- **Severidad/Clasificación:** Bajo · Integridad · Identidad
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Estado:** [X] Completada
# PLAN MAESTRO DE TAREAS PENDIENTES — FASE 5: ADMISIONES, ASPIRANTES Y PORTAL DE FAMILIAS

---

## PRIORIDAD P0: INTEGRIDAD DE DATOS, SEGURIDAD Y FLUJO PRINCIPAL DE ADMISIÓN

### [X] [TAREA-F5-001] Corregir la conversión de aspirantes y garantizar la integridad del expediente
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-02, HALLAZGOS-F5-P0-03, HALLAZGOS-F5-P0-04) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Sección H - Brechas P0-02, P0-03, P0-04)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 800-880), `backend/user-service/Code.gs` (l. 3110-3200), `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** Hojas `SolicitudesAdmision`, `ExpedientesEstudiantes`, `Matriculas`, `RelacionesFamiliares`, `InvitacionesVinculacion`, `CargosEstudiante`, `MovimientosEstudiante`, `SecuenciasIDs`
- **Descripción del Alcance:**
  1. Consultar la solicitud original y verificar su existencia antes de iniciar la conversión.
  2. Permitir la conversión únicamente cuando la solicitud esté en estado `Admitida`, cumpla los requisitos obligatorios y no haya sido convertida previamente.
  3. Rechazar solicitudes recibidas, en revisión, rechazadas, incompletas o ya convertidas. Una solicitud admitida con documentos o condiciones obligatorias pendientes tampoco podrá convertirse, salvo que exista una excepción institucional explícita y autorizada configurada dinámicamente (`ALLOW_INCOMPLETE_ADMISSION_CONVERSION`).
  4. Generar identificadores únicos atómicos mediante `generateInstitutionalId` y `LockService.getScriptLock(10000)` para el expediente (`EXP-`), la matrícula (`MAT-`) y los registros relacionados. Se prohíbe el uso exclusivo de marcas de tiempo (`now.getTime()`).
  5. Aplicar control de concurrencia a la operación completa, incluida la comprobación del estado de la solicitud y de la disponibilidad de plazas.
  6. Vincular el nuevo expediente con la solicitud de origen mediante el identificador persistente `solicitudId`.
  7. Transferir los datos personales y de contacto del aspirante sin alterations injustificadas.
  8. Crear o actualizar la relación con el responsable utilizando el mecanismo institucional de identidad y vinculación. Crear el usuario del tutor y generar la fila en `RelacionesFamiliares`. Si el responsable no posee cuenta, iniciar el procedimiento de invitación por token (`createLinkInvitation`) y verificación, sin conceder accesos automáticos no verificados. Si se requiere flexibilidad institucional, el comportamiento de invitación directa vs token de verificación será configurable en la plataforma mediante la directiva `MANDATORY_TUTOR_TOKEN_VERIFICATION`.
  9. Evitar duplicar personas, usuarios, relaciones familiares, expedientes, matrículas y cargos cuando se reintente una operación.
  10. Crear los cargos de matrícula y otros conceptos obligatorios únicamente conforme a la configuración institucional vigente en `OfertaAcademica` / `ConfiguracionFinanciera`, evitando importes predeterminados arbitrarios.
  11. Registrar el estado de la conversión y sus resultados para distinguir una operación completada de otra pendiente o fallida.
  12. Implementar un mecanismo de recuperación y compensación que permita reanudar o compensar los pasos fallidos en transacciones distribuídas entre microservicios sin duplicar registros.
- **Criterios de Aceptación:**
  - [x] Una solicitud en estado `Recibida` no puede convertirse.
  - [x] Una solicitud en estado `En_Revision` no puede convertirse.
  - [x] Una solicitud en estado `Rechazada` no puede convertirse.
  - [x] Una solicitud `Admitida` con requisitos obligatorios pendientes no puede convertirse (salvo excepción autorizada configurada).
  - [x] Una solicitud `Admitida` que cumple todos los requisitos puede convertirse correctamente.
  - [x] La conversión conserva el identificador de la solicitud original (`solicitudId`).
  - [x] El expediente y la matrícula contienen los datos académicos correctos.
  - [x] Los datos del responsable quedan asociados al proceso de vinculación familiar en `RelacionesFamiliares`.
  - [x] La creación de una relación familiar no concede acceso al portal antes de completar la verificación exigida.
  - [x] Dos peticiones simultáneas de conversión no producen dos expedientes ni dos matrículas para la misma solicitud (bloqueo por `LockService`).
  - [x] Repetir una petición completada devuelve el resultado existente o informa que la solicitud ya fue convertida, sin duplicar efectos.
  - [x] Si falla la creación de un cargo, la operación queda en un estado recuperable y no se presenta como completamente finalizada.
  - [x] Si no hay plazas disponibles, la conversión se bloquea sin crear una matrícula activa.
  - [x] Los errores no dejan relaciones familiares, cargos o matrículas huérfanos sin posibilidad de reconciliación.
  - [x] Los eventos y cambios quedan registrados en `BitacoraTraceability` y `HistorialCambiosEntidad` para reconstruir la secuencia de la operación.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-002] Implementar una máquina de estados y reglas de transición para las solicitudes
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-03) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.4, Brecha P0-03)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 779-799), `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Hoja `SolicitudesAdmision`, `HistorialCambiosEntidad`, `ALLOWED_ADMISSION_STATE_TRANSITIONS`
- **Descripción del Alcance:**
  1. Definir formalmente los estados de una solicitud y las transiciones autorizadas mediante la constante `ALLOWED_ADMISSION_STATE_TRANSITIONS`.
  2. Implementar, como mínimo, el siguiente flujo obligatorio: `Recibida` → `En_Revision` → `Evaluacion` → `Admitida` / `Rechazada`. Añadir el estado `En_Espera` para las solicitudes incorporadas a una lista de espera y `Convertida` para las solicitudes cuyo proceso de matrícula haya finalizado.
  3. Permitir que la solicitud avance a `Evaluacion` únicamente cuando se hayan cumplido los requisitos previos configurados para esa etapa.
  4. Exigir una justificación obligatoria (mínimo 10 caracteres) para rechazos y decisiones que requieran motivación institucional.
  5. Validar los requisitos documentales, las evaluaciones y las condiciones administrativas antes de permitir una decisión definitiva.
  6. Evitar que una solicitud rechazada o convertida vuelva a un estado anterior mediante una actualización ordinaria.
  7. Si se necesita reabrir un expediente, permitirlo únicamente a usuarios con rol `Director` / `Administrador`, mediante una operación explícita (`reopenAdmissionRequest`) que conserve la decisión original y su historial.
  8. Registrar el estado anterior, el nuevo estado, el responsable del cambio, la fecha, la justificación y el identificador de la operación en `HistorialCambiosEntidad` y `logStructuredEvent`.
  9. Proteger las transiciones frente a solicitudes concurrentes con `LockService` y frente a reintentos con claves de idempotencia.
  10. Separar explícitamente el estado de admisión del estado de matrícula para que una solicitud admitida no se considere automáticamente matriculada.
- **Criterios de Aceptación:**
  - [x] Un estado desconocido es rechazado por el servidor con error `INVALID_ADMISSION_STATE`.
  - [x] No se permite pasar directamente de `Recibida` a `Convertida`.
  - [x] No se permite convertir una solicitud sin aprobación previa en estado `Admitida`.
  - [x] Un rechazo sin justificación obligatoria se rechaza sin modificar el estado.
  - [x] Una solicitud con requisitos obligatorios pendientes no puede avanzar a una etapa que los requiera.
  - [x] Un usuario sin autorización no puede modificar estados aunque invoque directamente el endpoint backend.
  - [x] Dos cambios simultáneos no sobrescriben silenciosamente una decisión más reciente.
  - [x] Un reintento no genera decisiones, notificaciones ni registros duplicados.
  - [x] El historial en `HistorialCambiosEntidad` permite reconstruir cada transición y su autor.
  - [x] Reabrir una solicitud no elimina ni altera el registro de su decisión anterior.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-003] Implementar identificadores únicos, control de concurrencia e idempotencia en admisiones
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-04) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.1 y 5.11, Brecha P0-04)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 714-740, 800-860)
- **Dependencias Expuestas:** Hoja `SecuenciasIDs`, `TablaIdempotencia`, `LockService`
- **Descripción del Alcance:**
  1. Implementar el mecanismo atómico `generateInstitutionalId` para solicitudes (`ADM-2026-XXXXX`), expedientes (`EXP-2026-XXXXX`) y matrículas (`MAT-2026-XXXXX`). Se prohíbe el uso de `Date.now()` o `now.getTime()` como mecanismo único.
  2. Proteger las operaciones críticas de creación, cambio de estado y conversión mediante `LockService.getScriptLock(10000)`.
  3. Aplicar validaciones de unicidad de aspirante dentro de la sección protegida por el candado atómico.
  4. Incorporar `checkAndRegisterIdempotencyKey` y `saveIdempotentResult` en `createAdmissionRequest`, `updateAdmissionStatus` y `convertAdmissionToStudent` para evitar duplicaciones por reintentos de red.
  5. Definir el comportamiento ante claves de idempotencia repetidas: si los datos coinciden, retornar el resultado previo almacenado; si los datos difieren, rechazar con error `IDEMPOTENCY_CONFLICT`.
  6. Validar duplicados potenciales de aspirantes mediante DNI/Identificación, fecha de nacimiento y correo del responsable. No fusionar automáticamente personas basándose únicamente en nombres coincidentes.
  7. Implementar rollback/reversión si la persistencia falla a mitad de la operación para evitar registros incompletos.
  8. Registrar conflictos de concurrencia y reintentos en `logStructuredEvent` sin exponer datos personales sensibles.
- **Criterios de Aceptación:**
  - [x] Las solicitudes simultáneas reciben identificadores atómicos distintos y secuenciales.
  - [x] La repetición de una operación con la misma clave de idempotencia no crea registros adicionales.
  - [x] La reutilización de una clave de idempotencia con datos incompatibles se rechaza.
  - [x] Los duplicados potenciales por DNI o Email se identifican antes de crear una nueva solicitud.
  - [x] Los errores de persistencia no dejan solicitudes que aparenten estar completas.
  - [x] Las pruebas concurrentes no producen identificadores repetidos ni matrículas duplicadas.
  - [x] El mecanismo no depende exclusivamente de la precisión temporal del reloj del servidor.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-004] Construir el formulario público de admisión y conectarlo con el backend
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.1, Brecha P0-01)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `admision.html` (Nuevo), `js/student.js`, `js/auth.js`, `backend/academic-service/Code.gs` (l. 714)
- **Dependencias Expuestas:** Endpoint `createAdmissionRequest`, `PUBLIC_ACTIONS`, `js/ui-common.js`
- **Descripción del Alcance:**
  1. Diseñar e implementar la interfaz pública `admision.html` accesible desde dispositivos móviles y computadoras.
  2. Permitir seleccionar el año lectivo, grado solicitado y la oferta académica disponible consultada dinámicamente desde `getAcademicOffers`.
  3. Recopilar datos personales del aspirante (nombres, apellidos, DNI/Identificación, fecha de nacimiento), datos de contacto y datos completos del responsable (nombre, teléfono, email, parentesco).
  4. Mostrar dinámicamente los requisitos documentales correspondientes al grado o programa seleccionado.
  5. Validar campos obligatorios, formatos de teléfono (Honduras `+504`), email válido, DNI (13 dígitos) y consistencia tanto en el cliente como en el servidor.
  6. Mostrar errores junto a los campos afectados y conservar los datos válidos tras un fallo.
  7. Informar si existe una solicitud potencialmente duplicada sin revelar datos personales de terceros.
  8. Invocación limpia de `createAdmissionRequest` en `ACADEMIC` y presentación del modal de confirmación con el código de seguimiento `solicitudId`.
  9. Mostrar un panel de consulta de estado por número de seguimiento e identificación para aspirantes sin cuenta de usuario.
  10. Incluir aviso de privacidad ARCO y consentimiento informado antes de recopilar datos de menores.
  11. Diferenciar explícitamente el envío de la solicitud de su aprobación institucional.
  12. Soportar reintentos limpios ante fallos de red sin duplicar solicitudes.
- **Criterios de Aceptación:**
  - [x] Una familia puede completar y enviar una solicitud válida desde un dispositivo móvil o de escritorio.
  - [x] Los datos ingresados llegan al backend y se conservan correctamente en `SolicitudesAdmision`.
  - [x] Una solicitud inválida no se registra como completa.
  - [x] Un error del servidor no produce un mensaje falso de éxito en la pantalla.
  - [x] Una solicitud enviada devuelve e informa un identificador de seguimiento único (`solicitudId`).
  - [x] El usuario puede corregir errores de validación sin volver a introducir todos los datos.
  - [x] Los intentos duplicados se detectan y notifican adecuadamente.
  - [x] La interfaz impide seleccionar grados u ofertas no disponibles en la institución.
  - [x] La pantalla funciona mediante teclado y cumple WCAG 2.2 AA.
  - [x] No se exponen datos de otros aspirantes en mensajes de error o validación.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-005] Crear la consola administrativa de revisión y decisión de admisiones
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.6, Brecha P0-01)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `dashboard-direccion.html`, `teacher-dashboard.html`, `js/teacher.js`, `backend/academic-service/Code.gs` (l. 748, 779, 800)
- **Dependencias Expuestas:** Endpoints `getAdmissionRequests`, `updateAdmissionStatus`, `convertAdmissionToStudent`, `setupAdvancedTableFilters`
- **Descripción del Alcance:**
  1. Crear la vista administrativa e interfaz de tabla para consultar, filtrar y administrar solicitudes de admisión.
  2. Implementar filtros avanzados por año lectivo, grado solicitado, estado, fecha de recepción y presencia de requisitos pendientes (`setupAdvancedTableFilters`).
  3. Mostrar modal de detalle integral con datos del aspirante, responsable declarado, documentos adjuntos, entrevistas, evaluaciones y timeline de estados.
  4. Distinguir visualmente solicitudes incompletas, en revisión, evaluadas y listas para decisión final.
  5. Permitir asignar responsables de revisión e ingresar observaciones internas confidenciales.
  6. Renderizar únicamente los botones de transición de estado autorizados según el estado actual de la solicitud y el rol del usuario.
  7. Exigir justificación obligatoria en campo de texto antes de confirmar rechazos o cambios de estado críticos.
  8. Mostrar advertencias si faltan documentos obligatorios, evaluaciones o si la capacidad de la sección está agotada.
  9. Sincronizar el estado visual con la respuesta real del backend (impedir marcas de éxito si el backend falla).
  10. Permitir ejecutar la conversión a matrícula con un solo clic desde solicitudes en estado `Admitida`, navegando directamente al expediente resultante.
  11. Implementar paginación en servidor e indicadores de carga (`renderUIProgressSkeleton`).
  12. Aplicar restricciones ABAC/RBAC para que el personal de nivel sólo acceda a las solicitudes de su departamento asignado.
- **Criterios de Aceptación:**
  - [x] El personal autorizado de Secretaría y Dirección puede consultar y filtrar solicitudes en tiempo real.
  - [x] Los filtros producen resultados coherentes con los registros persistidos en la hoja.
  - [x] El modal de detalle permite revisar todos los componentes del expediente sin cambiar de pantalla.
  - [x] Los botones de acción muestran únicamente transiciones válidas para el estado activo.
  - [x] Una respuesta de error mantiene visible el estado real persistido en el servidor.
  - [x] El rechazo sin justificación obligatoria no se puede confirmar.
  - [x] Un usuario no autorizado no puede consultar ni decidir solicitudes invocando directamente el endpoint.
  - [x] La paginación navega limpiamente sin omitir ni duplicar filas.
  - [x] Se detectan cambios concurrentes realizados por otro usuario antes de sobrescribir una decisión.
- **Estado:** [X] Completada

---

## PRIORIDAD P1: EXPEDIENTES, DOCUMENTOS, EVALUACIÓN Y VINCULACIÓN FAMILIAR

### [X] [TAREA-F5-006] Implementar la gestión documental de aspirantes antes de la matrícula
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-02) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.3, Brecha P1-02)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 4838-4930), `js/student.js`, `js/secretary.js`
- **Dependencias Expuestas:** Hoja `DocumentosEstudiante`, `DriveApp`, `getSecureDocumentStream`
- **Descripción del Alcance:**
  1. Modificar `uploadStudentDocument` y `getStudentDocuments` para aceptar tanto `expedienteId` de estudiante activo como `solicitudId` de aspirante pre-matriculado.
  2. Mantener la asociación del documento con la `solicitudId` durante todo el ciclo de admisión y migrarla al `expedienteId` durante la conversión.
  3. Administrar catálogo de requisitos documentales por año lectivo y grado (Partida de nacimiento, certificados anteriores, fotos, ficha médica, solvencia).
  4. Definir obligatoriedad, fecha límite, formatos permitidos (PDF, JPG, PNG) y límite de tamaño por archivo (máximo 10 MB).
  5. Controlar estados del documento: `Pendiente`, `Recibido`, `En_Revision`, `Aceptado`, `Rechazado`, `Requiere_Sustitucion`.
  6. Permitir a Secretaría revisar archivos, calificar estado e ingresar observaciones públicas para la familia.
  7. Permitir sustituir documentos rechazados conservando el historial de versiones anteriores en Drive.
  8. Validar en el servidor los bytes del archivo y la extensión real del tipo MIME (no confiar en la cabecera del cliente).
  9. Impedir la aceptación de archivos corruptos o de tamaño 0 bytes.
  10. Garantizar que las interrupciones durante la carga no dejen registros huérfanos o inválidos en la base de datos.
  11. Proteger el acceso a los archivos mediante `getSecureDocumentStream` verificando pertenencia o rol administrativo.
  12. Transferir automáticamente los documentos aprobados al expediente final del estudiante cuando se complete la conversión a matrícula.
  13. Impedir descargas no autorizadas bloqueando URLs públicas de Drive sin proxy autenticado.
  14. Mostrar alertas visuales de documentos vencidos o rechazados en los paneles de la familia y de dirección.
- **Criterios de Aceptación:**
  - [x] Un aspirante puede cargar un documento asociado a su `solicitudId` antes de estar matriculado.
  - [x] El documento queda correctamente vinculado a la solicitud de origen.
  - [x] Archivos con formatos no permitidos (.exe, .bat, etc.) o superiores a 10 MB son rechazados en el servidor.
  - [x] Cargas interrumpidas o con error no aparecen como documentos válidos.
  - [x] Un documento rechazado muestra el motivo e instruye la sustitución.
  - [x] La sustitución de un archivo conserva la versión anterior en el historial de Drive.
  - [x] Peticiones no autorizadas con IDs de archivo ajenos son denegadas con error 403.
  - [x] Los requisitos pendientes se despliegan en el portal familiar y en la consola de admisiones.
  - [x] La conversión a matrícula migra los documentos de la solicitud al nuevo expediente sin duplicar archivos en Drive.
  - [x] La presencia de documentos obligatorios pendientes o rechazados bloquea la conversión ordinaria.
  - [x] Las operaciones documentales quedan registradas en la bitácora de auditoría.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-007] Implementar el módulo de entrevistas y evaluaciones de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.5, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/secretary.js`, `dashboard-secretaria.html`
- **Dependencias Expuestas:** Hojas `EntrevistasAdmision`, `EvaluacionesAdmision`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  1. Crear el esquema de base de datos e implementar las hojas `EntrevistasAdmision` y `EvaluacionesAdmision`.
  2. Implementar funciones backend `scheduleAdmissionInterview`, `getAdmissionInterviews`, `recordInterviewOutcome`, `saveAdmissionEvaluation` y `getAdmissionEvaluations`.
  3. Permitir agendar entrevistas individuales o grupales, asignando fecha, hora, evaluador, lugar/enlace de reunión y modalidad (Presencial/Virtual).
  4. Gestionar estados de las citas: `Programada`, `Confirmada`, `Reprogramada`, `Completada`, `Cancelada`, `No_Asistio`.
  5. Detectar solapamientos y conflictos de agenda del evaluador impidiendo citas simultáneas.
  6. Permitir reprogramar o cancelar citas registrando el motivo y notificando a los participantes.
  7. Permitir calificar evaluaciones de ingreso con escala numérica o cualitativa, adjuntando rúbricas de evaluación y dictamen pedagógico.
  8. Diferenciar explícitamente entre cita programada, entrevista realizada y evaluación evaluada con notas.
  9. Restringir el acceso a los evaluadores asignados para que consulten únicamente sus expedientes autorizados.
  10. Consolidar el resumen de notas de examen y observaciones de entrevistas dentro del modal del expediente de admisión.
  11. Definir qué evaluaciones son obligatorias según el grado o nivel académico.
  12. Impedir que una solicitud avance al estado `Admitida` si tiene evaluaciones obligatorias pendientes o reprobadas.
  13. Soporte para registrar excepciones autorizadas de evaluación con firma digital y justificación de Dirección.
  14. Permitir registrar múltiples entrevistas o evaluaciones para un aspirante sin sobrescribir registros anteriores.
- **Criterios de Aceptación:**
  - [x] Se puede agendar una entrevista vinculada a una solicitud existente.
  - [x] Se puede reprogramar una cita conservando la fecha original en la bitácora.
  - [x] El sistema detecta y rechaza solapamientos de horario en la agenda del docente evaluador.
  - [x] Una evaluación programada no aparece como completada hasta registrar la nota.
  - [x] Las notas y observaciones se conservan e integran al expediente de admisión.
  - [x] Evaluadores no autorizados no pueden calificar ni modificar entrevistas ajenas.
  - [x] Múltiples evaluaciones se acumulan cronológicamente sin sobrescribirse.
  - [x] Solicitudes con evaluaciones obligatorias pendientes no pueden cambiar a `Admitida`.
  - [x] Excepciones de evaluación quedan documentadas con el usuario autor y motivo.
  - [x] El historial de auditoría registra quién programó, realizó, evaluó o modificó cada cita.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-008] Implementar listas de espera con orden de prelación y asignación controlada de plazas
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.5 y 5.12, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/secretary.js`, `dashboard-secretaria.html`
- **Dependencias Expuestas:** Hoja `ListaEsperaAdmision`, `OfertaAcademica`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  1. Crear la hoja `ListaEsperaAdmision` e implementar endpoints `addToWaitlist`, `getWaitlist`, `reorderWaitlist` y `offerWaitlistSlot`.
  2. Incorporar solicitudes con estado `En_Espera` a la lista de espera asociando grado, año lectivo, fecha de ingreso, posición y criterios de prelación (ej. hermanos matriculados, hijos de exalumnos, fecha de postulación).
  3. Permitir configurar y calcular el orden de prioridad automáticamente según las reglas de la institución.
  4. Exigir autorización y registro de trazabilidad si Secretaría o Dirección modifica manualmente la posición de un aspirante.
  5. Desplegar la lista de espera con filtros por año lectivo, grado y disponibilidad de plazas vacantes.
  6. Administrar estados de la oferta: `En_Espera`, `Plaza_Ofrecida`, `Oferta_Aceptada`, `Oferta_Rechazada`, `Oferta_Expirada`, `Retirada`.
  7. Permitir fijar un plazo de caducidad (ej. 48 o 72 horas) para responder a una oferta de plaza y automatizar la expiración.
  8. Enviar avisos y notificaciones automáticas al ofrecer una vacante a la familia en el tope de la lista.
  9. Liberar la plaza reservada y ofrecerla al siguiente en la lista si la familia rechaza o la oferta expira.
  10. Bloquear la reserva simultánea de una misma plaza vacante para múltiples postulantes.
  11. Garantizar que la aceptación de la oferta cambie la solicitud a `Admitida` requiriendo formalizar la matrícula.
  12. Mantener la trazabilidad de todos los movimientos de la lista de espera.
- **Criterios de Aceptación:**
  - [x] Una solicitud sólo puede entrar a la lista de espera si está en estado elegible.
  - [x] La posición en la lista se calcula transparentemente según los criterios de prelación definidos.
  - [x] Reordenamientos manuales exigen justificación y quedan registrados en la bitácora.
  - [x] Una plaza liberada se asigna únicamente a un aspirante a la vez.
  - [x] Al rechazar o expirar una oferta, el cupo se libera automáticamente para el siguiente aspirante en la lista.
  - [x] La aceptación de la oferta actualiza el estado de la solicitud a `Admitida`.
  - [x] Solicitudes concurrentes no pueden reservar la misma plaza en la lista de espera.
  - [x] Solicitudes retiradas salen de la lista y no reciben nuevas ofertas de cupo.
  - [x] La familia sólo consulta la posición relativa de su propia solicitud de admisión.
  - [x] Se conserva el historial completo de ofertas, vencimientos y aceptaciones.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-009] Corregir la vinculación familiar y establecer permisos individuales por relación
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-02) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.7, Brecha P0-02)
- **Severidad/Clasificación:** Crítico
- **Archivos Involucrados:** `backend/user-service/Code.gs` (l. 3113-3250), `backend/academic-service/Code.gs` (l. 4698-4820), `js/secretary.js`
- **Dependencias Expuestas:** Hojas `RelacionesFamiliares`, `InvitacionesVinculacion`, `Usuarios`, `validateContextualAccess`
- **Descripción del Alcance:**
  1. Unificar los flujos de vinculación para que toda relación familiar requiera una invitación con token o autorización explícita verificada.
  2. Diferenciar en la base de datos entre responsable declarado (texto de solicitud), relación verificada y cuenta con acceso activo al portal.
  3. Implementar tokens de invitación seguros de un solo uso (`TOK-UUID`) con 7 días de vigencia y revocación remota.
  4. Amarrar la invitación a la `solicitudId` / `expedienteId` y correo específico del tutor, impidiendo reutilización en otros alumnos.
  5. Verificar que el usuario que acepta el token coincida con el email invitado o cuente con autorización.
  6. Detectar vínculos duplicados en `RelacionesFamiliares` previniendo registros redundantes.
  7. Permitir múltiples tutores por estudiante y múltiples estudiantes por tutor en una estructura N:M limpia.
  8. Configurar permisos individuales por tutor (`PermisoAcademico`, `PermisoFinanciero`, `PermisoDocumental`, `PermisoAsistencia`), en lugar de otorgar un rol `Padre` plano y uniforme. Si la institución requiere un modelo simplificado o granular, el modo de permisos familiares se configurará mediante la directiva `GRANULAR_FAMILY_PERMISSIONS_ENABLED`.
  9. Permitir personalizar si un tutor puede ver notas, realizar pagos, solicitar excusas o autorizar salidas.
  10. Diferenciar permisos de lectura de permisos de escritura o transaccionales.
  11. Validar las restricciones de parentesco en el servidor dentro de `validateContextualAccess`.
  12. Soportar revocación inmediata de un vínculo impidiendo el acceso en las subsiguientes peticiones.
  13. Registrar en la bitácora quién creó, verificó, aceptó, modificó o revocó cada vínculo familiar.
  14. Prohibir la creación automática de cuentas de usuario basándose únicamente en cadenas de texto de un formulario.
  15. Integrar el proceso en la conversión a matrícula transfiriendo al tutor declarado a la cola de invitaciones de vinculación.
- **Criterios de Aceptación:**
  - [x] El personal administrativo no puede otorgar acceso al portal sin completar el flujo de verificación.
  - [x] Tokens expirados, revocados o usados previamente son rechazados.
  - [x] Un token no se puede usar para vincular a un estudiante diferente del autorizado en la invitación.
  - [x] Intentos de vinculación duplicados son neutralizados sin crear filas redundantes.
  - [x] Dos tutores del mismo estudiante pueden tener conjuntos de permisos diferenciados (ej. Tutor 1 Financiero, Tutor 2 Académico).
  - [x] La revocación de un vínculo bloquea inmediatamente el acceso del tutor a la información del alumno.
  - [x] Alterar el ID de estudiante en peticiones API es rechazado por el aislamiento de `validateContextualAccess`.
  - [x] La conversión de admisión a matrícula transfiere correctamente al tutor declarado al flujo de invitaciones sin perder sus datos.
  - [x] Registro completo de auditoría para cada cambio de estado en la relación familiar.
  - [x] La autorización efectiva se verifica en el servidor en cada endpoint del portal de familias.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-010] Integrar las plazas, reservas y matrículas en un control de capacidad consistente
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P2-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.12, Brecha P2-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 4938-5015), `js/secretary.js`, `dashboard-secretaria.html`
- **Dependencias Expuestas:** Hojas `OfertaAcademica`, `Matriculas`, `SolicitudesAdmision`, `ListaEsperaAdmision`
- **Descripción del Alcance:**
  1. Definir la capacidad máxima por año lectivo, grado y sección en `OfertaAcademica`.
  2. Actualizar `checkEnrollmentCapacity` para calcular la disponibilidad real restando de la capacidad máxima tanto las `Matriculas` activas como los aspirantes con solicitud `Admitida` (plazas reservadas no vencidas).
  3. Distinguir explícitamente entre solicitud admitida, plaza reservada, oferta aceptada y matrícula confirmada.
  4. Definir reglas y tiempos de caducidad para las reservas de cupo de aspirantes admitidos (ej. 5 días hábiles para pagar la matrícula).
  5. Evitar la doble contabilización cuando una plaza reservada se convierte en matrícula confirmada.
  6. Forzar la verificación de capacidad antes de marcar una solicitud como `Admitida` y antes de ejecutar `convertAdmissionToStudent`.
  7. Proteger el cálculo de capacidad con `LockService` para prevenir condiciones de carrera en matriculaciones simultáneas.
  8. Endpoint de consulta de cupos que desglose: Capacidad Total, Inscritos Confirmados, Plazas Reservadas y Cupos Libres.
  9. Liberar la reserva de cupo cuando una solicitud admitida sea cancelada, rechazada o expire su plazo de pago.
  10. Bloquear reservas de cupo para secciones no abiertas o cerradas en la oferta académica.
  11. Mantener el historial de reservas y liberaciones de cupo en la bitácora de auditoría.
  12. Establecer una política explícita y configurable (`OVERBOOKING_ALLOWED`) para autorizar o prohibir sobrecupos con firma de Dirección.
- **Criterios de Aceptación:**
  - [x] Secciones sin cupos disponibles bloquean el cambio de estado a `Admitida` y la conversión a matrícula.
  - [x] Aspirantes admitidos reducen inmediatamente el número de cupos disponibles.
  - [x] Al convertirse en estudiante matriculado, la plaza reservada se transforma en matrícula activa sin duplicar el descuento de cupo.
  - [x] La cancelación de una matrícula o expiración de una admisión libera el cupo en tiempo real.
  - [x] Peticiones simultáneas sobre el último cupo disponible son procesadas de forma atómica (un solo ganador, el otro a lista de espera).
  - [x] La conversión a matrícula recalcula y valida la disponibilidad real antes de confirmar el registro.
  - [x] Los reportes de capacidad coinciden con la suma de matrículas activas y reservas no vencidas.
  - [x] Cambios de capacidad no modifican decisiones de admisión previamente aprobadas.
  - [x] Excepciones de sobrecupo requieren el parámetro `forceCapacityOverride` con autorización auditada de Dirección.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-011] Implementar notificaciones automáticas y seguimiento del proceso de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-03) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.10, Brecha P1-03)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs` (l. 948, 1298)
- **Dependencias Expuestas:** Endpoint `sendMultiChannelNotification`, Hoja `Notificaciones`, `ColaEventosSeguridad`
- **Descripción del Alcance:**
  1. Conectar las funciones del ciclo de vida de admisión (`createAdmissionRequest`, `updateAdmissionStatus`, `convertAdmissionToStudent`) con el motor `sendMultiChannelNotification`.
  2. Disparar notificaciones automáticas ante los siguientes eventos:
     - Recepción formal de solicitud (incluyendo `solicitudId` de seguimiento).
     - Solicitud de documentos pendientes o sustitución por rechazo.
     - Citación, reprogramación o cancelación de entrevistas/evaluaciones.
     - Cambio de estado en el trámite de admisión.
     - Resolución final (`Admitida` con instrucciones de pago / `Rechazada` / `En_Espera`).
     - Oferta o liberación de plaza en lista de espera.
     - Emisión de invitación de vinculación para el tutor.
     - Confirmación de conversión a matrícula estudiantil.
  3. Crear plantillas HTML y de texto plano personalizables para cada tipo de notificación.
  4. Incluir enlaces directos al portal, números de seguimiento e instrucciones claras sin exponer datos privados de menores.
  5. Enviar las notificaciones a los canales autorizados (Correo electrónico `MailApp`, avisos internos del portal).
  6. Desacoplar la notificación de la transacción principal para que un fallo en el envío de correo no revierta la aprobación de una admisión.
  7. Guardar el estado de cada notificación: `Pendiente`, `Enviado`, `Entregado`, `Fallido`, `Reintentado`.
  8. Integrar con la cola de reintentos asíncronos para reenviar notificaciones fallidas por problemas de red.
  9. Aplicar deduplicación para evitar el envío repetido de correos ante reintentos de peticiones.
  10. Respetar las preferencias de notificación de la familia salvo para avisos institucionales obligatorios.
  11. Garantizar la privacidad enviando correos individuales o ocultando destinatarios en avisos masivos.
  12. Consola de monitoreo para que Secretaría verifique el historial de avisos enviados y reenviar manualmente si es necesario.
- **Criterios de Aceptación:**
  - [x] El registro de una solicitud envía un correo de confirmación con su código de seguimiento.
  - [x] Cambios de estado en la admisión disparan el correo automático correspondiente a la familia.
  - [x] Solicitudes rechazadas no envían por error plantillas de aceptación.
  - [x] Fallos en el servidor de correo activan el reintento en la cola asíncrona sin cancelar la transacción de base de datos.
  - [x] Reintentos de peticiones no duplican los correos enviados a la familia.
  - [x] Se registra el estado de entrega de cada mensaje en `BitacoraTraceability`.
  - [x] Los mensajes son individuales y no revelan direcciones de correo de otros postulantes.
  - [x] Secretaría puede revisar el log de notificaciones enviadas a cada aspirante.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-012] Incorporar seguimiento de aspirantes en el portal familiar
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.9 y 5.14, Brecha P0-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `student-dashboard.html`, `js/student.js` (l. 180-260), `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Endpoints `getGuardianStudents`, `getAdmissionRequests`, `initFamilyStudentSwitcher`
- **Descripción del Alcance:**
  1. Habilitar en el Portal Familiar la consulta de solicitudes de admisión de aspirantes vinculados junto a los estudiantes matriculados.
  2. Extender el selector multiestudiante (`initFamilyStudentSwitcher`) para categorizar entre "🎓 Estudiantes Matriculados" y "📝 Aspirantes en Admisión".
  3. Desplegar panel de seguimiento de admisión con el estado actual del trámite, fecha de recepción y código de seguimiento.
  4. Renderizar línea de tiempo visual con las etapas completadas y pendientes (Solicitud -> Documentos -> Entrevista -> Decisión -> Matrícula).
  5. Mostrar lista de documentos requeridos, resaltando archivos aprobados, pendientes y rechazados con botón para subir la sustitución.
  6. Desplegar citas de entrevistas y pruebas de ingreso agendadas, con fecha, hora, ubicación/enlace e instrucciones.
  7. Mostrar observaciones públicas del equipo de admisiones y solicitudes de información adicional.
  8. Permitir retomar el llenado de solicitudes incompletas o borradores guardados.
  9. Notificar ofertas de plazas vacantes y proporcionar botón para aceptar o rechazar la vacante desde el portal.
  10. Mantener una separación clara entre los expedientes de aspirantes y los expedientes académicos/financieros de alumnos activos.
  11. Aplicar aislamiento IDOR para que los tutores consulten únicamente las solicitudes de sus aspirantes autorizados.
  12. Diferenciar claramente entre "Sin información registrada", "Falta de permisos" y "Error de carga del servidor".
  13. Evitar atribuir cobros de admisión como deudas de matrícula de estudiantes activos.
- **Criterios de Aceptación:**
  - [x] Un tutor autenticado puede conmutar entre sus hijos matriculados y sus hijos postulantes desde el portal.
  - [x] Intento de consultar solicitudes de aspirantes ajenos modificando IDs es bloqueado en el backend.
  - [x] Las solicitudes de admisión se distinguen visualmente con etiquetas y colores de las matrículas activas.
  - [x] El panel muestra el estado real de los documentos, citas y decisiones de admisión.
  - [x] Cambios realizados por admisiones se reflejan inmediatamente al actualizar el portal familiar.
  - [x] Los errores de servidor muestran alertas descriptivas sin presentar datos vacíos como inexistentes.
  - [x] La interfaz guía a la familia sobre los pasos exactos para completar la admisión.
  - [x] Al convertirse en estudiante, el aspirante pasa automáticamente a la sección de estudiantes matriculados.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-013] Integrar los cobros de admisión, los pagos y las becas con el expediente del aspirante
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.13, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs` (l. 3330-3420), `js/student.js`
- **Dependencias Expuestas:** Hojas `CargosEstudiante`, `ComprobantesPago`, `SolicitudesDescuentoBeca`
- **Descripción del Alcance:**
  1. Configurar conceptos financieros específicos para admisiones en `ConfiguracionFinanciera`: "Derecho de Admisión", "Examen de Ingreso", "Reserva de Plaza".
  2. Permitir definir montos, fechas de vencimiento, exenciones y reglas de cobro por nivel académico.
  3. Vincular los cargos de admisión a la `solicitudId` del aspirante antes de la asignación de un `userId` de estudiante.
  4. Diferenciar en la contabilidad los ingresos por trámites de admisión de las colegiaturas y matrículas ordinarias.
  5. Permitir consultar el estado financiero de la admisión: `Pendiente`, `Pagado`, `En_Revision`, `Exento`, `Anulado`.
  6. Reutilizar el módulo de carga de comprobantes de pago (`submitJointFamilyPayment`) permitiendo adjuntar transferencias para cobros de admisión.
  7. Permitir la revisión y validación de comprobantes por el departamento de Contabilidad. La carga del recibo no constituye confirmación de pago automática.
  8. Prevenir cargos duplicados mediante claves de idempotencia en la generación de cobros.
  9. Registro contable auditado de todas las transacciones financieras de admisión.
  10. Permitir otorgar becas de admisión o exenciones de pago con aprobación registrada de Dirección.
  11. Habilitar la postulación a becas familiares (`submitFamilyScholarshipApplication`) durante el proceso de admisión.
  12. Transferir el historial de pagos de admisión al expediente contable definitivo del estudiante tras la conversión a matrícula.
  13. Desglosar claramente los cobros por aspirante en el resumen consolidado de la familia.
  14. Bloquear la confirmación de la admisión si existen cargos obligatorios de admisión en estado pendiente o rechazado.
- **Criterios de Aceptación:**
  - [x] Cargos de admisión se generan automáticamente asociados a la `solicitudId`.
  - [x] No se duplican cargos al consultar o reintentar peticiones.
  - [x] Comprobantes de pago subidos quedan en estado `En_Revision` hasta la aprobación contable.
  - [x] La aprobación del pago actualiza el saldo del aspirante y habilita la siguiente fase del trámite.
  - [x] Exenciones financieras requieren autorización auditada y motivo justificado.
  - [x] La conversión a matrícula migra el historial de pagos de admisión sin duplicar cobros.
  - [x] El resumen familiar distingue los cobros de admisión de los cargos de estudiantes matriculados.
  - [x] Operaciones financieras fallidas devuelven errores claros sin marcar los cargos como pagados.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-014] Completar la trazabilidad de admisiones y las notificaciones de auditoría
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.15, Brecha P1-01)
- **Severidad/Clasificación:** Alto
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 743, 795), `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Hojas `BitacoraEventos`, `BitacoraTraceability`, `HistorialCambiosEntidad`, `logStructuredEvent`
- **Descripción del Alcance:**
  1. Registrar todas las operaciones críticas de admisión en `logStructuredEvent`, `BitacoraTraceability` y `HistorialCambiosEntidad`.
  2. Persistir en la auditoría: ID de solicitud, tipo de acción, usuario o actor, fecha/hora exacta, IP/sesión, valores anteriores, valores nuevos, motivo y resultado.
  3. Registrar el diff sanitizado de cambios de estado, modificaciones de datos de aspirantes y sustituciones de documentos en `HistorialCambiosEntidad`.
  4. Proteger la bitácora frente a modificaciones o eliminaciones directas (registros inalterables y de solo lectura).
  5. Diferenciar eventos de negocio (`ADMISSION_CREATED`, `STATUS_CHANGED`, `CONVERTED_TO_STUDENT`) de logs de error o depuración técnica.
  6. Registrar de forma diferenciada las peticiones fallidas y las excepciones producidas durante el proceso de admisión.
  7. Registrar los accesos y descargas de documentos de menores para cumplimiento de leyes de privacidad.
  8. Sanitizar automáticamente contraseñas, tokens, DNI sensibles y secrets mediante `sanitizeValueForAudit` antes de guardar en la bitácora.
  9. Aplicar seudonimización o enmascaramiento de datos personales en los logs exportables.
  10. Habilitar la consulta paginada del historial de auditoría de un aspirante desde la consola de administración.
  11. Facilitar la reconstrucción cronológica completa de una conversión o de una operación que haya fallado parcialmente.
  12. Vincular los identificadores de trazabilidad (`correlationId`) entre el servicio académico, de usuarios y contable.
- **Criterios de Aceptación:**
  - [x] Toda actualización de estado o conversión de admisión genera su registro de diff en `HistorialCambiosEntidad`.
  - [x] Intentos de modificación no autorizados en la bitácora son bloqueados.
  - [x] Los logs sanitizan contraseñas, tokens e información altamente confidencial.
  - [x] Operaciones fallidas quedan marcadas con nivel `ERROR` o `WARN` con el detalle de la excepción.
  - [x] Se puede reconstruir la línea de tiempo completa de una solicitud desde su recepción hasta la matrícula.
  - [x] Descargas de documentos de menores quedan registradas con el usuario y la fecha.
  - [x] El `correlationId` permite rastrear una transacción a través de los 5 microservicios backend.
- **Estado:** [X] Completada

---

## PRIORIDAD P2: CONTINUIDAD DEL TRÁMITE, EXPERIENCIA DE USUARIO Y CALIDAD DE LA INFORMACIÓN

### [X] [TAREA-F5-015] Implementar guardado automático de borradores y recuperación de solicitudes
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P2-02) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.2, Brecha P2-02)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/student.js`, `admision.html`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Hoja `BorradoresAdmision`, `localStorage`, `setupUnsavedChangesProtection`
- **Descripción del Alcance:**
  1. Implementar la función de guardado de borradores parciales de admisión (`saveAdmissionDraft`, `getAdmissionDraft`).
  2. Activar el guardado automático en segundo plano con técnica de *debounce* (cada 5 segundos tras modificar campos) y la opción de guardado manual.
  3. Guardar el estado del borrador de forma híbrida: copia local inmediata en `localStorage` y sincronización con la hoja `BorradoresAdmision` si el usuario está autenticado.
  4. Recuperar y rellenar automáticamente los datos guardados al abrir nuevamente el formulario tras una desconexión o recarga.
  5. Indicar visualmente la fecha y hora del último borrador guardado y el estado de sincronización ("Borrador guardado localmente / en la nube").
  6. Permitir guardar borradores con campos obligatorios incompletos (validaciones estrictas aplican únicamente al envío formal final).
  7. Reintentar silenciosamente las sincronizaciones de borradores fallidas por problemas de red.
  8. Convertir el borrador en solicitud formal al presionar "Enviar Solicitud", eliminando o marcando como consumido el borrador.
  9. Proteger los borradores guardados en `localStorage` evitando la exposición de datos personales en computadoras públicas.
  10. Resolver conflictos de versión si el mismo borrador se edita desde múltiples dispositivos.
- **Criterios de Aceptación:**
  - [x] Un usuario puede cerrar la página a mitad del formulario y recuperar los datos al reingresar.
  - [x] Se permite guardar un borrador sin haber completado todos los campos obligatorios.
  - [x] El estado del borrador muestra claramente la fecha y hora de la última actualización.
  - [x] Al confirmar el envío formal, el borrador se convierte en solicitud y se purga del almacenamiento temporal.
  - [x] Errores de conexión no borran la copia local del borrador.
  - [x] Múltiples reintentos de guardado no generan borradores duplicados en la base de datos.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-016] Mejorar la experiencia de uso, accesibilidad y adaptación móvil del proceso de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P3-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.14, Brecha P3-01)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `admision.html`, `js/ui-common.js`, `css/`
- **Dependencias Expuestas:** `auditAndFixAccessibility`, `setupUnsavedChangesProtection`, WCAG 2.2 AA
- **Descripción del Alcance:**
  1. Estructurar el formulario de admisión en un *Stepper* guiado por pasos:
     - Paso 1: Datos del Aspirante
     - Paso 2: Datos de la Familia / Tutor
     - Paso 3: Selección Académica
     - Paso 4: Requisitos Documentales
     - Paso 5: Revisión General y Consentimiento
     - Paso 6: Confirmación y Comprobante
  2. Mostrar una barra de progreso elástica y clara que indique la fase actual y los pasos completados.
  3. Permitir la navegación libre hacia pasos anteriores sin perder la información reresada.
  4. Resaltar visualmente los pasos con campos incompletos o errores de validación.
  5. Desplegar una vista de resumen de verificación antes de la confirmación final.
  6. Presentar mensajes de error claros e interactivos junto a cada control afectado con foco automático.
  7. Deshabilitar los botones de envío durante la transmisión e incluir spinners de carga para prevenir el doble clic.
  8. Garantizar un diseño 100% responsivo para pantallas móviles, tabletas y computadoras de escritorio.
  9. Garantizar el cumplimiento estricto de accesibilidad WCAG 2.2 AA (navegación completa por teclado `Tab`, contraste alto, etiquetas ARIA, restauración de foco).
  10. Ejecutar `auditAndFixAccessibility()` automáticamente al renderizar las vistas de admisión.
  11. Asegurar la compatibilidad con lectores de pantalla para ciegos o personas con visión reducida.
- **Criterios de Aceptación:**
  - [x] El stepper de admisión permite navegar entre las secciones del formulario de manera fluida.
  - [x] Los datos ingresados se conservan intactos al retroceder a pasos anteriores.
  - [x] Botones de envío muestran estados de carga e impiden envíos repetidos por doble clic.
  - [x] La interfaz se adapta correctamente a dispositivos móviles de pantallas reducidas (320px en adelante).
  - [x] Todos los formularios son navegables con teclado y compatibles con lectores de pantalla.
  - [x] La auditoría en tiempo real de `auditAndFixAccessibility()` no reporta faltas de contraste o atributos ARIA ausentes.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-017] Mejorar la gestión de duplicados, validación y calidad de los datos de aspirantes
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P0-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.1 y 5.6, Brecha P0-01)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `backend/academic-service/Code.gs` (l. 714, 4615-4650), `js/student.js`
- **Dependencias Expuestas:** Endpoint `findDuplicateStudents`, `normalizeString`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  1. Implementar reglas estrictas de validación de formato en el servidor para DNI, pasaportes, números telefónicos, correos y fechas de nacimiento.
  2. Implementar la normalización diacrítica de texto (`normalizeString`) eliminando tildes, caracteres especiales y espacios redundantes antes de comparar.
  3. Extender `findDuplicateStudents` para comparar solicitudes de admisión activas contra expedientes existentes y otras solicitudes recibidas.
  4. Algoritmo de detección que clasifique:
     - Coincidencia Exacta (Mismo DNI / Identificación Nacional) -> Bloqueo preventivo de solicitud duplicada.
     - Coincidencia Alta (Mismos Nombres, Apellidos y Fecha de Nacimiento) -> Alerta de revisión para Secretaría.
     - Coincidencia Media (Mismo Email y Teléfono con Nombres Similares) -> Advertencia de posible duplicado.
  5. Prohibir la fusión o vinculación automática de registros sin la verificación manual de Secretaría.
  6. Proteger la privacidad evitando que los mensajes de alerta de duplicidad expongan datos personales de los expedientes existentes a usuarios no autorizados.
  7. Panel de resolución de duplicados para que Secretaría apruebe la creación de un nuevo expediente o vincule a una persona existente.
  8. Registrar la decisión de resolución de duplicados en la bitácora de auditoría.
  9. Validar que la corrección de datos en una solicitud conserve la trazabilidad original.
- **Criterios de Aceptación:**
  - [x] Intentos de registrar un aspirante con un DNI ya existente en `SolicitudesAdmision` o `ExpedientesEstudiantes` son detectados e informados.
  - [x] No se realizan fusiones automáticas de personas basadas únicamente en coincidencias de nombres.
  - [x] La consola de administración despliega alertas de duplicidad para la revisión de Secretaría.
  - [x] Los mensajes de validación no revelan información confidencial de terceros.
  - [x] La resolución de duplicados queda documentada con el usuario, fecha y decisión en la bitácora.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-018] Completar la experiencia multiestudiante y el resumen familiar consolidado
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P1-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.9, Brecha P1-01)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/student.js` (l. 182-350), `backend/user-service/Code.gs` (l. 3261-3320)
- **Dependencias Expuestas:** `getGuardianStudents`, `getFamilyConsolidatedSummary`, `consolidateStudentDashboardSummary`
- **Descripción del Alcance:**
  1. Optimizar el selector multiestudiante (`initFamilyStudentSwitcher`) y el resumen consolidado (`getFamilyConsolidatedSummary`).
  2. Garantizar una estricta separación de contexto al conmutar entre estudiantes vinculados, refrescando completamente calificaciones, tareas, asistencias, avisos y saldos contables.
  3. En la vista consolidada familiar, distinguir explícitamente entre:
     - Saldo confirmado L 0.00 (Solvente).
     - Información pendiente o no cargada por el docente.
     - Fallo de conexión o respuesta del servidor.
     - Falta de permisos de consulta para el tutor.
  4. Garantizar que el cálculo de saldos consolidados sume correctamente los cargos pendientes de todos los hijos autorizados sin duplicar pagos en revisión.
  5. Mantener desglosados los cobros de admisión de los cargos de colegiatura y matrícula.
  6. Aplicar la matriz de permisos individuales por relación (Tutor Académico vs Tutor Financiero).
  7. Permitir la realización de pagos conjuntos multihijo (`submitJointFamilyPayment`) desglosando los montos aplicados a cada estudiante con comprobante único.
  8. Asegurar que un error de red en la consulta de un estudiante no altere ni ponga a cero los datos de los demás hijos.
  9. Si se revoca la relación familiar de un estudiante, removerlo inmediatamente del selector y de los totales consolidados.
- **Criterios de Aceptación:**
  - [x] Al seleccionar otro estudiante, todo el panel refresca su información académica y contable sin mezclar datos del estudiante anterior.
  - [x] Un saldo de L 0.00 se diferencia visualmente de un error de carga del servidor.
  - [x] El pago conjunto multihijo registra la transacción contable desglosando los abonos para cada estudiante.
  - [x] Tutores sin permisos financieros no pueden ver ni operar los saldos consolidados de la familia.
  - [x] La revocación de un vínculo actualiza en tiempo real el selector multiestudiante.
- **Estado:** [X] Completada

---

## PRIORIDAD P3: OPTIMIZACIÓN OPERATIVA Y MEJORA CONTINUA

### [X] [TAREA-F5-019] Implementar herramientas de seguimiento operativo y análisis de admisiones
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P3-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.15, Brecha P3-01)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `dashboard-direccion.html`, `js/teacher.js`, `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** Endpoints `getAdmissionRequests`, `getSecurityAndComplianceDashboardData`
- **Descripción del Alcance:**
  1. Crear un panel de indicadores métricos y analítica de admisiones en `dashboard-direccion.html`.
  2. Calcular métricas clave en tiempo real:
     - Total de Solicitudes Recibidas, En Revisión, Evaluadas, Admitidas, Rechazadas, En Espera y Convertidas.
     - Tasa de Conversión (% de admitidos que completan la matrícula).
     - Tiempo Promedio de Tramitación (Días entre recepción de solicitud y decisión final).
     - Embudo de Conversión por Grado y Nivel Académico.
  3. Desplegar filtros por año lectivo, periodo, nivel y departamento.
  4. Identificar embotellamientos operativos (solicitudes estancadas por falta de documentos o citas de evaluación).
  5. Analizar los motivos principales de rechazo o de abandono de solicitudes de admisión.
  6. Exportación de reportes analíticos en formato CSV/PDF para reuniones de junta directiva.
  7. Garantizar que las consultas analíticas se ejecuten sin alterar los estados o datos de los expedientes.
- **Criterios de Aceptación:**
  - [x] El cuadro de mando despliega métricas exactas calculadas desde los registros reales de `SolicitudesAdmision`.
  - [x] Los indicadores permiten filtrar dinámicamente por año lectivo y grado.
  - [x] Se calculan con precisión los tiempos promedios de atención y las tasas de conversión.
  - [x] La exportación de datos genera reportes sanitizados sin exponer contraseñas ni secrets.
  - [x] La generación de reportes no degrada el rendimiento de las operaciones ordinarias.
- **Estado:** [X] Completada

---

### [X] [TAREA-F5-020] Optimizar las consultas, la sincronización y la capacidad de respuesta del proceso de admisión
- **Origen del Hallazgo:** `Auditoria.txt` (HALLAZGOS F5: HALLAZGOS-F5-P3-01) / `AUDITORIA_FASE_5_ADMISIONES_PORTAL_FAMILIAS.md` (Subcapacidad 5.15, Brecha P3-01)
- **Severidad/Clasificación:** Bajo
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/api.js`
- **Dependencias Expuestas:** `CacheService`, `manageInstitutionalDataCache`, `fetchApi`
- **Descripción del Alcance:**
  1. Optimizar los llamados y lecturas a Hojas de Cálculo Google Apps Script en los endpoints de admisiones y portal familiar.
  2. Aplicar caché selectiva en `CacheService` para catálogos estáticos (grados, requisitos documentales, ofertas académicas) con tiempo de vida de 10 minutos.
  3. Implementar paginación en servidor (`page`, `pageSize`) en `getAdmissionRequests` evitando traer miles de filas en una sola petición.
  4. Invalidar la caché de forma inmediata ante cambios de estado de admisiones, asignaciones de cupos o revocación de vínculos familiares (`purgeSecurityCaches`).
  5. Optimizar las llamadas paralelas en el cliente usando `Promise.all` en el portal familiar.
  6. Definir límites de tamaño de peticiones y control de velocidad (*rate limiting*) para prevenir abuso de endpoints públicos.
  7. Monitorear tiempos de ejecución y registrar advertencias si un endpoint de admisión supera los 2000 ms.
- **Criterios de Aceptación:**
  - [x] Las listas de solicitudes cargan mediante paginación en servidor sin retrasos visuales.
  - [x] Catálogos estáticos se recuperan desde la caché reduciendo lecturas a las hojas de cálculo.
  - [x] La invalidación de caché funciona en tiempo real al actualizar un registro de admisión.
  - [x] Las consultas del portal familiar responden en menos de 1.5 segundos en condiciones normales.
  - [x] Pruebas de estrés verifican que la optimización no corrompe la integridad de los datos.
- **Estado:** [X] Completada

---
*Plan Maestro de Tareas Pendientes registrado y unificado por Jules conforme a los requerimientos oficiales de la Plataforma Integral de Gestión Educativa.*

================================================================================
# TAREAS MIGRADAS DESDE PENDIENTES.MD (FASE 6 Y FASE 7)
================================================================================

# REGISTRO DUAL Y PENDIENTES DE IMPLEMENTACIÓN
===============================================================================
FASE 6. EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE
===============================================================================

### [X] [TAREA-F6-001] Restringir los controles de gestión de expedientes duplicados según los permisos efectivos del usuario
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 1 (P2 · Seguridad Operativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Seguridad operativa e interfaz)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `js/teacher.js`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `ROLE_PERMISSIONS`, `validateRolePermission`, `getStudentFile`, `findDuplicateStudents`, `mergeStudentFiles`
- **Descripción del Alcance:**
  El panel docente contiene la pestaña `#tab-stfile-duplicates` relacionada con la gestión de expedientes duplicados, aunque la resolución y fusión corresponde al personal administrativo autorizado. La mejora evita que el usuario encuentre opciones que no puede utilizar, preservando el acceso a las demás funciones autorizadas del expediente.

  Requisitos Funcionales:
  1. Identificar los permisos efectivos del usuario autenticado antes de construir o mostrar los controles de gestión de duplicados.
  2. Ocultar o deshabilitar la pestaña, los botones y las acciones de resolución o fusión para el rol `Profesor`.
  3. Mostrar dichos controles únicamente a los usuarios que dispongan de los permisos administrativos correspondientes.
  4. Reutilizar la matriz de permisos existente (`ROLE_PERMISSIONS` / `RoleCapabilities`). No crear reglas independientes que puedan divergir.
  5. Aplicar la restricción a todas las acciones relacionadas, incluidas las que se encuentren en menús contextuales, cuadros de diálogo y controles secundarios.
  6. Mantener la validación de autorización en el servidor. Ocultar elementos visuales no sustituye los controles del backend.
  7. No alterar la búsqueda general de estudiantes ni la edición de datos personales, gestión documental o consulta histórica autorizada.
  8. Actualizar correctamente la interfaz cuando cambie la sesión, el usuario autenticado o su contexto de permisos. Si el rol no puede determinarse o la sesión no es válida, no mostrar acciones administrativas.
- **Criterios de Aceptación:**
  - CA-001: Un usuario exclusivamente docente no visualiza la pestaña de duplicados ni sus acciones administrativas.
  - CA-002: Un usuario autorizado visualiza los controles correspondientes y puede utilizarlos según sus permisos.
  - CA-003: Una llamada directa al servicio por parte de un usuario no autorizado continúa siendo rechazada por el backend.
  - CA-004: Al cerrar sesión o cambiar de usuario, la interfaz no conserva controles correspondientes a la sesión anterior.
  - CA-005: La ocultación de los controles no afecta las demás pestañas ni las operaciones autorizadas del expediente.
  - CA-006: La interfaz mantiene su funcionamiento en dispositivos móviles y de escritorio.
  - CA-007: Las pruebas de regresión confirman que la gestión de duplicados continúa funcionando para los usuarios autorizados.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-002] Robustecer las operaciones del ciclo de vida y prevenir estados de matrícula incompatibles
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 6 (P1 · Integridad Institucional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Integridad institucional y transiciones del ciclo de vida)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `changeStudentSection`, `recordStudentTransfer`, `recordStudentWithdrawal`, `processStudentReentry`, `renewStudentEnrollment`, `Matriculas`, `ExpedientesEstudiantes`, `LockService`
- **Descripción del Alcance:**
  Consolidar las reglas de transición de estado institucional del estudiante para evitar inconsistencias entre los registros cuando ocurren operaciones concurrentes o interrumpidas durante todo su ciclo de vida (matrícula, cambios de sección/grado, traslados, retiros, reincorporaciones, promociones y graduaciones).

  Requisitos Funcionales:
  1. Definir las transiciones permitidas entre los estados institucionales del estudiante, diferenciando su condición general de la situación de cada matrícula.
  2. Validar que un estudiante no tenga dos matrículas activas incompatibles para el mismo periodo, conforme a las reglas institucionales.
  3. Antes de procesar un movimiento, comprobar que: el expediente existe y no está fusionado, el periodo escolar de destino es válido, la matrícula de origen corresponde al estudiante, el movimiento es compatible con el estado actual y se cumplen las condiciones académicas y administrativas aplicables.
  4. En cambios de grado, sección, jornada o programa, conservar la matrícula anterior y registrar la nueva situación con su fecha efectiva y motivo.
  5. En traslados, registrar institución de destino, fecha de salida, motivo y estado del trámite (diferenciando solicitado de completado).
  6. En retiros, distinguir entre retiro temporal y definitivo sin eliminar antecedentes.
  7. En reincorporaciones, reutilizar la identidad institucional existente y crear el registro de matrícula para el nuevo periodo.
  8. En promociones y repitencias, utilizar resultados académicos del periodo cerrado y registrar la decisión administrativa cuando corresponda.
  9. En graduaciones, verificar los requisitos configurados, registrar la fecha y el programa finalizado y evitar matrículas activas incompatibles posteriores.
  10. Hacer que cada operación crítica sea idempotente y resistente a solicitudes concurrentes mediante script locks (`LockService`).
  11. Disponer de un mecanismo de recuperación o conciliación ante fallos parciales entre hojas o microservicios.
  12. Registrar las operaciones retroactivas con su fecha efectiva y la fecha real de registro, sin alterar silenciosamente el historial.
- **Criterios de Aceptación:**
  - CA-008: Una segunda solicitud idéntica de reincorporación no crea otra matrícula.
  - CA-009: Dos solicitudes concurrentes que intentan ocupar la misma plaza no exceden la capacidad configurada.
  - CA-010: Una transición no permitida es rechazada sin modificar parcialmente el expediente.
  - CA-011: Un traslado incompleto queda identificado como pendiente de resolución, sin presentar al estudiante como correctamente transferido.
  - CA-012: La promoción o repitencia no modifica las calificaciones históricas.
  - CA-013: Una graduación correctamente registrada conserva el acceso autorizado al expediente histórico.
  - CA-014: Las operaciones retroactivas pueden distinguirse de las realizadas en tiempo real.
  - CA-015: Los registros relacionados mantienen una situación coherente después de un fallo simulado y su recuperación.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-003] Establecer una batería automatizada de regresión para el ciclo de vida del estudiante
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 15 (P1 · Fiabilidad Funcional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Fiabilidad y pruebas automatizadas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - Suite de Pruebas / Script de verificación
- **Dependencias Expuestas:** `runConcurrencyAndConsistencySuite`, `validateApiContractsTestSuite`, `runCurricularAreaServiceTests`, `getStudentFile`, `mergeStudentFiles`
- **Descripción del Alcance:**
  Crear una suite automatizada e integral de pruebas de regresión que permita verificar periódicamente los flujos del ciclo de vida del estudiante y prevenir fallos ante futuros cambios en el código.

  Requisitos Funcionales:
  1. Crear pruebas repetibles para los flujos principales: creación de expediente, detección y fusión de duplicados, asociación/revocación de responsables, carga/sustitución/recuperación de documentos, matrícula inicial y renovación, cambios de sección y grado, traslado/retiro/reincorporación, promoción/repitencia/graduación, antecedentes históricos, integraciones, permisos y respaldos.
  2. Incluir casos positivos, entradas inválidas, operaciones concurrentes, fallos de servicios dependientes y reintentos.
  3. Verificar tanto los resultados visibles como los cambios persistidos en las hojas de cálculo y Drive.
  4. Comprobar que los roles no autorizados no puedan ejecutar acciones mediante llamadas directas al backend.
  5. Asegurar que las pruebas utilicen datos sintéticos y aislados sin afectar información de producción.
  6. Comprobar que los cambios de un año lectivo no modifiquen las calificaciones ni las matrículas de años anteriores.
  7. Generar un informe de ejecución que distinga claramente entre pruebas aprobadas, fallidas y no ejecutadas.
- **Criterios de Aceptación:**
  - CA-016: Cada flujo crítico dispone de pruebas reproducibles para su comportamiento esperado y sus casos de error.
  - CA-017: Las pruebas detectan la creación duplicada de matrículas ante reintentos concurrentes.
  - CA-018: Las pruebas detectan accesos no autorizados a expedientes y documentos.
  - CA-019: Las pruebas detectan alteraciones indebidas del historial académico.
  - CA-020: Los fallos de integración no se interpretan como operaciones exitosas.
  - CA-021: Las pruebas pueden ejecutarse sin modificar expedientes reales.
  - CA-022: Los resultados permiten identificar el caso fallido, la condición de entrada y el resultado observado.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-004] Reestructurar la arquitectura en microservicios independientes
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-007 (P1 · Reestructuración Arquitectónica)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Arquitectura y escalabilidad de microservicios)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - `js/api.js`
  - `js/auth.js`
  - Dashboards y registros centrales
- **Dependencias Expuestas:** Registro central de servicios, capas de comunicación `fetchApi`, autenticación y configuración
- **Descripción del Alcance:**
  Distribuir las responsabilidades del sistema entre microservicios independientes, reduciendo el acoplamiento entre áreas y permitiendo mantener, desplegar, supervisar y ampliar cada servicio sin reconstruir innecesariamente los demás.

  Requisitos Funcionales:
  1. Establecer arquitectura en la que cada microservicio disponga de proyecto Apps Script propio, ID inmutable, endpoint registrado, Spreadsheet/Drive organizados, diagnóstico y versión identificable.
  2. Separar funciones por responsabilidades funcionales conservando todas las relaciones institucionales.
  3. Centralizar el consumo de APIs desde dashboards mediante `js/api.js`.
  4. Centralizar el descubrimiento de servicios en un registro de configuración con endpoints, versiones, recursos y permisos.
  5. Separar código fuente de configuraciones (URLs, IDs de Spreadsheet/Drive configurables sin cambiar código).
  6. Definir contratos de entrada/salida para cada operación con parámetros, respuestas, errores y permisos.
  7. Mantener compatibilidad absoluta con funciones existentes sin desconectar llamadas ni endpoints.
  8. El microservicio del desarrollador administra el registro y plano de control sin actuar como intermediario obligatorio de todas las llamadas.
  9. Garantizar tolerancia a fallos: operaciones independientes deben seguir funcionando ante indisponibilidad temporal de otros servicios.
  10. Definir una única fuente de verdad por entidad compartida para evitar duplicidades.
  11. Auditar funciones, variables, llamadas y contratos antes y después de cada migración.
- **Criterios de Aceptación:**
  - CA-023: Cada microservicio tiene un identificador único, configuración independiente y despliegue identificable.
  - CA-024: Cada servicio dispone del almacenamiento correspondiente, respetando las excepciones autorizadas.
  - CA-025: Los dashboards consumen las funciones mediante una capa de comunicación común (`js/api.js`).
  - CA-026: Un servicio puede actualizarse sin modificar los demás cuando sus contratos de comunicación no cambian.
  - CA-027: La caída de un servicio no bloquea automáticamente las funciones independientes.
  - CA-028: Las funciones migradas producen resultados equivalentes y conservan sus controles de acceso.
  - CA-029: El registro central identifica qué servicio atiende cada función y dónde está desplegado.
  - CA-030: No quedan funciones existentes desconectadas, referencias obsoletas ni llamadas a endpoints inexistentes.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-005] Crear los microservicios administrativos y financieros con separación por responsabilidades
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-008 (P1 · Reestructuración de Servicios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Microservicios administrativos y financieros)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
  - Estructura de carpetas en Google Drive (`Administracion_Financiera/`)
- **Dependencias Expuestas:** `getStudentFile`, `registerStudentEnrollment`, `createAdmissionCharge`, `processPaymentReceipt`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  Dividir y estructurar formalmente las responsabilidades entre el microservicio compartido de Dirección y Secretaría y el microservicio financiero-administrativo (Contabilidad, Cobros, Facturación, Recibos, Inventarios, Recursos Humanos, Planillas).

  Requisitos Funcionales:
  1. Dirección y Secretaría comparten microservicio y Spreadsheet cuando corresponda, pero con carpetas de Drive separadas y permisos estrictos por rol.
  2. Crear el microservicio financiero-administrativo con módulos internos independientes (Contabilidad, Cobros, Facturación, Recibos, Cuentas por Pagar, Inventarios, Bancos, RRHH, Planillas, Contratos, Evaluaciones).
  3. Permitir vinculación legítima entre transacciones (cobro -> factura -> recibo) sin duplicar datos de forma inconsistente.
  4. Mantener la estructura jerárquica de Drive (`Administracion_Financiera/Contabilidad/...` y `Administracion_Financiera/Recursos_Humanos/...`) generada de forma automática.
  5. Permitir que un usuario con múltiples roles (ej. Docente + Contador + Encargado Cafetería) ejecute operaciones autorizadas desde una sola cuenta de usuario.
  6. Permitir que personal de Secretaría realice cobros autorizados y emita facturas en ventanilla sin crear segundas cuentas.
  7. Auditar el contexto de autorización de cada transacción.
  8. Permitir incorporar nuevas subáreas mediante configuración sin reconstruir el microservicio.
- **Criterios de Aceptación:**
  - CA-031: Dirección y Secretaría operan mediante microservicio compartido con permisos y carpetas diferenciados.
  - CA-032: Los módulos financieros y de RRHH funcionan con separación interna de responsabilidades y carpetas aisladas.
  - CA-033: La estructura de carpetas en Drive se inicializa automáticamente sin duplicar carpetas existentes.
  - CA-034: Facturas, cobros y recibos mantienen referencias consistentes en todo momento.
  - CA-035: Un usuario con múltiples roles ejecuta operaciones en distintas áreas sin ampliar permisos indebidamente en otras.
  - CA-036: La indisponibilidad de un módulo no bloquea las operaciones independientes de los demás.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-006] Crear una plantilla de microservicio académico reutilizable para múltiples áreas
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-009 (P1 · Modularización y Reutilización)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Plantilla genérica de servicio académico y coordinaciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/task-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - Dashboards y configuraciones académicas
- **Dependencias Expuestas:** `getAcademicOffers`, `getTeacherAssignments`, `getAllTasks`, `getAllExams`, `saveQuestion`
- **Descripción del Alcance:**
  Implementar una plantilla genérica y reutilizable para microservicios académicos que permita desplegar áreas independientes (Comunicaciones, Inglés, Ciencias Sociales, Ciencias, Matemáticas, Informática, Contaduría y Finanzas) utilizando configuración parametrizada sin harcodeos en el código.

  Requisitos Funcionales:
  1. Desarrollar plantilla académica desacoplada que gestione: grados, secciones, asignaturas, asignaciones docentes, tareas, exámenes, entregas, calificaciones y retroalimentación.
  2. Configurar las 7 áreas académicas iniciales mediante registros de base de datos / parámetros JSON sin condicionales de nombres fijos (`if`/`switch`) en la lógica.
  3. Implementar modelo de relaciones por IDs inmutables (Grado -> Sección -> Asignatura -> Docente/Periodo -> Tarea/Examen -> Entrega).
  4. Garantizar que los cambios de docente, sección o año no alteren retroactivamente las calificaciones históricas.
  5. Soporte para coordinaciones académicas configurables (ámbito de supervisión por área, asignatura, grado o sección sin otorgar permisos administrativos generales).
  6. Permitir que cada instancia tenga su propio proyecto Apps Script, Spreadsheet, almacenamiento Drive y configuración aislada.
- **Criterios de Aceptación:**
  - CA-037: La plantilla no contiene nombres fijos de áreas, asignaturas, docentes o secciones en la lógica de negocio.
  - CA-038: Se pueden crear áreas, asignaturas, grados, secciones y coordinaciones desde configuración sin editar código.
  - CA-039: Cada instancia gestiona sus tareas, exámenes y entregas con aislamiento total de datos.
  - CA-040: Los estudiantes solo consultan sus asignaturas matriculadas y los docentes solo sus grupos autorizados.
  - CA-041: Un coordinador supervisa sus asignaturas asignadas sin obtener privilegios en áreas ajenas ni duplicar cuenta.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-007] Implementar el despliegue configurable de nuevos microservicios académicos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-010 (P1 · Automatización de Despliegues)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Despliegue e inicialización de instancias académicas)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - Dashboard del Desarrollador
  - Registro de Servicios Central
- **Dependencias Expuestas:** `prepareNewAcademicYear`, `getAcademicOffers`, `createAcademicOffer`, Registro de Servicios
- **Descripción del Alcance:**
  Crear la interfaz y automatización en el dashboard del desarrollador para registrar, inicializar, validar y desplegar nuevas instancias de microservicios académicos de forma idempotente.

  Requisitos Funcionales:
  1. Formulario de registro de instancia en dashboard del desarrollador (ID, área, plantilla, Apps Script ID, Spreadsheet ID, Drive folder IDs, asignaturas/coordinaciones iniciales).
  2. Permitir agregar o modificar asignaturas, secciones y docentes mediante cambios de configuración sin requerir redespliegue de código.
  3. Flujo de inicialización idempotente: valida configuración, crea hojas/carpetas que falten sin duplicar, prueba conectividad/permisos y registra estado.
  4. Control de estados explícitos: `Borrador`, `Pendiente`, `Preparando`, `Desplegando`, `Validando`, `Activo`, `ConErrores`, `Suspendido`, `Retirado`.
  5. Ante fallos, permite reanudar sin duplicar estructuras ni perder datos.
  6. Si requiere autorización manual de Google OAuth, indica el paso pendiente sin marcar erróneamente como exitoso.
  7. Mantener historial de versiones de plantilla asociadas a cada instancia.
  8. Auditar solicitante, fecha y resultado de cada despliegue o cambio de estado.
- **Criterios de Aceptación:**
  - CA-042: Se puede registrar e inicializar una nueva área académica desde la plataforma sin modificar código fuente.
  - CA-043: La inicialización de la instancia es completamente idempotente.
  - CA-044: Los fallos de despliegue emiten un diagnóstico verificable y no marcan la instancia como activa.
  - CA-045: La actualización de la plantilla base es optativa y no modifica automáticamente todas las instancias activas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-008] Crear el microservicio central del desarrollador y el registro de servicios
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-011 (P1 · Administración Centralizada)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Plano de control y registro de microservicios)
- **Archivos Involucrados:**
  - Microservicio Central del Desarrollador (`backend/developer-service/` / registro central)
  - Dashboard del Desarrollador
  - `js/api.js`
- **Dependencias Expuestas:** `getInstitutionalCatalog`, `validateApiContractsTestSuite`, `recordTraceabilityLog`
- **Descripción del Alcance:**
  Implementar el plano de control central y el registro de servicios para supervisar despliegues, catalogar endpoints, administrar roles/responsabilidades y mantener la interoperabilidad de la plataforma.

  Requisitos Funcionales:
  1. Registro central de servicios con: ID único, nombre, tipo, estado administrativo/operativo, versión, URLs, Spreadsheets/Drive, permisos, dependencias y último contacto.
  2. Contrato común de comunicación entre servicios con `correlationId`, timeouts, manejo de retries e idempotencia.
  3. Separar operaciones administrativas de las operacionales (el plano de control no es intermediario obligatorio de llamadas de negocio).
  4. Administrador de roles y responsabilidades que soporte múltiples roles por usuario, asignaciones por área/subárea y vigencia de permisos.
  5. Tolerancia a fallos: si el servicio central está fuera de línea, los servicios operativos independientes siguen funcionando.
  6. Prohibir ejecución de código arbitrario no catalogado desde comandos administrativos.
- **Criterios de Aceptación:**
  - CA-046: El registro central cataloga todos los microservicios, endpoints y recursos asociados.
  - CA-047: Las solicitudes entre servicios utilizan el contrato común con `correlationId`.
  - CA-048: La indisponibilidad del microservicio central no detiene la operación de los servicios académicos, administrativos ni financieros.
  - CA-049: Un usuario ejerce múltiples roles en distintas áreas sin duplicidad de cuentas ni elevación no autorizada de privilegios.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-009] Implementar módulos de salud, diagnóstico, tráfico y errores en cada microservicio
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-012 (P1 · Observabilidad y Diagnóstico)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Salud, métricas y registro de errores de microservicios)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboard del Desarrollador
  - `js/teacher.js` (Consola técnica)
- **Dependencias Expuestas:** `runTechnicalHealthChecks`, `getStructuredLogs`, `recordTraceabilityLog`
- **Descripción del Alcance:**
  Dotar a cada microservicio de endpoints estandarizados de salud (`ping`/diagnóstico), métricas de rendimiento/tráfico y sanitización de registros de errores para el dashboard de supervisión.

  Requisitos Funcionales:
  1. Endpoints de salud en cada microservicio que verifiquen: conectividad, acceso a Sheets, acceso a Drive, permisos y versión.
  2. Diferenciar respuesta básica de conectividad de una verificación completa de dependencias de lectura/escritura.
  3. Pruebas de diagnóstico funcional controladas que verifiquen contratos de API sin alterar datos de producción.
  4. Métricas de tráfico y rendimiento reales (solicitudes, errores por categoría, latencia ms, consumo de ejecuciones GAS).
  5. Registro de errores enriquecido (`eventId`, servicio, módulo, operación, timestamp, severidad, `correlationId`, versión, estado de resolución).
  6. Sanitización obligatoria en logs: prohibido guardar contraseñas, tokens, datos bancarios o PII sensible completa.
  7. Dashboard de supervisión con filtros por área, versión, severidad e historial de disponibilidad.
- **Criterios de Aceptación:**
  - CA-050: Todos los microservicios responden al contrato común de diagnóstico y salud.
  - CA-051: El diagnóstico distingue fallos de red, permisos de Sheets, falta de espacio en Drive y errores de lógica.
  - CA-052: Los logs de errores pueden filtrarse por severidad, fecha y servicio sin exponer datos personales ni credenciales.
  - CA-053: La consola de supervisión identifica la causa de degradación y las dependencias afectadas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-010] Incorporar administración segura de logs y comandos operativos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-013 (P1 · Mantenimiento Seguro)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Administración de logs y cola de comandos)
- **Archivos Involucrados:**
  - Microservicio Central del Desarrollador
  - Dashboard del Desarrollador
  - Módulos de logs en microservicios
- **Dependencias Expuestas:** `getStructuredLogs`, `recordTraceabilityLog`, `BitacoraTraceability`
- **Descripción del Alcance:**
  Implementar la gestión centralizada de logs (consulta, rotación, archivo y purga segura) junto con una cola de comandos administrativos de mantenimiento basados en un catálogo estrictamente permitido.

  Requisitos Funcionales:
  1. Consulta y filtrado de logs multi-servicio desde el dashboard central.
  2. Permitir marcar errores como revisados/resueltos sin borrar su registro de auditoría.
  3. Purga y archivo seguro de logs que distinga registros temporales de auditorías protegidas inmutables.
  4. Catálogo cerrado de comandos permitidos (diagnóstico, comprobación de almacenamiento, respaldos, purga de temporales). Prohibida la ejecución libre de cadenas o funciones de Apps Script.
  5. Cola de tareas administrativas asíncronas para operaciones de mantenimiento prolongadas con soporte para cancelación segura e idempotencia.
  6. Permisos específicos por comando administrativo basados en rol autenticado.
- **Criterios de Aceptación:**
  - CA-054: Los logs pueden ser filtrados, archivados y marcados como resueltos desde el dashboard.
  - CA-055: Las purgas de registros temporales conservan intactos los logs de auditoría obligatorios.
  - CA-056: La ejecución de comandos se limita estrictamente al catálogo cerrado autorizado.
  - CA-057: Cada comando ejecutado registra solicitante, fecha, parámetros, resultado y `correlationId`.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-011] Implementar respaldos independientes y recuperación por área
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-014 (P1 · Continuidad Operativa)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Respaldos aislados y restauración por microservicio)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboard del Desarrollador
  - Google Drive / Google Sheets
- **Dependencias Expuestas:** `createSystemBackup`, `restoreSystemBackup`, `verifyBackupIntegrity`, `reconcileRestoredDataIntegrity`
- **Descripción del Alcance:**
  Establecer la estrategia de respaldos automáticos e independientes por microservicio con verificación de sumas SHA-256, políticas de retención y restauración aislada sin afectar a otras áreas.

  Requisitos Funcionales:
  1. Generar y programar respaldos independientes por microservicio (Spreadsheets, configuraciones y metadatos de Drive).
  2. Catálogo central de respaldos con checksum SHA-256, timestamp, versión y estado de verificación de integridad.
  3. Estrategia de rotación, retención y almacenamiento aislado de respaldos.
  4. Proceso de restauración por área: exige confirmación explicita (`RESTORE-CONFIRMED`), valida checksum/compatibilidad y evita sobrescribir datos de otros microservicios.
  5. Vista previa del impacto de restauración y soporte para simulación/prueba en entorno aislado.
  6. Reconciliación de integridad referencial post-restauración para verificar vínculos entre estudiantes, tutores, documentos y matrículas.
- **Criterios de Aceptación:**
  - CA-058: Se pueden generar y catalogar respaldos aislados por microservicio con verificación SHA-256.
  - CA-059: La restauración de un microservicio no altera ni sobrescribe datos de otros servicios.
  - CA-060: Copias de seguridad corruptas o con suma de verificación alterada son rechazadas antes de aplicar cambios.
  - CA-061: La restauración verifica y conserva las relaciones referenciales entre entidades del servicio.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-012] Establecer seguridad, aislamiento y gestión centralizada de permisos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-015 (P1 · Seguridad y Control de Acceso)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Seguridad, identidad única, RBAC y aislamiento)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - `js/auth.js`
  - `js/api.js`
  - Dashboards
- **Dependencias Expuestas:** `ROLE_PERMISSIONS`, `validateRolePermission`, `validateContextualAccess`, `checkAndRegisterIdempotencyKey`
- **Descripción del Alcance:**
  Implementar la arquitectura de seguridad multi-servicio que combine una identidad única por persona, asignación flexible de roles múltiples por área/subárea, validación de permisos en el servidor y protección contra IDOR y elevación de privilegios.

  Requisitos Funcionales:
  1. Identidad institucional única por persona independiente del número de roles asignados.
  2. Soporte para múltiples roles simultáneos con permisos por servicio, módulo, operación y ámbito de datos.
  3. Matriz de permisos RBAC para todas las áreas (Dirección, Secretaría, Contabilidad, Cobros, Facturación, RRHH, Docentes, Estudiantes, Coordinadores, Cafetería, Desarrolladores).
  4. Coordinaciones académicas con permisos de supervisión acotados por área, asignatura, grado o sección.
  5. Validación obligatoria de autenticación y autorización en el backend de cada microservicio para todas las llamadas (no confiar en la interfaz).
  6. Prohibido almacenar claves privadas o tokens en el código frontend.
  7. Protección contra IDOR (acceso directo a objetos ajenos) mediante `validateContextualAccess`.
  8. Auditoría completa de cambios de permisos, revocaciones y comandos sensibles.
- **Criterios de Aceptación:**
  - CA-062: Cada microservicio valida independientemente la autorización del usuario en el servidor.
  - CA-063: Un usuario ejerce múltiples roles en distintas áreas desde una sola cuenta sin duplicación de identidad.
  - CA-064: La manipulación de IDs en parámetros de llamada no permite acceder a expedientes ni documentos ajenos.
  - CA-065: Las revocaciones de permisos se aplican de inmediato en todas las llamadas protegidas del backend.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-013] Implementar despliegues versionados, migraciones y reversión controlada
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-016 (P1 · Mantenimiento y Evolución)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Versionado de servicios, migraciones de esquema y rollback)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboard del Desarrollador
  - Registro de Servicios Central
- **Dependencias Expuestas:** `validateApiContractsTestSuite`, `evaluateTransactionalStorageMigrationNeed`, `reconcileRestoredDataIntegrity`
- **Descripción del Alcance:**
  Establecer el protocolo de versionado de código/esquemas, contratos de compatibilidad de API entre versiones, migraciones de datos no destructivas y procedimientos de reversión (rollback) controlados.

  Requisitos Funcionales:
  1. Control de versión explícito por microservicio (versión de código, versión de esquema BD y versión de configuración).
  2. Registro de cambios (changelog) y contratos de API compatibles por versión.
  3. Verificación de dependencias y pruebas automáticas post-despliegue (conectividad, Sheets, Drive, RBAC, endpoints).
  4. Migraciones de datos idempotentes con validación previa y registro de resultados sin duplicar filas ni romper relaciones.
  5. Estrategia de reversión (rollback) que contemple código, esquemas y datos.
  6. Permitir actualizar la versión de un microservicio de forma aislada sin forzar la actualización de los demás.
  7. Auditoría de impacto previa a cada despliegue para garantizar que no se desconecten funciones existentes.
- **Criterios de Aceptación:**
  - CA-066: Cada microservicio declara y expone su versión de código y esquema.
  - CA-067: Las migraciones de datos son idempotentes y no duplican estructuras ni registros al reejecutarse.
  - CA-068: La actualización de una instancia no altera las demás ni desconecta consumidores del dashboard.
  - CA-069: Existe un procedimiento probado de rollback que permite restituir el servicio ante despliegues fallidos.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-014] Centralizar la configuración y las dependencias sin centralizar todos los datos
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-017 (P1 · Configuración e Interoperabilidad)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Registro central de configuración y catálogo de contratos)
- **Archivos Involucrados:**
  - Microservicio Central del Desarrollador
  - `js/api.js`
  - All microservices (`backend/*`)
- **Dependencias Expuestas:** Registro de Servicios Central, `getInstitutionalCatalog`, `validateApiContractsTestSuite`
- **Descripción del Alcance:**
  Centralizar el registro de configuraciones, endpoints y dependencias de la plataforma en el servicio del desarrollador, manteniendo la descentralización de los datos operativos en sus respectivos microservicios.

  Requisitos Funcionales:
  1. Registro de configuración por microservicio con referencias a Spreadsheets, carpetas Drive y dependencias declaradas.
  2. Validación de configuración previa a la activación del servicio (detecta IDs inexistentes o permisos faltantes).
  3. Modificación de URLs, parámetros y referencias de almacenamiento mediante configuración sin editar código fuente.
  4. Versionado e historial de cambios de configuración.
  5. Desactivación o retiro controlado de servicios sin dejar enlaces ni referencias huérfanas en los dashboards.
  6. Catálogo central de endpoints, operaciones, parámetros, tipos de respuesta y permisos requeridos.
  7. Detección automática de llamadas obsoletas entre `js/api.js` y los microservicios desplegados.
- **Criterios de Aceptación:**
  - CA-070: Todos los servicios y sus dependencias están catalogados en el registro central de configuración.
  - CA-071: Los cambios de URLs o referencias de almacenamiento se aplican mediante configuración sin recompilar ni editar código.
  - CA-072: La retirada de un microservicio elimina o deshabilita sus endpoints en el catálogo central sin romper los dashboards.
  - CA-073: El catálogo de contratos valida la compatibilidad de llamadas de `js/api.js`.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-015] Validar el rendimiento, la capacidad y la recuperación de la arquitectura completa
- **Origen del Hallazgo:** Reestructuración Arquitectónica / F6-018 (P1 · Pruebas de Integración)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Pruebas de carga, escalabilidad e integración total)
- **Archivos Involucrados:**
  - Todos los microservicios (`backend/*`)
  - Dashboards y clientes frontend (`js/*`)
  - Suite de integración y rendimiento
- **Dependencias Expuestas:** `runConcurrencyAndConsistencySuite`, `validateApiContractsTestSuite`, `getOperationalCapacityMetrics`
- **Descripción del Alcance:**
  Ejecutar la validación integral de rendimiento, resiliencia, tolerancia a fallos, concurrencia y recuperación de desastres sobre toda la arquitectura de microservicios.

  Requisitos Funcionales:
  1. Pruebas de integración multi-servicio que simulen operaciones simultáneas de admisión, matrícula, pagos, asistencias y tareas.
  2. Pruebas de tolerancia a fallos: simular caída de un servicio o de Drive/Sheets y verificar resiliencia de módulos independientes.
  3. Verificación de idempotencia ante reintentos de red o fallos de comunicación.
  4. Medición de tiempos de respuesta, latencia ms, límites de ejecución GAS y cuotas de API.
  5. Incorporar paginación y procesamiento por lotes para evitar lecturas masivas no acotadas.
  6. Probar usuarios con combinaciones de múltiples roles en todas las interfaces.
  7. Auditar flujos end-to-end garantizando que no haya pérdida de datos ni regresiones funcionales.
- **Criterios de Aceptación:**
  - CA-074: Se verifica que incorporar una nueva instancia académica no afecta el rendimiento de las existentes.
  - CA-075: La indisponibilidad simulada de un microservicio no bloquea las funciones de otros servicios independientes.
  - CA-076: Las operaciones críticas procesadas con reintentos no generan duplicados de datos ni inconsistencias contables/académicas.
  - CA-077: Los flujos end-to-end funcionan correctamente verificando integridad de datos, permisos y observabilidad.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-016] Supervisar la capacidad de almacenamiento y los fallos del repositorio documental
- **Origen del Hallazgo:** `Auditoria.txt` / `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 2 (P2 · Continuidad Operativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Bajo (Mejora operativa y mantenimiento preventivo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - Carpeta de Google Drive `Documentos_Estudiantes`
- **Dependencias Expuestas:** `uploadStudentDocument`, `DriveApp`, `PropertiesService`, `sendMultiChannelNotification`, `getStructuredLogs`
- **Descripción del Alcance:**
  Establecer una supervisión preventiva para anticipar problemas de capacidad en Google Drive, detectar patrones de fallo en operaciones de carga/descarga y evitar interrupciones en la gestión documental de expedientes.

  Requisitos Funcionales:
  1. Supervisar los fallos de carga, lectura, actualización y recuperación de documentos, distinguiendo entre: falta de permisos, cuotas alcanzadas, errores temporales de conexión, archivos inaccesibles o inconsistencias en BD.
  2. Registrar métricas operativas (cargas exitosas/fallidas, volumen procesado, tiempo de respuesta) sin almacenar ni exponer datos personales sensibles.
  3. Incorporar alertas configurables por umbrales de capacidad: preventiva al 80%, prioridad alta al 90%, estado crítico al 95%.
  4. Diferenciar la capacidad total disponible de cuotas de solicitudes y restricciones específicas de la cuenta.
  5. Permitir a los administradores consultar el estado del servicio documental y el historial de incidentes.
  6. Aplicar reintentos controlados únicamente a errores transitorios, evitando reintentos que generen referencias duplicadas.
  7. Informar claramente el estado final del archivo y de la referencia en BD tras un fallo.
  8. Implementar un procedimiento de conciliación que detecte archivos guardados sin referencia válida en BD y referencias en BD cuyo archivo en Drive no exista.
  9. Garantizar que la supervisión no bloquee ni ralentice la carga normal de documentos.
- **Criterios de Aceptación:**
  - CA-078: El sistema obtiene y muestra las métricas de almacenamiento disponibles mediante los servicios autorizados.
  - CA-079: Cuando no se dispone de una métrica fiable, la interfaz identifica expresamente esa limitación.
  - CA-080: Los umbrales configurados generan el estado de advertencia correspondiente.
  - CA-081: Una misma condición persistente no genera notificaciones ilimitadas.
  - CA-082: Los errores de consulta quedan registrados y no se interpretan como almacenamiento disponible.
  - CA-083: Una carga documental fallida no se presenta como exitosa ni deja una referencia válida a un archivo inexistente.
  - CA-084: La conciliación identifica inconsistencias sin eliminar documentos automáticamente.
  - CA-085: La supervisión no consume innecesariamente las cuotas de ejecución de Google Apps Script.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-017] Completar el flujo de gestión de documentos pendientes, vencidos y faltantes
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 3 (P2 · Gestión Documental)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de gestión documental)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `getStudentDocuments`, `uploadStudentDocument`, `updateDocumentStatus`, `DocumentosEstudiante`, `SolicitudesAdmision`
- **Descripción del Alcance:**
  Facilitar que los responsables administrativos identifiquen y gestionen los expedientes con documentación incompleta, autorizaciones pendientes o documentos vencidos durante toda la trayectoria educativa del estudiante.

  Requisitos Funcionales:
  1. Definir requisitos documentales por trámite o condición (admisión inicial, renovación, traslado, graduación, autorizaciones periódicas).
  2. Configurar cada requisito como obligatorio, opcional o condicional (con sus reglas activadoras).
  3. Registrar para cada documento: tipo documental, estudiante/expediente, estado, fecha recepción, fecha vencimiento, revisor, observaciones y versión vigente.
  4. Diferenciar claramente los estados: pendiente, recibido, en revisión, aprobado, rechazado, vencido y exento. Las exenciones de documentos obligatorios deben requerir autorización por rol.
  5. Detectar automáticamente documentos vencidos y próximos a vencer según la zona horaria institucional.
  6. Mostrar los faltantes en el expediente y en los trámites que dependan de ellos con las acciones requeridas para subsanar.
  7. Permitir sustituir documentos rechazados o vencidos sin borrar el archivo previo ni perder el historial de revisiones.
  8. Permitir registrar excepciones justificadas con responsable, fecha, motivo y alcance sin afectar a otros estudiantes.
  9. Evitar que un trámite u expediente aparezca como completo si falta un documento obligatorio no exento.
- **Criterios de Aceptación:**
  - CA-086: Un estudiante con todos los requisitos obligatorios aprobados aparece como documentalmente completo.
  - CA-087: La ausencia de un documento obligatorio impide completar el trámite cuando la normativa configurada así lo exija.
  - CA-088: Un documento opcional faltante no bloquea el trámite.
  - CA-089: Un documento vencido cambia de estado conforme a su fecha, sin modificar el historial de matrículas.
  - CA-090: Una exención autorizada queda registrada y no puede concederla un rol sin permiso.
  - CA-091: La sustitución de un archivo conserva la versión anterior, el autor del cambio y la fecha.
  - CA-092: La lista de pendientes se mantiene consistente tras actualizar o recargar la sesión.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-018] Completar la gestión de autorizaciones, responsables legales y contactos de emergencia
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 4 (P2 · Protección de Estudiantes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Protección de estudiantes y permisos familiares)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `RelacionesEstudianteTutor`, `RelacionesFamiliares`, `updateFamilyLinkPermissions`, `revokeFamilyLink`, `validateContextualAccess`
- **Descripción del Alcance:**
  Reforzar la administración del ciclo de vida de las autorizaciones familiares y de tutores, haciendo explícitos sus efectos en el acceso a información académica, financiera, documental y de asistencia.

  Requisitos Funcionales:
  1. Mantener separadas las relaciones de parentesco, representación legal, responsabilidad financiera, contacto de emergencia y autorización de retiro.
  2. Permitir múltiples responsables por estudiante y múltiples estudiantes por responsable con registros independientes.
  3. Registrar vigencia, estado, fecha de autorización, fecha de revocación, usuario responsable y evidencia documental asociada.
  4. Permitir revocar una autorización específica sin eliminar otras relaciones válidas.
  5. Establecer reglas para autorizaciones vencidas, responsables sin cuenta de usuario e invitaciones pendientes.
  6. Propagar las revocaciones de inmediato a las comprobaciones de acceso del servidor (`validateContextualAccess`).
  7. Permitir registrar restricciones de custodia judicial o disputas legales para limitar la exposición de datos según permisos efectivos.
  8. Mostrar a los administradores la lista consolidada de quienes tienen acceso al expediente y sus categorías de consulta.
  9. Evitar que editar un responsable sobrescriba datos personales del estudiante o de otros vínculos.
- **Criterios de Aceptación:**
  - CA-093: Un responsable con permiso exclusivamente de emergencia no puede acceder a calificaciones ni información financiera.
  - CA-094: La revocación de un vínculo impide las consultas posteriores protegidas por ese vínculo.
  - CA-095: La revocación de una autorización no elimina otros permisos independientes válidos.
  - CA-096: Un responsable vinculado a varios estudiantes conserva únicamente los accesos autorizados para cada uno.
  - CA-097: Un vínculo vencido no otorga permisos activos.
  - CA-098: Los cambios quedan registrados con autor, fecha, valor anterior, valor nuevo y motivo.
  - CA-099: Las restricciones legales documentadas prevalecen sobre los permisos ordinarios incompatibles.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-019] Fortalecer la trazabilidad del expediente y la consulta del historial institucional
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 5 (P2 · Integridad Histórica)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Trazabilidad y auditoría administrativa)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getStudentTimeline`, `MovimientosEstudiante`, `Matriculas`, `HistorialCambiosEntidad`, `getEntityAuditHistory`
- **Descripción del Alcance:**
  Consolidar en una vista cronológica completa y auditable todos los eventos del ciclo de vida del expediente para uso administrativo y legal.

  Requisitos Funcionales:
  1. Consolidar cronológicamente: conversión desde admisión, matrículas, renovaciones, cambios de grado/sección/jornada, promociones, repitencias, retiros, traslados, reincorporaciones, graduación, revisión de documentos, cambios de tutores y correcciones administrativas.
  2. Cada evento debe mostrar: fecha/hora, tipo, autor/sistema, periodo escolar, resultado y referencia al registro original.
  3. Diferenciar claramente la situación actual de los antecedentes históricos.
  4. Registrar correcciones históricas autorizadas como nuevos eventos de auditoría conservando el valor anterior, valor nuevo, responsable y motivo.
  5. Proteger la bitácora frente a ediciones ordinarias para evitar borrado silencioso de eventos.
  6. Incorporar filtros por año lectivo, categoría, responsable y tipo de movimiento, más búsqueda textual.
  7. Permitir exportar el historial a un formato legible respetando permisos y minimizando PII.
  8. Mantener trazabilidad de fusiones de expedientes relacionando origen, destino y elementos consolidados.
- **Criterios de Aceptación:**
  - CA-100: Una trayectoria con múltiples movimientos muestra los eventos en orden cronológico exacto.
  - CA-101: Las correcciones autorizadas son visibles como cambios posteriores, sin borrar la trazabilidad previa.
  - CA-102: Un usuario sin permiso no puede consultar valores sensibles anteriores a una modificación.
  - CA-103: Los filtros por año lectivo devuelven exclusivamente los eventos del periodo seleccionado.
  - CA-104: Las fusiones de expedientes conservan una relación verificable entre origen y destino.
  - CA-105: La exportación coincide con los registros que el usuario está autorizado a consultar.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-020] Mejorar la búsqueda global y la navegación operativa del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 7 (P2 · Productividad Administrativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Navegación y productividad administrativa)
- **Archivos Involucrados:**
  - `js/ui-common.js`
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `searchGlobalOmnibox`, `findDuplicateStudents`, `ExpedientesEstudiantes`, `Matriculas`
- **Descripción del Alcance:**
  Optimizar la búsqueda global y la navegación del expediente para asegurar la localización rápida e inequívoca del estudiante, evitando errores de selección y clics innecesarios.

  Requisitos Funcionales:
  1. Permitir buscar por identificador de expediente, código de estudiante, DNI, nombres y apellidos.
  2. Normalizar mayúsculas, minúsculas, tildes y espacios sin alterar los datos persistidos.
  3. Distinguir coincidencias exactas de aproximadas e incluir identificadores secundarios para evitar confusión entre homónimos.
  4. Mostrar el estado institucional actual y periodo de matrícula en los resultados de búsqueda.
  5. Permitir filtrar por año lectivo, grado, sección, condición de matrícula y estado del expediente.
  6. Permitir acceso directo desde el resultado al expediente, documentos e historial.
  7. Mantener el contexto de búsqueda y filtros al navegar de ida y vuelta al expediente.
  8. Mostrar estados de carga, resultados vacíos, errores y falta de permisos de forma explícita.
  9. Enmascarar PII sensible (como DNI parcial) según los permisos del rol consultante.
  10. Ante coincidencias ambiguas, exigir selección manual en lugar de abrir automáticamente un expediente.
- **Criterios de Aceptación:**
  - CA-106: La búsqueda encuentra un estudiante por su identificador institucional o DNI.
  - CA-107: Variaciones de tildes o mayúsculas no impiden encontrar el registro.
  - CA-108: Homónimos se presentan como registros independientes claramente diferenciables.
  - CA-109: Un estudiante retirado o graduado puede localizarse indicando su estado real.
  - CA-110: Los fallos de conexión no se presentan como cero resultados.
  - CA-111: La navegación mantiene su funcionamiento en pantallas móviles y de escritorio.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-021] Implementar una matriz de integridad y conciliación entre los módulos institucionales
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 8 (P2 · Consistencia de Datos)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Integridad de datos entre microservicios)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/accounting-service/Code.gs`
- **Dependencias Expuestas:** `auditAndReconcileIdentityInconsistencies`, `reconcileRestoredDataIntegrity`, `ExpedientesEstudiantes`, `Matriculas`, `Cobros`, `Asistencia`
- **Descripción del Alcance:**
  Establecer comprobaciones de consistencia que detecten divergencias de datos entre el expediente académico, la gestión de usuarios, el módulo financiero y el control de asistencia.

  Requisitos Funcionales:
  1. Definir la propiedad del dato por módulo (fuente de verdad).
  2. Mantener la correspondencia estricta entre `ExpedienteID`, `PersonaID`, `MatriculaID`, `UsuarioID` y referencias contables/asistencia.
  3. Verificar que los cambios de matrícula se propaguen a finanzas y asistencia según reglas de negocio.
  4. Diferenciar sincronizaciones inmediatas, diferidas y registros inmutables.
  5. Detectar matrículas huérfanas, cargos vinculados a IDs inexistentes y registros de asistencia desalineados.
  6. Registrar origen, fecha, resultado y errores de sincronización (`correlationId`).
  7. En fallos parciales, indicar qué módulo fue actualizado y cuál quedó pendiente.
  8. Permitir reintentos idempotentes.
  9. Proveer una consola administrativa de conciliación con acciones autorizadas de resolución.
  10. Prohibir modificaciones/fusiones automáticas de datos financieros o académicos sin revisión humana.
- **Criterios de Aceptación:**
  - CA-112: Una matrícula activa se vincula al expediente y periodo escolar correctos en todos los módulos.
  - CA-113: Un fallo de sincronización entre servicios queda registrado sin ocultarse.
  - CA-114: Los reintentos de sincronización no duplican cargos ni matrículas.
  - CA-115: Los registros históricos mantienen sus valores originales.
  - CA-116: La consola de conciliación identifica la entidad afectada, causa y acción recomendada.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-022] Ampliar la gestión de documentos con versiones, integridad y recuperación controlada
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 9 (P2 · Protección Documental)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Gestión documental avanzada y versiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `DocumentosEstudiante`, `uploadStudentDocument`, `getStudentDocuments`, `DriveApp`
- **Descripción del Alcance:**
  Reforzar el control de versiones de los documentos del expediente, garantizando la conservación de antecedentes históricos y la verificación de accesibilidad real de los archivos en Google Drive.

  Requisitos Funcionales:
  1. Separar el documento lógico del expediente de cada versión física del archivo.
  2. Al sustituir un documento, conservar la referencia a la versión previa y a la versión vigente.
  3. Registrar usuario, fecha, motivo y resultado de revisión de cada versión.
  4. Verificar la accesibilidad física del archivo en Drive al consultar, detectando enlaces rotos o borrados externos.
  5. Proteger el acceso documental mediante endpoints autenticados y tokens temporales en lugar de URLs públicas.
  6. Permitir restaurar una versión anterior mediante acción autorizada, registrándola como nueva versión activa.
  7. Separar la eliminación lógica del registro de la eliminación física del archivo según políticas de retención.
  8. Mantener las validaciones de tipo (PDF, JPG, PNG, WEBP) y tamaño (10MB).
- **Criterios de Aceptación:**
  - CA-117: La sustitución de un documento conserva una referencia verificable a la versión anterior.
  - CA-118: La versión vigente se recupera correctamente tras recargar.
  - CA-119: Las referencias a archivos borrados en Drive se reportan como inconsistencias.
  - CA-120: Usuarios no autorizados no pueden descargar versiones previas mediante llamadas directas.
  - CA-121: La restauración de una versión genera un evento en el historial.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-023] Desarrollar un resumen institucional del expediente orientado a cada perfil autorizado
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 10 (P2 · Experiencia de Usuario)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (UX y visualización unificada por rol)
- **Archivos Involucrados:**
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `js/secretary.js`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getStudentFile`, `getStudentEnrollments`, `getStudentDocuments`, `ROLE_PERMISSIONS`
- **Descripción del Alcance:**
  Crear una vista de resumen inicial del expediente contextualizada según el rol del usuario (Secretaría, Docente, Estudiante/Padre), sin duplicar lógica de almacenamiento.

  Requisitos Funcionales:
  1. Presentar resumen con: identidad institucional, estado actual, matrícula vigente, movimientos recientes, documentos pendientes y accesos directos autorizados.
  2. Secretaría ve datos administrativos completos para matrículas y trámites.
  3. Docente ve únicamente información académica y de grupo sin controles administrativos.
  4. Estudiante/Familia ve sus propios datos y los de sus estudiantes vinculados según permisos de vínculo.
  5. Diferenciar visualmente datos no disponibles por permisos de datos no registrados.
  6. Mostrar marcas de fecha de actualización de cada sección.
  7. Permitir navegación fluida desde el resumen hacia los detalles sin duplicar formularios.
  8. Ante fallos de sub-servicios, renderizar las secciones disponibles e indicar el fallo de la sección afectada.
  9. Garantizar diseño adaptable e intuitivo en móviles.
- **Criterios de Aceptación:**
  - CA-122: Cada perfil visualiza exclusivamente las secciones autorizadas para su rol.
  - CA-123: El estado de matrícula coincide con el registro oficial.
  - CA-124: El fallo de un módulo no rompe la carga del resto del resumen.
  - CA-125: Los datos históricos se distinguen visualmente de los actuales.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-024] Incorporar notificaciones y seguimiento de trámites del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 11 (P2 · Automatización Administrativa)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Notificaciones y trámites)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `SolicitudesAdmision`, `DocumentosEstudiante`, `Matriculas`
- **Descripción del Alcance:**
  Implementar notificaciones automáticas e hilos de seguimiento para eventos clave del expediente (documentos vencidos, renovaciones pendientes, traslados, resoluciones).

  Requisitos Funcionales:
  1. Generar notificaciones para: documentos pendientes/vencidos, matrículas incompletas, cambios de sección/grado, reincorporaciones, revisiones documentales.
  2. Configurar destinatarios según evento, rol y autorizaciones del vínculo familiar.
  3. Registrar fecha de emisión, canal, destinatario y estado de entrega.
  4. Ofrecer panel de seguimiento de trámites pendientes con filtros por estado y fecha.
  5. Evitar PII sensible en mensajes externos (SMS/WhatsApp/Email); remitir al portal autenticado.
  6. Evitar notificaciones duplicadas en reintentos de operación.
  7. Permitir configurar recordatorios y alertas con frecuencia parametrizable.
  8. Respetar preferencias y revocaciones de contacto del tutor.
- **Criterios de Aceptación:**
  - CA-126: La proximidad de vencimiento documental dispara la notificación configurada.
  - CA-127: Reintentar un trámite no genera múltiples notificaciones idénticas.
  - CA-128: Un tutor revocado no recibe notificaciones posteriores.
  - CA-129: El estado de entrega se registra sin bloquear el trámite si el canal falla.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-025] Crear un mecanismo de revisión y recuperación de fusiones de expedientes
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 12 (P2 · Integridad de Identidad)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Auditoría y reversión de fusiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `findDuplicateStudents`, `mergeStudentFiles`, `ExpedientesEstudiantes`, `HistorialCambiosEntidad`
- **Descripción del Alcance:**
  Desarrollar una interfaz de pre-visualización comparativa antes de fusionar expedientes y un protocolo de auditoría/desvinculación controlada en caso de fusión errónea.

  Requisitos Funcionales:
  1. Mostrar cuadro comparativo lado a lado (datos personales, matrículas, documentos, tutores, historial) antes de confirmar la fusión.
  2. Resaltar contradicciones de datos para resolución manual antes de fusionar.
  3. Exigir confirmación explícita con motivo registrado, responsable y fecha.
  4. Preservar la relación entre el expediente origen (marcado 'Fusionado') y el expediente destino.
  5. Registrar en la bitácora la lista exacta de entidades transferidas.
  6. Proporcionar un procedimiento administrativo documentado para separar o corregir fusiones erróneas.
  7. Prohibir fusiones automáticas sin intervención del personal autorizado.
- **Criterios de Aceptación:**
  - CA-130: La fusión requiere revisión previa de contradicciones y confirmación explícita.
  - CA-131: Todas las entidades transferidas son rastreables hasta su expediente original.
  - CA-132: Los identificadores históricos del expediente origen se conservan y no se eliminan.
  - CA-133: El procedimiento de corrección permite restituir asociaciones erróneas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-026] Incorporar informes administrativos y exportación controlada del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 13 (P2 · Información Institucional)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Informes ejecutivos y exportación de datos)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `dashboard-secretaria.html`
  - `js/secretary.js`
- **Dependencias Expuestas:** `getStudentEnrollments`, `getStudentDocuments`, `ExpedientesEstudiantes`, `Matriculas`
- **Descripción del Alcance:**
  Construir un catálogo de informes administrativos sobre el estado y trayectoria de los expedientes con exportación en CSV/Excel y trazabilidad de descargas.

  Requisitos Funcionales:
  1. Generar reportes de: estado de expedientes (activos, retirados, traslados, graduados), matrículas por año/grado/sección/jornada, reincorporaciones, documentos faltantes/vencidos, inconsistencias.
  2. Incluir filtros por rango de fechas, grado, sección y estado.
  3. Exportación a CSV/Excel con minimización de datos (solo campos necesarios).
  4. Registrar en la bitácora de auditoría toda exportación masiva que contenga PII.
  5. Restringir la generación de reportes según los permisos del rol del usuario.
  6. Marcar claramente informes incompletos por fallos parciales de consulta.
- **Criterios de Aceptación:**
  - CA-134: Los reportes filtrados contienen exclusivamente registros del periodo y criterios seleccionados.
  - CA-135: La exportación CSV coincide exactamente con la grilla de datos visualizada.
  - CA-136: La descarga de información sensible queda registrada en la bitácora de trazabilidad.
  - CA-137: Usuarios sin permisos no pueden ejecutar exportaciones masivas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-027] Fortalecer la recuperación y verificación de copias de seguridad del expediente
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 14 (P2 · Recuperación ante Incidentes)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Copias de seguridad y recuperación)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `createSystemBackup`, `verifyBackupIntegrity`, `restoreSystemBackup`, `reconcileRestoredDataIntegrity`
- **Descripción del Alcance:**
  Reforzar los procedimientos de restauración de respaldos, validando no solo la suma Checksum SHA-256 sino la integridad referencial completa de los expedientes y sus archivos en Drive.

  Requisitos Funcionales:
  1. Validar suma SHA-256 de la copia de seguridad antes de iniciar restauración.
  2. Verificar que el respaldo contenga las tablas esenciales (`ExpedientesEstudiantes`, `Matriculas`, `DocumentosEstudiante`, `MovimientosEstudiante`, `RelacionesFamiliares`).
  3. Escanear y reportar referencias a archivos de Drive inexistentes o inaccesibles.
  4. Ofrecer vista previa del impacto antes de confirmar la sobrescritura de datos.
  5. Exigir código de confirmación (`RESTORE-CONFIRMED`) y motivo documentado.
  6. Ejecutar reconciliación post-restauración y emitir informe de consistencia referencial.
- **Criterios de Aceptación:**
  - CA-138: Copias con Checksum alterado son rechazadas inmediatamente.
  - CA-139: Respaldos con referencias rotas emiten un reporte de advertencia detallado.
  - CA-140: La restauración exitosa conserva todas las relaciones históricas entre tablas.
  - CA-141: La operación queda registrada con autor, fecha, respaldo utilizado y resultado.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-028] Mejorar la accesibilidad y la eficiencia de uso del expediente en dispositivos móviles
- **Origen del Hallazgo:** `AUDITORIA_FASE_6_EXPEDIENTE_CICLO_VIDA.md` / Tarea 16 (P3 · Experiencia de Usuario)
- **Prioridad:** P3
- **Severidad/Clasificación:** Bajo (UX, accesibilidad WCAG y rendimiento móvil)
- **Archivos Involucrados:**
  - `dashboard-secretaria.html`
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `css/style.css`
  - `js/secretary.js`
  - `js/teacher.js`
- **Dependencias Expuestas:** `auditAndFixAccessibility`, `#modal-student-file`
- **Descripción del Alcance:**
  Optimizar la presentación del expediente digital en pantallas táctiles y dispositivos móviles, asegurando legibilidad, atajos por teclado y cumplimiento de pautas WCAG 2.2 AA.

  Requisitos Funcionales:
  1. Garantizar legibilidad de datos clave, estado y alertas en pantallas desde 320px de ancho.
  2. Evitar desbordamientos horizontales en tablas de expediente mediante tarjetas colapsables.
  3. Permitir navegación por pestañas y modales mediante teclado (`Tab`, `Esc`, `Enter`).
  4. Asegurar contraste de color suficiente y etiquetas `aria-*` en todos los controles interactivos.
  5. Preservar datos de formularios tras fallos de validación o pérdidas temporales de conexión.
  6. Proporcionar diálogos de confirmación claros para acciones críticas de expediente.
  7. Acompañar códigos de color con iconos y texto explicativo.
- **Criterios de Aceptación:**
  - CA-142: El expediente se consulta y opera completamente desde dispositivos móviles de 320px+.
  - CA-143: Los errores de formulario conservan la información previamente ingresada.
  - CA-144: Todos los controles del expediente responden a navegación por teclado con indicadores de foco visibles.
  - CA-145: Los estados visuales incluyen icono y texto descriptivo además del color.
- **Estado:** [X] Completado

---

===============================================================================
FASE 6. EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE
SEGUNDA PARTE: REESTRUCTURACIÓN ARQUITECTÓNICA, ESCALABILIDAD Y ADMINISTRACIÓN INTEGRAL DE MICROSERVICIOS
===============================================================================

### [X] [TAREA-F6-029] Reestructurar la arquitectura en microservicios independientes
- **Origen del Hallazgo:** F6-007 / Reestructuración arquitectónica
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Reestructuración arquitectónica)
- **Archivos Involucrados:** Todos los microservicios, `js/api.js`, `js/auth.js`, dashboards, registro central de servicios, autenticación, configuración y comunicaciones internas.
- **Descripción del Alcance:**
  Distribuir las responsabilidades del sistema entre microservicios independientes, reduciendo el acoplamiento entre áreas y permitiendo mantener, desplegar, supervisar y ampliar cada servicio sin reconstruir innecesariamente los demás.

  La reestructuración debe conservar todas las funcionalidades, variables, contratos, permisos, relaciones y flujos de trabajo existentes. No se debe considerar una migración válida si el código se ha separado, pero alguna función ha quedado desconectada, inaccesible o incompatible con los dashboards y servicios que la utilizan.

  Requisitos de implementación:
  1. Establecer una arquitectura en la que cada microservicio disponga de:
     - Proyecto y despliegue de Google Apps Script propios.
     - Configuración de ejecución independiente.
     - Identificador único e inmutable del servicio.
     - URL o punto de acceso registrado.
     - Spreadsheet propio, salvo las excepciones autorizadas para servicios agrupados.
     - Carpetas de Google Drive organizadas según sus responsabilidades.
     - Módulos de validación, autorización, diagnóstico y registro de errores.
     - Estrategia de respaldo y recuperación.
     - Versión identificable del código y del esquema de datos.
     - Contratos de comunicación autenticados con los demás componentes.

  2. Separar las funciones por responsabilidades funcionales, manteniendo las relaciones entre expedientes, usuarios, matrículas, documentos, asignaturas, evaluaciones, contabilidad, cobros y demás módulos existentes.

  3. Implementar una capa común de comunicación en `js/api.js` para que los dashboards consuman las operaciones de los servicios sin dispersar sus URLs por archivos, funciones y componentes.

  4. Centralizar el descubrimiento de servicios mediante un registro de configuración que identifique:
     - Servicio y área responsable.
     - Funciones y operaciones disponibles.
     - Endpoint de cada servicio.
     - Versión desplegada y contratos compatibles.
     - Recursos de almacenamiento asociados.
     - Permisos y roles autorizados.
     - Dependencias funcionales.
     - Estado administrativo y operativo.
     - Responsable de configuración y mantenimiento.

  5. Separar el código fuente de las configuraciones de cada despliegue. Las URLs, identificadores de hojas de cálculo, carpetas, permisos, parámetros y demás variables de entorno deben poder modificarse mediante configuración cuando corresponda, sin alterar la lógica funcional.

  6. Definir contratos de entrada y salida para las operaciones expuestas por cada servicio, incluyendo parámetros obligatorios, formatos de respuesta, errores, permisos requeridos y condiciones de ejecución.

  7. Mantener compatibilidad con las funciones existentes de expedientes, usuarios, documentos, movimientos académicos, contabilidad, autenticación, tareas, exámenes y demás módulos implementados.

  8. Evitar que el microservicio del desarrollador deba ejecutar directamente todas las operaciones institucionales. Su responsabilidad principal será administrar el registro, coordinar tareas autorizadas y supervisar los despliegues y servicios.

  9. Permitir que las operaciones independientes de cada servicio continúen funcionando cuando otro servicio o el plano de control esté temporalmente indisponible, siempre que la operación no requiera una dependencia esencial.

  10. Evitar duplicar datos institucionales compartidos por el simple hecho de que dos servicios o roles necesiten consultarlos. Cuando varias áreas requieran la misma entidad, debe definirse qué servicio es responsable de su creación y actualización y cómo los demás la consultan.

  Auditoría obligatoria durante la reestructuración:
  - Identificar las funciones públicas, privadas y compartidas de cada servicio antes de migrarlas.
  - Inventariar las variables globales, constantes, identificadores de hojas, nombres de columnas, estructuras de respuesta y dependencias utilizadas por cada función.
  - Identificar las llamadas entre funciones, los puntos de entrada de Apps Script y las operaciones invocadas por los dashboards.
  - Documentar los endpoints actuales y los nuevos, incluyendo sus parámetros, respuestas, permisos, errores y consumidores.
  - Verificar que cada función trasladada tenga un destino operativo y que no queden llamadas apuntando a implementaciones eliminadas o desactualizadas.
  - Comprobar que los nombres de funciones, acciones, parámetros y campos de respuesta continúen siendo compatibles o cuenten con adaptadores de compatibilidad explícitos.
  - Verificar cada etapa antes de continuar con la siguiente migración.
  - Comparar los resultados de las funciones antes y después del cambio utilizando los mismos casos de prueba y datos controlados.
- **Criterios de Aceptación:**
  - CA-046: Cada microservicio tiene un identificador único, configuración independiente y despliegue identificable.
  - CA-047: Cada servicio dispone del almacenamiento correspondiente, respetando las excepciones autorizadas.
  - CA-048: Los dashboards consumen las funciones mediante una capa de comunicación común.
  - CA-049: Un servicio puede actualizarse sin modificar los demás cuando sus contratos de comunicación no cambian.
  - CA-050: La caída de un servicio no bloquea automáticamente las funciones independientes.
  - CA-051: Las funciones migradas producen resultados equivalentes y conservan sus controles de acceso.
  - CA-052: El registro central identifica qué servicio atiende cada función y dónde está desplegado.
  - CA-145: La auditoría identifica las funciones, variables, bloques de código, endpoints y dependencias que deben conservarse durante cada migración.
  - CA-146: No quedan funciones existentes desconectadas, referencias obsoletas ni llamadas a endpoints inexistentes después de una etapa de migración.
  - CA-147: Los dashboards conservan la comunicación con los servicios que necesitan, sin depender de implementaciones internas que hayan sido trasladadas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-030] Crear los microservicios administrativos y financieros con separación por responsabilidades
- **Origen del Hallazgo:** F6-008 / Reestructuración de servicios
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Reestructuración de servicios)
- **Archivos Involucrados:** Dirección, Secretaría, Contabilidad, Cobros, Facturación, Recibos, Inventarios, Recursos Humanos, Planillas y módulos administrativos relacionados.
- **Descripción del Alcance:**
  A. Microservicio compartido de Dirección y Secretaría:
  Dirección y Secretaría podrán compartir un mismo microservicio y spreadsheet cuando las operaciones y los datos institucionales sean comunes, sin que esto implique conceder a ambos roles los mismos permisos.

  Requisitos funcionales:
  - Mantener un microservicio compartido para las funciones de Dirección y Secretaría.
  - Permitir que ambos roles utilicen el mismo spreadsheet cuando corresponda.
  - Crear carpetas de Drive separadas para Dirección y Secretaría.
  - Crear carpetas compartidas únicamente para documentos que deban ser accesibles a ambos roles.
  - Aplicar permisos por usuario, rol, área, módulo y operación.
  - Mantener las funciones institucionales de gestión de estudiantes, expedientes, matrículas, traslados, retiros, reingresos, graduaciones y demás procesos administrativos.
  - Evitar duplicar estudiantes, expedientes o matrículas por el hecho de que diferentes usuarios consulten o actualicen los mismos datos.
  - Permitir que una persona autorizada desempeñe simultáneamente funciones de Secretaría, Dirección u otras áreas, sin duplicar su identidad institucional.
  - Permitir que las operaciones autorizadas de Secretaría se extiendan a otras áreas, como Cobros o Facturación, cuando el usuario tenga asignadas las responsabilidades correspondientes.
  - Mantener registros de auditoría que permitan identificar al usuario, el rol o contexto operativo utilizado y la operación ejecutada.

  B. Microservicio financiero-administrativo:
  Contabilidad, Cobros, Facturación, Recibos, Inventarios, Recursos Humanos y Planillas podrán compartir un mismo microservicio, con módulos internos independientes y permisos específicos.

  Requisitos funcionales:
  1. Crear un microservicio financiero-administrativo que pueda gestionar: Contabilidad, Cobros y cuentas por cobrar, Facturación, Recibos, Cuentas por pagar, Inventarios, Bancos y conciliaciones, Recursos Humanos, Planillas y nómina, Acciones de personal, Contratos, permisos, ausencias y evaluaciones laborales, y Nuevas subáreas que se incorporen posteriormente.
  2. Organizar los módulos mediante componentes independientes, cada uno con sus operaciones, validaciones, permisos y registros.
  3. Permitir el intercambio de información cuando exista una relación funcional legítima. Por ejemplo, un cobro debe poder asociarse con su factura y recibo sin generar copias independientes e inconsistentes de la misma transacción.
  4. Mantener controles de acceso específicos por rol, área, módulo y operación. Tener acceso al microservicio no debe conceder automáticamente acceso a toda la información financiera o laboral.
  5. Separar los documentos de Recursos Humanos de los documentos contables y financieros.
  6. Evitar que los documentos laborales, las planillas y los datos financieros queden expuestos mediante carpetas raíz o permisos excesivamente amplios.
  7. Permitir que un usuario tenga responsabilidades en varias subáreas. Por ejemplo, una persona puede ser docente, contador y encargado de cafetería, con permisos diferenciados para cada función.
  8. Permitir que una secretaria autorizada realice cobros en efectivo y emita facturas sin tener que crear una segunda cuenta de usuario.
  9. Registrar cada operación con el usuario y el contexto de autorización correspondiente, sin asumir que todas las operaciones realizadas por una misma persona pertenecen a su rol principal.
  10. Permitir incorporar nuevas subáreas mediante configuración, sin reconstruir el microservicio.

  Estructura inicial de Google Drive:
  - `Administracion_Financiera/`
    - `Contabilidad/`
      - `Facturacion/`
      - `Cuentas_por_Cobrar/`
      - `Cuentas_por_Pagar/`
      - `Recibos/`
      - `Inventarios/`
      - `Bancos_y_Conciliaciones/`
      - `Reportes/`
      - `Otros_Modulos/`
    - `Recursos_Humanos/`
      - `Expedientes_Laborales/`
      - `Planillas/`
      - `Acciones_de_Personal/`
      - `Contratos/`
      - `Permisos_y_Ausencias/`
      - `Evaluaciones/`
      - `Otros_Modulos/`

  La estructura deberá generarse automáticamente al inicializar el servicio. Las nuevas subáreas se incorporarán mediante configuración, sin duplicar carpetas existentes ni reconstruir las que ya contienen documentos.
- **Criterios de Aceptación:**
  - CA-053: Dirección y Secretaría operan mediante el microservicio compartido, con permisos diferenciados y sin duplicación de entidades.
  - CA-054: Los módulos financieros y administrativos funcionan dentro del microservicio compartido con separación interna de responsabilidades.
  - CA-055: La estructura de carpetas se crea sin duplicar carpetas existentes.
  - CA-056: Cada documento queda asociado con su área y subárea.
  - CA-057: Un usuario sin autorización no puede consultar ni modificar información restringida.
  - CA-058: Facturas, cobros y recibos mantienen referencias consistentes.
  - CA-059: Las nuevas subáreas pueden incorporarse mediante configuración.
  - CA-060: La indisponibilidad de un módulo no bloquea las operaciones independientes de los demás.
  - CA-148: Un usuario con varios roles puede ejecutar operaciones autorizadas en distintas áreas desde una sola identidad institucional.
  - CA-149: Los permisos de una subárea no se extienden automáticamente a las demás.
  - CA-150: Los documentos y las transacciones conservan su trazabilidad al ser utilizados por usuarios con distintas responsabilidades.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-031] Crear una plantilla de microservicio académico reutilizable para múltiples áreas
- **Origen del Hallazgo:** F6-009 / Modularización y reutilización de código
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Modularización y reutilización)
- **Archivos Involucrados:** Servicio de tareas y exámenes, dashboards de docentes y estudiantes, configuración académica, asignación de asignaturas, gestión de usuarios y despliegues académicos.
- **Descripción del Alcance:**
  Permitir que cada área académica disponga de un microservicio independiente utilizando una misma plantilla de código, sin mantener copias adaptadas manualmente para cada área. Los nombres de las áreas, asignaturas, grados, secciones, períodos y docentes deben ser configurables.

  A. Plantilla académica genérica:
  La plantilla debe contemplar las funciones existentes y previstas de: gestión de grados y secciones, gestión de asignaturas, asignación de asignaturas a grados y secciones, matrículas y relaciones académicas de estudiantes, asignación de docentes a asignaturas, grados, secciones y períodos, gestión de tareas, exámenes y evaluaciones, publicación, edición y consulta de actividades, fechas de apertura y cierre, estados de publicación, entrega y calificación, entregas de estudiantes y archivos adjuntos cuando corresponda, calificaciones, observaciones y retroalimentación, consultas de docentes sobre sus asignaciones autorizadas, consultas de estudiantes sobre las asignaturas en las que están matriculados, validaciones de integridad y relaciones entre entidades, registros de operaciones y diagnóstico, comunicación con los servicios de usuarios, matrículas, expedientes y demás dependencias institucionales necesarias.

  B. Áreas académicas iniciales:
  Configurar, como mínimo, estas 7 áreas y asignaturas iniciales:
  - Área 1. Comunicaciones: Español, Ortografía, Caligrafía, Literatura.
  - Área 2. Inglés: Spelling, Writing, Literature, Grammar, Otras asignaturas de inglés.
  - Área 3. Ciencias Sociales: Historia de Honduras, Estudios Sociales, Sociología, Educación Cívica, Otras asignaturas relacionadas.
  - Área 4. Ciencias: Química, Biología, Ciencias Naturales, Otras asignaturas científicas.
  - Área 5. Matemáticas: Matemáticas, Geometría, Física, Otras asignaturas relacionadas.
  - Área 6. Informática: Computación, Informática I, Informática Aplicada, Análisis y Diseño, Otras asignaturas de informática.
  - Área 7. Contaduría y Finanzas: Economía, Contabilidad, Otras asignaturas relacionadas.
  No incorporar mediante condiciones `if`, `switch` ni nombres fijos dentro de la lógica de negocio.

  C. Modelo de relaciones académicas:
  - Una institución puede tener varios grados.
  - Un grado puede tener varias secciones.
  - Un grado o sección puede tener varias asignaturas.
  - Una asignatura puede impartirse en distintos grados o secciones.
  - Una asignatura puede tener docentes diferentes según el grado, sección o período.
  - Un estudiante puede estar inscrito en varias asignaturas mediante sus relaciones de matrícula.
  - Un docente puede impartir varias asignaturas y atender diferentes secciones.
  - Cada tarea o examen pertenece a una asignatura y a una asignación académica específica.
  - Cada entrega, calificación y retroalimentación queda vinculada al estudiante y actividad correctos.
  - Los cambios de grado, sección, docente o período no alteran retroactivamente las calificaciones históricas ni reasignan actividades antiguas a personas incorrectas.
  Las relaciones deben utilizar identificadores únicos e inmutables.

  D. Coordinación académica configurable:
  Permitir crear y administrar áreas de coordinación que agrupen asignaturas, docentes y responsabilidades de supervisión (ID único, nombre, descripción, estado activo/inactivo, grados/secciones/períodos aplicables, asignaturas asociadas, coordinadores, docentes supervisados, alcance de supervisión, permisos de consulta/supervisión, reportes, historial de asignaciones).

  E. Independencia de cada instancia:
  Cada instancia dispone de proyecto y despliegue de Apps Script, Spreadsheet y datos propios, configuración independiente, registros propios, permisos y límites específicos, versión identificable y carpetas de Drive propias.
- **Criterios de Aceptación:**
  - CA-061: La plantilla no contiene nombres fijos de áreas, grados, asignaturas, docentes o secciones en la lógica funcional.
  - CA-062: Se puede crear una asignatura sin modificar el código.
  - CA-063: Se pueden crear grados, secciones y asignaciones docentes sin modificar el código.
  - CA-064: Cada instancia gestiona tareas y exámenes mediante su configuración y sus propios datos.
  - CA-065: Los estudiantes solo consultan sus asignaturas, actividades, entregas y calificaciones autorizadas.
  - CA-066: Los docentes solo administran las asignaciones y grupos autorizados.
  - CA-067: Los datos de una instancia no se mezclan con los de otra.
  - CA-068: Se conservan las relaciones entre tareas, exámenes, entregas, estudiantes, docentes y asignaturas.
  - CA-069: Los cambios de configuración no modifican automáticamente los registros históricos.
  - CA-070: Las funciones existentes de tareas y exámenes continúan operativas.
  - CA-151: Las coordinaciones se pueden configurar sin modificar el código.
  - CA-152: Una coordinación puede relacionar asignaturas, docentes, grados, secciones y períodos según su alcance autorizado.
  - CA-153: Un coordinador puede tener otros roles institucionales sin duplicar su cuenta ni ampliar automáticamente sus permisos.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-032] Implementar el despliegue configurable de nuevos microservicios académicos
- **Origen del Hallazgo:** F6-010 / Automatización de despliegues
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Automatización de despliegues)
- **Archivos Involucrados:** Dashboard del desarrollador, plantilla académica, registro de servicios, configuración de Apps Script, almacenamiento y sistema de permisos.
- **Descripción del Alcance:**
  1. Incorporar en el dashboard del desarrollador una sección para administrar instancias académicas.
  2. Permitir registrar una instancia mediante un formulario (ID interno, nombre del área, descripción, plantilla y versión de código, proyecto/cuenta Apps Script destino, Spreadsheet asignado, carpetas Drive, permisos, asignaturas/grados/secciones iniciales, coordinaciones iniciales, estado de despliegue, responsable).
  3. Permitir agregar o modificar asignaturas, grados, secciones, docentes y coordinaciones desde la plataforma sin desplegar nueva versión cuando los cambios sean puramente configurativos.
  4. Flujo de inicialización idempotente: valida configuración, comprueba inexistencia previa, prepara recursos, crea estructuras/carpetas que falten, registra IDs, despliega/registra versión, ejecuta pruebas de conectividad y registra resultado.
  5. Control de estados explícitos: `Borrador`, `Pendiente de configuración`, `Preparando recursos`, `Desplegando`, `Validando`, `Activo`, `Con errores`, `Suspendido`, `Retirado`.
  6. Si un paso falla, registra el error y permite reanudar el proceso sin duplicar estructuras.
  7. Si requiere autorización Google OAuth manual, indica el paso pendiente sin marcar erróneamente como exitoso.
  8. Permitir actualizar una instancia sin modificar otras.
  9. Historial de versiones de plantilla asociadas a cada instancia.
  10. Permitir intervenciones del propietario de la cuenta cuando Google requiera autorización sin guardar credenciales en el código.
  11. Auditar creación, actualización, suspensión y retirada de instancias (solicitante, fecha, resultado).
- **Criterios de Aceptación:**
  - CA-071: Se puede registrar una nueva área académica desde el dashboard.
  - CA-072: La creación no requiere editar nombres de áreas o asignaturas en el código.
  - CA-073: Cada instancia recibe y registra sus propios recursos.
  - CA-074: La inicialización es idempotente.
  - CA-075: Los fallos dejan un estado y diagnóstico verificables.
  - CA-076: Una instancia incompleta no aparece como activa.
  - CA-077: Los cambios exclusivamente configurativos no requieren un nuevo despliegue.
  - CA-078: Las actualizaciones de plantilla no modifican automáticamente todas las instancias.
  - CA-079: Se registra quién solicitó una operación, cuándo se ejecutó y cuál fue el resultado.
  - CA-154: La creación de una instancia permite definir sus coordinaciones y asignaciones iniciales sin modificar la plantilla.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-033] Crear el microservicio central del desarrollador y el registro de servicios
- **Origen del Hallazgo:** F6-011 / Administración y supervisión centralizada
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Plano de control central)
- **Archivos Involucrados:** Microservicio del desarrollador, dashboard del desarrollador, registro central y todos los servicios registrados.
- **Descripción del Alcance:**
  A. Registro central de servicios:
  Mantener un registro con ID único, nombre, tipo, área, estado administrativo, último estado operativo, proyecto y despliegue asociado, versión de código y esquema, fecha de creación/actualización, último contacto, URL/referencia de conexión, recursos asociados, operaciones, roles/permisos, dependencias, responsable, configuración, último diagnóstico y último error.

  B. Contrato común de comunicación:
  Contrato común con `correlationId`, registro de origen/destino/operación/hora/resultado, diferenciación de errores, timeouts, prevención de reintentos ilimitados, separación de operaciones administrativas e imposición de catálogo de comandos autorizados.

  C. Administración de roles y responsabilidades:
  Administrar usuarios con múltiples roles simultáneos, asignaciones por área/subárea, permisos por servicio/módulo/operación, coordinadores vinculados, vigencia, activación/suspensión/revocación e historial de cambios. Validado en backend por cada servicio.

  D. Independencia del plano de control:
  El microservicio del desarrollador administra el registro y supervisa despliegues. Si queda fuera de línea, los servicios operativos independientes continúan operando.
- **Criterios de Aceptación:**
  - CA-080: El dashboard presenta los servicios registrados y sus configuraciones.
  - CA-081: Cada servicio se identifica mediante un identificador estable.
  - CA-082: Se diferencia el estado administrativo del último estado operativo.
  - CA-083: Se identifica cuándo un estado está desactualizado.
  - CA-084: Las solicitudes de diagnóstico incluyen identificador de correlación y resultado.
  - CA-085: Se diferencian los errores de ejecución de los errores de comunicación.
  - CA-086: La indisponibilidad del servicio central no detiene automáticamente las operaciones independientes.
  - CA-087: No se permite ejecutar código arbitrario mediante comandos administrativos.
  - CA-155: El registro permite administrar usuarios con múltiples roles y responsabilidades sin duplicar sus identidades.
  - CA-156: Los roles pueden relacionarse con áreas, subáreas, coordinaciones y servicios.
  - CA-157: Los cambios de asignaciones y permisos quedan auditados y se aplican mediante validaciones del servidor.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-034] Implementar módulos de salud, diagnóstico, tráfico y errores en cada microservicio
- **Origen del Hallazgo:** F6-012 / Observabilidad y mantenimiento preventivo
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Observabilidad y diagnóstico)
- **Archivos Involucrados:** Todos los microservicios y dashboard del desarrollador.
- **Descripción del Alcance:**
  A. Estado del servicio:
  Operaciones de diagnóstico en cada servicio que comprueben disponibilidad del endpoint, integridad de configuración, acceso a Sheets y Drive, dependencias, correspondencia de versión, errores recientes, última comprobación y operaciones pendientes.

  B. Diagnóstico funcional:
  Pruebas de lectura y pruebas controladas de escritura sin alterar datos reales, comprobación de integridad y contratos API sin revelar PII o credenciales.

  C. Métricas de tráfico y rendimiento:
  Registro de solicitudes totales, éxitos/fallos, latencia ms, errores por categoría, reintentos y consumo de ejecuciones GAS con fecha de actualización.

  D. Registro de errores:
  Enriquecimiento de errores con `eventId`, servicio, módulo, operación, timestamp, severidad, `correlationId`, versión, resultado y estado de resolución. Sanitización obligatoria.

  E. Dashboard de supervisión:
  Consulta general, filtros multi-servicio, historial de disponibilidad, diagnóstico en vivo y mapa de dependencias afectadas.
- **Criterios de Aceptación:**
  - CA-088: Todos los microservicios implementan el contrato común de diagnóstico.
  - CA-089: El desarrollador consulta el estado desde el dashboard.
  - CA-090: El diagnóstico diferencia conectividad, acceso a datos, acceso a documentos y fallos funcionales.
  - CA-091: Los errores pueden filtrarse por servicio, módulo, fecha, severidad y categoría.
  - CA-092: Cada error relevante se relaciona con su operación y versión cuando esa información esté disponible.
  - CA-093: Las métricas incluyen fecha de actualización y no inventan valores.
  - CA-094: Los registros no exponen credenciales ni documentos completos.
  - CA-095: Un error de supervisión no altera los datos operativos ni bloquea las funciones principales.
  - CA-158: El diagnóstico identifica endpoints faltantes, contratos incompatibles y dependencias que impiden completar operaciones.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-035] Incorporar administración segura de logs y comandos operativos
- **Origen del Hallazgo:** F6-013 / Herramientas de mantenimiento
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Herramientas de mantenimiento)
- **Archivos Involucrados:** Dashboard del desarrollador y módulos de supervisión.
- **Descripción del Alcance:**
  - Consulta y filtrado de logs multi-servicio desde el dashboard central.
  - Marcado de errores como revisados/resueltos conservando historial de auditoría.
  - Purgas y archivos seguros de registros temporales conservando logs protegidos inmutables.
  - Catálogo cerrado de comandos permitidos (diagnóstico, almacenamiento, respaldos, purga de temporales). Prohibida ejecución de cadenas o código libre.
  - Cola de operaciones administrativas asíncronas con cancelación e idempotencia.
  - Permisos específicos por comando.
- **Criterios de Aceptación:**
  - CA-096: El desarrollador consulta y filtra logs desde el dashboard.
  - CA-097: Las acciones de limpieza requieren autorización y confirmación.
  - CA-098: La limpieza no elimina registros de auditoría protegidos.
  - CA-099: Los comandos pertenecen a un catálogo permitido.
  - CA-100: Cada operación registra solicitante, servicio, fecha, resultado y error cuando corresponda.
  - CA-101: Las operaciones pendientes, fallidas y completadas se distinguen.
  - CA-102: Repetir una solicitud no duplica efectos cuando se requiere idempotencia.
  - CA-159: Los comandos administrativos aplican permisos específicos por operación y no se autorizan únicamente por el rol general del usuario.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-036] Implementar respaldos independientes y recuperación por área
- **Origen del Hallazgo:** F6-014 / Continuidad operativa y recuperación de datos
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Respaldos aislados y restauración)
- **Archivos Involucrados:** Todos los microservicios, Google Sheets, Google Drive y dashboard del desarrollador.
- **Descripción del Alcance:**
  A. Respaldos por servicio:
  Generar y programar respaldos aislados por microservicio (Sheets, Drive, configuraciones y metadatos) con checksum de verificación y registro en catálogo central.

  B. Estrategia de almacenamiento:
  Almacenamiento aislado de respaldos, políticas de retención y rotación, detección de copias corruptas o alteradas.

  C. Recuperación:
  Proceso de restauración por área con vista previa de impacto, verificación de integridad referencial, confirmación explícita y simulación en entorno aislado sin afectar otros servicios.

  D. Control de capacidad:
  Supervisión preventiva del volumen de respaldos y políticas de depuración de copias obsoletas.
- **Criterios de Aceptación:**
  - CA-103: Se puede solicitar un respaldo individual por microservicio.
  - CA-104: Los respaldos quedan registrados con identificador, fecha, alcance y resultado.
  - CA-105: Se detectan respaldos incompletos o cuya integridad no puede verificarse.
  - CA-106: Restaurar un servicio no sobrescribe datos de otro.
  - CA-107: Las restauraciones destructivas muestran su alcance y solicitan confirmación.
  - CA-108: Se pueden probar restauraciones sin modificar producción.
  - CA-109: Las restauraciones registran sus resultados y verificaciones.
  - CA-110: Existe una política configurable de retención y rotación.
  - CA-111: Se identifican problemas de capacidad y acumulación cuando existan mediciones fiables.
  - CA-112: El procedimiento de recuperación está documentado y no depende de instrucciones manuales conocidas por una sola persona.
  - CA-160: La restauración conserva las relaciones necesarias entre usuarios, roles, áreas, documentos y datos operativos del servicio recuperado.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-037] Establecer seguridad, aislamiento y gestión centralizada de permisos
- **Origen del Hallazgo:** F6-015 / Seguridad y control de acceso
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Seguridad, identidad única y RBAC/ABAC)
- **Archivos Involucrados:** Todos los microservicios, dashboards, autenticación, registro de servicios y comunicaciones internas.
- **Descripción del Alcance:**
  A. Identidad y roles múltiples:
  Identidad institucional única por persona con asignaciones flexibles de múltiples roles simultáneos por servicio, área, subárea o módulo.

  B. Modelo de autorización:
  Matriz de permisos para todos los perfiles institucionales (Dirección, Secretaría, Contabilidad, Cobros, Facturación, RRHH, Docentes, Estudiantes, Coordinadores, Desarrolladores).

  C. Coordinaciones y áreas personalizables:
  Creación y edición de coordinaciones con alcance acotado de supervisión por área, asignatura, grado o sección.

  D. Seguridad de los servicios:
  Validación obligatoria de autenticación y autorización en el servidor de cada microservicio. Protección contra IDOR, elevación de privilegios y almacenamiento de secretos en el frontend.
- **Criterios de Aceptación:**
  - CA-113: Cada microservicio valida autorizaciones del lado del servidor.
  - CA-114: La autorización en un servicio no se hereda automáticamente por los demás.
  - CA-115: No se puede acceder a documentos o registros ajenos manipulando identificadores.
  - CA-116: Los secretos no se exponen en el frontend ni en logs.
  - CA-117: Los comandos administrativos requieren permisos específicos.
  - CA-118: Los cambios de acceso y las operaciones sensibles quedan auditados.
  - CA-119: Se puede revocar el acceso a un servicio sin invalidar innecesariamente accesos independientes.
  - CA-120: Las pruebas de seguridad incluyen intentos de acceso no autorizado desde el navegador y mediante solicitudes directas al backend.
  - CA-161: Un usuario puede tener varios roles sin duplicar su identidad institucional.
  - CA-162: Los permisos se pueden asignar y revocar por área, subárea, servicio, módulo y operación.
  - CA-163: Las coordinaciones pueden relacionarse con asignaturas, docentes supervisados y responsables autorizados.
  - CA-164: Los cambios de roles y responsabilidades no conceden privilegios implícitos en áreas ajenas.
  - CA-165: La autorización se comprueba en cada operación protegida y no depende únicamente del rol seleccionado visualmente en el dashboard.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-038] Implementar despliegues versionados, migraciones y reversión controlada
- **Origen del Hallazgo:** F6-016 / Mantenimiento y evolución del sistema
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Versionado y reversión)
- **Archivos Involucrados:** Todos los microservicios, plantillas de código y dashboard del desarrollador.
- **Descripción del Alcance:**
  - Versionado explícito de código, esquemas y configuraciones por microservicio.
  - Registro de cambios (changelog) y contratos de compatibilidad.
  - Verificación de dependencias y pruebas automáticas post-despliegue.
  - Migraciones de datos idempotentes y no destructivas.
  - Procedimiento de reversión (rollback) probado para código, esquemas y datos.
  - Auditoría de impacto previa a cada despliegue.
- **Criterios de Aceptación:**
  - CA-121: Cada servicio identifica su versión de código y esquema.
  - CA-122: Un despliegue fallido no se registra como satisfactorio.
  - CA-123: Las migraciones validan su alcance antes de modificar datos.
  - CA-124: Repetir una migración no duplica registros ni estructuras.
  - CA-125: Las actualizaciones de una instancia no alteran otras.
  - CA-126: Se identifica la versión activa cuando ocurre un error.
  - CA-127: Existe un procedimiento probado para recuperar el servicio después de una actualización fallida.
  - CA-128: Las actualizaciones conservan permisos y relaciones existentes.
  - CA-166: Cada actualización incluye una auditoría de impacto sobre funciones, variables, endpoints, dashboards y dependencias.
  - CA-167: Las migraciones preservan las asignaciones de roles, las relaciones académicas y las referencias entre servicios.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-039] Centralizar la configuración y las dependencias sin centralizar todos los datos
- **Origen del Hallazgo:** F6-017 / Configuración e interoperabilidad
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Configuración e interoperabilidad)
- **Archivos Involucrados:** Registro de servicios, microservicio del desarrollador, autenticación, dashboards y servicios operativos.
- **Descripción del Alcance:**
  - Registro centralizado de configuraciones, endpoints y referencias de almacenamiento.
  - Descentralización de los datos operativos en sus respectivos microservicios.
  - Modificación de URLs y parámetros mediante configuración sin editar código.
  - Versionado de cambios de configuración y retiro controlado de servicios descontinuados.
  - Catálogo central de contratos API y detección de llamadas obsoletas.
- **Criterios de Aceptación:**
  - CA-129: Cada servicio tiene configuración registrada y verificable.
  - CA-130: Las dependencias se consultan desde el dashboard.
  - CA-131: Las configuraciones incompletas se detectan antes de activar una instancia.
  - CA-132: Los cambios de configuración quedan registrados y auditables.
  - CA-133: La retirada de un servicio no deja referencias activas sin identificar.
  - CA-134: Los dashboards distinguen entre indisponibilidad y ausencia de datos.
  - CA-135: Se identifican las funciones disponibles cuando falla una dependencia.
  - CA-168: Los endpoints y sus contratos pueden consultarse en un registro central actualizado.
  - CA-169: Los cambios de roles, áreas y coordinaciones se reflejan en los servicios autorizados sin exigir modificaciones manuales dispersas en los dashboards.
- **Estado:** [X] Completado

---

### [X] [TAREA-F6-040] Validar el rendimiento, la capacidad y la recuperación de la arquitectura completa
- **Origen del Hallazgo:** F6-018 / Pruebas de integración y escalabilidad
- **Prioridad:** P1
- **Estado:** [X] Completado
- **Severidad/Clasificación:** Alta (Pruebas de carga e integración)
- **Archivos Involucrados:** Todos los microservicios, dashboards, Google Apps Script, Google Sheets y Google Drive.
- **Descripción del Alcance:**
  - Pruebas integrales multi-servicio que evalúen carga, concurrencia, resiliencia y tolerancia a fallos.
  - Verificación de idempotencia ante reintentos de red.
  - Medición de latencia, tiempos de ejecución y cuotas GAS.
  - Verificación end-to-end de usuarios con múltiples roles y permisos contextuales.
  - Confirmación de que las funciones de los dashboards continúan operando correctamente tras las migraciones.
- **Criterios de Aceptación:**
  - CA-136: Se incorpora una nueva instancia académica sin modificar las existentes.
  - CA-137: La interrupción de un servicio no bloquea automáticamente operaciones independientes.
  - CA-138: Los fallos de comunicación y almacenamiento quedan registrados y pueden diagnosticarse.
  - CA-139: Los reintentos no generan duplicados en las operaciones que requieren idempotencia.
  - CA-140: Se verifica la integridad de datos y documentos antes y después de una recuperación.
  - CA-141: Las métricas de rendimiento provienen de pruebas reproducibles.
  - CA-142: Se identifican los límites operativos conocidos antes de que provoquen fallos recurrentes, cuando existen datos suficientes.
  - CA-143: Las funciones existentes se verifican después de la migración.
  - CA-144: No se considera completada la fase mientras existan errores críticos de integridad, seguridad o recuperación sin resolver.
  - CA-170: Las pruebas verifican que un usuario puede ejercer varios roles autorizados desde una identidad institucional única.
  - CA-171: Las pruebas verifican que cada rol conserva sus permisos específicos y no hereda privilegios indebidos.
  - CA-172: Los flujos que involucran varios servicios y dashboards mantienen la comunicación, las relaciones de datos y los permisos.
  - CA-173: Los cambios de configuración, despliegue o asignación de responsabilidades no dejan funciones existentes inaccesibles.
- **Estado:** [X] Completado


===============================================================================
FASE 7. PLANIFICACIÓN ACADÉMICA, HORARIOS Y RECURSOS
===============================================================================

### [X] [TAREA-F7-IMP-01] Ampliar la validación integral de horarios y asignaciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-01 (P1 · Fortalecimiento de Validaciones)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación funcional y fortalecimiento de validaciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `checkScheduleConflict`, `createClassSchedule`, `getTeacherTeachingLoad`, `HorariosClase`, `CalendarioAcademico`, `HorariosLaborales`, `SedesAulas`
- **Descripción del Alcance:**
  Consolidar las reglas de validación aplicables a las asignaciones académicas, considerando las relaciones entre horarios, disponibilidad, períodos académicos, evaluaciones, recursos y reglas institucionales antes de crear, modificar, importar o publicar una asignación.

  Requisitos Funcionales:
  1. Consolidar las reglas de validación aplicables a las asignaciones académicas, sin duplicar innecesariamente las comprobaciones existentes.
  2. Evaluar las restricciones pertinentes antes de crear, modificar, importar o publicar una asignación.
  3. Distinguir entre:
     - Conflictos que impiden guardar o publicar.
     - Advertencias que permiten continuar con autorización.
     - Preferencias de planificación que pueden incumplirse sin invalidar la operación.
     - Errores de configuración que impiden evaluar correctamente una asignación.
  4. Detectar superposiciones horarias exactas y parciales.
  5. Considerar las fechas efectivas de las actividades, las excepciones del calendario y los períodos académicos aplicables.
  6. Validar la disponibilidad del docente, el aula y los recursos requeridos.
  7. Comprobar las restricciones de las secciones y los grupos involucrados.
  8. Identificar incompatibilidades entre clases, evaluaciones y otras actividades cuando compartan participantes o recursos exclusivos.
  9. Ejecutar las validaciones sobre el estado actualizado de los datos, no exclusivamente sobre información previamente cargada en la interfaz.
  10. Devolver resultados estructurados que permitan identificar las asignaciones afectadas y la regla incumplida.
  11. Evitar que la creación o modificación de un horario deje el sistema en un estado inconsistente si una validación o escritura falla.
  12. Conservar las excepciones legítimas que estén expresamente configuradas, sin convertir todas las coincidencias horarias en errores.
- **Criterios de Aceptación:**
  - CA-F7-01: Una asignación incompatible con una restricción obligatoria no puede confirmarse.
  - CA-F7-02: Una coincidencia permitida por una excepción explícita se acepta y conserva la justificación correspondiente.
  - CA-F7-03: Los intervalos parcialmente superpuestos se detectan correctamente.
  - CA-F7-04: Los intervalos consecutivos que no se superponen se aceptan, salvo que exista otra restricción aplicable.
  - CA-F7-05: Las modificaciones se validan considerando tanto el horario anterior como el nuevo, sin generar conflictos artificiales con el registro que se está actualizando.
  - CA-F7-06: Los errores identifican el recurso, docente, grupo o actividad implicados.
  - CA-F7-07: Una operación fallida no deja asignaciones parcialmente actualizadas.
  - CA-F7-08: Las reglas existentes que funcionan correctamente siguen superando sus pruebas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-02] Implementar una matriz visual de planificación y disponibilidad
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-02 (P1 · Interfaz de Planificación)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de interfaz y herramientas de planificación)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `js/teacher.js`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `getClassSchedules`, `getClassroomResources`, `getTeacherAssignments`, `HorariosClase`, `SedesAulas`
- **Descripción del Alcance:**
  Incorporar una herramienta integral de visualización que permita comparar la disponibilidad de docentes, secciones, asignaturas, aulas y recursos para tomar decisiones de planificación desde una misma matriz unificada.

  Requisitos Funcionales:
  1. Incorporar una vista de planificación que permita alternar entre:
     - Horario institucional.
     - Horario por docente.
     - Horario por sección.
     - Horario por asignatura.
     - Ocupación por aula.
     - Disponibilidad por recurso.
  2. Permitir filtrar por año lectivo, período académico, jornada, sede, grado, sección y estado de publicación.
  3. Mostrar, para cada asignación, la información pertinente: asignatura, sección/grupo, docente, aula, día y horario, período académico y estado de la asignación.
  4. Diferenciar visualmente las clases confirmadas, los borradores, las actividades canceladas y los conflictos pendientes.
  5. Mostrar los intervalos disponibles y ocupados.
  6. Permitir seleccionar un bloque para consultar sus detalles y ejecutar las acciones autorizadas.
  7. Permitir identificar la disponibilidad simultánea de los recursos necesarios para una nueva clase.
  8. Actualizar los resultados después de guardar, modificar o cancelar una asignación.
  9. Proporcionar estados vacíos y mensajes claros cuando no existan resultados para los filtros seleccionados.
  10. Mantener la interfaz utilizable en pantallas de escritorio, tabletas y dispositivos móviles.
  11. Facilitar la impresión o exportación de las vistas cuando corresponda.
  12. Respetar los permisos de consulta y modificación del usuario.
- **Criterios de Aceptación:**
  - CA-F7-09: Un coordinador puede consultar la ocupación de un aula para un intervalo determinado.
  - CA-F7-10: Puede identificar los horarios de un docente y de una sección sin consultar manualmente cada registro.
  - CA-F7-11: Los filtros combinados devuelven únicamente los registros que cumplen las condiciones seleccionadas.
  - CA-F7-12: Una asignación cancelada deja de mostrarse como vigente, aunque pueda seguir disponible en el historial.
  - CA-F7-13: Una modificación confirmada se refleja en todas las vistas pertinentes.
  - CA-F7-14: Los usuarios sin permiso de modificación no pueden alterar los horarios desde esta interfaz.
  - CA-F7-15: Las consultas no muestran información de períodos o grupos ajenos al ámbito autorizado.
  - CA-F7-16: La vista funciona con horarios extensos sin bloquear la interacción ni ocultar información esencial.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-03] Desarrollar una herramienta de resolución asistida de conflictos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-03 (P1 · Optimización de Horarios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Nueva capacidad de planificación y optimización)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `checkScheduleConflict`, `getClassSchedules`, `getTeacherTeachingLoad`, `getClassroomResources`, `F7-IMP-01`, `F7-IMP-02`
- **Descripción del Alcance:**
  Implementar un mecanismo integral de resolución asistida que agrupe conflictos, proporcione explicaciones claras y evalúe alternativas válidas (cambio de horario, sustituto disponible, aula alternativa, reprogramación) permitiendo comparar sus consecuencias antes de aplicar cambios oficiales.

  Requisitos Funcionales:
  1. Mostrar los conflictos agrupados por docente, aula, sección, recurso y actividad.
  2. Identificar todas las asignaciones que participan en un mismo conflicto.
  3. Explicar qué regla se incumple y qué intervalo produce la incompatibilidad.
  4. Proponer alternativas válidas, cuando existan: cambiar el horario, utilizar otro docente disponible, seleccionar otra aula compatible, reasignar el recurso, reprogramar la actividad.
  5. Comprobar que cada alternativa propuesta satisface las restricciones obligatorias.
  6. Mostrar las consecuencias de cada alternativa sobre las asignaciones relacionadas.
  7. Permitir comparar alternativas sin modificar todavía los datos oficiales.
  8. Exigir confirmación antes de aplicar cambios que afecten a otras asignaciones o usuarios.
  9. Volver a validar la alternativa seleccionada inmediatamente antes de guardarla.
  10. Identificar los casos en que no exista una solución válida y explicar las restricciones que lo impiden.
  11. Registrar la resolución seleccionada y los cambios efectivamente aplicados.
  12. Permitir que el usuario descarte una propuesta sin alterar la planificación existente.
- **Criterios de Aceptación:**
  - CA-F7-17: Ante un conflicto docente, el sistema puede mostrar intervalos alternativos que respeten su disponibilidad.
  - CA-F7-18: Las alternativas que producen otros conflictos obligatorios se descartan o se identifican explícitamente como inválidas.
  - CA-F7-19: Una propuesta no modifica los datos oficiales antes de su confirmación.
  - CA-F7-20: Si los datos cambian mientras se evalúa una alternativa, el sistema vuelve a validarla.
  - CA-F7-21: La confirmación aplica únicamente los cambios seleccionados.
  - CA-F7-22: Si la operación falla, no quedan modificaciones parciales.
  - CA-F7-23: Si no existe una alternativa válida, el sistema lo comunica sin presentar una solución incorrecta como aceptable.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-04] Incorporar planificación masiva y optimización de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-04 (P2 · Planificación Masiva)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva herramienta de planificación avanzada)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `publishClassSchedules`, `checkScheduleConflict`, `F7-IMP-01`, `F7-IMP-02`, `F7-IMP-03`
- **Descripción del Alcance:**
  Desarrollar un entorno de escenarios de planificación masiva en borrador que permita generar, reorganizar y optimizar conjuntos completos de horarios respetando restricciones obligatorias (disponibilidad docente, exclusividad de aula, jornadas) y evaluando preferencias configurables sin alterar el horario oficial hasta su publicación explícita.

  Requisitos Funcionales:
  1. Permitir preparar un escenario de planificación sin modificar el horario oficial.
  2. Incorporar las clases, asignaturas, secciones, docentes, aulas y períodos que participarán en el escenario.
  3. Utilizar como restricciones obligatorias: disponibilidad docente, exclusividad de aulas y recursos, compatibilidad de jornadas, disponibilidad de las secciones, duración de las clases, restricciones académicas configuradas.
  4. Permitir establecer preferencias, cuando sean pertinentes: reducir períodos libres innecesarios, distribuir la carga docente, evitar concentraciones de clases o evaluaciones, favorecer uso eficiente de aulas, respetar preferencias docentes autorizadas.
  5. Diferenciar las restricciones obligatorias de las preferencias optimizables.
  6. Permitir comparar el escenario propuesto con el horario actual.
  7. Mostrar las asignaciones que no pudieron ubicarse y las razones identificadas.
  8. Permitir bloquear asignaciones que no deban cambiar durante una reorganización.
  9. Recalcular las asignaciones afectadas cuando cambie una restricción.
  10. Permitir guardar un escenario como borrador y retomarlo posteriormente.
  11. Exigir validación y confirmación antes de publicar el resultado.
  12. Registrar los cambios introducidos al aplicar un escenario.
- **Criterios de Aceptación:**
  - CA-F7-24: La generación de un escenario no modifica el horario oficial.
  - CA-F7-25: Ningún escenario puede publicarse si contiene conflictos obligatorios no resueltos.
  - CA-F7-26: Las asignaciones bloqueadas se conservan durante la reorganización.
  - CA-F7-27: Las restricciones imposibles de satisfacer se identifican de forma explícita.
  - CA-F7-28: Las preferencias no sustituyen a las restricciones obligatorias.
  - CA-F7-29: El sistema permite comparar la carga docente y la utilización de recursos antes y después.
  - CA-F7-30: Una ejecución fallida no destruye el escenario anterior ni el horario oficial.
  - CA-F7-31: La publicación requiere una confirmación explícita y una validación final.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-05] Ampliar el control de carga laboral y las preferencias docentes
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-05 (P1 · Carga Docente)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de reglas académicas y laborales)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getTeacherTeachingLoad`, `HorariosLaborales`, `HorariosClase`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Parametrizar de forma configurable los límites de carga laboral docente por contrato, jornada o política institucional (separando horas lectivas de actividades adicionales), e integrar el cálculo dinámico y el registro de preferencias autorizadas en la matriz de planificación.

  Requisitos Funcionales:
  1. Identificar y separar las reglas de carga obligatoria de las preferencias de distribución.
  2. Permitir configurar límites aplicables a cada docente según las políticas institucionales.
  3. Considerar: horas lectivas semanales, cantidad de sesiones, duración de las clases, límites diarios, períodos consecutivos, descansos mínimos, jornadas autorizadas, disponibilidad parcial, responsabilidades adicionales.
  4. Evitar que las clases recurrentes se contabilicen varias veces en el cálculo semanal.
  5. Diferenciar las horas lectivas de las actividades adicionales cuando la institución las contabilice por separado.
  6. Mostrar la carga total, el límite aplicable y la distribución por día.
  7. Identificar las asignaciones que provocan un exceso de carga.
  8. Permitir registrar preferencias de horario cuando estén autorizadas y sean compatibles con las reglas obligatorias.
  9. Actualizar los cálculos después de modificar una asignación.
  10. Conservar el historial de las reglas aplicadas cuando sea necesario explicar una planificación anterior.
- **Criterios de Aceptación:**
  - CA-F7-32: Los límites se aplican según la configuración efectiva y no mediante un valor global arbitrario.
  - CA-F7-33: Una modificación de horario actualiza la carga del docente afectado.
  - CA-F7-34: Las clases recurrentes se contabilizan de acuerdo con su frecuencia real.
  - CA-F7-35: Los períodos libres no se contabilizan como horas lectivas.
  - CA-F7-36: El sistema identifica excesos de carga y explica qué asignaciones los producen.
  - CA-F7-37: Las preferencias docentes no permiten incumplir restricciones obligatorias.
  - CA-F7-38: Si no existe una política definida para una regla, el sistema no inventa un límite institucional.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-06] Ampliar la gestión de disponibilidad, equipamiento y capacidad de espacios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-06 (P1 · Gestión de Espacios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de recursos compartidos)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `SedesAulas`, `getClassroomResources`, `saveClassroomResource`, `RecursosReutilizables`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Ampliación de la gestión de aulas y espacios físicos para incluir requerimientos de equipamiento específico, períodos temporales de mantenimiento e indisponibilidad, y comparación entre la capacidad real del espacio y la matrícula efectiva de la sección.

  Requisitos Funcionales:
  1. Permitir registrar las características de cada espacio relevantes para la planificación.
  2. Representar la capacidad máxima y los requisitos de equipamiento cuando sean aplicables.
  3. Identificar los recursos compartidos que pueden utilizarse simultáneamente y aquellos que requieren exclusividad.
  4. Registrar intervalos de indisponibilidad por mantenimiento, reparación u otras causas.
  5. Evitar nuevas asignaciones dentro de intervalos de indisponibilidad.
  6. Detectar las clases futuras afectadas cuando un aula o recurso deje de estar disponible.
  7. Permitir consultar la ocupación por día, semana, período académico y recurso.
  8. Permitir identificar espacios alternativos que satisfagan las restricciones de una actividad.
  9. Distinguir entre espacios activos, temporalmente indisponibles e inactivos.
  10. Evitar que la desactivación de un recurso elimine su historial de utilización.
  11. Integrar la disponibilidad de los recursos con la validación de horarios.
  12. Evitar que la capacidad de un aula se confunda con la matrícula efectiva de una sección.
- **Criterios de Aceptación:**
  - CA-F7-39: Un aula indisponible no puede asignarse a una nueva actividad dentro del intervalo restringido.
  - CA-F7-40: Una actividad que requiere equipamiento específico no se asigna a un espacio incompatible.
  - CA-F7-41: Una restricción nueva identifica las asignaciones futuras afectadas.
  - CA-F7-42: El sistema permite consultar las reservas existentes y sus intervalos.
  - CA-F7-43: La desactivación de un aula no elimina las referencias históricas.
  - CA-F7-44: Las reglas de capacidad solo se aplican cuando existe información suficiente y una política definida.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-07] Fortalecer la programación de evaluaciones y la prevención de sobrecargas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-07 (P1 · Programación de Evaluaciones)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de planificación evaluativa)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CalendarioAcademico`, `checkScheduleConflict`, `createCalendarEvent`, `Examenes`
- **Descripción del Alcance:**
  Establecer reglas configurables para la programación de evaluaciones (exámenes parciales, recuperaciones) que controlen la sobrecarga diaria de exámenes por sección, días no lectivos, disponibilidad de aulas y la simulación pre-confirmación de reprogramaciones.

  Requisitos Funcionales:
  1. Permitir configurar las restricciones institucionales aplicables a las evaluaciones.
  2. Comprobar las coincidencias de evaluaciones para una misma sección o grupo.
  3. Detectar conflictos de docentes, aulas y recursos.
  4. Permitir definir límites de evaluaciones por día o intervalo, si la institución los establece.
  5. Permitir definir períodos de separación entre evaluaciones cuando corresponda.
  6. Considerar las fechas de vacaciones, suspensiones y días no lectivos.
  7. Diferenciar exámenes ordinarios, recuperaciones y otras actividades evaluativas.
  8. Permitir simular cambios de fecha antes de confirmarlos.
  9. Identificar a los estudiantes o grupos afectados cuando exista información suficiente.
  10. Conservar los resultados y calificaciones históricos al modificar la programación.
  11. Propagar los cambios a los calendarios y vistas pertinentes.
  12. Evitar que las reglas nuevas contradigan las configuraciones académicas existentes.
- **Criterios de Aceptación:**
  - CA-F7-45: Las evaluaciones incompatibles se identifican antes de su confirmación.
  - CA-F7-46: Los límites diarios se aplican únicamente cuando están configurados.
  - CA-F7-47: Una reprogramación actualiza la fecha efectiva sin duplicar la evaluación.
  - CA-F7-48: Las calificaciones y los registros históricos permanecen vinculados a la evaluación correcta.
  - CA-F7-49: Los días no lectivos se respetan conforme a las reglas institucionales.
  - CA-F7-50: Los conflictos resultantes de una reprogramación se muestran antes de confirmar los cambios.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-08] Ampliar las excepciones del calendario y la gestión de sesiones
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-08 (P1 · Excepciones del Calendario)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación funcional del calendario académico)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CalendarioAcademico`, `getAcademicCalendar`, `createCalendarEvent`, `HorariosClase`
- **Descripción del Alcance:**
  Implementar el control de excepciones para sesiones individuales dentro de series de horarios recurrentes, permitiendo cancelaciones o reprogramaciones puntuales sin alterar la serie completa ni duplicar eventos en el calendario.

  Requisitos Funcionales:
  1. Diferenciar eventos institucionales, eventos académicos, sesiones de clase y excepciones de una sesión.
  2. Permitir cancelar o reprogramar una sesión sin alterar las demás sesiones recurrentes.
  3. Permitir modificar una serie completa cuando el usuario lo seleccione expresamente.
  4. Identificar las sesiones afectadas por vacaciones, suspensiones y cambios del calendario.
  5. Diferenciar un día no lectivo de un día en el que una actividad concreta ha sido cancelada.
  6. Registrar las reprogramaciones y mantener la referencia a la sesión original.
  7. Evitar duplicaciones al recalcular las sesiones recurrentes.
  8. Permitir consultar las sesiones originales y sus excepciones.
  9. Actualizar la disponibilidad de aulas y docentes cuando se cancele o reprograma una sesión.
  10. Conservar los registros de asistencia y evaluación asociados a sesiones pasadas.
- **Criterios de Aceptación:**
  - CA-F7-51: Cambiar una sesión individual no altera las demás sesiones recurrentes.
  - CA-F7-52: Cambiar una serie afecta únicamente las sesiones incluidas en la operación confirmada.
  - CA-F7-53: Cancelar una sesión libera los recursos correspondientes.
  - CA-F7-54: Las sesiones pasadas conservan sus registros históricos.
  - CA-F7-55: Una excepción no produce dos sesiones activas para el mismo evento.
  - CA-F7-56: Los calendarios muestran la fecha efectiva y permiten identificar una reprogramación.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-09] Desarrollar versiones de horarios, comparación y restauración controlada
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-09 (P2 · Control de Versiones de Horario)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva capacidad de control de cambios)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `HorariosClase`, `publishClassSchedules`, `HistorialCambiosEntidad`, `F7-IMP-01`, `F7-IMP-08`
- **Descripción del Alcance:**
  Implementar el control de versiones de la matriz de horarios publicados con herramientas de comparación visual (diff), guardado de borradores no publicados y restauración controlada con re-validación de conflictos.

  Requisitos Funcionales:
  1. Registrar las versiones relevantes de un horario publicado.
  2. Identificar quién realizó cada cambio y cuándo.
  3. Mostrar las diferencias entre dos versiones.
  4. Identificar asignaciones nuevas, modificadas, canceladas y restauradas.
  5. Conservar el motivo del cambio cuando sea requerido por el flujo.
  6. Permitir guardar borradores sin alterar la versión publicada.
  7. Permitir comparar el borrador con el horario vigente.
  8. Permitir restaurar una versión anterior mediante una nueva operación controlada.
  9. Volver a validar los conflictos antes de restaurar o publicar.
  10. Conservar las versiones anteriores como historial.
  11. Registrar qué cambios se aplicaron al restaurar una versión.
  12. Evitar que la restauración elimine información posterior que no forme parte de la operación.
- **Criterios de Aceptación:**
  - CA-F7-57: Es posible comparar dos versiones e identificar las diferencias relevantes.
  - CA-F7-58: Un borrador no modifica el horario publicado.
  - CA-F7-59: Una restauración requiere autorización y validación.
  - CA-F7-60: Las versiones históricas permanecen consultables.
  - CA-F7-61: Una restauración no elimina silenciosamente cambios posteriores ajenos a ella.
  - CA-F7-62: Las diferencias y los resultados de la operación quedan registrados.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-10] Fortalecer las notificaciones y la trazabilidad de cambios académicos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-10 (P1 · Notificaciones de Horarios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de notificaciones e integración)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `js/teacher.js`
  - `js/secretary.js`
- **Dependencias Expuestas:** `sendMultiChannelNotification`, `HistorialCambiosEntidad`, `BitacoraNotificaciones`
- **Descripción del Alcance:**
  Estandarizar las notificaciones automáticas por cambios de horario, docente o aula con claves de deduplicación, registro de estado de entrega (preparado, enviado, entregado, fallido) y aislamiento frente a fallos de comunicación.

  Requisitos Funcionales:
  1. Identificar los destinatarios afectados por cada cambio.
  2. Diferenciar las notificaciones dirigidas a docentes, estudiantes, familias y responsables institucionales.
  3. Incorporar los cambios de fecha, hora, aula, docente, cancelación y reprogramación.
  4. Incluir la información anterior y la nueva cuando corresponda.
  5. Permitir consultar el historial de notificaciones asociadas a una actividad.
  6. Diferenciar los estados de preparado, enviado, entregado, fallido y leído, únicamente cuando el canal permita comprobarlos.
  7. Aplicar claves de deduplicación coherentes con el evento y el destinatario.
  8. Permitir reintentar notificaciones fallidas sin repetir innecesariamente las que ya se entregaron.
  9. Aislar los errores de comunicación del resultado de la operación académica.
  10. Evitar que las notificaciones revelen datos que el destinatario no está autorizado a consultar.
  11. Registrar los errores que requieran intervención.
  12. Permitir configurar los canales disponibles y las preferencias compatibles con las políticas institucionales.
- **Criterios de Aceptación:**
  - CA-F7-63: Cada cambio confirmado genera las notificaciones que correspondan según los destinatarios y las reglas configuradas.
  - CA-F7-64: Un fallo de comunicación no revierte una modificación académica confirmada.
  - CA-F7-65: Los reintentos no duplican injustificadamente los avisos.
  - CA-F7-66: El historial permite identificar el evento, los destinatarios y el resultado del envío.
  - CA-F7-67: Los estados de entrega no se marcan como confirmados sin evidencia del canal.
  - CA-F7-68: Los destinatarios no reciben información ajena a sus permisos.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-11] Fortalecer la coherencia y actualización de los portales relacionados
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-11 (P1 · Integración Multi-Portal)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de integración multi-módulo)
- **Archivos Involucrados:**
  - `js/teacher.js`
  - `js/student.js`
  - `js/secretary.js`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `getClassSchedules`, `getStudentSchedule`, `fetchAndRenderStudentSchedule`
- **Descripción del Alcance:**
  Garantizar la sincronización coherente y en tiempo real de los horarios entre el backend y los portales de Docentes, Estudiantes y Familias, previniendo visualización de datos en caché obsoletos o desalineados tras una modificación o cancelación.

  Requisitos Funcionales:
  1. Identificar la fuente de verdad de las asignaciones y las reglas de actualización de cada portal.
  2. Definir qué operaciones requieren volver a consultar los datos y cuáles pueden actualizar una vista de manera incremental.
  3. Evitar que los horarios cancelados o modificados permanezcan visibles como si siguieran vigentes.
  4. Diferenciar los datos confirmados de la información temporal o pendiente de sincronización.
  5. Mostrar mensajes claros cuando no sea posible recuperar el horario actualizado.
  6. Evitar que una respuesta tardía sobrescriba datos más recientes.
  7. Garantizar que los filtros por usuario, matrícula, sección y período se apliquen correctamente.
  8. Verificar que los cambios de docente o aula se reflejen en todas las vistas pertinentes.
  9. Mantener los registros históricos de asistencia y evaluación asociados a sus sesiones originales.
  10. Evitar consultas duplicadas que degraden el rendimiento sin aportar información adicional.
  11. Aplicar las restricciones de acceso en las consultas y servicios correspondientes.
  12. Proporcionar una forma de actualizar los datos cuando una vista detecte que su información está desactualizada.
- **Criterios de Aceptación:**
  - CA-F7-69: Un cambio confirmado se refleja en las vistas pertinentes después de la actualización prevista.
  - CA-F7-70: Los errores de comunicación no se presentan como una actualización exitosa.
  - CA-F7-71: Los datos obsoletos no sobrescriben silenciosamente información más reciente.
  - CA-F7-72: Cada usuario consulta únicamente los horarios correspondientes a sus permisos y relaciones académicas.
  - CA-F7-73: Las cancelaciones no aparecen como asignaciones vigentes.
  - CA-F7-74: Las modificaciones de horario no trasladan ni eliminan registros históricos de asistencia o evaluación.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-12] Ampliar los reportes de carga docente, ocupación y calidad de planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-12 (P2 · Analítica de Horarios)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de análisis y reportes)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `getTeachingHoursSummary`, `getCurricularAnalyticsReport`, `getTeacherTeachingLoad`
- **Descripción del Alcance:**
  Crear indicadores analíticos y reportes ejecutivos sobre la ocupación porcentual de aulas/laboratorios, distribución de carga laboral docente por período y detección de horas huecas o conflictos de calidad de planificación.

  Requisitos Funcionales:
  1. Incorporar reportes de carga docente por día, semana, período y año lectivo.
  2. Permitir comparar la carga con los límites aplicables a cada docente.
  3. Mostrar la ocupación de aulas y recursos por intervalo.
  4. Identificar los períodos de alta y baja utilización.
  5. Mostrar los conflictos pendientes y las asignaciones que requieren revisión.
  6. Resumir las evaluaciones y actividades programadas por sección y período.
  7. Permitir filtrar por sede, jornada, grado, sección, docente, aula y período, según corresponda.
  8. Diferenciar las asignaciones activas, canceladas y pendientes de publicación.
  9. Mostrar la fecha de actualización de los datos cuando sea relevante.
  10. Permitir exportar los reportes en los formatos admitidos por la plataforma.
  11. Restringir los datos sensibles según el rol.
  12. Evitar que los registros históricos se mezclen con la planificación vigente.
- **Criterios de Aceptación:**
  - CA-F7-75: Los totales de carga coinciden con las asignaciones incluidas en el período consultado.
  - CA-F7-76: Las actividades canceladas se contabilizan conforme a la definición de cada indicador.
  - CA-F7-77: La ocupación de recursos se calcula a partir de intervalos efectivos.
  - CA-F7-78: Los filtros combinados producen resultados coherentes.
  - CA-F7-79: Los reportes no incluyen datos fuera del ámbito autorizado.
  - CA-F7-80: Las exportaciones coinciden con los resultados presentados en pantalla.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-13] Incorporar importación, exportación y validación masiva de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-13 (P2 · Intercambio Masivo de Horarios)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva herramienta de administración académica)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `createClassSchedule`, `checkScheduleConflict`, `F7-IMP-01`, `F7-IMP-02`
- **Descripción del Alcance:**
  Desarrollar la herramienta de importación/exportación masiva de horarios en formato estructurado (CSV/JSON), con fase previa de previsualización, validación atómica de conflictos y reporte de filas con error.

  Requisitos Funcionales:
  1. Permitir exportar horarios con sus relaciones académicas y estados pertinentes.
  2. Permitir importar datos desde un formato estructurado admitido por la plataforma.
  3. Validar la estructura y los campos obligatorios antes de procesar el archivo.
  4. Comprobar la existencia de los grados, secciones, asignaturas, docentes, aulas y períodos referenciados.
  5. Identificar duplicados y asignaciones que ya existan.
  6. Detectar conflictos antes de aplicar los registros importados.
  7. Presentar un resumen de registros válidos, advertencias, errores y duplicados.
  8. Permitir revisar el resultado antes de confirmar la importación.
  9. Diferenciar las operaciones de creación, actualización y omisión.
  10. Evitar que una importación parcial deje registros relacionados en un estado inconsistente.
  11. Registrar el resultado de la operación.
  12. Aplicar los permisos correspondientes a la importación y exportación.
- **Criterios de Aceptación:**
  - CA-F7-81: Un archivo inválido se rechaza con errores identificables.
  - CA-F7-82: Los registros conflictivos se identifican antes de confirmar la importación.
  - CA-F7-83: La previsualización no modifica los horarios oficiales.
  - CA-F7-84: Los duplicados se gestionan según la operación seleccionada.
  - CA-F7-85: Una importación fallida no deja datos parcialmente aplicados sin control.
  - CA-F7-86: La exportación puede volver a importarse sin perder los datos esenciales, dentro del alcance del formato definido.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-14] Fortalecer la publicación y el control de cambios masivos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-14 (P1 · Flujo de Publicación)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación del flujo de publicación)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `publishClassSchedules`, `checkScheduleConflict`, `HistorialCambiosEntidad`
- **Descripción del Alcance:**
  Enriquecer la función `publishClassSchedules` para incluir una etapa de revisión de impacto masivo, re-validación de conflictos en el conjunto completo de borradores y generación ordenada de notificaciones post-publicación.

  Requisitos Funcionales:
  1. Diferenciar claramente los borradores de los horarios publicados.
  2. Permitir revisar todas las modificaciones antes de publicar.
  3. Mostrar las asignaciones nuevas, modificadas y canceladas.
  4. Detectar conflictos y restricciones incumplidas en el conjunto que se pretende publicar.
  5. Identificar las clases, docentes, grupos y recursos afectados.
  6. Solicitar confirmación cuando la publicación altere horarios vigentes.
  7. Volver a validar los datos antes de confirmar la publicación.
  8. Evitar que una publicación parcial se presente como completada.
  9. Registrar quién publicó los cambios y cuándo.
  10. Generar las notificaciones pertinentes después de confirmar la publicación.
  11. Permitir consultar la versión publicada y su historial.
  12. Evitar que los borradores de otros usuarios se publiquen accidentalmente.
- **Criterios de Aceptación:**
  - CA-F7-87: Un borrador no altera el horario visible como vigente.
  - CA-F7-88: La publicación identifica los cambios y sus consecuencias.
  - CA-F7-89: Los conflictos obligatorios impiden publicar.
  - CA-F7-90: La confirmación publica únicamente los cambios incluidos en la operación.
  - CA-F7-91: Si la publicación falla, el sistema identifica el estado efectivo y permite completar o resolver la operación sin duplicaciones.
  - CA-F7-92: Las notificaciones se generan a partir de los cambios realmente publicados.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-15] Incorporar control de concurrencia y protección de operaciones críticas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-15 (P1 · Concurrencia en Horarios)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Fortalecimiento de integridad y consistencia)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** `LockService`, `createClassSchedule`, `publishClassSchedules`, `saveClassroomResource`
- **Descripción del Alcance:**
  Proteger las operaciones de creación, edición y publicación de horarios mediante cerrojos de concurrencia de Apps Script (`LockService`) y timestamps de versionado para evitar carreras entre escrituras simultáneas sobre el mismo espacio o docente.

  Requisitos Funcionales:
  1. Identificar las operaciones críticas que deben protegerse frente a cambios concurrentes.
  2. Detectar cuando una asignación haya cambiado desde que un usuario la consultó o comenzó a editarla.
  3. Evitar que una modificación basada en datos obsoletos sobrescriba silenciosamente cambios recientes.
  4. Volver a comprobar la disponibilidad de docentes, aulas y recursos antes de confirmar una asignación.
  5. Aplicar los mecanismos de exclusión o control de versiones adecuados al almacenamiento existente.
  6. Evitar bloqueos prolongados que impidan operar a otros usuarios.
  7. Gestionar los errores de concurrencia con mensajes que permitan recargar y reintentar.
  8. Mantener la integridad de las operaciones que afecten a varios registros relacionados.
  9. Diferenciar un conflicto de planificación de un conflicto técnico de actualización.
  10. Registrar los fallos que requieran investigación.
- **Criterios de Aceptación:**
  - CA-F7-93: Dos usuarios no pueden confirmar asignaciones incompatibles por una carrera entre validación y escritura.
  - CA-F7-94: Una edición basada en datos obsoletos se rechaza o requiere reconciliación explícita.
  - CA-F7-95: Los cambios concurrentes no sobrescriben silenciosamente información confirmada por otro usuario.
  - CA-F7-96: Los errores permiten identificar el registro afectado.
  - CA-F7-97: Las operaciones fallidas no dejan reservas o asignaciones parciales.
  - CA-F7-98: Las pruebas de concurrencia demuestran que se mantienen las restricciones obligatorias.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-16] Ampliar la gestión de sustituciones y la reasignación de clases afectadas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-16 (P1 · Sustituciones Complejas)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Ampliación de gestión docente)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `createTeacherSubstitution`, `AsignacionesDocentes`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Ampliación del módulo de sustituciones docentes para gestionar licencias prolongadas con reasignación de múltiples bloques horarios, verificación automática de carga del sustituto y caducidad automática de la sustitución al vencer su período.

  Requisitos Funcionales:
  1. Permitir identificar el intervalo exacto de la sustitución.
  2. Localizar las clases y actividades afectadas por la ausencia.
  3. Comprobar la disponibilidad del sustituto en cada intervalo.
  4. Validar su compatibilidad con las asignaturas, grupos y requisitos correspondientes.
  5. Detectar conflictos de carga laboral, horario y aula.
  6. Permitir gestionar varias sustituciones relacionadas.
  7. Conservar la asignación del docente titular.
  8. Distinguir entre sustituciones temporales y cambios permanentes.
  9. Registrar quién autorizó la sustitución y su período de vigencia.
  10. Propagar los cambios a las vistas y notificaciones pertinentes.
  11. Evitar que una sustitución temporal modifique las clases posteriores al período autorizado.
  12. Permitir consultar el historial de sustituciones.
- **Criterios de Aceptación:**
  - CA-F7-99: Una sustitución se aplica únicamente durante el intervalo autorizado.
  - CA-F7-100: El docente titular conserva su asignación histórica.
  - CA-F7-101: El sustituto no recibe clases incompatibles.
  - CA-F7-102: Los conflictos pendientes se identifican antes de confirmar.
  - CA-F7-103: Las vistas de los usuarios reflejan el responsable efectivo.
  - CA-F7-104: Las notificaciones se envían a los destinatarios correspondientes.
  - CA-F7-105: La finalización de la sustitución no altera indebidamente las asignaciones futuras.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-17] Ampliar la gestión de eventos y actividades con participantes y recursos
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-17 (P2 · Eventos e Infraestructura)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación del calendario institucional)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CalendarioAcademico`, `getAcademicCalendar`, `createCalendarEvent`, `SedesAulas`
- **Descripción del Alcance:**
  Desarrollar un modelo unificado para la reserva de espacios y recursos asignados a eventos institucionales o extracurriculares (reuniones docentes, actos, deportes) con validación de reservas y control de visibilidad por rol.

  Requisitos Funcionales:
  1. Permitir asociar una actividad con su responsable y ámbito académico.
  2. Identificar a los participantes o grupos afectados cuando corresponda.
  3. Asociar aulas, equipos y recursos compartidos.
  4. Validar las reservas y disponibilidades.
  5. Permitir registrar actividades recurrentes cuando sea necesario.
  6. Gestionar cancelaciones y cambios de fecha.
  7. Diferenciar los eventos informativos de las actividades que reservan recursos.
  8. Permitir definir la visibilidad del evento según los permisos y destinatarios.
  9. Propagar los cambios al calendario correspondiente.
  10. Evitar que una actividad sin requisitos de aula o docente quede blocked por campos no aplicables.
  11. Conservar el historial de modificaciones.
  12. Integrar las notificaciones con el alcance real de la actividad.
- **Criterios de Aceptación:**
  - CA-F7-106: Una actividad con recursos reservados respeta las restricciones de disponibilidad.
  - CA-F7-107: Una actividad informativa puede crearse sin asignar recursos que no necesita.
  - CA-F7-108: Los cambios se reflejan en los calendarios pertinentes.
  - CA-F7-109: La cancelación libera las reservas correspondientes.
  - CA-F7-110: Los participantes solo consultan la información que les corresponde.
  - CA-F7-111: El historial permite identificar las modificaciones realizadas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-18] Ampliar la gestión de restricciones académicas y dependencias entre asignaturas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-18 (P2 · Dependencias Curriculares)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva capacidad de planificación académica avanzada)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `CatalogoAsignaturas`, `MallaCurricular`, `F7-IMP-01`, `F7-IMP-04`
- **Descripción del Alcance:**
  Implementar la configuración de restricciones de co-requisito horario entre asignaturas (clases simultáneas requeridas, bloques estrictamente consecutivos o dictados secuenciales obligatorios) e integrarlas en el motor de validación.

  Requisitos Funcionales:
  1. Permitir representar las relaciones académicas que afecten a la planificación.
  2. Distinguir entre:
     - Actividades que deben coincidir en horario.
     - Actividades que no pueden coincidir.
     - Actividades que requieren una secuencia temporal.
     - Actividades que necesitan compartir recursos.
     - Actividades que deben permanecer separadas.
  3. Permitir asociar las restricciones con asignaturas, secciones o tipos de actividad, según corresponda.
  4. Validar que las relaciones no sean contradictorias.
  5. Considerar las dependencias al generar o reorganizar horarios.
  6. Explicar qué restricción impide una asignación.
  7. Permitir desactivar o modificar una relación con los permisos adecuados.
  8. Conservar el historial de cambios en las reglas.
  9. Evitar que las dependencias se apliquen a períodos o secciones ajenos a su ámbito.
  10. Permitir comprobar las consecuencias de una modificación antes de aplicarla.
- **Criterios de Aceptación:**
  - CA-F7-112: Una relación configurada se aplica únicamente a las asignaciones comprendidas en su ámbito.
  - CA-F7-113: Las relaciones obligatorias se respetan al validar y publicar horarios.
  - CA-F7-114: Las reglas contradictorias se identifican antes de generar un escenario.
  - CA-F7-115: El sistema explica las dependencias que impiden una asignación.
  - CA-F7-116: Los cambios en las reglas no alteran silenciosamente los registros históricos.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-19] Ampliar el control de capacidad y distribución de estudiantes por sección
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-19 (P2 · Capacidad de Sección)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de planificación y administración de secciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `Matriculas`, `OfertaAcademica`, `SedesAulas`, `checkScheduleConflict`
- **Descripción del Alcance:**
  Integrar las validaciones de capacidad de aula con el conteo dinámico de matrícula activa por sección, generando alertas preventivas cuando la inscripción supere el cupo físico del espacio asignado.

  Requisitos Funcionales:
  1. Identificar la matrícula efectiva de cada sección para el período correspondiente.
  2. Permitir configurar la capacidad máxima de una sección cuando sea aplicable.
  3. Comparar la matrícula con la capacidad del aula asignada.
  4. Diferenciar la capacidad física del espacio del límite administrativo de la sección.
  5. Identificar secciones que excedan alguno de los límites aplicables.
  6. Detectar cuándo una modificación de matrícula afecta a una asignación existente.
  7. Permitir consultar alternativas de aula compatibles.
  8. Conservar la relación entre estudiantes, sección y período académico.
  9. Evitar que una sección inactiva o de otro período se utilice en una nueva planificación.
  10. Mostrar advertencias cuando falten datos necesarios para validar la capacidad.
- **Criterios de Aceptación:**
  - CA-F7-117: Una sección no supera silenciosamente un límite obligatorio configurado.
  - CA-F7-118: Un aula con capacidad insuficiente se identifica antes de publicar el horario.
  - CA-F7-119: Los cambios de matrícula permiten detectar asignaciones que ya no cumplen las restricciones.
  - CA-F7-120: Los límites se aplican según las reglas institucionales efectivas.
  - CA-F7-121: La falta de datos se comunica sin presentar una validación incompleta como satisfactoria.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-20] Optimizar el rendimiento y la escalabilidad de las consultas de planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-20 (P2 · Rendimiento)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Optimización técnica y funcional)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getClassSchedules`, `getStudentSchedule`, `getClassroomResources`
- **Descripción del Alcance:**
  Optimizar los algoritmos de lectura de horarios, agregando filtrado en el origen por año lectivo y docente, e implementando estrategias de almacenamiento en caché invalidables ante escrituras para reducir latencias en Google Apps Script.

  Requisitos Funcionales:
  1. Identificar las consultas más frecuentes y costosas de la planificación.
  2. Evitar lecturas repetitivas de los mismos conjuntos de datos cuando no sean necesarias.
  3. Aplicar filtros en el origen de los datos siempre que resulte viable.
  4. Limitar los resultados de consultas extensas mediante paginación o mecanismos equivalentes cuando corresponda.
  5. Evitar cargar todos los períodos académicos y todos los horarios si el usuario solo necesita un intervalo reducido.
  6. Mantener la coherencia entre la caché y los datos confirmados.
  7. Invalidar o actualizar la información almacenada cuando se produzcan cambios relevantes.
  8. Evitar que las consultas analíticas bloqueen operaciones críticas de escritura.
  9. Proporcionar indicadores de carga y mensajes adecuados cuando una consulta tarde más de lo esperado.
  10. Identificar errores de tiempo de ejecución, límites del servicio y operaciones que excedan los recursos disponibles.
- **Criterios de Aceptación:**
  - CA-F7-122: Las consultas de una semana no necesitan cargar innecesariamente todo el historial académico.
  - CA-F7-123: Los filtros reducen el conjunto de datos procesados cuando corresponda.
  - CA-F7-124: Una modificación confirmada no deja la caché mostrando indefinidamente datos obsoletos.
  - CA-F7-125: La optimización no cambia el significado de los resultados.
  - CA-F7-126: Los informes y las vistas conservan la coherencia con los datos de origen.
  - CA-F7-127: Las pruebas con volúmenes representativos permiten medir el rendimiento antes y después.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-21] Ampliar la auditoría operativa y la trazabilidad de la planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-21 (P2 · Trazabilidad de Planificación)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Ampliación de observabilidad y control administrativo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `HistorialCambiosEntidad`, `BitacoraTraceability`, `getAcademicAuditLogs`
- **Descripción del Alcance:**
  Crear una vista de auditoría consolidada de planificación que permita filtrar y revisar todas las operaciones de creación, edición, borrador, publicación y eliminación de horarios con detalles de usuario actor, timestamp y payload de cambios.

  Requisitos Funcionales:
  1. Registrar las operaciones relevantes de creación, modificación, cancelación, publicación y restauración.
  2. Identificar el usuario responsable, la fecha, la operación y los registros afectados.
  3. Diferenciar las operaciones exitosas de las rechazadas o fallidas.
  4. Registrar los conflictos detectados y su resolución.
  5. Identificar las notificaciones fallidas que requieran atención.
  6. Permitir filtrar por usuario, período, recurso, tipo de operación y estado.
  7. Restringir la consulta de la bitácora a los roles autorizados.
  8. Evitar que los usuarios sin permiso puedan alterar o borrar los registros.
  9. Permitir correlacionar una operación con los errores o notificaciones relacionados.
  10. Facilitar la identificación de problemas repetidos sin registrar información sensible innecesaria.
- **Criterios de Aceptación:**
  - CA-F7-128: Una operación relevante puede rastrearse desde su solicitud hasta su resultado.
  - CA-F7-129: Los errores permiten identificar el componente y el registro afectados.
  - CA-F7-130: Los usuarios no autorizados no pueden consultar ni alterar la bitácora.
  - CA-F7-131: Los registros permiten diferenciar un conflicto de planificación de un fallo técnico.
  - CA-F7-132: Las consultas de seguimiento no modifican los datos auditados.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-22] Ampliar la planificación mediante plantillas y reutilización controlada de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-22 (P2 · Plantillas de Horario)
- **Prioridad:** P2
- **Severidad/Clasificación:** Medio (Nueva herramienta de productividad)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `teacher-dashboard.html`
  - `js/teacher.js`
- **Dependencias Expuestas:** `copyClassSchedules`, `HorariosClase`, `F7-IMP-01`, `F7-IMP-02`, `F7-IMP-09`
- **Descripción del Alcance:**
  Desarrollar la capacidad de guardar la estructura de distribución horaria semanal de un período o sección como plantilla reutilizable, permitiendo clonarla hacia otro período con previsualización y re-validación de aulas y docentes.

  Requisitos Funcionales:
  1. Permitir guardar una estructura de horario como plantilla cuando corresponda.
  2. Permitir seleccionar qué elementos se reutilizarán: distribución semanal, períodos horarios, asignaturas, estructura de secciones, preferencias de planificación.
  3. Evitar copiar automáticamente docentes, aulas o asignaciones que deban volver a validarse para el nuevo período.
  4. Identificar las referencias que no existan en el período de destino.
  5. Validar la plantilla antes de aplicarla.
  6. Permitir previsualizar las asignaciones resultantes.
  7. Detectar conflictos con los recursos y docentes del período de destino.
  8. Permitir ajustar la plantilla antes de confirmar.
  9. Registrar el origen de la plantilla y la operación realizada.
  10. Evitar modificar la plantilla original cuando se aplica a otro período.
- **Criterios de Aceptación:**
  - CA-F7-133: Aplicar una plantilla no modifica su versión original.
  - CA-F7-134: Las referencias inexistentes se identifican antes de confirmar.
  - CA-F7-135: Las asignaciones resultantes se validan contra la disponibilidad del período de destino.
  - CA-F7-136: El sistema no publica automáticamente un horario generado sin revisión.
  - CA-F7-137: Los cambios aplicados quedan registrados y pueden identificarse posteriormente.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-23] Ampliar las herramientas de impresión y distribución de horarios
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-23 (P3 · Exportación e Impresión)
- **Prioridad:** P3
- **Severidad/Clasificación:** Bajo (Mejora de accesibilidad y distribución de información)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getClassSchedules`, `getStudentSchedule`, `F7-IMP-02`, `F7-IMP-12`
- **Descripción del Alcance:**
  Incorporar vistas de impresión formateadas CSS `@media print` y exportación limpia para horarios de docentes, secciones y aulas con membrete institucional e identificación explícita de versión publicada o borrador.

  Requisitos Funcionales:
  1. Permitir preparar horarios imprimibles por docente, sección, aula y período.
  2. Permitir seleccionar el intervalo de fechas y los filtros pertinentes.
  3. Mostrar la información necesaria para identificar cada clase.
  4. Diferenciar los horarios vigentes de los borradores.
  5. Evitar incluir información que el usuario no esté autorizado a consultar.
  6. Mantener una distribución legible en páginas impresas.
  7. Permitir exportar los datos en los formatos admitidos.
  8. Mostrar la fecha de generación y el período al que corresponde el documento.
  9. Identificar si el horario exportado corresponde a una versión publicada.
  10. Evitar que los documentos distribuidos presenten cambios pendientes como si fueran oficiales.
- **Criterios de Aceptación:**
  - CA-F7-138: El documento exportado coincide con los filtros y el horario seleccionado.
  - CA-F7-139: La información se presenta de manera legible.
  - CA-F7-140: Los datos restringidos no se incluyen en la exportación.
  - CA-F7-141: El documento permite identificar su período y estado.
  - CA-F7-142: Las modificaciones posteriores no alteran retroactivamente un documento ya generado.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-24] Ampliar las preferencias de calendario y la personalización de vistas
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-24 (P3 · Personalización de Calendarios)
- **Prioridad:** P3
- **Severidad/Clasificación:** Bajo (Mejora de experiencia de usuario)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `student-dashboard.html`
  - `js/teacher.js`
  - `js/student.js`
- **Dependencias Expuestas:** `getAcademicCalendar`, `F7-IMP-02`, `F7-IMP-10`
- **Descripción del Alcance:**
  Incorporar controles de personalización de vista en el calendario académico unificado (alternancia de filtros por categoría de evento, leyenda explicativa por colores y adaptabilidad en pantallas móviles).

  Requisitos Funcionales:
  1. Permitir filtrar las actividades por tipo, período, asignatura, sección y estado.
  2. Permitir mostrar u ocultar categorías de eventos cuando el usuario esté autorizado.
  3. Diferenciar clases, evaluaciones, actividades institucionales y cancelaciones.
  4. Permitir consultar los detalles de cada evento desde el calendario.
  5. Facilitar la navegación entre días, semanas y períodos.
  6. Mantener filtros compatibles con el rol y el ámbito de acceso.
  7. Proporcionar una vista adecuada para dispositivos móviles.
  8. Evitar que las preferencias visuales oculten permanentemente información crítica, como cancelaciones o cambios importantes.
  9. Permitir restablecer la configuración de visualización.
  10. Actualizar la vista cuando cambien los datos de origen.
- **Criterios de Aceptación:**
  - CA-F7-143: Los filtros modifican la visualización sin alterar los datos académicos.
  - CA-F7-144: Los eventos mostrados corresponden al ámbito autorizado.
  - CA-F7-145: Las cancelaciones y cambios importantes pueden identificarse.
  - CA-F7-146: Las preferencias personales no afectan a otros usuarios.
  - CA-F7-147: La vista continúa mostrando los datos actualizados después de modificaciones confirmadas.
- **Estado:** [X] Completado

---

### [X] [TAREA-F7-IMP-25] Ampliar la verificación de calidad mediante pruebas automatizadas de planificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_7_PLANIFICACION_HORARIOS_RECURSOS.md` / Tarea F7-IMP-25 (P1 · Pruebas de Regresión)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Fortalecimiento de calidad y prevención de regresiones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** `runConcurrencyAndConsistencySuite`, `checkScheduleConflict`, `getTeacherTeachingLoad`
- **Descripción del Alcance:**
  Construir una batería automatizada de pruebas de regresión e integración para el módulo de planificación académica que evalúe sintéticamente la prevención de conflictos, cargas docentes, sustituciones y la concurrencia en la publicación de horarios.

  Requisitos Funcionales:
  1. Identificar las pruebas automatizadas existentes relacionadas con la Fase 7.
  2. Incorporar pruebas para: creación y actualización de horarios, conflictos docentes, conflictos de aulas, conflictos de secciones, disponibilidad laboral, carga docente, excepciones del calendario, programación de evaluaciones, sustituciones, publicación y cancelación, notificaciones y deduplicación, permisos, integración con asistencia y portales.
  3. Incluir casos límite, datos inválidos y errores de persistencia.
  4. Verificar que las operaciones fallidas no generen cambios parciales.
  5. Incorporar pruebas de concurrencia para las operaciones críticas.
  6. Comprobar las relaciones entre los datos persistidos y las vistas.
  7. Separar las pruebas unitarias, de integración y de extremo a extremo.
  8. Utilizar datos de prueba controlados y evitar modificar información real.
  9. Registrar los resultados de las ejecuciones.
  10. Permitir repetir las pruebas después de una corrección o ampliación.
- **Criterios de Aceptación:**
  - CA-F7-148: Cada requisito crítico cuenta con pruebas reproducibles.
  - CA-F7-149: Los conflictos obligatorios se detectan en los escenarios previstos.
  - CA-F7-150: Las asignaciones válidas siguen funcionando.
  - CA-F7-151: Las pruebas de permisos demuestran que las operaciones restringidas son rechazadas.
  - CA-F7-152: Los fallos no dejan datos inconsistentes.
  - CA-F7-153: Las pruebas de integración comprueban las relaciones entre los módulos implicados.
  - CA-F7-154: Los resultados permiten identificar qué pruebas se ejecutaron, cuáles fallaron y cuáles no pudieron completarse.
- **Estado:** [X] Completado
<!-- Regla del Backlog: Las tareas deben estar ordenadas estrictamente por su nivel de importancia y severidad en orden descendente, asignando identificadores consecutivos en formato F8-TaskXX. -->
# PENDIENTES - FASE 8 Y ANEXO: DASHBOARDS DINÁMICOS, SEGURIDAD, MODULARIZACIÓN Y ARQUITECTURA DE ROLES

## TAREAS CRÍTICAS (P1 - ALTA SEVERIDAD Y REGLAS DE SEGURIDAD)

---

### [X] [F8-Task01] Centralizar y verificar la autorización efectiva de cada operación
- **ID Anterior:** `[TAREA-AD-06]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task02] Auditar los archivos existentes y elaborar un inventario de dependencias
- **ID Anterior:** `[TAREA-MOD-01]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task03] Actualizar todas las rutas y dependencias después de reorganizar el repositorio
- **ID Anterior:** `[TAREA-MOD-04]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task04] Crear pruebas de regresión para la modularización y los dashboards dinámicos
- **ID Anterior:** `[TAREA-MOD-06]`
- **Origen del Hallazgo:** Anexo de Tareas: Regresión / Tarea MOD-06 (P1 · Suite de Regresión Arquitectónica)
- **Prioridad:** P1
- **Severidad/Clasificación:** Crítica (Pruebas de regresión)
- **Archivos Involucrados:**
  - `tests/regression/modular-dashboard-suite.js`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task05] Ejecutar la reorganización mediante etapas verificables
- **ID Anterior:** `[TAREA-MOD-07]`
- **Origen del Hallazgo:** Anexo de Tareas: Regresión / Tarea MOD-07 (P1 · Ejecución por Etapas)
- **Prioridad:** P1
- **Severidad/Clasificación:** Crítica (Control de migración segura)
- **Archivos Involucrados:**
  - `docs/architecture/staged-migration-procedure.md`
  - `backend/developer-service/Code.gs`
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
- **Estado:** [X] Completado

---

## TAREAS DE ALTA PRIORIDAD (P1 - ARQUITECTURA BASE Y SPREADSHEETS POR ROL)

---

### [X] [F8-Task06] Implementar el seguimiento preventivo de las cuotas y la disponibilidad de almacenamiento en Google Drive
- **ID Anterior:** `[TAREA-F8-MANT-01]`
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

### [X] [F8-Task07] Crear una arquitectura de dashboards dinámicos para roles configurables
- **ID Anterior:** `[TAREA-AD-01]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task08] Implementar un catálogo central de responsabilidades, capacidades y módulos
- **ID Anterior:** `[TAREA-AD-02]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task09] Implementar la gestión del ámbito de actuación de los roles
- **ID Anterior:** `[TAREA-AD-03]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task10] Desarrollar el dashboard de coordinador académico como implementación de referencia
- **ID Anterior:** `[TAREA-AD-04]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task11] Integrar los dashboards dinámicos con los módulos y servicios existentes
- **ID Anterior:** `[TAREA-AD-05]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task12] Crear una interfaz administrativa para configurar los dashboards y las responsabilidades
- **ID Anterior:** `[TAREA-AD-07]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task13] Definir y aplicar una estructura modular de carpetas
- **ID Anterior:** `[TAREA-MOD-02]`
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-02 (P1 · Estructura Modular)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Organización de código)
- **Archivos Involucrados:**
  - `docs/architecture/folder-structure.md`
  - `backend/developer-service/Code.gs`
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

> **Nota de Arquitectura:** Las estructuras que están en el anexo A (carpetas del repositorio) y en el anexo B (hojas y spreadsheets por rol) son ejemplos de una estructura recomendable, y no una estructura obligatoria.
- **Estado:** [X] Completado

---

### [X] [F8-Task14] Modularizar los archivos grandes sin eliminar ni duplicar funciones
- **ID Anterior:** `[TAREA-MOD-03]`
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-03 (P1 · Descomposición de Archivos Monolíticos)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Descomposición de código)
- **Archivos Involucrados:**
  - `docs/architecture/monolith-decomposition-plan.md`
  - `backend/developer-service/Code.gs`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task15] Actualizar el mapa de dependencias y la documentación arquitectónica
- **ID Anterior:** `[TAREA-MOD-05]`
- **Origen del Hallazgo:** Anexo de Tareas: Modularización / Tarea MOD-05 (P1 · Documentación Arquitectónica)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Documentación de arquitectura)
- **Archivos Involucrados:**
  - `MapaDependencias.md`
  - `docs/architecture/`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** Estructura completa del repositorio, contratos de módulos y orden de inicialización
- **Descripción del Alcance:**
  Documentar el mapa definitivo de dependencias, árbol del repositorio, catálogo de módulos, contratos e inventario de funciones trasladadas.

  Requisitos Funcionales:
  1. Documentar dependencias directas e indirectas entre HTMLs, JS, CSS, microservicios y fuentes de datos.
  2. Especificar contratos de módulos reutilizables, orden de carga e inicialización.
  3. Documentar procesos de compilación y reglas para incorporar nuevos archivos.
- **Criterios de Aceptación:**
  - CA-MOD-109: `MapaDependencias.md` y la documentación de arquitectura corresponden con exactitud a la estructura del código.
- **Estado:** [X] Completado

---

### [X] [F8-Task16] Implementar los principios de independencia funcional y comunicación entre roles
- **ID Anterior:** `[TAREA-ARQ-01]`
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-01 (P1 · Independencia Funcional)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Arquitectura de datos y fuentes oficiales)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
  - `backend/user-service/Code.gs`
  - `backend/academic-service/Code.gs`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task17] Estandarizar convenciones de identificadores estables y columnas comunes de control
- **ID Anterior:** `[TAREA-ARQ-02]`
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-02 (P1 · Identificadores y Columnas Comunes)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Estandarización de relaciones y metadatos)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task18] Implementar hojas estandarizadas de eventos, errores y auditoría por Spreadsheet funcional
- **ID Anterior:** `[TAREA-ARQ-03]`
- **Origen del Hallazgo:** Anexo Técnico: Arquitectura de Roles / Tarea ARQ-03 (P1 · Observabilidad por Spreadsheet)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Bitácoras descentralizadas de operación)
- **Archivos Involucrados:**
  - `backend/developer-service/Code.gs`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task19] Implementar el Spreadsheet central de configuración y aprovisionamiento
- **ID Anterior:** `[TAREA-ARQ-04]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task20] Implementar el catálogo de Spreadsheets funcionales por rol institucional
- **ID Anterior:** `[TAREA-ARQ-05]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task21] Implementar el modelo común de comunicaciones institucionales y solicitudes
- **ID Anterior:** `[TAREA-ARQ-06]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task22] Implementar el aprovisionamiento automático, versionado de esquemas y migración de Spreadsheets
- **ID Anterior:** `[TAREA-ARQ-07]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task23] Implementar la independencia de servicios backend, seguridad Drive y límites de Google Sheets
- **ID Anterior:** `[TAREA-ARQ-08]`
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
- **Estado:** [X] Completado

---

## TAREAS DE PRIORIDAD MEDIA (P2 - PRODUCTIVIDAD, ANALÍTICA Y RENDIMIENTO)

---

### [X] [F8-Task24] Implementar la previsualización integrada de documentos PDF en la revisión de entregas
- **ID Anterior:** `[TAREA-F8-OPT-01]`
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

### [X] [F8-Task25] Incorporar estadísticas descriptivas y una visualización de la distribución de calificaciones de exámenes
- **ID Anterior:** `[TAREA-F8-OPT-02]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task26] Garantizar accesibilidad, usabilidad y adaptación de los dashboards
- **ID Anterior:** `[TAREA-CAL-01]`
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
- **Estado:** [X] Completado

---

### [X] [F8-Task27] Garantizar rendimiento y mantenimiento del sistema modular
- **ID Anterior:** `[TAREA-CAL-02]`
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
- **Estado:** [X] Completado
