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
