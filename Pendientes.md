

Backlog maestro de resolución, optimización y evolución

Plataforma Integral de Gestión Educativa

Proyecto: New Generation Christian Academy / Instituto María Auxiliadora
Desarrollo: JyP Solutions
Alcance: Nivel 1, sustitución operativa
Estado de partida declarado por el informe: once áreas completas y verificadas
Autorización de ejecución: pendiente de aprobación expresa para modificar el código

1. Reglas de ejecución del backlog

1.1. Principio de evidencia

El informe de auditoría declara las once áreas completas, pero no proporciona numerosos nombres de archivos, módulos, funciones y ubicaciones reales. Por tanto, ninguna tarea debe dar por probado un defecto que no esté documentado con evidencias reproducibles.

Antes de corregir o desarrollar una capacidad, Jules deberá:

1. Localizar la implementación real y sus dependencias.
2. Identificar el requisito original y el comportamiento actual.
3. Reproducir el problema o comprobar la necesidad mediante una prueba.
4. Registrar el resultado esperado y el observado.
5. Clasificar la brecha según el impacto.
6. Proponer la modificación mínima que resuelva el problema.
7. Obtener autorización antes de modificar el código.
8. Ejecutar las pruebas de aceptación y regresión después de implementar el cambio.

Si una capacidad ya cumple los criterios, la tarea deberá cerrarse como verificada o convertirse, cuando exista valor adicional demostrable, en una mejora opcional. No se debe reimplementar una función existente solo para satisfacer el nombre de una tarea.

1.2. Prioridades

- P0: riesgo crítico para datos, seguridad, integridad financiera o continuidad operativa.
- P1: requisito esencial incumplido o proceso institucional que produce resultados incorrectos.
- P2: mejora operativa importante, reducción de trabajo manual o ampliación funcional justificada.
- P3: mejora complementaria, comodidad, personalización o capacidad avanzada de menor impacto inmediato.

Las prioridades iniciales de las tareas de validación indican su importancia preventiva, no que ya exista un defecto.

1.3. Tipos de tarea

- V: verificación y diagnóstico.
- C: corrección condicionada a una brecha confirmada.
- M: mejora funcional o técnica.
- N: nueva capacidad condicionada a que no exista una implementación equivalente.

2. Fase 0. Validación del informe y establecimiento de la línea base

BASE-01. Reconstruir el inventario real de componentes

Prioridad: P1
Tipo: V

Objetivo: vincular las capacidades descritas en el informe con sus implementaciones reales.

Problema que resuelve: el informe contiene numerosas referencias a componentes y ubicaciones vacías, por lo que no es posible reconstruir desde él qué archivos, servicios y funciones respaldan cada afirmación.

Acciones:

- Leer la metodología de desarrollo y los requisitos vigentes.
- Inventariar las once áreas y sus subcapacidades.
- Localizar modelos, servicios, interfaces, permisos, pruebas, migraciones y dependencias.
- Registrar nombres y rutas reales, sin deducirlos por el nombre comercial de una función.
- Detectar implementaciones duplicadas, dependencias circulares y funciones declaradas que no tienen correspondencia ejecutable.

Criterios de aceptación:

- Cada subcapacidad del alcance tiene un identificador estable.
- Cada capacidad declarada como implementada tiene una referencia comprobable a su implementación.
- Las ubicaciones no encontradas quedan registradas como pendientes de verificación, no como ausencias definitivas.
- El inventario distingue código, documentación, interfaz, ejecución y verificación.
- El repositorio permanece sin modificaciones.

BASE-02. Revalidar la cobertura de inspección y verificación

Prioridad: P1
Tipo: V

Objetivo: comprobar la afirmación de cobertura global del 100 %.

Acciones:

- Reconstruir la matriz de pruebas de cada área.
- Verificar que cada criterio de aceptación tiene evidencia asociada.
- Repetir las pruebas críticas disponibles.
- Separar las pruebas ejecutadas de las pruebas que únicamente aparecen descritas.
- Identificar pruebas bloqueadas, incompletas o no reproducibles.

Criterios de aceptación:

- La cobertura se calcula a partir del inventario real.
- Cada resultado satisfactorio incluye pasos, datos de prueba y evidencia.
- Las pruebas bloqueadas no cuentan como verificaciones satisfactorias.
- La cobertura de inspección y la de verificación se informan por separado.
- El informe consolidado identifica las afirmaciones originales que pudieron confirmarse y las que siguen pendientes.

BASE-03. Construir una línea base de pruebas y regresión

Prioridad: P1
Tipo: V

Objetivo: disponer de una referencia para medir los efectos de futuras modificaciones.

Acciones:

- Identificar las pruebas automatizadas y manuales existentes.
- Ejecutar las pruebas seguras disponibles.
- Registrar errores previos, advertencias y limitaciones del entorno.
- Determinar qué operaciones carecen de pruebas reproducibles.
- Preparar conjuntos de datos sintéticos para los principales flujos institucionales.

Criterios de aceptación:

- Existe un informe de pruebas iniciales con resultados reproducibles.
- Los fallos preexistentes se distinguen de los introducidos posteriormente.
- Los conjuntos de prueba cubren, como mínimo, matrícula, notas, asistencia, cobros, contabilidad, documentos y permisos.
- Las pruebas no dependen de información personal real cuando pueden utilizar datos ficticios.

BASE-04. Crear el registro único de brechas y decisiones

Prioridad: P2
Tipo: M

Objetivo: evitar que hallazgos, mejoras y tareas de desarrollo queden dispersos.

Acciones:

- Consolidar los hallazgos en un backlog único.
- Relacionar cada tarea con su evidencia, requisito y criterio de aceptación.
- Registrar dependencias, prioridad, responsable, estado y bloqueos.
- Distinguir defectos confirmados de mejoras propuestas.
- Registrar las decisiones de no implementar una propuesta y sus motivos.

Criterios de aceptación:

- Cada tarea tiene un identificador único.
- No existen tareas duplicadas para la misma brecha sin una justificación.
- Cada cierre incluye evidencias y resultados de las pruebas.
- Los cambios de prioridad quedan justificados.

3. Fase 1. Seguridad e integridad transversal

SEC-01. Verificar la aplicación efectiva de permisos

Prioridad: P0
Tipo: V; C si se confirma una brecha

Objetivo: garantizar que los permisos se apliquen tanto en la interfaz como en el servidor.

Acciones:

- Inventariar los roles y permisos reales.
- Probar consultas, modificaciones, exportaciones y operaciones críticas con diferentes roles.
- Intentar acceder a registros mediante identificadores directos.
- Comprobar la protección de expedientes, notas, pagos, nóminas y documentos.
- Revisar las operaciones de aprobación, cierre y anulación.

Criterios de aceptación:

- Las operaciones no autorizadas son rechazadas en el servidor.
- La manipulación de identificadores no permite consultar datos de otros usuarios.
- Los roles limitados no pueden modificar permisos ni elevar sus privilegios.
- Las exportaciones y descargas aplican las mismas restricciones que las consultas.
- Si se detecta una brecha, se documentan los componentes afectados y se crea una tarea de corrección específica.

SEC-02. Fortalecer el registro de auditoría

Prioridad: P1
Tipo: V/M

Objetivo: garantizar que las operaciones relevantes puedan reconstruirse posteriormente.

Acciones:

- Comprobar qué eventos se registran realmente.
- Revisar actor, fecha, entidad afectada, operación, resultado y contexto disponible.
- Verificar la trazabilidad de modificaciones de notas, pagos, nóminas, cierres y permisos.
- Evaluar la resistencia a alteraciones por usuarios sin autorización.
- Revisar que los registros no expongan contraseñas, tokens ni datos sensibles innecesarios.

Criterios de aceptación:

- Las operaciones críticas generan eventos verificables.
- Los eventos permiten identificar quién realizó la operación y sobre qué registro.
- Los cambios relevantes conservan información suficiente para reconstruir el antes y el después, conforme a la política de auditoría.
- Los usuarios ordinarios no pueden borrar ni alterar los registros protegidos.
- La retención y el acceso a los logs están documentados.

SEC-03. Verificar aislamiento de datos y privacidad

Prioridad: P0
Tipo: V; C si se confirma una brecha

Objetivo: impedir filtraciones entre estudiantes, familias, docentes y personal administrativo.

Acciones:

- Probar relaciones entre representantes, estudiantes y cuentas de usuario.
- Revisar descargas, documentos, informes y enlaces compartidos.
- Comprobar las respuestas de error y las rutas de acceso directo.
- Verificar permisos en las operaciones masivas.
- Revisar la exposición de información en logs y exportaciones.

Criterios de aceptación:

- Cada usuario accede exclusivamente a la información permitida por su rol y relaciones autorizadas.
- Las operaciones masivas respetan el ámbito de autorización.
- Los documentos privados no quedan accesibles mediante enlaces no protegidos.
- Los errores no revelan datos de terceros ni secretos de infraestructura.

SEC-04. Comprobar consistencia transaccional e idempotencia

Prioridad: P0
Tipo: V/M

Objetivo: evitar operaciones duplicadas o parcialmente aplicadas cuando se producen reintentos, fallos de red o solicitudes concurrentes.

Acciones:

- Identificar operaciones críticas que modifican varios registros.
- Probar solicitudes repetidas y peticiones concurrentes en entornos de prueba.
- Comprobar las transacciones, restricciones y mecanismos de idempotencia.
- Verificar la recuperación ante fallos intermedios.
- Inspeccionar los procesos de sincronización con proveedores externos.

Criterios de aceptación:

- Una misma operación lógica no produce efectos duplicados por reintentos.
- Las operaciones que requieren atomicidad no dejan registros parcialmente aplicados.
- Los fallos generan estados claros y recuperables.
- Las operaciones financieras y académicas conservan la integridad de sus relaciones.
- La solución propuesta no introduce bloqueos ni degrada el rendimiento de los flujos habituales.

SEC-05. Verificar copias de seguridad y recuperación

Prioridad: P1
Tipo: V/M

Objetivo: demostrar que la información institucional puede recuperarse íntegramente.

Acciones:

- Identificar los mecanismos reales de respaldo.
- Comprobar integridad, frecuencia, retención y protección de las copias.
- Verificar qué datos y archivos quedan incluidos o excluidos.
- Diseñar una restauración controlada en un entorno aislado.
- Comparar los datos recuperados con la línea base.

Criterios de aceptación:

- La restauración de prueba recupera los datos y relaciones documentados.
- Los archivos y metadatos mantienen su integridad.
- Se documentan los tiempos de recuperación y los datos que podrían perderse según la frecuencia de respaldo.
- La restauración no sobrescribe accidentalmente datos de producción.
- Los procedimientos y responsables de recuperación están documentados.

4. Fase 2. Matrícula y expedientes

MAT-01. Validar el ciclo de admisión y matrícula

Prioridad: P1
Tipo: V; C si se confirma una brecha

Objetivo: garantizar un proceso completo desde la solicitud hasta la matrícula confirmada.

Acciones:

- Probar solicitudes válidas e incompletas.
- Verificar cupos, duplicados, periodos y estados.
- Comprobar las asignaciones académicas y la generación de obligaciones financieras.
- Probar reinscripciones y cambios de sección.
- Verificar la preservación del historial.

Criterios de aceptación:

- No se confirma una matrícula que incumple requisitos obligatorios.
- Los duplicados potenciales se detectan sin fusionar personas automáticamente.
- Los cambios de matrícula se reflejan de forma coherente en los módulos dependientes.
- Los cargos se generan según las reglas aplicables, sin duplicaciones.
- El historial de periodos anteriores permanece íntegro.

MAT-02. Mejorar la gestión de excepciones de matrícula

Prioridad: P2
Tipo: M

Objetivo: reducir el trabajo manual en casos de documentos pendientes, cupos completos, cambios y excepciones autorizadas.

Acciones:

- Identificar los casos excepcionales más frecuentes.
- Evaluar listas de espera, seguimiento de requisitos y motivos de devolución, si aportan valor al proceso institucional.
- Proponer un flujo controlado de excepciones con responsables y trazabilidad.
- Evitar que las excepciones permitan eludir validaciones esenciales.

Criterios de aceptación:

- Cada excepción tiene un motivo, responsable y estado.
- Las aprobaciones extraordinarias requieren los permisos adecuados.
- Las excepciones no alteran las reglas generales para otros estudiantes.
- La institución puede consultar las solicitudes pendientes y su causa.

EXP-01. Verificar integridad y unicidad de expedientes

Prioridad: P1
Tipo: V; C si se confirma una brecha

Objetivo: mantener un expediente coherente a lo largo de la vida académica.

Acciones:

- Probar creación, actualización, traslado, retiro, reingreso y consulta.
- Revisar la relación entre estudiantes, tutores y documentos.
- Verificar la fusión de duplicados y la preservación de antecedentes.
- Comprobar las restricciones de edición y consulta.

Criterios de aceptación:

- El expediente mantiene una identidad coherente.
- Las fusiones autorizadas conservan las relaciones y el historial exigido.
- No se eliminan antecedentes por cambios de periodo o situación.
- Las relaciones con representantes pueden corregirse sin alterar indebidamente los datos de otros estudiantes.

EXP-02. Mejorar búsqueda y gestión documental del expediente

Prioridad: P2
Tipo: M

Objetivo: reducir el tiempo necesario para localizar y validar información.

Acciones:

- Evaluar búsqueda por identificadores, nombre, estado, curso y otros campos pertinentes.
- Revisar filtros, ordenación y navegación entre registros.
- Comprobar la carga, validación y consulta de documentos.
- Identificar tareas que obliguen a repetir datos ya disponibles en el expediente.

Criterios de aceptación:

- Los resultados respetan los permisos y los filtros solicitados.
- Los duplicados potenciales se identifican sin confundir personas.
- Los documentos pendientes pueden localizarse por estado y requisito.
- No se exige introducir repetidamente información que ya existe y es válida.

5. Fase 3. Calificaciones y asistencia

ACA-01. Verificar cálculos y reglas de evaluación

Prioridad: P0 si se detectan notas incorrectas; de lo contrario, P1
Tipo: V; C si se confirma una brecha

Objetivo: asegurar que los promedios y resultados oficiales sean correctos.

Acciones:

- Identificar las escalas, ponderaciones, redondeos y reglas de recuperación configuradas.
- Construir casos de prueba con resultados esperados conocidos.
- Probar valores extremos, datos incompletos y modificaciones de ponderaciones.
- Comparar la libreta, los promedios y los documentos oficiales.

Criterios de aceptación:

- Los resultados coinciden con las fórmulas configuradas.
- Los valores inválidos se rechazan o gestionan según reglas explícitas.
- Las modificaciones recalculan únicamente los resultados afectados.
- Las notas publicadas conservan trazabilidad ante rectificaciones.

ACA-02. Fortalecer cierres y rectificaciones de calificaciones

Prioridad: P1
Tipo: V/M

Objetivo: mantener la integridad de los resultados publicados y de los periodos anteriores.

Acciones:

- Probar cierres de periodo y restricciones posteriores.
- Comprobar el flujo de rectificación excepcional.
- Verificar el historial de cambios y los permisos.
- Revisar los efectos sobre boletines e informes.

Criterios de aceptación:

- Los periodos cerrados no admiten modificaciones ordinarias no autorizadas.
- Las rectificaciones registran motivo, responsable y valores afectados.
- Los documentos oficiales reflejan la versión vigente sin borrar la trazabilidad histórica.
- Las pruebas de regresión confirman que los años anteriores no se alteran indebidamente.

ACA-03. Optimizar el flujo de evaluación y retroalimentación

Prioridad: P2
Tipo: M

Objetivo: reducir el trabajo repetitivo de los docentes y mejorar el seguimiento del aprendizaje.

Acciones:

- Evaluar la gestión conjunta de entregas pendientes, revisadas, calificadas y devueltas.
- Revisar la aplicación práctica de rúbricas y criterios de evaluación.
- Identificar oportunidades para reutilizar rúbricas y comentarios.
- Evaluar filtros por estudiante, actividad, sección y estado.
- Verificar que las mejoras no automaticen decisiones académicas que requieren criterio docente.

Criterios de aceptación:

- El docente puede identificar las actividades pendientes sin revisar registros individualmente.
- Las rúbricas aplicadas conservan criterios, puntuaciones y retroalimentación.
- Las herramientas de revisión reducen pasos sin cambiar el resultado académico.
- Los comentarios y calificaciones se asocian al estudiante correcto.
- La publicación y devolución respetan los permisos configurados.

ASI-01. Validar registro y corrección de asistencia

Prioridad: P1
Tipo: V; C si se confirma una brecha

Objetivo: garantizar que los registros de asistencia sean coherentes, completos y auditables.

Acciones:

- Probar registro individual y masivo.
- Verificar horarios, sesiones, estados y justificaciones.
- Probar modificaciones posteriores.
- Comparar los registros con los informes.

Criterios de aceptación:

- No se generan registros duplicados para una misma sesión y estudiante.
- Las justificaciones respetan el flujo de aprobación.
- Las correcciones conservan la trazabilidad exigida.
- Los totales coinciden con los registros de origen.

ASI-02. Mejorar alertas y seguimiento de ausencias

Prioridad: P2
Tipo: M

Objetivo: facilitar la detección de ausencias recurrentes y justificaciones pendientes.

Acciones:

- Revisar las reglas de alerta existentes.
- Evaluar umbrales configurables y filtros por periodo, estudiante y sección.
- Comprobar que las alertas puedan distinguirse de las notificaciones ya enviadas.
- Evitar avisos redundantes y falsos positivos.

Criterios de aceptación:

- Las alertas se generan a partir de datos verificables.
- Los umbrales aplicados son visibles y configurables por usuarios autorizados.
- Las justificaciones aceptadas actualizan el seguimiento.
- Los avisos no duplican comunicaciones por reintentos.

6. Fase 4. Aula virtual

AULA-01. Validar el ciclo completo de actividades y entregas

Prioridad: P1
Tipo: V; C si se confirma una brecha

Objetivo: asegurar que publicar, entregar, revisar y calificar una actividad funcione como un solo proceso coherente.

Acciones:

- Probar creación de actividades, fechas límite y asignación de participantes.
- Probar entregas nuevas, reanudación, sustitución y errores de carga.
- Verificar versiones, huellas digitales y estados de entrega.
- Revisar la relación entre la actividad y la libreta de notas.

Criterios de aceptación:

- Cada entrega conserva su autor, actividad, estado y marca temporal.
- Una interrupción no presenta como completado un archivo incompleto.
- La reanudación no duplica ni corrompe la entrega.
- Las sustituciones siguen las reglas permitidas y conservan la trazabilidad necesaria.
- Las calificaciones se sincronizan correctamente cuando existe esa integración.

AULA-02. Mejorar seguimiento de tareas pendientes

Prioridad: P2
Tipo: M

Objetivo: permitir que docentes y estudiantes identifiquen claramente las acciones pendientes.

Acciones:

- Evaluar vistas por estado de entrega, revisión, calificación y devolución.
- Comprobar filtros por asignatura, grupo y fecha.
- Identificar actividades vencidas o con entregas sin revisar.
- Evitar notificaciones que repitan información ya disponible en el panel.

Criterios de aceptación:

- Cada actividad muestra un estado coherente con su situación real.
- Los filtros permiten localizar las tareas pendientes.
- Las fechas y estados se actualizan tras las operaciones pertinentes.
- La vista del estudiante no revela entregas de terceros.

AULA-03. Optimizar acceso a materiales y archivos

Prioridad: P2
Tipo: M

Objetivo: mejorar la disponibilidad y organización de los recursos educativos.

Acciones:

- Revisar los tipos de material admitidos.
- Comprobar búsqueda, organización, permisos y disponibilidad.
- Evaluar la recuperación de descargas interrumpidas cuando corresponda.
- Verificar el acceso móvil y el comportamiento con conectividad limitada.

Criterios de aceptación:

- Los materiales publicados pueden localizarse por los criterios disponibles.
- Los permisos se aplican al consultar y descargar.
- Los errores de carga se comunican claramente.
- Las optimizaciones no invalidan archivos ni enlaces existentes.

7. Fase 5. Pagos, facturación y cuentas por cobrar

FIN-01. Validar saldos y aplicación de pagos

Prioridad: P0 si se detectan saldos incorrectos; de lo contrario, P1
Tipo: V; C si se confirma una brecha

Objetivo: garantizar la exactitud de obligaciones, pagos, saldos y comprobantes.

Acciones:

- Probar cargos, pagos parciales, anticipos, descuentos y saldos pendientes.
- Verificar la asociación entre pagos y obligaciones.
- Comprobar la idempotencia y el tratamiento de concurrencia.
- Comparar estados de cuenta, recibos y reportes.

Criterios de aceptación:

- Los saldos coinciden con los movimientos válidos.
- Los pagos se aplican a las obligaciones correctas.
- Las solicitudes repetidas no duplican pagos.
- Los recibos coinciden con los importes efectivamente registrados.
- Las anulaciones y devoluciones conservan el historial.

FIN-02. Fortalecer la verificación de transferencias bancarias

Prioridad: P1
Tipo: V/M

Objetivo: reducir los errores en la revisión manual de comprobantes y la confirmación de transferencias.

Acciones:

- Revisar los estados de la cola de verificación.
- Comprobar la detección de comprobantes repetidos.
- Evaluar los datos mínimos requeridos para la revisión.
- Verificar la separación entre comprobante aportado y transferencia confirmada.
- Revisar la trazabilidad de aprobación y rechazo.

Criterios de aceptación:

- Un comprobante no constituye por sí solo una confirmación bancaria cuando se requiere validación.
- Los revisores pueden identificar duplicados potenciales.
- Cada decisión registra responsable, fecha y motivo.
- Los pagos rechazados o pendientes no se contabilizan como ingresos cobrados.
- La aprobación no duplica el saldo ni el asiento financiero correspondiente.

FIN-03. Validar facturación y cumplimiento fiscal hondureño

Prioridad: P1
Tipo: V; C si se confirma una brecha

Objetivo: comprobar que los documentos fiscales y los cálculos aplicables se ajusten a las obligaciones vigentes.

Acciones:

- Inventariar los documentos y flujos fiscales implementados.
- Verificar los tipos de operación y las reglas fiscales aplicables.
- Contrastar la implementación con documentación oficial vigente.
- Comprobar numeración, fechas, importes, impuestos, anulaciones y conservación de documentos.
- Identificar requisitos que necesiten validación de un profesional contable o tributario.

Criterios de aceptación:

- Los cálculos corresponden a la regla fiscal aplicable a cada operación.
- Las exenciones y tratamientos especiales se aplican solo cuando están debidamente configurados.
- La numeración y los documentos conservan consistencia.
- La implementación no se declara conforme solo porque utilice una tasa fija.
- Las obligaciones que requieran validación especializada quedan documentadas antes de declarar cumplimiento.

FIN-04. Mejorar conciliación de cobros y pagos

Prioridad: P2
Tipo: M

Objetivo: reducir la revisión manual y facilitar la detección de discrepancias.

Acciones:

- Evaluar una vista de movimientos pendientes de conciliación.
- Proponer reglas de coincidencia por importe, fecha, referencia y cuenta.
- Permitir que los casos ambiguos requieran revisión humana.
- Registrar la justificación de ajustes y diferencias.

Criterios de aceptación:

- Las coincidencias propuestas pueden revisarse antes de confirmarse.
- Los casos ambiguos no se concilian automáticamente.
- Los movimientos ya conciliados no se duplican.
- Las diferencias pendientes se pueden localizar y explicar.

FIN-05. Verificar pasarelas de pago e integraciones externas

Prioridad: P1
Tipo: V; C/M si se confirma una brecha

Objetivo: garantizar que los pagos en línea sean seguros, verificables y recuperables.

Acciones:

- Inventariar proveedores realmente conectados.
- Revisar los flujos de autorización, confirmación, rechazo y cancelación.
- Verificar autenticidad de las notificaciones del proveedor.
- Comprobar la idempotencia y los estados ante fallos.
- Revisar la protección de credenciales y datos sensibles.
- Identificar comisiones y costes operativos.

Criterios de aceptación:

- El estado final del pago se fundamenta en una respuesta verificable del proveedor.
- Las notificaciones falsas o no autenticadas se rechazan.
- Los reintentos no generan cobros duplicados.
- Los secretos no se exponen en código cliente ni logs.
- Las pruebas se realizan en modo de pruebas sin transacciones reales.

8. Fase 6. Contabilidad, compras e inventario

CON-01. Verificar integridad de partida doble

Prioridad: P0 si hay asientos desequilibrados; de lo contrario, P1
Tipo: V; C si se confirma una brecha

Objetivo: demostrar que el sistema contable mantiene consistencia en sus movimientos.

Acciones:

- Identificar el modelo contable real.
- Probar asientos manuales y operaciones generadas desde cobros, compras y otros módulos.
- Verificar débitos, créditos, periodos y cuentas.
- Probar anulaciones y ajustes.
- Comparar libro diario, mayor y balance de comprobación.

Criterios de aceptación:

- Los asientos sujetos a partida doble mantienen igualdad entre débitos y créditos.
- Los asientos inválidos no se confirman.
- Los documentos de origen pueden relacionarse con sus movimientos contables.
- Las anulaciones conservan trazabilidad.
- Los informes contables concuerdan con los movimientos registrados.

CON-02. Fortalecer conciliación bancaria y de caja

Prioridad: P1
Tipo: V/M

Objetivo: mejorar la detección y resolución de diferencias entre registros y extractos.

Acciones:

- Probar importación de extractos y detección de movimientos repetidos.
- Evaluar coincidencias sugeridas y conciliación parcial.
- Comprobar saldos iniciales, finales y partidas pendientes.
- Verificar el cierre de caja y el arqueo físico.
- Documentar las reglas para diferencias y ajustes.

Criterios de aceptación:

- Los movimientos importados no se duplican por reintentos.
- Las conciliaciones conservan las referencias de los movimientos relacionados.
- Las diferencias no se eliminan mediante ajustes automáticos sin justificación.
- Los cierres muestran los saldos y las discrepancias pendientes.
- Los usuarios autorizados pueden revisar el historial de conciliación.

CON-03. Mejorar análisis por centros de costo y presupuesto

Prioridad: P2
Tipo: M

Objetivo: facilitar la comparación entre presupuesto y ejecución por áreas institucionales.

Acciones:

- Verificar la estructura de centros de costo y asignaciones.
- Evaluar presupuestos por periodo y categoría.
- Comprobar la trazabilidad desde cada gasto hasta su clasificación.
- Proponer alertas por desviaciones si existe una necesidad institucional demostrable.

Criterios de aceptación:

- Los movimientos se asignan a centros de costo válidos.
- Los informes distinguen presupuesto, ejecución y variación.
- Los totales coinciden con los movimientos contables.
- Las alertas utilizan umbrales configurables y no sustituyen los controles de aprobación.

CON-04. Verificar compras, proveedores e inventario

Prioridad: P1 si afecta saldos o existencias; de lo contrario, P2
Tipo: V; C/M si se confirma una brecha

Objetivo: comprobar la coherencia entre compras, recepción, inventario, cuentas por pagar y contabilidad.

Acciones:

- Verificar proveedores, solicitudes, órdenes y documentos de compra existentes.
- Probar recepción parcial y total cuando esté implementada.
- Comprobar entradas, salidas, devoluciones y ajustes de inventario.
- Verificar los métodos de valoración utilizados.
- Revisar la relación con facturas y pagos a proveedores.

Criterios de aceptación:

- Los movimientos de inventario conservan cantidad, referencia, fecha y motivo.
- Las recepciones no duplican existencias.
- Los saldos de proveedores concuerdan con las obligaciones pendientes.
- Las valoraciones siguen el método configurado.
- Los ajustes de inventario requieren permisos y dejan trazabilidad.

9. Fase 7. Nómina y personal

NOM-01. Validar cálculos y reglas de planilla

Prioridad: P0 si existen cálculos incorrectos; de lo contrario, P1
Tipo: V; C si se confirma una brecha

Objetivo: verificar que las planillas produzcan resultados correctos según las reglas laborales y fiscales aplicables.

Acciones:

- Identificar las reglas y parámetros realmente configurados.
- Construir casos de prueba con salarios, periodos, deducciones y situaciones laborales representativas.
- Comparar los resultados con cálculos de referencia revisados.
- Verificar las reglas vigentes de IHSS, RAP, ISR y otros conceptos que correspondan.
- Documentar los parámetros sujetos a cambios normativos.

Criterios de aceptación:

- Los importes coinciden con los cálculos de referencia para los casos probados.
- Los parámetros están documentados y se pueden actualizar de forma controlada.
- Las reglas históricas pueden reconstruirse para planillas anteriores.
- Los cálculos que no puedan validarse normativamente no se declaran conformes.

NOM-02. Fortalecer el ciclo de aprobación y cierre de planillas

Prioridad: P1
Tipo: V/M

Objetivo: impedir modificaciones silenciosas y pagos duplicados.

Acciones:

- Probar las transiciones reales de estado de una planilla.
- Verificar la separación entre preparación, revisión, aprobación y pago.
- Comprobar la generación de recibos individuales.
- Revisar la integración con contabilidad.

Criterios de aceptación:

- Cada transición cumple las reglas de autorización.
- Una planilla cerrada no se altera sin un proceso autorizado.
- Los recibos coinciden con los importes aprobados.
- Los pagos y movimientos contables asociados no se duplican.
- Las rectificaciones conservan el historial.

NOM-03. Mejorar gestión de empleados y cambios contractuales

Prioridad: P2
Tipo: M

Objetivo: mantener un historial laboral consistente y reducir errores en la preparación de planillas.

Acciones:

- Revisar la gestión de contratos, cargos y remuneraciones.
- Evaluar fechas de vigencia y cambios programados.
- Comprobar las relaciones entre personal, cuentas de usuario y permisos.
- Identificar procesos manuales repetitivos.

Criterios de aceptación:

- Los cambios de condiciones tienen fechas de vigencia identificables.
- Las planillas históricas no cambian por modificaciones actuales.
- Los expedientes laborales están protegidos.
- Los cambios de personal no conceden automáticamente permisos incompatibles.

10. Fase 8. Gestión documental

DOC-01. Verificar plantillas y generación de documentos

Prioridad: P1
Tipo: V; C si se confirma una brecha

Objetivo: garantizar que los documentos generados sean correctos, legibles y coherentes con los registros fuente.

Acciones:

- Identificar las plantillas disponibles y los tipos de documento admitidos.
- Probar campos variables, formatos, páginas y casos con datos largos.
- Verificar generación de PDF y conservación de la versión emitida.
- Comprobar el comportamiento ante datos faltantes.

Criterios de aceptación:

- Los documentos muestran los datos correspondientes al registro y periodo seleccionados.
- No aparecen variables sin resolver ni datos de otras personas.
- Los documentos extensos mantienen legibilidad y formato.
- Los errores de generación se notifican y no producen archivos incompletos presentados como válidos.

DOC-02. Fortalecer la verificación documental

Prioridad: P1
Tipo: V/M

Objetivo: comprobar que los códigos de verificación permiten validar documentos sin exponer datos innecesarios.

Acciones:

- Verificar unicidad y estabilidad de los códigos emitidos.
- Probar códigos inválidos, documentos sustituidos y documentos anulados.
- Revisar la información pública que devuelve la verificación.
- Comprobar la relación entre código, documento y estado.

Criterios de aceptación:

- Cada código corresponde inequívocamente a un documento.
- Un código inválido no revela información sensible.
- La verificación muestra un estado coherente con la política institucional.
- Los documentos anulados o sustituidos no aparecen como vigentes sin justificación.
- Los mecanismos de verificación no permiten alterar el documento.

DOC-03. Optimizar conservación y recuperación de documentos

Prioridad: P2
Tipo: M

Objetivo: reducir la pérdida de archivos y facilitar la recuperación de documentos históricos.

Acciones:

- Revisar las políticas de retención y archivo.
- Verificar la integridad de archivos y metadatos.
- Comprobar las dependencias del almacenamiento externo.
- Identificar estrategias de recuperación ante fallos del proveedor.

Criterios de aceptación:

- Los documentos pueden localizarse y recuperarse mediante sus relaciones y metadatos.
- Los fallos externos se detectan y registran.
- Las políticas de conservación y eliminación están documentadas.
- La recuperación respeta los permisos de acceso.

11. Fase 9. Comunicación institucional

COM-01. Validar el despacho multicanal

Prioridad: P1
Tipo: V; C si se confirma una brecha

Objetivo: garantizar que los mensajes se envíen al destinatario correcto y que el sistema refleje su estado real.

Acciones:

- Inventariar los canales y proveedores implementados.
- Probar los estados de envío, aceptación, entrega y fallo disponibles.
- Verificar la asociación entre destinatario y estudiante.
- Comprobar reintentos y deduplicación.
- Revisar la gestión de errores de proveedores externos.

Criterios de aceptación:

- El sistema diferencia entre mensaje preparado, enviado, aceptado y entregado cuando el canal proporciona esa información.
- Los fallos no se presentan como entregas confirmadas.
- Los reintentos no generan duplicados cuando puede prevenirse.
- Los errores de proveedor quedan registrados con información útil para diagnóstico.
- Las credenciales se mantienen protegidas.

COM-02. Mejorar audiencias, preferencias y acuses de recibo

Prioridad: P2
Tipo: M

Objetivo: mejorar la precisión de las comunicaciones y la capacidad de seguimiento.

Acciones:

- Revisar reglas de segmentación de audiencias.
- Verificar los acuses de recibo y sus estados.
- Evaluar preferencias de canal y reglas de consentimiento aplicables.
- Mejorar los filtros para localizar comunicaciones pendientes.
- Revisar las reglas de sustitución de representantes y contactos.

Criterios de aceptación:

- Los destinatarios coinciden con la audiencia seleccionada.
- Los acuses distinguen lectura, recepción y confirmación explícita cuando sean eventos diferentes.
- Las preferencias y restricciones de comunicación se respetan.
- Las comunicaciones históricas pueden consultarse con permisos adecuados.

COM-03. Mejorar seguimiento de fallos y operaciones pendientes

Prioridad: P2
Tipo: M

Objetivo: facilitar la recuperación de comunicaciones fallidas sin reenviar indiscriminadamente.

Acciones:

- Identificar mensajes pendientes, fallidos y reintentables.
- Evaluar reintentos manuales y automáticos con límites.
- Registrar causas de fallo y resultado de cada intento.
- Proponer una vista de seguimiento para usuarios autorizados.

Criterios de aceptación:

- Cada reintento queda registrado.
- Los mensajes no reintentables se identifican claramente.
- Los reintentos no multiplican comunicaciones ni eluden las restricciones de destinatarios.
- Los usuarios pueden distinguir errores temporales de errores definitivos.

12. Fase 10. Reportes y exportaciones

REP-01. Conciliar informes con los registros de origen

Prioridad: P0 si hay discrepancias financieras materiales; de lo contrario, P1
Tipo: V; C si se confirma una brecha

Objetivo: demostrar que los reportes representan fielmente los datos institucionales.

Acciones:

- Construir conjuntos de datos de prueba con resultados conocidos.
- Comparar informes con registros fuente.
- Verificar filtros por periodo, estado, sección y otras dimensiones.
- Revisar la exclusión de cargos pendientes de los totales de ingresos cobrados.
- Comprobar redondeos y tratamiento de anulaciones.

Criterios de aceptación:

- Los totales concuerdan con los registros de origen según las reglas documentadas.
- Los pagos pendientes no se presentan como cobrados.
- Los filtros no incluyen registros ajenos al alcance.
- Los informes permiten explicar sus fórmulas y fuentes de datos.
- Los errores de consulta no se presentan como resultados válidos vacíos.

REP-02. Fortalecer exportaciones XLSX y PDF

Prioridad: P2
Tipo: V/M

Objetivo: asegurar que los archivos exportados sean completos, consistentes y seguros.

Acciones:

- Probar exportaciones con conjuntos pequeños y grandes.
- Verificar encabezados, formatos, totales y filtros aplicados.
- Revisar caracteres especiales, valores nulos y campos extensos.
- Comprobar las restricciones de acceso a datos sensibles.
- Evaluar el comportamiento ante errores de generación.

Criterios de aceptación:

- El archivo coincide con los datos y filtros solicitados.
- Los totales y formatos son correctos.
- Los datos sensibles solo se exportan con autorización.
- Los errores de generación se notifican sin ofrecer archivos corruptos como válidos.
- Las exportaciones grandes se gestionan sin bloquear de forma innecesaria las operaciones ordinarias.

REP-03. Optimizar el catálogo de informes

Prioridad: P2
Tipo: M

Objetivo: facilitar el descubrimiento, la reutilización y la ejecución de informes.

Acciones:

- Inventariar informes y sus propósitos.
- Identificar duplicados y diferencias funcionales.
- Revisar nombres, filtros, permisos y descripción de cada informe.
- Evaluar plantillas guardadas y parámetros reutilizables cuando aporten valor.

Criterios de aceptación:

- Cada informe tiene un propósito identificable y una fuente de datos conocida.
- Los informes equivalentes se consolidan solo si no se pierde funcionalidad.
- Los filtros guardados no eluden los permisos.
- Los informes obsoletos se archivan o documentan, sin eliminarlos automáticamente.

13. Fase 11. Rendimiento, experiencia y mantenibilidad

UX-01. Medir los flujos operativos más frecuentes

Prioridad: P2
Tipo: V/M

Objetivo: identificar pasos innecesarios y cuellos de botella en las tareas cotidianas.

Acciones:

- Medir el tiempo y número de pasos de operaciones representativas.
- Revisar matrícula, registro de notas, asistencia, aplicación de pagos y generación de informes.
- Identificar la introducción repetida de datos y la navegación innecesaria.
- Priorizar cambios de interfaz de bajo riesgo y alto impacto.

Criterios de aceptación:

- Las mejoras se justifican con mediciones iniciales y posteriores.
- Se reducen pasos o errores sin eliminar controles importantes.
- Los mensajes de validación indican cómo resolver el problema.
- Los flujos siguen siendo accesibles y comprensibles para los roles correspondientes.

PERF-01. Evaluar rendimiento y escalabilidad

Prioridad: P2
Tipo: V/M

Objetivo: comprobar que la plataforma mantiene un comportamiento adecuado con volúmenes de datos representativos.

Acciones:

- Identificar consultas, exportaciones y operaciones costosas.
- Medir tiempos de respuesta y consumo de recursos en un entorno controlado.
- Probar conjuntos de datos sintéticos de diferentes tamaños.
- Evaluar paginación, índices, procesamiento asíncrono y caché donde sea pertinente.

Criterios de aceptación:

- Se establecen umbrales medibles antes de optimizar.
- Las pruebas posteriores muestran mejoras o justifican que no es necesario intervenir.
- Las optimizaciones conservan la consistencia de los datos y los permisos.
- No se introducen cachés que permitan mostrar información obsoleta o privada a otro usuario.

PERF-02. Revisar fallos, observabilidad y recuperación

Prioridad: P2
Tipo: M

Objetivo: reducir el tiempo necesario para diagnosticar incidencias.

Acciones:

- Inventariar logs, métricas y estados de procesos.
- Identificar errores silenciosos y tareas que pueden quedar bloqueadas.
- Evaluar indicadores de salud para integraciones y procesos críticos.
- Comprobar que las alertas se generen a partir de condiciones verificables.

Criterios de aceptación:

- Los errores relevantes dejan evidencia suficiente para investigar su causa.
- Los secretos y datos sensibles no aparecen en los logs.
- Los procesos fallidos pueden identificarse y recuperarse de forma controlada.
- Las alertas distinguen una incidencia real de una condición esperada.

UX-02. Revisar accesibilidad y compatibilidad móvil

Prioridad: P2
Tipo: V/M

Objetivo: mejorar el acceso a las operaciones institucionales desde distintos dispositivos y capacidades de usuario.

Acciones:

- Evaluar formularios, navegación, tablas, mensajes y controles.
- Comprobar navegación por teclado y etiquetas accesibles.
- Probar tamaños de pantalla representativos.
- Revisar la legibilidad de documentos y mensajes de error.

Criterios de aceptación:

- Los flujos esenciales pueden completarse sin depender exclusivamente de interacciones visuales complejas.
- Los campos y errores son identificables.
- La interfaz no oculta operaciones esenciales en pantallas pequeñas.
- Las mejoras no eliminan controles de seguridad ni confirmaciones necesarias.

14. Fase 12. Capacidades nuevas condicionadas a una brecha real

Estas tareas no deben ejecutarse automáticamente. Primero se debe comprobar que la capacidad no existe ya o que su implementación actual no satisface la necesidad.

NEW-01. Importación y exportación estructurada de datos

Prioridad: P2
Tipo: N

Objetivo: facilitar migraciones e intercambios de datos sin recurrir a modificaciones manuales.

Acciones:

- Identificar entidades y formatos de intercambio realmente necesarios.
- Definir plantillas y esquemas de importación.
- Añadir validación previa, resumen de errores y mecanismo de reversión cuando proceda.
- Documentar relaciones, identificadores y reglas de deduplicación.

Criterios de aceptación:

- Los datos inválidos se detectan antes de confirmar la operación.
- Los errores se identifican por registro y campo.
- La importación no duplica entidades existentes.
- Las operaciones parciales no dejan datos incoherentes.
- La exportación respeta permisos y filtros.

NEW-02. API institucional documentada

Prioridad: P2
Tipo: N

Objetivo: permitir integraciones controladas con servicios externos cuando exista una necesidad institucional concreta.

Acciones:

- Inventariar las interfaces de integración existentes.
- Identificar los casos de uso y entidades que realmente necesitan exponerse.
- Definir autenticación, autorización, límites, versionado y trazabilidad.
- Documentar errores, reintentos e idempotencia.
- Evitar exponer datos personales o financieros innecesarios.

Criterios de aceptación:

- Cada operación expuesta tiene un contrato documentado.
- Las credenciales y permisos se validan en el servidor.
- Las operaciones sensibles dejan trazabilidad.
- Las llamadas repetidas se gestionan según la naturaleza de la operación.
- No se crea una API redundante si ya existe una interfaz adecuada.

NEW-03. Automatización configurable de procesos institucionales

Prioridad: P2
Tipo: N

Objetivo: reducir tareas repetitivas sin perder control humano sobre operaciones sensibles.

Acciones:

- Identificar tareas repetitivas con impacto medible.
- Definir disparadores, condiciones, acciones y excepciones.
- Establecer límites, prevención de ciclos y trazabilidad.
- Separar automatizaciones informativas de operaciones que modifican datos financieros o académicos.

Criterios de aceptación:

- Cada automatización tiene condiciones de activación documentadas.
- Las ejecuciones repetidas no producen efectos duplicados.
- Los fallos pueden identificarse y recuperarse.
- Las acciones críticas mantienen las aprobaciones requeridas.
- La automatización puede desactivarse de manera controlada.

NEW-04. Portal de autoservicio para familias y estudiantes

Prioridad: P2
Tipo: N

Objetivo: facilitar el acceso a información autorizada sin aumentar la carga administrativa.

Acciones:

- Verificar las funciones que ya ofrece el portal actual.
- Identificar necesidades no cubiertas en consulta de saldos, notas, asistencia, documentos y comunicaciones.
- Priorizar únicamente las funciones que no estén disponibles de forma equivalente.
- Definir permisos y relaciones familiares.

Criterios de aceptación:

- Cada usuario accede exclusivamente a sus datos autorizados.
- Las operaciones de consulta no permiten modificar registros restringidos.
- Los datos se muestran con su estado y fecha de actualización pertinentes.
- La nueva interfaz reutiliza servicios existentes cuando es adecuado.

15. Fase 13. Validación final de sustitución operativa

FINAL-01. Ejecutar pruebas de extremo a extremo

Prioridad: P1
Tipo: V

Objetivo: verificar los flujos completos entre las once áreas.

Flujos obligatorios:

- Admisión, matrícula y expediente.
- Matrícula, generación de cargos y aplicación de pagos.
- Actividad virtual, entrega, evaluación y calificación.
- Horario, asistencia, justificación y reporte.
- Pago, asiento contable y conciliación.
- Nómina, aprobación, pago y contabilización, si corresponde.
- Documento generado, verificación y consulta autorizada.
- Evento institucional, notificación y seguimiento.
- Registros fuente, informes y exportaciones.

Criterios de aceptación:

- Cada flujo tiene resultados esperados y datos de prueba documentados.
- Las relaciones entre módulos son coherentes.
- No se detectan duplicaciones ni discrepancias sin explicación.
- Los permisos se mantienen durante todo el flujo.
- Las pruebas bloqueadas quedan pendientes y no se cuentan como satisfactorias.

FINAL-02. Ejecutar regresión tras cada corrección autorizada

Prioridad: P1
Tipo: V

Objetivo: comprobar que las correcciones no degradan las funciones existentes.

Acciones:

- Ejecutar las pruebas relacionadas con cada cambio.
- Repetir las pruebas de los módulos dependientes.
- Comparar resultados con la línea base.
- Documentar fallos nuevos y determinar su relación con los cambios.

Criterios de aceptación:

- Las pruebas críticas pertinentes pasan.
- Los fallos nuevos están resueltos o documentados como bloqueos.
- Los datos históricos y financieros mantienen su integridad.
- Ningún cambio se considera terminado únicamente por haberse modificado el código.

FINAL-03. Emitir el informe de preparación operativa

Prioridad: P1
Tipo: V

Objetivo: determinar si la plataforma está preparada para sustituir los procedimientos y sistemas existentes.

Acciones:

- Consolidar los resultados de las once áreas.
- Documentar brechas, dependencias y procedimientos todavía externos.
- Identificar los riesgos residuales.
- Establecer qué capacidades están verificadas y cuáles requieren validación adicional.
- Preparar el plan de resolución restante.

Criterios de aceptación:

- Todas las áreas incluidas tienen un estado respaldado por evidencias.
- Se informa la cobertura de inspección y verificación por separado.
- Las brechas críticas y altas tienen acciones concretas.
- Las capacidades opcionales se distinguen de los requisitos esenciales.
- La conclusión no declara sustitución integral si existen operaciones críticas sin verificar.

16. Orden recomendado de ejecución

1. BASE-01: reconstruir el inventario real.
2. BASE-02: validar la cobertura declarada.
3. BASE-03: establecer la línea base.
4. SEC-01, SEC-03 y SEC-04: comprobar permisos, privacidad e integridad transaccional.
5. FIN-01, FIN-03, CON-01 y NOM-01: validar los procesos financieros críticos.
6. ACA-01, ACA-02, MAT-01, EXP-01 y ASI-01: comprobar la integridad académica.
7. AULA-01, DOC-01, COM-01 y REP-01: verificar los flujos de aprendizaje, documentos, comunicaciones e informes.
8. FIN-02, FIN-04, FIN-05, CON-02, CON-03 y CON-04: fortalecer conciliación y operaciones administrativas.
9. ACA-03, ASI-02, AULA-02, AULA-03, MAT-02 y EXP-02: mejorar la experiencia cotidiana.
10. COM-02, COM-03, DOC-02, DOC-03, REP-02 y REP-03: optimizar trazabilidad, documentos y reportes.
11. PERF-01, PERF-02, UX-01 y UX-02: medir y mejorar rendimiento y usabilidad.
12. NEW-01 a NEW-04: desarrollar capacidades adicionales solo cuando estén justificadas.
13. FINAL-01 a FINAL-03: ejecutar regresión y emitir la conclusión de preparación operativa.

El orden puede cambiar si la evidencia revela un riesgo P0. Ninguna tarea de optimización debe retrasar la corrección de una vulnerabilidad o de un error que afecte a notas, pagos, nóminas o integridad de datos.

17. Formato obligatorio de cada tarea derivada de un hallazgo

Cuando Jules confirme una brecha, deberá generar o actualizar una tarea con esta estructura:

Identificador: único y estable.
Título: breve y específico.
Prioridad: P0, P1, P2 o P3.
Tipo: verificación, corrección, mejora o nueva capacidad.
Problema confirmado: descripción basada en evidencia.
Comportamiento actual: resultado reproducido.
Comportamiento esperado: resultado requerido.
Requisitos funcionales: reglas, permisos, validaciones y restricciones.
Componentes afectados: nombres y ubicaciones reales.
Dependencias: obligatorias y opcionales.
Cambios propuestos: modificaciones mínimas necesarias.
Criterios de aceptación: pruebas y resultados observables.
Pruebas de regresión: áreas que deben volver a verificarse.
Riesgos: efectos secundarios y medidas preventivas.
Evidencias: referencias a código, pruebas, logs o capturas pertinentes.
Estado: pendiente, autorizado, en ejecución, bloqueado o completado, según la metodología vigente.
Resultado final: pruebas realizadas y evidencia de cumplimiento.

No se permite cerrar una tarea porque el código compila, porque la interfaz muestra una opción o porque se ha escrito una prueba sin ejecutarla. Debe demostrarse el resultado esperado.

18. Condiciones de cierre del backlog

El backlog se considera completado cuando:

- Todos los hallazgos confirmados tienen una resolución verificada o una excepción aceptada y documentada.
- Las capacidades nuevas aprobadas cumplen sus criterios de aceptación.
- Las mejoras propuestas no implementadas tienen una decisión registrada.
- Las pruebas de regresión pertinentes han sido ejecutadas.
- Las dependencias externas y las obligaciones normativas pendientes están identificadas.
- La cobertura y los riesgos residuales se han documentado.
- La declaración final de sustitución operativa está respaldada por resultados reproducibles.

La meta no es acumular funciones ni imitar indiscriminadamente a otros productos. Es conseguir que cada proceso institucional sea fiable, seguro, trazable, eficiente y útil, conservando las ventajas existentes y evitando complejidad innecesaria.
