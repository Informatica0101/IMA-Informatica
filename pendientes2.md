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
- **Estado:** [X] Completada

### [B-004] Auditoría de Entregas y Registro de Notificaciones Automáticas
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción:** Crear bitácora detallada de notificaciones automáticas emitidas indicando destinatario, fecha, canal interno y estado de confirmación.
- **Criterios de Aceptación:**
  - Consulta restringida para perfil Administrador/Director.
  - Exportación de logs de avisos en formato CSV/JSON.
- **Estado:** [X] Completada


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
- **Estado:** [X] Completada

### [D-004] Bitácora Central de Envíos Externos e Alertas de Fallos
- **Archivos Involucrados:** `backend/user-service/Code.gs`
- **Descripción:** Registrar en `RegistroEnviosExternos` la respuesta exacta, tiempo de latencia y código de error de cada solicitud enviada a proveedores externos.
- **Criterios de Aceptación:**
  - Genera alerta automática al Administrador si la tasa de fallos supera el 15%.
  - Historial consultable con filtros por fecha, canal y destinatario.
- **Estado:** [X] Completada

### [D-005] Pruebas de Desconexión y Resiliencia Multicanal
- **Archivos Involucrados:** `js/teacher.js`, `backend/user-service/Code.gs`
- **Descripción:** Validar que la plataforma opere al 100% en modo degradado cuando los proveedores externos se encuentren deshabilitados o sin saldo.
- **Criterios de Aceptación:**
  - Conmutación automática a canal interno (In-App) sin interrupción de la experiencia del usuario.
  - Sin excepciones no capturadas ni bloqueos en el hilo principal.
- **Estado:** [X] Completada


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


---

# PLAN DE TRABAJO: RESOLUCIÓN Y OPTIMIZACIÓN DE SUSTITUACIÓN ADMINISTRATIVA

Proyecto: Plataforma Integral de Gestión Educativa — New Generation Christian Academy
Base: Informe de Auditoría Funcional de Sustitución Administrativa, versión 1.0, del 18 de octubre de 2026.
Modalidad: implementación posterior, condicionada a autorización.
Objetivo: resolver las siete brechas documentadas, preservar las capacidades verificadas y elevar la seguridad, integridad, usabilidad y automatización de los servicios administrativos.

Reglas generales de ejecución

Antes de comenzar cada tarea:

1. Lee "METODOLOGIA_DESARROLLO.md" y la documentación de requisitos vigente.
2. Comprueba que la brecha siga existiendo en la versión actual del repositorio.
3. Identifica los archivos, componentes, endpoints, servicios, estructuras de datos y pruebas reales afectados.
4. Comprueba los contratos de entrada y salida, las autorizaciones, las dependencias y los efectos secundarios.
5. Define las pruebas necesarias antes de modificar el código.
6. Implementa únicamente el alcance autorizado y conserva el comportamiento existente que no sea incompatible con la corrección.
7. Ejecuta las pruebas pertinentes y registra evidencias del resultado.
8. No declares una tarea terminada por haber modificado el código: deben aprobarse sus criterios de aceptación.

Las rutas y los nombres técnicos citados en este documento proceden del informe de auditoría. Confirma su vigencia antes de utilizarlos y descubre las ubicaciones reales si han cambiado.

---

TAREA ADM-00. Validación previa de las brechas y preparación de pruebas

Prioridad: obligatoria.
Tipo: preparación y control de calidad.
Dependencias: ninguna.

Problema

El plan de resolución se basa en un informe de auditoría que registra siete brechas, pero antes de corregirlas es necesario comprobar que siguen presentes en la versión que se va a modificar y que los criterios de aceptación corresponden al comportamiento real del proyecto.

Objetivo

Establecer una línea base verificable para resolver los defectos sin duplicar funcionalidades, introducir incompatibilidades ni alterar servicios que ya funcionan.

Requisitos

- Revisar las evidencias de las siete brechas.
- Identificar las pruebas existentes y las carencias de cobertura.
- Comprobar las relaciones entre los servicios administrativos.
- Identificar los datos y entornos seguros para las pruebas.
- Documentar los comportamientos actuales que deban preservarse.
- Preparar pruebas de regresión para las operaciones afectadas.

Criterios de aceptación

- CA-00.1: cada brecha dispone de evidencia actualizada o queda marcada como no reproducida.
- CA-00.2: las ubicaciones y dependencias reales están identificadas.
- CA-00.3: las pruebas previstas cubren los escenarios normales, los errores y los permisos.
- CA-00.4: las operaciones de prueba no pueden modificar accidentalmente datos de producción.
- CA-00.5: existe una línea base para comparar el comportamiento anterior y posterior.
- CA-00.6: ninguna brecha deja de atenderse silenciosamente; las discrepancias se documentan y se someten a decisión antes de ampliar o reducir el alcance.

Resultado esperado: plan de pruebas preparado y brechas confirmadas para su resolución.

---

TAREA ADM-01. Bloquear la autoaprobación de solicitudes

Brecha: GAP-ADM-03.
Prioridad: P1, seguridad e integridad del proceso.
Dependencias: ADM-00.

Problema

El proceso de aprobación no impide explícitamente que el solicitante apruebe su propia solicitud. El informe identifica el proceso "processWorkflowDecision" en "backend/user-service/Code.gs" como punto de inspección inicial.

Objetivo

Garantizar la separación entre quien solicita una operación y quien la autoriza, sin depender de datos de identidad controlados por el cliente.

Requisitos funcionales

1. Obtener la identidad autenticada del usuario mediante el mecanismo de autenticación real del proyecto.
2. Determinar en el servidor quién es el solicitante original y quién ejecuta la decisión.
3. No aceptar como identidad autenticada un "revisorId", rol o identificador enviado libremente por el cliente.
4. Rechazar la decisión cuando el aprobador efectivo sea el mismo usuario que inició la solicitud.
5. Mantener las reglas existentes de roles, etapas, estados y autorizaciones.
6. Registrar las decisiones rechazadas cuando corresponda, sin modificar el estado de la solicitud.
7. Evitar que solicitudes directas al endpoint o reintentos permitan eludir la regla.

Cambios necesarios

- Inspeccionar el flujo completo de autenticación y autorización.
- Corregir la validación en el servidor y los puntos de entrada alternativos que permitan tomar la misma decisión.
- Reutilizar las utilidades de identidad y permisos existentes cuando sean seguras.
- Incorporar pruebas automatizadas o reproducibles para las decisiones permitidas y denegadas.
- Evitar refactorizaciones generales del motor de aprobaciones.

Criterios de aceptación

- CA-01.1: un usuario puede aprobar solicitudes ajenas cuando dispone de los permisos correspondientes.
- CA-01.2: el solicitante no puede aprobar su propia solicitud, aunque manipule los datos enviados por el cliente.
- CA-01.3: cambiar el identificador del revisor en la petición no altera la identidad efectiva.
- CA-01.4: un usuario sin permisos no puede aprobar ni rechazar solicitudes.
- CA-01.5: los rechazos por autoaprobación no modifican el estado ni la información de la solicitud.
- CA-01.6: las decisiones legítimas mantienen el funcionamiento del flujo multinivel.
- CA-01.7: dos decisiones concurrentes no producen resultados contradictorios ni registran dos aprobaciones definitivas.
- CA-01.8: los intentos rechazados no exponen información sensible.

Resultado esperado: el control de autoaprobación queda aplicado en el servidor y verificado mediante pruebas positivas, negativas y de regresión.

---

TAREA ADM-02. Proteger la confidencialidad de los informes de orientación educativa

Brecha: GAP-ADM-07.
Prioridad: P1, protección de información sensible.
Dependencias: ADM-00.

Problema

El informe identifica un riesgo de exposición de notas confidenciales en reportes y exportaciones masivas relacionados con "backend/academic-service/Code.gs", los casos de seguimiento y los campos de notas o acciones acumuladas.

Objetivo

Garantizar que la exportación de información de orientación respete los permisos, el propósito de la consulta y la confidencialidad de cada campo.

Requisitos funcionales

1. Inventariar los informes, exportaciones, consultas masivas y servicios que recuperen datos de orientación.
2. Clasificar los campos según su sensibilidad y las autorizaciones requeridas.
3. Aplicar los permisos en el servidor antes de construir la respuesta exportable.
4. Excluir, anonimizar o restringir las notas confidenciales según el rol y el propósito autorizado.
5. Evitar que los datos privados aparezcan indirectamente en otras columnas, metadatos, archivos temporales o mensajes de error.
6. Mantener la información necesaria para los usuarios expresamente autorizados.
7. No anonimizar indiscriminadamente datos que los profesionales autorizados necesitan para realizar su trabajo.
8. Aplicar los controles a todos los formatos de exportación realmente existentes.

Cambios necesarios

- Identificar las rutas de lectura individual y masiva.
- Centralizar o reutilizar las reglas de autorización y filtrado de campos cuando sea viable.
- Revisar los reportes generados en el servidor y los formatos de exportación.
- Crear datos ficticios de prueba con notas confidenciales claramente identificables.
- Comprobar los resultados tanto en la interfaz como en las respuestas directas del backend.

Criterios de aceptación

- CA-02.1: los usuarios no autorizados no pueden recuperar notas confidenciales mediante consultas individuales ni masivas.
- CA-02.2: las exportaciones destinadas a usuarios sin autorización omiten o anonimizan los campos restringidos conforme a la política definida.
- CA-02.3: los usuarios autorizados conservan el acceso legítimo a los datos necesarios.
- CA-02.4: las restricciones se mantienen al cambiar parámetros, identificadores, filtros o formatos de exportación.
- CA-02.5: los datos confidenciales no se filtran mediante errores, registros técnicos o campos derivados.
- CA-02.6: los informes conservan su estructura y utilidad para los usuarios autorizados.
- CA-02.7: los cambios no degradan los permisos ni la consulta de otros módulos académicos.
- CA-02.8: las pruebas no requieren copiar expedientes reales al entorno de desarrollo.

Resultado esperado: las exportaciones y consultas de orientación respetan los permisos efectivos y la confidencialidad de los datos.

---

TAREA ADM-03. Desarrollar la interfaz administrativa de transporte escolar

Brecha: GAP-ADM-01.
Prioridad: P1, capacidad operativa incompleta.
Dependencias: ADM-00. La integración con ADM-04 debe realizarse antes de habilitar asignaciones definitivas.

Problema

El informe indica que existen operaciones de backend para rutas y asignaciones, pero no una interfaz dedicada que permita a los usuarios autorizados gestionar estas operaciones de forma integral.

Objetivo

Proporcionar una interfaz funcional para administrar rutas, unidades, conductores, paradas y asignaciones de estudiantes, reutilizando los servicios existentes y evitando duplicar la lógica de negocio.

Requisitos funcionales

1. Identificar los roles reales que deben administrar el transporte.
2. Descubrir la navegación y el patrón de interfaz adecuados dentro del proyecto.
3. Permitir consultar rutas y sus datos relacionados.
4. Permitir crear o modificar rutas cuando el usuario tenga autorización.
5. Consultar unidades, conductores, paradas y capacidad disponible.
6. Consultar las asignaciones de estudiantes por ruta.
7. Permitir asignar o retirar estudiantes conforme a las reglas del proyecto.
8. Mostrar estados de operación, validaciones, errores y confirmaciones.
9. Incorporar búsqueda, filtros y estados vacíos comprensibles.
10. Adaptar la interfaz a pantallas móviles y de escritorio.
11. No mostrar información personal de estudiantes a roles que no estén autorizados.
12. Integrar las validaciones del servidor, sin sustituirlas por comprobaciones de interfaz.

Cambios necesarios

- Inspeccionar los servicios de transporte existentes y sus contratos.
- Identificar las pantallas administrativas existentes y los patrones reutilizables.
- Incorporar la interfaz en la ubicación real descubierta. El informe propone revisar "teacher-dashboard.html" y "js/teacher.js", pero no obliga a usarlos si no son los puntos de entrada correctos.
- Conectar las acciones con los endpoints existentes o documentar la dependencia real si alguno necesita ampliarse.
- Implementar estados de carga, error, éxito y ausencia de datos.
- Evitar una segunda implementación de las reglas de asignación en el frontend.

Criterios de aceptación

- CA-03.1: los usuarios autorizados pueden consultar las rutas y sus asignaciones.
- CA-03.2: las operaciones de alta, edición y asignación disponibles funcionan de extremo a extremo.
- CA-03.3: los usuarios sin permisos no pueden realizar estas operaciones mediante llamadas directas.
- CA-03.4: la interfaz muestra errores comprensibles cuando falla una operación.
- CA-03.5: una operación fallida no produce una confirmación falsa ni una asignación parcial no detectada.
- CA-03.6: la información presentada coincide con los datos recuperados del servidor.
- CA-03.7: la interfaz permite identificar rutas sin unidad, sin conductor o sin estudiantes asignados.
- CA-03.8: las asignaciones quedan sujetas a los controles de capacidad definidos en ADM-04.
- CA-03.9: los cambios no rompen la navegación ni las funciones existentes del panel.
- CA-03.10: las pruebas móviles y de escritorio verifican formularios, tablas, navegación y mensajes.

Resultado esperado: un panel de transporte escolar integrado, utilizable y protegido por permisos, con sus operaciones validadas en el servidor.

---

TAREA ADM-04. Validar la capacidad de las unidades de transporte

Brecha: GAP-ADM-02.
Prioridad: P2, integridad de las asignaciones.
Dependencias: ADM-00; integración funcional con ADM-03.

Problema

El proceso de asignación puede registrar estudiantes sin comprobar de forma activa que la cantidad total respete la capacidad máxima de la unidad.

Objetivo

Evitar el sobrecupo y las asignaciones incompatibles, garantizando que las validaciones se apliquen al confirmar la operación.

Requisitos funcionales

1. Identificar dónde se almacena la capacidad autorizada de cada unidad.
2. Definir cómo se cuentan las asignaciones activas y qué estados consumen una plaza.
3. Validar que la unidad exista, esté activa y pueda utilizarse.
4. Rechazar nuevas asignaciones cuando se alcance la capacidad permitida.
5. Definir el comportamiento ante una capacidad inexistente, inválida o no configurada.
6. Recalcular la disponibilidad en el momento de confirmar la operación.
7. Gestionar solicitudes concurrentes para evitar que dos asignaciones simultáneas ocupen la misma plaza.
8. Mantener coherencia entre el backend y los indicadores de capacidad de la interfaz.

Cambios necesarios

- Inspeccionar "assignStudentTransport" y sus dependencias reales.
- Verificar cómo se representan las unidades, las rutas y las asignaciones activas.
- Incorporar validaciones de servidor y manejo de concurrencia.
- Si los datos se almacenan en Google Sheets, evaluar el uso apropiado de "LockService" para proteger la sección crítica de la asignación.
- Evitar mantener un contador de plazas que pueda quedar desincronizado respecto de las asignaciones reales.

Criterios de aceptación

- CA-04.1: una asignación válida se acepta si existe capacidad disponible.
- CA-04.2: una asignación que supera la capacidad es rechazada en el servidor.
- CA-04.3: una unidad con capacidad desconocida o inválida no admite nuevas asignaciones hasta resolver la condición conforme a la política definida.
- CA-04.4: retirar o cancelar una asignación libera la plaza cuando corresponda.
- CA-04.5: dos solicitudes concurrentes para la última plaza no pueden aprobarse ambas.
- CA-04.6: la capacidad restante que muestra la interfaz coincide con las asignaciones activas.
- CA-04.7: cambiar los datos enviados por el cliente no permite eludir el control.
- CA-04.8: se mantienen las reglas de permisos y las relaciones existentes entre estudiante, ruta y unidad.

Resultado esperado: asignaciones coherentes con la capacidad real, sin sobrecupo causado por operaciones normales, manipulación del cliente o concurrencia.

---

TAREA ADM-05. Incorporar control presupuestario a las solicitudes de compra

Brecha: GAP-ADM-04.
Prioridad: P2, integridad financiera.
Dependencias: ADM-00.

Problema

El sistema calcula importes comprometidos y ejecutados, pero el informe señala que la creación de solicitudes no aplica una advertencia o restricción cuando el importe previsto supera el presupuesto disponible.

Objetivo

Integrar el presupuesto con el flujo de compras, de forma que la disponibilidad presupuestaria sea visible, coherente y respetada por las operaciones autorizadas.

Requisitos funcionales

1. Identificar la relación entre centro de costo, partida, período presupuestario y solicitud de compra.
2. Determinar cómo se calculan los importes presupuestados, comprometidos, ejecutados y disponibles.
3. Definir cuándo una solicitud compromete presupuesto: al crearla, enviarla, aprobarla o generar el pedido.
4. Evitar contar dos veces un mismo importe al pasar entre estados.
5. Aplicar la política de exceso configurada: advertencia, bloqueo o excepción autorizada.
6. Permitir excepciones únicamente a los roles autorizados y registrar su justificación.
7. Actualizar la disponibilidad conforme a los cambios de estado, cancelaciones y reversiones.
8. Comprobar la disponibilidad al confirmar la operación, no solamente al cargar el formulario.
9. Proteger las operaciones concurrentes para evitar que dos compras consuman el mismo saldo.
10. Mantener informes consistentes con los movimientos reales.

Cambios necesarios

- Inspeccionar "createPurchaseRequest", "saveBudgetPlan", "getBudgets" y "getBudgetExecutionReport", confirmando las ubicaciones actuales.
- Identificar la fuente oficial del saldo disponible y las reglas vigentes de compromiso presupuestario.
- Integrar las validaciones sin duplicar cálculos ni alterar la contabilidad existente.
- Definir mensajes que indiquen el saldo, el exceso y la acción requerida sin exponer datos ajenos al usuario.
- Incorporar pruebas para solicitudes nuevas, modificaciones, aprobaciones, cancelaciones y operaciones concurrentes.

Criterios de aceptación

- CA-05.1: una solicitud dentro del límite se procesa conforme al flujo habitual.
- CA-05.2: una solicitud que excede el límite recibe la advertencia o el bloqueo definido por la política.
- CA-05.3: un usuario sin permisos no puede eludir el control mediante una llamada directa.
- CA-05.4: una excepción presupuestaria autorizada deja constancia del responsable y la justificación requerida.
- CA-05.5: cancelar una solicitud libera el compromiso cuando las reglas lo determinen.
- CA-05.6: modificar una solicitud recalcula correctamente el importe comprometido.
- CA-05.7: las solicitudes concurrentes no producen sobreasignación silenciosa del presupuesto.
- CA-05.8: los informes coinciden con el saldo calculado a partir de los registros pertinentes.
- CA-05.9: los importes se manejan con precisión monetaria apropiada.
- CA-05.10: se conservan los procesos existentes de recepción, cuentas por pagar e inventario.

Resultado esperado: control presupuestario coherente y trazable, con reglas de exceso explícitas y protección frente a duplicidades.

---

TAREA ADM-06. Restringir nuevas operaciones con proveedores inactivos

Brecha: GAP-ADM-05.
Prioridad: P2, integridad administrativa.
Dependencias: ADM-00.

Problema

El sistema conserva el estado del proveedor, pero no rechaza explícitamente todas las operaciones nuevas que intenten utilizar un proveedor inactivo.

Objetivo

Impedir nuevas compras no autorizadas con proveedores inactivos sin eliminar sus registros ni romper el historial de operaciones anteriores.

Requisitos funcionales

1. Identificar el campo y los valores reales que representan el estado del proveedor.
2. Establecer una única regla de interpretación del estado activo.
3. Aplicar la validación en todos los puntos de entrada que creen o confirmen operaciones nuevas.
4. Verificar el proveedor en el servidor y no confiar únicamente en el filtro de la interfaz.
5. Permitir consultar las compras históricas asociadas a proveedores inactivos.
6. Definir el tratamiento de las cotizaciones y órdenes que ya existían cuando el proveedor fue desactivado.
7. Evitar la reactivación o modificación del estado por usuarios sin autorización.
8. Proporcionar un mensaje claro cuando se rechace una operación.

Cambios necesarios

- Inspeccionar "registerSupplier", "getSuppliers", "submitPurchaseQuotation", "createPurchaseOrder" y los demás puntos de entrada reales.
- Aplicar la regla a las operaciones pertinentes sin duplicar validaciones contradictorias.
- Mantener los identificadores y las relaciones históricas.
- Comprobar el comportamiento ante estados vacíos, desconocidos o inconsistentes.

Criterios de aceptación

- CA-06.1: las nuevas cotizaciones u órdenes no se aceptan cuando la política prohíbe utilizar un proveedor inactivo.
- CA-06.2: el control se aplica en el servidor aunque el cliente envíe manualmente el identificador del proveedor.
- CA-06.3: las operaciones históricas siguen siendo consultables.
- CA-06.4: la desactivación de un proveedor no elimina sus relaciones ni documentos.
- CA-06.5: las operaciones existentes siguen su tratamiento definido sin cancelaciones automáticas inesperadas.
- CA-06.6: los estados inválidos no se interpretan silenciosamente como activos.
- CA-06.7: la reactivación requiere los permisos correspondientes.
- CA-06.8: los controles de compras, presupuestos, recepción e inventario siguen funcionando.

Resultado esperado: selección y uso coherentes de proveedores, con historial preservado y validaciones aplicadas a todas las operaciones pertinentes.

---

TAREA ADM-07. Automatizar el mantenimiento preventivo

Brecha: GAP-ADM-06.
Prioridad: P3, mejora operativa.
Dependencias: ADM-00; integración con las órdenes de mantenimiento existentes.

Problema

El mantenimiento preventivo depende del registro manual de las intervenciones y no dispone del mecanismo automatizado identificado como mejora en la auditoría.

Objetivo

Permitir programar intervenciones periódicas y generar las órdenes correspondientes sin duplicar tareas ni alterar las órdenes correctivas existentes.

Requisitos funcionales

1. Determinar si el modelo actual permite definir planes, frecuencias, activos, responsables y próximas fechas.
2. Definir las unidades de frecuencia y la regla de cálculo de la próxima intervención.
3. Establecer cómo se comportan las tareas vencidas, omitidas, canceladas o completadas.
4. Generar órdenes mediante una ejecución programada segura.
5. Evitar generar varias órdenes para el mismo activo y período.
6. Conservar la relación entre el plan preventivo y cada orden generada.
7. Registrar los errores de ejecución y permitir identificar las órdenes que no se pudieron crear.
8. Respetar las autorizaciones y las reglas existentes para cerrar órdenes.
9. Evitar que una tarea preventiva consuma repuestos antes de que exista una intervención que lo justifique.
10. Hacer configurable la frecuencia y las reglas de programación sin requerir cambios de código para cada plan.

Cambios necesarios

- Inspeccionar "manageMaintenanceOrder", "getMaintenanceOrders" y el modelo de activos.
- Determinar si existe ya un mecanismo de programación que pueda reutilizarse.
- Si se utiliza Google Apps Script, evaluar los disparadores instalables de tiempo, sus permisos, límites y comportamiento ante errores.
- Diseñar una clave de idempotencia o mecanismo equivalente para impedir órdenes duplicadas.
- Establecer un procedimiento seguro de instalación, supervisión y retirada del disparador.
- Mantener separados los registros del plan, la ejecución programada y las órdenes generadas.

Criterios de aceptación

- CA-07.1: un plan válido permite calcular la próxima intervención conforme a la frecuencia configurada.
- CA-07.2: la ejecución programada genera las órdenes previstas que todavía no existen.
- CA-07.3: ejecutar dos veces el proceso no duplica las órdenes del mismo período.
- CA-07.4: los planes desactivados o los activos dados de baja no generan nuevas órdenes, conforme a las reglas definidas.
- CA-07.5: una orden completada o cancelada se trata según la política de recurrencia establecida.
- CA-07.6: los errores quedan registrados sin impedir que se procesen otros planes independientes cuando sea seguro continuar.
- CA-07.7: la ejecución repetida y los fallos de conectividad no dejan registros inconsistentes.
- CA-07.8: las órdenes preventivas mantienen la compatibilidad con el descuento de repuestos y el historial de mantenimiento.
- CA-07.9: los usuarios autorizados pueden consultar el plan y sus órdenes generadas.
- CA-07.10: las pruebas verifican la programación, la idempotencia, los errores y la regresión del mantenimiento correctivo.

Resultado esperado: mantenimiento preventivo programable, trazable y resistente a duplicidades, integrado con las órdenes existentes.

---

3. Requisitos transversales para todas las tareas

Seguridad

- Las autorizaciones deben comprobarse en el servidor.
- La identidad efectiva no debe depender de campos modificables por el cliente.
- Los errores no deben exponer credenciales, datos confidenciales ni detalles internos innecesarios.
- Los cambios deben conservar los permisos de los demás módulos.

Integridad de datos

- Evitar operaciones duplicadas y modificaciones parciales no detectadas.
- Verificar relaciones entre registros y conservación de historiales.
- Controlar las operaciones concurrentes que consumen recursos compartidos.
- Evitar migraciones o modificaciones del esquema salvo que sean indispensables y estén autorizadas.

Experiencia de usuario

- Mostrar mensajes claros de validación, éxito y error.
- Mantener coherencia entre la interfaz y el estado persistido.
- Evitar formularios que permitan iniciar operaciones imposibles de completar.
- Facilitar la consulta de registros pendientes, vencidos o rechazados.
- Verificar el funcionamiento en escritorio y dispositivos móviles cuando haya cambios de interfaz.

Rendimiento y mantenibilidad

- Reutilizar las funciones existentes cuando sean adecuadas.
- Evitar consultas repetitivas innecesarias a Google Sheets.
- No introducir automatizaciones que superen los límites de ejecución o cuotas de la plataforma.
- Mantener una única fuente de verdad para las reglas críticas.
- Documentar las decisiones que afecten a futuras ampliaciones.

---

4. Pruebas obligatorias de regresión

Antes de declarar completada cada tarea, verifica las operaciones relacionadas:

- ADM-01: aprobación normal, rechazo, flujo multinivel, permisos y consulta del historial.
- ADM-02: consulta individual, exportación masiva, informes, permisos de orientación y acceso de profesionales autorizados.
- ADM-03: navegación del panel, consulta de rutas, asignaciones, formularios, permisos y manejo de errores.
- ADM-04: asignación, retirada, capacidad máxima, concurrencia y visualización de plazas disponibles.
- ADM-05: solicitud, cotización, orden, aprobación, recepción, cuentas por pagar, inventario y ejecución presupuestaria.
- ADM-06: altas y bajas de proveedores, nuevas operaciones, órdenes anteriores y consulta histórica.
- ADM-07: creación manual de órdenes, consumo de repuestos, cierre de intervenciones, programación y ejecuciones repetidas.

No es necesario repetir pruebas ajenas al alcance si no existe una dependencia real. Documenta cualquier excepción.

---

5. Condiciones para cerrar una tarea

Una tarea solo puede marcarse como completada cuando:

1. El problema original se ha corregido o la decisión técnica justifica de manera documentada una solución diferente.
2. Se han satisfecho todos los criterios de aceptación aplicables.
3. Las pruebas de regresión pertinentes han sido aprobadas.
4. No quedan errores críticos o altos sin resolver dentro del alcance de la tarea.
5. Los cambios están limitados al alcance autorizado.
6. Se han documentado los archivos y componentes modificados.
7. Existe evidencia de los resultados observados.
8. Las limitaciones o criterios pendientes están identificados expresamente.

Si una prueba no puede ejecutarse, no declares el resultado como verificado. Registra el bloqueo y el procedimiento necesario para completar la comprobación.

---

6. Informe de cierre

Al concluir el conjunto de tareas, entrega:

- Estado individual de ADM-00 a ADM-07.
- Brecha original y solución aplicada.
- Archivos y componentes realmente modificados.
- Criterios aprobados, fallidos y pendientes.
- Pruebas de seguridad, integridad y regresión realizadas.
- Errores encontrados durante las pruebas.
- Cambios de datos o configuración, si los hubo y estaban autorizados.
- Riesgos residuales y dependencias pendientes.
- Comparación entre el comportamiento anterior y el resultado final.
- Mejoras adicionales justificadas que queden fuera del alcance.



---

# PLAN DE IMPLEMENTACIÓN: NIVEL 3. AUTOMATIZACIÓN E INTELIGENCIA

Proyecto: Plataforma Integral de Gestión Educativa
Institución: New Generation Christian Academy
Informe de origen: Auditoría funcional del Nivel 3, versión 1.0
Metodología obligatoria: "METODOLOGIA_DESARROLLO.md"
Objetivo: Corregir brechas identificadas, completar implementaciones parciales y desarrollar capacidades adicionales justificadas por la auditoría.

1. Reglas generales de ejecución

1.1. Condiciones previas

Antes de modificar el repositorio, Jules debe:

1. Leer "METODOLOGIA_DESARROLLO.md" y cumplir sus procedimientos.
2. Confirmar que los componentes identificados en el informe siguen existiendo y que sus nombres, ubicaciones y responsabilidades coinciden con la implementación actual.
3. Revisar el código real, las interfaces, los servicios, el esquema de Google Sheets, los permisos y las pruebas disponibles.
4. Verificar las brechas contra la implementación vigente. El informe de auditoría es el punto de partida, no un sustituto de la inspección.
5. Conciliar las métricas del informe: se declaran 79 criterios, pero los rangos enumerados suman 80; además, las nueve evaluaciones parciales deben identificarse individualmente.
6. Crear una matriz de tareas, dependencias, criterios de aceptación y evidencias.
7. Determinar si las pruebas pueden ejecutarse en un entorno aislado sin afectar datos académicos reales.

No inventar archivos, funciones, interfaces ni rutas. Los nombres mencionados en el informe son referencias que deben confirmarse.

1.2. Restricciones

- No realizar refactorizaciones generales ajenas al Nivel 3.
- No cambiar contratos de servicios ni estructuras de datos compartidas sin comprobar sus dependencias.
- No eliminar capacidades existentes que hayan sido verificadas.
- No migrar datos reales durante las pruebas.
- No exponer información personal de estudiantes en registros técnicos, reportes de errores o servicios externos.
- No introducir servicios de pago o dependencias externas sin una justificación documentada.
- No declarar terminada una tarea únicamente porque el código se haya modificado.
- Ejecutar pruebas de regresión sobre las funciones relacionadas antes de considerar concluida cada tarea.

1.3. Prioridades

- P0: riesgo crítico de seguridad, exposición de datos o corrupción grave.
- P1: integridad de datos o funcionamiento esencial comprometido.
- P2: mejora funcional importante, robustez operativa o automatización necesaria.
- P3: capacidad avanzada cuyo desarrollo requiere validación, diseño adicional o una inversión que puede planificarse por etapas.

La prioridad puede modificarse si la inspección confirma un riesgo mayor o menor, pero el cambio debe justificarse.

---

2. Resumen de tareas

ID| Tarea| Prioridad| Dependencia
N3-00| Conciliar auditoría y establecer línea base| P1| Ninguna
N3-01| Implementar deduplicación segura en importaciones| P1| N3-00
N3-02| Endurecer validación y trazabilidad de importaciones| P2| N3-00, N3-01
N3-03| Impedir la generación SACE con identidad faltante| P1| N3-00
N3-04| Diseñar e implementar generación documental por lotes| P2| N3-00
N3-05| Diseñar el optimizador automático de horarios| P2| N3-00
N3-06| Implementar y validar el optimizador de horarios| P3| N3-05
N3-07| Diseñar indicadores de riesgo académico explicables| P2| N3-00
N3-08| Implementar indicadores de riesgo validados| P3| N3-07
N3-09| Fortalecer el asistente contextual existente| P2| N3-00
N3-10| Ejecutar regresión integral y documentar el cierre| Obligatoria| Todas las tareas implementadas

Las tareas N3-05 y N3-07 deben comenzar con diseño y validación de requisitos. Su implementación definitiva depende de que se demuestre la viabilidad técnica y la utilidad institucional.

---

3. Tareas de preparación y corrección inmediata

N3-00. Conciliar la auditoría y establecer una línea base verificable

Prioridad: P1
Objetivo: eliminar inconsistencias del informe y confirmar las brechas antes de ejecutar cambios.

Problema

El informe declara 79 criterios de aceptación, pero los seis rangos indicados contienen 80 criterios si se interpretan como rangos inclusivos. También informa nueve criterios parciales sin detallar todos sus resultados en la matriz de brechas.

Las ubicaciones y los comportamientos descritos podrían haber cambiado desde la auditoría.

Requisitos funcionales

1. Recontar los criterios de aceptación de las seis capacidades.
2. Identificar cada criterio como aprobado, parcial, fallido, bloqueado o no aplicable.
3. Relacionar cada brecha con una evidencia concreta.
4. Confirmar los componentes reales implicados.
5. Establecer una línea base de las pruebas existentes.
6. Identificar contratos, datos y funciones que no deben cambiar.

Cambios necesarios

- Corregir la matriz de auditoría y sus cálculos.
- Añadir identificadores únicos a las tareas y pruebas que no los tengan.
- Registrar las dependencias entre importaciones, documentos, horarios, analítica y asistencia contextual.
- Documentar las condiciones necesarias para probar cada tarea sin afectar producción.

Criterios de aceptación

- N3-00-01: los criterios se cuentan de forma reproducible y el total coincide con el inventario.
- N3-00-02: cada criterio tiene un resultado individual y una evidencia o una explicación de bloqueo.
- N3-00-03: cada brecha incluida en el plan está respaldada por una implementación inspeccionada o una ausencia documentada.
- N3-00-04: las ubicaciones reales de los componentes afectados están confirmadas.
- N3-00-05: existe una línea base de pruebas que permite comparar el comportamiento anterior y posterior.
- N3-00-06: se identifican las funciones relacionadas que deben protegerse mediante pruebas de regresión.

Resultado esperado: una línea base fiable que permita desarrollar las siguientes tareas sin perpetuar errores del informe ni ampliar innecesariamente el alcance.

---

4. Importación avanzada

N3-01. Implementar deduplicación segura en importaciones

Prioridad: P1
Componente de referencia: "importDataWithColumnMapping", sujeto a confirmación.
Dependencia: N3-00.

Problema

Según la auditoría, la importación detecta identificadores vacíos, pero no comprueba de manera suficiente si el registro ya existe en el destino antes de insertarlo.

Esto puede producir registros duplicados, relaciones inconsistentes e historiales académicos repetidos.

Requisitos funcionales

1. Identificar qué entidades admite realmente la importación.
2. Definir para cada entidad una clave de identidad estable o una combinación de campos que permita reconocer un registro existente.
3. Priorizar identificadores institucionales fiables cuando estén disponibles.
4. No utilizar el nombre del estudiante como identificador único si pueden existir homónimos.
5. Normalizar únicamente los campos necesarios para comparar identidades, sin alterar los valores originales de manera destructiva.
6. Detectar duplicados tanto dentro del archivo como frente a los registros ya almacenados.
7. Definir explícitamente el comportamiento ante cada caso:
   - Registro nuevo.
   - Registro ya existente sin cambios.
   - Registro existente con diferencias.
   - Duplicado dentro del mismo archivo.
   - Identidad insuficiente para una comparación fiable.
8. No actualizar ni sobrescribir información existente sin una política autorizada.
9. Mantener la trazabilidad de los registros insertados, omitidos, rechazados o actualizados.
10. Aplicar las validaciones en el servidor, independientemente de las comprobaciones de interfaz.

Cambios necesarios

- Incorporar una etapa de identificación de registros existentes antes de escribir.
- Definir una política de resolución de duplicados por entidad.
- Evitar consultas individuales repetitivas si puede realizarse una lectura por lotes.
- Comprobar las relaciones entre registros antes de confirmar la importación.
- Diseñar un mecanismo seguro para evitar que dos importaciones simultáneas inserten la misma identidad.
- Evaluar "LockService" u otro mecanismo compatible con la arquitectura real, verificando sus límites y el alcance de su bloqueo.
- Garantizar que la estrategia de concurrencia no mantenga bloqueos durante operaciones innecesariamente prolongadas.

Criterios de aceptación

- N3-01-01: importar un registro nuevo crea exactamente un registro.
- N3-01-02: volver a importar el mismo registro no crea un duplicado.
- N3-01-03: dos registros con el mismo identificador institucional se detectan conforme a la política definida.
- N3-01-04: dos estudiantes con el mismo nombre, pero identificadores distintos, no se fusionan.
- N3-01-05: un registro con identidad insuficiente no se asigna arbitrariamente a otra persona.
- N3-01-06: ante diferencias con un registro existente, el sistema informa qué campos difieren y aplica la política autorizada.
- N3-01-07: una importación repetida produce resultados coherentes y no duplica matrículas, calificaciones ni otras relaciones.
- N3-01-08: dos importaciones concurrentes del mismo registro no crean duplicados ni sobrescriben datos silenciosamente.
- N3-01-09: un usuario sin permiso no puede eludir la deduplicación o las validaciones invocando directamente el servicio.
- N3-01-10: el resumen final diferencia altas, actualizaciones, omisiones, duplicados y errores.
- N3-01-11: las pruebas confirman que los registros originales permanecen intactos cuando la operación se cancela o falla, según la política transaccional definida.
- N3-01-12: las importaciones de entidades relacionadas conservan la integridad referencial.

Resultado esperado

Una importación repetible y segura que permita incorporar datos nuevos sin multiplicar registros ni alterar identidades académicas.

---

N3-02. Mejorar la validación, los informes de error y el rendimiento de importaciones

Prioridad: P2
Dependencias: N3-00 y N3-01.

Problema

La auditoría señala que la vista previa limita los errores mostrados y que el registro persistente conserva como máximo los primeros 20 errores. También identifica oportunidades de mejora en el procesamiento de grandes volúmenes.

Requisitos funcionales

1. Conservar un resumen completo de errores aunque no se muestren todos simultáneamente en la interfaz.
2. Registrar el total de errores y proporcionar acceso a sus detalles mediante paginación, descarga o consulta segmentada, según resulte apropiado.
3. Evitar exceder los límites de celdas, ejecución y almacenamiento de Google Apps Script.
4. Diferenciar errores de formato, identidad, relaciones, permisos, duplicación y persistencia.
5. Permitir que el administrador identifique la fila afectada y el motivo sin exponer información personal innecesaria.
6. Establecer límites de tamaño de archivo, filas y campos conforme a las capacidades verificadas.
7. Medir el rendimiento con conjuntos de datos representativos.
8. Si se requiere procesamiento por bloques, conservar el estado y permitir reanudar o finalizar una operación sin duplicar registros.

Cambios necesarios

- Separar el resumen ejecutivo de los detalles de errores.
- Diseñar una estructura de almacenamiento de errores que respete los límites de Sheets.
- Evaluar escritura y lectura por lotes.
- Incorporar identificadores de ejecución y de fila que permitan rastrear errores sin guardar innecesariamente el contenido completo del archivo.
- Implementar paginación o exportación de detalles si el volumen lo justifica.
- Definir el comportamiento cuando una operación exceda su tiempo de ejecución.

Criterios de aceptación

- N3-02-01: una importación con más de 20 errores muestra el total correcto y permite consultar los detalles previstos por el diseño.
- N3-02-02: el resumen no afirma que todos los registros fueron procesados si existen filas pendientes o fallidas.
- N3-02-03: cada error puede relacionarse con la ejecución y la fila correspondiente.
- N3-02-04: un archivo que supera el límite definido se rechaza antes de iniciar una escritura parcial no controlada.
- N3-02-05: una ejecución prolongada informa de su estado y puede recuperarse según la estrategia documentada.
- N3-02-06: el procesamiento por bloques no genera duplicados cuando se reanuda.
- N3-02-07: las pruebas de carga registran volumen, duración, errores y límites encontrados.
- N3-02-08: el rendimiento no empeora de forma significativa en escenarios habituales sin una justificación documentada.

Resultado esperado

Importaciones más transparentes, escalables y fáciles de diagnosticar, sin depender de una lista truncada de errores.

---

5. Plantillas SACE

N3-03. Impedir la generación de archivos SACE con identidades faltantes

Prioridad: P1
Componente de referencia: "generateSACEReportFile", sujeto a confirmación.
Dependencia: N3-00.

Problema

Según el informe, cuando falta la identidad del estudiante se utiliza el valor genérico ""Estudiante"", sin advertencia previa. Esto puede generar archivos formalmente estructurados, pero semánticamente incorrectos.

Requisitos funcionales

1. Identificar los campos que exige la plantilla oficial aplicable.
2. Distinguir los campos obligatorios de los opcionales.
3. No sustituir identidades faltantes por valores genéricos.
4. Validar los datos antes de generar el archivo.
5. Mostrar un resumen de registros válidos e inválidos antes de confirmar la generación.
6. Permitir corregir los registros de origen o excluirlos de manera explícita, cuando la política lo permita.
7. Mantener los encabezados y tipos de datos exigidos por la plantilla.
8. Documentar la versión o fuente de la plantilla utilizada.
9. Diferenciar compatibilidad estructural de aceptación real por parte del sistema receptor.

Cambios necesarios

- Añadir validación previa de identidad y demás campos obligatorios.
- Eliminar el uso de valores genéricos como sustitución de una identidad ausente.
- Incorporar mensajes específicos para cada error.
- Verificar que la validación se aplica también cuando el servicio se invoca directamente.
- Confirmar que las reglas de formato corresponden a la plantilla oficial vigente y al procedimiento institucional real.

Criterios de aceptación

- N3-03-01: un registro sin identidad no genera una fila que lo identifique como ""Estudiante"".
- N3-03-02: antes de generar el archivo, el sistema informa de los registros con identidad faltante.
- N3-03-03: un archivo con registros inválidos no se presenta como completamente correcto.
- N3-03-04: las identidades válidas se conservan exactamente conforme a las reglas de la plantilla.
- N3-03-05: los campos opcionales vacíos no se rechazan indebidamente si el formato los permite.
- N3-03-06: los encabezados, el orden de columnas, la codificación y los formatos siguen siendo compatibles.
- N3-03-07: la validación funciona también en llamadas directas al servicio.
- N3-03-08: el informe de generación diferencia los registros incluidos, excluidos y rechazados.
- N3-03-09: las pruebas no modifican los datos académicos originales.
- N3-03-10: cuando no pueda probarse el archivo en el sistema oficial, el informe limita la conclusión a la compatibilidad estructural demostrada.

Resultado esperado

Archivos SACE más fiables, sin identidades inventadas ni errores críticos ocultos.

---

6. Generación automática de documentos

N3-04. Implementar generación documental por lotes con procesamiento en segundo plano

Prioridad: P2
Componentes de referencia: "generateSchoolDocument", "getIssuedSchoolDocuments", "configureSchoolDocumentTemplate" y mecanismos de plantillas, sujetos a confirmación.
Dependencia: N3-00.

Problema

La generación actual opera individualmente. No existe una cola de generación masiva para operaciones como emitir documentos para una promoción completa, lo que limita la automatización administrativa y puede provocar tiempos de espera prolongados.

Requisitos funcionales

1. Permitir crear un lote a partir de una selección autorizada de estudiantes y documentos.
2. Validar los datos requeridos antes de aceptar el lote.
3. Previsualizar el alcance de la operación antes de confirmarla.
4. Crear una ejecución identificable con estado y resumen.
5. Procesar los documentos en bloques compatibles con los límites de Apps Script.
6. Permitir consultar el progreso y los resultados parciales.
7. Registrar el éxito o el error de cada documento.
8. Reintentar los fallos recuperables sin duplicar documentos ya emitidos.
9. Conservar el código CUV único y la indexación correspondiente en Google Drive.
10. Aplicar los permisos existentes y evitar que un usuario acceda a documentos de otros grupos.
11. Evitar almacenar varias copias innecesarias de un mismo documento.
12. Mantener la trazabilidad de la plantilla y de los datos utilizados para cada emisión.
13. Definir cómo cancelar o detener un lote sin dejarlo en un estado engañoso.
14. Respetar los flujos de aprobación o firma que correspondan al tipo de documento.

Cambios necesarios

- Diseñar una estructura de cola o registro de lotes que se ajuste al almacenamiento existente.
- Definir estados claros, por ejemplo: pendiente, en proceso, completado, completado parcialmente, fallido y cancelado, adaptándolos al modelo real.
- Implementar procesamiento por bloques y recuperación tras interrupciones.
- Incorporar una clave de idempotencia para impedir emisiones duplicadas en reintentos.
- Separar el estado del lote del estado de cada documento.
- Registrar errores sin almacenar datos personales innecesarios.
- Confirmar cómo se crean, protegen y comparten los archivos en Drive.
- Diseñar un mecanismo de actualización de progreso compatible con las limitaciones de ejecución y temporizadores de Apps Script.

No supongas que existe ejecución ilimitada en segundo plano. Selecciona el mecanismo de procesamiento después de inspeccionar los servicios y límites disponibles.

Criterios de aceptación

- N3-04-01: un lote válido incluye exactamente los registros seleccionados y autorizados.
- N3-04-02: el sistema muestra un resumen previo del número y tipo de documentos a generar.
- N3-04-03: los datos obligatorios faltantes se identifican antes de emitir los documentos afectados.
- N3-04-04: el procesamiento por bloques respeta los límites técnicos verificados.
- N3-04-05: cada documento completado queda registrado con su CUV y referencia de Drive.
- N3-04-06: un documento ya emitido no se duplica por un reintento del lote.
- N3-04-07: un fallo intermedio no hace que todos los documentos aparezcan como fallidos si algunos se completaron correctamente.
- N3-04-08: al reanudar un lote, solo se procesan los elementos pendientes o recuperables conforme a la política.
- N3-04-09: el usuario puede distinguir el progreso, los errores y los documentos terminados.
- N3-04-10: los documentos generados conservan su formato, contenido y permisos.
- N3-04-11: un usuario no autorizado no puede iniciar un lote ni descargar sus documentos mediante llamadas directas.
- N3-04-12: la cancelación no borra documentos ya emitidos ni presenta como completados los pendientes.
- N3-04-13: las pruebas de regresión confirman que la generación individual continúa funcionando.
- N3-04-14: una prueba con un lote representativo registra duración, límites, reintentos y tasa de éxito.

Mejoras recomendables

- Filtros por curso, grado, sección, periodo y tipo de documento, únicamente para las entidades existentes.
- Descarga organizada de documentos o paquete comprimido, si la necesidad y la arquitectura lo justifican.
- Resumen descargable de resultados y errores.
- Detección de documentos obsoletos cuando cambien los datos de origen, sin modificar silenciosamente documentos oficiales ya emitidos.

Resultado esperado

Generación masiva fiable, recuperable y trazable, sin bloquear innecesariamente la interfaz ni duplicar documentos.

---

7. Horarios optimizados

N3-05. Diseñar el modelo de restricciones y el optimizador de horarios

Prioridad: P2
Componente de referencia: "checkScheduleConflict" y modelo real de horarios, sujetos a confirmación.
Dependencia: N3-00.

Problema

La plataforma valida conflictos al crear horarios manualmente, pero la auditoría no encontró un mecanismo que genere una propuesta semanal completa a partir de la malla curricular y las restricciones institucionales.

Requisitos funcionales

Antes de programar el algoritmo, documentar:

1. Las entidades reales del horario: asignaturas, docentes, secciones, aulas, jornadas y bloques.
2. Las horas requeridas por asignatura y grupo.
3. Las disponibilidades y restricciones de cada recurso.
4. Las reglas de duración, descanso y distribución de bloques.
5. Las restricciones obligatorias y las preferencias.
6. Los criterios que determinan la calidad de una solución.
7. El tamaño máximo representativo de un horario institucional.
8. La posibilidad de reutilizar "checkScheduleConflict" u otros validadores existentes.
9. La diferencia entre generar un horario, optimizar uno existente y validar uno manual.
10. Las condiciones para aprobar y publicar el resultado.

Modelo de optimización esperado

Restricciones obligatorias, según las entidades existentes:

- No asignar simultáneamente un docente a dos clases.
- No asignar una sección a dos clases incompatibles al mismo tiempo.
- No asignar una misma aula a actividades simultáneas.
- Respetar las disponibilidades y jornadas configuradas.
- Cumplir las horas requeridas por la malla curricular.
- Respetar otras reglas institucionales obligatorias que se confirmen en los requisitos.

Preferencias optimizables, solo si son pertinentes:

- Distribuir equilibradamente las clases durante la semana.
- Reducir huecos innecesarios en la jornada docente.
- Evitar concentraciones excesivas de una asignatura en un día.
- Favorecer preferencias de disponibilidad previamente autorizadas.
- Reducir modificaciones innecesarias respecto de un horario existente.

Las preferencias nunca pueden prevalecer sobre una restricción obligatoria.

Decisión técnica

Comparar al menos dos enfoques adecuados, por ejemplo:

- Búsqueda con backtracking y heurísticas de selección de variables.
- Heurísticas de construcción y mejora local.
- Algoritmo genético u otra técnica estocástica, si el tamaño y las restricciones justifican su uso.

No elegir un algoritmo por ser más sofisticado. Justificarlo por calidad de soluciones, tiempo de ejecución, facilidad de validación y compatibilidad con Apps Script.

Criterios de aceptación

- N3-05-01: existe un inventario de restricciones obligatorias y preferencias.
- N3-05-02: se documenta la representación de bloques, recursos y conflictos.
- N3-05-03: se define una función de evaluación que no permita compensar una violación obligatoria con una mejora de preferencias.
- N3-05-04: se comparan alternativas técnicas con ventajas, riesgos y límites.
- N3-05-05: se identifica un conjunto de horarios de prueba con solución conocida y otro con restricciones incompatibles.
- N3-05-06: se establecen métricas de validez, calidad y tiempo de generación.
- N3-05-07: se define una estrategia para conservar el horario activo mientras se genera una propuesta.
- N3-05-08: se documenta cómo se publicará una solución y cómo se revertirá si se detectan problemas.

Resultado esperado

Una especificación técnica validada que permita desarrollar un optimizador sin comprometer los horarios existentes.

---

N3-06. Implementar generación automática y optimización de horarios

Prioridad: P3
Dependencia: N3-05 aprobado.

Problema

La creación manual bloque a bloque requiere trabajo administrativo y no garantiza que se encuentre una distribución de calidad cuando existen numerosas restricciones.

Requisitos funcionales

1. Generar una propuesta completa utilizando las restricciones confirmadas.
2. Reutilizar los validadores existentes siempre que sean adecuados.
3. No escribir directamente sobre el horario activo durante la búsqueda.
4. Detectar cuándo no existe una solución válida dentro de las restricciones.
5. Diferenciar imposibilidad real demostrada de límite de búsqueda o agotamiento del tiempo.
6. Mostrar conflictos o restricciones que impiden completar el horario.
7. Permitir revisar la propuesta antes de publicarla.
8. Comparar la propuesta con el horario existente cuando haya uno.
9. Publicar solo mediante una operación autorizada.
10. Mantener trazabilidad de la versión, autor, fecha y cambios realizados.
11. Ofrecer un mecanismo de recuperación o reversión coherente con el almacenamiento actual.
12. Garantizar que los cambios posteriores en disponibilidades puedan activar una nueva validación.

Criterios de aceptación

- N3-06-01: un escenario válido produce un horario que satisface todas las restricciones obligatorias.
- N3-06-02: el horario propuesto se vuelve a validar con el mecanismo de conflictos antes de publicarse.
- N3-06-03: ningún docente, sección o aula presenta conflictos de simultaneidad dentro del modelo aplicable.
- N3-06-04: las horas asignadas coinciden con las requeridas por la malla curricular.
- N3-06-05: un escenario incompatible no se presenta como un horario válido.
- N3-06-06: cuando se alcanza un límite de búsqueda, el sistema comunica la limitación sin afirmar que ha demostrado la inexistencia de solución.
- N3-06-07: una propuesta no publicada no altera el horario activo.
- N3-06-08: publicar exige los permisos establecidos y genera trazabilidad.
- N3-06-09: una reoptimización respeta las restricciones actualizadas.
- N3-06-10: las pruebas miden tiempo de generación y calidad en escenarios de tamaño representativo.
- N3-06-11: se comparan los resultados con la construcción manual o con una solución conocida.
- N3-06-12: la generación automática no rompe la edición manual ni la validación de conflictos existente.
- N3-06-13: el sistema conserva la última versión válida ante una interrupción.
- N3-06-14: se prueba el comportamiento en escenarios con recursos escasos y numerosas restricciones.

Resultado esperado

Una herramienta que genere horarios válidos, permita optimizarlos y preserve el control institucional sobre su publicación.

---

8. Indicadores predictivos

N3-07. Diseñar indicadores de riesgo académico explicables y verificables

Prioridad: P2
Componentes de referencia: "getAdvancedDashboardAnalytics", "getHRDashboardAnalytics" y el motor de gráficos, sujetos a confirmación.
Dependencia: N3-00.

Problema

La plataforma dispone de métricas descriptivas y gráficos dinámicos, pero no de un modelo validado que estime riesgos futuros. Las estadísticas históricas no deben presentarse como predicciones.

Requisitos funcionales

1. Inventariar las métricas actuales y clasificarlas como descriptivas, diagnósticas o predictivas.
2. Definir qué problema institucional se quiere anticipar.
3. Identificar las fuentes autorizadas y su calidad.
4. Establecer una fórmula o método reproducible.
5. Evitar que datos posteriores al periodo de predicción se filtren al cálculo histórico de validación.
6. Explicar qué significa cada nivel de riesgo.
7. Definir cómo tratar los datos faltantes y desactualizados.
8. Establecer métricas para evaluar aciertos, falsos positivos y falsos negativos.
9. Restringir el acceso a los resultados individuales por rol.
10. Evitar decisiones automáticas de alto impacto basadas exclusivamente en una estimación.

Alcance inicial recomendado

Evaluar primero un indicador académico limitado y verificable, por ejemplo, una alerta de posible dificultad académica basada en tendencias de asistencia y rendimiento, si esos datos existen y pueden utilizarse legalmente.

El indicador debe servir para priorizar una revisión humana, no para etiquetar permanentemente a un estudiante ni para determinar automáticamente su promoción, sanción o permanencia.

Los indicadores financieros o de mora solo deben añadirse si se confirma su pertinencia, disponibilidad de datos y autorización para ese uso. No ampliar el alcance por el simple hecho de que el informe mencione saldos administrativos.

Requisitos de validación

- Comparar las estimaciones con resultados históricos observados.
- Separar los datos de entrenamiento o definición de los datos usados para evaluar el desempeño.
- Medir el rendimiento con métricas adecuadas al objetivo.
- Analizar si la información disponible introduce sesgos o diferencias injustificadas entre grupos.
- Definir cuándo un indicador debe dejar de mostrarse por falta de datos o pérdida de fiabilidad.
- Documentar las limitaciones de las conclusiones.

Criterios de aceptación

- N3-07-01: cada indicador tiene finalidad, población, variables y periodo definidos.
- N3-07-02: se documenta una fórmula o método reproducible.
- N3-07-03: se distingue claramente una métrica histórica de una estimación futura.
- N3-07-04: se identifica la procedencia y autorización de los datos.
- N3-07-05: se define un conjunto de validación que evite la filtración de información futura.
- N3-07-06: se seleccionan métricas de evaluación adecuadas y se explica su interpretación.
- N3-07-07: se establecen condiciones mínimas de datos para emitir una estimación.
- N3-07-08: se define cómo actuar ante resultados inciertos, datos faltantes o indicadores poco fiables.
- N3-07-09: se documentan los riesgos de falsos positivos y falsos negativos.
- N3-07-10: se define quién puede consultar resultados individuales y agregados.
- N3-07-11: se establece que las predicciones no desencadenan decisiones académicas de alto impacto sin revisión y autorización humana.
- N3-07-12: existe un criterio verificable para decidir si el indicador aporta valor suficiente para su implementación.

Resultado esperado

Una especificación de analítica predictiva basada en datos disponibles, con reglas comprensibles, métricas de evaluación y límites de uso.

---

N3-08. Implementar el primer indicador predictivo validado

Prioridad: P3
Dependencia: N3-07 aprobado.

Problema

La plataforma presenta estadísticas útiles, pero todavía no estima de forma validada la probabilidad de que ocurra un resultado futuro.

Requisitos funcionales

1. Implementar únicamente el indicador aprobado en N3-07.
2. Mantener separadas las métricas descriptivas y las estimaciones.
3. Aplicar el método validado sobre datos autorizados.
4. Mostrar el periodo de referencia, la fecha de cálculo y las limitaciones relevantes.
5. Proporcionar una explicación comprensible del resultado.
6. Evitar que una puntuación aparente una certeza mayor que la que permite la evidencia.
7. Aplicar permisos en el servidor.
8. Evitar que el indicador modifique automáticamente registros académicos.
9. Definir la frecuencia de actualización y el tratamiento de fallos.
10. Mantener evidencia suficiente para comprobar la versión del método y los datos de referencia.

Criterios de aceptación

- N3-08-01: los resultados coinciden con los resultados esperados en un conjunto sintético de prueba.
- N3-08-02: las métricas de validación se pueden reproducir.
- N3-08-03: la interfaz identifica que se trata de una estimación y no de un hecho confirmed.
- N3-08-04: los usuarios no autorizados no pueden consultar indicadores individuales mediante llamadas directas.
- N3-08-05: un conjunto de datos insuficiente produce una advertencia o ausencia de estimación, no una predicción inventada.
- N3-08-06: los fallos de actualización no presentan resultados obsoletos como actuales.
- N3-08-07: el sistema registra la versión del método y el periodo analizado, cuando corresponda.
- N3-08-08: las pruebas de regresión confirman que los gráficos descriptivos actuales siguen funcionando.
- N3-08-09: no se generan sanciones, cambios de notas ni otras decisiones automáticas de alto impacto.
- N3-08-10: la institución puede interpretar el resultado y utilizarlo para iniciar una revisión humana.

Decisión de implementación

No es obligatorio utilizar aprendizaje automático. Si una regla estadística sencilla y validada resuelve el problema con mayor transparencia, menor coste y menor riesgo, debe preferirse frente a un modelo complejo.

Resultado esperado

Un primer indicador predictivo que pueda evaluarse objetivamente, explicar sus límites y utilizarse como apoyo a la toma de decisiones.

---

9. Asistente institucional

N3-09. Fortalecer el asistente contextual y la base de conocimiento local

Prioridad: P2
Componentes de referencia: "openContextualHelpModal", las preguntas frecuentes en IndexedDB y los mecanismos de permisos existentes, sujetos a confirmación.
Dependencia: N3-00.

Problema

La plataforma dispone de ayuda contextual y preguntas frecuentes locales, pero no de un agente conversacional basado en un modelo de lenguaje. El informe excluye deliberadamente este último para evitar costes recurrentes y riesgos de exposición de información de menores.

La ausencia de un LLM no constituye por sí misma un defecto. La prioridad es mejorar la utilidad y la fiabilidad de la ayuda que ya existe.

Requisitos funcionales

1. Inventariar las preguntas frecuentes, instrucciones y recorridos de ayuda.
2. Identificar preguntas repetidas, respuestas incompletas y contenidos desactualizados.
3. Relacionar cada respuesta con el módulo y rol correspondiente.
4. Mejorar la búsqueda local y la presentación de resultados pertinentes.
5. Permitir que las respuestas indiquen cuándo la información no está disponible.
6. Mantener el funcionamiento sin conexión cuando esté previsto.
7. Definir cómo se actualiza la base local cuando cambia la documentación.
8. Evitar mostrar instrucciones correspondientes a pantallas o funciones que ya no existen.
9. Mantener la separación de permisos entre roles.
10. No transmitir preguntas, conversaciones o información académica a proveedores externos como parte de estas mejoras.
11. Evaluar la incorporación de guías paso a paso para tareas frecuentes.
12. Mantener una distinción clara entre una guía informativa y una operación realmente ejecutada.

Cambios necesarios

- Revisar las preguntas frecuentes existentes y comprobarlas contra la interfaz actual.
- Establecer un esquema de versión o actualización del contenido, si no existe uno adecuado.
- Mejorar la organización temática y la búsqueda local.
- Incorporar mensajes claros para consultas sin respuesta.
- Verificar el uso de IndexedDB y el comportamiento sin conexión.
- Documentar el procedimiento para añadir y revisar nuevos contenidos.
- Evaluar la utilidad de guías interactivas sin duplicar recorridos ya existentes.

Criterios de aceptación

- N3-09-01: las preguntas frecuentes existentes se pueden localizar y relacionar con sus módulos correspondientes.
- N3-09-02: cada respuesta auditada coincide con el comportamiento real de la función documentada.
- N3-09-03: una pregunta sin respuesta pertinente no produce una respuesta institucional inventada.
- N3-09-04: las instrucciones visibles son coherentes con el rol del usuario.
- N3-09-05: las preguntas y respuestas locales siguen disponibles sin conexión cuando esa capacidad esté prevista.
- N3-09-06: las actualizaciones del contenido no requieren borrar datos académicos ni reiniciar toda la aplicación.
- N3-09-07: la ayuda no revela instrucciones restringidas ni información de otros usuarios.
- N3-09-08: las guías interactivas no ejecutan operaciones con consecuencias sin la autorización requerida.
- N3-09-09: el contenido puede mantenerse y actualizarse mediante un procedimiento documentado.
- N3-09-10: las mejoras no introducen dependencias externas ni transmisión de datos personales.
- N3-09-11: se comprueba el funcionamiento en los dispositivos y navegadores soportados.
- N3-09-12: las pruebas confirman que las ayudas existentes siguen abriendo correctamente desde los puntos de acceso actuales.

Fuera del alcance de esta tarea

No desarrollar un agente LLM externo ni enviar información de estudiantes a APIs de terceros. Esa decisión requeriría una evaluación independiente de privacidad, seguridad, costes, contratos, retención de datos y controles institucionales.

Si en el futuro se considera un asistente generativo, debe tratarse como una iniciativa separada, con análisis de riesgos y autorización explícita.

Resultado esperado

Una ayuda institucional más útil, actualizada, contextual y fiable, conservando el funcionamiento local y las protecciones de privacidad existentes.

---

10. Regresión, integración y cierre

N3-10. Ejecutar regresión integral y documentar resultados

Prioridad: Obligatoria
Dependencias: todas las tareas implementadas.

Objetivo

Demostrar que las correcciones y ampliaciones funcionan de forma integrada y no degradan las capacidades existentes del Nivel 3.

Requisitos funcionales

Ejecutar pruebas sobre:

- Importación avanzada y deduplicación.
- Compatibilidad y generación de plantillas SACE.
- Generación documental individual y por lotes.
- Validación manual y generación automática de horarios.
- Indicadores descriptivos y predictivos.
- Ayuda contextual, preguntas frecuentes y funcionamiento sin conexión.
- Roles, permisos, almacenamiento, errores y recuperación.

Criterios de aceptación

- N3-10-01: cada criterio de aceptación de las tareas implementadas tiene un resultado documentado.
- N3-10-02: las funciones existentes que debían preservarse superan sus pruebas de regresión.
- N3-10-03: las pruebas de permisos confirman que no se han ampliado accesos indebidamente.
- N3-10-04: no existen errores críticos pendientes en los flujos modificados.
- N3-10-05: los datos de prueba pueden identificarse y retirarse sin afectar información real.
- N3-10-06: las operaciones prolongadas y los fallos recuperables tienen resultados observables y trazables.
- N3-10-07: los cambios se documentan con los componentes reales modificados y las razones de cada cambio.
- N3-10-08: los resultados distinguen pruebas aprobadas, fallidas, bloqueadas y pendientes.
- N3-10-09: el informe final indica qué tareas quedaron terminadas, cuáles requieren más trabajo y cuáles no se implementaron.
- N3-10-10: no se declara completa una tarea sin evidencia suficiente del resultado.

Informe de cierre

Entregar:

1. Resumen de cambios realizados.
2. Matriz de tareas y estado final.
3. Relación de archivos y funciones realmente modificados.
4. Resultados de pruebas y criterios de aceptación.
5. Riesgos y regresiones detectados.
6. Cambios de esquema o configuración, si los hubo.
7. Limitaciones técnicas y decisiones de diseño.
8. Tareas pendientes y próximos pasos.
9. Evidencias reproducibles que permitan a otro revisor verificar el resultado.

---

11. Orden recomendado de ejecución

Primera etapa: integridad y correcciones esenciales

1. N3-00: conciliar auditoría y establecer línea base.
2. N3-01: deduplicación segura.
3. N3-03: validación estricta de identidad SACE.

Estas tareas reducen el riesgo de duplicar registros o generar archivos académicos con identidades incorrectas.

Segunda etapa: robustez operativa

4. N3-02: informes de errores, procesamiento y recuperación de importaciones.
5. N3-04: generación documental por lotes.
6. N3-09: fortalecimiento de la ayuda contextual.

Estas mejoras incrementan la eficiencia administrativa y facilitan la operación diaria.

Tercera etapa: nuevas capacidades

7. N3-05: diseño del optimizador de horarios.
8. N3-07: diseño de indicadores predictivos.

No iniciar la implementación definitiva hasta validar requisitos, datos, restricciones y criterios de calidad.

Cuarta etapa: desarrollo avanzado

9. N3-06: optimizador automático de horarios.
10. N3-08: primer indicador predictivo validado.

La prioridad de estas tareas debe revisarse tras las fases de diseño, teniendo en cuenta el beneficio real, el coste técnico y los riesgos.

Quinta etapa: verificación

11. N3-10: regresión integral y cierre documental.

---

12. Condiciones finales de calidad

El objetivo no es simplemente añadir funciones nuevas. Cada mejora debe aumentar la fiabilidad, utilidad, seguridad, trazabilidad o eficiencia de la plataforma.

Jules debe aplicar los siguientes principios:

- Preferir operaciones idempotentes y controles de integridad en importaciones y generación documental.
- Ofrecer previsualización, resultados parciales claros y recuperación ante fallos.
- Reutilizar validadores existentes cuando cubran correctamente las reglas necesarias.
- Separar restricciones obligatorias de preferencias al optimizar horarios.
- Distinguir datos históricos de estimaciones futuras y hacer que los indicadores sean explicables.
- Conservar la ayuda contextual local y evitar transferencias innecesarias de información sensible.
- Incorporar capacidades de referencia solo cuando respondan a necesidades institucionales verificables.
- No añadir complejidad, costes ni dependencias externas sin una justificación de valor.
- Mantener las capacidades que ya funcionan y verificar las regresiones.
- No confundir una interfaz terminada con una implementación funcional verificada.

Criterio global de éxito: las tareas implementadas cumplen sus criterios de aceptación, preservan las capacidades existentes, tienen evidencias reproducibles y dejan documentadas las limitaciones restantes. Las tareas de diseño solo se consideran terminadas cuando sus requisitos, decisiones técnicas y criterios de validación están aprobados y listos para guiar la implementación.


---

### Lista de tareas de implementación y mejora

### Fase 2. Arquitectura institucional e interoperabilidad

### Tarea 1. Implementar versionado explícito y validación de compatibilidad de las API

P2 · ImportanteGAP-ARQ-01Contratos de comunicación

Problema detectado: los contratos utilizan una versión global 1.0, pero las solicitudes HTTP no incluyen un mecanismo explícito que permita identificar la versión del contrato que utiliza cada consumidor.

Requisitos funcionales

* Incorporar la identificación de versión en las solicitudes realizadas por el cliente y definir cómo debe validarse en cada servicio.

* Mantener la compatibilidad con los consumidores actuales durante la incorporación del mecanismo de versionado.

* Establecer una única fuente de configuración para la versión activa del contrato, evitando que cada módulo declare valores independientes que puedan divergir.

* Definir el comportamiento ante solicitudes sin versión, versiones desconocidas y versiones incompatibles.

* Establecer una política para introducir cambios compatibles y cambios que requieran una nueva versión.

* Asegurar que los errores de compatibilidad se comuniquen mediante respuestas estructuradas y no se confundan con fallos de red.

* Mantener intactos el formato JSON-RPC existente, las acciones, los permisos y los tokens de idempotencia, salvo los ajustes indispensables para la compatibilidad.

Cambios necesarios

* Incorporar el encabezado `X-API-Version: 1.0` en el mecanismo común de solicitudes HTTP.

* Definir cómo cada servicio valida la versión recibida y cómo comunica las versiones admitidas.

* Documentar los contratos de entrada y salida de los servicios, incluidos sus campos obligatorios, opcionales y formatos de error.

* Definir un procedimiento para evolucionar contratos sin romper las operaciones existentes.

* Determinar si los servicios deben compartir una misma versión o admitir versiones independientes cuando sus contratos evolucionen de forma distinta.

Comportamiento esperado

Las solicitudes deben identificar de forma inequívoca el contrato utilizado. Una versión incompatible debe generar un error controlado, sin ejecutar operaciones de escritura. La incorporación del versionado no debe romper la aplicación, los procesos automáticos ni las operaciones pendientes de sincronización.

Criterios de aceptación

* Una solicitud válida con la versión admitida se procesa correctamente.

* Una solicitud con una versión incompatible se rechaza antes de ejecutar la operación.

* Las solicitudes sin encabezado siguen una política explícita de compatibilidad, sin cambios silenciosos de comportamiento.

* El cliente interpreta correctamente los errores de versión.

* Los tokens de idempotencia se conservan en los reintentos.

* Se comprueba la compatibilidad de todos los servicios afectados y de las operaciones principales.

* La documentación permite identificar la versión de cada contrato y las reglas de compatibilidad.

Dependencias: mecanismo común de comunicación, contratos actuales y respuestas de error de los servicios.

### Tarea 2. Garantizar la integridad de las escrituras concurrentes y operaciones masivas

P1 · Alta prioridadGAP-ARQ-02Consistencia de datos

Problema detectado: la cobertura de `LockService` es parcial en las operaciones de escritura masiva. Las ejecuciones concurrentes podrían intercalar escrituras, duplicar operaciones o generar estados inconsistentes.

Requisitos funcionales

* Identificar todas las operaciones que puedan escribir simultáneamente sobre los mismos recursos o mantener invariantes compartidas.

* Determinar cuáles necesitan exclusión mutua y cuáles pueden operar de manera segura sin bloqueo.

* Proteger las secciones críticas con el mecanismo de bloqueo adecuado para el contexto de ejecución de Google Apps Script.

* Aplicar un tiempo máximo de espera configurable y un tratamiento explícito de la imposibilidad de adquirir el bloqueo.

* Liberar los bloqueos de forma garantizada, incluso cuando se produzcan excepciones.

* Mantener los tokens de idempotencia y la validación de duplicados. El bloqueo no debe utilizarse como sustituto de estos mecanismos.

* Evitar mantener bloqueos durante operaciones de red, cálculos prolongados o trabajos que no necesiten acceso exclusivo.

* Garantizar que las operaciones rechazadas por contención puedan reintentarse de forma segura.

* Identificar qué escrituras requieren una única sección crítica y cuáles necesitan un mecanismo de coordinación entre varios recursos.

* Evitar que una operación fallida deje cambios parciales que se interpreten como una transacción completada.

Cambios necesarios

* Revisar las escrituras masivas y las operaciones que generan documentos, registros contables, nóminas o movimientos relacionados.

* Evaluar específicamente `importDataWithColumnMapping` y `generatePayrollPeriod`, mencionadas en la auditoría.

* Identificar otras operaciones con riesgos equivalentes mediante el análisis de sus escrituras y dependencias.

* Incorporar bloqueos únicamente donde sean necesarios y documentar el recurso protegido.

* Establecer un patrón común de adquisición, liberación, timeout y registro de errores.

* Comprobar si el bloqueo de nivel de script es suficiente o si la operación requiere otra estrategia de coordinación.

* Registrar las colisiones y los fallos de adquisición sin exponer información sensible.

Comportamiento esperado

Cuando varias ejecuciones intenten modificar simultáneamente los mismos datos, el sistema debe conservar la integridad de los registros. Las operaciones compatibles podrán continuar en paralelo; las que requieran exclusividad deberán esperar dentro del límite establecido o finalizar con un error recuperable.

Un timeout no debe provocar que se repita automáticamente una operación cuyo resultado anterior sea desconocido sin verificar su estado o reutilizar su mecanismo de idempotencia.

Criterios de aceptación

* Dos ejecuciones concurrentes sobre el mismo recurso no generan identificadores duplicados ni escrituras intercaladas incompatibles.

* Las operaciones sobre recursos independientes no quedan bloqueadas innecesariamente.

* Si no se obtiene el bloqueo dentro del tiempo permitido, se devuelve un error controlado.

* El bloqueo se libera después de una excepción.

* Una operación reintentada no duplica documentos, movimientos contables, nóminas ni otros efectos secundarios.

* Las pruebas incluyen ejecuciones concurrentes, fallos durante la escritura y contención prolongada.

* Se verifica la integridad de los datos antes y después de cada prueba.

* Se documenta el impacto del bloqueo sobre el rendimiento y la duración de las operaciones masivas.

Dependencias: mecanismos de escritura, generación de identificadores, tokens de idempotencia, validaciones y procesos automáticos relacionados.

### Tarea 3. Definir una estrategia de escalabilidad y migración a base de datos relacional

P2 · ImportanteGAP-ARQ-03Persistencia y escalabilidad

Problema detectado: existe una orientación hacia una futura base de datos relacional, pero no hay una estrategia formal que establezca condiciones verificables para iniciar la migración, evaluar alternativas y preservar la integridad institucional.

La auditoría propone un umbral inicial de 100,000 filas, pero este valor debe tratarse como una hipótesis por validar, no como un límite universal de Google Sheets ni como prueba suficiente de que la migración sea necesaria.

Requisitos funcionales

* Definir métricas que permitan evaluar la capacidad real de la infraestructura actual.

* Establecer criterios de migración relacionados con rendimiento, concurrencia, integridad, cuotas, recuperación y complejidad operativa.

* Distinguir los límites técnicos documentados de los umbrales internos que la institución decida adoptar.

* Definir cómo se medirá el volumen de registros por entidad y hoja, así como su crecimiento previsto.

* Establecer objetivos de rendimiento para operaciones representativas: consultas, escrituras, búsquedas, importaciones y procesos masivos.

* Determinar qué operaciones necesitan garantías transaccionales entre varios registros.

* Evaluar alternativas relacionales, incluidos PostgreSQL y MySQL, según los requisitos reales.

* Definir una estrategia de migración incremental que permita conservar la continuidad de los servicios.

* Establecer mecanismos para validar que los datos migrados coincidan con los originales.

* Determinar cómo se gestionarán las referencias, las restricciones de unicidad, los índices, las relaciones y las transacciones.

* Definir un procedimiento de reversión y recuperación ante fallos.

* Establecer criterios para decidir si conviene mantener determinadas funciones en su infraestructura actual o trasladarlas a la nueva base de datos.

Cambios necesarios

* Crear un documento técnico específico de estrategia de escalabilidad y migración.

* Inventariar las hojas, entidades, operaciones y dependencias que utilizan la persistencia actual.

* Registrar volúmenes aproximados, frecuencia de acceso, concurrencia y tiempos de respuesta.

* Identificar los cuellos de botella que puedan resolverse mediante optimización antes de migrar.

* Definir los indicadores que activarán una evaluación formal de migración.

* Elaborar una matriz comparativa de las alternativas de almacenamiento, incluyendo coste operativo, transacciones, seguridad, mantenimiento, escalabilidad y compatibilidad con los servicios existentes.

* Definir un modelo de datos objetivo y un mapa de correspondencias entre las estructuras actuales y las futuras.

* Establecer el mecanismo de validación y reconciliación durante la transición.

* Definir el procedimiento para evitar divergencias si, durante la migración, deben convivir temporalmente dos sistemas de persistencia.

Comportamiento esperado

La plataforma debe permitir tomar decisiones de escalabilidad a partir de métricas verificables, no únicamente del número de filas. La migración debe ser planificada, reversible cuando sea técnicamente viable y verificable mediante comparaciones de datos y pruebas funcionales.

Criterios de aceptación

* El documento identifica la arquitectura actual y los límites técnicos relevantes de cada servicio utilizado.

* Los umbrales de migración tienen una definición, una métrica y un procedimiento de medición.

* El umbral de 100,000 filas queda validado, ajustado o descartado mediante evidencia.

* Se documentan los objetivos de rendimiento y los escenarios de carga.

* Se identifica qué operaciones necesitan transacciones atómicas.

* Se incluye una matriz de alternativas con criterios de selección explícitos.

* Se define cómo validar conteos, identificadores, relaciones, importes y registros históricos después de migrar.

* Se documentan la reversión, las copias de seguridad y la recuperación.

* La estrategia no exige migrar todos los módulos simultáneamente ni duplicar indefinidamente la lógica de acceso a datos.

Dependencias: inventario de persistencia, contratos de los servicios, identificadores institucionales, reglas de consistencia y métricas de rendimiento.

### Tarea 4. Establecer observabilidad y métricas operativas de interoperabilidad

P2 · ImportanteMejora complementaria

Problema detectado: el informe identifica registros estructurados de eventos y mecanismos de trazabilidad, pero no demuestra que exista una visión unificada del rendimiento, los fallos de comunicación, las colisiones de concurrencia y el estado de sincronización de todos los servicios.

Requisitos funcionales

* Identificar las solicitudes y operaciones relacionadas mediante un identificador de correlación.

* Registrar servicio de origen, operación, duración, resultado y clasificación del error.

* Distinguir errores de validación, permisos, incompatibilidad de versión, timeout, cuota, contención y fallos de persistencia.

* Medir tiempos de respuesta, frecuencia de errores, reintentos y operaciones pendientes.

* Medir los tiempos de espera para adquirir bloqueos y los fallos de adquisición.

* Identificar procesos automáticos estancados, repetidos o fallidos.

* Mantener la trazabilidad entre una operación principal y sus efectos secundarios.

* Evitar registrar contraseñas, tokens de autenticación, claves secretas o datos personales innecesarios.

* Definir alertas proporcionales al impacto y a los umbrales operativos acordados.

Cambios necesarios

* Identificar los mecanismos de registro existentes y determinar qué métricas faltan.

* Unificar los campos de los eventos relevantes sin reemplazar innecesariamente los sistemas actuales.

* Definir un identificador de correlación que se propague entre servicios y procesos asíncronos cuando corresponda.

* Incorporar métricas agregadas y un procedimiento para consultar fallos sin depender de revisar manualmente registros dispersos.

* Definir alertas para fallos repetidos, acumulación de operaciones pendientes y degradación del rendimiento.

Comportamiento esperado

Una operación que atraviesa varios servicios debe poder investigarse de principio a fin. Los registros deben permitir distinguir dónde falló, cuánto tardó y si produjo efectos parciales, sin revelar información confidencial.

Criterios de aceptación

* Una operación de prueba puede rastrearse a través de los componentes involucrados.

* Un error de comunicación puede distinguirse de un error de negocio.

* Los reintentos y las operaciones duplicadas quedan identificados.

* Las métricas permiten detectar un aumento de latencia o de errores.

* Las alertas no generan notificaciones repetitivas sin control.

* Los registros sanitizados no incluyen credenciales ni datos sensibles innecesarios.

* La observabilidad no introduce una dependencia que impida ejecutar las operaciones principales cuando el sistema de registro no esté disponible.

Dependencias: contratos de comunicación, registros estructurados existentes, mecanismos de sincronización y tareas automáticas.

### Tarea 5. Formalizar los contratos de datos compartidos entre servicios

P2 · ImportanteMejora complementaria

Problema detectado: se ha verificado un formato común de solicitudes, pero un envoltorio JSON uniforme no garantiza que todos los servicios interpreten de la misma manera los campos, estados, referencias y errores de las entidades compartidas.

Requisitos funcionales

* Documentar los contratos reales de las operaciones que comparten entidades institucionales.

* Definir los tipos, campos obligatorios, valores opcionales, restricciones y reglas de nulabilidad.

* Establecer formatos uniformes para fechas, importes, estados y referencias.

* Definir cómo se representan los errores recuperables y no recuperables.

* Identificar los cambios compatibles y los cambios que requieren coordinación entre productores y consumidores.

* Evitar que cada servicio implemente una interpretación diferente de un mismo estado institucional.

* Mantener la compatibilidad con los datos históricos y las operaciones existentes.

Cambios necesarios

* Elaborar un inventario de contratos de entrada y salida.

* Comparar las estructuras utilizadas por los consumidores con las producidas por cada servicio.

* Identificar campos redundantes, equivalencias ambiguas y valores con interpretaciones distintas.

* Definir esquemas verificables para los contratos más importantes.

* Añadir pruebas de compatibilidad para las operaciones compartidas.

Comportamiento esperado

Los servicios deben intercambiar datos de forma predecible. Una modificación de contrato no debe introducir errores silenciosos en otro módulo ni convertir valores válidos en estados incorrectos.

Criterios de aceptación

* Cada operación crítica tiene un contrato documentado y verificable.

* Los campos obligatorios y opcionales coinciden entre productor y consumidor.

* Las respuestas de error mantienen una estructura coherente.

* Las pruebas detectan campos incompatibles y cambios que rompen consumidores existentes.

* Las operaciones relacionadas con estudiantes, usuarios, expedientes y contabilidad conservan la integridad de sus referencias.

* Los cambios de contrato tienen una política de compatibilidad documentada.

Dependencias: Tarea 1, inventario de servicios y resolución de datos institucionales.

### Tarea 6. Fortalecer la idempotencia de las operaciones institucionales y económicas

P1 · Alta prioridadConsistencia e integridad

Problema detectado: la auditoría verifica la inyección de `idempotencyToken` en las mutaciones desde el cliente, pero no detalla si todos los servicios registran y validan de forma duradera los resultados asociados a cada token, ni cómo se resuelven solicitudes simultáneas con el mismo token.

Requisitos funcionales

* Determinar qué operaciones necesitan idempotencia, especialmente las que generan cargos, pagos, movimientos de inventario, matrículas, documentos o nóminas.

* Comprobar que el token se valida y aplica en el servidor, sin confiar exclusivamente en el cliente.

* Definir el ámbito de unicidad y el periodo de conservación de los tokens.

* Vincular cada token a la operación y a sus parámetros relevantes.

* Evitar que el mismo token se reutilice para ejecutar una operación diferente.

* Definir qué respuesta se devuelve cuando se repite una solicitud ya completada.

* Resolver las solicitudes simultáneas con el mismo token sin duplicar efectos.

* Definir cómo se recuperan las operaciones cuyo resultado quedó incierto por un timeout.

* Mantener una trazabilidad suficiente para investigar solicitudes repetidas.

Cambios necesarios

* Inspeccionar los mecanismos reales de almacenamiento y consulta de tokens en todos los servicios que ejecutan mutaciones.

* Identificar operaciones donde el token solo se transmite, pero no se valida de forma duradera.

* Establecer un mecanismo seguro para registrar el resultado de una operación y vincularlo a su token.

* Definir el tratamiento de tokens vencidos, reutilizados con parámetros diferentes y solicitudes concurrentes.

* Comprobar que los procesos automáticos secundarios no vuelvan a ejecutar efectos ya confirmados.

Comportamiento esperado

La repetición de una misma solicitud no debe producir un segundo efecto económico o institucional. Si la operación anterior ya terminó, el sistema debe devolver un resultado coherente con ella; si su estado es incierto, debe poder determinarse antes de ejecutar de nuevo el efecto.

Criterios de aceptación

* Repetir una solicitud completada no duplica sus efectos.

* Dos solicitudes simultáneas con el mismo token no generan dos operaciones.

* Reutilizar un token con parámetros incompatibles genera un error controlado.

* Un timeout seguido de reintento conserva la integridad de los datos.

* La pérdida temporal de respuesta no produce cargos, movimientos o documentos duplicados.

* Las pruebas comprueban el comportamiento tanto en el servicio principal como en sus procesos secundarios.

Dependencias: Tarea 2, contratos de comunicación, persistencia y trazabilidad.

### Tarea 7. Fortalecer la integridad de las operaciones que abarcan varios servicios

P1 · Alta prioridadIntegridad institucional

Problema detectado: la auditoría verifica validaciones previas a la persistencia y el aislamiento de ciertos fallos secundarios, pero no demuestra que todas las operaciones que modifican varias entidades puedan recuperarse de forma coherente cuando una escritura intermedia falla.

Requisitos funcionales

* Identificar las operaciones que modifican más de una entidad o servicio.

* Separar las operaciones críticas de negocio de las notificaciones y otras acciones secundarias.

* Definir los estados válidos de cada operación y sus transiciones.

* Detectar escrituras parciales y evitar que se presenten como operaciones completadas.

* Determinar cuándo corresponde utilizar una transacción local y cuándo se necesita una estrategia de recuperación entre servicios.

* Establecer mecanismos de compensación cuando una operación distribuida no pueda revertirse mediante una transacción.

* Garantizar que los procesos de recuperación sean idempotentes.

* Mantener referencias consistentes entre documentos, expedientes, transacciones y registros relacionados.

Cambios necesarios

* Elaborar un inventario de flujos críticos que atraviesan varios servicios.

* Documentar los pasos, las escrituras, los estados y los efectos secundarios de cada flujo.

* Identificar los puntos donde una excepción podría dejar datos parcialmente actualizados.

* Implementar, donde sea necesario, estados intermedios, registros de operación o mecanismos de compensación.

* Añadir pruebas de fallos en cada paso crítico.

* Evitar introducir una transacción distribuida compleja si un mecanismo de recuperación más sencillo satisface los requisitos.

Comportamiento esperado

Una operación debe finalizar en un estado coherente y verificable. Si falla a mitad del proceso, el sistema debe identificar lo que se completó, evitar repetir efectos ya confirmados y permitir recuperar o compensar los cambios pendientes.

Criterios de aceptación

* Cada flujo crítico tiene definidos sus estados válidos y puntos de recuperación.

* Los fallos inducidos no dejan registros huérfanosc o estados finales falsos.

* Los reintentos no duplican efectos.

* Las acciones de compensación pueden ejecutarse de forma segura más de una vez cuando corresponda.

* Los errores quedan registrados con suficiente información para diagnosticar la operación.

* Se comprueba la integridad de los datos antes y después de los escenarios de fallo.

Dependencias: Tareas 2, 5 y 6; mecanismos de persistencia y procesos automáticos.

### Tarea 8. Completar la recuperación y conciliación de las sincronizaciones

P2 · ImportanteSincronización

Problema detectado: existe una cola de sincronización en IndexedDB y se ha verificado la conciliación de inventario, pero no se documenta un mecanismo uniforme para reconciliar todos los flujos de sincronización entre el cliente, los servicios y las fuentes de datos.

Requisitos funcionales

* Identificar las operaciones pendientes, completadas, fallidas y de resultado incierto.

* Registrar intentos, errores y fechas de procesamiento sin exponer datos sensibles.

* Reintentar fallos transitorios con límites y estrategia de espera adecuados.

* Evitar reintentos infinitos y duplicación de efectos.

* Distinguir los errores transitorios de los errores permanentes de validación o autorización.

* Detectar registros que existan en una fuente, pero falten en otra.

* Establecer reglas para resolver divergencias sin sobrescribir silenciosamente cambios legítimos.

* Permitir recuperar una sincronización interrumpida sin procesar incorrectamente todos los registros desde el principio.

Cambios necesarios

* Inventariar las colas, mecanismos de sincronización y rutinas de conciliación existentes.

* Identificar sus formatos de estado, políticas de reintento y criterios de finalización.

* Definir un mecanismo de consulta de operaciones pendientes y fallidas.

* Completar las rutinas de reconciliación para los flujos donde sean necesarias.

* Establecer procedimientos de resolución de conflictos y reparación controlada.

Comportamiento esperado

Una interrupción de red o de ejecución no debe ocasionar pérdida silenciosa de datos. La plataforma debe poder identificar las operaciones afectadas, reanudarlas de manera segura y demostrar que los registros sincronizados coinciden con la fuente autorizada.

Criterios de aceptación

* Una operación pendiente puede reanudarse después de recuperar la conectividad.

* Los fallos permanentes no se reintentan indefinidamente.

* Los registros duplicados, ausentes o inconsistentes pueden identificarse.

* La conciliación distingue discrepancias reales de diferencias legítimas.

* Los cambios conflictivos no se sobrescriben automáticamente sin una regla definida.

* Los resultados de la recuperación quedan registrados y son verificables.

Dependencias: Tareas 5, 6 y 7; almacenamiento local, persistencia remota y registros de operación.

### Tarea 9. Optimizar las operaciones masivas y el uso de cuotas

P2 · ImportanteRendimiento

Problema detectado: existen mecanismos de paginación y carga por fragmentos, pero la auditoría no aporta mediciones suficientes para demostrar que todas las operaciones masivas cumplen los límites operativos con volúmenes crecientes.

Requisitos funcionales

* Identificar operaciones que leen o escriben grandes cantidades de datos.

* Reducir lecturas completas, escrituras repetitivas y solicitudes redundantes.

* Definir tamaños de lote adecuados según los límites y mediciones reales.

* Permitir reanudar trabajos interrumpidos sin duplicar resultados.

* Establecer tiempos máximos y tratamiento de cuotas excedidas.

* Evitar que los procesos masivos monopolizen recursos compartidos.

* Mantener la consistencia y trazabilidad de los registros procesados.

* Definir métricas para evaluar duración, volumen, errores y consumo de recursos.

Cambios necesarios

* Revisar `importDataWithColumnMapping`, `uploadChunk` y las operaciones equivalentes.

* Medir los tiempos de ejecución y el número de operaciones de lectura y escritura.

* Identificar llamadas repetidas que puedan sustituirse por operaciones por lotes.

* Ajustar los tamaños de lote con base en pruebas controladas.

* Incorporar puntos de control y reanudación donde sean necesarios.

* Definir límites de concurrencia para procesos que compitan por los mismos recursos.

Comportamiento esperado

Las importaciones y operaciones masivas deben procesar grandes volúmenes de forma predecible, con recuperación ante interrupciones y sin degradar de manera desproporcionada las operaciones interactivas.

Criterios de aceptación

* Se documentan las mediciones de rendimiento para volúmenes representativos.

* Los procesos pueden reanudarse después de un fallo.

* Los reintentos no duplican registros ni efectos secundarios.

* Los errores de cuota se identifican y reciben un tratamiento controlado.

* Se comprueba la integridad de los datos procesados.

* Las optimizaciones no degradan las validaciones ni los permisos existentes.

Dependencias: Tareas 2, 4, 6 y 8.

### Tarea 10. Formalizar la resolución y validación de configuraciones compartidas

P3 · MejoraConfiguración institucional

Problema detectado: la auditoría verifica la resolución de fuentes autorizadas y el uso de valores predeterminados, pero es necesario asegurar que las reglas de precedencia y los valores de configuración se mantengan coherentes entre todos los módulos.

Requisitos funcionales

* Identificar las configuraciones institucionales compartidas y su fuente efectiva.

* Documentar las reglas de precedencia entre registros de configuración, valores predeterminados y constantes.

* Validar los tipos, rangos y formatos de los valores.

* Distinguir configuraciones opcionales de configuraciones obligatorias.

* Evitar que una configuración inválida se sustituya silenciosamente por un valor predeterminado que altere operaciones importantes.

* Definir cómo se invalidan las cachés cuando cambia una configuración.

* Mantener separados los valores institucionales de las preferencias personales.

* Registrar los cambios de configuración relevantes y su efecto.

Cambios necesarios

* Inventariar las fuentes de configuración utilizadas por los servicios.

* Identificar duplicaciones y reglas de precedencia implícitas.

* Unificar las validaciones que deban ser compartidas.

* Definir errores controlados para valores inválidos o ausentes que sean obligatorios.

* Añadir pruebas de consistencia entre consumidores y de invalidación de caché.

Comportamiento esperado

Los módulos deben aplicar una configuración coherente y predecible. Los errores de configuración deben ser detectables y no provocar cambios silenciosos en reglas académicas, financieras o administrativas.

Criterios de aceptación

* Cada configuración compartida tiene una fuente autorizada identificada.

* Los valores inválidos se rechazan o se gestionan mediante una regla explícita.

* Los consumidores aplican el mismo valor cuando comparten el mismo ámbito.

* La caché se actualiza según la política definida.

* Los cambios no exponen secretos ni invalidan datos institucionales existentes.

Dependencias: contratos de servicios, fuentes de datos autorizadas y mecanismos de caché.

### Orden recomendado de ejecución

### 1

Integridad y concurrencia

Tareas 2, 6 y 7. Reducir riesgos de escrituras incompatibles, operaciones duplicadas y estados parciales.

### 2

Contratos e interoperabilidad

Tareas 1 y 5. Estandarizar la evolución de las API y los contratos de datos.

### 3

Recuperación y operación

Tareas 8 y 9. Fortalecer la sincronización, las conciliaciones y el procesamiento masivo.

### 4

Observabilidad y evolución

Tareas 3, 4 y 10. Formalizar métricas, configuraciones compartidas y criterios de escalabilidad.

Las tareas 2, 6 y 7 deben coordinarse porque los bloqueos, la idempotencia y la recuperación de operaciones protegen aspectos distintos de una misma operación. No debe considerarse resuelto el problema de duplicación únicamente por añadir `LockService`, ni resuelto el de consistencia únicamente por añadir un token de idempotencia.

La Tarea 3 puede desarrollarse en paralelo con las mejoras operativas, ya que la planificación de la migración no requiere migrar datos ni alterar la infraestructura actual.
