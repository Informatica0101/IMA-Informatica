# REGISTRO MAESTRO DE TAREAS PENDIENTES DE DESARROLLO Y OPTIMIZACIÓN
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**
**Versión de Referencia:** 1.0
**Origen:** Auditoría de la Fase 1, octubre de 2026

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
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`
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
