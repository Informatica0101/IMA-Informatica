# REGISTRO DE TAREAS PENDIENTES DE RESOLUCIÓN, OPTIMIZACIÓN Y MEJORA - FASE 3 Y FASE 4

Este documento almacena las tareas de resolución, optimización y mejora derivadas de las auditorías funcionales y técnicas de la plataforma.

**REGLA DE ORO INTERNA DE REGISTRO:**
- Bajo NINGUNA circunstancia se deben borrar, sobrescribir o eliminar tareas previamente registradas en este documento.
- Todas las nuevas tareas identificadas y sus expansiones o convergencias deben registrarse manteniendo el 100% del nivel de detalle original sin resumir ni omitir requisitos.
- Si existe algún tipo de disputa o contradicción entre versiones de tareas, se agrega a la tarea la implementación de hacer que las opciones en disputa puedan ser configurables en la plataforma.
- `Pendientes.md` y `pendientes2.md` se mantienen 100% intactos e inalterados.

---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE 3. EXPERIENCIA DE USUARIO Y NAVEGACIÓN UNIFICADA

Las tareas se organizan por prioridad, empezando por la gestión de sesiones y la búsqueda global. Todas las tareas existentes de `pendientes3.md` (T-UX-01 a T-UX-07) se han conservado, ampliado y convergido de manera eficiente con las especificaciones detalladas, garantizando cero pérdida de requisitos, hallazgos, criterios de aceptación o riesgos de regresión.

---

### T-UX-01 [P1]. Gestión centralizada de expiración de sesión y errores de autenticación

**Hallazgo:** GAP-UX-01 · **Archivos principales:** `js/api.js`, `js/ui-common.js`

**Problema que debe resolverse:**
Al caducar una sesión, algunas llamadas AJAX secundarias devuelven errores sin informar al usuario ni iniciar el flujo de recuperación de sesión. Esto puede dejar componentes parcialmente cargados, formularios aparentemente operativos o paneles con datos desactualizados.

**Requisitos funcionales:**
- Implementar un manejador centralizado de errores de autenticación e intercepción de códigos HTTP 401/403 en `fetchApi` para las solicitudes gestionadas por `js/api.js`, sin crear manejadores independientes que dupliquen el comportamiento.
- Detectar de manera fiable los errores de sesión expirada, token inválido, autenticación ausente y acceso no autorizado. Diferenciar estos casos de los errores de red, errores internos del servidor y fallos de validación.
- Cuando la sesión haya expirado, impedir que continúen las operaciones protegidas, disparar una alerta modal limpia ("Su sesión ha expirado") y ofrecer una transición controlada al inicio de sesión.
- Evitar redirecciones repetidas cuando varias solicitudes fallen simultáneamente. El proceso debe ejecutarse una sola vez por episodio de expiración.
- Conservar, cuando sea seguro, la ruta de origen, la última URL intentada e información necesaria para regresar al módulo después de autenticarse. No conservar contraseñas, tokens vencidos ni datos sensibles en parámetros de URL.
- Si existen cambios sin guardar, coordinar el flujo de expiración con el mecanismo de protección de formularios de T-UX-03. No debe prometerse una recuperación automática de datos que no se hayan persistido.
- Limpiar o invalidar los datos de sesión y permisos que ya no sean válidos, evitando que una interfaz visible se interprete como prueba de autorización.
- Respetar la validación de permisos del backend GAS. La corrección de interfaz no sustituye ni debilita los controles del servidor.
- Prevenir ciclos de redirección en las páginas de acceso (`login.html`) y registro, y gestionar adecuadamente las solicitudes de autenticación que fallen durante el propio proceso de inicio de sesión.

**Cambios necesarios:**
- Centralizar la interpretación de errores de autenticación y autorización en `js/api.js`.
- Integrar el resultado con los mensajes, modales y mecanismos de navegación existentes en `js/ui-common.js`.
- Revisar las llamadas secundarias de los paneles para comprobar que utilizan el flujo compartido y no ocultan silenciosamente errores de sesión.
- Asegurar que los estados de carga se finalicen y los controles no permanezcan bloqueados indefinidamente después del error.
- Evitar reintentos automáticos de operaciones de escritura que pudieran duplicar una transacción.

**Comportamiento esperado:**
Si caduca la sesión mientras el usuario consulta un panel, el sistema presenta un aviso único, detiene las operaciones protegidas y permite volver a autenticarse. Si el error corresponde a una pérdida de conectividad, se informa del problema de red sin expulsar innecesariamente al usuario.

**Criterios de aceptación:**
1. Si un token/sesión caduca durante el uso de la aplicación (en solicitud principal o secundaria), cualquier llamada a API abre un modal único de advertencia en lugar de congelar la UI.
2. Al presionar "Iniciar Sesión", redirige a `login.html` preservando la última URL intentada si es seguro.
3. Varias solicitudes fallidas simultáneamente no generan múltiples modales ni redirecciones.
4. Los errores de permisos no se confunden con una sesión expirada.
5. Los errores de red no fuerzan el cierre de sesión.
6. El flujo no genera bucles en `login.html` ni en las demás vistas públicas.
7. Los indicadores de carga se restablecen y los botones quedan en un estado coherente.
8. Los permisos del backend siguen siendo obligatorios para toda operación protegida.
9. Las operaciones de escritura no se reenvían automáticamente de forma que puedan duplicarse.
10. La navegación posterior al inicio de sesión no expone información sensible.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-UX-03 para coordinar los cambios sin guardar; mecanismos existentes de autenticación y permisos.

---

### T-UX-02 [P1]. Buscador global unificado Omnibox con navegación contextual

**Hallazgo:** GAP-UX-04 · **Archivos principales:** `js/ui-common.js`, `js/api.js`, HTML Headers globales y servicios GAS pertinentes (`backend/user-service/Code.gs`, etc.)

**Problema que debe resolverse:**
La búsqueda está fragmentada por módulos. El usuario necesita conocer de antemano dónde se encuentra una persona, un expediente, un folio o un trámite para localizarlo. Esto incrementa los pasos y dificulta la navegación entre departamentos.

**Requisitos funcionales:**
- Desarrollar e incorporar un componente de búsqueda rápida modal (Omnibox) accesible desde todos los paneles autenticados mediante un control visible y los atajos de teclado `Ctrl+K` y `Cmd+K`.
- El buscador debe respetar el rol, los permisos y el ámbito departamental del usuario. No debe revelar resultados confidenciales mediante títulos, fragmentos, contadores, sugerencias ni mensajes de ausencia de resultados.
- Buscar simultáneamente personas, estudiantes, docentes, empleados, expedientes, matrículas, facturas, comprobantes, solicitudes, trámites, tareas, registros financieros y otros elementos identificables de la plataforma.
- Admitir búsqueda por identificador exacto, nombre, apellido, texto parcial y términos relevantes. Las reglas de normalización deben ser compatibles con T-UX-05.
- Mostrar resultados agrupados por categoría, con etiquetas comprensibles, identificadores y contexto suficiente para distinguir homónimos sin exponer datos privados.
- Proporcionar navegación directa al detalle o módulo correspondiente. Cuando el usuario no tenga permiso para abrir un resultado, no debe mostrarse como accesible.
- Ofrecer estados diferenciados de carga, resultados, ausencia de coincidencias, error, falta de conectividad y búsqueda no disponible.
- Permitir navegación completa mediante teclado: abrir, escribir, recorrer resultados, seleccionar y cerrar sin depender del ratón.
- Cerrar con `Escape`, restaurar el foco al control de origen y evitar que los atajos interfieran con campos de texto, editores, composición de caracteres o controles que ya utilizan las mismas combinaciones.
- Incorporar búsqueda incremental con un retraso breve (debouncing) para evitar una solicitud por cada pulsación, cancelación de consultas obsoletas y protección frente a respuestas que lleguen fuera de orden.
- Evitar que la búsqueda global cargue indiscriminadamente todos los registros. Debe consultar únicamente las categorías necesarias, con límites, paginación o carga progresiva cuando corresponda.
- Diseñar una arquitectura extensible para agregar nuevas categorías sin reescribir el componente central ni acoplarlo a un único departamento.
- Mantener separadas la búsqueda global y las búsquedas especializadas de cada módulo. Las funciones locales pueden seguir ofreciendo filtros específicos más profundos.

**Cambios necesarios:**
- Crear el componente compartido del Omnibox e integrarlo en los encabezados autenticados.
- Centralizar su interacción visual y de teclado en `js/ui-common.js`.
- Definir una interfaz de consulta reutilizable en `js/api.js` y los servicios GAS correspondientes a cada categoría (`getStudents`, `getInstitutionalReportCatalog`, etc.).
- Aprovechar funciones de consulta y permisos existentes en vez de duplicar reglas de negocio.
- Añadir índices o estrategias de consulta adecuadas al almacenamiento disponible si la búsqueda sobre los datos existentes resulta lenta.
- No inventar una nueva fuente de datos ni introducir cambios de esquema innecesarios: primero reutilizar las fuentes autorizadas y los identificadores existentes.

**Comportamiento esperado:**
Desde cualquier panel autenticado, el usuario puede abrir el buscador, escribir un término y localizar registros autorizados de diferentes departamentos sin navegar manualmente por cada módulo.

**Criterios de aceptación:**
1. Presionar `Ctrl+K`, `Cmd+K` o el control visible en cualquier dashboard despliega el modal Omnibox con foco automático.
2. La consulta busca a través del backend (`getStudents`, `getInstitutionalReportCatalog`, etc.) y categoriza los resultados según los permisos efectivos del usuario.
3. Seleccionar un resultado redirige o abre la vista/modal de detalle correspondiente.
4. Una búsqueda por identificador exacto ofrece coincidencias inequívocas cuando existe un registro autorizado.
5. Los homónimos se distinguen con contexto suficiente sin exponer datos privados.
6. Las consultas rápidas no muestran respuestas antiguas después de escribir un término nuevo.
7. Las búsquedas vacías, sin coincidencias, fallidas y sin conexión presentan estados diferenciados.
8. El componente funciona con teclado, lector de pantalla y dispositivos móviles.
9. La búsqueda no descarga innecesariamente todos los registros de la plataforma.
10. Las búsquedas especializadas existentes continúan funcionando.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-UX-05 para normalización compartida; infraestructura de permisos y consulta de los servicios existentes.

---

### T-UX-03 [P2]. Protección unificada contra pérdida de cambios sin guardar

**Hallazgos:** GAP-UX-02 y GAP-UX-06 · **Archivos principales:** `js/ui-common.js` y vistas con formularios o modales editables

**Problema que debe resolverse:**
Los formularios extensos pueden perder información cuando el usuario cambia de sección. Algunos modales secundarios también se cierran con `Escape` o al pulsar fuera sin advertir que existen cambios pendientes.

**Requisitos funcionales:**
- Crear un mecanismo compartido de detección de cambios sin guardar (`Unsaved Changes Guard`), reutilizable en formularios completos, formularios parciales, modales y paneles editables.
- Registrar el estado inicial de los campos relevantes (`dirty state`) y compararlo con el estado actual. La advertencia solo debe aparecer cuando existan cambios reales que todavía no se hayan guardado.
- Detectar las modificaciones en campos de texto, selectores, casillas, opciones múltiples, fechas, editores y demás controles utilizados por los formularios de la plataforma.
- Integrarse con los formularios dinámicos y los modales que se crean o destruyen durante la navegación.
- Activar la protección al cambiar de sección, navegar a otra ruta interna, cerrar un modal, usar `Escape` o intentar cerrar mediante el control de la interfaz.
- Presentar tres opciones inequívocas cuando sean aplicables: seguir editando, descartar cambios y guardar antes de salir. Si una pantalla no admite guardado desde ese contexto, no debe mostrar una opción de guardar que no pueda ejecutar.
- No descartar datos hasta que el usuario confirme la operación. Cancelar el diálogo debe conservar los cambios y el contexto de edición.
- Al guardar correctamente, actualizar el estado inicial para que los cambios persistidos no generen advertencias posteriores.
- Si el guardado falla, conservar los datos introducidos y comunicar el error. No marcar el formulario como guardado.
- Diferenciar los cambios de contenido de los cambios de presentación que no alteran datos, como abrir una pestaña, ordenar una tabla o cambiar el tamaño de una ventana.
- Evitar diálogos repetidos cuando varias capas de navegación intenten cerrarse por el mismo evento.
- Gestionar los envíos en curso: si una operación de guardado está activa, evitar un cierre que interrumpa la operación sin informar al usuario.
- Coordinarse con T-UX-01 para que una sesión expirada no provoque una pérdida silenciosa del contenido editado.
- Para formularios que manejan información extensa o difícil de reconstruir, evaluar el uso de borradores locales temporales, con caducidad y controles de privacidad. No persistir automáticamente contraseñas, tokens ni otros datos sensibles.

**Cambios necesarios:**
- Incorporar una utilidad común en `js/ui-common.js` para registrar formularios protegidos y gestionar el ciclo de vida de sus cambios.
- Conectar los eventos de navegación SPA y los mecanismos de cierre de modales con el guardián compartido.
- Identificar y migrar los mecanismos existentes de protección para evitar comportamientos duplicados.
- Definir una interfaz consistente para consultar si un formulario está modificado, guardar, descartar y restablecer su estado.
- Si se implementan borradores, integrarlos con los mecanismos de persistencia existentes, sin modificar indiscriminadamente `js/persistence.js` ni crear almacenamiento paralelo sin necesidad.

**Comportamiento esperado:**
Al intentar salir de un formulario o modal modificado, la plataforma solicita confirmación. Si el usuario decide seguir editando, permanece en el mismo contexto con los datos intactos. Si descarta, sale y pierde únicamente los cambios que confirmó descartar. Si guarda, solo continúa después de confirmar que el guardado fue satisfactorio.

**Criterios de aceptación:**
1. Al intentar cerrar un modal o cambiar de sección con un formulario modificado, se presenta una ventana de confirmación "¿Desea salir sin guardar los cambios?".
2. Si el usuario confirma descartar, se cierra; si cancela la salida, los datos y el foco se conservan intactos.
3. Cerrar con `Escape`, con el botón de cierre o con clic exterior no descarta cambios silenciosamente.
4. Los formularios sin cambios no muestran advertencias innecesarias.
5. Un guardado fallido conserva los cambios.
6. Un guardado correcto actualiza el estado de referencia.
7. Los formularios dinámicos y los modales secundarios están cubiertos.
8. El mecanismo no genera dos advertencias por una sola acción.
9. No interfiere con operaciones de solo lectura ni con la navegación habitual.
10. La integración con la expiración de sesión evita promesas falsas de recuperación de datos.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-UX-01 para los flujos de sesión; componentes de formularios, modales y navegación existentes.

---

### T-UX-04 [P2]. Indicadores de frescura de datos en paneles y controles de actualización

**Hallazgo:** GAP-UX-03 · **Ubicación:** Paneles principales, HTML Dashboards, widgets financieros y de matrícula en `js/ui-common.js`

**Problema que debe resolverse:**
Los indicadores de matrícula y las métricas financieras no muestran explícitamente cuándo se actualizaron sus datos. El usuario puede interpretar como actuales cifras que corresponden a una consulta anterior o a una carga incompleta.

**Requisitos funcionales:**
- Incorporar un indicador visible de última actualización ("Actualizado a las HH:MM AM/PM") en los widgets de métricas financieras y matrícula y extender el patrón a otros indicadores donde la actualidad de los datos afecte decisiones.
- Mostrar fecha y hora de la última actualización satisfactoria de los datos representados, usando la zona horaria institucional configurada y un formato legible.
- Diferenciar:
  - hora de la última actualización satisfactoria;
  - hora de la última tentativa de consulta, cuando resulte útil;
  - estado actual de actualización;
  - datos almacenados en caché o potencialmente desactualizados.
- No actualizar el indicador como si hubiera habido éxito cuando la consulta falla, devuelve datos incompletos o no termina.
- Mostrar estados explícitos como "Actualizando", "Actualizado a las HH:MM", "Sin conexión" o "No se pudo actualizar", según corresponda.
- Incorporar un control/botón de recarga rápida accesible cuando tenga sentido para el widget, evitando consultas redundantes o solicitudes simultáneas del mismo conjunto de datos.
- Mantener la independencia entre widgets: una actualización fallida de matrícula no debe invalidar la marca temporal de una métrica financiera que sí se actualizó correctamente.
- Cuando una cifra dependa de un periodo académico, financiero o administrativo, conservar la referencia del periodo utilizado para que el usuario no confunda la fecha de actualización con el periodo de los datos.
- Si los datos provienen de caché, indicar claramente que se muestran datos previamente obtenidos y cuándo se consultaron satisfactoriamente por última vez.
- Mantener una presentación compacta en móviles y una jerarquía visual coherente con el diseño actual.
- Evitar que la marca temporal genere llamadas adicionales al backend por cada renderizado. Reutilizar el resultado de la consulta y sus metadatos cuando estén disponibles.

**Cambios necesarios:**
- Identificar el origen y el ciclo de actualización de las métricas de matrícula y financieras en los paneles correspondientes.
- Incorporar metadatos de actualización a los resultados de consulta o mantenerlos en el estado del widget cuando el backend no los proporcione.
- Distinguir una hora generada por el cliente de una fecha de actualización confirmada por el servidor.
- Añadir el componente compartido de estado de actualización y conectarlo con los controles de recarga existentes.
- Revisar los estados de carga, error y caché para evitar marcas temporales engañosas.

**Comportamiento esperado:**
Cada widget comunica si sus datos están actualizados, cuándo se obtuvieron correctamente y si existe un problema que impide confirmar su actualidad. La información permanece coherente con el periodo de referencia y con el resultado real de las consultas.

**Criterios de aceptación:**
1. Cada panel de métricas financieras y de matrícula muestra visiblemente el momento de la última sincronización satisfactoria.
2. El botón de refresco permite actualizar los datos del panel sin recargar la página completa.
3. Un error de consulta no modifica la hora de la última actualización exitosa.
4. Los datos en caché se identifican como tales.
5. La recarga no provoca solicitudes duplicadas innecesarias.
6. Cada widget mantiene su estado independientemente de los demás.
7. El periodo al que corresponde la métrica se distingue de la hora de actualización.
8. La información es legible en escritorio y móvil.
9. No se muestran marcas temporales de éxito para cargas incompletas o fallidas.

**Riesgo de Regresión:** Nulo.
**Dependencias:** Mecanismos de consulta y caché de los paneles; componentes compartidos de interfaz.

---

### T-UX-05 [P2]. Normalización avanzada de búsquedas y tolerancia a acentos, espacios y caracteres especiales

**Hallazgo:** GAP-UX-05 · **Archivos principales:** Buscadores locales, filtros de tablas en `js/ui-common.js` y utilidades compartidas de consulta

**Problema que debe resolverse:**
Algunas búsquedas frontend no normalizan de manera consistente los espacios múltiples y los caracteres especiales. Esto puede impedir que se encuentren registros que sí existen o producir resultados inconsistentes entre módulos.

**Requisitos funcionales:**
- Crear e integrar una estrategia/función utility compartida de normalización de texto (`normalizeSearchTerm`) para las búsquedas que requieran comparación flexible, evitando que cada módulo implemente reglas diferentes.
- Eliminar diacríticos (acentos, tildes) en texto español (ej. buscar "perez" encuentra "Pérez").
- Tratar los espacios iniciales y finales como irrelevantes y normalizar secuencias de espacios internos.
- Permitir coincidencias sin distinción de mayúsculas y minúsculas.
- Mantener los datos originales intactos: la normalización se utiliza para comparar, no para sobrescribir nombres, identificadores, documentos ni registros almacenados.
- Definir un tratamiento seguro y consistente para signos de puntuación, guiones, apóstrofos y caracteres Unicode, sin eliminar caracteres que sean relevantes para distinguir identificadores o términos.
- Diferenciar los identificadores exactos de las búsquedas aproximadas. No eliminar indiscriminadamente ceros iniciales, guiones o separadores de identificadores oficiales.
- Asegurar que las búsquedas por identificador exacto conserven la precisión y no devuelvan coincidencias ambiguas por una normalización excesiva.
- Aplicar las mismas reglas en los buscadores locales que compartan este comportamiento y en la búsqueda global de T-UX-02, cuando corresponda.
- Evitar interpretar el texto introducido por el usuario como una expresión regular o fragmento ejecutable sin escapado y validación adecuados.
- Gestionar entradas vacías, consultas compuestas únicamente por espacios, caracteres Unicode y cadenas de longitud extrema sin errores ni bloqueos.
- Mantener compatibilidad con los filtros combinados existentes, incluidos los criterios AND/OR. La normalización de texto no debe alterar la lógica de combinación de filtros.
- Cuando el volumen de datos exija buscar en backend, garantizar que la normalización sea coherente entre las consultas frontend y los servicios GAS pertinentes.

**Cambios necesarios:**
- Revisar los métodos de búsqueda y filtrado que procesan cadenas en el frontend.
- Incorporar una utilidad compartida `normalizeSearchTerm` y migrar únicamente los puntos donde sea necesaria.
- Revisar la construcción de consultas para evitar que caracteres especiales alteren la estructura de filtros.
- Definir casos de prueba para nombres propios, acentos, espacios, identificadores y símbolos legítimos.
- Evaluar el rendimiento con tablas grandes para evitar normalizaciones costosas repetidas en cada renderizado.

**Comportamiento esperado:**
Una búsqueda flexible encuentra registros equivalentes aunque existan diferencias de mayúsculas, acentos o espacios irrelevantes. Los identificadores exactos mantienen sus reglas estrictas y no se mezclan con coincidencias aproximadas.

**Criterios de aceptación:**
1. Buscar "perez" encuentra registros como "Pérez".
2. Espacios antes, después o múltiples en la cadena de búsqueda se ignoran/normalizan automáticamente.
3. Los valores almacenados no se modifican por el proceso de búsqueda.
4. Los identificadores oficiales conservan su precisión.
5. Las cadenas con signos y caracteres Unicode no provocan errores ni consultas malformadas.
6. Las entradas vacías se manejan sin resultados engañosos ni errores.
7. La lógica AND/OR de los filtros sigue funcionando.
8. Los resultados son coherentes entre las búsquedas locales y el Omnibox cuando aplican las mismas reglas.
9. Las pruebas con conjuntos de datos grandes no introducen una degradación apreciable del rendimiento.

**Riesgo de Regresión:** Nulo.
**Dependencias:** T-UX-02 para el uso de la normalización en el buscador global; funciones actuales de filtrado.

---

### T-UX-06 [P3]. Indicador interactivo de operaciones pendientes de sincronización offline

**Hallazgo:** GAP-UX-07 · **Archivos principales:** `js/persistence.js`, `js/api.js`, `js/ui-common.js`, `sw.js` y manifiesto PWA cuando corresponda

**Problema que debe resolverse:**
La plataforma utiliza IndexedDB y un Service Worker, pero el indicador de estado offline no muestra un resumen de las operaciones pendientes de sincronización. El usuario puede desconocer si sus acciones se guardaron localmente, si están esperando conexión o si existe algún conflicto.

**Requisitos funcionales:**
- Incorporar un indicador/badge interactivo del estado de sincronización (`#online-status-badge`) que muestre la cantidad de operaciones pendientes cuando exista una cola real y verificable en IndexedDB.
- Diferenciar los estados de conexión y sincronización: conectado y sincronizado, conectado con pendientes, sin conexión con pendientes ("Sin conexión (3 pendientes)"), sincronizando y error de sincronización.
- Mostrar un resumen de las operaciones pendientes, incluyendo tipo de acción, fecha de creación y estado, siempre que esa información ya exista o pueda obtenerse de la cola de manera fiable.
- Distinguir las operaciones pendientes de las operaciones que fallaron permanentemente, fueron rechazadas por validación o requieren intervención del usuario.
- Actualizar el contador cuando se agreguen, completen, cancelen o fallen operaciones, sin depender exclusivamente de recargar la página.
- Permitir abrir una vista compacta con el detalle de la cola y su estado. Las acciones manuales, como reintentar o descartar, deben estar disponibles solo cuando sean seguras y autorizadas.
- No mostrar una operación como sincronizada hasta recibir confirmación satisfactoria del backend.
- Evitar duplicaciones cuando la conexión se restablezca o cuando se produzcan reintentos. Las operaciones de escritura deben contar con una estrategia adecuada de idempotencia o detección de duplicados compatible con el servicio existente.
- No reintentar indefinidamente operaciones que ya fueron rechazadas por permisos, validación o incompatibilidad de datos.
- Gestionar conflictos entre el estado local y el estado del servidor de manera explícita. No sobrescribir silenciosamente información más reciente ni resolver conflictos sensibles mediante reglas arbitrarias.
- Evitar que la interfaz sugiera que cualquier operación de la plataforma puede ejecutarse offline si solo algunas funciones admiten persistencia local.
- Proteger la cola local frente a exposición accidental de datos sensibles. La información confidencial no debe aparecer en notificaciones del sistema ni en resúmenes visibles desde contextos no autorizados.
- Mantener coherencia entre el contador, los datos almacenados en IndexedDB y las respuestas de sincronización.
- Comunicar claramente qué acciones pueden realizarse sin conexión y cuáles requieren acceso al servidor.

**Cambios necesarios:**
- Inspeccionar el modelo real de persistencia y cualquier cola de operaciones ya existente antes de diseñar una nueva.
- Exponer desde `js/persistence.js` el estado necesario para consultar las operaciones pendientes sin duplicar el almacenamiento.
- Conectar el estado de la cola con el componente visual compartido de `js/ui-common.js`.
- Integrar los eventos de conexión, sincronización y errores que correspondan con `js/api.js` y `sw.js`.
- Si no existe una cola durable de operaciones, definir e implementar el mecanismo mínimo necesario para las acciones que explícitamente deban admitir trabajo offline, sin convertir todo el sistema en una aplicación de escritura offline por defecto.

**Comportamiento esperado:**
El usuario sabe cuántas operaciones están pendientes, qué estado tienen y si requieren atención. Al recuperar la conexión, las operaciones compatibles se sincronizan sin duplicarse y el indicador refleja únicamente los resultados confirmados.

**Criterios de aceptación:**
1. Cuando la aplicación está sin conexión y el usuario realiza acciones, el badge muestra "Sin conexión (X pendientes)", coincidiendo con la cola real.
2. Al recuperar la conexión, sincroniza automáticamente y actualiza el contador a 0 tras confirmación satisfactoria.
3. El indicador reacciona en tiempo real a los cambios de conexión y sincronización.
4. La cola persiste durante una recarga cuando esa persistencia forma parte del diseño.
5. Los fallos permanentes se distinguen de los errores transitorios.
6. Los reintentos no duplican operaciones.
7. Los conflictos no se resuelven mediante sobrescrituras silenciosas.
8. La interfaz identifica las funciones que realmente admiten uso offline.
9. La cola no expone datos sensibles a usuarios no autorizados.
10. El comportamiento funciona en la PWA instalada y en el navegador compatible.

**Riesgo de Regresión:** Nulo.
**Dependencias:** Arquitectura actual de persistencia, cola de operaciones si existe, servicios GAS implicados y T-UX-01 para errores de sesión durante una sincronización.

---

### T-UX-07 [P3]. Agrupación cronológica en el centro de notificaciones

**Hallazgo:** GAP-UX-08 · **Componentes principales:** Encabezado global, `js/ui-common.js` y servicio de notificaciones existente (`BandejaNotificaciones`)

**Problema que debe resolverse:**
El menú desplegable de notificaciones no organiza los elementos por antigüedad. A medida que se acumulan avisos, resulta más difícil distinguir los recientes de los antiguos.

**Requisitos funcionales:**
- Agrupar las notificaciones en el dropdown del encabezado y centro de avisos en secciones cronológicas claramente identificadas: Hoy, Ayer, Esta semana y Anteriores.
- Establecer límites temporales inequívocos utilizando la zona horaria institucional o la zona definida por la plataforma, evitando clasificaciones incorrectas alrededor de la medianoche.
- Ordenar cada grupo de más reciente a más antiguo, utilizando la fecha real de creación de la notificación.
- Mantener las categorías existentes y la distinción entre notificaciones leídas y no leídas.
- Conservar el contador global y actualizarlo según las reglas actuales de lectura, sin contar dos veces un aviso ni modificar el estado de una notificación solo por abrir el menú.
- Mantener la navegación contextual de cada notificación mediante `EnlaceAccion`, respetando los permisos y el tratamiento de orígenes eliminados.
- Proporcionar un estado vacío comprensible cuando no haya notificaciones y un indicador de carga cuando se estén recuperando.
- Evitar que la agrupación obligue a descargar todo el historial de notificaciones. Si existe paginación o un límite de consulta, mantenerlo y asegurar que los grupos se calculen correctamente sobre los elementos disponibles.
- Considerar el agrupamiento en la vista completa del centro de notificaciones si existe o se incorpora, sin exigir duplicar la lógica del menú desplegable.
- Garantizar que las cabeceras de grupo sean comprensibles para lectores de pantalla y que la navegación por teclado siga siendo fluida.

**Cambios necesarios:**
- Incorporar una función compartida para clasificar las notificaciones según sus fechas.
- Integrarla con el componente actual sin duplicar el almacenamiento ni cambiar innecesariamente el esquema de `BandejaNotificaciones`.
- Revisar la actualización del contador y del estado leído/no leído después de abrir, leer o navegar desde una notificación.
- Añadir pruebas para cambios de día, semana, año, zona horaria y fechas inválidas.

**Comportamiento esperado:**
Las notificaciones aparecen agrupadas de manera cronológica, con las más recientes arriba y un contador coherente. La agrupación mejora la lectura sin cambiar el significado, los permisos ni las acciones disponibles.

**Criterios de aceptación:**
1. El desplegable de notificaciones clasifica visualmente los elementos en bloques Hoy, Ayer, Esta semana y Anteriores cuando contienen elementos.
2. Las notificaciones están ordenadas correctamente de más reciente a más antigua dentro de cada grupo.
3. Se mantiene la capacidad de marcar notificaciones individuales o masivas como leídas.
4. Las fechas cercanas a la medianoche se clasifican conforme a la zona horaria definida.
5. El contador conserva su significado y no cambia solo por abrir el desplegable.
6. Leer una notificación actualiza el estado y el contador correctamente.
7. Los enlaces contextuales (`EnlaceAccion`) continúan funcionando.
8. El estado vacío y el estado de carga son claros.
9. La interfaz sigue siendo accesible y usable en dispositivos móviles.
10. La agrupación no exige descargar un historial ilimitado.

**Riesgo de Regresión:** Nulo.
**Dependencias:** Sistema de notificaciones actual y reglas de fecha y zona horaria institucionales.

---

### T-UX-08 [P2]. Convergencia y unificación de tareas existentes en `pendientes3.md`

**Problema que debe resolverse:**
Las tareas definidas en este plan pueden coincidir total o parcialmente con las siete tareas que ya existen en `pendientes3.md`. Si se agregan sin compararlas, podrían aparecer duplicidades, requisitos contradictorios, criterios de aceptación incompletos o pérdida de detalles previamente documentados.

**Requisitos funcionales:**
- Revisar el contenido completo de `pendientes3.md` y comparar cada tarea existente con T-UX-01 a T-UX-08.
- Identificar coincidencias exactas, tareas equivalentes redactadas de manera diferente, tareas parcialmente solapadas y requisitos que se complementan sin constituir duplicidad.
- Cuando una tarea ya exista, unificar ambas versiones en una sola tarea coherente. No crear una segunda tarea para el mismo problema simplemente porque su título sea diferente.
- Conservar el nivel de detalle de ambas fuentes, incluyendo:
  - problema y carencia identificados;
  - alcance funcional;
  - requisitos específicos;
  - cambios necesarios;
  - comportamiento esperado;
  - criterios de aceptación;
  - prioridad;
  - dependencias;
  - restricciones particulares y casos límite.
- No reducir una tarea detallada a un resumen genérico. Si una versión aporta requisitos que la otra no contiene, incorporarlos a la tarea unificada.
- Si existen criterios de aceptación equivalentes, consolidarlos sin perder condiciones verificables. Si evalúan comportamientos diferentes, conservar ambos.
- Mantener la prioridad más alta cuando exista una diferencia justificada por el impacto funcional o de seguridad. Si las prioridades discrepan sin una razón clara, revisar el impacto real y documentar la prioridad resultante.
- Conservar los identificadores existentes cuando resulte viable y asignar identificadores nuevos únicamente a tareas genuinamente distintas.
- Actualizar las referencias cruzadas y dependencias cuando las tareas se fusionen, dividan o reordenen.
- Si una tarea de `pendientes3.md` contiene requisitos ajenos a esta auditoría, no eliminarlos ni incorporarlos artificialmente a una tarea no relacionada. Deben conservarse en su tarea original o separarse de forma coherente si es necesario.
- Evitar alterar `Pendientes.md` y `pendientes2.md`, ya que el ámbito de este trabajo corresponde a `pendientes3.md`.
- Si las tareas contienen decisiones incompatibles, no elegir arbitrariamente una versión ni descartar requisitos sin analizar sus consecuencias. Aplicar el mecanismo de resolución de la T-UX-09.

**Cambios necesarios:**
- Comparar el backlog existente con las ocho tareas especificadas en este plan.
- Consolidar duplicados y complementar tareas parciales.
- Mantener una relación clara entre los hallazgos GAP-UX y las tareas que los resuelven.
- Revisar que ninguna de las ocho deficiencias identificadas quede sin una tarea que la cubra.
- Verificar que la consolidación no elimine capacidades existentes ni convierta requisitos verificables en formulaciones ambiguas.

**Comportamiento esperado:**
`pendientes3.md` contiene una única representación completa de cada tarea, sin duplicidades innecesarias y con todos los requisitos relevantes de ambas versiones. Las diferencias que no puedan resolverse mediante una integración compatible se identifican y se gestionan explícitamente, sin perder información.

**Criterios de aceptación:**
1. Se ha comparado cada una de las ocho tareas con todo el contenido pertinente de `pendientes3.md`.
2. Las tareas duplicadas o equivalentes se han unificado.
3. Ningún requisito específico se ha perdido durante la consolidación.
4. Las tareas que son diferentes permanecen separadas.
5. Se conservan o actualizan correctamente los identificadores y dependencias.
6. Cada GAP-UX-01 a GAP-UX-08 tiene cobertura verificable en el backlog final.
7. Las contradicciones pendientes se identifican y remiten al mecanismo de resolución de T-UX-09.
8. No se han modificado `Pendientes.md` ni `pendientes2.md`.

**Dependencias:** Contenido actual de `pendientes3.md`; T-UX-09 para resolver decisiones incompatibles.

---

### T-UX-09 [P2]. Gestión de requisitos en disputa mediante opciones configurables

**Problema que debe resolverse:**
Al unificar tareas existentes pueden aparecer contradicciones entre requisitos, propuestas o decisiones de diseño. Algunas diferencias podrían responder a preferencias institucionales legítimas y no a errores técnicos. Resolverlas mediante una elección rígida puede eliminar flexibilidad o imponer un comportamiento que no sea adecuado para todos los departamentos.

**Requisitos funcionales:**
- Identificar las contradicciones entre las tareas originales y las nuevas especificaciones, distinguiendo:
  - contradicciones técnicas reales;
  - diferencias de alcance;
  - alternativas de experiencia de usuario;
  - preferencias operativas institucionales;
  - decisiones que deben ser uniformes por motivos de seguridad, integridad de datos o consistencia.
- Cuando dos alternativas sean válidas y compatibles con la arquitectura, convertir la decisión en una opción configurable de la plataforma en lugar de descartar una alternativa sin justificación.
- Definir, para cada configuración pertinente:
  - nombre y finalidad;
  - opciones permitidas;
  - valor predeterminado;
  - alcance global, por departamento, por rol o por usuario, según corresponda;
  - permisos para modificarla;
  - comportamiento observable de cada opción;
  - criterios de aceptación para comprobarla.
- Utilizar el nivel de configuración más adecuado. Una preferencia visual individual no debe convertirse innecesariamente en una configuración institucional, y una regla que afecta a toda la institución no debe poder cambiarse libremente por cualquier usuario.
- Permitir que las opciones configurables se administren mediante la interfaz institucional correspondiente, con controles de acceso, validación y persistencia cuando la característica lo requiera.
- Si una configuración cambia, aplicar el nuevo comportamiento de forma coherente y predecible, sin alterar retroactivamente datos existentes ni interrumpir operaciones en curso.
- Documentar qué alternativa se utiliza por defecto y qué consecuencias tiene cambiarla.
- Cuando la configuración no sea apropiada, por ejemplo, si las alternativas comprometen la autorización, la confidencialidad o la integridad de los datos, resolver el conflicto mediante un requisito técnico único y explícito. La configurabilidad no debe debilitar controles de seguridad.
- Evitar crear una opción de configuración para cada diferencia menor. Solo deben configurarse las decisiones que representen alternativas funcionalmente útiles y justificadas.
- Mantener la trazabilidad entre el conflicto original, la decisión adoptada, la configuración resultante y las tareas que la implementan.

**Ejemplos de aplicación cuando el conflicto exista realmente:**
- Preferencias sobre cuándo mostrar advertencias de cambios sin guardar, siempre que no se permita descartar información silenciosamente en operaciones donde la protección sea obligatoria.
- Preferencias de presentación y agrupación de información cuando las distintas opciones mantengan el mismo significado funcional.
- Alcance de determinadas preferencias de búsqueda o visualización, si se justifica que varíen por usuario o departamento.
- Opciones de sincronización o notificación que puedan adaptarse a las necesidades operativas sin poner en riesgo la integridad de los datos.

*Estos ejemplos no implican que todas las opciones deban incorporarse: cada una debe justificarse por una contradicción o necesidad concreta detectada durante la consolidación.*

**Cambios necesarios:**
- Crear una matriz de conflictos que registre las tareas afectadas, las alternativas propuestas, sus consecuencias y la resolución.
- Identificar las alternativas susceptibles de configuración y definir su alcance.
- Reutilizar el sistema existente de configuración institucional si ya ofrece los mecanismos necesarios.
- Implementar únicamente las opciones que requieran cambios reales en la plataforma y estén vinculadas a tareas identificadas.
- Incorporar los requisitos de configuración en la tarea que implementa la funcionalidad correspondiente, además de mantener su trazabilidad en la matriz de conflictos.
- Si una decisión requiere validación institucional que no puede deducirse técnicamente, dejar explícita la decisión pendiente y proponer alternativas concretas en lugar de asumir una preferencia.

**Comportamiento esperado:**
Los conflictos se resuelven de manera explícita. Cuando sea útil y seguro, la plataforma permite elegir entre alternativas mediante opciones configurables con valores predeterminados claros. Cuando la flexibilidad comprometa requisitos esenciales, se establece una única solución técnica y se documenta la razón.

**Criterios de aceptación:**
1. Las contradicciones identificadas durante la consolidación quedan registradas.
2. Cada conflicto tiene una resolución, una decisión pendiente claramente identificada o una justificación para imponer un comportamiento único.
3. Las alternativas válidas que requieran flexibilidad se traducen en requisitos de configuración concretos.
4. Cada configuración define sus opciones, valor predeterminado, alcance y permisos.
5. Los cambios de configuración producen un comportamiento verificable.
6. Las preferencias configurables no permiten eludir controles de seguridad ni de integridad.
7. No se crean configuraciones redundantes o sin utilidad funcional.
8. Las tareas finales conservan la trazabilidad de las decisiones tomadas.

**Dependencias:** T-UX-08; sistema de configuración institucional existente, si corresponde.

---

### ORDEN DE EJECUCIÓN RECOMENDADO

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-UX-01.** Expiración de sesión | **P1** | Autenticación existente |
| **2** | **T-UX-02.** Omnibox global | **P1** | T-UX-05 |
| **3** | **T-UX-03.** Cambios sin guardar | **P2** | T-UX-01 |
| **4** | **T-UX-04.** Frescura de datos | **P2** | Consultas de los paneles |
| **5** | **T-UX-05.** Normalización de búsquedas | **P2** | Funciones actuales de búsqueda |
| **6** | **T-UX-08.** Consolidación del backlog | **P2** | `pendientes3.md` |
| **7** | **T-UX-09.** Resolución de conflictos configurables | **P2** | T-UX-08 |
| **8** | **T-UX-06.** Cola offline | **P3** | Persistencia y sincronización |
| **9** | **T-UX-07.** Agrupación de notificaciones | **P3** | Sistema de notificaciones |

---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE 4. IDENTIDAD, PERMISOS Y GOBIERNO DE LA INFORMACIÓN

### T-GOV-01 [P1] — Invalidación inmediata de sesiones y protección contra ataques de fuerza bruta

**Componentes relacionados:** `backend/user-service/Code.gs`, `js/auth.js`, `js/api.js`.

**Hallazgos convergidos:** GAP-GOV-01, GAP-GOV-03.

#### Problemas que debe resolver
- Las sesiones activas pueden seguir utilizándose después de que una cuenta sea suspendida o bloqueada.
- No existe un umbral automático de intentos fallidos que permita frenar ataques de fuerza bruta.
- La revocación de una cuenta no garantiza que sus credenciales de sesión dejen de ser válidas en todas las operaciones protegidas.

#### Requisitos funcionales

1. **Revocación de sesiones**
   - Incorporar un mecanismo centralizado para registrar la vigencia de las sesiones y su revocación, compatible con el sistema de autenticación existente.
   - Al suspender, bloquear o desactivar una cuenta (`EstadoCuenta !== "Activa"`), revocar sus sesiones activas y denegar las siguientes solicitudes protegidas.
   - Comprobar el estado vigente de la cuenta en el backend (`EstadoCuenta === "Activa"`) en cada llamada autenticada. No considerar suficiente que el navegador conserve una sesión o un rol previamente válido.
   - Aplicar el control en todos los microservicios que acepten operaciones autenticadas, incluidos los que no sean responsables de administrar usuarios.
   - Evitar que la caché del cliente, los datos persistidos localmente o una pestaña abierta permitan continuar operando con permisos revocados.

2. **Protección contra fuerza bruta**
   - Contabilizar los intentos fallidos de autenticación de manera segura en la hoja `Usuarios`, distinguiendo los fallos atribuibles a credenciales incorrectas de los errores técnicos del servicio.
   - Definir parámetros configurables en `ConfiguracionSistema` para el número máximo de intentos (por defecto 5), la ventana de evaluación (15 minutos) y la duración del bloqueo.
   - Aplicar límites adicionales por origen de solicitudes cuando sea viable, sin depender exclusivamente de la dirección IP ni permitir que un atacante bloquee indefinidamente cuentas de terceros.
   - Restablecer o reducir el contador de fallos de acuerdo con una política explícita después de una autenticación satisfactoria o del vencimiento de la ventana.
   - Proporcionar un procedimiento autorizado de recuperación o desbloqueo que no permita eludir los controles de seguridad.

3. **Trazabilidad**
   - Registrar intentos fallidos, bloqueos, desbloqueos, revocaciones y cambios de estado con fecha, usuario o identificador de cuenta, resultado y motivo en `RegistroAuditoriaEstructurado`.
   - No registrar contraseñas, tokens completos ni otros secretos de autenticación.
   - Evitar que la respuesta pública revele si una cuenta existe cuando esa información facilite la enumeración de usuarios.

4. **Configurabilidad de Opciones en Disputa / Preferencias Institucionales:**
   - Permitir configurar administrativamente en `ConfiguracionSistema` si el bloqueo por fuerza bruta es por tiempo (ej. 15 min) o requiere intervención explícita de un Administrador para desbloquear.

#### Comportamiento esperado
Una cuenta bloqueada, suspendida o desactivada deja de poder realizar operaciones protegidas sin esperar a que el usuario cierre sesión. Una cuenta sometida a intentos reiterados de autenticación queda temporalmente protegida según la política configurada.

#### Criterios de aceptación
- Una sesión previamente válida es rechazada en la siguiente solicitud protegida después de revocarse la cuenta.
- Suspender una cuenta en la hoja de usuarios revoca inmediatamente el acceso en la siguiente petición API del navegador en todos los microservicios (`USER`, `ACADEMIC`, `ACCOUNTING`, `TASK`, `EXAM`).
- Las solicitudes concurrentes no pueden mantener una sesión operativa por una condición de carrera durante la revocación.
- Se activa el bloqueo automático al alcanzar 5 intentos fallidos consecutivos e inserta un log de advertencia en `RegistroAuditoriaEstructurado`.
- Los fallos de red o del backend no incrementan incorrectamente el contador de credenciales erróneas.
- Los eventos de autenticación y revocación quedan registrados y no exponen secretos.
- Las pruebas confirman que la revocación no afecta a otras cuentas ni invalida sesiones ajenas.

#### Riesgo de Regresión
Bajo.

#### Dependencias
- Sistema actual de autenticación y sesiones.
- Modelo de estados de cuenta.
- Mecanismo común de autorización utilizado por los microservicios.
- Registro estructurado de eventos.

---

### T-GOV-02 [P1] — Validación estricta de propiedad y alcance de acceso a registros

**Componentes relacionados:** Microservicios backend, especialmente los endpoints de reportes contables y expedientes; `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`.

**Hallazgos convergidos:** GAP-GOV-06.

#### Problemas que debe resolver
Algunas consultas secundarias confían parcialmente en los identificadores `userId` o `studentId` enviados por el cliente. Esto puede permitir que una solicitud consulte datos ajenos si el backend no comprueba la relación entre el usuario autenticado y el registro solicitado.

#### Requisitos funcionales

1. **Identidad autenticada como fuente de autoridad**
   - Determinar la identidad del solicitante a partir de las credenciales validadas por el servidor, no de un identificador libre enviado por el navegador.
   - Implementar la función central `assertRecordOwnership(authRole, authenticatedUserId, targetUserId, resourceType)` en cada microservicio backend.
   - Tratar los identificadores recibidos como parámetros de selección, nunca como prueba de propiedad ni autorización.
   - Verificar en cada operación que el usuario autenticado tiene permiso para acceder al registro y realizar la acción solicitada.

2. **Reglas de acceso según el dominio**
   - **Estudiantes:** permitir el acceso a sus propios expedientes (`targetUserId === authenticatedUserId`) y a los registros expresamente autorizados para ellos.
   - **Familiares o tutores:** verificar la relación familiar vigente en `RelacionesFamiliares`, su alcance autorizado y las restricciones aplicables a cada tipo de información.
   - **Docentes:** comprobar que el docente está asignado al estudiante, grupo, curso, asignatura o período correspondiente cuando esa asignación sea necesaria.
   - **Contabilidad:** limitar el acceso según la función, el ámbito organizativo y las autorizaciones específicas para consultar, modificar, aprobar o exportar registros.
   - **Personal administrativo y de dirección:** respetar sus permisos efectivos y el ámbito institucional autorizado, sin conceder acceso irrestricto solo por pertenecer a una categoría general.
   - **Administradores:** separar la capacidad de gestionar cuentas y permisos del acceso automático a toda información confidencial cuando no sea necesario.

3. **Cobertura completa de endpoints**
   - Revisar operaciones principales y secundarias de consulta, detalle, búsqueda, filtros, paginación, reportes, estadísticas, exportación y acciones masivas.
   - Comprobar los accesos indirectos a registros mediante identificadores, relaciones, parámetros de filtros, enlaces compartidos y funciones auxiliares.
   - Aplicar la misma autorización a datos obtenidos desde paneles, tarjetas de resumen, indicadores y reportes agregados cuando estos puedan revelar información protegida.

4. **Denegación segura**
   - Denegar por defecto cuando no se pueda demostrar la autorización.
   - No devolver datos parciales sensibles antes de completar la validación.
   - Utilizar respuestas coherentes `403 Forbidden` para solicitudes no autorizadas y registrar el evento `AUTH_PERMISSION_DENIED` en auditoría sin exponer información del registro solicitado.
   - Evitar que las reglas de permisos de varios roles se combinen de manera que concedan acceso involuntario.

#### Comportamiento esperado
La autorización se determina en el servidor a partir de la identidad autenticada, los permisos efectivos, la relación con el registro y el ámbito institucional. Manipular un identificador no amplía los privilegios.

#### Criterios de aceptación
- Cambiar `userId`, `studentId` u otros identificadores en una solicitud AJAX de un estudiante devuelve error `403 Forbidden` y no permite acceder a registros ajenos.
- Las consultas familiares verifican dinámicamente la vigencia en `RelacionesFamiliares`.
- Dos usuarios con el mismo rol solo acceden a los registros autorizados para cada uno.
- Las reglas se verifican en cada endpoint, incluso cuando la interfaz oculta la función o el enlace.
- Se prueban accesos cruzados entre estudiantes, docentes, tutores, departamentos y expedientes contables.
- Búsquedas, exportaciones, reportes, paginación y estadísticas no filtran datos fuera del ámbito permitido.
- La denegación de acceso no devuelve información sensible mediante mensajes de error, totales, metadatos o diferencias de respuesta.
- Las operaciones legítimas siguen funcionando para usuarios con permisos y relaciones válidas.

#### Riesgo de Regresión
Bajo.

#### Dependencias
- Modelo de identidad, roles y ámbitos institucionales.
- Relaciones familiares, asignaciones académicas y estructura organizativa.
- Matriz de permisos del backend (`ROLE_PERMISSIONS`).
- Pruebas de seguridad existentes.

---

### T-GOV-03 [P1] — Proxy de descarga segura y autorización de adjuntos almacenados en Google Drive

**Componentes relacionados:** Almacenamiento en Drive, servicios backend que gestionan documentos (`backend/user-service/Code.gs`), formularios de carga/descarga y `js/ui-common.js`.

**Hallazgos convergidos:** GAP-GOV-09.

#### Problemas que debe resolver
Los enlaces directos de Drive no pasan necesariamente por una comprobación de autorización de la aplicación al descargar un archivo. Un usuario que obtenga o conserve el enlace podría acceder al documento sin que se comprueben su sesión y sus permisos actuales.

#### Requisitos funcionales

1. **Acceso autorizado a los documentos**
   - Implementar la operación backend de descarga `getSecureDocumentStream` que reciba un identificador interno del documento o del adjunto, no una URL pública de Drive arbitraria suministrada por el cliente.
   - Generar un token temporal firmado de descarga de un solo uso o canalizar la entrega mediante backend validado por GAS.
   - Resolver el identificador interno al archivo correspondiente y comprobar que el usuario autenticado puede leer ese documento.
   - Aplicar las reglas del expediente de origen: estudiante, familiar autorizado, docente asignado, área contable u otro ámbito aplicable.
   - Verificar la vigencia de la sesión y de los permisos en cada descarga.
   - Documentos confidenciales de orientación y salud solo son descargables por los perfiles autorizados (`Orientador`, `Director`).
   - Impedir que el cliente solicite archivos de Drive por identificadores ajenos sin pasar por la autorización del backend.

2. **Protección del almacenamiento**
   - Revisar los permisos de compartición de los archivos existentes y evitar que los documentos confidenciales queden accesibles públicamente o mediante enlaces abiertos.
   - Utilizar las credenciales y permisos mínimos necesarios para que el servicio acceda a Drive.
   - No permitir que una solicitud convierta al backend en un proxy genérico para descargar cualquier archivo o URL.
   - Mantener una relación verificable entre el archivo almacenado, el registro al que pertenece y sus permisos.
   - Gestionar documentos eliminados, movidos, archivados o sin relación válida con un expediente.

3. **Entrega y tratamiento de archivos**
   - Definir el tipo de contenido, nombre de descarga y disposición de respuesta según el tipo de archivo.
   - Validar que el documento solicitado pertenece a una categoría admitida y evitar la interpretación ejecutable de archivos no confiables en el contexto de la aplicación.
   - Evitar que errores internos expongan identificadores privados de Drive, credenciales o rutas de almacenamiento.
   - Establecer límites de tamaño y tratamiento de errores compatibles con las restricciones reales de Apps Script y Drive.
   - Si el tamaño del archivo o las limitaciones técnicas impiden una transferencia directa en el flujo, usar URL firmada temporal de expiración corta (máximo 5 minutos) conservando la autorización.

4. **Trazabilidad**
   - Registrar usuario, documento interno, fecha, resultado y contexto de la descarga cuando corresponda.
   - Registrar intentos denegados de acceso a documentos confidenciales.
   - Evitar almacenar el contenido del archivo o secretos en el registro de auditoría.

#### Comportamiento esperado
Todos los documentos privados requieren autorización vigente para ser consultados o descargados. Conocer el enlace o el identificador de Drive no concede acceso.

#### Criterios de aceptación
- Un usuario sin permisos no puede descargar un adjunto mediante la interfaz, una URL directa de la aplicación ni una solicitud manual al endpoint.
- Intentar acceder a la URL directa de Drive sin sesión activa o token válido es rechazado.
- Revocar el permiso de lectura impide las siguientes descargas.
- Los documentos privados no se vuelven públicos como consecuencia de la solución.
- Un identificador de documento alterado, inexistente o perteneciente a otro expediente es rechazado.
- Los errores de Drive no exponen credenciales, contenido confidencial ni detalles internos innecesarios.
- La descarga de documentos legítimos funciona para usuarios autorizados y los eventos relevantes quedan auditados.

#### Riesgo de Regresión
Medio.

#### Dependencias
- Modelo de permisos por registro.
- Estructura de metadatos de adjuntos.
- Acceso backend a Google Drive.
- T-GOV-02 para reutilizar las reglas de autorización sobre expedientes.

---

### T-GOV-04 [P1] — Prevención de autoaprobaciones y separación de funciones en suplencias

**Componentes relacionados:** `backend/user-service/Code.gs`, `js/teacher.js`, `FlujosAprobacion`, `AprobacionHorasExtras` y cualquier otro flujo de aprobación que admita delegaciones o suplencias.

**Hallazgos convergidos:** GAP-GOV-11.

#### Problemas que debe resolver
Un suplente puede llegar a aprobar una solicitud que él mismo creó. Esto compromete la separación de funciones y puede afectar solicitudes administrativas, laborales, financieras o de otra naturaleza que exijan aprobación independiente.

#### Requisitos funcionales

1. **Identificación de las partes**
   - Identificar al solicitante original (`solicitanteUserId`), al aprobador efectivo (`aprobadorUserId`), al titular representado y al usuario que ejecuta materialmente la operación en `processWorkflowDecision` y `reviewOvertimeRequest`.
   - Mantener separadas la identidad del usuario autenticado y la identidad de la persona en cuya representación actúa.
   - No permitir que la representación temporal cambie la autoría original de la solicitud.

2. **Regla contra autoaprobaciones**
   - Bloquear la aprobación cuando el usuario efectivo sea el mismo solicitante (`solicitanteUserId === aprobadorUserId`).
   - Bloquear también la aprobación cuando una delegación, suplencia, cambio de rol o combinación de identidades haga que el solicitante termine aprobando indirectamente su propia solicitud.
   - Evaluar la regla en el backend en el momento de aprobar, no únicamente al mostrar el botón en la interfaz.
   - Requerir derivación automática a un rol superior o colega del mismo nivel cuando exista conflicto de interés o auto-aprobación.
   - Aplicar la restricción a todos los estados y rutas de aprobación que puedan producir el mismo resultado, incluidas operaciones secundarias o administrativas.
   - Si una política institucional admite excepciones, estas deben configurarse administrativamente, requerir una autoridad independiente y quedar auditadas.

3. **Integridad del flujo**
   - Comprobar que la delegación está vigente y cubre el flujo, ámbito y acción concretos.
   - Impedir que el suplente amplíe su propia autorización, delegue a su vez sin permiso o apruebe una operación fuera de su alcance.
   - Preservar la secuencia de estados, la identidad del solicitante y las aprobaciones previas.
   - Definir el comportamiento cuando el aprobador asignado cambia mientras una solicitud está pendiente.

4. **Auditoría**
   - Registrar intentos de autoaprobación bloqueados en la bitácora de auditoría como `AUTO_APPROVAL_BLOCKED`.
   - Registrar aprobaciones válidas realizadas por suplentes y excepciones autorizadas, conservando la identidad del actor efectivo y la del titular representado.

#### Comportamiento esperado
Un usuario no puede autorizar su propia solicitud mediante una suplencia ni por medio de una ruta alternativa del backend. Las aprobaciones válidas mantienen una separación verificable entre solicitante y aprobador.

#### Criterios de aceptación
- Se rechaza una autoaprobación directa o indirecta mediante suplencia, delegación o cambio de rol.
- Intentar aprobar un trámite donde el aprobador activo es el mismo creador del trámite devuelve un error impidiendo la acción.
- Se rechaza la aprobación cuando la delegación ha expirado, fue revocada o no cubre la acción.
- La interfaz informa que la operación no puede aprobarse sin revelar datos que no correspondan al usuario.
- Una aprobación válida de un suplente autorizado sigue funcionando.
- Las pruebas cubren flujos de horas extras y los demás procesos que empleen el mismo mecanismo.
- Los eventos bloqueados (`AUTO_APPROVAL_BLOCKED`) y las aprobaciones realizadas quedan asociados a las identidades correctas en auditoría.

#### Riesgo de Regresión
Bajo.

#### Dependencias
- Modelo de delegaciones y suplencias.
- Identidad autenticada y registro de autoría.
- Mecanismos de aprobación existentes (`FlujosAprobacion`, `AprobacionHorasExtras`).
- Registro estructurado de auditoría.

---

### T-GOV-05 [P2] — Sincronización inmediata de permisos, actualización de roles y recuperación de sesión

**Componentes relacionados:** `js/auth.js`, `js/api.js`, `js/ui-common.js`, `backend/user-service/Code.gs` y microservicios secundarios.

**Hallazgos convergidos:** GAP-GOV-04, GAP-GOV-18.

#### Problemas que debe resolver
Las vistas del navegador pueden conservar permisos antiguos después de una reasignación de rol. Además, una respuesta HTTP 401 no cuenta con un proceso uniforme de renovación de credenciales y recuperación de la solicitud.

#### Requisitos funcionales

1. **Sincronización de permisos en caliente**
   - Inyectar en las respuestas API la versión/hash de permisos activos (`userPermissionsVersion`).
   - Incorporar un mecanismo para detectar cambios de roles, estado de cuenta o permisos efectivos y marcar como obsoletas las autorizaciones almacenadas en el cliente (`localStorage` / `sessionStorage`).
   - Actualizar el contexto de autorización al cambiar los permisos y refrescar automáticamente el menú de navegación con `window.initRoleNavigationMenu()`.
   - Si el cambio amplía privilegios, exigir que el backend valide los nuevos permisos antes de ejecutar operaciones adicionales.
   - Si el cambio reduce o revoca privilegios, bloquear inmediatamente las acciones afectadas y eliminar de la vista los datos que ya no deban permanecer accesibles.
   - No depender de una recarga manual del navegador para aplicar cambios de autorización.

2. **Renovación de credenciales y reintentos**
   - Definir un procedimiento común en `js/api.js` para responder a credenciales expiradas y errores 401.
   - Renovar la sesión únicamente mediante un mecanismo de autenticación válido y autorizado.
   - Si una petición 401/403 ocurre por permisos desactualizados, `js/api.js` reintenta la petición tras refrescar el contexto sólo cuando sea seguro.
   - No repetir automáticamente operaciones de escritura, aprobación, eliminación o cobro que pudieran haberse ejecutado antes de producirse el error.
   - Diferenciar credenciales expiradas, sesiones revocadas, permisos insuficientes y fallos técnicos, evitando bucles de reintentos.
   - Si no se puede renovar la sesión, limpiar el estado autenticado del cliente y solicitar que el usuario vuelva a autenticarse (integrado con T-UX-01).

3. **Coherencia entre servicios**
   - Aplicar un tratamiento uniforme de los errores de autenticación y autorización en todos los microservicios (`USER`, `ACADEMIC`, `ACCOUNTING`, `TASK`, `EXAM`).
   - Evitar que cada módulo mantenga reglas diferentes para actualizar o recuperar la sesión.
   - Mantener las verificaciones de autorización en el servidor aunque el cliente refresque sus datos correctamente.

#### Comportamiento esperado
Los cambios de rol se reflejan en la interfaz y en el backend sin requerir una nueva sesión manual. Las solicitudes con credenciales expiradas se recuperan cuando sea seguro y posible, sin duplicar operaciones.

#### Criterios de aceptación
- Reasignar un rol en el backend actualiza la navegación e interfaz del usuario de forma transparente en su siguiente interacción.
- Una reducción de privilegios impide continuar utilizando las funciones revocadas desde una página abierta.
- Una ampliación de privilegios solo se hace efectiva después de ser confirmada por el backend.
- Un error 401 provoca como máximo el proceso de recuperación definido, sin ciclos infinitos.
- Las solicitudes no idempotentes no se duplican por reintentos automáticos.
- Los cinco microservicios se comportan de forma coherente ante expiración, revocación y falta de permisos.

#### Riesgo de Regresión
Bajo.

#### Dependencias
- T-GOV-01 para revocación de sesiones.
- Sistema de autenticación y mecanismo de renovación disponible.
- Matriz de permisos central y respuestas normalizadas de backend.

---

### T-GOV-06 [P2] — Protección de datos personales (PII) y límites seguros de exportación

**Componentes relacionados:** `backend/user-service/Code.gs`, `js/ui-common.js`, consultas generales de personas y usuarios, endpoints de exportación, reportes, tablas administrativas.

**Hallazgos convergidos:** GAP-GOV-07, GAP-GOV-08.

#### Problemas que debe resolver
Los números de identidad y teléfonos se muestran sin enmascaramiento parcial en consultas generales. Además, no hay un límite máximo de registros de exportación parametrizado y aplicado por el servidor.

#### Requisitos funcionales

1. **Enmascaramiento de información personal (PII)**
   - Aplicar función helper `maskPII(text, type)` para ocultar dígitos centrales de números de identidad (ej. `0801-****-12345`) y teléfonos en vistas generales y no administrativas.
   - Permitir la visualización completa únicamente a roles autorizados (`Administrador`, `Recursos Humanos`, `Director`), en contextos donde sea necesaria.
   - Aplicar el mismo criterio en tablas, detalles, búsquedas, sugerencias, paneles, reportes y exportaciones.
   - No considerar el enmascaramiento visual suficiente para proteger datos que el backend ya ha enviado innecesariamente al navegador: el servidor enmascara los datos antes de enviarlos según el rol.

2. **Control de exportaciones parametrizado**
   - Parametrizar en `ConfiguracionSistema` el límite máximo de filas por exportación a Excel/PDF (ej. máximo 1,000 registros por descarga por defecto).
   - Validar y aplicar los límites en el backend, independientemente de los parámetros enviados por el cliente.
   - Aplicar los filtros de autorización por registro antes de construir el archivo de exportación.
   - Proporcionar paginación o división en lotes cuando el volumen exceda el límite admitido.
   - Registrar en auditoría quién exportó, cuándo, qué categoría de información se exportó, el volumen exacto y el resultado.

3. **Experiencia de uso**
   - Explicar cuando una exportación supera los límites y ofrecer una alternativa compatible, como filtros más precisos o lotes autorizados.
   - Advertir cuando la exportación incluya datos confidenciales.

#### Comportamiento esperado
Los usuarios ven solo los datos personales necesarios para su función. Las exportaciones respetan los permisos por registro y los límites de volumen aunque el cliente sea manipulado.

#### Criterios de aceptación
- Docentes y usuarios ordinarios ven números de identidad enmascarados (`0801-****-12345`) en consultas generales; Administradores y Recursos Humanos ven la PII completa.
- El backend no devuelve campos sensibles desmascarados a roles no autorizados.
- Intentos de exportar más del límite parametrizado en `ConfiguracionSistema` se dividen en lotes o requieren confirmación.
- Alterar el límite desde el navegador no permite descargar más registros de los autorizados en el servidor.
- Las exportaciones quedan auditadas y no exponen información de otros ámbitos institucionales.

#### Riesgo de Regresión
Nulo.

#### Dependencias
- Matriz de permisos por campo y por registro.
- Endpoints actuales de consulta y exportación.
- Registro estructurado de auditoría.

---

### T-GOV-07 [P2] — Archivo histórico, depuración lógica y alertas de auditoría

**Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/ui-common.js`, almacenamiento académico y registro de auditoría.

**Hallazgos convergidos:** GAP-GOV-14, GAP-GOV-16.

#### Problemas que debe resolver
No existe una interfaz para gestionar el archivo histórico y la depuración lógica de expedientes de graduados. Tampoco hay alertas automáticas ante volúmenes anómalos de eventos de severidad WARN o ERROR.

#### Requisitos funcionales

1. **Gestión de expedientes históricos y archivo**
   - Incorporar una interfaz administrativa y endpoint `archiveStudentRecords` para localizar, revisar y gestionar expedientes elegibles para archivo (graduados/retirados).
   - Permitir filtrar por estado académico, año de graduación, período y categoría.
   - Mostrar una vista previa de los expedientes seleccionados y el número de registros afectados antes de ejecutar una operación masiva.
   - Trasladar o marcar con estado `Archivado` los expedientes inactivos.
   - Mantener los expedientes archivados en modo de solo lectura para usuarios ordinarios y habilitar su consulta a usuarios autorizados.
   - Preservar intactos e inalterados las calificaciones, historiales académicos, certificados, relaciones necesarias y evidencias de respaldo (`createSystemBackup` / `restoreSystemBackup`).

2. **Retención, eliminación lógica y restauración**
   - Definir políticas de conservación por categoría documental y estado.
   - Permitir marcar registros para eliminación lógica, restaurarlos cuando proceda y ejecutar una eliminación definitiva solo mediante un proceso autorizado.
   - Exigir una vista previa y una confirmación explícita para operaciones masivas.
   - Comprobar las relaciones dependientes antes de eliminar registros para evitar historiales incompletos o referencias rotas.

3. **Alertas de auditoría automáticas**
   - Configurar alertas por correo/notificación a administradores cuando `RegistroAuditoriaEstructurado` registre un volumen anómalo superior a 10 eventos `WARN` o `ERROR` en menos de 5 minutos.
   - Agrupar eventos repetidos para evitar ráfagas descontroladas de mensajes.
   - Incluir en la alerta la categoría del evento, el servicio, el intervalo afectado, la severidad y referencia sin exponer PII o secretos.

#### Comportamiento esperado
Los expedientes históricos pueden archivarse y consultarse de forma controlada sin perder su integridad. Ráfagas de eventos anómalos en la auditoría generan alertas útiles en el panel directivo.

#### Criterios de aceptación
- Estudiantes archivados no figuran en listas activas de asistencia o cobros del periodo actual, pero sus certificados e historial histórico permanecen 100% consultables.
- Un usuario sin permisos no puede archivar, restaurar ni eliminar expedientes mediante solicitudes directas.
- El archivo no modifica calificaciones ni relaciones históricas que deban preservarse.
- Ráfagas de errores (`>10 WARN/ERROR` en 5 min) en el backend disparan una notificación automática en el panel directivo.
- Se puede consultar la trazabilidad de las operaciones de archivo, restauración, eliminación y alertas.

#### Riesgo de Regresión
Bajo.

#### Dependencias
- Modelo académico e historial de expedientes.
- Sistema de copias de seguridad y restauración (`createSystemBackup` / `restoreSystemBackup`).
- Registro de auditoría y canales de notificación disponibles.

---

### T-GOV-08 [P3] — Mejoras de administración visual, representación, simulador de permisos y confirmaciones críticas

**Componentes relacionados:** `js/ui-common.js`, `#modal-dashboard-settings`, vistas administrativas, HTML Dashboards y flujos de suplencia.

**Hallazgos convergidos:** GAP-GOV-05, GAP-GOV-13, GAP-GOV-15, GAP-GOV-17, GAP-GOV-19.

#### Problemas que debe resolver
La interfaz no identifica claramente el cargo secundario activo, no muestra cuándo un usuario opera en representación de otro, carece de un filtro por horas exactas en el panel de auditoría y no ofrece un simulador integrado de permisos efectivos. Las eliminaciones masivas tampoco exigen escribir una confirmación explícita.

#### Requisitos funcionales

1. **Identificación de cargos e indicador de representación**
   - Mostrar los roles y cargos asociados a la cuenta. Identificar de manera visible el cargo secundario o contexto activo cuando existan múltiples asignaciones.
   - Mostrar un badge flotante destacado (`En representación de [Nombre]`) cuando una acción se ejecute bajo una delegación/suplencia activa. Retirar el indicador cuando la delegación expire o sea revocada.

2. **Filtro temporal de auditoría por hora exacta**
   - Añadir filtros de fecha y hora exacta (inicio y fin) en el panel de auditoría de logs, permitiendo rangos que crucen la medianoche.
   - Ejecutar el filtrado en el backend cuando el volumen de registros lo requiera (`getStructuredLogs`).

3. **Simulador de permisos efectivos**
   - Añadir una pestaña/herramienta "Simulador de Permisos Efectivos" en el panel de configuración global (`#modal-dashboard-settings`) para seleccionar un usuario y consultar sus permisos efectivos por módulo, recurso, acción y ámbito.
   - Distinguir permisos concedidos, denegados y su origen (rol, asignación, suplencia vigente). Su función es puramente diagnóstica y no modifica permisos.

4. **Confirmaciones críticas para borrados masivos**
   - Exigir que el usuario escriba explícitamente la palabra `ELIMINAR` en el modal de confirmación antes de habilitar el botón de borrado masivo o purga de registros.
   - Deshabilitar la confirmación si no se puede calcular o validar el alcance de la operación. Revalidar siempre la confirmación en el backend.

#### Comportamiento esperado
La interfaz deja claro en qué contexto actúa el usuario, facilita el diagnóstico de permisos efectivos, mejora la precisión de auditoría y previene eliminaciones masivas accidentales.

#### Criterios de aceptación
1. Los usuarios con múltiples cargos pueden identificar el contexto activo, y las acciones bajo suplencia muestran claramente el distintivo `En representación de [Nombre]`.
2. El panel de auditoría filtra correctamente por hora y fecha exactas.
3. El simulador de permisos indica exactamente por qué regla o rol un usuario tiene o no acceso a una función.
4. El botón "Confirmar Eliminación" en borrados masivos permanece deshabilitado hasta escribir exactamente `ELIMINAR`.
5. Alterar la interfaz no permite eludir la validación del backend.

#### Riesgo de Regresión
Nulo.

#### Dependencias
- Matriz de permisos efectiva y configuración de roles.
- Registro de auditoría.
- Modelo de delegaciones y suplencias.

---

### T-GOV-09 [P2] — Notificaciones de cambios de cuenta y suplencias, y avisos de consulta de información confidencial

**Componentes relacionados:** `backend/user-service/Code.gs`, `js/auth.js`, `js/ui-common.js`, servicios de notificaciones disponibles, registros de cuentas y delegaciones.

**Hallazgos convergidos:** GAP-GOV-02, GAP-GOV-10, GAP-GOV-12.

#### Problemas que debe resolver
- No se notifica automáticamente al usuario cuando cambia el estado de su cuenta.
- La revocación anticipada de una suplencia no genera una notificación específica al usuario delegado.
- La interfaz no advierte expresamente cuando se consultan datos confidenciales de salud u orientación.

#### Requisitos funcionales

1. **Notificaciones sobre cambios de cuenta**
   - Generar una notificación cuando una cuenta pase a estado suspendido, bloqueado, desactivado o sea reactivada.
   - Incluir el tipo de cambio, su fecha e instrucciones disponibles para solicitar aclaración o recuperación de acceso, cuando corresponda.
   - No incluir contraseñas, tokens, información confidencial de terceros ni detalles técnicos que faciliten ataques.
   - Diferenciar los cambios ejecutados por un administrador de los bloqueos automáticos por seguridad.
   - Registrar el resultado del envío en auditoría sin revertir la medida de seguridad si la notificación falla.

2. **Notificaciones de suplencias y delegaciones**
   - Notificar al delegado y al titular representado cuando una suplencia sea revocada antes de su vencimiento.
   - Informar el momento en que deja de estar vigente y las consecuencias para las operaciones pendientes.
   - Registrar la revocación y el intento de notificación en auditoría.

3. **Avisos de consulta de información confidencial**
   - Mostrar una advertencia o aviso contextual explícito al acceder a expedientes clasificados como información confidencial de salud, orientación psicológica u otras categorías protegidas.
   - Explicar que el acceso está restringido a fines institucionales autorizados y sujeto a las políticas aplicables.
   - No considerar que cerrar el aviso concede permisos ni sustituye la autorización del backend.

4. **Gestión de notificaciones y configurabilidad de canales**
   - Utilizar los canales disponibles (correo, notificación en app, SMS) con posibilidad de configurar los avisos.
   - Evitar mensajes duplicados por reintentos o ejecuciones repetidas.

#### Comportamiento esperado
Los usuarios reciben información oportuna sobre los cambios que afectan a sus cuentas y delegaciones. Las consultas de información confidencial se acompañan de avisos claros de privacidad.

#### Criterios de aceptación
1. Cambios de estado en la cuenta generan la notificación correspondiente al usuario.
2. La revocación anticipada de una suplencia notifica al delegado e inhabilita las acciones asociadas.
3. Un fallo en el envío de correo no revierte el bloqueo o suspensión aplicado por seguridad.
4. Avisos de confidencialidad aparecen al consultar registros de salud u orientación sin revelar PII en la advertencia.
5. Los eventos y notificaciones quedan registrados en `RegistroAuditoriaEstructurado`.

#### Riesgo de Regresión
Nulo.

#### Dependencias
- Modelo de estados de cuenta.
- Sistema de delegaciones y suplencias.
- Servicio de notificaciones (`BandejaNotificaciones`, `sendMultiChannelNotification`).
- Registro estructurado de auditoría.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE 4

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-GOV-01.** Invalidation de sesión y fuerza bruta | **P1** | Autenticación existente |
| **2** | **T-GOV-02.** Validación estricta de propiedad (ownership check) | **P1** | RBAC del backend GAS |
| **3** | **T-GOV-04.** Bloqueo de auto-aprobación en suplencias | **P1** | `FlujosAprobacion` |
| **4** | **T-GOV-03.** Proxy seguro de descarga en Drive | **P1** | Gestión documental |
| **5** | **T-GOV-05.** Sincronización en caliente de permisos | **P2** | `js/api.js` / `js/auth.js` |
| **6** | **T-GOV-06.** Enmascaramiento PII y límites de exportación | **P2** | `js/ui-common.js` |
| **7** | **T-GOV-07.** Archivo histórico y alertas de auditoría | **P2** | `getStructuredLogs` |
| **8** | **T-GOV-09.** Notificaciones de cuenta, suplencias y privacidad | **P2** | `sendMultiChannelNotification` |
| **9** | **T-GOV-08.** Badges de representación, simulador y confirmaciones | **P3** | UI de modales |

EOF
