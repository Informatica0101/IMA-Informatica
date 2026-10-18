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


BACKLOG TÉCNICO Y FUNCIONAL

Búsqueda global, autorización y arquitectura de fuentes de datos

Proyecto: Plataforma Integral de Gestión Educativa — New Generation Christian Academy / Instituto María Auxiliadora
Responsable de desarrollo: JyP Solutions
Entorno descrito en la auditoría: Google Apps Script, microservicios y PWA
Base de trabajo: Informe de auditoría transversal del 18 de octubre de 2026
Objetivo: Completar la búsqueda global, mejorar la localización de información institucional y establecer una arquitectura escalable para consultar múltiples hojas de cálculo sin dispersar sus identificadores por el código.

1. Reglas de ejecución

Antes de implementar cada tarea, Jules deberá comprobar que el problema sigue presente en la versión actual del repositorio. El informe de auditoría es el punto de partida, no una sustitución de la inspección del código ni de las pruebas.

Cada tarea debe cerrarse con evidencias reproducibles, criterios de aceptación superados y pruebas de regresión pertinentes.

Los estados iniciales de las tareas son propuestas de trabajo, no declaraciones de que ya existan defectos adicionales.

Prioridades

- P0: vulnerabilidad crítica o riesgo inmediato de exposición o pérdida grave de datos.
- P1: problema grave de autorización, integridad, recuperación o continuidad operativa.
- P2: capacidad funcional importante pendiente, arquitectura insuficiente demostrada u optimización relevante.
- P3: mejora complementaria o de usabilidad que no bloquea las funciones principales.

Una vulnerabilidad de seguridad demostrada debe escalarse a P0 o P1 según su impacto, aunque se descubra durante una tarea P2.

Restricciones

1. No introducir nombres de archivos, funciones o componentes nuevos hasta inspeccionar la estructura real y determinar dónde corresponde integrarlos.
2. No duplicar servicios de búsqueda, autorización, configuración o acceso a hojas de cálculo que ya cumplan la función necesaria.
3. No migrar la plataforma completa a otra base de datos sin mediciones que justifiquen esa decisión.
4. No exponer datos financieros, académicos, personales o contractuales mediante resultados, sugerencias, exportaciones o mensajes de error.
5. No realizar migraciones destructivas ni pruebas de carga sobre producción sin autorización.
6. No considerar terminada una tarea por el mero hecho de que el código compile o se haya añadido una interfaz.

---

ÉPICA E01. Búsqueda global institucional

T05-01. Definir el contrato funcional de búsqueda global

Prioridad: P2
Tipo: Especificación y análisis
Dependencias: Ninguna. Es la tarea inicial.

Problema

La auditoría identifica búsquedas especializadas por pantalla, pero no una experiencia global unificada. Antes de implementarla, es necesario definir qué tipos de registros se consultarán, qué datos pueden utilizarse para buscarlos y qué información se devolverá según los permisos del usuario.

Requisitos funcionales

La búsqueda debe admitir, en la medida en que los módulos correspondientes existan:

- Estudiantes por nombre, identidad o código institucional.
- Matrículas por estudiante y año escolar.
- Calificaciones por estudiante, asignatura, período y año.
- Recibos, pagos y transacciones.
- Empleados y contratos.
- Solicitudes y trámites.
- Constancias y documentos emitidos.
- Activos institucionales.
- Accesos a páginas o herramientas institucionales, si resulta útil.

Cada categoría debe definir sus campos consultables, criterios de coincidencia, filtros, información visible, permisos y destino de navegación.

Cambios necesarios

1. Inventariar las búsquedas existentes y sus servicios de consulta.
2. Identificar los módulos que poseen cada tipo de registro.
3. Definir un contrato común para solicitudes y respuestas de búsqueda.
4. Establecer qué categorías pueden habilitarse por rol y por configuración.
5. Documentar las categorías que no tengan implementación real.
6. Identificar las dependencias obligatorias y los datos de prueba necesarios.

Comportamiento esperado

Una única búsqueda podrá consultar distintas categorías sin exigir que todas tengan la misma estructura de datos. Cada categoría conservará sus reglas de negocio y autorización.

Criterios de aceptación

- Existe una especificación documentada para cada categoría.
- Cada categoría identifica el servicio real responsable de consultar sus datos.
- Se definen campos de búsqueda, filtros, información visible y permisos.
- Las categorías inexistentes se identifican como pendientes de implementación, no como funciones disponibles.
- Se define cómo representar resultados parciales, errores y fuentes no disponibles.
- La especificación diferencia las capacidades obligatorias de las mejoras opcionales.

Entregable

Contrato funcional de búsqueda global, inventario de categorías y matriz de permisos por tipo de resultado.

---

T05-02. Implementar o completar el servicio de búsqueda global

Prioridad: P2
Tipo: Implementación funcional
Dependencias: T05-01 y los servicios de consulta existentes.

Problema

La búsqueda actual está segmentada. Se necesita una capa común que reciba una consulta y coordine las categorías autorizadas sin replicar la lógica de los módulos.

Requisitos funcionales

- Recibir una consulta validada y los filtros admitidos.
- Identificar las categorías que el usuario puede consultar.
- Invocar los servicios de consulta correspondientes.
- Normalizar los resultados en una estructura común.
- Conservar el identificador, la categoría y la referencia al registro original.
- Aplicar límites de resultados.
- Manejar errores individuales sin ocultar que la respuesta está incompleta.
- Evitar ejecutar operaciones de escritura o modificar registros durante una búsqueda.

Cambios necesarios

- Reutilizar los servicios existentes cuando sean adecuados.
- Crear un coordinador común únicamente si el inventario demuestra que hace falta.
- Definir un adaptador por categoría cuando los módulos utilicen formatos distintos.
- Centralizar la validación de la consulta y el tratamiento de errores.
- Evitar que el servicio dependa de identificadores de archivos dispersos en su código.

Comportamiento esperado

Una consulta puede devolver resultados de varias categorías en una única respuesta, manteniendo el origen y el contexto de cada resultado.

Si una categoría falla, el sistema debe diferenciar los resultados obtenidos de los que no pudieron verificarse. No debe presentar una respuesta parcial como si fuera completa.

Criterios de aceptación

- Una consulta válida devuelve resultados de las categorías habilitadas y autorizadas.
- Una consulta vacía o excesivamente larga se trata según las reglas definidas.
- Los resultados conservan su identificador y referencia original.
- Las categorías sin coincidencias no generan registros ficticios.
- El fallo de una categoría no provoca que otra devuelva registros incorrectos.
- Se aplican límites de resultados y se documenta la paginación cuando sea necesaria.
- La búsqueda no modifica datos ni ejecuta acciones propias de los módulos.
- Las pruebas demuestran que los servicios existentes no han perdido sus funciones anteriores.

Entregable

Servicio de búsqueda global probado e integrado con las categorías disponibles.

---

T05-03. Integrar la barra de búsqueda en la interfaz institucional

Prioridad: P2
Tipo: Interfaz y navegación
Dependencias: T05-01 y T05-02.

Problema

Los usuarios deben navegar entre pantallas para localizar registros de distintos módulos. Se necesita un punto de acceso uniforme.

Requisitos funcionales

- Barra de búsqueda accesible desde las áreas principales que correspondan.
- Entrada de texto y presentación de sugerencias o resultados.
- Resultados agrupados por categoría.
- Navegación al registro correspondiente.
- Estados de carga, ausencia de resultados, error y consulta incompleta.
- Funcionamiento en móviles y escritorio.
- Navegación mediante teclado.
- Posibilidad de cerrar la búsqueda y regresar al contexto anterior.

Puede evaluarse un atajo de teclado como Ctrl+K o Cmd+K, siempre que no interfiera con las funciones existentes.

Cambios necesarios

- Reutilizar los componentes de interfaz y estilos existentes.
- Conectar la barra al servicio de búsqueda.
- Implementar apertura, cierre, selección y navegación.
- Mantener los filtros y el contexto cuando corresponda.
- Evitar duplicar barras o servicios que ya resuelvan una parte de esta experiencia.

Comportamiento esperado

El usuario podrá comenzar una búsqueda desde una ubicación común y abrir un resultado autorizado sin recorrer manualmente el módulo de origen.

Criterios de aceptación

- La barra está disponible en las vistas previstas.
- La consulta se envía al servicio y los resultados corresponden a ella.
- Seleccionar un resultado abre el destino correcto.
- Los enlaces conservan la referencia al registro original.
- Cerrar la búsqueda no altera el formulario ni los datos de la pantalla anterior.
- El atajo, si se implementa, funciona sin interferir con campos de texto ni atajos existentes.
- La interfaz se puede utilizar con teclado y en dispositivos móviles.
- Los errores se muestran de forma comprensible y no se presentan como resultados vacíos válidos.

Entregable

Barra global integrada, navegable y accesible.

---

T05-04. Incorporar relevancia, filtros y desambiguación

Prioridad: P2
Tipo: Mejora funcional
Dependencias: T05-02 y T05-03.

Problema

Una búsqueda global puede producir resultados ambiguos, especialmente cuando hay homónimos, registros históricos o coincidencias de distintos módulos.

Requisitos funcionales

- Priorizar coincidencias exactas cuando corresponda.
- Permitir coincidencias parciales en los campos adecuados.
- Agrupar por tipo de registro.
- Distinguir registros activos e históricos cuando el módulo maneje esos estados.
- Filtrar por año escolar, ejercicio fiscal, estado, fecha o categoría cuando sean aplicables.
- Mostrar información de desambiguación autorizada.
- Permitir limitar la búsqueda a una categoría.

Cambios necesarios

- Definir una estrategia de relevancia determinista.
- Normalizar texto sin alterar los identificadores originales.
- Evitar que los resultados históricos oculten coincidencias activas más relevantes.
- Incorporar filtros compatibles con cada categoría.
- No asumir que todos los módulos comparten los mismos campos o estados.

Comportamiento esperado

Los resultados más pertinentes aparecen primero, los homónimos se distinguen mediante información permitida y los filtros no cambian el significado de la consulta.

Criterios de aceptación

- Una coincidencia exacta tiene la prioridad definida en el contrato.
- Los homónimos se pueden distinguir sin revelar datos confidenciales.
- Los filtros no incluyen resultados que incumplan sus condiciones.
- Los registros históricos se identifican correctamente.
- Los filtros no eluden permisos ni amplían el acceso.
- La ordenación es estable ante consultas equivalentes.
- Los resultados no se duplican por pertenecer a varias fuentes.

Entregable

Búsqueda con ordenación, filtros y presentación contextual.

---

T05-05. Optimizar el rendimiento y la gestión de consultas

Prioridad: P2
Tipo: Rendimiento
Dependencias: T05-02 y una línea base de rendimiento.

Problema

Consultar varias categorías y múltiples fuentes puede aumentar el número de llamadas a servicios, el tiempo de respuesta y el consumo de cuotas de Apps Script.

Requisitos funcionales

- Limitar la cantidad de resultados por consulta.
- Evitar lecturas completas e innecesarias de las hojas.
- Agrupar operaciones cuando el mecanismo utilizado lo permita.
- Reducir llamadas repetidas a servicios externos.
- Evaluar caché para datos apropiados.
- Cancelar o descartar resultados de consultas anteriores cuando el usuario cambie rápidamente de búsqueda.
- Registrar métricas de rendimiento sin incluir información sensible innecesaria.

Cambios necesarios

- Medir latencia y llamadas antes de optimizar.
- Identificar los servicios más costosos.
- Reutilizar datos obtenidos durante la misma ejecución cuando sea seguro.
- Aplicar paginación o continuación si el volumen lo requiere.
- Definir caducidad e invalidación para la caché, si se utiliza.
- Implementar límites y tratamiento de errores transitorios.

Comportamiento esperado

La búsqueda utiliza recursos de forma proporcional a la consulta y no lee indiscriminadamente todos los registros históricos en cada solicitud sin justificación.

Criterios de aceptación

- Existe una línea base reproducible.
- Se mide la duración de consultas representativas.
- Se registra el número de fuentes y llamadas realizadas.
- Se demuestra que las optimizaciones no cambian los resultados correctos.
- La caché no permite devolver datos de otro usuario ni eludir permisos.
- Los resultados obsoletos se detectan o se invalidan según la política definida.
- Los fallos de una fuente se distinguen de la ausencia de coincidencias.
- Los objetivos de latencia se fijan a partir de las mediciones y las necesidades reales.

Entregable

Informe de rendimiento y mejoras justificadas mediante mediciones.

---

T05-06. Asegurar la autorización por categoría y registro

Prioridad: P1 como control obligatorio de seguridad; P0 si se demuestra una exposición crítica.
Tipo: Seguridad
Dependencias: T05-01 y T05-02. Debe verificarse antes de publicar la búsqueda global.

Problema

La búsqueda combina información de módulos con niveles de confidencialidad diferentes. Un control visual no es suficiente para impedir que un usuario consulte registros mediante llamadas directas.

Requisitos funcionales

- Validación de permisos en el servidor.
- Reutilización de las reglas del módulo de origen.
- Control de acceso por rol y ámbito de datos cuando corresponda.
- Denegación por defecto si no existe una autorización explícita.
- Nueva comprobación al abrir un resultado.
- Protección de campos confidenciales.
- Control independiente de los permisos de descarga o exportación.
- Registro de eventos de seguridad conforme a las políticas existentes.

Cambios necesarios

- Integrar los mecanismos de autorización existentes.
- Revisar los puntos de entrada de la búsqueda y los servicios que consulta.
- Evitar que el cliente pueda determinar arbitrariamente el rol efectivo.
- Añadir pruebas negativas para usuarios no autorizados.
- Revisar sugerencias, recuentos, mensajes de error y fragmentos de resultados.

Comportamiento esperado

Un usuario solo recibe información que podría consultar legítimamente en el módulo de origen. Encontrar un registro no concede permisos adicionales.

Criterios de aceptación

- Un usuario autorizado obtiene los resultados permitidos.
- Un usuario no autorizado no obtiene datos restringidos mediante llamadas directas.
- Manipular identificadores o filtros no amplía el acceso.
- Los datos financieros no se muestran a usuarios exclusivamente académicos.
- Los datos contractuales y personales respetan sus permisos específicos.
- Los errores no revelan información confidencial.
- Los enlaces vuelven a comprobar los permisos.
- Las pruebas se ejecutan con cuentas y datos de prueba controlados.

Entregable

Matriz de permisos y pruebas de seguridad aprobadas.

---

T05-07. Completar la búsqueda de categorías prioritarias

Prioridad: P2
Tipo: Ampliación funcional
Dependencias: T05-01, T05-02 y T05-06.

Problema

El informe no demuestra que todas las categorías solicitadas estén disponibles desde una búsqueda común. Es necesario incorporar las categorías que falten sin duplicar sus módulos.

Requisitos funcionales

Implementar adaptadores para las categorías que el inventario confirme como necesarias y todavía no estén conectadas:

1. Estudiantes.
2. Matrículas por año escolar.
3. Calificaciones por estudiante, asignatura y período.
4. Recibos y pagos.
5. Empleados y contratos.
6. Solicitudes y trámites.
7. Constancias y documentos emitidos.
8. Activos institucionales, si existe el módulo correspondiente.

Cambios necesarios

- Comprobar la existencia y estado de cada módulo.
- Identificar su servicio de consulta real.
- Reutilizar sus validaciones y permisos.
- Definir los campos de búsqueda de cada categoría.
- Registrar expresamente las categorías no disponibles y las dependencias que falten.

Comportamiento esperado

Cada categoría implementada puede consultarse desde la barra global, con resultados fieles a su fuente original y sin alterar las operaciones del módulo.

Criterios de aceptación

- Cada categoría tiene pruebas positivas y negativas.
- Los registros se identifican correctamente.
- Los permisos corresponden al módulo de origen.
- Los resultados conservan el año, período o ejercicio fiscal pertinente.
- No se presentan datos ficticios para categorías ausentes.
- Una categoría no disponible genera un estado identificable.
- No se duplican registros ni se modifican datos al buscar.

Entregable

Matriz de cobertura funcional por categoría y adaptadores integrados.

---

T05-08. Validar accesibilidad, compatibilidad y regresiones

Prioridad: P2
Tipo: Calidad y cierre
Dependencias: T05-03 a T05-07.

Problema

Una búsqueda puede funcionar técnicamente y aun así resultar inaccesible, inconsistente o perjudicial para las funciones de navegación existentes.

Requisitos funcionales

- Navegación por teclado.
- Foco visible y gestión correcta del foco en la apertura y cierre.
- Etiquetas accesibles y anuncios adecuados del estado de búsqueda.
- Diseño adaptable a móviles.
- Compatibilidad con los patrones de interfaz existentes.
- Conservación de las búsquedas especializadas anteriores.

Cambios necesarios

- Probar el componente con teclado y tecnologías de asistencia disponibles.
- Revisar los estilos y componentes existentes.
- Ejecutar regresiones sobre los módulos conectados.
- Corregir problemas introducidos por la integración.

Criterios de aceptación

- Se puede abrir, utilizar y cerrar la búsqueda sin ratón.
- El usuario puede identificar el estado de carga, los resultados y los errores.
- La interfaz mantiene un comportamiento utilizable en pantallas pequeñas.
- Las búsquedas especializadas siguen funcionando.
- Los enlaces y formularios anteriores no quedan bloqueados por la nueva interfaz.
- Los errores de accesibilidad detectados tienen corrección o justificación documentada.

Entregable

Informe de regresión y validación de accesibilidad.

---

ÉPICA E02. Catálogo y resolución de fuentes de datos

Esta épica se activa con base en los resultados de la inspección. El informe transversal no demuestra por sí solo que exista una brecha en la resolución de IDs; por ello, TDS-01 es una tarea de diagnóstico obligatorio y las implementaciones posteriores deben justificarse con evidencias.

TDS-01. Auditar la gestión actual de fuentes e identificadores

Prioridad: P2 para el diagnóstico; P1 si se demuestra riesgo de pérdida o exposición de datos.
Tipo: Inspección técnica
Dependencias: Ninguna.

Problema

No hay evidencia suficiente en el informe para determinar si los IDs de las hojas están centralizados o dispersos entre microservicios, ni si existe un mecanismo común para resolver fuentes históricas.

Requisitos funcionales

- Inventariar los archivos de datos y sus dominios.
- Identificar cómo se configura cada ID.
- Localizar referencias a IDs en el código.
- Identificar fuentes activas e históricas.
- Determinar cómo se seleccionan los años escolares y ejercicios fiscales.
- Identificar los permisos y mecanismos de acceso a cada fuente.
- Documentar los consumidores de cada fuente.

Cambios necesarios

Durante esta tarea no se modifica el sistema. Se realiza una inspección documentada y se construye un mapa de fuentes, consumidores, identificadores y dependencias.

Criterios de aceptación

- Se identifica la fuente de configuración principal real.
- Se documentan los mecanismos de resolución actuales.
- Se identifican las referencias dispersas que puedan causar mantenimiento manual.
- Se distingue entre archivos detectados, archivos verificados y archivos inaccesibles.
- Se identifica qué módulos consultan fuentes históricas.
- Se documentan los bloqueos de acceso y las evidencias pendientes.

Entregable

Inventario de fuentes, mapa de dependencias y decisión sobre la necesidad de TDS-02.

---

TDS-02. Implementar un catálogo central de fuentes, si la auditoría lo justifica

Prioridad: P2
Tipo: Arquitectura
Dependencias: TDS-01 y T12, configuración central.

Problema

Si los identificadores de los archivos están dispersos por el código, agregar un año escolar o ejercicio fiscal puede exigir cambios repetidos y propensos a errores.

Requisitos funcionales

El catálogo deberá permitir registrar y resolver, según las necesidades reales:

- Identificador lógico estable.
- Dominio de datos.
- Año escolar o ejercicio fiscal, cuando corresponda.
- ID real de Google Sheets.
- Estado de la fuente.
- Versión del esquema.
- Referencia a políticas de acceso.
- Información de validación y mantenimiento.

Estos campos son requisitos de diseño, no nombres de columnas que deban incorporarse literalmente.

Cambios necesarios

- Reutilizar el sistema de configuración central existente.
- Definir un registro único por fuente.
- Implementar validaciones al registrar o modificar una fuente.
- Establecer quién puede administrar el catálogo.
- Evitar introducir IDs individuales en cada servicio consumidor.
- Diseñar una estrategia de compatibilidad con las fuentes actuales.

Comportamiento esperado

Los servicios consumidores solicitan una fuente por su identificador lógico y los criterios de negocio correspondientes. El catálogo resuelve el ID real y valida que la fuente esté registrada y habilitada.

Criterios de aceptación

- Puede registrarse una nueva fuente mediante el mecanismo autorizado sin editar múltiples consumidores.
- Un ID inválido o inaccesible no se considera una fuente válida.
- Las fuentes deshabilitadas no se consultan.
- La configuración no concede permisos sobre datos por sí sola.
- Los cambios del catálogo quedan auditados conforme a las políticas del proyecto.
- Las fuentes actuales siguen funcionando durante la transición.
- Existe una estrategia de recuperación ante un catálogo inconsistente.

Entregable

Catálogo central integrado y validado, solo si se demuestra que es necesario.

---

TDS-03. Implementar un servicio común de resolución de fuentes

Prioridad: P2
Tipo: Arquitectura e integración
Dependencias: TDS-01 y TDS-02, si se requiere el catálogo.

Problema

Sin un mecanismo común, distintos módulos pueden seleccionar archivos de forma divergente o consultar una fuente equivocada para un período determinado.

Requisitos funcionales

- Resolver fuentes por dominio y período.
- Diferenciar fuentes activas e históricas.
- Validar el estado y la estructura de la fuente.
- Respetar la autorización del usuario y del servicio.
- Manejar fuentes inaccesibles.
- Conservar la procedencia de los resultados.
- Evitar que el cliente suministre IDs arbitrarios para seleccionar datos.

Cambios necesarios

- Reutilizar los mecanismos de acceso a Sheets ya existentes.
- Centralizar la selección de fuentes cuando se demuestre que aporta valor.
- Definir respuestas explícitas para fuente inexistente, deshabilitada o incompatible.
- Actualizar progresivamente los consumidores afectados, evitando refactorizaciones ajenas al alcance.

Comportamiento esperado

Una consulta identifica la fuente correcta según el dominio y el período sin depender de IDs incrustados en cada función.

Criterios de aceptación

- Una consulta académica selecciona la fuente del año solicitado.
- Una consulta financiera selecciona el ejercicio correspondiente.
- Una fuente no disponible no se sustituye silenciosamente por otra.
- Las consultas históricas conservan su procedencia.
- No se concede acceso por conocer el ID de un archivo.
- Los módulos no pierden compatibilidad durante la integración.
- Las pruebas cubren períodos activos, históricos y fuentes no disponibles.

Entregable

Resolución centralizada de fuentes y pruebas de integración.

---

TDS-04. Garantizar la continuidad académica y financiera entre períodos

Prioridad: P1 si hay pérdida, mezcla o alteración de datos; en otro caso P2.
Tipo: Integridad de datos
Dependencias: TDS-01 y, si se implementan, TDS-02 y TDS-03.

Problema

Separar archivos por año escolar o ejercicio fiscal no garantiza por sí solo que el historial pueda consultarse correctamente.

Requisitos funcionales

- Conservar identificadores estables entre períodos.
- Relacionar matrículas y calificaciones con su año escolar.
- Relacionar movimientos financieros con su ejercicio correspondiente.
- Mantener acceso autorizado a los registros históricos.
- Evitar mezclar datos de períodos distintos.
- Conservar la trazabilidad entre registros y fuentes originales.

Cambios necesarios

- Verificar las relaciones actuales.
- Completar metadatos de período solo cuando falten y sea seguro incorporarlos.
- Definir validaciones para nuevas fuentes.
- Identificar y documentar inconsistencias históricas.

Criterios de aceptación

- Un estudiante puede tener registros en varios años sin duplicar indebidamente su identidad.
- Las calificaciones se atribuyen al año y período correctos.
- Los pagos no se mezclan entre ejercicios.
- Los registros históricos no se alteran por cambiar de período activo.
- Las consultas respetan los permisos de cada registro.
- Las inconsistencias detectadas pueden identificarse y conciliarse.

Entregable

Pruebas de continuidad histórica y plan de corrección de inconsistencias.

---

ÉPICA E03. Consulta histórica e indexación

TDS-05. Definir e implementar una estrategia eficiente de búsqueda histórica

Prioridad: P2
Tipo: Rendimiento y arquitectura
Dependencias: T05-02 y TDS-01.

Problema

Si la búsqueda debe recorrer muchas hojas en cada consulta, el rendimiento puede degradarse. Sin embargo, la auditoría no demuestra todavía que este problema exista, por lo que primero debe medirse.

Requisitos funcionales

Evaluar las siguientes alternativas:

- Consultar directamente las fuentes pertinentes.
- Resolver las fuentes mediante un catálogo.
- Mantener un índice central de metadatos.
- Mantener un índice incremental de búsqueda.
- Migrar selectivamente consultas críticas a una base de datos.

Cambios necesarios

Seleccionar la alternativa con mejor equilibrio entre rendimiento, complejidad, consistencia, permisos y mantenimiento. No crear un índice nuevo si la consulta directa es suficiente.

Comportamiento esperado

La estrategia elegida permite localizar registros históricos sin consultar innecesariamente todas las fuentes, cuando la medición demuestre que esta optimización es necesaria.

Criterios de aceptación

- La elección se basa en mediciones y no solo en estimaciones.
- El diseño conserva las referencias originales.
- Un índice no concede permisos sobre los datos que representa.
- Los resultados pueden validarse contra la fuente oficial.
- Se documenta la frecuencia de actualización y la estrategia de conciliación.
- Si no se necesita indexación, queda documentada la justificación para descartarla.

Entregable

Decisión técnica y, si procede, implementación de la estrategia seleccionada.

---

TDS-06. Mantener la consistencia de índices y fuentes originales

Prioridad: P2; P1 si una inconsistencia puede causar decisiones académicas o financieras incorrectas.
Tipo: Integridad y consistencia
Dependencias: TDS-05, únicamente si se implementa un índice.

Problema

Un índice puede contener referencias obsoletas o incompletas cuando los registros cambian, se archivan o se eliminan.

Requisitos funcionales

- Actualizar el índice después de las operaciones pertinentes.
- Detectar referencias rotas.
- Identificar registros duplicados.
- Diferenciar un resultado indexado de un registro confirmado en la fuente.
- Conciliar los datos con la fuente original.
- Permitir construir el índice si se corrompe.

Cambios necesarios

- Definir eventos o procesos de actualización.
- Establecer una estrategia de reintentos.
- Registrar fallos de sincronización.
- Crear un proceso de conciliación y reconstrucción.
- Evitar actualizaciones duplicadas.

Criterios de aceptación

- Los cambios en registros se reflejan dentro del plazo definido.
- Una referencia rota se detecta.
- Los reintentos no generan duplicados.
- La conciliación identifica discrepancias entre índice y fuente.
- La reconstrucción produce un índice coherente.
- Los resultados obsoletos no se presentan como confirmados.

Entregable

Mecanismo de sincronización, conciliación y recuperación del índice.

---

ÉPICA E04. Exportación y descarga de históricos

TDS-07. Garantizar la exportación autorizada de resultados históricos

Prioridad: P2; P1 si se demuestra exposición de información restringida.
Tipo: Funcionalidad e integridad
Dependencias: T05-02, T05-06 y la infraestructura de exportación existente.

Problema

La búsqueda global debe facilitar la consulta histórica y, cuando proceda, su descarga en Excel o PDF. Una exportación incorrecta puede mezclar períodos o incluir campos confidenciales.

Requisitos funcionales

- Exportar únicamente los registros solicitados y autorizados.
- Mantener filtros y criterios de consulta.
- Conservar la procedencia y el período.
- Admitir los formatos que ya soporte la plataforma.
- Informar de fuentes incompletas o fallos de generación.
- Aplicar límites a exportaciones grandes.

Cambios necesarios

- Reutilizar las funciones de exportación existentes.
- Conectar la búsqueda con la exportación sin duplicar lógica.
- Validar permisos antes de generar el archivo.
- Evitar columnas ocultas o campos sensibles no autorizados.
- Definir el comportamiento ante una fuente inaccesible.

Criterios de aceptación

- El archivo coincide con los registros y filtros seleccionados.
- Los datos corresponden al período correcto.
- No se incluyen campos restringidos.
- Los permisos se vuelven a comprobar al descargar.
- Un fallo de generación no produce un archivo aparentemente válido pero incompleto.
- Los registros originales no se modifican.
- La exportación de resultados históricos conserva su procedencia.

Entregable

Exportación histórica integrada y pruebas de integridad y autorización.

---

ÉPICA E05. Rendimiento, cuotas y continuidad operativa

TDS-08. Medir y optimizar el consumo de recursos

Prioridad: P2
Tipo: Optimización técnica
Dependencias: T05-05 y TDS-01.

Problema

El uso de múltiples fuentes puede aumentar las llamadas a Sheets, el tiempo de ejecución y la posibilidad de alcanzar límites de Apps Script.

Requisitos funcionales

- Medir consultas representativas.
- Identificar llamadas repetidas.
- Evitar lecturas completas innecesarias.
- Aplicar operaciones agrupadas cuando sean adecuadas.
- Controlar volumen de resultados.
- Evaluar caché y paginación.
- Registrar errores transitorios y tiempos de ejecución.

Cambios necesarios

- Crear mediciones reproducibles.
- Optimizar los cuellos de botella demostrados.
- Establecer límites y políticas de reintento.
- Documentar las cuotas que corresponden al servicio realmente utilizado.
- Evaluar una base de datos transaccional solo si las métricas revelan limitaciones importantes.

Criterios de aceptación

- Existe una línea base antes de los cambios.
- Se demuestra una mejora medible en los cuellos de botella abordados.
- No se degradan la exactitud ni los permisos.
- Las consultas incompletas se identifican.
- Las pruebas concurrentes no provocan duplicados ni datos mezclados.
- Las cuotas y límites aplicables están documentados.
- No se afirma que el sistema escala sin pruebas representativas.

Entregable

Informe de rendimiento antes y después, con decisiones de optimización justificadas.

---

TDS-09. Verificar respaldo, restauración y recuperación de fuentes

Prioridad: P2; P1 si la auditoría descubre que no se puede recuperar información crítica.
Tipo: Continuidad operativa
Dependencias: TDS-01 y los mecanismos de respaldo existentes.

Problema

Al incorporar múltiples fuentes, un respaldo puede dejar fuera archivos o metadatos necesarios para reconstruir la relación entre registros y fuentes.

Requisitos funcionales

- Identificar las fuentes incluidas en cada respaldo.
- Conservar el catálogo y las referencias necesarias.
- Detectar fuentes ausentes.
- Verificar integridad.
- Restaurar en un entorno aislado.
- Conciliar datos restaurados con los originales.

Cambios necesarios

- Revisar las funciones existentes de respaldo y restauración.
- Añadir validaciones únicamente donde se demuestre una brecha.
- Definir pruebas periódicas de recuperación.
- Documentar la relación entre archivos restaurados y catálogo de fuentes.

Criterios de aceptación

- Se identifica el alcance real de cada respaldo.
- La verificación detecta archivos ausentes o corruptos.
- La restauración de prueba conserva las relaciones entre fuentes y registros.
- No se sobrescribe producción durante la validación.
- La integridad académica y financiera puede comprobarse después de restaurar.
- Las limitaciones de recuperación quedan documentadas.

Entregable

Informe de recuperación y pruebas verificables de respaldo.

---

ÉPICA E06. Integración, observabilidad y cierre

T05-09. Integrar la búsqueda con auditoría y observabilidad

Prioridad: P2
Tipo: Operación y mantenimiento
Dependencias: T05-02 y T05-06.

Problema

La búsqueda global necesita permitir el diagnóstico de errores sin almacenar información confidencial innecesaria.

Requisitos funcionales

- Registrar errores de búsqueda y fallos de fuentes.
- Identificar categoría, servicio y resultado de ejecución.
- Medir duración y cantidad de fuentes consultadas.
- Diferenciar fallos de autorización, errores técnicos y resultados vacíos.
- Evitar almacenar consultas sensibles o datos personales completos sin justificación.
- Respetar los permisos de acceso a los registros técnicos.

Cambios necesarios

- Reutilizar el sistema de auditoría existente.
- Definir eventos relevantes.
- Incorporar métricas mínimas de rendimiento.
- Establecer reglas de retención y acceso a los registros.
- Evitar registrar credenciales, tokens o datos financieros completos.

Criterios de aceptación

- Un fallo reproducible puede diagnosticarse mediante los registros permitidos.
- Los resultados vacíos no se confunden con errores técnicos.
- Las consultas no generan registros excesivos o innecesarios.
- Los datos sensibles se omiten o se minimizan.
- Los eventos de autorización siguen las reglas de acceso existentes.
- Las métricas permiten identificar fuentes lentas o inaccesibles.

Entregable

Registro operativo de búsqueda con controles de privacidad.

---

T05-10. Ejecutar pruebas de integración y regresión de extremo a extremo

Prioridad: P2; P1 si las pruebas descubren fallos graves de seguridad o integridad.
Tipo: Validación final
Dependencias: Todas las tareas implementadas que formen parte del alcance.

Problema

La integración de una búsqueda transversal puede afectar simultáneamente a permisos, navegación, fuentes de datos, exportación y rendimiento.

Requisitos funcionales

Preparar pruebas que cubran:

- Búsqueda de estudiantes.
- Matrículas de distintos años.
- Calificaciones por período.
- Pagos y recibos.
- Empleados y contratos.
- Solicitudes.
- Constancias.
- Activos, si existe el módulo.
- Fuentes históricas.
- Fuentes no disponibles.
- Resultados parciales.
- Usuarios con distintos permisos.
- Exportaciones.
- Consultas repetidas y concurrentes.
- Errores de servicio.
- Regresión de las búsquedas especializadas existentes.

Cambios necesarios

- Crear o adaptar las pruebas al entorno disponible.
- Utilizar datos de prueba controlados.
- Registrar las condiciones iniciales y los resultados.
- Corregir regresiones dentro del alcance autorizado.
- Mantener una lista de pruebas bloqueadas por falta de entorno o permisos.

Criterios de aceptación

- Cada requisito implementado tiene al menos una prueba pertinente.
- Los escenarios negativos de autorización pasan.
- Los resultados coinciden con las fuentes originales.
- Los errores y resultados parciales se representan correctamente.
- Las funciones anteriores continúan operativas.
- Los bloqueos están documentados y no se contabilizan como pruebas satisfactorias.
- Las tareas no se cierran únicamente porque el código compile.

Entregable

Informe final de integración y regresión, con resultados y pendientes.

---

2. Orden recomendado de ejecución

Orden| Tarea| Prioridad| Motivo
1| T05-01| P2| Define el alcance funcional.
2| TDS-01| P2| Determina cómo se administran actualmente las fuentes.
3| T05-06| P1 preventivo| Verifica la autorización antes de exponer nuevas categorías.
4| T05-02| P2| Construye el servicio común.
5| TDS-02| P2 condicional| Centraliza fuentes si se demuestra la necesidad.
6| TDS-03| P2 condicional| Unifica la resolución de fuentes.
7| T05-03| P2| Integra la barra de búsqueda.
8| T05-07| P2| Conecta las categorías pendientes.
9| T05-04| P2| Añade filtros y relevancia.
10| T05-05| P2| Optimiza las consultas medidas.
11| TDS-04| P1/P2| Verifica la continuidad histórica.
12| TDS-05| P2| Selecciona la estrategia de búsqueda histórica.
13| TDS-06| P1/P2| Mantiene la consistencia, si hay índice.
14| TDS-07| P1/P2| Integra exportación histórica.
15| TDS-08| P2| Optimiza recursos y cuotas.
16| TDS-09| P1/P2| Verifica recuperación de fuentes.
17| T05-09| P2| Mejora el diagnóstico operativo.
18| T05-08| P2| Valida accesibilidad y regresiones de interfaz.
19| T05-10| P2| Cierra con pruebas de extremo a extremo.

Regla de dependencia: si la auditoría demuestra que el catálogo o el servicio de resolución ya existen y cumplen los requisitos, TDS-02 y TDS-03 no deben reconstruirse. Se documentará la evidencia y se continuará con la siguiente tarea aplicable.

La seguridad debe validarse antes de habilitar nuevas categorías para usuarios reales, independientemente del orden administrativo del backlog.

3. Lista maestra de seguimiento

Jules deberá mantener una fila por tarea y por subcapacidad, con los siguientes campos:

Campo| Contenido requerido
ID| Identificador estable de la tarea.
Estado funcional| Categoría definida por la metodología del proyecto.
Avance| No iniciada, en inspección, en desarrollo, en pruebas, bloqueada o cerrada.
Evidencia| Archivos reales, funciones identificadas, pruebas y resultados.
Dependencias| Tareas y servicios requeridos.
Riesgo| Seguridad, integridad, rendimiento o regresión.
Prioridad| P0, P1, P2 o P3.
Próximo paso| Acción concreta y verificable.

No se debe confundir el estado funcional con el avance del trabajo. Una función puede estar defectuosa y tener su auditoría documentada por completo.

4. Definición del cierre del proyecto

El conjunto de tareas podrá considerarse completado cuando:

1. Las categorías previstas estén conectadas o exista una justificación documentada de por qué no aplican.
2. La búsqueda respete los permisos de cada módulo.
3. Las fuentes históricas se resuelvan de forma correcta.
4. La arquitectura permita incorporar nuevos períodos sin cambios manuales repetidos, si esa necesidad se confirma en la auditoría.
5. Los resultados mantengan la trazabilidad hacia sus registros originales.
6. Las exportaciones respeten los filtros y permisos.
7. El rendimiento se haya medido y las optimizaciones estén justificadas.
8. Las pruebas de integración y regresión estén documentadas.
9. Los bloqueos y riesgos pendientes estén explícitos.
10. No existan vulnerabilidades críticas conocidas sin resolver antes de la puesta en producción.

Resultado esperado: una búsqueda global útil, segura y extensible, con una arquitectura de datos cuya complejidad responda a las necesidades reales del instituto y no a una migración innecesaria.


BACKLOG TÉCNICO DE CAPACIDADES AVANZADAS (PLAN DE RESOLUCIÓN)

ÉPICA E07. Monitoreo y Diagnóstico de Sincronización PWA/Offline

TR-15. Implementar Visor de Estado de Cola de Sincronización Local
Prioridad: P3
Tipo: Usabilidad y Observabilidad
Dependencias: Área C (PWA e IndexedDB).

Problema:
Los usuarios no cuentan con un panel gráfico dentro del modal de estado offline para consultar el desglose de acciones pendientes almacenadas en .

Requisitos Funcionales:
1. Crear el visor  en  para mostrar el listado de acciones encoladas con su timestamp y tipo.
2. Permitir forzar reintento manual mediante .
3. Ofrecer botón para descarte manual de acciones fallidas previa confirmación.

Criterios de Aceptación:
- El modal visualiza correctamente las acciones pendientes de la cola IndexedDB.
- La ejecución manual de la sincronización procesa la cola y actualiza la UI.
- No modifica ni elimina datos de producción durante el estado offline.


---

# PLAN MAESTRO DE TAREAS PARA RESOLUCIÓN, COMPLETADO Y OPTIMIZACIÓN

## 1. CONTROL DE CALIDAD Y TRAZABILIDAD TRANSVERSAL

### [T-001] Actualización del Registro Central de Auditoría
- **Archivos Involucrados:** `Auditoría.txt`
- **Descripción:** Consolidar en `Auditoría.txt` todas las entradas y evidencias técnicas derivadas de las auditorías de Infraestructura Transversal, Búsqueda y Fuentes de Datos, Capacidades Avanzadas y Sustitución Operativa Nivel 1.
- **Criterios de Aceptación:**
  - Registro cronológico acumulativo sin purgar información histórica.
  - Trazabilidad completa por módulo, archivo y severidad.
- **Estado:** [ ] Pendiente

### [T-002] Mantenimiento del Mapa de Dependencias
- **Archivos Involucrados:** `MapaDependencias.md`
- **Descripción:** Actualizar `MapaDependencias.md` reflejando las relaciones de endpoints de backend, controladores JS y modales HTML identificados durante las auditorías de capacidades transversales y avanzadas.
- **Criterios de Aceptación:**
  - Indexación de funciones, variables globales y dependencias cruzadas.
- **Estado:** [ ] Pendiente


## 2. ÁREA B: AUTOMATIZACIÓN DE TAREAS Y RECORDATORIOS

### [B-001] Programador de Tareas Automáticas e Idempotencia
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`
- **Descripción:** Implementar cerrojo de ejecución (LockService) e idempotencia en la generación de recordatorios pendientes (`getPendingReminders`), avisos de mora y vencimiento de tareas.
- **Criterios de Aceptación:**
  - Evita ejecuciones duplicadas simultáneas o repetidas en la misma jornada.
  - Mantiene registro de estado en las hojas de auditoría de envío.
- **Estado:** [ ] Pendiente

### [B-002] Centro de Notificaciones y Bandeja de Salida Interna
- **Archivos Involucrados:** `js/ui-common.js`, `teacher-dashboard.html`, `student-dashboard.html`
- **Descripción:** Integrar la bandeja unificada de notificaciones con actualización en tiempo real/sondeo, marcado de leído/no leído e historial de avisos automáticos.
- **Criterios de Aceptación:**
  - Contador dinámico de no leídos en el encabezado.
  - Sincronización automática de estado sin recarga completa.
- **Estado:** [ ] Pendiente

### [B-003] Reglas Configurables de Automatización y Alertas Educativas
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`
- **Descripción:** Configurar disparadores automáticos para alertas tempranas de bajo rendimiento, ausencias consecutivas y vencimiento de cuotas.
- **Criterios de Aceptación:**
  - Configuración por rol (Director/Administrador).
  - Emisión de notificaciones automáticas internas dirigidas a docentes, orientadores y tutores.
- **Estado:** [ ] Pendiente

### [B-004] Auditoría de Entregas y Registro de Notificaciones Automáticas
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción:** Crear bitácora detallada de notificaciones automáticas emitidas indicando destinatario, fecha, canal interno y estado de confirmación.
- **Criterios de Aceptación:**
  - Consulta restringida para perfil Administrador/Director.
  - Exportación de logs de avisos en formato CSV/JSON.
- **Estado:** [ ] Pendiente


## 3. ÁREA C: PWA Y PORTAL MÓVIL

### [C-001] Optimización del Service Worker y Cache Estratégico
- **Archivos Involucrados:** `sw.js`, `manifest.json`
- **Descripción:** Refinar las estrategias de precaché y caché dinámico (`stale-while-revalidate` para assets estáticos, `network-first` para endpoints de API) con fallback a IndexedDB.
- **Criterios de Aceptación:**
  - Carga inmediata offline de dashboards principales y recursos estáticos.
  - Actualización transparente de caché al detectar nueva versión del SW.
- **Estado:** [ ] Pendiente

### [C-002] Gestor de Sincronización Offline en IndexedDB
- **Archivos Involucrados:** `js/ui-common.js`, `js/persistence.js`
- **Descripción:** Robustecer la cola de sincronización offline (`sync_queue` en `ngca_offline_db`) con reintentos exponenciales y manejo de colisiones de datos.
- **Criterios de Aceptación:**
  - Procesamiento automático al recuperar la conexión (`online`).
  - Modal de resolución de conflictos en caso de cambios simultáneos.
- **Estado:** [ ] Pendiente

### [C-003] Visor Gráfico del Estado de Conexión y Cola Pendiente
- **Archivos Involucrados:** `js/ui-common.js`, `teacher-dashboard.html`, `student-dashboard.html`
- **Descripción:** Implementar indicador visual `#online-status-badge` enriquecido con panel desplegable que detalla la cantidad y tipo de acciones pendientes de sincronización.
- **Criterios de Aceptación:**
  - Muestra contador de elementos en cola y botón de "Sincronizar Ahora".
  - Notifica visualmente los éxitos o fallos de sincronización.
- **Estado:** [ ] Pendiente

### [C-004] Adaptación Responsiva Touch-First para Dispositivos Móviles
- **Archivos Involucrados:** `css/style.css`, `js/ui-common.js`, dashboards HTML
- **Descripción:** Garantizar zonas de toque de mínimo 48px, gestos táctiles optimizados (swipes) y drawers navegación fluidos en dispositivos móviles.
- **Criterios de Aceptación:**
  - Cumplimiento de pautas WCAG 2.2 AA para interfaces táctiles.
  - Ausencia de scroll horizontal involuntario en resoluciones móviles (<= 360px).
- **Estado:** [ ] Pendiente

### [C-005] Verificación PWA Lighthous e Instalabilidad Standalone
- **Archivos Involucrados:** `manifest.json`, `sw.js`
- **Descripción:** Validar manifest PWA, iconos responsivos, shortcuts y compatibilidad completa con modos standalone en iOS y Android.
- **Criterios de Aceptación:**
  - Cumplimiento de criterios de instalabilidad PWA en Lighthouse.
  - Banner de instalación nativo funcional en navegadores soportados.
- **Estado:** [ ] Pendiente


## 4. ÁREA D: CENTRO DE INTEGRACIONES Y PROVEEDORES

### [D-001] Gestión Servidor de Adaptadores de Notificación Externa
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción:** Extender los adaptadores multicanal (`configureNotificationChannel`, `sendChannelNotificationTest`) para SMS, WhatsApp, Messenger y Email con aislamiento de fallos.
- **Criterios de Aceptación:**
  - Las fallas en proveedores externos no afectan el funcionamiento de las notificaciones internas.
  - Registro de credenciales cifradas y validadas por servidor.
- **Estado:** [ ] Pendiente

### [D-002] Panel UI de Administración de Integraciones y Proveedores
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`
- **Descripción:** Perfeccionar el modal `#modal-channel-config` permitiendo probar conectividad, configurar tokens, límites de envío y consultar saldo/cuotas del proveedor.
- **Criterios de Aceptación:**
  - Interfaz interactiva de prueba de envío con reporte de código de respuesta HTTP.
  - Acceso restringido exclusivamente a roles Administrador y Director.
- **Estado:** [ ] Pendiente

### [D-003] Normalización de Preferencias del Usuario e Idempotencia
- **Archivos Involucrados:** `backend/user-service/Code.gs`, `js/ui-common.js`
- **Descripción:** Normalizar las preferencias de usuario para la recepción de mensajes por canal (SMS, WhatsApp, Email, In-App) con respeto a las opciones de privacidad del tutor.
- **Criterios de Aceptación:**
  - El backend descarta automáticamente envíos por canales no autorizados por el usuario.
  - Control estricto de límites por hora y prevención de spam.
- **Estado:** [ ] Pendiente

### [D-004] Bitácora Central de Envíos Externos e Alertas de Fallos
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción:** Registrar en `RegistroEnviosExternos` la respuesta exacta, tiempo de latencia y código de error de cada solicitud enviada a proveedores externos.
- **Criterios de Aceptación:**
  - Genera alerta automática al Administrador si la tasa de fallos supera el 15%.
  - Historial consultable con filtros por fecha, canal y destinatario.
- **Estado:** [ ] Pendiente

### [D-005] Pruebas de Desconexión y Resiliencia Multicanal
- **Archivos Involucrados:** `js/teacher.js`, `backend/user-service/Code.gs`
- **Descripción:** Validar que la plataforma opere al 100% en modo degradado cuando los proveedores externos se encuentren deshabilitados o sin saldo.
- **Criterios de Aceptación:**
  - Conmutación automática a canal interno (In-App) sin interrupción de la experiencia del usuario.
  - Sin excepciones no capturadas ni bloqueos en el hilo principal.
- **Estado:** [ ] Pendiente


## 5. ÁREA E: CONTINUIDAD OPERATIVA Y RECUPERACIÓN ANTE DESASTRES

### [E-001] Motor Servidor de Respaldos Integrales JSON/Drive
- **Archivos Involucrados:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/user-service/Code.gs`
- **Descripción:** Fortalecer la generación de copias de respaldo completas (`createSystemBackup`) almacenando dumps estructurados JSON en Google Drive con sumas de verificación Checksum (SHA-256).
- **Criterios de Aceptación:**
  - Generación de respaldo manual y programado.
  - Verificación de integridad mediante `verifyBackupIntegrity`.
- **Estado:** [ ] Pendiente

### [E-002] Procedimiento de Restauración Controlada con Preservación Histórica
- **Archivos Involucrados:** `backend/academic-service/Code.gs`
- **Descripción:** Implementar la restauración segura (`restoreSystemBackup`) con exigencia de código de confirmación explícito (`RESTORE-CONFIRMED`) y protección de registros históricos (Calificaciones y Recuperaciones).
- **Criterios de Aceptación:**
  - Preserva intactos los registros de auditoría e historial de notas.
  - Requiere doble confirmación y rol exclusivo de Administrador.
- **Estado:** [ ] Pendiente

### [E-003] Interfaz UI de Gestión de Respaldos y Estado del Sistema
- **Archivos Involucrados:** `teacher-dashboard.html`, `js/teacher.js`
- **Descripción:** Desarrollar el panel de administración de respaldos permitiendo listar, descargar, verificar integridad y solicitar restauración de puntos de control.
- **Criterios de Aceptación:**
  - Muestra tabla con fecha, tamaño, checksum y estado de cada respaldo.
  - Modal interactivo de confirmación de restauración con advertencias de seguridad.
- **Estado:** [ ] Pendiente

### [E-004] Pruebas Simuladas de Desastre y Failover de Datos
- **Archivos Involucrados:** `backend/academic-service/Code.gs`
- **Descripción:** Realizar simulacros de recuperación ante pérdida accidental de registros comprobando la reconstrucción exacta del estado desde los respaldos JSON.
- **Criterios de Aceptación:**
  - 100% de coincidencia de registros restaurados contra el checksum original.
  - Documentación del tiempo estimado de recuperación (RTO / RPO).
- **Estado:** [ ] Pendiente

### [E-005] Bitácora Protegida de Operaciones de Respaldo y Restauración
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción:** Registrar de forma inmutable todas las acciones de creación, descarga y restauración de respaldos en la bitácora estructurada de seguridad.
- **Criterios de Aceptación:**
  - Captura IP/origen, usuario, timestamp, checksum y resultado de la operación.
  - Registros no modificables ni eliminables mediante interfaz común.
- **Estado:** [ ] Pendiente


## 6. ÁREA A (EVALUACIÓN CONDICIONAL DE ASISTENTE DE IA)

### [IA-01] Análisis de Factibilidad y Arquitectura de Asistente Institucional
- **Archivos Involucrados:** Documentación técnica de arquitectura
- **Descripción:** Evaluar la factibilidad técnica y costos de integración de un Asistente de IA manteniendo la soberanía de los datos de los estudiantes y el estricto cumplimiento de privacidad.
- **Criterios de Aceptación:**
  - Documento de evaluación con recomendaciones claras sobre uso de modelos locales vs APIs externas.
  - Confirmación de exclusión o inclusión condicional del alcance.
- **Estado:** [ ] Pendiente

### [IA-02] Definición de Limites de Privacidad y Gobierno de Datos de IA
- **Archivos Involucrados:** Politica de privacidad y documentos legales
- **Descripción:** Establecer reglas estrictas para impedir el envío de PII (Información Personal Identificable) de estudiantes o finanzas a modelos de IA de terceros.
- **Criterios de Aceptación:**
  - Especificación técnica de anonimización de datos previa a cualquier procesamiento externo.
- **Estado:** [ ] Pendiente

### [IA-03] Prototipado Condicional de Búsqueda Asistida / FAQ con IA
- **Archivos Involucrados:** `js/ui-common.js`
- **Descripción:** En caso de aprobación del Plan Maestro, prototipar la asistencia de búsqueda basada exclusivamente en la base de datos de preguntas frecuentes (FAQ) de la institución.
- **Criterios de Aceptación:**
  - Respuestas limitadas a la base de conocimiento institucional sin alucinaciones.
- **Estado:** [ ] Pendiente


## 7. SALUD OPERATIVA Y PRIVACIDAD TRANSVERSAL

### [X-001] Purga y Sanitización de Registros y Consola
- **Archivos Involucrados:** Todos los controladores `.js` y scripts `.gs`
- **Descripción:** Eliminar llamadas redundantes a `console.log` en producción y sanitizar logs para evitar la exposición de tokens o datos personales sensibles.
- **Criterios de Aceptación:**
  - Ausencia de logs con información sensible en las herramientas de desarrollador del navegador.
  - Manejo uniforme de errores a través del sistema de registros estructurados.
- **Estado:** [ ] Pendiente

### [X-002] Validación WCAG 2.2 AA y Accesibilidad Universal
- **Archivos Involucrados:** `css/style.css`, dashboards HTML, `js/ui-common.js`
- **Descripción:** Verificar contrastes de color, etiquetas aria, navegación completa por teclado (Tab / Shift+Tab) y cierre de modales con la tecla ESC.
- **Criterios de Aceptación:**
  - Ratio de contraste mínimo de 4.5:1 para texto normal.
  - Soporte completo de lectores de pantalla y navegación asistida.
- **Estado:** [ ] Pendiente

### [X-003] Verificación de Propiedad Intelectual y Cumplimiento Legal
- **Archivos Involucrados:** `politica-de-privacidad.html`, `politica-de-uso.html`
- **Descripción:** Validar que las declaraciones de propiedad intelectual pertenezcan a JyP Solutions S. de R.L. de C.V. y que la propiedad de los datos sea 100% del instituto cliente.
- **Criterios de Aceptación:**
  - Texto legal verificado y coherente en todas las páginas públicas e interfaces de la plataforma.
- **Estado:** [ ] Pendiente


## 8. VERIFICACIÓN Y CIERRE FINAL DE LA EXPANSIÓN

### [V-001] Pruebas End-to-End de Integración Transversal (Flujos 1 al 11)
- **Archivos Involucrados:** Todos los servicios backend y vistas frontend
- **Descripción:** Ejecutar la batería completa de 11 flujos de prueba transversales desde la admisión de estudiantes hasta el cierre contable y emisión de reportes.
- **Criterios de Aceptación:**
  - 100% de escenarios ejecutados con éxito sin errores de inconsistencia de datos.
  - Certificación de cero regresiones funcionales.
- **Estado:** [ ] Pendiente

### [V-002] Informe de Cierre de Expansión y Acta de Aprobación
- **Archivos Involucrados:** `ChangesLogs.txt`, `Auditoría.txt`
- **Descripción:** Elaborar el informe consolidado de cierre de expansión acreditando el cumplimiento del 100% de los requisitos arquitectónicos y operativos.
- **Criterios de Aceptación:**
  - Registro completo de cambios en `ChangesLogs.txt`.
  - Conformidad y firma digital de aprobación del plan.
- **Estado:** [ ] Pendiente


---

# BACKLOG MAESTRO DE RESOLUCIÓN, OPTIMIZACIÓN Y EVOLUCIÓN

## A. INFRAESTRUCTURA Y ARQUITECTURA BASE

### [BASE-01] Despliegue de unificación de endpoints y ruteo centralizado
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `js/config.js`, `js/api.js`, `backend/user-service/Code.gs`
- **Acción:** Consolidar el ruteo hacia microservicios backend garantizando fallback automático y reintentos ante fallas de red.

### [BASE-02] Normalización del esquema de persistencia y caché IndexedDB
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `js/persistence.js`, `js/ui-common.js`, `sw.js`
- **Acción:** Estandarizar la estructura de los almacenes locales en IndexedDB (`ngca_offline_db`) asegurando la resolución determinista de conflictos en reconexión.

### [BASE-03] Optimización del ciclo de vida del Service Worker y precaché
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `sw.js`, `manifest.json`
- **Acción:** Implementar políticas de invalidación de caché por versión y precaché diferido para vistas pesadas sin bloquear el hilo principal.

### [BASE-04] Sistema centralizado de tratamiento de errores y logs estructurados
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Acción:** Estandarizar el formato JSON de respuestas de error e integrar captura de excepciones no controladas con envío a `RegistroErrores`.


## B. SEGURIDAD, AUTENTICACIÓN Y PERMISOS GRANULARES (RBAC)

### [SEC-01] Aislamiento estricto de roles en frontend y backend
- **Severidad:** Crítica
- **Estado:** Pendiente
- **Archivos:** `js/api.js`, `backend/user-service/Code.gs`, todos los controladores `.js`
- **Acción:** Enforzar la validación de roles en servidor en el 100% de las operaciones de escritura y lectura sensible, impidiendo bypass mediante manipulación de cliente.

### [SEC-02] Auditoría de sesiones activas y revocación remota
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`, `js/ui-common.js`
- **Acción:** Registrar sesiones activas con huella digital de dispositivo y permitir la expiración forzada desde el panel de administración.

### [SEC-03] Cifrado y sanitización de datos personales en tránsito y reposo
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`
- **Acción:** Aplicar sanitización estricta contra inyecciones XSS en formularios e implementar cifrado para identificadores sensibles.

### [SEC-04] Trazabilidad e inmutabilidad de la bitácora de auditoría
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`
- **Acción:** Garantizar que los registros en `BitacoraAuditoria` sean append-only y protegidos contra modificaciones de usuarios con rol no autorizado.

### [SEC-05] Control de frecuencia (Rate Limiting) y prevención de abuso
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`
- **Acción:** Implementar controles de frecuencia de peticiones por usuario e IP para endpoints de autenticación y generación de reportes.


## C. MATRÍCULA Y ADMISIÓN DE ESTUDIANTES

### [MAT-01] Automatización del flujo de pre-matrícula y validación documental
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `js/student.js`, `backend/academic-service/Code.gs`
- **Acción:** Integrar la verificación automática de requisitos documentales durante el proceso de solicitud de pre-matrícula.

### [MAT-02] Detección de duplicados en admisiones y fusión de registros
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/academic-service/Code.gs`, `js/teacher.js`
- **Acción:** Implementar algoritmos de coincidencia por coincidencia de identidad/nombre para alertar sobre expedientes duplicados antes de crear nuevos.


## D. EXPEDIENTES Y GESTIÓN DE ESTUDIANTES

### [EXP-01] Visor unificado del historial académico y disciplinario
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `js/teacher.js`, `student-dashboard.html`
- **Acción:** Consolidar en una sola vista la cronología de notas, asistencias, reconocimientos e incidencias disciplinarias del alumno.

### [EXP-02] Gestión de traslados, retiros y cambios de condición
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/academic-service/Code.gs`, `js/teacher.js`
- **Acción:** Flujo completo para tramitar bajas, traslados e inactivaciones de expedientes con generación automática de paz y salvo.


## E. CALIFICACIONES Y EVALUACIÓN DE APRENDIZAJES

### [ACA-01] Motor de cálculo y ponderación de calificaciones por período
- **Severidad:** Crítica
- **Estado:** Pendiente
- **Archivos:** `backend/exam-service/Code.gs`, `js/teacher.js`
- **Acción:** Validar la aplicación exacta de rúbricas, porcentajes por categoría y redondeo institucional oficial.

### [ACA-02] Publicación y cierre de cuadros de honor y boletines
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/exam-service/Code.gs`, `js/teacher.js`, `student-dashboard.html`
- **Acción:** Flujo de aprobación para cierre definitivo de actas de calificaciones e imposibilidad de modificación sin reapertura autorizada.

### [ACA-03] Módulo de recuperaciones y evaluaciones extraordinarias
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/exam-service/Code.gs`, `js/teacher.js`
- **Acción:** Registro de procesos de recuperación académica con cálculo automático de notas definitivas recalificadas.


## F. ASISTENCIA Y PUNTUALIDAD

### [ASI-01] Toma de asistencia diaria y por asignatura con alertas en tiempo real
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `js/teacher.js`, `backend/academic-service/Code.gs`
- **Acción:** Interfaz optimizada para registro rápido de asistencia diaria con notificación automática a tutores ante ausencias no justificadas.

### [ASI-02] Flujo de justificación de ausencias e integración con expedientes
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `js/student.js`, `backend/academic-service/Code.gs`, `js/teacher.js`
- **Acción:** Permite a tutores enviar comprobantes de justificación con panel de aprobación para orientación y secretaría.


## G. AULA VIRTUAL Y RECURSOS EDUCATIVOS

### [AULA-01] Publicación de materiales y asignación de tareas interactivas
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/task-service/Code.gs`, `js/teacher.js`, `js/student.js`
- **Acción:** Módulo para publicación diferida o inmediata de actividades académicas con adjuntos y fechas límite.

### [AULA-02] Control de versiones en entregas de tareas y carga reanudable
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/task-service/Code.gs`, `js/ui-common.js`
- **Acción:** Implementación de carga por fragmentos (chunked upload) para archivos pesados con reintento automático ante desconexión.

### [AULA-03] Integración de cuestionarios y banco de preguntas automatizado
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/exam-service/Code.gs`, `js/quizpro.js`
- **Acción:** Generación dinámica de evaluaciones a partir de banco de preguntas con calificación instantánea.


## H. PAGOS, COBROS Y CUENTAS POR COBRAR

### [FIN-01] Pasarela de registro y verificación de comprobantes de pago
- **Severidad:** Crítica
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/student.js`, `js/accounting.js`
- **Acción:** Carga de recibos bancarios por tutores y cola de revisión administrativa para aprobación o rechazo con observación.

### [FIN-02] Generación automática de estados de cuenta y alertas de mora
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/student.js`
- **Acción:** Cálculo transparente de cargos, abonos, saldos pendientes y desglose de tarifas por estudiante/familia.

### [FIN-03] Emisión de facturas fiscales SAR y recibos digitales PDF
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/accounting.js`
- **Acción:** Generación de documentos fiscales formateados conforme a requisitos legales e impresión/descarga directa.

### [FIN-04] Gestión de convenios de pago y Becas/Descuentos
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/accounting.js`
- **Acción:** Aplicación estructurada de planes de amortización, becas parciales o totales sobre cargos mensuales.

### [FIN-05] Cierre de caja diario y arqueo de ingresos
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/accounting.js`
- **Acción:** Proceso de validación de cobros en efectivo y transferencias para conciliación de caja chica y depósito.


## I. CONTABILIDAD Y CONTROL FINANCIERO

### [CON-01] Libro mayor y asientos contables de partida doble
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`
- **Acción:** Validación estricta de balance `Debe === Haber` en cada transacción financiera automatizada o manual.

### [CON-02] Control presupuestario por centro de costo institucional
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `dashboard-contabilidad.html`
- **Acción:** Seguimiento en tiempo real de ejecución presupuestaria proyectada vs devengada por departamento.

### [CON-03] Conciliación bancaria y gestión de cuentas por pagar
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/accounting.js`
- **Acción:** Módulo para cruce de extractos bancarios e importación de facturas de proveedores.

### [CON-04] Control de inventarios Kardex y activos fijos
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/accounting.js`
- **Acción:** Registro de entradas, salidas, depreciaciones y asignaciones patrimoniales de mobiliario y equipo.


## J. PLANILLAS Y GESTIÓN DE PERSONAL (RRHH)

### [NOM-01] Expediente laboral de colaboradores y contratos
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `dashboard-recursos-humanos.html`
- **Acción:** Gestión de información contractual, cargos, salarios base y repositorio privado de documentos del empleado.

### [NOM-02] Cálculo de nómina con deducciones de ley (IHSS, RAP, ISR)
- **Severidad:** Crítica
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`
- **Acción:** Motor de cálculo de planilla quincenal/mensual con retenciones estatutarias e incapacidades.

### [NOM-03] Solicitud de vacaciones, licencias y marcaje de asistencia
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `dashboard-recursos-humanos.html`, `backend/accounting-service/Code.gs`
- **Acción:** Portal de autoservicio para el empleado con flujo de aprobación jerárquica para permisos y vacaciones.


## K. GESTIÓN DOCUMENTAL Y FIRMA DIGITAL

### [DOC-01] Generación de certificaciones y constancias académicas
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/accounting-service/Code.gs`, `js/teacher.js`
- **Acción:** Plantillas dinámicas para emisión instantánea de constancias de estudio, conducta y egreso.

### [DOC-02] Editor visual de plantillas PDF con estampación overlay
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `teacher-dashboard.html`, `js/teacher.js`
- **Acción:** Posicionamiento interactivo de campos dinámicos sobre documentos base PDF mediante pdf-lib.

### [DOC-03] Verificación mediante Código Único de Verificación (CUV)
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`, `js/ui-common.js`
- **Acción:** Portal público para validar la autenticidad e integridad de documentos oficiales emitidos.


## L. COMUNICACIÓN INSTITUCIONAL Y MENSAJERÍA

### [COM-01] Emisión de comunicados con acuse de recibo explícito
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`, `student-dashboard.html`
- **Acción:** Envío segmentado de circulares requiriendo confirmación de lectura por parte de los tutores.

### [COM-02] Mensajería interna y canales de atención a familias
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`, `js/student.js`, `js/teacher.js`
- **Acción:** Hilos de conversación entre docentes, directivos y padres de familia con control de horarios de atención.

### [COM-03] Agenda institucional y calendario unificado
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `backend/academic-service/Code.gs`, `js/ui-common.js`
- **Acción:** Visualización consolidada de eventos académicos, feriados, exámenes y reuniones de padres.


## M. REPORTES, INDICADORES E INTELIGENCIA INSTITUCIONAL

### [REP-01] Catálogo central de reportes institucionales
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`, `js/ui-common.js`
- **Acción:** Motor de generación de reportes matriciales consolidando datos académicos, financieros y administrativos.

### [REP-02] Tableros analíticos e indicadores KPI con gráficos dinámicos
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `js/ui-common.js`, dashboards HTML
- **Acción:** Componentes gráficos personalizables para evaluar retención, morosidad, rendimiento promedio y asistencia.

### [REP-03] Simulares de proyecciones y tendencias de inscripción
- **Severidad:** Bajo
- **Estado:** Pendiente
- **Archivos:** `backend/user-service/Code.gs`, `js/ui-common.js`
- **Acción:** Herramienta predictiva para estimación de ingresos y capacidad de aulas en períodos futuros.


## N. EXPERIENCIA DE USUARIO, OPTIMIZACIÓN Y CIERRE

### [UX-01] Sistema de guías e instructivos contextuales interactivos
- **Severidad:** Bajo
- **Estado:** Pendiente
- **Archivos:** `js/ui-common.js`
- **Acción:** Tours guiados paso a paso para orientar a nuevos usuarios en las funciones principales de la plataforma.

### [PERF-01] Optimización de tiempo de respuesta y carga perezosa
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** Todos los controladores `.js`
- **Acción:** Paginación y lazy loading en tablas extensas para garantizar tiempos de renderizado inferiores a 1 segundo.

### [PERF-02] Reducción de latencia en peticiones asíncronas
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `js/api.js`
- **Acción:** Agrupación de solicitudes paralelas (batch requests) para minimizar llamadas RTT al backend Google Apps Script.

### [UX-02] Estandarización de paletas institucionales y accesibilidad
- **Severidad:** Bajo
- **Estado:** Pendiente
- **Archivos:** `css/style.css`, `js/ui-common.js`
- **Acción:** Conmutador de temas de color y modo de alto contraste para cumplimiento WCAG 2.2 AA.

### [NEW-01] Integración del Botón Global y Modal de Reporte de Problemas
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Acción:** Soporte para captura automática de contexto, imágenes y seguimiento de tickets de soporte técnico.

### [NEW-02] Panel de Control Administrativo de Tickets de Soporte
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `js/ui-common.js`, `teacher-dashboard.html`
- **Acción:** Interfaz para gestión de estados de tickets, asignación a personal de soporte y respuestas públicas/privadas.

### [NEW-03] Modal Forzado de Aceptación de Términos y Condiciones
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `js/ui-common.js`, `backend/user-service/Code.gs`
- **Acción:** Bloqueo de navegación en primer inicio hasta la firma digital y aceptación de políticas de privacidad.

### [NEW-04] Selector de Cambiador de Estudiantes para Familias Múltiples
- **Severidad:** Media
- **Estado:** Pendiente
- **Archivos:** `js/student.js`, `student-dashboard.html`
- **Acción:** Alternancia fluida entre perfiles de hijos vinculados a un mismo tutor con consolidación de saldos y tareas.

### [FINAL-01] Auditoría de Integración y Pruebas Transversales Nivel 1
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** Todos los módulos
- **Acción:** Verificación completa de los 11 flujos de sustitución operativa.

### [FINAL-02] Verificación de Cumplimiento de Políticas de Código y Repositorio
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** Todo el proyecto
- **Acción:** Certificación del cumplimiento de `METODOLOGIA_DESARROLLO.md` y `AGENTS.md`.

### [FINAL-03] Firma de Cierre de Versión 1.0 Global
- **Severidad:** Alta
- **Estado:** Pendiente
- **Archivos:** `js/config.js`, `ChangesLogs.txt`
- **Acción:** Congelamiento formal del release 1.0 y generación de versión final documentada.
