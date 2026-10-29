<!-- Regla del Backlog: Las tareas deben estar ordenadas estrictamente por su nivel de importancia y severidad en orden descendente, asignando identificadores consecutivos en formato F9-TaskXX. -->
# PENDIENTES - FASE 9: EVALUACIONES, CALIFICACIONES Y RESULTADOS ACADÉMICOS

## TAREAS CRÍTICAS (P0 - SEVERIDAD MÁXIMA E INTEGRIDAD DE EXPORTACIÓN Y CÁLCULO)

---

### [X] [F9-Task01] Verificar y fortalecer la compatibilidad de las plantillas oficiales de calificaciones de SACE
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task01 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Exportación académica, compatibilidad institucional y automatización de calificaciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - `js/secretary.js` / `js/teacher.js`
  - Plantillas oficiales de SACE en el repositorio
- **Dependencias Expuestas:** Registros oficiales de estudiantes, matrículas, asignaciones docentes, calificaciones consolidadas, período académico y plantillas existentes en el repositorio
- **Descripción del Alcance:**
  La plataforma debe aprovechar las plantillas existentes en el repositorio para completar los archivos oficiales descargados por los docentes, conservando su estructura y evitando que tengan que copiar y pegar manualmente las calificaciones.

  Requisitos Funcionales:
  1. Localizar e identificar las plantillas de hojas de cálculo relacionadas con el registro y la carga de calificaciones en SACE que ya existen en el repositorio. Identificar sus formatos, hojas, columnas, encabezados, celdas editables, fórmulas, validaciones, rangos, celdas combinadas y demás elementos relevantes.
  2. Determinar cuáles de esas plantillas corresponden a cada tipo de registro académico, asignatura, grado, sección, período o nivel educativo. No asumir que todas utilizan una estructura idéntica.
  3. Permitir que el docente utilice el archivo descargado desde SACE como documento de entrada, sin tener que convertirlo a un formato interno ni reconstruir su estructura.
  4. Incorporar las calificaciones correspondientes a los estudiantes y las asignaturas que coincidan con los registros institucionales.
  5. Organizar la generación de archivos por asignatura, sección y docente, respetando los criterios de agrupación y los campos que exija cada plantilla.
  6. Mantener los identificadores oficiales de estudiantes y los demás campos requeridos por SACE. No sustituirlos por identificadores internos de la plataforma cuando el archivo requiera los oficiales.
  7. Conservar los encabezados, las hojas, el orden de las columnas, las fórmulas, las validaciones, los formatos de celda y los demás elementos estructurales necesarios para que SACE acepte el archivo.
  8. Modificar únicamente los campos destinados a recibir información académica. No sobrescribir fórmulas ni celdas protegidas, ni eliminar información que deba conservarse.
  9. Relacionar las calificaciones con el estudiante correcto mediante identificadores fiables. No depender exclusivamente del nombre del estudiante, porque puede haber nombres iguales, diferencias ortográficas o variaciones en los apellidos.
  10. Cuando existan diferencias entre los registros institucionales y el archivo descargado, identificarlas y presentar un informe de inconsistencias en lugar de asignar notas por aproximación.
  11. Si falta una calificación, distinguir entre una nota pendiente, una ausencia, una exención y una calificación numérica de cero, según las reglas académicas aplicables. No convertir automáticamente un dato ausente en cero.
  12. Generar un archivo independiente para cada combinación de asignatura, sección y docente que corresponda al proceso de carga, evitando mezclar estudiantes, materias o grupos diferentes.
  13. Permitir que el docente descargue cada archivo generado y lo revise antes de subirlo a SACE.
  14. Conservar la plantilla original descargada como fuente de referencia y producir una copia completada, sin modificar el archivo de entrada.
  15. Proporcionar mensajes de error específicos cuando no se pueda identificar la plantilla, reconocer sus encabezados, relacionar estudiantes o determinar las columnas que deben completarse.
  16. Comparar el funcionamiento esperado con la experiencia de generación de archivos de calificaciones utilizada en Califik, tomando como referencia la automatización del llenado de plantillas y la separación de archivos por contexto académico, sin asumir que ambas plataformas utilizan idénticos formatos internos.
- **Criterios de Aceptación:**
  - Al proporcionar una plantilla válida descargada desde SACE, la plataforma identifica su estructura y determina qué campos puede completar.
  - Las calificaciones se asignan a los estudiantes correctos, incluso cuando existen nombres similares.
  - El archivo generado conserva la estructura original y únicamente modifica los campos autorizados.
  - Los archivos se separan correctamente por asignatura, sección y docente.
  - Los registros incompletos, duplicados o incompatibles se informan sin producir asignaciones silenciosamente incorrectas.
  - Las notas pendientes no se convierten automáticamente en ceros.
  - El archivo generado puede abrirse en el programa de hojas de cálculo compatible con su formato sin errores estructurales.
  - Una comparación entre el archivo original y el generado permite comprobar que los encabezados, las hojas, las fórmulas y los campos no editables se han conservado.
  - Se comprueba la compatibilidad con las plantillas disponibles en el repositorio, incluyendo las variantes existentes.
  - Cuando no se dispone de una plantilla representativa o de un procedimiento de validación oficial, esa limitación se documenta y no se declara demostrada la aceptación del archivo por SACE.
- **Estado:** [X] Completado

---

### [X] [F9-Task02] Fortalecer la validación y el diagnóstico de archivos SACE antes de generar las calificaciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task02 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Validación de datos e integridad de exportaciones)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/secretary.js` / `js/teacher.js`
- **Dependencias Expuestas:** F9-Task01, registros de matrícula y estudiantes, estructura de las plantillas disponibles y reglas de validación académica
- **Descripción del Alcance:**
  Garantizar que la generación de archivos identifique errores antes de producir documentos que puedan contener calificaciones incorrectas o resultar incompatibles con el formato esperado.

  Requisitos Funcionales:
  1. Validar la estructura de cada archivo antes de procesarlo, incluyendo las hojas requeridas, encabezados, columnas obligatorias, identificadores y campos destinados a recibir calificaciones.
  2. Detectar archivos vacíos, corruptos, incompletos, modificados o correspondientes a una estructura que la plataforma no reconoce.
  3. Validar que el archivo corresponda al período académico, grado, sección, asignatura y contexto institucional seleccionados, cuando esos datos estén presentes.
  4. Detectar estudiantes duplicados, identificadores inexistentes, matrículas inactivas, estudiantes faltantes y registros que no correspondan al grupo seleccionado.
  5. Comparar los datos del archivo con los registros institucionales sin asumir que el orden de las filas permanece constante.
  6. Identificar columnas con nombres similares, encabezados modificados y campos obligatorios ausentes. No completar automáticamente columnas ambiguas.
  7. Comprobar que cada calificación cumpla el rango y el tipo de dato requerido por el campo de destino.
  8. Diferenciar errores bloqueantes, advertencias y diferencias informativas.
  9. Mostrar un resumen previo a la generación con el número de estudiantes identificados, notas que se incorporarán, registros omitidos, advertencias y errores bloqueantes.
  10. Permitir corregir los problemas identificados y repetir la validación sin necesidad de reiniciar todo el proceso.
  11. Generar un informe descargable de inconsistencias que identifique el registro afectado y describa la corrección necesaria.
  12. Evitar que los errores parciales se oculten detrás de un mensaje genérico de exportación exitosa.
- **Criterios de Aceptación:**
  - Un archivo válido se procesa sin alterar su estructura.
  - Un archivo con columnas obligatorias ausentes no se completa silenciosamente.
  - Los identificadores duplicados o desconocidos se detectan antes de incorporar calificaciones.
  - Los registros incompatibles quedan identificados individualmente.
  - Los errores bloqueantes impiden generar el archivo definitivo.
  - Las advertencias no bloqueantes se muestran antes de confirmar la operación.
  - El informe de validación permite identificar cada problema sin consultar manualmente el código.
  - La validación puede repetirse después de corregir el archivo y produce resultados coherentes con los cambios realizados.
- **Estado:** [X] Completado

---

### [X] [F9-Task03] Consolidar la administración de escalas, ponderaciones y métodos de cálculo académico
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task03 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Configuración académica y motor de cálculo)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - `js/config.js`
- **Dependencias Expuestas:** Configuración académica institucional, asignaturas, niveles, períodos, competencias y motor de cálculo existente
- **Descripción del Alcance:**
  Garantizar que las reglas sean configurables, consistentes entre materias y períodos, y compatibles con las distintas modalidades educativas sin introducir valores fijos que puedan resultar incorrectos en otros contextos.

  Requisitos Funcionales:
  1. Permitir configurar métodos de evaluación por nivel educativo, grado, asignatura y período académico, según corresponda.
  2. Admitir, como mínimo: promedio aritmético, promedio ponderado por categorías, cálculo proporcional por puntos obtenidos respecto a puntos posibles, escalas numéricas, escalas cualitativas, evaluación por competencias e indicadores de logro.
  3. Permitir configurar pesos por categoría y validar que la suma corresponda al total requerido por el método seleccionado.
  4. Permitir que las ponderaciones se distribuyan entre categorías y actividades sin duplicar accidentalmente su contribución al resultado final.
  5. Definir expresamente cómo se tratan las actividades pendientes, las exenciones, las ausencias justificadas y no justificadas, las actividades no calificadas y las calificaciones recuperadas.
  6. Evitar que una actividad pendiente se interprete automáticamente como cero, salvo que una regla institucional explícita y aplicable determine ese comportamiento.
  7. Configurar las escalas de calificación con límites, equivalencias, estados de aprobación y reglas de redondeo.
  8. Evitar que los umbrales de aprobación o las equivalencias institucionales se apliquen universalmente cuando deban variar según el nivel, la modalidad o la normativa aplicable.
  9. Mantener versiones de las reglas utilizadas en cada período, de modo que los cambios de configuración no modifiquen retroactivamente los resultados históricos.
  10. Proporcionar una vista previa que muestre cómo cambia el resultado de un estudiante de prueba al modificar las ponderaciones o el método de cálculo.
  11. Permitir reutilizar configuraciones entre materias o grupos compatibles, conservando la posibilidad de ajustarlas de forma independiente.
  12. Presentar el desglose del cálculo para que el docente y los responsables autorizados puedan comprender cómo se obtuvo la nota final.
- **Criterios de Aceptación:**
  - Dos configuraciones independientes pueden utilizar categorías con nombres iguales sin compartir accidentalmente sus ponderaciones.
  - Una ponderación inválida impide activar la configuración o genera un estado explícito que impide calcular resultados oficiales.
  - El mismo conjunto de datos y la misma versión de reglas producen el mismo resultado.
  - Las notas pendientes y las exenciones se procesan según las reglas configuradas.
  - Cambiar una configuración no modifica silenciosamente las calificaciones históricas.
  - Los resultados de la vista previa coinciden con los del cálculo definitivo.
  - Las escalas numéricas y cualitativas se representan correctamente en el libro de calificaciones y en los reportes.
- **Estado:** [X] Completado

---

### [X] [F9-Task04] Fortalecer la precisión de los cálculos y la detección de inconsistencias académicas
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task04 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Integridad de las calificaciones y resultados oficiales)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - `backend/task-service/Code.gs`
- **Dependencias Expuestas:** F9-Task03, libro de calificaciones, evaluaciones, recuperaciones e historial académico
- **Descripción del Alcance:**
  Garantizar que todos los procesos que generan, modifican o consolidan calificaciones apliquen exactamente el mismo conjunto de reglas y precisión estandarizada.

  Requisitos Funcionales:
  1. Identificar todos los flujos que producen o modifican notas: exámenes, tareas, proyectos, rúbricas, recuperaciones, competencias y registros manuales.
  2. Verificar que los resultados oficiales utilicen el mismo conjunto de reglas y que ningún módulo aplique una fórmula incompatible.
  3. Validar que las puntuaciones obtenidas no excedan los puntos máximos permitidos, salvo que una regla explícita admita bonificaciones.
  4. Detectar ponderaciones duplicadas, categorías sin configuración, actividades vinculadas a períodos incorrectos y evaluaciones que no correspondan a la asignatura.
  5. Verificar el tratamiento de los decimales, el redondeo y la precisión intermedia para evitar diferencias entre el libro de notas, el boletín y la exportación.
  6. Definir el orden de aplicación de las reglas de recuperación, redondeo, equivalencia y aprobación.
  7. Evitar que una modificación de una actividad altere resultados de estudiantes o períodos que no estén relacionados con ella.
  8. Detectar resultados imposibles o inconsistentes, como promedios fuera del rango permitido, notas finales incompatibles con las calificaciones de origen o totales que no coincidan con sus componentes.
  9. Registrar los datos de origen y la versión de las reglas necesarias para reproducir un resultado oficial.
  10. Proporcionar un diagnóstico que permita distinguir entre un dato de entrada incorrecto, una regla mal configurada y un fallo del cálculo.
- **Criterios de Aceptación:**
  - Los cálculos de prueba coinciden con resultados de referencia definidos para cada método.
  - Las mismas notas no producen promedios diferentes entre los módulos que presentan el resultado oficial.
  - Los valores fuera de rango se rechazan o se procesan únicamente cuando una regla explícita lo permite.
  - Los errores de configuración se identifican antes de publicar resultados afectados.
  - Las modificaciones se propagan a los resultados dependientes sin alterar registros ajenos.
  - Se pueden reproducir los resultados históricos utilizando sus reglas originales.
- **Estado:** [X] Completado

---

### [X] [F9-Task05] Completar el ciclo de revisión, aprobación, cierre y publicación de calificaciones
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task06 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Gestión de períodos académicos y publicación oficial)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `teacher-dashboard.html` / `js/teacher.js`
  - `dashboard-secretaria.html` / `js/secretary.js`
- **Dependencias Expuestas:** F9-Task03, F9-Task04, F9-Task05 y sistema de permisos
- **Descripción del Alcance:**
  Garantizar que las etapas de revisión, aprobación, cierre y publicación representen estados diferenciados, con controles adecuados para impedir que resultados incompletos o no autorizados lleguen a estudiantes y tutores.

  Requisitos Funcionales:
  1. Diferenciar los estados de borrador, pendiente de revisión, observado, aprobado, cerrado y publicado, según el flujo institucional aplicable.
  2. Permitir que el docente finalice la preparación de las calificaciones sin publicarlas automáticamente.
  3. Proporcionar a los responsables autorizados un resumen de las notas pendientes, evaluaciones sin calificar, inconsistencias y excepciones.
  4. Permitir devolver un período al docente para corregir problemas identificados antes de su aprobación.
  5. Validar las condiciones de cierre antes de bloquear nuevas modificaciones.
  6. Identificar las excepciones que requieren autorización, como estudiantes con actividades pendientes o registros sujetos a revisión.
  7. Exigir una confirmación explícita antes de ejecutar operaciones de cierre o publicación.
  8. Diferenciar el cierre administrativo de la disponibilidad de las notas en los portales de estudiantes y tutores.
  9. Garantizar que los borradores no sean visibles como calificaciones oficiales.
  10. Registrar quién inició, aprobó, cerró y publicó el período, con sus respectivas fechas.
  11. Si la publicación incluye notificaciones, registrar los intentos de envío y permitir detectar fallos sin repetir innecesariamente avisos ya entregados.
  12. Evitar que una operación interrumpida deje el período en un estado contradictorio entre el libro de calificaciones, la configuración del período y el portal estudiantil.
- **Criterios de Aceptación:**
  - No se puede publicar un período que no haya cumplido las condiciones de aprobación establecidas.
  - Las calificaciones en borrador permanecen ocultas para los usuarios que solo tienen acceso a resultados oficiales.
  - El cierre impide las modificaciones ordinarias no autorizadas.
  - La publicación actualiza correctamente la visibilidad de los resultados.
  - Las transiciones de estado quedan registradas y pueden consultarse.
  - Los errores durante el cierre o la publicación no dejan el período en un estado inconsistente.
  - Las notificaciones fallidas pueden identificarse y gestionarse sin duplicar las operaciones académicas.
- **Estado:** [X] Completado

---

### [X] [F9-Task06] Fortalecer las rectificaciones de notas y la trazabilidad de los cambios
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task07 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad académica, auditoría e integridad histórica)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - `backend/academic-service/Code.gs`
- **Dependencias Expuestas:** F9-Task04, F9-Task06, servicio de usuarios, permisos y bitácora institucional
- **Descripción del Alcance:**
  Garantizar que cada rectificación tenga un motivo documentado, conserve el valor anterior y permita reconstruir qué ocurrió con la calificación desde su registro inicial hasta su publicación definitiva.

  Requisitos Funcionales:
  1. Registrar cada modificación de una calificación con el valor anterior, el nuevo valor, el usuario responsable, la fecha, el motivo y el contexto académico.
  2. Identificar el estudiante, la asignatura, la actividad y el período afectados.
  3. Exigir una justificación para las rectificaciones de resultados oficiales y las reaperturas de períodos cerrados.
  4. Permitir que los responsables autorizados aprueben o rechacen solicitudes de rectificación, cuando el flujo institucional lo requiera.
  5. Diferenciar la solicitud, la autorización, la ejecución y la publicación de una corrección.
  6. Conservar el historial de modificaciones sin eliminar silenciosamente los registros anteriores.
  7. Registrar las operaciones realizadas sobre lotes de calificaciones e identificar cada nota efectivamente modificada.
  8. Recalcular los promedios y documentos dependientes cuando una rectificación aprobada lo requiera.
  9. Registrar la versión anterior y posterior de los resultados afectados.
  10. Evitar que un usuario pueda modificar una nota oficial utilizando una operación de actualización ordinaria que omita los controles de rectificación.
  11. Impedir que usuarios sin autorización alteren o eliminen los registros de auditoría.
  12. Proporcionar consultas filtrables por estudiante, docente, asignatura, período, usuario responsable y fecha.
- **Criterios de Aceptación:**
  - Toda rectificación oficial deja un registro completo y consultable.
  - Los cambios no autorizados se rechazan en el servidor, incluso si se envían solicitudes directamente a la API.
  - El valor anterior puede recuperarse desde el historial.
  - Las notas corregidas se reflejan en los cálculos y documentos que dependan de ellas.
  - Los intentos fallidos de rectificación no modifican el resultado oficial.
  - Las rectificaciones masivas permiten identificar cada cambio individual.
  - El historial conserva la relación entre la solicitud, la autorización y la modificación efectuada.
- **Estado:** [X] Completado

---

### [X] [F9-Task07] Fortalecer la generación de boletines, certificados e historiales académicos
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task10 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Documentación académica y resultados oficiales)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `student-dashboard.html` / `js/student.js`
- **Dependencias Expuestas:** F9-Task03, F9-Task04, F9-Task06, F9-Task07 y expediente académico
- **Descripción del Alcance:**
  Garantizar la consistencia entre las calificaciones oficiales, los documentos emitidos y las versiones históricas de esos documentos.

  Requisitos Funcionales:
  1. Generar boletines por estudiante, período, grado y año lectivo.
  2. Incluir las asignaturas correspondientes, las calificaciones, los promedios, los estados de aprobación y las observaciones autorizadas.
  3. Diferenciar los resultados parciales, los resultados finales y las calificaciones de recuperación.
  4. Permitir consultar el historial académico agrupado por año lectivo, grado, período y asignatura.
  5. Generar certificados e historiales a partir de datos oficiales y de las reglas aplicables al período correspondiente.
  6. Mantener coherencia entre las notas mostradas en el portal y las incluidas en los documentos descargables.
  7. Evitar que una corrección posterior modifique silenciosamente un documento oficial previamente emitido.
  8. Permitir reemitir documentos cuando exista una rectificación autorizada, conservando la trazabilidad de la versión anterior.
  9. Registrar la fecha de emisión, el período cubierto, la versión del documento y el usuario responsable, según corresponda.
  10. Aplicar permisos para impedir la consulta o descarga de documentos pertenecientes a estudiantes no autorizados.
  11. Diferenciar entre documentos informativos y documentos oficiales que requieran aprobación, firma o validación institucional.
  12. Permitir generar reportes individuales y consolidados para los responsables autorizados, sin exponer datos de estudiantes ajenos al ámbito de consulta.
- **Criterios de Aceptación:**
  - Los documentos coinciden con los resultados académicos oficiales de su período.
  - Los promedios y estados de aprobación son coherentes con el libro de calificaciones.
  - Las rectificaciones generan versiones actualizadas sin borrar la trazabilidad anterior.
  - Los documentos históricos conservan su contexto académico.
  - Los usuarios no autorizados no pueden consultar ni descargar documentos ajenos.
  - Las asignaturas exentas, las recuperaciones y los resultados pendientes se representan de acuerdo con las reglas aplicables.
- **Estado:** [X] Completado

---

### [X] [F9-Task08] Fortalecer el control de permisos y la separación de responsabilidades académicas
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task12 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Seguridad, privacidad y acceso a calificaciones)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `backend/academic-service/Code.gs`
  - `backend/user-service/Code.gs`
- **Dependencias Expuestas:** Servicios de usuarios, matrícula, asignaciones docentes, expediente académico y operaciones de exportación
- **Descripción del Alcance:**
  Verificar y aplicar estrictamente los controles de seguridad tanto en la interfaz como en cada operación del servidor que consulte, registre, modifique, publique o exporte calificaciones.

  Requisitos Funcionales:
  1. Verificar los permisos tanto en la interfaz como en cada operación del servidor que consulte, registre, modifique, publique o exporte calificaciones.
  2. Limitar a los docentes a las asignaturas, grupos y períodos que tengan asignados.
  3. Permitir a Secretaría, Dirección y Coordinación acceder a las operaciones correspondientes a sus responsabilidades institucionales.
  4. Restringir a estudiantes y tutores la consulta a los resultados para los que tengan autorización.
  5. Validar las relaciones entre el usuario, el estudiante, el grupo, la asignatura, el período y la operación solicitada.
  6. Impedir que la modificación de identificadores en una petición permita consultar o alterar calificaciones de otros estudiantes.
  7. Aplicar las mismas restricciones a las descargas, los reportes, los boletines, los historiales y los archivos de SACE.
  8. Evitar que las funciones de administración de permisos permitan ampliar privilegios sin autorización.
  9. Registrar los accesos denegados y los intentos de operaciones sensibles, sin exponer datos académicos innecesarios en los mensajes de error.
  10. Mantener los controles de acceso al cambiar la matrícula de un estudiante, las asignaciones de un docente o las relaciones entre tutores y estudiantes.
- **Criterios de Aceptación:**
  - Un docente no puede modificar notas de una asignatura que no tiene asignada, aunque envíe una petición directa al servicio.
  - Un estudiante no puede consultar resultados de otro alumno alterando un identificador.
  - Un tutor solo puede consultar a los estudiantes vinculados a su perfil y autorizados para esa consulta.
  - Los permisos se aplican de igual manera a las operaciones individuales, masivas y de exportación.
  - Los intentos no autorizados se rechazan sin modificar los datos.
  - Los cambios en las relaciones académicas actualizan los permisos efectivos de manera coherente.
- **Estado:** [X] Completado

---

### [X] [F9-Task09] Completar las pruebas automatizadas de regresión de la Fase 9
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task14 (P0)
- **Prioridad:** P0
- **Severidad/Clasificación:** Crítica (Calidad funcional e integridad académica)
- **Archivos Involucrados:**
  - `tests/regression/academic-grading-suite.js`
  - `backend/developer-service/Code.gs`
- **Dependencias Expuestas:** F9-Task01 a F9-Task13, según las capacidades cubiertas por cada prueba
- **Descripción del Alcance:**
  Establecer pruebas reproducibles y automatizadas para verificar el correcto funcionamiento de los cálculos, cierres, rectificaciones, exportaciones SACE y seguridad.

  Requisitos Funcionales:
  1. Establecer pruebas reproducibles para los métodos de cálculo, las ponderaciones, las escalas, las recuperaciones y los estados de aprobación.
  2. Crear casos de prueba para notas mínimas, máximas, decimales, valores inválidos, actividades pendientes y estudiantes exentos.
  3. Verificar que las modificaciones de una calificación se reflejen correctamente en los promedios, los boletines y los historiales.
  4. Comprobar las restricciones de edición en períodos cerrados y años históricos.
  5. Probar los flujos de aprobación, publicación, rectificación y reapertura.
  6. Probar la generación de archivos SACE con las plantillas reales existentes en el repositorio.
  7. Verificar que las plantillas originales mantengan su estructura después de generar los archivos completados.
  8. Comprobar el aislamiento entre estudiantes, tutores, docentes, asignaturas y secciones.
  9. Simular fallos de conexión, reintentos, guardados concurrentes y errores durante la generación de archivos.
  10. Probar la generación de reportes con estudiantes trasladados, matrículas inactivas, asignaturas exentas y registros históricos.
  11. Verificar la accesibilidad de las operaciones principales con teclado y pantallas pequeñas.
  12. Incorporar pruebas de regresión para evitar que una corrección en el cálculo, la exportación o la publicación afecte las funciones existentes.
- **Criterios de Aceptación:**
  - Los casos de prueba tienen resultados esperados explícitos y reproducibles.
  - Los cálculos coinciden con los resultados de referencia.
  - Las operaciones no autorizadas se rechazan.
  - Las rectificaciones mantienen la trazabilidad histórica.
  - Los archivos generados respetan las plantillas utilizadas en las pruebas.
  - Los fallos simulados no provocan pérdida silenciosa de calificaciones.
  - Las modificaciones posteriores no reintroducen defectos en los flujos previamente verificados.
- **Estado:** [X] Completado

---

## TAREAS DE ALTA PRIORIDAD (P1 - MEJORAS OPERATIVAS Y EVALUACIÓN AVANZADA)

---

### [X] [F9-Task10] Ampliar el libro de calificaciones para mejorar el registro individual y masivo
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task05 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Portal docente y administración de calificaciones)
- **Archivos Involucrados:**
  - `teacher-dashboard.html`
  - `js/teacher.js`
  - `backend/exam-service/Code.gs`
- **Dependencias Expuestas:** F9-Task03, permisos docentes, matrícula, servicio de calificaciones y mecanismos de persistencia
- **Descripción del Alcance:**
  Asegurar que el registro sea eficiente, claro y resistente a errores, especialmente cuando el docente administra varios grupos, numerosas actividades o cantidades elevadas de estudiantes.

  Requisitos Funcionales:
  1. Mostrar el grupo, asignatura, sección, período y docente correspondientes al libro abierto.
  2. Permitir consultar las calificaciones por estudiante, actividad, categoría y período.
  3. Facilitar la navegación entre celdas mediante teclado, sin exigir el uso constante del ratón.
  4. Permitir registrar notas y observaciones individualmente y en lotes.
  5. Admitir la importación de calificaciones desde archivos tabulares cuando se disponga de una estructura reconocible y validable.
  6. Permitir aplicar una calificación a un conjunto seleccionado de estudiantes, con confirmación previa y sin sobrescribir datos accidentalmente.
  7. Diferenciar visualmente las notas guardadas, los borradores, las actividades pendientes y los errores de validación.
  8. Mostrar el estado de guardado de cada lote y permitir identificar qué registros se guardaron y cuáles fallaron.
  9. Evitar duplicados cuando se repita una petición de guardado o el docente vuelva a intentar una operación tras una desconexión.
  10. Detectar modificaciones simultáneas y advertir cuando otro usuario haya cambiado los mismos datos.
  11. Advertir antes de abandonar una página con cambios pendientes y recuperar los borradores cuando sea posible.
  12. Permitir copiar configuraciones de evaluación entre grupos compatibles sin copiar calificaciones personales ni información que corresponda a otros estudiantes.
  13. Ofrecer filtros por estado de calificación, actividad y estudiante, además de una búsqueda rápida.
  14. Mantener la interfaz utilizable en dispositivos móviles y en pantallas pequeñas.
- **Criterios de Aceptación:**
  - Un docente solo puede consultar y editar los grupos y asignaturas que tiene autorizados.
  - Un lote con errores informa los registros afectados sin ocultar el resultado de los demás.
  - Repetir una operación no duplica calificaciones.
  - Una actualización concurrente no sobrescribe silenciosamente una modificación ajena.
  - Las modificaciones no guardadas se advierten antes de abandonar el libro.
  - El registro de grupos numerosos mantiene tiempos de respuesta aceptables y no produce guardados incompletos silenciosos.
  - La interfaz permite completar el flujo de registro desde teclado y dispositivos móviles.
- **Estado:** [X] Completado

---

### [X] [F9-Task11] Ampliar las recuperaciones académicas y su integración con los resultados oficiales
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task08 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Recuperaciones, evaluaciones extraordinarias y promoción académica)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `teacher-dashboard.html` / `js/teacher.js`
- **Dependencias Expuestas:** F9-Task03, F9-Task04, F9-Task07 y matrícula académica
- **Descripción del Alcance:**
  Garantizar que los métodos de recuperación se apliquen de acuerdo con las reglas institucionales y que el resultado sea coherente con los registros históricos, los boletines y los archivos oficiales.

  Requisitos Funcionales:
  1. Asociar cada recuperación con el estudiante, la asignatura, el período y la calificación original que pretende recuperar.
  2. Permitir registrar el motivo, la fecha, el tipo de recuperación y la regla de cálculo utilizada.
  3. Definir qué métodos están permitidos en cada contexto académico.
  4. Evitar que la recuperación cree accidentalmente una segunda calificación independiente que se contabilice como una actividad ordinaria adicional.
  5. Calcular el resultado final de acuerdo con la política aplicable, distinguiendo entre sustitución, promedio y conservación de la nota más alta.
  6. Validar los rangos y condiciones de las notas originales y recuperadas.
  7. Conservar las dos calificaciones y el método aplicado, incluso cuando el resultado oficial utilice únicamente una nota final.
  8. Actualizar los promedios, estados de aprobación, boletines e historiales que dependan de la calificación recuperada.
  9. Restringir el registro y la aprobación de recuperaciones según las responsabilidades asignadas.
  10. Evitar que una recuperación posterior altere un período cerrado sin seguir el procedimiento de rectificación o reapertura autorizado.
  11. Permitir consultar el historial de recuperaciones de un estudiante por período y asignatura.
- **Criterios de Aceptación:**
  - Cada recuperación queda vinculada a su calificación original.
  - El resultado coincide con el método configurado.
  - Una recuperación no se contabiliza dos veces en el promedio.
  - Los cambios se reflejan en los documentos dependientes.
  - Los períodos cerrados mantienen sus restricciones.
  - Las recuperaciones fuera de las condiciones permitidas se rechazan o quedan pendientes de autorización.
- **Estado:** [X] Completado

---

### [ ] [F9-Task12] Ampliar la evaluación por competencias, rúbricas e indicadores de logro
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task09 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Evaluación formativa y seguimiento del aprendizaje)
- **Archivos Involucrados:**
  - `backend/user-service/Code.gs`
  - `backend/exam-service/Code.gs`
  - `js/config.js`
- **Dependencias Expuestas:** F9-Task03, sistema de rúbricas, catálogo de competencias y permisos
- **Descripción del Alcance:**
  Garantizar que estas capacidades permitan evaluar competencias e indicadores de logro de manera consistente, sin reducir obligatoriamente todos los resultados a una nota numérica.

  Requisitos Funcionales:
  1. Permitir configurar competencias, indicadores de logro y niveles de desempeño por nivel educativo, grado y asignatura.
  2. Asociar las actividades y rúbricas con las competencias que evalúan.
  3. Permitir definir criterios de evaluación con descripciones, niveles de desempeño y puntuaciones opcionales.
  4. Admitir escalas cualitativas y numéricas, con equivalencias configurables cuando sean necesarias.
  5. Permitir registrar observaciones específicas por estudiante y criterio evaluado.
  6. Mostrar el nivel alcanzado en cada competencia y los indicadores que todavía no han sido evaluados.
  7. Diferenciar entre una competencia no evaluada y una competencia evaluada cuyo resultado sea insuficiente.
  8. Permitir consolidar resultados de varias actividades sin duplicar la contribución de una misma competencia.
  9. Mantener la relación entre cada resultado y la rúbrica, la versión de los criterios y la actividad utilizada.
  10. Permitir reutilizar rúbricas en asignaturas o grupos compatibles sin compartir accidentalmente resultados individuales.
  11. Presentar al docente un resumen de las competencias que requieren atención y de los criterios con resultados insuficientes.
  12. Mostrar a estudiantes y tutores únicamente los resultados y observaciones que tengan autorización para consultar.
- **Criterios de Aceptación:**
  - Cada resultado puede relacionarse con una competencia y un criterio de evaluación.
  - Las escalas cualitativas se conservan sin conversiones numéricas obligatorias.
  - Las competencias pendientes se distinguen de las evaluadas.
  - Las rúbricas reutilizadas mantienen su configuración sin mezclar las notas de diferentes grupos.
  - Las consolidaciones coinciden con las reglas configuradas.
  - Los resultados se muestran únicamente a los perfiles autorizados.
- **Estado:** [ ] Pendiente

---

### [ ] [F9-Task13] Optimizar la exportación académica y los formatos de intercambio
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task11 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Exportaciones, interoperabilidad y reportes descargables)
- **Archivos Involucrados:**
  - `backend/academic-service/Code.gs`
  - `js/secretary.js` / `js/teacher.js`
- **Dependencias Expuestas:** F9-Task01, F9-Task02, F9-Task04 y F9-Task10
- **Descripción del Alcance:**
  Proporcionar opciones de exportación para análisis interno en formatos adicionales (XLSX, CSV) sin alterar ni sustituir el formato oficial requerido por SACE.

  Requisitos Funcionales:
  1. Permitir exportar calificaciones por estudiante, asignatura, sección, grupo, docente y período, según los permisos del usuario.
  2. Mantener la compatibilidad con las plantillas oficiales de SACE y diferenciar esa operación de las exportaciones destinadas a análisis interno.
  3. Ofrecer formatos adicionales para los reportes internos cuando resulten útiles, como XLSX y CSV, sin sustituir ni modificar el formato oficial requerido.
  4. Permitir seleccionar las actividades, categorías, calificaciones, observaciones y resultados que se incluirán en los reportes compatibles con cada formato.
  5. Incluir identificadores fiables para relacionar los registros exportados con los estudiantes y las actividades correspondientes.
  6. Diferenciar las calificaciones definitivas de los borradores y las notas que todavía no han sido aprobadas.
  7. Proporcionar una vista previa de los datos que se exportarán antes de generar el archivo.
  8. Registrar la fecha, el usuario, el contexto académico y el resultado de cada operación de exportación.
  9. Detectar registros incompletos y ofrecer un informe de errores que permita corregirlos.
  10. Evitar la duplicación de registros cuando se repita una exportación o se regenere un archivo.
  11. Permitir exportar únicamente los registros nuevos o modificados cuando el formato y el proceso de destino admitan esa modalidad.
  12. Conservar los permisos y las restricciones de acceso al exportar datos de varios grupos o estudiantes.
- **Criterios de Aceptación:**
  - Los archivos contienen únicamente los registros incluidos en los filtros seleccionados.
  - Los valores exportados coinciden con los resultados académicos oficiales.
  - Los borradores no se presentan como calificaciones definitivas.
  - Los archivos oficiales conservan la estructura exigida por su plantilla.
  - Los errores de exportación identifican los registros afectados.
  - Las exportaciones no permiten acceder a información fuera del ámbito autorizado.
  - La repetición de una exportación no modifica las calificaciones originales.
- **Estado:** [ ] Pendiente

---

### [ ] [F9-Task14] Mejorar el rendimiento, la persistencia y la recuperación de operaciones de calificación
- **Origen del Hallazgo:** `AUDITORIA_FASE_9_EVALUACIONES_CALIFICACIONES_RESULTADOS.md` / Tarea F9-Task13 (P1)
- **Prioridad:** P1
- **Severidad/Clasificación:** Alta (Estabilidad, rendimiento y almacenamiento)
- **Archivos Involucrados:**
  - `backend/exam-service/Code.gs`
  - `js/api.js`
- **Dependencias Expuestas:** F9-Task04, F9-Task05, servicios de persistencia y mecanismos de auditoría
- **Descripción del Alcance:**
  Optimizar las operaciones masivas de lectura y escritura para reducir el consumo de cuotas, evitar bloqueos y acelerar la respuesta del libro de calificaciones.

  Requisitos Funcionales:
  1. Medir los tiempos de respuesta de las consultas y operaciones de guardado del libro de calificaciones.
  2. Identificar los cuellos de botella asociados a lecturas y escrituras repetidas en Google Sheets, procesamiento masivo y generación de reportes.
  3. Optimizar las operaciones masivas para evitar consultas repetitivas por cada estudiante cuando sea posible procesar los datos en lotes.
  4. Validar la integridad de los datos antes de persistirlos.
  5. Evitar registros duplicados cuando se repitan solicitudes debido a una desconexión, un tiempo de espera agotado o un reintento del usuario.
  6. Proporcionar resultados claros cuando una operación se complete parcialmente, identificando los registros guardados y los pendientes.
  7. Implementar mecanismos de concurrencia adecuados para evitar que dos usuarios sobrescriban cambios incompatibles.
  8. Mantener consistencia entre las calificaciones, los promedios calculados y los estados de publicación.
  9. Detectar cuándo las limitaciones del almacenamiento actual comienzan a afectar los tiempos de respuesta o la integridad de las operaciones.
  10. Documentar umbrales medibles para evaluar cuándo se requiere optimizar consultas, introducir procesamiento por lotes o considerar una migración de almacenamiento.
  11. Evitar migraciones o rediseños de infraestructura sin evidencia de que el almacenamiento actual resulta insuficiente.
  12. Verificar que los mecanismos de recuperación no restauren datos antiguos sobre calificaciones oficiales más recientes.
- **Criterios de Aceptación:**
  - Las operaciones masivas de prueba terminan dentro de los umbrales de rendimiento definidos para el tamaño de grupo esperado.
  - Los errores de persistencia se notifican de forma clara.
  - Los reintentos no crean duplicados ni sobrescriben silenciosamente cambios ajenos.
  - Los datos almacenados permanecen coherentes con los resultados calculados.
  - Las operaciones interrumpidas pueden identificarse y recuperarse sin alterar registros no relacionados.
  - Los indicadores de rendimiento permiten detectar degradaciones antes de que afecten significativamente al uso diario.
- **Estado:** [ ] Pendiente
