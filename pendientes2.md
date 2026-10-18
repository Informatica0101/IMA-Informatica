# TAREAS ADICIONALES PENDIENTES DE AUDITORÍA TRANSVERSAL
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**

---

### [REQ-OMNI-001] Barra de Búsqueda Omnibox Unificada Global (Ctrl + K / Cmd + K)
- **Origen del Hallazgo:** AUDITORIA_INFRAESTRUCTURA_TRANSVERSAL.md (Auditoría Funcional de Infraestructura Transversal)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `teacher-dashboard.html`, `student-dashboard.html`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `getInstitutionalReportCatalog`, `findDuplicateStudents`, `searchGlobalOmnibox`, `getUserVerifiedRole`
- **Descripción del Alcance:**
  1. Crear la función `searchGlobalOmnibox` en `backend/user-service/Code.gs` para consultar simultáneamente estudiantes, empleados, trámites, comunicaciones y documentos respetando los permisos RBAC del usuario autenticado.
  2. Implementar el modal de búsqueda universal omnibox `#modal-global-omnibox` en `js/ui-common.js` con atajo de teclado (`Ctrl + K` / `Cmd + K`) e icono accesible en los encabezados de los dashboards.
  3. Desplegar los resultados categorizados con accesibilidad por teclado y redirección directa a la ficha/módulo correspondiente.
- **Criterios de Aceptación:**
  - Búsqueda global unificada funcional desde cualquier vista.
  - Permisos RBAC aplicados server-side en `searchGlobalOmnibox`.
  - Atajo de teclado `Ctrl + K` operativo.
- **Estado:** [ ] Pendiente


Backlog técnico de mejoras y desarrollo

Infraestructura transversal — Plataforma Integral de Gestión Educativa

Reglas generales de ejecución

- Verificar el estado actual del código antes de cada cambio.
- Mantener el alcance limitado a las capacidades transversales y sus dependencias indispensables.
- Reutilizar la identidad única, los permisos de servidor, los registros de auditoría y la configuración central existentes.
- No crear servicios, bases de datos ni mecanismos duplicados sin justificar su necesidad.
- Mantener compatibilidad con Google Apps Script, las hojas de cálculo y la PWA existentes, salvo que una limitación demostrada justifique una alternativa.
- No modificar datos de producción para realizar pruebas.
- No declarar una tarea completada hasta superar sus criterios de aceptación.
- Las tareas P0 y P1 se activarán cuando una verificación detecte un riesgo o defecto de esa gravedad. No se consideran defectos confirmados por el informe actual.

---

ÉPICA E01. Búsqueda global unificada

T05-01. Definir el contrato funcional y el catálogo de entidades buscables

Prioridad: P2
Tipo: Especificación e integración
Dependencias: Ninguna; debe preceder a T05-02.

Problema

La búsqueda se encuentra distribuida entre funciones de búsqueda de estudiantes y catálogos de reportes. No existe una experiencia unificada que permita localizar los principales registros institucionales desde cualquier sección autorizada.

Requisitos funcionales

1. Identificar las entidades realmente existentes y susceptibles de búsqueda: estudiantes, personas, empleados, familias, trámites, documentos, pagos y otras categorías justificadas.
2. Determinar qué campos se pueden consultar en cada categoría y qué información se puede mostrar a cada rol.
3. Definir un contrato común para la consulta y los resultados, con identificador estable, categoría, título, descripción secundaria, destino de navegación y metadatos mínimos.
4. Definir reglas de coincidencia exacta, parcial, normalización de texto y priorización de resultados.
5. Establecer un límite de resultados por categoría y un máximo global configurable o documentado.
6. Definir las categorías excluidas, los campos sensibles y las condiciones de acceso.
7. Determinar si la consulta puede realizarse directamente sobre las fuentes existentes o si necesita un índice auxiliar.

Cambios necesarios

Documentar el catálogo de entidades, el contrato de búsqueda, las reglas de seguridad y los criterios de relevancia. No implementar todavía una nueva infraestructura de indexación.

Criterios de aceptación

- Cada categoría incluida tiene una fuente real identificada y un conjunto de campos permitido.
- Cada resultado tiene una identidad estable y un destino verificable.
- No se incluyen categorías sin datos disponibles ni enlaces de navegación comprobados.
- Los campos sensibles están excluidos o protegidos mediante una regla explícita.
- Los requisitos distinguen búsqueda en tiempo real, resultados recientes y cualquier eventual índice secundario.
- Las categorías sin soporte quedan documentadas como pendientes o mejoras futuras.

T05-02. Implementar el servicio unificado de búsqueda global

Prioridad: P2
Tipo: Desarrollo backend
Dependencias: T05-01.

Problema

No existe una operación unificada demostrada que agregue resultados de las distintas categorías institucionales.

Requisitos funcionales

1. Implementar una operación de búsqueda en el servicio apropiado, verificando primero la arquitectura real.
2. Integrar los adaptadores de consulta necesarios para las categorías aprobadas.
3. Aplicar autenticación, permisos y restricciones de acceso en el servidor.
4. Normalizar los resultados según el contrato establecido.
5. Evitar duplicados producidos por registros equivalentes o por la consulta de varias fuentes.
6. Controlar errores parciales de las fuentes sin presentar resultados incompletos como una búsqueda exhaustiva exitosa.
7. Limitar la cantidad de registros y el tiempo de ejecución.
8. Mantener las operaciones existentes de búsqueda y evitar regresiones.

Cambios necesarios

Evaluar la reutilización de "findDuplicateStudents", "getInstitutionalReportCatalog" y los mecanismos de acceso a datos existentes. Estas funciones no deben reutilizarse como buscadores universales si su propósito o sus permisos no lo permiten.

Implementar una capa de agregación que respete la separación entre servicios y no conceda acceso a datos únicamente porque estén disponibles en una fuente.

Criterios de aceptación

- Una consulta válida devuelve resultados de todas las categorías habilitadas que contienen coincidencias.
- Una consulta sin coincidencias devuelve un resultado vacío controlado.
- Una fuente indisponible se identifica como fallo parcial y no se confunde con una categoría sin resultados.
- Los registros duplicados se gestionan conforme a las reglas de identidad.
- Las peticiones sin autorización se rechazan en el servidor.
- La respuesta no contiene campos privados que el usuario no puede consultar.
- Los límites de resultados se respetan incluso con grandes volúmenes de registros.
- Las búsquedas existentes siguen funcionando después de la integración.

T05-03. Implementar el omnibox y el acceso rápido desde el dashboard

Prioridad: P2
Tipo: Desarrollo frontend
Dependencias: T05-01 y T05-02.

Problema

El usuario debe navegar por distintas secciones para buscar información de categorías diferentes.

Requisitos funcionales

1. Integrar un punto de entrada de búsqueda global en la interfaz compartida.
2. Incorporar apertura rápida mediante "Ctrl + K" y "Cmd + K", siempre que no interfiera con controles del navegador o de formularios.
3. Proporcionar una alternativa visible para abrir la búsqueda sin teclado.
4. Mostrar resultados agrupados por categoría y permitir distinguir tipos de registro.
5. Admitir navegación por teclado, selección de resultados, cierre del cuadro y retorno del foco.
6. Incorporar estados de carga, ausencia de resultados, error y resultados parciales.
7. Adaptar la interacción a dispositivos móviles.
8. Mostrar solo acciones y destinos accesibles para el usuario.

Cambios necesarios

Verificar "js/ui-common.js", "teacher-dashboard.html" y los mecanismos de navegación actuales. Reutilizar componentes existentes cuando sea adecuado. No crear una segunda capa de modales si ya existe un mecanismo compartido compatible.

Criterios de aceptación

- La búsqueda puede abrirse desde todas las vistas incluidas en el alcance.
- Los atajos funcionan cuando corresponde y no bloquean la escritura en campos de texto.
- El cuadro puede utilizarse completamente con teclado.
- Al cerrar el cuadro, el foco regresa a un punto lógico de la interfaz.
- Seleccionar un resultado autorizado abre el registro correcto.
- Un resultado no autorizado nunca se muestra ni se abre.
- El diseño funciona en las resoluciones móviles soportadas.
- Los errores de red no dejan la interfaz bloqueada ni eliminan silenciosamente la consulta.

T05-04. Incorporar relevancia, filtros y navegación contextual

Prioridad: P2
Tipo: Mejora funcional
Dependencias: T05-02 y T05-03.

Problema

Una búsqueda básica que agrega resultados puede resultar insuficiente cuando existen nombres similares, muchas coincidencias o varias categorías.

Requisitos funcionales

1. Priorizar coincidencias exactas de identificadores permitidos y coincidencias exactas de nombre sobre coincidencias parciales, cuando sea pertinente.
2. Ofrecer filtros por categoría y otros criterios únicamente cuando estén respaldados por los datos disponibles.
3. Admitir acentos, diferencias de mayúsculas y espacios de forma consistente.
4. Mostrar contexto suficiente para diferenciar homónimos sin revelar información sensible.
5. Mantener la categoría y la consulta al volver de un resultado cuando la navegación lo permita.
6. Proporcionar navegación hacia los registros y las acciones relacionadas autorizadas.
7. Documentar la estrategia para nombres alternativos y registros históricos.

Cambios necesarios

Crear reglas de relevancia comprobables y configurables donde aporte valor. Evitar un motor de búsqueda externo o un índice complejo si las fuentes existentes pueden satisfacer los requisitos con un coste razonable.

Criterios de aceptación

- Una coincidencia exacta autorizada se posiciona por encima de coincidencias parciales equivalentes.
- Los filtros no incluyen registros ajenos a las categorías seleccionadas.
- Las búsquedas equivalentes según la normalización definida producen resultados coherentes.
- Los homónimos pueden distinguirse mediante contexto autorizado.
- Los filtros no amplían los permisos del usuario.
- La navegación conserva el contexto cuando así se haya especificado.

T05-05. Optimizar rendimiento, concurrencia y consumo de servicios

Prioridad: P2
Tipo: Optimización técnica
Dependencias: T05-02.

Problema

La agregación de datos de varias fuentes puede generar llamadas excesivas, respuestas lentas o agotamiento de las cuotas de ejecución.

Requisitos funcionales

1. Establecer un conjunto de pruebas de rendimiento representativo.
2. Reducir las lecturas repetitivas de hojas y las llamadas a servicios externos.
3. Agrupar operaciones de lectura cuando sea apropiado.
4. Limitar las consultas concurrentes y gestionar tiempos de espera.
5. Aplicar caché únicamente a datos cuya sensibilidad, permisos y caducidad lo permitan.
6. Evitar que una respuesta almacenada en caché se reutilice para usuarios con permisos diferentes.
7. Documentar límites, errores y comportamiento con volúmenes crecientes.

Cambios necesarios

Revisar los patrones de acceso a datos y las recomendaciones de rendimiento de Google Apps Script. Elegir entre consultas directas, caché o indexación a partir de mediciones reales.

Criterios de aceptación

- El rendimiento se mide antes y después de los cambios.
- Se define un objetivo de latencia basado en el entorno y la carga de referencia.
- La búsqueda no realiza lecturas completas innecesarias en cada pulsación.
- Los límites de ejecución se manejan sin fallos silenciosos.
- La caché no expone información entre usuarios ni conserva resultados más allá de la política definida.
- El rendimiento mejora o se mantiene dentro de los objetivos establecidos.
- Las pruebas de permisos y consistencia siguen superándose.

T05-06. Validar seguridad, accesibilidad y regresiones de la búsqueda

Prioridad: P1 si se detectan filtraciones o elusión de permisos; de lo contrario, P2.
Tipo: Verificación integral
Dependencias: T05-02, T05-03, T05-04 y T05-05.

Problema

La búsqueda reúne información de varias áreas y crea una superficie de acceso adicional que debe respetar todos los controles existentes.

Requisitos funcionales

1. Verificar permisos de consulta y acceso al registro de destino.
2. Probar diferentes roles, ámbitos institucionales y estados de sesión.
3. Comprobar que los filtros y parámetros no permitan acceder a registros restringidos.
4. Revisar navegación por teclado, foco, etiquetas accesibles y mensajes de estado.
5. Probar errores de red, fuentes parciales, resultados vacíos y consultas inválidas.
6. Ejecutar regresiones de las búsquedas específicas existentes.

Criterios de aceptación

- Ningún rol accede a registros que no podría consultar mediante los módulos originales.
- No se exponen identificadores o campos sensibles innecesarios.
- Los resultados pueden seleccionarse sin ratón.
- Los errores y los estados de carga se comunican de manera comprensible.
- Las pruebas de regresión no detectan deterioros atribuibles al cambio.
- Se documentan los escenarios ejecutados y sus resultados.

---

ÉPICA E02. Protección de la identidad y los permisos

TR-07. Consolidar las pruebas de identidad única y fusión de duplicados

Prioridad: P1 si aparecen duplicados con impacto académico o administrativo; de lo contrario, P3.
Tipo: Calidad y prevención de regresiones
Dependencias: Ninguna.

Problema

La auditoría clasifica la identidad única como completa. Se necesita conservar esa garantía mientras nuevas funciones consumen entidades de varias categorías.

Requisitos funcionales

- Verificar la estabilidad de los identificadores personales, cuentas y expedientes.
- Comprobar las reglas de coincidencia por identificadores, correo y nombres.
- Verificar que las fusiones preservan documentos, relaciones familiares e historial.
- Probar concurrencia y conflictos de altas.
- Documentar las operaciones que pueden modificar vínculos de identidad.

Criterios de aceptación

- Dos altas simultáneas no producen duplicados inadvertidos cuando existe una restricción de unicidad aplicable.
- Los homónimos no se fusionan automáticamente sin evidencia suficiente.
- Una fusión de prueba conserva todas las relaciones esperadas.
- Las operaciones quedan registradas según las reglas de auditoría.
- Las búsquedas globales utilizan la identidad canónica sin confundir personas con cuentas de usuario.

TR-08. Endurecer las pruebas de autorización transversal

Prioridad: P1 si se demuestra una vulneración; de lo contrario, P3.
Tipo: Seguridad
Dependencias: Ninguna; constituye una salvaguarda obligatoria para T05.

Problema

El informe declara que los permisos se validan en servidor. La ampliación de las rutas de acceso exige comprobar que esa propiedad se mantiene.

Requisitos funcionales

- Crear una matriz de roles, recursos y operaciones autorizadas.
- Probar lectura, creación, modificación, aprobación, exportación y eliminación cuando existan.
- Verificar restricciones por centro, grupo, relación familiar y ámbito organizativo.
- Comprobar revocación de permisos, sesiones existentes y acceso directo a endpoints.
- Validar los permisos de tareas automáticas e integraciones técnicas.

Criterios de aceptación

- Cada combinación de rol, recurso y operación tiene un resultado esperado documentado.
- Las operaciones prohibidas se rechazan también en servidor.
- La revocación tiene efecto conforme a la política de sesiones.
- Las exportaciones y la búsqueda aplican los mismos límites de acceso que la consulta original.
- Los intentos no autorizados no filtran información sensible.

---

ÉPICA E03. Trazabilidad, historial e integridad de datos

TR-09. Verificar la cobertura y la integridad de la auditoría de operaciones

Prioridad: P1 si se detecta ausencia de trazabilidad en operaciones críticas; de lo contrario, P3.
Tipo: Seguridad y observabilidad
Dependencias: Ninguna.

Problema

El sistema dispone de registros estructurados, pero la existencia del mecanismo no demuestra por sí sola que todas las operaciones críticas estén cubiertas.

Requisitos funcionales

- Elaborar una matriz de operaciones auditables.
- Comprobar identificación del actor, acción, registro, fecha y resultado.
- Verificar eventos de operaciones fallidas, denegadas y automáticas cuando corresponda.
- Revisar protección de registros, retención y permisos de consulta.
- Identificar posibles secretos o datos personales innecesarios en los logs.

Criterios de aceptación

- Todas las operaciones clasificadas como críticas tienen cobertura comprobada.
- Los eventos contienen los campos requeridos por la matriz.
- Los fallos de registro se detectan o se documentan según la criticidad.
- Los usuarios no autorizados no pueden modificar o consultar registros protegidos.
- No se registran credenciales ni secretos.
- Los resultados de las pruebas permiten reconstruir una secuencia de operaciones de prueba.

TR-10. Verificar versionado, restauración selectiva y coherencia histórica

Prioridad: P1 si se detecta pérdida de información histórica; de lo contrario, P3.
Tipo: Integridad de datos
Dependencias: TR-09.

Problema

El informe indica que existen snapshots y registros históricos. Es necesario comprobar su consistencia ante cambios concurrentes y restauraciones.

Requisitos funcionales

- Identificar qué entidades disponen realmente de versionado.
- Verificar la relación entre versiones, actor, fecha y registro vigente.
- Probar modificaciones concurrentes en un entorno seguro.
- Comprobar que restaurar una versión no elimina el historial posterior.
- Validar restricciones de conservación y los registros académicos protegidos.

Criterios de aceptación

- Los cambios conservan la historia requerida.
- Las versiones históricas se pueden consultar sin modificar el estado vigente.
- Las restauraciones generan una nueva operación trazable.
- Las relaciones entre entidades siguen siendo válidas.
- Las calificaciones históricas y los registros protegidos no sufren alteraciones inesperadas.
- Los conflictos de concurrencia se detectan cuando corresponda.

---

ÉPICA E04. Intercambio de datos e integraciones

TR-11. Robustecer importaciones, exportaciones y conciliación

Prioridad: P2; P1 si se demuestra corrupción o exposición de datos.
Tipo: Calidad de datos
Dependencias: TR-07 y TR-08.

Problema

La auditoría clasifica el intercambio de datos como completo. El crecimiento de la plataforma requiere conservar esa fiabilidad al incorporar más entidades a la búsqueda y a futuras integraciones.

Requisitos funcionales

- Mantener mapeo de columnas y prevalidación.
- Verificar detección de duplicados y referencias inexistentes.
- Documentar el comportamiento ante errores parciales.
- Comprobar la protección de datos en exportaciones.
- Establecer mecanismos de conciliación de recuentos y valores.
- Probar archivos inválidos, grandes y con caracteres internacionales.

Criterios de aceptación

- El informe de importación distingue registros creados, actualizados, omitidos y rechazados.
- Los fallos parciales se detectan y comunican.
- La política de procesamiento parcial se cumple sin sobrescrituras silenciosas.
- Las exportaciones respetan los permisos del usuario.
- Los registros importados mantienen su identidad y sus relaciones.
- Los formatos de fecha, decimales y codificación se interpretan de forma coherente.

TR-12. Establecer contratos y pruebas de integración entre servicios

Prioridad: P2; P1 si se demuestra un fallo de autorización o una alteración grave de datos.
Tipo: Integración y mantenibilidad
Dependencias: TR-08 y TR-09.

Problema

La arquitectura utiliza servicios desacoplados. La ampliación de la búsqueda global debe evitar que los contratos entre ellos se vuelvan inconsistentes.

Requisitos funcionales

- Inventariar los endpoints y contratos existentes.
- Documentar autenticación, autorización, entradas, respuestas y errores.
- Definir el comportamiento ante tiempos de espera, reintentos y peticiones repetidas.
- Comprobar compatibilidad con consumidores actuales.
- Verificar la configuración de proveedores externos sin realizar transacciones reales.
- Identificar la fuente de verdad para cada dato sincronizado.

Criterios de aceptación

- Cada interfaz incluida tiene un contrato verificable.
- Las respuestas de error son controladas y no revelan secretos.
- Las operaciones repetidas no generan duplicados cuando la operación requiere idempotencia.
- Los fallos externos quedan registrados según la política definida.
- Los cambios mantienen la compatibilidad acordada.
- Las pruebas no provocan cobros, mensajes ni efectos reales en servicios externos.

---

ÉPICA E05. Respaldo, recuperación y continuidad

TR-13. Automatizar la validación de copias y las pruebas de restauración

Prioridad: P1 si no se puede demostrar la recuperación de datos esenciales; de lo contrario, P3.
Tipo: Continuidad operativa
Dependencias: Ninguna.

Problema

El informe indica que existen respaldos y comprobaciones de integridad. Es necesario conservar una evidencia repetible de que las copias pueden restaurarse correctamente.

Requisitos funcionales

- Inventariar datos, archivos y configuraciones incluidos en las copias.
- Verificar la integridad de las copias y los resultados de generación.
- Ejecutar restauraciones controladas en entornos aislados.
- Comparar recuentos, relaciones y archivos adjuntos.
- Documentar limitaciones de cobertura y objetivos de recuperación.
- Comprobar que las reglas de protección de calificaciones históricas se mantienen.

Criterios de aceptación

- Una copia de prueba puede localizarse e identificarse por su fecha y estado.
- La restauración recupera los elementos incluidos y previstos.
- La conciliación detecta diferencias deliberadamente introducidas en datos sintéticos.
- Las restauraciones fallidas no se registran como exitosas.
- Las calificaciones históricas protegidas permanecen intactas según las reglas del proyecto.
- El procedimiento es reproducible y no requiere intervenir en producción.

---

ÉPICA E06. Experiencia, accesibilidad y configuración

TR-14. Validar y optimizar formularios, accesibilidad y configuración transversal

Prioridad: P2 para incumplimientos funcionales o de accesibilidad relevantes; P3 para mejoras no críticas.
Tipo: Calidad de producto
Dependencias: T05-03 para los elementos compartidos de búsqueda.

Problema

Las capacidades se clasifican como completas, pero el informe no aporta métricas detalladas de accesibilidad, pruebas de regresión por dispositivo ni resultados cuantificados de usabilidad.

Requisitos funcionales

- Verificar los formularios dinámicos con campos obligatorios, adjuntos y validaciones.
- Probar que los cambios de configuración se aplican de forma coherente.
- Revisar navegación por teclado, foco, etiquetas, mensajes de error y ampliación de pantalla.
- Evaluar flujos principales en dispositivos móviles.
- Adoptar WCAG 2.2 AA como referencia objetivo cuando corresponda al proyecto.
- Documentar qué configuraciones deben ser globales y cuáles específicas de cada módulo.

Criterios de aceptación

- Los formularios aplican sus reglas tanto en interfaz como en servidor cuando sea necesario.
- Los cambios de configuración no producen incompatibilidades en formularios existentes.
- Los flujos incluidos pueden completarse por teclado.
- Los mensajes de error son comprensibles y se asocian con los controles pertinentes.
- Las pruebas de accesibilidad combinan revisión automatizada y manual.
- Los cambios no introducen regresiones en las vistas móviles.
- Las configuraciones comunes tienen una fuente identificable y un comportamiento documentado.

---

3. Condiciones de cierre de las tareas

Una tarea solo puede cerrarse cuando:

1. Los cambios están documentados y limitados al alcance aprobado.
2. Los criterios de aceptación se han convertido en pruebas reproducibles.
3. Las pruebas correspondientes se han ejecutado y sus resultados se han registrado.
4. Las pruebas de seguridad e integridad aplicables han sido superadas.
5. Las regresiones relevantes han sido verificadas.
6. Los bloqueos restantes se encuentran explícitamente documentados.
7. El informe identifica los componentes reales modificados.
8. Las mejoras pendientes están registradas como tareas separadas.

No se considera una tarea terminada por el mero hecho de que compile, que se haya añadido un botón o que el servicio responda.

4. Orden de ejecución

1. T05-01: contrato y catálogo de búsqueda.
2. TR-08: matriz de permisos y pruebas de autorización.
3. T05-02: servicio de búsqueda global.
4. T05-03: omnibox y navegación.
5. T05-04: relevancia y filtros.
6. T05-05: rendimiento.
7. T05-06: seguridad, accesibilidad y regresiones.
8. TR-07: identidad y deduplicación.
9. TR-09: auditoría de operaciones.
10. TR-10: historial y versionado.
11. TR-11: importación y exportación.
12. TR-12: contratos de integración.
13. TR-13: respaldo y recuperación.
14. TR-14: formularios, accesibilidad y configuración.

Si durante las comprobaciones se identifica una vulnerabilidad crítica, pérdida de datos o fallo de recuperación, se interrumpe el orden normal y se prioriza la mitigación correspondiente.

5. Resultado esperado

Al terminar el backlog, la plataforma deberá disponer de una búsqueda global integrada, segura, accesible y eficiente, con resultados relevantes y navegación contextual, además de pruebas de regresión que preserven las garantías existentes de identidad, permisos, trazabilidad, persistencia e integridad.

Las tareas de endurecimiento no presuponen que las capacidades clasificadas como completas sean defectuosas. Su finalidad es mantener esas garantías, detectar posibles brechas no evidenciadas en el resumen de auditoría y proporcionar pruebas repetibles para futuras modificaciones.
