# REGISTRO DE TAREAS PENDIENTES DE RESOLUCIÓN, OPTIMIZACIÓN Y MEJORA - FASE 3, FASE 4 Y FASE 5

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
Una búsqueda flexible encuentra registros equivalentes aunque existan diferencias de mayúsculas, acentos o espacios irrelevantes. Los identificadores exactos mantienen sus reglas strictly y no se mezclan con coincidencias aproximadas.

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
La interfaz deja claro en qué contexto actúa el usuario, facilita el diagnóstico de permisos efectivos, mejora la precisión de auditoría y previene eliminaciones masivas accidentalmente.

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

---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE 5. ADMISIONES, ASPIRANTES Y PORTAL DE FAMILIAS

### T-ADM-01 [P1] — Control transaccional de concurrencia en cupos y conversión de admitidos

**Componentes involucrados:** `backend/academic-service/Code.gs` (`convertAdmissionToStudent`, `createAdmissionRequest`, `checkCapacity`), hojas `SolicitudesAdmision`, `ExpedientesEstudiantes`, `Personas`, `RelacionesFamiliares` y estructuras de matrícula o cupos.

**Problema detectado:**
La conversión de aspirantes admitidos presenta protección contra duplicados, pero carece de un bloqueo transaccional explícito mediante `LockService.getScriptLock()`. La validación de cupos tampoco garantiza que dos solicitudes simultáneas no ocupen el mismo último espacio disponible. Existe riesgo de inconsistencia bajo alta concurrencia.

**Requisitos funcionales:**
1. Implementar control de concurrencia en las operaciones críticas de asignación de cupos y conversión de aspirantes.
2. Utilizar `LockService.getScriptLock()` con un tiempo máximo de espera configurable (por defecto 10,000 ms) o explícitamente definido.
3. Dentro del bloqueo, volver a consultar el estado real de la solicitud, la existencia de una matrícula previa y la disponibilidad de cupos. No confiar en una comprobación realizada antes de adquirir el bloqueo.
4. Garantizar que una solicitud solo pueda generar una matrícula activa y un expediente estudiantil correspondiente.
5. Garantizar que cada cupo se reserve o consuma una sola vez, incluso cuando se reciban solicitudes simultáneas, se repitan peticiones por errores de red o se ejecuten procesos masivos.
6. Distinguir entre cupos disponibles, reservados temporalmente, ocupados y liberados.
7. Definir cuándo se consume definitivamente un cupo y cuándo se libera. Una oferta enviada, una oferta aceptada y una matrícula formalizada no deben considerarse equivalentes automáticamente.
8. Mantener la idempotencia de `convertAdmissionToStudent`: repetir una operación completada debe devolver el resultado existente o un estado equivalente, sin generar identidades, expedientes, matrículas, cargos o relaciones duplicadas.
9. Evitar mantener el bloqueo durante llamadas externas, envío de correos, cargas de archivos u operaciones lentas.
10. Registrar el identificador de solicitud, resultado, asignación de cupo y errores relevantes en auditoría.
11. Ante un bloqueo no adquirido, informar que la operación no pudo completarse por concurrencia y permitir un reintento seguro.
12. Implementar una estrategia de recuperación de operaciones parciales entre servicios.

**Criterios de aceptación:**
- Dos solicitudes simultáneas para el último cupo no producen sobrecupo.
- Dos conversiones simultáneas de un mismo aspirante generan una sola matrícula y un solo expediente.
- Los reintentos después de un tiempo de espera agotado no duplican registros.
- Un fallo intermedio no deja una matrícula activa sin su expediente o sus relaciones requeridas.
- Las operaciones masivas procesan correctamente los aspirantes válidos y registran los fallos individuales.
- Los cupos reservados, consumidos y liberados se contabilizan de manera coherente.
- Se mantienen las pruebas existentes de idempotencia, recuperación y preservación de expedientes históricos.

**Riesgo de Regresión:** Bajo.
**Dependencias:** Revisión de la estructura actual de cupos y matrícula; coordinación con T-ADM-02.

---

### T-ADM-02 [P1] — Flujo completo de revisión, aprobación y rechazo de documentos de admisión

**Componentes involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/student.js`, `js/teacher.js`, `js/api.js`, `js/ui-common.js`, `student-dashboard.html`, `teacher-dashboard.html`, hoja `SolicitudesAdmision` y almacenamiento de documentos en Google Drive.

**Problema detectado:**
Las solicitudes permiten adjuntar documentos, pero no existe un flujo administrativo completo para revisarlos y aprobarlos o rechazarlos con un motivo obligatorio. El mecanismo de descarga de Drive requiere revisión de seguridad y experiencia de usuario.

**Requisitos funcionales:**
1. Mostrar, para cada solicitud, un inventario de documentos requeridos, recibidos, pendientes, aprobados, rechazados y sujetos a nueva entrega.
2. Permitir configurar requisitos documentales por período de admisión, grado, nivel o programa (`RevisionesDocumentalesAdmision`).
3. Diferenciar documentos obligatorios y opcionales. La ausencia de un documento opcional no debe bloquear la solicitud.
4. Proporcionar al personal acciones explícitas para: Aprobar, Rechazar (motivo obligatorio), Solicitar corrección/nueva versión, Marcar como pendiente de revisión, y Registrar observaciones internas.
5. Mostrar al responsable familiar el estado de cada documento y las instrucciones concretas para corregir los rechazados.
6. Permitir volver a cargar un documento rechazado sin obligar a completar nuevamente toda la solicitud.
7. Conservar las versiones anteriores y su historial en Drive sin reemplazar silenciosamente los archivos revisados.
8. Registrar usuario revisor, fecha/hora, estado anterior, estado nuevo, motivo y versión del archivo revisado.
9. Validar archivos recibidos: tipo permitido, tamaño máximo, integridad básica y errores de carga.
10. Proteger los documentos mediante permisos de mínimo privilegio y proxy de descarga autenticado.
11. Mantener accesibles los documentos después de convertir al aspirante en estudiante.

**Criterios de aceptación:**
- Un usuario autorizado puede aprobar un documento y el sistema registra quién lo hizo y cuándo.
- No se puede rechazar un documento sin un motivo comprensible.
- La familia puede consultar el motivo y enviar una nueva versión.
- Las versiones anteriores y sus decisiones siguen disponibles para los usuarios autorizados.
- Una persona ajena a la solicitud no puede consultar ni descargar sus documentos manipulando identificadores.
- Los archivos inválidos o corruptos no se marcan como recibidos y aprobados.
- La conversión a estudiante conserva los documentos y su historial.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-01 para requisitos previos de conversión; T-ADM-06 para integración con borradores.

---

### T-ADM-03 [P1] — Verificación estricta y segura del código de vinculación familiar

**Componentes involucrados:** `backend/user-service/Code.gs`, `js/auth.js`, `js/api.js`, `js/student.js`, hojas `Personas`, `Usuarios`, `RelacionesFamiliares` y `ResponsablesTutores`.

**Problema detectado:**
La vinculación de responsables con estudiantes debe exigir un token/código de vinculación verificado enviado por la institución para evitar que un usuario reclame el acceso a un expediente con solo conocer su nombre o DNI.

**Requisitos funcionales:**
1. Generar códigos o tokens temporales de vinculación de 6 dígitos (`CodigoVinculacionFamilia`) con suficiente aleatoriedad y resistencia a adivinación.
2. Asociar cada código a un estudiante/aspirante específico, al propósito de la vinculación y al responsable previsto.
3. Establecer fecha de expiración configurable, número máximo de usos (de un solo uso por defecto) y límite de intentos fallidos.
4. Invalidar el código después de una vinculación exitosa y permitir revocarlo administrativamente.
5. Verificar el código en el backend, no únicamente en JavaScript del navegador.
6. Evitar que las respuestas de error revelen si un estudiante, correo o código específico existe.
7. Exigir autenticación de la persona responsable y validar su identidad.
8. Permitir que un responsable tenga varios hijos y un estudiante varios responsables, conservando las relaciones independientes.
9. Registrar la creación, aceptación, rechazo, revocación y modificación de cada relación.

**Criterios de aceptación:**
- Los códigos vencidos, revocados o consumidos no pueden reutilizarse.
- Intentos repetidos fallidos se limitan y registran.
- No es posible acceder a expedientes antes de completar la vinculación autorizada.
- Un responsable puede consultar todos sus hijos autorizados sin acceder a los de otra persona.
- Revocar una relación impide el acceso posterior en todos los microservicios.

**Riesgo de Regresión:** Bajo.
**Dependencias:** Permisos del portal familiar y funciones de propiedad de registros.

---

### T-ADM-04 [P2] — Módulo de agendamiento de entrevistas y evaluaciones de aspirantes

**Componentes involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/student.js`, `js/teacher.js`, `js/api.js`, `teacher-dashboard.html`, `student-dashboard.html`.

**Problema detectado:**
Falta un flujo completo para programar entrevistas, asignar docentes evaluadores y registrar resultados mediante una rúbrica de evaluación estructurada.

**Requisitos funcionales:**
1. Configurar tipos de evaluación (entrevista familiar, evaluación pedagógica, prueba diagnóstica) y asociarlos con grados/programas.
2. Configurar rúbricas con criterios, descripciones, escalas de puntuación y ponderaciones.
3. Permitir crear citas (`EntrevistasEvaluacionesAdmision`) vinculadas a una solicitud y asignar uno o varios evaluadores autorizados.
4. Consultar disponibilidad y detectar conflictos de horario para evaluadores y espacios físicos.
5. Permitir reprogramaciones y cancelaciones conservando el historial y motivo.
6. Notificar a la familia y al evaluador cuando se programe, modifique o cancele una cita.
7. Presentar al evaluador la rúbrica correspondiente, registrar puntuaciones por criterio, comentarios y recomendación final (Admitir, Lista de Espera, Rechazar).
8. Diferenciar observaciones internas de los resultados comunicables a la familia.
9. Mantener un historial de cambios y correcciones en la evaluación.

**Criterios de aceptación:**
- Se puede programar una entrevista y asignar un evaluador autorizado.
- El sistema detecta conflictos de agenda según recursos disponibles.
- La reprogramación conserva la cita anterior y su motivo.
- La rúbrica valida puntuaciones, campos obligatorios y ponderaciones.
- Los resultados quedan vinculados a la solicitud y al evaluador sin revelar notas internas a la familia.

**Riesgo de Regresión:** Nulo.
**Dependencias:** T-ADM-07 para reflejar citas en el seguimiento de la solicitud.

---

### T-ADM-05 [P2] — Expiración automática de ofertas de admisión y gestión de respuestas

**Componentes involucrados:** `backend/academic-service/Code.gs`, `js/student.js`, servicios de comunicación, hojas `SolicitudesAdmision`, `ExpedientesEstudiantes`.

**Problema detectado:**
Las ofertas de admisión pueden permanecer abiertas indefinidamente si la familia no responde, bloqueando la liberación del cupo para aspirantes en lista de espera.

**Requisitos funcionales:**
1. Registrar en cada oferta la fecha de emisión, fecha límite de respuesta (`FechaExpiracionOferta`), estado y condiciones.
2. Calcular el plazo de 15 días hábiles excluyendo fines de semana y festivos configurados en el calendario institucional.
3. Ejecutar un proceso automático periódico mediante activador (Trigger) de Apps Script.
4. Enviar recordatorios configurables a la familia 3 días antes del vencimiento.
5. Al cumplir el plazo, marcar la oferta como `OfertaExpirada` y liberar el cupo reservado para la lista de espera.
6. No expirar ofertas aceptadas, rechazadas o canceladas previamente.
7. Notificar a la familia cuando la oferta venza y permitir que personal autorizado registre una prórroga o reapertura justificada.
8. Permitir la aceptación o rechazo explícito desde el portal familiar.

**Criterios de aceptación:**
- El cálculo excluye fines de semana y festivos configurados.
- Las ofertas no contestadas dentro del plazo pasan automáticamente a `OfertaExpirada`.
- Ejecutar el proceso periódico no genera transiciones ni avisos duplicados.
- La expiración libera el cupo reservado y permite notificar al siguiente candidato de la lista de espera.
- Las prórrogas quedan registradas y requieren permisos adecuados.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-01 para gestión de cupos; T-ADM-07 para estado de ofertas.

---

### T-ADM-06 [P2] — Guardado y recuperación de borradores de solicitudes de admisión

**Componentes involucrados:** `backend/academic-service/Code.gs`, `js/student.js`, `js/api.js`, `js/ui-common.js`, `student-dashboard.html`, IndexedDB / hoja `SolicitudesAdmision`.

**Problema detectado:**
Los formularios extensos de admisión se pierden si el usuario abandona la página o pierde la conexión antes de enviar la solicitud definitiva.

**Requisitos funcionales:**
1. Permitir guardar la solicitud como borrador (`BorradoresSolicitudAdmision` en IndexedDB local o tabla remota) sin exigir todos los campos obligatorios del envío final.
2. Generar un identificador estable para cada borrador y permitir recuperarlo mediante la cuenta autenticada.
3. Guardar el progreso de cada sección, campos completados y requisitos documentales asociados.
4. Mostrar un indicador claro del progreso, secciones incompletas y requisitos pendientes.
5. Permitir retomar el formulario desde la última sección guardada.
6. Diferenciar claramente los estados Borrador, Enviada, En Revisión, etc.
7. Al presionar "Enviar Definitivo", ejecutar las validaciones completas de campos obligatorios en el backend.
8. Evitar que un doble clic o reintento cree solicitudes definitivas duplicadas.

**Criterios de aceptación:**
- Un formulario incompleto puede guardarse como borrador y reanudarse posteriormente.
- Los borradores no figuran como solicitudes enviadas en el panel administrativo.
- Los errores de conexión se muestran claramente y no producen pérdida silenciosa de datos.
- El envío definitivo valida nuevamente todos los campos obligatorios en el servidor.
- Los borradores de otros usuarios no se pueden consultar manipulando identificadores.

**Riesgo de Regresión:** Nulo.
**Dependencias:** T-ADM-02 para integrar documentos; T-ADM-07 para reportes.

---

### T-ADM-07 [P3] — Embudo visual de admisiones e historial de comunicaciones por aspirante

**Componentes involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/teacher.js`, `js/student.js`, `js/ui-common.js`, `teacher-dashboard.html`, `generateInstitutionalReport`.

**Problema detectado:**
La plataforma carece de una visualización gráfica completa del embudo de admisiones y de un historial unificado de comunicaciones enviadas/fallidas por aspirante.

**Requisitos funcionales:**
1. Mostrar el número de aspirantes por etapa del proceso (Borrador, Enviada, En Evaluación, Lista de Espera, Oferta Emitida, Aceptada, Rechazada, Matriculado) en un gráfico de embudo utilizando `renderUniversalConfigurableChart`.
2. Evitar contar una misma solicitud varias veces y calcular tasas de conversión entre etapas.
3. Permitir filtrar por período, año lectivo, grado y programa.
4. Registrar el historial de comunicaciones por aspirante: tipo de mensaje, destinatario, fecha, canal, resultado del envío y contenido/plantilla utilizada.
5. Diferenciar mensajes internos de notas visibles para las familias.
6. Permitir reintentar envíos fallidos sin duplicar notificaciones.

**Criterios de aceptación:**
1. El personal de admisiones visualiza el embudo de conversión y sus tasas filtrado por año y grado.
2. Cada comunicación queda vinculada al expediente del aspirante con su estado exacto de entrega.
3. Los usuarios sin permisos no pueden consultar datos de contacto o mensajes de otros aspirantes.

**Riesgo de Regresión:** Nulo.
**Dependencias:** T-ADM-04, T-ADM-05, T-ADM-06.

---

### T-ADM-08 [P2] — Vista unificada y contextual del portal de familias

**Componentes involucrados:** `student-dashboard.html`, `js/student.js`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, hojas `RelacionesFamiliares`, `ResponsablesTutores`, `ExpedientesEstudiantes`.

**Problema detectado:**
Mejorar el contenedor `#family-consolidated-summary-container` y la función `getGuardianStudents` para brindar una experiencia de usuario unificada que diferencie claramente entre aspirantes en proceso de admisión y estudiantes activos matriculados.

**Requisitos funcionales:**
1. Presentar tarjetas independientes por hijo vinculado a la cuenta familiar.
2. Permitir conmutar entre hijos sin mezclar expedientes, calificaciones, pagos, documentos ni notificaciones.
3. Para aspirantes: mostrar el estado de la solicitud, requisitos pendientes, documentos rechazados, fechas de evaluación y ofertas activas.
4. Para estudiantes matriculados: mostrar secciones académicas, tareas, asistencia, estado de cuenta y avisos del período activo.
5. Permitir que los errores de un servicio secundario (ej. finanzas) no bloqueen el acceso a las demás secciones independientes.

**Criterios de aceptación:**
- Un responsable con varios hijos ve únicamente los perfiles vinculados y autorizados.
- Conmutar entre hijos limpia el contexto sin dejar datos residuales del estudiante anterior.
- La interfaz se adapta correctamente a dispositivos móviles y escritorio.

**Riesgo de Regresión:** Nulo.
**Dependencias:** T-ADM-02, T-ADM-04, T-ADM-05, T-ADM-07.

---

### T-ADM-09 [P2] — Conciliación y seguimiento de comprobantes de pago asociados a admisiones

**Componentes relacionados:** `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`, `js/student.js`, `js/accounting.js`, hojas `CargosEstudiante`, `ComprobantesPago`.

**Problema detectado:**
Un comprobante cargado por la familia no debe interpretarse como pago confirmado automáticamente. Se requiere un flujo de revisión contable con conciliación, rechazo con motivo y distribución de pagos familiares.

**Requisitos funcionales:**
1. Diferenciar estados de comprobante: `PendienteRevision`, `Aprobado`, `Rechazado`, `Aplicado`.
2. Permitir que el área de contabilidad valide el importe declarado contra el importe extractado del banco antes de aplicar el abono al saldo del estudiante.
3. Evitar que un mismo número de referencia bancaria se aplique dos veces.
4. Si un comprobante es rechazado, notificar a la familia especificando el motivo y habilitando la carga de un nuevo comprobante.
5. Mantener la distribución multihijo de `submitJointFamilyPayment` sin mezclar saldos entre hermanos.

**Criterios de aceptación:**
- La carga de un comprobante lo mantiene en estado `PendienteRevision` sin marcar los cargos como pagados.
- Reintentar una transacción no duplica los abonos contables.
- Los rechazos permiten a la familia adjuntar un nuevo comprobante con trazabilidad del anterior.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-01; T-ADM-08.

---

### T-ADM-10 [P2] — Verificación de propiedad y autorización en todas las operaciones de expedientes

**Componentes involucrados:** Microservicios backend (`USER`, `ACADEMIC`, `ACCOUNTING`, `TASK`, `EXAM`), `js/api.js`, `js/auth.js`.

**Problema detectado:**
Asegurar que todas las rutas de lectura, edición, exportación y descarga de documentos de admisiones y expedientes validen la propiedad del registro mediante `assertRecordOwnership` en el servidor.

**Requisitos funcionales:**
1. Validar en el backend que el `authenticatedUserId` tenga una relación activa en `RelacionesFamiliares` o rol administrativo antes de retornar datos de un `studentId` o `solicitudId`.
2. Proteger las exportaciones masivas y reportes con las mismas reglas de ámbito.
3. Garantizar que la manipulación de identificadores en peticiones HTTP sea rechazada con error `403 Forbidden`.

**Criterios de Aceptación:**
- Intentos de consulta con identificadores alterados son bloqueados por el backend.
- Las exportaciones y descargas de Drive aplican el mismo control estricto.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-03, T-ADM-08.

---

### T-ADM-11 [P3] — Indicadores de carga, recuperación de errores y reintentos en los flujos de admisión

**Componentes involucrados:** `js/student.js`, `js/teacher.js`, `js/ui-common.js`, `js/api.js`.

**Problema detectado:**
Brindar mejor retroalimentación visual durante operaciones lentas (carga de adjuntos, sumisión de formularios) e impedir el doble envío accidental.

**Requisitos funcionales:**
1. Deshabilitar botones de envío y mostrar spinners de procesamiento durante peticiones a API.
2. Presentar mensajes de error claros y orientativos en lugar de códigos técnicos.
3. Conservar los campos del formulario intactos ante errores de red para permitir un reintento seguro.

**Criterios de Aceptación:**
- El doble clic en botones de submit no genera solicitudes duplicadas.
- Errores de conexión no borran la información ingresada por la familia.

**Riesgo de Regresión:** Nulo.
**Dependencias:** T-ADM-01, T-ADM-06.

---

### T-ADM-12 [P2] — Estados, reapertura y retiro explícito de solicitudes de admisión

**Componentes involucrados:** `backend/academic-service/Code.gs`, `js/student.js`, `js/teacher.js`, hoja `SolicitudesAdmision`.

**Problema detectado:**
Proporcionar acciones administrativas formales para registrar el retiro voluntario de una solicitud o la reapertura justificada de un expediente cerrado.

**Requisitos funcionales:**
1. Permitir que la familia o admisiones registren el estado `Retirada` con motivo obligatorio.
2. Permitir a los administradores reabrir expedientes `Rechazados` o `Vencidos` conservando el historial previo.
3. Liberar los cupos reservados al retirar una solicitud.

**Criterios de Aceptación:**
- Retirar una solicitud libera el cupo reservado y registra la trazabilidad en auditoría.
- Reabrir un expediente conserva las evaluaciones y documentos previamente registrados.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-01, T-ADM-05.

---

### T-ADM-13 [P2] — Seguimiento de requisitos pendientes y lista de espera

**Componentes involucrados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`, hoja `SolicitudesAdmision`.

**Problema detectado:**
Gestionar de manera estructurada las solicitudes en estado `ListaEspera` y el checklist de requisitos pendientes.

**Requisitos funcionales:**
1. Clasificar y ordenar la lista de espera por fecha de solicitud o criterios de prioridad institucionales configurables.
2. Permitir al personal filtrar aspirantes por grado, evaluar elegibilidad y emitir ofertas cuando se libere una vacante.
3. Mostrar a la familia un estado informativo claro sin exponer la posición exacta de otros aspirantes.

**Criterios de Aceptación:**
- La lista de espera se puede filtrar y ordenar por criterios autorizados.
- Al liberarse un cupo, el sistema sugiere candidatos elegibles que cumplan todos los requisitos documentales.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-01, T-ADM-02, T-ADM-05.

---

### T-ADM-14 [P2] — Conversión integral de aspirante admitido a estudiante matriculado

**Componentes involucrados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `backend/accounting-service/Code.gs`, hojas `SolicitudesAdmision`, `ExpedientesEstudiantes`, `RelacionesFamiliares`.

**Problema detectado:**
Formalizar y coordinar la creación atómica de todas las entidades asociadas al convertir un admitido en estudiante.

**Requisitos funcionales:**
1. Reutilizar la identidad de la `Persona` creada durante la admisión.
2. Crear el expediente en `ExpedientesEstudiantes` con código institucional único.
3. Transferir los vínculos de `RelacionesFamiliares` y documentos de Drive al expediente del nuevo estudiante.
4. Sincronizar el estado de cupos y generar cargos de matrícula si están configurados.

**Criterios de Aceptación:**
- La conversión genera un estudiante matriculado manteniendo todo el historial de admisión vinculado.
- No se crean registros de personas o familiares duplicados.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-01, T-ADM-02, T-ADM-03, T-ADM-09.

---

### T-ADM-15 [P3] — Mejora de formularios, accesibilidad y validación de datos de admisión

**Componentes involucrados:** `index.html`, `login.html`, `student-dashboard.html`, `js/student.js`, `js/ui-common.js`.

**Problema que debe resolverse:**
Optimizar la estructura en pasos de los formularios de admisión, soporte para teclado, lectores de pantalla y diseño responsive en dispositivos móviles.

**Requisitos funcionales:**
1. Dividir formularios en pasos lógicos (Datos Aspirante -> Datos Responsables -> Antecedentes -> Documentación).
2. Proporcionar resumen de revisión antes del envío final.
3. Garantizar cumplimiento de WCAG 2.2 AA en contrastes y foco visible.

**Criterios de Aceptación:**
- Formularios 100% navegables por teclado y adaptados a pantallas móviles estrechas.
- Resumen previo permite verificar la información antes del envío definitivo.

**Riesgo de Regresión:** Nulo.
**Dependencias:** T-ADM-06.

---

### T-ADM-16 [P2] — Integración consistente de admisiones con comunicaciones, documentos, matrícula y servicios financieros

**Componentes involucrados:** Microservicios backend (`ACADEMIC`, `USER`, `ACCOUNTING`, `TASK`, `EXAM`), `js/api.js`.

**Problema detectado:**
Garantizar la consistencia transaccional y resistencia a fallos parciales cuando una operación de admisión involucra múltiples microservicios.

**Requisitos funcionales:**
1. Identificar fuentes de verdad para cada estado (Académico, Financiero, Documental).
2. Un fallo en el servicio de notificación no revierte una admisión confirmada.
3. Permitir reintentos seguros idempotentes en caso de desconexión entre servicios.

**Criterios de Aceptación:**
- Fallos en notificaciones u operaciones secundarias quedan registrados sin dejar la solicitud en estado incoherente.
- Peticiones repetidas son reconocidas mediante identificadores de operación evitando registros duplicados.

**Riesgo de Regresión:** Bajo.
**Dependencias:** T-ADM-01, T-ADM-02, T-ADM-05, T-ADM-09, T-ADM-14.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE 5

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-ADM-01.** Control transaccional de concurrencia en cupos y conversión | **P1** | `convertAdmissionToStudent` |
| **2** | **T-ADM-02.** Flujo completo de revisión, aprobación y rechazo de documentos | **P1** | Gestión documental en Drive |
| **3** | **T-ADM-03.** Verificación estricta del código de vinculación familiar | **P1** | `RelacionesFamiliares` |
| **4** | **T-ADM-10.** Verificación de propiedad y autorización en expedientes | **P2** | Backend RBAC & Ownership |
| **5** | **T-ADM-14.** Conversión integral a estudiante matriculado | **P2** | T-ADM-01, T-ADM-03 |
| **6** | **T-ADM-09.** Conciliación y seguimiento de comprobantes de pago | **P2** | `ComprobantesPago` / Finanzas |
| **7** | **T-ADM-06.** Guardado y recuperación de borradores de solicitudes | **P2** | IndexedDB / Forms |
| **8** | **T-ADM-04.** Módulo de agendamiento de entrevistas y evaluaciones | **P2** | Calendario de docentes |
| **9** | **T-ADM-05.** Expiración automática de ofertas de admisión | **P2** | Triggers / Control de cupos |
| **10** | **T-ADM-12.** Estados, reapertura y retiro explícito de solicitudes | **P2** | `SolicitudesAdmision` |
| **11** | **T-ADM-13.** Seguimiento de requisitos pendientes y lista de espera | **P2** | T-ADM-01, T-ADM-05 |
| **12** | **T-ADM-16.** Integración consistente entre servicios | **P2** | Microservicios backend |
| **13** | **T-ADM-08.** Vista unificada y contextual del portal de familias | **P2** | `#family-consolidated-summary-container` |
| **14** | **T-ADM-07.** Embudo visual de admisiones e historial de comunicaciones | **P3** | Universal Chart Engine |
| **15** | **T-ADM-11.** Indicadores de carga, recuperación de errores y reintentos | **P3** | `js/api.js` / UX |
| **16** | **T-ADM-15.** Mejora de formularios, accesibilidad y validación | **P3** | Forms / WCAG 2.2 |


---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE 6. EXPEDIENTE INSTITUCIONAL Y CICLO DE VIDA DEL ESTUDIANTE

### T-EXP-01 [P1] — Flag de Restricción de Custodia Legal y Alertas en Entrega de Estudiante
- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`, hojas `RelacionesFamiliares`, `ResponsablesTutores`.
- **Problema que debe resolverse:** Cuando existen restricciones legales o decretos de custodia exclusiva, el sistema debe alertar de forma destacada al docente u orientador antes de permitir la salida o entrega del estudiante a un familiar no autorizado.
- **Requisitos funcionales:**
  - Agregar el campo `RestriccionCustodiaLegal` (Booleano/Texto) y `DocumentoCustodiaUrl` en `RelacionesFamiliares`.
  - Disparar un badge de alerta roja ("RESTRICCIÓN DE CUSTODIA LEGAL") en el perfil del expediente del estudiante visible para docentes, consejeros y directivos.
  - Bloquear la selección de un contacto no autorizado en los módulos de salida anticipada o autorización de recogida.
- **Criterios de Aceptación:**
  1. Si un responsable tiene un flag de restricción de custodia, se muestra un aviso de alerta en su ficha.
  2. El personal no puede autorizar la entrega del estudiante a la persona restringida sin clave de anulación administrativa.
- **Riesgo de Regresión:** Nulo.

---

### T-EXP-02 [P1] — Cancelación Automática de Cargos Financieros Futuros al Registrar Baja/Retiro
- **Componentes relacionados:** `backend/academic-service/Code.gs` (`updateStudentStatus`), `backend/accounting-service/Code.gs`, `js/accounting.js`, hojas `ExpedientesEstudiantes`, `CargosEstudiante`.
- **Problema que debe resolverse:** Cuando se registra el retiro o baja de un estudiante a mitad de año lectivo, el sistema no anula automáticamente los cargos de colegiatura generados para meses posteriores a la fecha efectiva de retiro.
- **Requisitos funcionales:**
  - En `updateStudentStatus`, al pasar a estado `Retirado` o `Trasladado`, identificar en `CargosEstudiante` los cargos no pagados con fecha de vencimiento mayor a la fecha efectiva de baja.
  - Actualizar el estado de dichos cargos futuros a `AnuladoPorBaja` o `CanceladoPorRetiro`, ajustando el saldo pendiente.
  - Mantener los cargos anteriores a la fecha de baja e impagos como saldo adeudado histórico.
- **Criterios de Aceptación:**
  1. Dar de baja a un estudiante el 15 de marzo anula los cobros programados para abril en adelante.
  2. Los saldos adeudados hasta el 15 de marzo permanecen como cuenta por cobrar activa.
- **Riesgo de Regresión:** Bajo.

---

### T-EXP-03 [P1] — LockService y Concurrencia Transaccional en Cambios de Sección Masivos
- **Componentes relacionados:** `backend/academic-service/Code.gs` (`createStudentEnrollment`, `changeStudentSection`), `js/teacher.js`.
- **Problema que debe resolverse:** La reasignación de sección o grado de múltiples estudiantes al inicio de período carece de bloqueo transaccional, pudiendo sobrepasar la capacidad máxima asignada al aula o crear inconsistencias en listas de clase.
- **Requisitos funcionales:**
  - Aplicar `LockService.getScriptLock()` con timeout de 10 segundos en las reasignaciones masivas de sección.
  - Revalidar la capacidad de la sección destino en `SedesAulas` dentro del bloqueo exclusivo.
- **Criterios de Aceptación:**
  1. Cambios de sección simultáneos respetan la capacidad máxima del aula.
  2. La reasignación no duplica matrículas ni asignaciones de clase.
- **Riesgo de Regresión:** Bajo.

---

### T-EXP-04 [P1] — Cierre Anual con Snapshot Inmutable del Expediente Académico
- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`.
- **Problema que debe resolverse:** Al cerrar un año escolar, las calificaciones e historiales de asistencia deben quedar congeladas de forma inmutable para que ediciones posteriores de notas o reasignaciones de docentes no alteren los certificados emitidos.
- **Requisitos funcionales:**
  - Implementar el endpoint `closeAcademicYearSnapshot` que genera una copia de respaldo firmada con hash SHA-256 de las tablas de calificaciones del año finalizado.
  - Bloquear cualquier edición posterior en `CalificacionesEstudiantes` para registros pertenecientes a años con estado `Cerrado` sin una autorización formal de Apertura Excepcional.
- **Criterios de Aceptación:**
  1. Intento de modificar una nota de un año cerrado devuelve error `403 Academic Year Closed`.
  2. Los reportes e historial del año cerrado leen directamente el snapshot congelado.
- **Riesgo de Regresión:** Bajo.

---

### T-EXP-05 [P2] — Módulo Visual de Comparación y Conciliación de Expedientes Duplicados
- **Componentes relacionados:** `backend/academic-service/Code.gs` (`findDuplicateStudents`, `mergeStudentFiles`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema que debe resolverse:** `findDuplicateStudents` identifica duplicados, pero la fusión en `mergeStudentFiles` se ejecuta a ciegas sin una interfaz "Lado a Lado" que permita al usuario seleccionar qué campos conservar de cada registro.
- **Requisitos funcionales:**
  - Crear el modal `#modal-merge-students-preview` en `teacher-dashboard.html`.
  - Presentar columnas comparativas entre el Expediente A (Origen) y Expediente B (Destino) permitiendo seleccionar foto, fecha de nacimiento, DNI y tutores principales antes de ejecutar `mergeStudentFiles`.
- **Criterios de Aceptación:**
  1. El usuario puede previsualizar y elegir qué datos prevalecen antes de consolidar dos expedientes duplicados.
  2. Todas las calificaciones, matrículas e historial se reasignan al expediente consolidado.
- **Riesgo de Regresión:** Nulo.

---

### T-EXP-06 [P2] — Generación Oficial de Constancias de Traslado y Ficha Acumulativa PDF
- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs` (`generateSchoolDocument`), `js/teacher.js`.
- **Problema que debe resolverse:** Cuando un estudiante se traslada a otra institución, el sistema debe emitir la Constancia Oficial de Traslado y la Ficha Acumulativa de Conducta y Rendimiento con código de verificación CUV.
- **Requisitos funcionales:**
  - Implementar plantilla `ConstanciaTrasladoOficial` en `generateSchoolDocument` que incluya promedios acumulados, estado de solvencia y código CUV.
  - Registrar el evento de emisión en el historial de trazabilidad del expediente.
- **Criterios de Aceptación:**
  1. El personal autorizado puede emitir la constancia oficial en PDF stamping CUV directo desde el expediente.
  2. La verificación pública del CUV confirma la autenticidad del traslado.
- **Riesgo de Regresión:** Nulo.

---

### T-EXP-07 [P2] — Módulo de Control de Egresados, Graduación y Certificación
- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`.
- **Problema que debe resolverse:** Los estudiantes de último año que completan el plan de estudios requieren un estado de graduación formal, número de acta de graduación y registro en el catálogo histórico de egresados.
- **Requisitos funcionales:**
  - Crear el estado `Graduado` en `ExpedientesEstudiantes` y la tabla `RegistroEgresadosTitulos`.
  - Permitir registrar número de libro, folio, acta y fecha de graduación.
  - Habilitar portal de consulta histórica de egresados.
- **Criterios de Aceptación:**
  1. Los estudiantes graduados pasan a estado `Graduado` sin perder el acceso histórico a sus certificados.
  2. Se genera el registro de título oficial en el catálogo de egresados.
- **Riesgo de Regresión:** Bajo.

---

### T-EXP-08 [P2] — Gestión de Permisos Institucionales, Salidas de Campo y Control de Vencimientos
- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/student.js`, `js/teacher.js`.
- **Problema que debe resolverse:** Falta un registro de permisos de salidas pedagógicas/excursiones firmadas digitalmente por los padres, con alertas de vencimiento para autorizaciones médicas anuales.
- **Requisitos funcionales:**
  - Crear el módulo `PermisosAutorizacionesEstudiante` para registrar la conformidad firmada digitalmente (`registerDocumentSignature`).
  - Alertar a los docentes si un estudiante no cuenta con la autorización firmada antes de una excursión programada.
- **Criterios de Aceptación:**
  1. Los padres pueden firmar autorizaciones de salida desde el portal familiar.
  2. La lista de control de la excursión muestra claramente qué estudiantes cuentan con permiso vigente.
- **Riesgo de Regresión:** Nulo.

---

### T-EXP-09 [P3] — Buscador Avanzado Multicriterio de Expedientes e Indicadores de Estado
- **Componentes relacionados:** `js/teacher.js`, `teacher-dashboard.html`, `js/ui-common.js`.
- **Problema que debe resolverse:** El buscador de estudiantes actual filtra por texto simple; se requiere un panel de búsqueda avanzada con filtros combinados por grado, sección, estado (Activo, Retirado, Graduado), solvencia y alertas de documentos.
- **Requisitos funcionales:**
  - Enriquecer `#student-search-panel` con filtros combinados multicriterio y exportación de listas filtradas a Excel.
  - Mostrar badges visuales de color según la condición del estudiante.
- **Criterios de Aceptación:**
  1. Búsquedas combinadas (ej. "9no Grado" + "Retirados") retornan exactamente el listado filtrado.
  2. Las listas exportadas respetan el enmascaramiento de datos personales según el rol del usuario.
- **Riesgo de Regresión:** Nulo.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE 6

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-EXP-01.** Flag de restricción de custodia legal | **P1** | `RelacionesFamiliares` |
| **2** | **T-EXP-02.** Cancelación de cargos futuros tras retiro/baja | **P1** | `updateStudentStatus` / Finanzas |
| **3** | **T-EXP-03.** LockService en reasignaciones masivas | **P1** | `createStudentEnrollment` |
| **4** | **T-EXP-04.** Snapshot inmutable de cierre de año escolar | **P1** | `CalificacionesEstudiantes` |
| **5** | **T-EXP-05.** Modal visual de comparación y fusión de duplicados | **P2** | `mergeStudentFiles` |
| **6** | **T-EXP-06.** Constancias de traslado y Ficha Acumulativa PDF | **P2** | `generateSchoolDocument` |
| **7** | **T-EXP-07.** Módulo de egresados, graduación y títulos | **P2** | `ExpedientesEstudiantes` |
| **8** | **T-EXP-08.** Permisos de salidas de campo y firmas digitales | **P2** | `registerDocumentSignature` |
| **9** | **T-EXP-09.** Buscador avanzado multicriterio de expedientes | **P3** | Frontend search |


---

### T-EXP-10 [P1] — Aislamiento de calificaciones y asignaciones académicas históricas

**Estado de partida:** Requiere mejoras.
**Componentes relacionados:** `CalificacionesEstudiantes`, historial de matrículas, `backend/academic-service/Code.gs`, `backend/exam-service/Code.gs`, `js/teacher.js` y `js/student.js`.

#### Problema que debe resolver
Las calificaciones deben permanecer vinculadas al año, período, grado, sección, asignatura y matrícula en los que se originaron. Un cambio posterior de sección o grado no debe reasignar calificaciones antiguas al contexto académico actual ni permitir que aparezcan en los informes equivocados.

#### Requisitos funcionales
1. Verificar que cada calificación esté vinculada a una matrícula o asignación académica identificable y al período correspondiente.
2. Mantener separados los datos de la persona, la matrícula anual, la pertenencia a una sección, la inscripción en una asignatura y el resultado académico.
3. Cuando un estudiante cambie de sección, conservar las calificaciones anteriores asociadas a la sección y asignatura originales.
4. Diferenciar las calificaciones históricas de las actuales en las vistas del docente, estudiante y personal administrativo.
5. Definir cómo se registran traslados de notas entre secciones, equivalencias y correcciones autorizadas. No trasladar ni recalcular notas automáticamente solo porque cambie el grado o la sección.
6. Permitir que los usuarios autorizados consulten el historial académico por año, período, asignatura y sección.
7. Conservar el valor anterior, el valor corregido, el motivo y el autor en cualquier modificación de una calificación cerrada.
8. Validar que los informes, promedios, boletines y procesos de promoción utilicen las calificaciones correspondientes al período y matrícula seleccionados.
9. Evitar que una actualización del expediente personal modifique las relaciones académicas de forma indirecta.

#### Cambios necesarios
Revisar las claves de relación utilizadas por los servicios académicos y de evaluación. Corregir consultas que dependan únicamente del identificador del estudiante cuando también se necesite el contexto histórico. Añadir validaciones de integridad y pruebas de informes por año y sección.

#### Comportamiento esperado
Un cambio de sección crea una nueva asignación vigente, pero no modifica el contexto de las calificaciones anteriores. Los informes históricos muestran los resultados del período original y los informes actuales solo incluyen los registros que corresponden a la matrícula vigente.

#### Criterios de aceptación
- Las notas anteriores permanecen asociadas a su sección y período originales.
- Los informes históricos no cambian después de una reasignación.
- Los promedios no mezclan períodos o matrículas incompatibles.
- Las correcciones de notas cerradas quedan auditadas.
- Se prueba el cambio de sección a mitad de año, el cambio de grado en un nuevo año y la consulta de boletines anteriores.

#### Dependencias
Matrículas históricas, asignaciones académicas, calificaciones, exámenes y cierre anual.

---

### T-EXP-11 [P1] — Corte de asistencia por fecha efectiva de baja o traslado

**Estado de partida:** Requiere mejoras.
**Componentes relacionados:** `RegistroAsistencia`, `ExpedientesEstudiantes`, `backend/academic-service/Code.gs`, `js/teacher.js` y los procesos de registro de asistencia.

#### Problema que debe resolver
El sistema impide registrar asistencia después de un retiro en el escenario probado, pero debe garantizar que el control también funcione con fechas efectivas, traslados, matrículas históricas y peticiones directas al backend.

#### Requisitos funcionales
1. Determinar la elegibilidad de asistencia según la matrícula vigente en la fecha de la sesión, no únicamente según el estado actual del expediente.
2. Rechazar nuevos registros de asistencia fuera del período efectivo de matrícula, salvo excepciones autorizadas y auditadas.
3. Advertir sobre registros de asistencia posteriores a una fecha de baja o traslado cuando se registra el evento o se ejecuta una conciliación.
4. Conservar la asistencia histórica válida después del retiro, traslado, promoción o reincorporación.
5. No borrar ni modificar automáticamente registros anteriores como consecuencia de una baja.
6. Permitir corregir registros de asistencia erróneos mediante un procedimiento autorizado, con motivo y trazabilidad.
7. Diferenciar asistencia no registrada, sesión no aplicable, ausencia justificada y registro inválido.
8. Aplicar las validaciones tanto en la interfaz como en el backend.
9. Al reincorporar al estudiante, permitir asistencia dentro de las nuevas fechas de matrícula sin habilitar retroactivamente fechas no cubiertas.
10. Proporcionar un informe de inconsistencias entre matrícula y asistencia.

#### Cambios necesarios
Unificar las reglas de elegibilidad temporal de asistencia con el historial de matrícula. Revisar las consultas que determinan si un estudiante está activo y añadir validaciones de fechas efectivas, además de las pruebas de conciliación.

#### Comportamiento esperado
La asistencia se permite únicamente cuando corresponde a una matrícula válida para la fecha de la sesión. Las bajas y traslados no eliminan el historial y las reincorporaciones habilitan el registro desde la fecha aplicable.

#### Criterios de aceptación
- Se rechaza una nueva asistencia posterior a la baja cuando no existe matrícula válida.
- Se conserva la asistencia anterior al retiro.
- La reincorporación no habilita fechas anteriores fuera del período de matrícula.
- Los intentos directos contra el backend también son validados.
- Las inconsistencias detectadas quedan disponibles para revisión.
- Se prueban fechas límite, cambios de año, traslados, bajas retroactivas autorizadas y reincorporaciones.

#### Dependencias
Historial de matrículas, registro de asistencia, cambios de estado y control de permisos.

---

### T-EXP-12 [P1] — Reglas configurables de solvencia financiera para trámites académicos

**Estado de partida:** Requiere mejoras.
**Componentes relacionados:** `CargosEstudiante`, `ExpedientesEstudiantes`, `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs` y los flujos de matrícula, traslado, graduación y emisión documental.

#### Problema que debe resolver
La plataforma necesita separar el estado financiero de un estudiante de su estado académico y permitir configurar cuándo una condición de solvencia afecta un trámite. Un saldo pendiente no debe bloquear indiscriminadamente todas las operaciones ni alterar el historial académico.

#### Requisitos funcionales
1. Crear reglas configurables por tipo de trámite, período y política institucional para determinar si se requiere una comprobación financiera.
2. Diferenciar saldo pendiente, saldo vencido, cargo en disputa, pago en proceso, acuerdo de pago, exención autorizada y cuenta al día.
3. Definir si la regla es informativa, requiere revisión administrativa o bloquea el trámite. No convertir una alerta financiera en un bloqueo general sin configuración expresa.
4. Mostrar el estado financiero únicamente a los roles autorizados y revelar al personal académico solo el resultado operativo necesario cuando la política así lo permita.
5. Permitir excepciones autorizadas con motivo, responsable y fecha.
6. Recalcular la condición a partir de los movimientos contables vigentes, sin almacenar estados duplicados que puedan quedar desactualizados.
7. No eliminar ni alterar cargos, pagos o saldos como consecuencia de una promoción, traslado, baja o graduación.
8. Diferenciar la solvencia financiera de la elegibilidad académica para promoción o graduación.
9. Mantener una auditoría de bloqueos, advertencias, excepciones y cambios de política.
10. Permitir consultar por qué un trámite fue bloqueado o advertido y qué condición debe resolverse.

#### Cambios necesarios
Incorporar un servicio de evaluación de reglas de solvencia que pueda ser consultado por los flujos pertinentes. Añadir configuración administrativa y mensajes claros, sin duplicar el cálculo del saldo en diferentes módulos.

#### Comportamiento esperado
Cada trámite aplica la regla financiera configurada para ese tipo de operación. Cuando exista una restricción, el usuario autorizado recibe una explicación precisa; una excepción queda registrada y no altera los movimientos contables.

#### Criterios de aceptación
- Las reglas pueden variar según el trámite.
- Un saldo no produce bloqueos fuera de las reglas configuradas.
- Los usuarios sin permisos no ven importes ni movimientos financieros.
- Una excepción autorizada queda auditada.
- La actualización de un pago se refleja correctamente en la evaluación de solvencia.
- Se prueban cuentas al día, saldos pendientes, pagos en proceso, disputas, excepciones y cambios de configuración.

#### Dependencias
Contabilidad, cargos y pagos, permisos de usuario y flujos administrativos.

---

### T-EXP-13 [P1] — Trazabilidad y validación de las transiciones del ciclo de vida

**Estado de partida:** Requiere mejoras.
**Componentes relacionados:** `createStudentEnrollment`, `updateStudentStatus`, `getStudentTimeline`, `ExpedientesEstudiantes` y `backend/academic-service/Code.gs`.

#### Problema que debe resolver
La plataforma maneja estados de estudiante, pero necesita reglas explícitas para controlar qué transiciones son válidas, qué datos requieren y qué consecuencias producen en otros módulos.

#### Requisitos funcionales
1. Definir una matriz de transiciones admitidas entre los estados existentes, sin inventar estados incompatibles con el modelo institucional.
2. Para cada transición, establecer:
   - Estado de origen y estado de destino.
   - Condiciones previas.
   - Fecha efectiva.
   - Motivo obligatorio cuando corresponda.
   - Rol autorizado.
   - Aprobaciones necesarias.
   - Efectos sobre matrícula, asistencia, facturación, documentos y acceso.
3. Diferenciar traslado, retiro, reincorporación, promoción, retención y graduación. No inferir graduación a partir de una baja ni reactivar una matrícula histórica al cambiar únicamente el estado general.
4. Registrar los cambios con identificador de operación, estado anterior, estado nuevo, usuario, fecha, motivo y resultado.
5. Evitar que dos peticiones concurrentes apliquen transiciones incompatibles.
6. Implementar idempotencia para reintentos de red y solicitudes repetidas.
7. Permitir corregir una transición errónea mediante una operación auditada, conservando el evento original.
8. Definir cómo se gestionan operaciones cuyo cambio académico se registra correctamente pero cuya sincronización con otro módulo falla.
9. Mostrar al usuario los resultados completos: operación exitosa, rechazada, pendiente de sincronización o que requiere intervención.
10. Proporcionar un historial cronológico de estados y transiciones.

#### Cambios necesarios
Centralizar las reglas de transición en el servicio de backend correspondiente. Evitar que cada interfaz cambie estados con validaciones diferentes. Incorporar un registro de eventos y un mecanismo de conciliación para las operaciones intermodulares.

#### Comportamiento esperado
Un cambio de estado solo se aplica cuando cumple las condiciones configuradas. Sus efectos secundarios se ejecutan o quedan identificados como pendientes, y el sistema conserva una explicación verificable de cada transición.

#### Criterios de aceptación
- Las transiciones inválidas son rechazadas en backend.
- Las operaciones repetidas no duplican eventos ni efectos secundarios.
- Los cambios de estado quedan auditados.
- Las fallas de sincronización se detectan y se pueden recuperar.
- Los estados históricos no se sobrescriben silenciosamente.
- Se prueban transiciones normales, no permitidas, concurrentes, repetidas y parcialmente fallidas.

#### Dependencias
Matrículas, asistencia, cobranza, documentos, promoción, graduación y auditoría.

---

### T-EXP-14 [P1] — Enmascaramiento de información médica y datos personales sensibles

**Estado de partida:** Requiere mejoras.
**Componentes relacionados:** `ExpedientesEstudiantes`, `Personas`, `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `js/ui-common.js` y las interfaces que presentan datos personales.

#### Problema que debe resolver
Los datos médicos y otros datos personales sensibles requieren controles específicos de visibilidad. La existencia de permisos generales sobre el expediente no debe implicar acceso indiscriminado a todos sus campos.

#### Requisitos funcionales
1. Clasificar los campos personales según sensibilidad y necesidad operativa, incluyendo información médica, documentos de identidad, contactos privados y datos de orientación cuando corresponda.
2. Definir qué roles pueden consultar cada categoría y qué campos necesitan ver para cumplir sus funciones.
3. Aplicar autorización en backend antes de devolver campos sensibles. Ocultarlos en la interfaz no es suficiente.
4. Mostrar versiones enmascaradas de los identificadores personales en listados y pantallas donde no se necesite el valor completo.
5. Permitir revelar el valor completo únicamente a usuarios autorizados y registrar esa consulta cuando corresponda.
6. Evitar incluir información sensible en mensajes de error, logs técnicos, parámetros de URL, notificaciones generales o exportaciones no autorizadas.
7. Restringir los documentos adjuntos con controles equivalentes a los de los datos que contienen.
8. Evitar que cachés locales, almacenamiento offline o datos persistidos en el navegador expongan información sensible a otros usuarios del dispositivo.
9. Aplicar los mismos permisos en consultas individuales, listados, búsquedas, exportaciones, APIs y operaciones masivas.
10. Mantener una separación explícita entre los datos médicos necesarios para una emergencia y la historia médica detallada.
11. Probar los permisos ante cambios de rol, revocación de acceso, sesión vencida y acceso directo mediante identificadores modificados.

#### Cambios necesarios
Auditar los objetos de respuesta del backend y las rutas de consulta del expediente. Implementar filtrado por campo o proyecciones de respuesta según rol. Revisar almacenamiento local, generación de exportaciones y acceso a documentos.

#### Comportamiento esperado
Cada usuario recibe solo los datos que necesita y está autorizado a consultar. La ocultación de información se aplica también al backend, los archivos y los canales secundarios de acceso.

#### Criterios de aceptación
- Un rol no autorizado no recibe campos sensibles en la respuesta de API.
- Los listados enmascaran identificadores cuando no se necesita mostrarlos completos.
- Las exportaciones respetan los permisos.
- Los documentos sensibles no se pueden descargar con enlaces no autorizados.
- La revocación de un permiso impide nuevas consultas.
- Se prueban accesos desde diferentes roles y mediante peticiones directas.

#### Dependencias
Modelo de permisos, expediente consolidado, documentos, exportaciones y almacenamiento local.

---

### T-EXP-15 [P2] — Línea de tiempo del expediente con filtros por categoría

**Estado de partida:** Requiere mejoras.
**Componentes relacionados:** `getStudentTimeline`, `ExpedientesEstudiantes`, historial de matrículas y eventos de los módulos académicos, administrativos y financieros.

#### Problema que debe resolver
La línea de tiempo debe permitir localizar eventos relevantes sin mezclar indiscriminadamente actividades académicas, cambios administrativos, documentos y movimientos financieros. También debe evitar que el usuario vea eventos que no está autorizado a consultar.

#### Requisitos funcionales
1. Agrupar eventos por categorías configurables, como:
   - Identidad y datos personales.
   - Matrículas y cambios de estado.
   - Grados, secciones y jornadas.
   - Calificaciones y decisiones académicas.
   - Asistencia.
   - Documentos y autorizaciones.
   - Finanzas.
   - Convivencia y disciplina.
   - Orientación y bienestar.
   - Emisión de certificados.
2. Permitir filtrar por categoría, rango de fechas, año académico, tipo de operación y usuario responsable, siempre que el rol tenga acceso a esos datos.
3. Mostrar fecha efectiva del evento y fecha de registro cuando sean distintas.
4. Identificar los cambios importantes con una descripción clara, estado anterior y nuevo cuando corresponda, y un enlace al registro relacionado.
5. Diferenciar eventos completados, pendientes, rechazados, corregidos y revertidos.
6. Evitar duplicar eventos cuando un único cambio se refleje en varios módulos.
7. Permitir abrir el detalle de un evento con controles de acceso propios del registro de origen.
8. Mantener los eventos históricos aunque el estudiante cambie de estado o deje de estar activo.
9. Implementar paginación o carga progresiva para expedientes con historiales extensos.
10. No exponer información médica, financiera o de orientación a través de títulos, resúmenes o filtros visibles para roles no autorizados.

#### Cambios necesarios
Normalizar el formato de los eventos utilizados por `getStudentTimeline`, añadir filtros en backend y frontend y asegurar que cada categoría respete sus permisos. Definir un identificador estable para evitar eventos duplicados.

#### Comportamiento esperado
El usuario autorizado puede reconstruir la evolución del expediente, filtrar los eventos que necesita y abrir los detalles pertinentes. Los usuarios con permisos limitados no pueden inferir información sensible a través de la cronología.

#### Criterios de aceptación
- Los filtros devuelven solo eventos de las categorías y fechas seleccionadas.
- Las fechas efectivas y de registro se distinguen.
- Los eventos no se duplican al reintentar operaciones.
- Los registros históricos siguen visibles después de la baja o graduación para los roles autorizados.
- Los filtros no revelan categorías sensibles a usuarios no autorizados.
- Se prueban expedientes extensos, eventos simultáneos, correcciones y cambios de permisos.

#### Dependencias
Registro de auditoría, transiciones de estado, historial académico, documentos y permisos.

---

### T-EXP-16 [P2] — Operaciones masivas e importaciones con validación y recuperación

**Estado de partida:** Implementación parcial.
**Componentes relacionados:** servicios de backend que procesan matrículas, expedientes, relaciones y datos académicos; hojas `Personas`, `Usuarios`, `ExpedientesEstudiantes` y estructuras relacionadas.

#### Problema que debe resolver
Los procesos masivos necesitan una vista previa, detección de duplicados, validación por fila y recuperación clara de errores. Una importación parcialmente fallida no debe dejar identidades duplicadas, relaciones rotas o cambios que el administrador no pueda identificar.

#### Requisitos funcionales
1. Implementar una fase de preparación antes de confirmar la importación, con resumen de registros válidos, inválidos, duplicados potenciales y conflictos.
2. Validar campos obligatorios, formatos, identificadores, referencias a grados y secciones, fechas, relaciones familiares y restricciones de unicidad.
3. Detectar coincidencias por identificadores estables y por criterios secundarios. No fusionar personas automáticamente ante una coincidencia ambigua.
4. Permitir configurar la política de conflicto: rechazar, omitir, actualizar campos permitidos o enviar a revisión. No sobrescribir silenciosamente información existente.
5. Proporcionar un informe descargable con el número de fila o identificador de origen, campo afectado, error y acción recomendada.
6. Permitir corregir los registros rechazados y reintentar únicamente los que no se procesaron correctamente.
7. Implementar idempotencia mediante un identificador de importación y claves de origen estables.
8. Registrar quién inició y confirmó la importación, el archivo o fuente, la fecha, la política aplicada y el resultado.
9. Definir la recuperación de operaciones interrumpidas, diferenciando registros confirmados, pendientes y fallidos.
10. Evitar que una repetición genere estudiantes, usuarios, matrículas, relaciones, cargos o notificaciones duplicados.
11. Mostrar una confirmación final con cantidades y acceso al informe de resultados.
12. Aplicar permisos de importación y actualización por tipo de dato, evitando que un usuario autorizado a importar expedientes pueda alterar campos financieros o sensibles fuera de su función.

#### Cambios necesarios
Crear o ampliar un flujo de importación con prevalidación, ejecución controlada, registro de estado y reporte de errores. Reutilizar las validaciones del backend en lugar de implementar reglas incompatibles únicamente en la interfaz.

#### Comportamiento esperado
El administrador conoce los efectos antes de confirmar y puede identificar con precisión los registros procesados o rechazados. Reintentar una importación no repite los cambios ya confirmados.

#### Criterios de aceptación
- La vista previa identifica errores y posibles duplicados antes de escribir.
- Las filas inválidas no corrompen los registros válidos.
- Los conflictos no provocan sobrescrituras silenciosas.
- Un reintento no duplica los registros confirmados.
- Una interrupción produce un informe recuperable.
- Se prueban archivos repetidos, identificadores desconocidos, datos incompletos, relaciones inválidas y fallos a mitad de proceso.

#### Dependencias
Identidad única, relaciones, matrículas, permisos, operaciones masivas y auditoría.

---

### T-EXP-17 [P2] — Panel de alertas y tareas pendientes del expediente

**Estado de partida:** Implementación parcial.
**Componentes relacionados:** `ExpedientesEstudiantes`, documentos, autorizaciones, matrículas, estados de ciclo de vida y los componentes de interfaz compartidos.

#### Problema que debe resolver
La plataforma necesita un panel que permita detectar y priorizar incidencias del expediente antes de que afecten trámites académicos o administrativos. Las alertas deben derivarse de condiciones reales y distinguir las que requieren una acción de las que son meramente informativas.

#### Requisitos funcionales
1. Centralizar alertas sobre:
   - Documentos obligatorios pendientes, rechazados o vencidos.
   - Autorizaciones próximas a vencer o ya vencidas.
   - Matrículas incompletas o inconsistentes.
   - Estudiantes con transiciones pendientes de completar.
   - Errores de sincronización entre módulos.
   - Cierres anuales incompletos.
   - Requisitos de promoción o graduación pendientes.
   - Conflictos de datos que requieren conciliación.
2. Definir para cada alerta la condición de activación, severidad, rol destinatario, acción recomendada y condición de resolución.
3. Diferenciar alerta activa, reconocida, resuelta, descartada mediante autorización y reabierta.
4. Evitar que reconocer una alerta la elimine si la condición que la origina sigue existiendo.
5. Permitir navegar desde la alerta al expediente o registro correspondiente, respetando los permisos.
6. Evitar alertas duplicadas por el mismo problema. Actualizar el evento existente cuando corresponda.
7. Permitir filtrar por categoría, prioridad, fecha, responsable y estado.
8. Mostrar al personal autorizado un resumen de alertas pendientes y acciones vencidas.
9. Registrar quién reconoció, asignó, resolvió o descartó cada alerta y cuándo.
10. Permitir configurar plazos y anticipación de alertas de vencimiento sin codificar períodos fijos en múltiples componentes.
11. Mostrar errores de sincronización como tareas pendientes de conciliación y no como si la operación hubiera finalizado correctamente.
12. No exponer información sensible en notificaciones generales o paneles visibles para roles no autorizados.

#### Cambios necesarios
Definir un modelo común de alertas, conectar sus condiciones con los módulos de origen y añadir un panel de consulta y resolución. Si ya existe un mecanismo de notificaciones, reutilizarlo para evitar crear dos sistemas de alertas independientes.

#### Comportamiento esperado
El panel presenta las incidencias reales que requieren atención y ofrece una ruta clara para resolverlas. Las alertas desaparecen o se cierran cuando se cumple la condición de resolución, no simplemente cuando alguien las oculta.

#### Criterios de aceptación
- Las alertas se crean según reglas verificables.
- Una alerta reconocida continúa visible mientras el problema siga activo.
- La resolución queda registrada.
- Los reintentos no generan alertas duplicadas.
- Las alertas respetan los permisos de acceso.
- Se prueban vencimientos, documentos rechazados, errores de sincronización, alertas resueltas y alertas que vuelven a activarse.

#### Dependencias
Documentos, autorizaciones, matrículas, cierre anual, operaciones masivas, sincronización y permisos.

---

### T-EXP-18 [P2] — Integración de convivencia y orientación con aislamiento estricto de información

**Estado de partida:** Requiere mejoras.
**Componentes relacionados:** `ObservacionesConvivencia`, `ExpedientesEstudiantes`, `backend/academic-service/Code.gs`, `backend/user-service/Code.gs` y las vistas de consulta del expediente.

#### Problema que debe resolver
La auditoría confirma restricciones para notas de orientación, pero se requiere garantizar que el aislamiento se mantenga en todas las consultas del expediente, exportaciones, búsquedas, cronologías y operaciones indirectas. Una relación con el estudiante no debe conceder acceso automático a observaciones sensibles.

#### Requisitos funcionales
1. Definir permisos separados para observaciones de convivencia, sanciones, notas de orientación y registros de bienestar.
2. Limitar la consulta al personal expresamente autorizado, según las funciones y reglas institucionales.
3. Permitir que el expediente muestre únicamente un indicador general de existencia de un registro restringido cuando sea necesario, sin revelar contenido ni detalles sensibles.
4. Evitar que los datos restringidos aparezcan en listados, búsquedas, exportaciones, informes académicos o notificaciones destinadas a roles no autorizados.
5. Mantener la relación histórica de los eventos con el estudiante, incluso después de su retiro o graduación.
6. Registrar consultas, modificaciones y exportaciones de información especialmente sensible según la política de acceso.
7. Diferenciar las anotaciones operativas de convivencia de las notas privadas de orientación, evitando que ambas compartan una política de acceso excesivamente amplia.
8. Permitir correcciones mediante un proceso auditado, conservando la trazabilidad.
9. Aplicar la autorización en backend para peticiones directas, no solo en los componentes visuales.

#### Cambios necesarios
Revisar las respuestas de `getStudentFile` y `getStudentTimeline`, así como los endpoints y las exportaciones que puedan incluir `ObservacionesConvivencia`. Aplicar permisos específicos por categoría y comprobar que las relaciones del expediente no amplíen el acceso.

#### Comportamiento esperado
Cada rol ve únicamente la información de convivencia y orientación permitida. El expediente sigue ofreciendo una vista útil del estudiante sin exponer notas privadas a docentes, familiares u otros usuarios que no deban consultarlas.

#### Criterios de aceptación
- Un usuario no autorizado no recibe contenido restringido desde el backend.
- Las exportaciones y la cronología aplican los mismos controles.
- Los registros históricos siguen vinculados al expediente.
- Las modificaciones quedan auditadas.
- Se prueban roles autorizados y no autorizados, acceso directo a endpoints, exportaciones y consultas de estudiantes retirados.

#### Dependencias
Modelo de permisos, expediente consolidado, cronología, exportaciones y auditoría.

---

### ORDEN DE EJECUCIÓN RECOMENDADO COMPLETO FASE 6

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-EXP-01.** Flag de restricción de custodia legal | **P1** | `RelacionesFamiliares` |
| **2** | **T-EXP-02.** Cancelación de cargos futuros tras retiro/baja | **P1** | `updateStudentStatus` / Finanzas |
| **3** | **T-EXP-03.** LockService en reasignaciones masivas | **P1** | `createStudentEnrollment` |
| **4** | **T-EXP-04.** Snapshot inmutable de cierre de año escolar | **P1** | `CalificacionesEstudiantes` |
| **5** | **T-EXP-10.** Aislamiento de calificaciones e historial | **P1** | Matrículas históricas |
| **6** | **T-EXP-11.** Corte de asistencia por fecha efectiva | **P1** | `RegistroAsistencia` |
| **7** | **T-EXP-12.** Reglas configurables de solvencia financiera | **P1** | `CargosEstudiante` |
| **8** | **T-EXP-13.** Transiciones trazables del ciclo de vida | **P1** | `getStudentTimeline` |
| **9** | **T-EXP-14.** Enmascaramiento de información PII sensible | **P1** | `backend/user-service/Code.gs` |
| **10** | **T-EXP-05.** Modal visual de comparación y fusión de duplicados | **P2** | `mergeStudentFiles` |
| **11** | **T-EXP-06.** Constancias de traslado y Ficha Acumulativa PDF | **P2** | `generateSchoolDocument` |
| **12** | **T-EXP-07.** Módulo de egresados, graduación y títulos | **P2** | `ExpedientesEstudiantes` |
| **13** | **T-EXP-08.** Permisos de salidas de campo y firmas digitales | **P2** | `registerDocumentSignature` |
| **14** | **T-EXP-16.** Operaciones masivas e importaciones | **P2** | Backend import engines |
| **15** | **T-EXP-18.** Aislamiento de convivencia y orientación | **P2** | `ObservacionesConvivencia` |
| **16** | **T-EXP-15.** Cronología del expediente con filtros por categoría | **P2** | `getStudentTimeline` |
| **17** | **T-EXP-17.** Panel de alertas y tareas pendientes | **P2** | `ExpedientesEstudiantes` |
| **18** | **T-EXP-09.** Buscador avanzado multicriterio de expedientes | **P3** | Frontend search |


---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE DE PLANIFICACIÓN ACADÉMICA, HORARIOS Y RECURSOS INSTITUCIONALES

### T-HOR-01 [P1] — Control transaccional y prevención de reservas dobles en horarios, aulas y recursos

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`createClassSchedule`, `checkScheduleConflict`), `js/teacher.js`, hojas `HorariosClases`, `SedesAulas`.
- **Problema detectado:** Las operaciones de asignación validan los conflictos mediante `checkScheduleConflict`, pero carecen de un bloqueo transaccional con `LockService.getScriptLock()`. Dos solicitudes simultáneas pueden sufrir una condición de carrera antes de que cualquiera registre su reserva en `HorariosClases` o `SedesAulas`, provocando horarios duplicados, docentes asignados simultáneamente o recursos compartidos reservados para actividades incompatibles.
- **Alcance específico:**
  - Crear, modificar y reasignar bloques horarios (`createClassSchedule`).
  - Reservar aulas, laboratorios, canchas y otros recursos compartidos.
  - Cambiar docentes, secciones, períodos y ubicaciones.
  - Importar horarios mediante operaciones masivas.
  - Copiar horarios entre períodos académicos o años lectivos.
- **Requisitos funcionales:**
  1. Ejecutar la validación definitiva de conflictos en el servidor inmediatamente antes de confirmar cada operación.
  2. Implementar un mecanismo de exclusión mutua mediante `LockService.getScriptLock()` con timeout de 10 segundos (10,000 ms) en las operaciones concurrentes que modifiquen horarios o reservas compartidas.
  3. Mantener dentro de la sección protegida la secuencia crítica de adquisición del bloqueo, lectura del estado relevante, validación y escritura de los registros.
  4. Volver a comprobar las restricciones después de adquirir el bloqueo. Una validación realizada antes de bloquear no debe considerarse suficiente.
  5. Aplicar la protección a todas las rutas de escritura que puedan afectar a la misma reserva, no únicamente al formulario principal.
  6. Validar, como mínimo: colisión del docente; colisión del aula o espacio; colisión de la sección u oferta académica; colisión de recursos compartidos; disponibilidad de la sede y del período; capacidad y compatibilidad del espacio, cuando corresponda.
  7. Evitar bloqueos indefinidos. Si no se obtiene el bloqueo dentro del tiempo establecido, devolver un error controlado y permitir un reintento seguro.
  8. Liberar el bloqueo mediante bloque `finally` incluso cuando se produzca una excepción.
  9. Garantizar que una operación rechazada no deje registros parciales, reservas huérfanas ni estados que aparenten una asignación exitosa.
  10. Si el proceso modifica varias hojas o registros que no pueden confirmarse mediante una transacción real, implementar una estrategia explícita de recuperación, compensación o reversión.
  11. Utilizar identificadores de operación o mecanismos de idempotencia para impedir duplicados ante reintentos de red.
  12. Evitar bloquear durante operaciones de lectura, generación de reportes o cálculos prolongados que no requieran exclusión mutua.
- **Comportamiento esperado:** Cuando dos usuarios intenten reservar la misma aula, asignar al mismo docente en intervalos incompatibles o utilizar el mismo recurso simultáneamente, solo podrá confirmarse una operación. La otra recibirá un mensaje que identifique el conflicto y permita elegir otra opción.
- **Criterios de aceptación:**
  - Dos solicitudes concurrentes para reservar la misma aula y el mismo intervalo: una se confirma y la otra se rechaza por conflicto.
  - Dos solicitudes concurrentes para asignar al mismo docente en el mismo intervalo: una se confirma y la otra se rechaza.
  - Dos solicitudes para recursos diferentes y horarios compatibles: ambas se confirman.
  - Una solicitud que falle después de iniciar la escritura no deja datos parciales sin detectar ni corregir.
  - Una interrupción de red seguida de reintento no duplica la asignación.
  - Los conflictos siguen detectándose aunque las solicitudes provengan de endpoints diferentes.
  - Las modificaciones de horarios existentes se validan con el mismo rigor que las nuevas asignaciones.
  - Las pruebas de concurrencia incluyen solicitudes simultáneas reales o una simulación reproducible que permita verificar la exclusión mutua.
  - Se documentan las limitaciones transaccionales del almacenamiento actual y el mecanismo utilizado para recuperar operaciones incompletas.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** Validación de conflictos existente (`checkScheduleConflict`), `createClassSchedule`, gestión de aulas/sedes/recursos en `SedesAulas`, operaciones de importación/copia e identificadores de idempotencia.

---

### T-HOR-02 [P1] — Detección de sobrecarga y conflictos en la planificación de exámenes y evaluaciones

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`createCalendarEvent`), `backend/exam-service/Code.gs`, `js/teacher.js`, calendario escolar.
- **Problema detectado:** La planificación detecta determinadas colisiones de horarios, pero no advierte cuando una sección tiene varios exámenes concentrados en un mismo día o distribuidos en días consecutivos de manera excesiva. Falta un validador que restrinja por defecto el máximo de evaluaciones principales diarias por sección, generando sobrecarga académica.
- **Alcance específico:**
  - Creación y modificación de exámenes y evaluaciones.
  - Reprogramación de evaluaciones existentes.
  - Calendario de evaluaciones por sección, asignatura, docente y estudiante.
  - Integración con el módulo de exámenes (`exam-service`) y el calendario escolar (`createCalendarEvent`).
- **Requisitos funcionales:**
  1. Crear un validador de carga de evaluaciones en `createCalendarEvent` y endpoints de examen que examine las evaluaciones programadas para el intervalo afectado.
  2. Detectar: dos exámenes simultáneos para una misma sección; dos evaluaciones simultáneas para un estudiante matriculado en asignaturas diferentes; exceso de exámenes en un mismo día (por defecto máximo 2 evaluaciones/exámenes principales por sección en un día lectivo); exámenes en días consecutivos cuando superen el límite institucional configurado; concentración excesiva de evaluaciones en una ventana móvil de varios días; solapamientos entre evaluaciones y clases obligatorias, cuando la política académica lo prohíba; evaluaciones programadas durante vacaciones, feriados, cierres institucionales o fechas bloqueadas, salvo excepción autorizada.
  3. Permitir configurar los límites por institución, período académico, nivel, grado o sección en `ConfiguracionSistema` / `ConfiguracionDashboard`.
  4. Establecer parámetros independientes para el máximo de exámenes diarios, consecutivos y acumulados en una ventana de días.
  5. Diferenciar los conflictos absolutos de las advertencias de carga académica.
  6. Mostrar el motivo de cada advertencia, las evaluaciones involucradas, las fechas y las secciones o estudiantes afectados.
  7. Proponer alternativas de fecha y hora que respeten la disponibilidad de docentes, aulas y estudiantes.
  8. Recalcular las validaciones cuando se modifique una fecha, se cambie una matrícula o se traslade una evaluación.
  9. Utilizar las matrículas y asignaciones reales para detectar conflictos individuales, sin asumir que todos los estudiantes de un mismo grado cursan exactamente las mismas asignaturas.
  10. Permitir excepciones autorizadas por Dirección o Coordinación, con justificación y registro de auditoría.
  11. Evitar que un fallo en la consulta de evaluaciones existentes se interprete como ausencia de conflictos.
  12. Mantener sincronizados el calendario escolar, la agenda docente, la vista del estudiante y el portal de familias.
- **Comportamiento esperado:** Al programar una evaluación, el sistema debe mostrar las colisiones y la carga académica acumulada antes de confirmar la fecha. Las restricciones configuradas como obligatorias deben bloquear la operación; las recomendaciones podrán autorizarse únicamente conforme a la política institucional.
- **Criterios de aceptación:**
  - Dos exámenes simultáneos para una misma sección generan un conflicto.
  - Dos exámenes simultáneos para un estudiante que cursa asignaturas de diferentes grados generan un conflicto individual.
  - Intentar agendar más de los exámenes configurados (ej. 3 o más en un día) dispara una advertencia o bloqueo según el límite institucional.
  - Una carga excesiva de evaluaciones en días consecutivos se detecta aunque no existan solapamientos de horas.
  - Las evaluaciones de grupos sin estudiantes compartidos no se bloquean por conflictos individuales inexistentes.
  - Cambiar la fecha de un examen recalcula las advertencias y actualiza sus vistas relacionadas sin duplicar eventos.
  - Los límites configurados pueden modificarse sin alterar evaluaciones históricas.
  - Las excepciones autorizadas quedan registradas con usuario, fecha, motivo y evaluación afectada.
  - Si no se puede consultar la información necesaria, el sistema informa que la validación está incompleta y no presenta el resultado como una comprobación exitosa.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** Calendario escolar y períodos académicos, matrículas y asignaciones de estudiantes, módulo de exámenes (`exam-service`), `createCalendarEvent`, notificaciones.

---

### T-HOR-03 [P1] — Configuración de bloques consecutivos, descansos y carga laboral docente

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs` (`TurnosAlmuerzo`), `js/teacher.js`, asignación de horarios.
- **Problema detectado:** La asignación docente no incorpora de forma suficiente la limitación de bloques consecutivos ni las pausas obligatorias (por ejemplo, asignando 5 o 6 períodos seguidos sin descanso o turno de almuerzo). Una planificación sin solapamientos puede ser inviable si asigna demasiadas clases seguidas, elimina períodos de preparación o excede las restricciones laborales configuradas.
- **Alcance específico:**
  - Asignación manual y automática de docentes.
  - Creación y modificación de horarios.
  - Sustituciones docentes.
  - Informes de carga laboral.
  - Validación previa a la publicación.
- **Requisitos funcionales:**
  1. Incorporar parámetros configurables para: máximo de períodos lectivos consecutivos (por defecto máximo 4 bloques); pausas mínimas entre bloques; descansos y turnos de almuerzo (`TurnosAlmuerzo`); máximo de períodos por día; máximo de horas o períodos por semana; horarios de disponibilidad y no disponibilidad; períodos de planificación docente protegidos; cargas mínimas o máximas contractuales, si la institución las registra.
  2. Permitir reglas diferentes por docente, jornada, contrato, sede o política institucional.
  3. Distinguir las restricciones obligatorias de las preferencias recomendadas.
  4. Calcular la carga a partir de las sesiones efectivamente asignadas, evitando contar dos veces bloques vinculados o registros duplicados.
  5. Considerar las sustituciones y los períodos de vigencia de cada asignación.
  6. Validar las restricciones tanto al crear como al editar, copiar, importar, sustituir o publicar horarios.
  7. Mostrar una vista de carga diaria y semanal por docente, con períodos libres, descansos, bloques consecutivos y alertas de exceso.
  8. Permitir definir si una sustitución temporal debe respetar los límites ordinarios, una excepción autorizada o ambos.
  9. Evitar que la edición de una regla modifique retroactivamente los horarios históricos.
  10. Si se incorpora generación automática, utilizar estas restricciones como parte del modelo de planificación, no como una comprobación superficial posterior.
- **Comportamiento esperado:** El sistema debe impedir las asignaciones que violen límites obligatorios y señalar las que incumplan preferencias. Las advertencias deben identificar la regla infringida y mostrar la distribución que origina el problema.
- **Criterios de aceptación:**
  - Un docente con un máximo de 4 bloques consecutivos no puede recibir un quinto bloque consecutivo si esa regla es obligatoria o no cuenta con excepción.
  - Una pausa obligatoria o turno de almuerzo (`TurnosAlmuerzo`) no puede ser ocupado por una clase.
  - El exceso de carga semanal se calcula correctamente, incluyendo asignaciones de diferentes secciones.
  - Una sustitución se valida para el período exacto en que estará vigente.
  - Los períodos de planificación protegidos se conservan durante las modificaciones y la generación automática.
  - Las preferencias configuradas como no obligatorias producen advertencias, no bloqueos arbitrarios.
  - El sistema identifica claramente la regla y el bloque que genera el exceso.
  - Los reportes de carga docente coinciden con las sesiones activas del horario publicado.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** Perfiles docentes y asignaciones, modelo de períodos y bloques horarios, sustituciones docentes, `TurnosAlmuerzo`, validación de conflictos.

---

### T-HOR-04 [P1] — Matriz de tiempos de traslado entre sedes y edificios

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`, hoja `SedesAulas`.
- **Problema detectado:** La validación de conflictos no contempla adecuadamente el tiempo necesario para trasladarse entre edificios o sedes distantes. Dos clases consecutivas pueden no solaparse cronológicamente, pero resultar imposibles de atender físicamente si el tiempo entre el fin de la clase A en un edificio y el inicio de la clase B en otro es inferior al tiempo requerido.
- **Alcance específico:**
  - Gestión de sedes y edificios en `SedesAulas`.
  - Asignación de aulas.
  - Horarios docentes.
  - Sustituciones docentes.
  - Optimización automática, si se incorpora.
  - Informes de viabilidad horaria.
- **Requisitos funcionales:**
  1. Definir e incorporar en `SedesAulas` una matriz configurable de tiempos mínimos de traslado (`TiempoTrasladoMinutos`) entre sedes, edificios o zonas físicas.
  2. Permitir establecer tiempos distintos según el origen y destino cuando existan diferencias reales de desplazamiento.
  3. Considerar la duración de cada clase y el intervalo disponible entre sesiones.
  4. Aplicar la regla a docentes que cambien de ubicación entre bloques consecutivos y a otros usuarios o grupos cuando el modelo disponga de datos suficientes.
  5. Considerar las restricciones de movilidad y accesibilidad únicamente cuando estén registradas y sean pertinentes para la planificación.
  6. Permitir configurar tiempos adicionales de transición, preparación de aula o montaje de recursos.
  7. Distinguir entre traslados imposibles o insuficientes y traslados posibles pero poco convenientes.
  8. Detectar también conflictos introducidos por sustituciones, cambios de aula y modificaciones masivas.
  9. Mostrar las dos sesiones implicadas, sus ubicaciones, el intervalo disponible y el tiempo mínimo requerido.
  10. Permitir excepciones justificadas por usuarios autorizados, conservando la trazabilidad.
  11. Evitar asumir que todas las sedes tienen un tiempo de traslado idéntico o que los desplazamientos siempre requieren cero minutos.
- **Comportamiento esperado:** Cuando un docente deba pasar de un edificio o sede a otro, el sistema debe verificar que el intervalo entre las sesiones sea suficiente según la configuración institucional. Si no lo es, deberá bloquear la asignación cuando se trate de una restricción obligatoria o generar una advertencia cuando la política permita excepciones.
- **Criterios de aceptación:**
  - Un traslado con 5 minutos disponibles y 15 minutos requeridos se detecta como inviable y bloquea la asignación.
  - Un traslado entre aulas del mismo edificio utiliza la regla configurada para ese caso.
  - Una clase que termina exactamente cuando comienza la siguiente en el mismo espacio no genera una falsa colisión temporal, salvo que exista un tiempo de transición configurado.
  - Los cambios de aula recalculan los traslados afectados.
  - Las reglas se aplican a la generación automática de horarios cuando corresponda.
  - Las excepciones registran quién las autorizó y por qué.
  - Los horarios publicados y los informes de carga reflejan las ubicaciones actualizadas.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** Catálogo de sedes, edificios y aulas (`SedesAulas`), horarios y asignaciones docentes, sustituciones y operaciones masivas.

---

### T-HOR-05 [P2] — Motor algorítmico CSP para generación y optimización automática de horarios mediante restricciones

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`generateAutomatedSchedule`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** No existe una capacidad completa de generación automática de horarios mediante un motor de satisfacción de restricciones (CSP). La planificación depende de asignaciones manuales casilla por casilla, lo que limita la capacidad para resolver escenarios complejos y comparar alternativas de distribución.
- **Alcance específico:**
  - Generación inicial de horarios.
  - Reorganización de horarios existentes.
  - Copia y adaptación de horarios a nuevos períodos.
  - Comparación de escenarios.
  - Reasignación de docentes, aulas y bloques.
  - Informes de calidad de la planificación.
- **Requisitos funcionales:**
  - **A. Modelo de datos de entrada:** Oferta académica, grados, secciones, asignaturas y matrículas; número de sesiones semanales requeridas por asignatura; duración de las sesiones y períodos en que pueden impartirse; disponibilidad y cualificaciones de docentes; carga laboral máxima, bloques consecutivos y períodos de planificación protegidos; aulas, capacidades, equipamiento, sedes (`SedesAulas`) y horarios disponibles; recursos compartidos y sus reservas; calendario escolar, feriados, vacaciones y excepciones; evaluaciones, actividades institucionales y sesiones que no pueden moverse; preferencias institucionales y restricciones específicas; sesiones existentes que deban conservarse o puedan reorganizarse; necesidades individuales de estudiantes en asignaturas compartidas o electivas. Antes de iniciar, comprobar que los datos obligatorios estén completos sin inventar disponibilidad.
  - **B. Restricciones obligatorias (Duras):** Ausencia de solapamientos de docentes, aulas, secciones y recursos compartidos; cumplimiento de disponibilidad docente y de espacios; cumplimiento de capacidades y requisitos de equipamiento; respeto a días no lectivos y fechas bloqueadas; cumplimiento de límites laborales obligatorios; respeto a tiempos de traslado y descansos configurados; conservación de sesiones bloqueadas por el usuario ("Pin/Lock"); cumplimiento de las sesiones y horas lectivas obligatorias. Ninguna mejora de puntuación puede violar una restricción dura.
  - **C. Preferencias y optimización (Blandas):** Reducir períodos libres excesivos de estudiantes y docentes; evitar demasiados bloques consecutivos; distribuir equilibradamente la carga docente; reducir traslados entre edificios; evitar concentraciones innecesarias de clases o evaluaciones; aprovechar las aulas según capacidad y equipamiento; conservar períodos comunes de planificación; reducir cambios innecesarios respecto al horario publicado; evitar horarios fragmentados; respetar preferencias docentes. Ponderaciones configurables con explicación de compromisos adoptados.
  - **D. Generación y revisión de escenarios:** Implementar el endpoint `generateAutomatedSchedule` ejecutando algoritmo CSP con retroceso (backtracking). Generar una o varias alternativas; mostrar sesiones asignadas, no asignadas y pendientes; mostrar conflictos duros, preferencias incumplidas e indicadores de calidad; permitir comparar alternativas; explicar por qué una sesión no pudo ubicarse; permitir fijar o bloquear sesiones concretas ("Pin/Lock") antes de regenerar; preservar sesiones bloqueadas; permitir ajustes manuales y recalcular validez; conservar versiones de cada escenario; evitar publicar automáticamente sin confirmación explícita; ejecutar validación definitiva mediante las mismas reglas de conflictos que protegen la asignación manual; permitir generar solución parcial identificándola explícitamente como incompleta.
  - **E. Rendimiento y resiliencia:** Definir límites de tiempo de ejecución y cancelación controlada; evitar que un proceso prolongado bloquee otras operaciones; informar del progreso y estado real; gestionar escenarios sin solución, agotamiento de tiempo y datos inconsistentes; no alterar el horario publicado ante una ejecución fallida; registrar parámetros de ejecución.
- **Comportamiento esperado:** El sistema debe generar propuestas que respeten todas las restricciones obligatorias, expliquen sus compromisos y puedan inspeccionarse y compararse antes de su publicación.
- **Criterios de aceptación:**
  - Una solución completa no contiene colisiones duras.
  - Cuando no existe una solución viable, el motor lo informa y presenta las causas conocidas sin fabricar asignaciones falsas.
  - Una solución parcial identifica todas las sesiones no ubicadas.
  - Las sesiones bloqueadas ("Pin/Lock") permanecen inalteradas durante una nueva generación.
  - Las preferencias incumplidas se muestran por separado de las restricciones obligatorias.
  - La comparación entre escenarios utiliza las mismas métricas y restricciones.
  - Un escenario no puede publicarse si contiene conflictos obligatorios o sesiones requeridas sin asignar, salvo flujo explícito de publicación parcial.
  - El horario publicado no se altera hasta que un usuario autorizado confirma la propuesta validada.
  - Los resultados generados superan las mismas pruebas de conflicto que las asignaciones manuales.
  - Se evalúa la calidad con casos representativos y se documentan resultados, tiempo y limitaciones.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-HOR-01, T-HOR-02, T-HOR-03, T-HOR-04, estructura académica, aulas, recursos, calendario, matrículas, T-HOR-06.

---

### T-HOR-06 [P2] — Versionado de borradores, comparación de cambios (Diff) y publicación controlada de horarios

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** Existe publicación y registro de cambios, pero los horarios se pueden aplicar directamente en vivo o carecen de un mecanismo completo de comparación entre versiones ("Diff") que permita revisar de manera clara qué cambia antes de publicar un horario. Sin una vista comparativa, las modificaciones masivas o automáticas pueden introducir alteraciones difíciles de detectar.
- **Alcance específico:**
  - Creación y edición de borradores.
  - Modificaciones de horarios publicados.
  - Copia entre períodos académicos.
  - Generación automática (CSP).
  - Publicación, sustitución de versiones y recuperación.
  - Registro de cambios y notificaciones.
- **Requisitos funcionales:**
  - **A. Ciclo de vida de los horarios:** Implementar o completar estados diferenciados: `Borrador` ("Draft"), `PendienteRevision`, `Validado`, `Publicado`, `Sustituido`, `Cancelado`. Transiciones permitidas y permisos explícitos. Distinguir la versión vigente de las versiones de trabajo.
  - **B. Aislamiento de borradores:** Los cambios de un borrador no deben alterar el horario publicado. Vincular cada borrador a un período académico y versión base. Registrar creador, modificador y marcas temporales. Detectar si el borrador queda desactualizado por cambios en el horario publicado. Solicitar reconciliación ante modificaciones concurrentes. Permitir descartar un borrador sin eliminar ni alterar la versión publicada.
  - **C. Comparación de versiones (Diff):** Herramienta visual que muestre una comparación estructurada antes de publicar: sesiones agregadas (verde), eliminadas (rojo), cambios de docente, aula, sede, recurso, fecha, día, período, hora, sección, asignatura o duración (amarillo/naranja), y sesiones sin cambios. Identificar cada sesión mediante una identidad estable.
  - **D. Publicación:** Ejecutar validaciones definitivas al solicitar la publicación; bloquear la publicación si existen conflictos duros; presentar confirmación con el resumen de cambios y el número de personas, secciones y recursos afectados; registrar usuario que publica, fecha, versión anterior, nueva versión y justificación; publicar de manera coherente para todas las vistas; gestionar fallos parciales; impedir sobrescritura por publicaciones concurrentes; permitir recuperar una versión anterior mediante una nueva publicación controlada sin borrar el historial; mantener las versiones históricas consultables.
  - **E. Integración con notificaciones:** Alimentar el proceso de notificación tras la publicación confirmada. La entrega de notificaciones debe tener su propio estado verificable en lote sin reportar falsas entregas.
- **Comportamiento esperado:** Los usuarios autorizados podrán preparar y revisar un horario en borrador sin afectar a estudiantes o docentes. Al publicar, el sistema mostrará exactamente qué cambiará mediante el diff y conservará la versión anterior para consulta y recuperación.
- **Criterios de aceptación:**
  - Editar un borrador no cambia la vista pública ni la del estudiante.
  - La comparación (Diff) detecta correctamente altas, bajas y modificaciones.
  - Dos usuarios que editan simultáneamente no pierden cambios silenciosamente.
  - Un borrador basado en una versión obsoleta no se publica sin reconciliar las diferencias.
  - La publicación falla si hay conflictos obligatorios.
  - Una publicación exitosa genera una nueva versión identificable.
  - La recuperación de una versión anterior conserva ambas versiones en el historial.
  - Las sesiones históricas y registros de asistencia no se modifican por la publicación de una nueva versión.
  - Las notificaciones se generan a partir de los cambios confirmados, no de los borradores.
  - Los reportes identifican la versión y el período correspondientes.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** Validación de conflictos, registro de auditoría, notificaciones, integraciones con asistencia, evaluaciones, calendario y portal, T-HOR-05.

---

### T-HOR-07 [P2] — Importación masiva de horarios y cuadrículas Excel con simulación previa (Dry-Run)

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** La importación masiva carece de una simulación previa ("Dry-Run") por fila que permita detectar errores, duplicados, referencias inexistentes y conflictos antes de guardar en la base de datos. Esto dificulta cargar horarios complejos y aumenta el riesgo de operaciones incompletas o datos inconsistentes.
- **Alcance específico:**
  - Importación de cuadrículas horarias desde Excel o CSV.
  - Carga de asignaciones de docentes, aulas y secciones.
  - Importación de actividades y evaluaciones cuando el formato lo admita.
  - Copia o migración de horarios entre períodos académicos.
- **Requisitos funcionales:**
  - **A. Plantillas y mapeo:** Proporcionar plantilla descargable con columnas documentadas y ejemplos válidos. Incluir campos obligatorios y opcionales para período, sección, asignatura, docente, día, bloque, hora, duración, aula y recursos. Permitir mapear columnas externas a campos reconocidos. Validar formatos de fechas, horas, códigos e identificadores sin crear referencias ficticias.
  - **B. Dry-Run obligatorio antes de confirmar:** Desarrollar el modo `Dry-Run` que procese el 100% de las filas del archivo sin modificar datos productivos. Mostrar vista previa con: total de filas detectadas, filas válidas (verde), con advertencias, filas inválidas (rojo con descripción del problema), registros nuevos, modificados, duplicados dentro del archivo, duplicados en base de datos, conflictos de docentes, secciones, aulas y recursos, problemas de capacidad/disponibilidad y referencias inexistentes. Cada fila debe indicar número de origen, estado, campo afectado y acción recomendada.
  - **C. Confirmación y ejecución:** Permitir descargar un reporte de errores en Excel para corregir el archivo original. Permitir cancelar sin alterar datos. Exigir confirmación explícita antes de guardar. Volver a comprobar conflictos e identificadores inmediatamente antes de escribir. Aplicar política de lote (por defecto no confirmar lote con errores bloqueantes; si se permite importación parcial, debe ser explícita). Procesar lotes de forma controlada con progreso. Registrar identificador de lote, usuario, fecha, filas procesadas/rechazadas en auditoría. Permitir reintentar filas fallidas sin duplicar las ya confirmadas. Recalcular validaciones si los datos cambian entre simulación y confirmación. Si se interrumpe, indicar qué registros se confirmaron y cuáles no.
  - **D. Actualización de registros existentes:** Distinguir entre crear una sesión nueva, actualizar una existente u omitir un registro utilizando claves estables e identificadores explícitos.
- **Comportamiento esperado:** Antes de guardar, el usuario conocerá el efecto exacto de la importación mediante la simulación. Ninguna fila inválida se aceptará silenciosamente y el sistema no creará duplicados por reintentos o por volver a importar el mismo archivo.
- **Criterios de aceptación:**
  - El modo `Dry-Run` procesa el 100% del archivo y produce una vista previa coherente con sus filas.
  - Un archivo con un docente o aula inexistente identifica la fila y el campo problemático.
  - Una colisión de aula o docente se detecta antes de confirmar.
  - Una importación cancelada no modifica los datos productivos.
  - Reimportar el mismo lote no crea bloques duplicados.
  - Los errores pueden descargarse con información suficiente para corregir el archivo original.
  - Los registros que se actualizarán se distinguen de los nuevos.
  - Si los datos cambian después del `Dry-Run`, las validaciones se ejecutan nuevamente.
  - Una interrupción permite identificar el estado de cada registro y recuperar la operación.
  - Las cantidades del resumen final coinciden con los registros confirmados.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** Estructura académica y horarios, T-HOR-01, validación de conflictos, permisos y auditoría, T-HOR-06.

---

### T-HOR-08 [P3] — Vista semanal imprimible, filtros por audiencia y caché local de la cuadrícula horaria

- **Componentes relacionados:** `js/teacher.js`, `js/student.js`, `js/ui-common.js`, `teacher-dashboard.html`, `student-dashboard.html`.
- **Problema detectado:** La visualización responsive y las consultas de horarios están implementadas, pero falta una vista semanal imprimible adaptada a la PWA (formato de bolsillo encuadrado) y una estrategia de caché local (IndexedDB) para consultar cuadrículas recientes de manera eficiente sin conexión a internet.
- **Alcance específico:**
  - Horarios de docentes, estudiantes, secciones, asignaturas, aulas y sedes.
  - Vista semanal imprimible (`@media print`).
  - Filtros por audiencia y período.
  - Caché local con IndexedDB en la PWA.
- **Requisitos funcionales:**
  - **A. Vista semanal e impresión:** Permitir seleccionar período académico, semana, sección, docente, estudiante o aula según permisos. Mostrar días, intervalos horarios, asignaturas, docentes, aulas y ubicaciones. Diferenciar clases, evaluaciones, actividades y cancelaciones mediante etiquetas accesibles. Incluir nombre institucional, período académico, rango de fechas y fecha de generación. Diseñar la vista de impresión mediante `@media print` para papel común, evitando cortes de bloques, encabezados repetidos innecesarios y controles de interfaz. Adaptar en móvil a tarjetas o cuadrícula desplazable. Distinguir la versión publicada de versiones históricas.
  - **B. Filtros por audiencia y permisos:** Estudiantes/familias consultan únicamente horarios publicados correspondientes a su expediente. Docentes consultan sus asignaciones. Coordinadores y Administradores consultan vistas institucionales. Aplicar filtros en el servidor.
  - **C. Caché local con IndexedDB:** Almacenar localmente una representación de los horarios publicados consultados recientemente en IndexedDB. Asociar cada entrada con usuario, período académico, tipo de vista y versión. Invalidar o actualizar la caché tras notificaciones de cambios. Mostrar fecha y hora de la última actualización offline. Cuando no haya conexión, consultar la copia local disponible y advertir claramente su antigüedad. Si la caché está corrupta, descartarla sin bloquear la consulta en línea. No mezclar datos de diferentes usuarios ni mantener información accesible tras cerrar sesión.
- **Comportamiento esperado:** Los usuarios autorizados podrán consultar, filtrar e imprimir los horarios con claridad. Las consultas recientes podrán mantenerse disponibles sin conexión cuando exista una copia local válida, distinguiendo los datos almacenados localmente de los confirmados por el servidor.
- **Criterios de aceptación:**
  - La impresión de un horario semanal genera un formato PDF/papel perfectamente encuadrado y legible sin controles de UI.
  - La cuadrícula horaria publicada se almacena en IndexedDB y permanece consultable sin conexión a internet.
  - Un estudiante no puede acceder a horarios privados de otros usuarios modificando parámetros o solicitudes.
  - Un borrador no aparece en la vista pública ni en la caché de estudiantes.
  - Una actualización publicada invalida o actualiza la caché correspondiente.
  - Sin conexión, se consulta la cuadrícula almacenada mostrando su fecha de actualización.
  - Cambiar de cuenta elimina la caché de la cuenta anterior.
  - Las vistas en móvil, escritorio e impresión muestran la misma asignación académica.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** Visualización actual de horarios, sistema de autenticación y permisos, publicación y versionado (T-HOR-06), PWA IndexedDB / Service Worker.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE PLANIFICACIÓN ACADÉMICA Y HORARIOS

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-HOR-01.** Control transaccional y prevención de reservas dobles en horarios, aulas y recursos | **P1** | `createClassSchedule` / `checkScheduleConflict` |
| **2** | **T-HOR-02.** Detección de sobrecarga y conflictos en la planificación de exámenes y evaluaciones | **P1** | `createCalendarEvent` / `exam-service` |
| **3** | **T-HOR-03.** Configuración de bloques consecutivos, descansos y carga laboral docente | **P1** | `TurnosAlmuerzo` / Horarios |
| **4** | **T-HOR-04.** Matriz de tiempos de traslado entre sedes y edificios | **P1** | `SedesAulas` |
| **5** | **T-HOR-06.** Versionado de borradores, comparación de cambios (Diff) y publicación controlada | **P2** | `HorariosClases` |
| **6** | **T-HOR-05.** Motor algorítmico CSP para generación y optimización automática de horarios | **P2** | T-HOR-01 |
| **7** | **T-HOR-07.** Importación masiva de horarios y cuadrículas Excel con simulación previa (Dry-Run) | **P2** | Excel import engine |
| **8** | **T-HOR-08.** Vista semanal imprimible, filtros por audiencia y caché local IndexedDB | **P3** | UI / PWA |

---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE DE AULA VIRTUAL Y GESTIÓN AVANZADA DEL APRENDIZAJE (LMS AVANZADO)

### T-LMS-01 [P1] — Control de concurrencia e integridad en cierres de período y publicación masiva de calificaciones

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`closePeriodGradebook`, `saveGradebookGrades`), `backend/task-service/Code.gs`, `js/teacher.js`.
- **Problema detectado:** Las operaciones de cierre de períodos académicos y publicación masiva de calificaciones pueden ejecutarse simultáneamente. Sin control de concurrencia suficiente (`LockService.getScriptLock()`), dos docentes o procesos podrían sobrescribir cambios, generar resultados inconsistentes o publicar calificaciones basadas en información desactualizada sobre `CalificacionesEstudiantes` y `CierresPeriodos`.
- **Alcance de los cambios:**
  - Revisar las operaciones `closePeriodGradebook`, `saveGradebookGrades` y los procesos de publicación masiva relacionados.
  - Incorporar mecanismos de exclusión mutua mediante `LockService.getScriptLock()` con timeout de 10 segundos.
  - Implementar validaciones de integridad antes, durante y después de las operaciones.
  - Evitar cierres duplicados, publicaciones parciales no detectadas y modificaciones concurrentes sobre los mismos registros.
  - Mantener la protección existente de los períodos y años académicos cerrados (inalterabilidad server-side).
- **Requisitos funcionales:**
  1. Proteger con `LockService.getScriptLock()` con timeout de 10 segundos las llamadas a `saveGradebookGrades` y `closePeriodGradebook`.
  2. Cada operación de cierre debe comprobar que el período existe, pertenece al año académico esperado y todavía admite el cierre solicitado en `CierresPeriodos` dentro del bloqueo exclusivo.
  3. Antes de publicar un lote de calificaciones, debe validarse que los registros correspondan a estudiantes, asignaturas, secciones y períodos autorizados.
  4. El proceso debe impedir que dos operaciones incompatibles modifiquen simultáneamente el mismo conjunto de calificaciones.
  5. Las operaciones repetidas deben ser idempotentes: una solicitud duplicada no debe producir registros adicionales, cierres contradictorios ni publicaciones repetidas.
  6. Cuando existan modificaciones posteriores a la lectura inicial, el sistema debe detectar el conflicto y evitar que los datos nuevos sean reemplazados silenciosamente.
  7. La operación debe registrar su resultado, incluyendo registros procesados, omitidos, rechazados y errores.
  8. Si una operación masiva falla parcialmente, el sistema debe identificar los elementos afectados y permitir una recuperación segura sin duplicar los ya procesados.
  9. Debe conservarse la inmutabilidad de los períodos cerrados, salvo autorización expresa de Secretaría.
- **Comportamiento esperado:** El sistema coordina las operaciones concurrentes, verifica las condiciones académicas antes de confirmar los cambios y ofrece resultados inequívocos. Si no puede garantizarse la integridad, rechaza la operación o informa que requiere reintento.
- **Criterios de aceptación:**
  - Peticiones simultáneas sobre el libro de calificaciones son procesadas de forma secuencial sin pérdida de notas.
  - Dos solicitudes concurrentes de cierre sobre el mismo período no generan estados contradictorios.
  - Dos publicaciones simultáneas sobre un mismo conjunto de calificaciones no pierden actualizaciones válidas.
  - Repetir una solicitud exitosa no duplica registros ni envía publicaciones adicionales innecesarias.
  - Una modificación concurrente detectada no es sobrescrita silenciosamente.
  - Los errores parciales identifican los registros afectados y el resultado de cada operación.
  - Intentar guardar notas en un período cerrado sin permiso de Secretaría es rechazado en servidor.
  - Las pruebas confirman que las calificaciones publicadas coinciden con los datos persistidos.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `closePeriodGradebook`, `saveGradebookGrades`, `CierresPeriodos`, T-LMS-02.

---

### T-LMS-02 [P1] — Refuerzo de autorización y propiedad en el acceso al historial de entregas y comentarios

- **Componentes relacionados:** `backend/task-service/Code.gs` (`getSubmissionComments`, `addSubmissionComment`, `getSubmissionVersions`), `js/api.js`.
- **Problema detectado:** Los endpoints `getSubmissionComments` y `getSubmissionVersions` reciben el `entregaId` o `tareaId` enviado por el cliente pero necesitan validaciones estrictas de propiedad y autorización mediante `assertRecordOwnership`. Una matriz general de permisos no es suficiente si una solicitud puede consultar el identificador de una entrega perteneciente a otro estudiante o curso.
- **Alcance de los cambios:**
  - Revisar los endpoints y las funciones auxiliares que resuelven entregas, estudiantes, docentes y cursos.
  - Incorporar o reforzar `assertRecordOwnership` y comprobaciones equivalentes necesarias en el servidor.
  - Verificar que los controles se ejecuten en el servidor antes de devolver datos.
  - Aplicar el mismo criterio a cualquier endpoint auxiliar que exponga archivos, comentarios o versiones vinculadas a una entrega.
- **Requisitos funcionales:**
  1. Un estudiante solo puede consultar las versiones y comentarios de sus propias entregas (`authenticatedUserId === targetUserId`).
  2. Un docente solo puede acceder a las entregas de las asignaturas y secciones que tiene autorizadas.
  3. Un administrador académico solo puede consultar los datos que permita su rol efectivo.
  4. Los familiares o tutores solo pueden consultar información de sus hijos vinculados en `RelacionesFamiliares`.
  5. La autorización debe verificarse utilizando relaciones académicas persistidas, no únicamente identificadores enviados por el cliente.
  6. Los identificadores de entrega, estudiante, sección o asignatura proporcionados por el cliente no deben considerarse prueba de propiedad.
  7. Los comentarios privados no deben exponerse a usuarios que no participen en la relación autorizada de revisión.
  8. Los enlaces o identificadores de archivos no deben permitir eludir las comprobaciones del endpoint.
  9. Los intentos de acceso denegados deben producir una respuesta controlada `403 Forbidden` y registrar el evento `AUTH_PERMISSION_DENIED` en auditoría.
- **Comportamiento esperado:** Una solicitud autorizada devuelve exclusivamente las versiones y comentarios correspondientes al registro permitido. Una solicitud no autorizada se rechaza con `403 Forbidden`.
- **Criterios de aceptación:**
  - Un estudiante no puede consultar las versiones de otro estudiante cambiando el identificador de entrega.
  - Alterar el `entregaId` en una llamada AJAX devuelve error `403 Forbidden` a usuarios no autorizados.
  - Un estudiante no puede consultar comentarios privados de otra persona.
  - Un docente sin asignación a una sección no puede acceder a sus entregas mediante llamadas directas.
  - Los familiares únicamente pueden consultar comentarios y versiones de sus hijos vinculados en `RelacionesFamiliares`.
  - La autorización se mantiene aunque se omitan o alteren campos enviados por el frontend.
  - Los archivos privados no quedan accesibles mediante enlaces obtenidos desde una respuesta no autorizada.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** Matriz `ROLE_PERMISSIONS`, `RelacionesFamiliares`, `assertRecordOwnership`.

---

### T-LMS-03 [P2] — Ordenamiento visual de materiales y gestión de contenidos compartidos entre secciones

- **Componentes relacionados:** `backend/task-service/Code.gs` (`getStudyMaterials`, `createStudyMaterial`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** Los materiales en `MaterialesEducativos` están organizados de forma plana por fecha de creación sin una columna de orden numérico que permita el reordenamiento manual por drag-and-drop. Tampoco existe un modelo claro de reutilización con sincronización controlada entre secciones sin duplicar archivos.
- **Alcance de los cambios:**
  - Incorporar la columna `OrdenPosicion` en la hoja `MaterialesEducativos` y habilitar reordenamiento visual drag-and-drop/teclado.
  - Persistir el orden en el backend mediante el endpoint `reorderStudyMaterials` sin recrear ni eliminar registros.
  - Diseñar un mecanismo para reutilizar materiales entre asignaturas, cursos o secciones sin generar copias divergentes involuntarias.
  - Permitir distinguir entre materiales compartidos y copias independientes.
- **Requisitos funcionales:**
  1. Agregar la columna `OrdenPosicion` en la hoja `MaterialesEducativos` y desarrollar el endpoint `reorderStudyMaterials`.
  2. Los docentes autorizados deben poder cambiar el orden de materiales dentro de una unidad y reorganizar unidades y temas.
  3. La operación debe actualizar la posición sin eliminar ni recrear los materiales, evitando perder identificadores, archivos o historial.
  4. El sistema debe mantener un campo de orden estable y definir un comportamiento determinista para registros antiguos.
  5. Si dos usuarios reorganizan simultáneamente la misma estructura, detectar o resolver el conflicto sin perder cambios.
  6. Permitir vincular un mismo recurso compartido (`MaterialId`) a múltiples aulas virtuales manteniendo sincronizadas las actualizaciones.
  7. Al reutilizar un material, el docente elige entre: crear una copia independiente o vincularlo como compartido.
  8. Indicar en cuántas secciones se utiliza un material compartido antes de modificarlo y permitir previsualizar el alcance.
  9. Permitir retirar un material de una sección sin eliminarlo de las demás.
  10. El reordenamiento debe funcionar con ratón, teclado y dispositivos móviles.
- **Comportamiento esperado:** El docente organiza el aula sin recrear registros. Los materiales compartidos se actualizan de acuerdo con su modalidad explícita de vinculación, mientras que las copias independientes conservan su contenido propio.
- **Criterios de aceptación:**
  - Cambiar el orden de cinco materiales y recargar la página conserva exactamente la secuencia establecida.
  - Reordenar elementos no modifica sus identificadores ni elimina archivos relacionados.
  - Un material compartido actualizado por el autor/coordinador refleja los cambios en todas las secciones vinculadas.
  - Retirar un vínculo no elimina las demás relaciones ni los archivos todavía utilizados.
  - El orden se conserva en la vista del estudiante y en móviles.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `MaterialesEducativos`, `AulasVirtuales`, endpoints de materiales.

---

### T-LMS-04 [P2] — Módulo de anotación visual directa sobre entregas en PDF

- **Componentes relacionados:** `teacher-dashboard.html`, `js/teacher.js`, `backend/task-service/Code.gs`.
- **Problema detectado:** La revisión permite calificar y comentar entregas, pero carece de un lienzo integrado sobre canvas (`pdf-lib` / `PDF.js`) para realizar marcas o anotaciones visuales directamente sobre documentos PDF entregados por los alumnos.
- **Alcance de los cambios:**
  - Incorporar un visor de PDF integrado en el modal de revisión de entregas.
  - Permitir anotaciones visuales sobre canvas sin modificar el archivo original enviado por el estudiante.
  - Guardar el PDF anotado como una nueva versión en `EntregasVersiones` con etiqueta `AnotadoDocente`.
  - Integrar las anotaciones con los comentarios existentes y el proceso de devolución.
- **Requisitos funcionales:**
  1. Integrar visor interactivo con capa de dibujo/estampación sobre canvas utilizando `pdf-lib` o `PDF.js`.
  2. Permitir agregar anotaciones de texto, resaltados, trazos libres y marcas gráficas.
  3. Guardar las coordenadas normalizadas correspondientes a la escala y rotación del documento.
  4. Guardar el documento PDF anotado como una nueva versión en `EntregasVersiones` con etiqueta `AnotadoDocente`.
  5. El archivo original enviado por el estudiante debe permanecer 100% intacto.
  6. El estudiante debe poder visualizar o descargar la copia anotada directamente desde su panel de entregas tras la devolución.
  7. Admitir navegación entre páginas, zoom, rotación y pantalla táctil en móviles sin desplazar las anotaciones.
  8. Si el documento no es un PDF válido, mostrar un error claro sin declarar la revisión como completada.
- **Comportamiento esperado:** El docente revisa el documento en contexto, señala errores concretos en el canvas y devuelve una versión anotada. El estudiante consulta la corrección visual preservando su archivo original.
- **Criterios de aceptación:**
  - Una anotación creada en una página aparece en la misma posición al volver a abrir el documento.
  - Zoom y rotación no desplazan las anotaciones del contenido señalado.
  - El estudiante descarga o previsualiza el PDF con las anotaciones del profesor preservando el original.
  - El archivo original conserva su integridad en `EntregasVersiones`.
  - Funciona correctamente en escritorio y dispositivos táctiles móviles.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `EntregasVersiones`, visor PDF (`pdf-lib` / `PDF.js`), sistema de comentarios y devoluciones.

---

### T-LMS-05 [P2] — Soporte de paquetes e-learning interactivos en estándar SCORM 1.2 y SCORM 2004

- **Componentes relacionados:** `backend/task-service/Code.gs`, `js/teacher.js`, `js/student.js`, `student-dashboard.html`.
- **Problema detectado:** La plataforma no cuenta con un reproductor ni un importador de objetos de aprendizaje interactivos empaquetados bajo estándares SCORM (zip con imsmanifest.xml), lo que impide incorporar cursos externos e integrar sus puntuaciones.
- **Alcance de los cambios:**
  - Implementar módulo de importación, validación, almacenamiento y ejecución de paquetes SCORM 1.2 y 2004.
  - Incorporar un reproductor iframe aislado para el contenido e-learning.
  - Implementar la API `LMSInitialize`, `LMSSetValue`, `LMSCommit`, `LMSFinish` en JavaScript.
  - Integrar la puntuación SCORM directamente con `CalificacionesEstudiantes`.
- **Requisitos funcionales:**
  1. Desarrollar el visor e importador de módulos SCORM (`importSCORMPackage`, `getSCORMTrackingData`).
  2. Validar el paquete ZIP, el archivo `imsmanifest.xml`, la estructura de recursos y la versión del estándar (SCORM 1.2 vs SCORM 2004).
  3. Rechazar paquetes malformados o inseguros con un informe explícito.
  4. Implementar la API client-side `LMSInitialize`, `LMSSetValue`, `LMSCommit`, `LMSFinish` (y equivalentes SCORM 2004) para comunicar tiempo, progreso, estado (`cmi.core.lesson_status` / `cmi.completion_status`) y nota.
  5. Registrar la puntuación obtenida directamente en `CalificacionesEstudiantes` según la configuración explícita de la actividad.
  6. Reanudar la sesión del estudiante restaurando el estado guardado (`cmi.suspend_data`).
  7. Aislar el contenido ejecutable dentro del reproductor iframe sin conceder acceso a credenciales o APIs administrativas.
- **Comportamiento esperado:** Un paquete SCORM subido a una unidad se ejecuta en un reproductor iframe. El estudiante interactúa, su progreso se guarda y al finalizar, su nota se transfiere a la libreta de calificaciones.
- **Criterios de aceptación:**
  - Un paquete comprimido SCORM 1.2 o 2004 se importa, ejecuta y guarda progreso/puntuación.
  - La finalización del módulo SCORM registra automáticamente la nota en `CalificacionesEstudiantes`.
  - Intentos de estudiantes diferentes permanecen aislados.
  - Reabrir la actividad restaura el estado de suspensión guardado.
  - Paquetes corruptos se rechazan con un diagnóstico claro.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `MaterialesEducativos`, `CalificacionesEstudiantes`, reproductor iframe SCORM API.

---

### T-LMS-06 [P2] — Motor de alertas tempranas por riesgo de incumplimiento académico

- **Componentes relacionados:** `backend/task-service/Code.gs`, `backend/user-service/Code.gs`, `js/ui-common.js`.
- **Problema detectado:** El sistema registra entregas pendientes y vencidas, pero no emite una alerta automática al orientador o tutor cuando un estudiante acumula un patrón de tres o más actividades consecutivas sin entregar.
- **Alcance de los cambios:**
  - Desarrollar la rutina `evaluateAcademicRiskAlerts` para detectar patrones de incumplimiento.
  - Generar alertas automáticas en `CasosSeguimiento` o `IncidenciasAsistencia`.
  - Notificar al tutor legal a través de la bandeja multicanal del portal familiar (`sendMultiChannelNotification`).
- **Requisitos funcionales:**
  1. Desarrollar la rutina `evaluateAcademicRiskAlerts` que analice entregas no realizadas por estudiante en el período activo.
  2. Al detectar 3 o más tareas consecutivas sin entregar, generar automáticamente una notificación de riesgo en `IncidenciasAsistencia` o `CasosSeguimiento`.
  3. Diferenciar entregas ausentes de actividades no disponibles, canceladas, excusadas o no asignadas. Excluir borradores.
  4. Mostrar cada alerta con el estudiante, asignatura, actividades implicadas, fechas y regla que la originó.
  5. Permitir marcar la alerta como atendida o descartada registrando responsable y fecha.
  6. Evitar alertas duplicadas en cada ejecución mediante deduplicación por estado activo.
  7. Notificar al tutor legal y orientador mediante `sendMultiChannelNotification`.
- **Comportamiento esperado:** El docente y orientador reciben una alerta preventiva cuando un estudiante acumula incumplimientos consecutivos. Al entregar los trabajos pendientes, el estado de la alerta se actualiza automáticamente.
- **Criterios de aceptación:**
  - La acumulación de 3 o más tareas no entregadas dispara la alerta de riesgo académico para el orientador y tutor.
  - La resolución o entrega posterior de los trabajos actualiza/cierra la alerta.
  - Ejecuciones repetidas no duplican alertas activas.
  - Actividades en borrador o futuras no producen alertas falsas.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `Entregas`, `CasosSeguimiento`, `IncidenciasAsistencia`, `sendMultiChannelNotification`.

---

### T-LMS-07 [P3] — Limpieza programada y segura de archivos temporales de cargas reanudables

- **Componentes relacionados:** `backend/task-service/Code.gs` (`cancelUploadSession`, `.temp_resumable_uploads`).
- **Problema detectado:** Cuando una sesión de carga reanudable es cancelada o abandonada antes de completar el primer fragmento, pueden quedar carpetas temporales huérfanas en `.temp_resumable_uploads` consumiendo almacenamiento en Google Drive.
- **Alcance de los cambios:**
  - Crear la función programada `purgeOrphanResumableUploads` (Apps Script Time-Driven Trigger).
  - Identificar carpetas temporales con más de 48 horas en estado `INACTIVE` o `CANCELLED`.
  - Moverlas de forma segura a la papelera de Google Drive sin afectar cargas activas o completadas.
  - Registrar el resultado de la limpieza en el log de auditoría.
- **Requisitos funcionales:**
  1. Crear la función programada `purgeOrphanResumableUploads`.
  2. Identificar carpetas temporales en `.temp_resumable_uploads` con más de 48 horas de inactividad o en estado `CANCELLED`.
  3. Mover las carpetas identificadas a la papelera de Drive.
  4. No eliminar bajo ninguna circunstancia cargas activas en curso ni archivos finales reconstruidos.
  5. Ejecutar la limpieza por lotes y soportar modo simulación (Dry-Run).
  6. Registrar en auditoría la cantidad de carpetas depuradas y espacio liberado.
- **Comportamiento esperado:** La tarea periódica elimina automáticamente las cargas temporales abandonadas con más de 48 horas, manteniendo limpio el almacenamiento de Drive sin interferir con usuarios activos.
- **Criterios de aceptación:**
  - Limpieza periódica elimina carpetas temporales incompletas con más de 48 horas.
  - Sesiones activas o archivos reconstruidos permanecen 100% intactos.
  - El proceso es seguro, idempotente y queda registrado en auditoría.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `.temp_resumable_uploads`, `SesionesCargaResumible`.

---

### T-LMS-08 [P2] — Plantillas de comentarios predefinidos y calificación masiva por lote

- **Componentes relacionados:** `js/teacher.js`, `teacher-dashboard.html`, `backend/task-service/Code.gs`.
- **Problema que debe resolverse:** La revisión individual de tareas exige escribir comentarios repetitivos para errores comunes, ralentizando el proceso de retroalimentación en grupos grandes.
- **Alcance de los cambios:**
  - Incorporar un selector de "Comentarios Frecuentes / Plantillas" en el modal de revisión docente.
  - Permitir al profesor administrar su banco personal de comentarios rápidos.
  - Habilitar la calificación por lotes para entregas seleccionadas con confirmación previa.
- **Requisitos funcionales:**
  1. Incorporar un selector de "Comentarios Frecuentes / Plantillas" en el modal de calificación docente.
  2. Permitir al profesor crear, editar y eliminar comentarios rápidos en su biblioteca personal.
  3. Permitir insertar un comentario predefinido y editarlo antes de guardarlo en la entrega.
  4. Habilitar la calificación masiva por lote para entregas seleccionadas, solicitando confirmación del número de alumnos afectados.
  5. Garantizar que la calificación por lote no sobrescriba comentarios o revisiones individuales previamente realizadas salvo confirmación explícita.
- **Comportamiento esperado:** El docente inserta observaciones comunes con un solo clic durante la corrección y puede calificar trabajos homogéneos por lote sin perder precisión.
- **Criterios de aceptación:**
  - El docente inserta comentarios frecuentes con un solo clic durante la calificación.
  - La calificación masiva actualiza las entregas seleccionadas sin sobrescribir revisiones individuales previas.
  - Los comentarios quedan vinculados a la entrega en `ComentariosEntregas`.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `ComentariosEntregas`, `gradeSubmission`, `teacher-dashboard.html`.

---

### T-LMS-09 [P2] — Mejoras en la administración del banco de preguntas y reutilización de evaluaciones

- **Componentes relacionados:** `questions-bank.json` (771 reactivos), `backend/exam-service/Code.gs`, `js/quizpro.js`, `js/exam.js`.
- **Problema detectado:** Existe un banco estático de 771 reactivos y soporte para diversos tipos de preguntas, pero se necesita asegurar que su gestión permita mantener calidad, trazabilidad, reutilización y control de cambios sin alterar evaluaciones históricas.
- **Requisitos funcionales:**
  1. Cada pregunta debe disponer de identificador estable, materia, grado, tema y nivel de dificultad.
  2. Clasificar por categorías y permitir búsqueda y filtrado dinámico.
  3. Mantener en un registro único enunciado, opciones, respuesta correcta, puntuación y retroalimentación.
  4. Los cambios a preguntas utilizadas en exámenes previamente realizados deben crear una versión nueva. Un cambio posterior no debe alterar notas ni respuestas históricas.
  5. Permitir reutilizar preguntas entre exámenes sin duplicar el contenido maestro.
  6. La selección aleatoria por tema debe registrar las preguntas concretas presentadas en el intento del estudiante.
  7. Permitir previsualizar preguntas antes de incluirlas en un examen.
- **Criterios de aceptación:**
  - Preguntas se localizan por materia, grado y tema.
  - Editar una pregunta no modifica el enunciado ni el resultado de un intento histórico.
  - Intentos aleatorios conservan el registro exacto de las preguntas presentadas.
  - La reutilización no produce duplicados en el banco maestro.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `questions-bank.json`, `PreguntasExamen`, `exam-service`.

---

### T-LMS-10 [P2] — Mejoras de publicación, cierre de actividades y gestión de entregas tardías

- **Componentes relacionados:** `backend/task-service/Code.gs` (`createTask`, `submitAssignment`), `js/teacher.js`, `js/student.js`.
- **Problema detectado:** La creación de tareas admite fecha límite, pero se requiere garantizar en el servidor la distinción entre fecha de vencimiento (puntual vs tardía) y fecha de cierre definitivo (bloqueo total de entregas).
- **Requisitos funcionales:**
  1. Validar en el servidor `fechaDisponible` (apertura), `fechaLimite` (vencimiento) y `fechaCierre` (cierre estricto).
  2. Entregas recibidas entre vencimiento y cierre se registran con estado `EntregadaTarde` aplicando la regla de penalización configurada.
  3. Intentos de entrega posteriores a `fechaCierre` son rechazados en el servidor con mensaje informativo salvo excepción autorizada por el docente.
  4. La reapertura excepcional o prórroga individual aplica exclusivamente al estudiante o grupo autorizado.
  5. Todas las fechas se evalúan según la zona horaria institucional configurada.
- **Criterios de Aceptación:**
  - Entregas anteriores al vencimiento se marcan como puntuales.
  - Entregas entre vencimiento y cierre se marcan como `EntregadaTarde`.
  - Intentos posteriores al cierre definitivo son bloqueados por el servidor.
  - Excepciones individuales quedan auditadas y no alteran la fecha del resto del grupo.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `createTask`, `submitAssignment`, `Tareas`.

---

### T-LMS-11 [P2] — Protección contra archivos maliciosos y validación avanzada de cargas

- **Componentes relacionados:** `backend/task-service/Code.gs` (`uploadFile`, `initiateResumableUpload`, `uploadChunk`, `reconstructFileParts`), `js/student.js`.
- **Problema detectado:** La validación simple por extensión o MIME type declarado no es suficiente para prevenir archivos ejecutables disfrazados de documentos en entregas o materiales.
- **Requisitos funcionales:**
  1. Validar tamaño máximo, extensión permitida y firma real del archivo (magic bytes / header) en servidor.
  2. Rechazar automáticamente archivos ejecutables (`.exe`, `.bat`, `.sh`, `.vbs`, `.js` ejecutable) o comprimidos con firmas no autorizadas.
  3. Comprobar la integridad de la reconstrucción de fragmentos en cargas reanudables.
  4. Archivos no verificados se mantienen en estado de inspección antes de quedar disponibles para descarga pública.
  5. Mostrar mensajes comprensibles sin revelar detalles de infraestructura interna.
- **Criterios de Aceptación:**
  - Documentos válidos de formatos autorizados se procesan correctamente.
  - Archivos ejecutables renombrados como `.pdf` o `.docx` son detectados y rechazados por el servidor.
  - Cargas incompletas o corruptas no generan archivos utilizables.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `uploadFile`, `reconstructFileParts`, `SesionesCargaResumible`.

---

### T-LMS-12 [P2] — Versionado explícito de materiales publicados y control de cambios con impacto académico

- **Componentes relacionados:** `backend/task-service/Code.gs` (`createStudyMaterial`, `updateTask`), `js/teacher.js`.
- **Problema detectado:** Los materiales y guías de estudio deben mantener un historial de versiones para que la modificación de un recurso no altere la evidencia con la que los estudiantes trabajaron en fechas anteriores.
- **Requisitos funcionales:**
  1. Cada actualización relevante de un material o instrucción de tarea genera un registro histórico en `MaterialesVersiones` o `TareasVersiones`.
  2. Registrar autor, fecha, hora y descripción del cambio.
  3. La entrega del estudiante mantiene la referencia a la versión de las instrucciones vigente en la fecha de su envío.
  4. Permitir consultar e inspeccionar versiones anteriores del material.
  5. La eliminación de una tarea con entregas registradas se procesa mediante archivado lógico (`Inactiva`), nunca borrado físico.
- **Criterios de Aceptación:**
  - Editar un material publicado conserva la versión previa en el historial.
  - Las entregas realizadas conservan el vínculo con las instrucciones originales.
  - Desactivar o archivar una tarea no elimina sus entregas ni calificaciones.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `MaterialesEducativos`, `Tareas`, `EntregasVersiones`.

---

### T-LMS-13 [P2] — Integridad y reconciliación entre entregas, calificaciones, informes y expediente académico

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`saveGradebookGrades`, `closePeriodGradebook`), `backend/task-service/Code.gs`, `backend/academic-service/Code.gs`.
- **Problema detectado:** Garantizar la consistencia absoluta e idempotencia entre las notas asignadas en el aula virtual, el libro de calificaciones y el expediente definitivo del estudiante.
- **Requisitos funcionales:**
  1. Toda calificación debe mantener una relación unívoca con el estudiante, la actividad de origen, la materia y el período académico.
  2. Implementar rutinariamente comprobación de idempotencia en `saveGradebookGrades` para evitar duplicados por reintentos AJAX.
  3. Generar informe de conciliación antes de publicar o cerrar un período.
  4. La modificación de notas cerradas requiere un flujo explícito de autorización por Secretaría con registro en auditoría.
  5. Los reportes e informes académicos deben excluir notas en borrador.
- **Criterios de Aceptación:**
  - Las calificaciones oficiales coinciden 100% entre el aula virtual, la libreta de notas y el expediente.
  - Reintentar el guardado de notas no genera registros duplicados.
  - Intentos de alterar notas de períodos cerrados son bloqueados en el servidor.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `CalificacionesEstudiantes`, `CierresPeriodos`, `saveGradebookGrades`.

---

### T-LMS-14 [P2] — Gestión avanzada de rúbricas y consistencia de la calificación

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`getRubrics`, `saveRubric`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** Se requiere asegurar que el cálculo de notas mediante rúbricas sea estricta y determinísticamente consistente con la escala de calificación oficial (0-100%).
- **Requisitos funcionales:**
  1. Validar que la suma de ponderaciones de criterios en una rúbrica equivalga exactamente al 100% del puntaje asignado.
  2. Soporte para puntuaciones parciales y comentarios específicos por criterio.
  3. Al calificar una entrega, el resultado se calcula automáticamente como `∑(PuntosCriterio * Ponderacion)` y se transfiere al libro de calificaciones.
  4. La versión de la rúbrica aplicada a una entrega queda congelada en `EntregasVersiones` para que cambios futuros en la plantilla no alteren calificaciones históricas.
  5. Permitir la previsualización de la rúbrica tanto para el docente como para el estudiante antes de la entrega.
- **Criterios de Aceptación:**
  - El cálculo de la nota por rúbrica es exacto y automático.
  - Modificar una plantilla de rúbrica no afecta las entregas previamente evaluadas.
  - Ponderaciones inconsistentes (<100% o >100%) son rechazadas al guardar la rúbrica.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `RubricasEvaluacion`, `CalificacionesEstudiantes`, `gradeSubmission`.

---

### T-LMS-15 [P3] — Mejoras de navegación, accesibilidad y organización del aula virtual

- **Componentes relacionados:** `teacher-dashboard.html`, `student-dashboard.html`, `js/ui-common.js`.
- **Problema detectado:** Optimizar la experiencia de usuario en cursos con volumen extenso de actividades y materiales, garantizando accesibilidad WCAG AA.
- **Requisitos funcionales:**
  1. Permitir colapsar y expandir unidades y temas en la vista del curso.
  2. Priorizar en el portal del estudiante las tareas pendientes próximas a vencer mediante un panel de resumen arriba de la vista general.
  3. Garantizar foco visible, contraste WCAG 2.2 AA y soporte completo de teclado (tecla `ESC` para cerrar modales).
  4. Ofrecer estados visuales claros (Pendiente, Entregada, Calificada, Devuelta) complementados con texto explicativo sin depender únicamente del color.
  5. Carga progresiva/paginada en listados de materiales para evitar degradación de rendimiento.
- **Criterios de Aceptación:**
  - Las secciones del curso se pueden colapsar y expandir de forma fluida.
  - Todos los modales y controles son accesibles mediante teclado y lectores de pantalla.
  - La visualización en pantallas móviles estrechas es 100% clara sin desplazamientos horizontales no deseados.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `teacher-dashboard.html`, `student-dashboard.html`, `js/ui-common.js`.

---

### T-LMS-16 [P3] — Reutilización de actividades entre cursos y secciones con control de alcance

- **Componentes relacionados:** `backend/task-service/Code.gs` (`createTask`), `js/teacher.js`.
- **Problema detectado:** Facilitar al docente la duplicación o asignación simultánea de tareas y proyectos a múltiples secciones sin duplicar información de estudiantes.
- **Requisitos funcionales:**
  1. Permitir seleccionar múltiples secciones de destino al crear o publicar una tarea.
  2. Permitir ajustar fechas límites específicas por sección antes de confirmar la publicación masiva.
  3. No copiar información personal, entregas, notas o comentarios de la sección de origen.
  4. La modificación posterior de una copia independiente sólo afecta a la sección seleccionada.
  5. Notificar a los estudiantes de cada sección destino una vez confirmada la creación.
- **Criterios de Aceptación:**
  - Una tarea se publica simultáneamente en varias secciones seleccionadas con sus respectivas fechas.
  - No se arrastran entregas ni datos de alumnos de la sección original.
  - Las copias creadas funcionan de manera autónoma.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `createTask`, `Tareas`, `js/teacher.js`.

---

### T-LMS-17 [P3] — Panel de seguimiento de progreso con indicadores accionables

- **Componentes relacionados:** `js/teacher.js`, `js/student.js`, `js/ui-common.js`, `generateInstitutionalReport`.
- **Problema detectado:** Proporcionar un tablero consolidado de avance pedagógico por curso, unidad y estudiante con indicadores visuales claros.
- **Requisitos funcionales:**
  1. Mostrar porcentaje de entregas realizadas vs pendientes por sección y asignatura.
  2. Visualizar distribución de calificaciones mediante `renderUniversalConfigurableChart`.
  3. Permitir filtrar por parcial, unidad, estado de entrega y grupo.
  4. Permitir la exportación del informe de progreso a Excel/PDF.
  5. Aislar estrictamente los datos de progreso por rol (el estudiante solo ve su propio avance; los tutores solo el de sus hijos).
- **Criterios de Aceptación:**
  - El docente visualiza el porcentaje de cumplimiento de entregas de todo su grupo.
  - El estudiante consulta su propio avance pedagógico sin ver datos de compañeros.
  - La exportación genera reportes limpios y coherentes con los datos reales.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `renderUniversalConfigurableChart`, `getStudentTasks`, `getTeacherActivity`.

---

### T-LMS-18 [P3] — Auditoría operativa y observabilidad de las tareas automáticas del aula

- **Componentes relacionados:** `backend/user-service/Code.gs` (`logStructuredEvent`), `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`.
- **Problema detectado:** Asegurar trazabilidad completa de todos los eventos automáticos del LMS (cierres de período, recordatorios, publicaciones masivas y limpiezas de temporales).
- **Requisitos funcionales:**
  1. Registrar en `RegistrosAuditoria` cada ejecución de procesos automáticos con timestamp, función, resultado y número de elementos procesados.
  2. Distinguir ejecuciones exitosas, parciales y fallidas.
  3. Permitir la consulta de logs del LMS desde el panel de auditoría estructurada para Administradores.
  4. Garantizar que los reintentos de procesos automáticos no generen registros o notificaciones duplicadas (idempotencia).
- **Criterios de Aceptación:**
  - Eventos automáticos quedan registrados en auditoría con su resultado explícito.
  - Errores de ejecución se notifican al Administrador sin interrumpir otros procesos.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `logStructuredEvent`, `RegistrosAuditoria`.

---

### T-LMS-19 [P3] — Mejoras en retroalimentación reutilizable y comunicación de revisiones

- **Componentes relacionados:** `backend/task-service/Code.gs` (`addSubmissionComment`, `getSubmissionComments`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** Enriquecer las opciones de retroalimentación en las revisiones de tareas con comentarios enriquecidos y estados claros.
- **Requisitos funcionales:**
  1. Permitir adjuntar enlaces de apoyo o documentos complementarios en los comentarios de revisión.
  2. Distinguir visualmente comentarios públicos (visibles para el estudiante) de notas internas del docente.
  3. Notificar al estudiante inmediatamente cuando se agregue una retroalimentación en su entrega.
  4. Mantener la privacidad de la comunicación dentro del canal oficial de la plataforma sin exponer contactos personales.
- **Criterios de Aceptación:**
  - Comentarios públicos son visibles en el portal del estudiante; notas internas permanecen ocultas.
  - Notificaciones al alumno se envían tras publicar el comentario.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `ComentariosEntregas`, `addSubmissionComment`.

---

### T-LMS-20 [P3] — Validación integral de recuperación y conservación de datos educativos

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`createSystemBackup`, `restoreSystemBackup`), `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`.
- **Problema detectado:** Garantizar que los respaldos del sistema incluyan la totalidad de materiales, entregas, rúbricas y calificaciones del aula virtual, asegurando su restauración sin pérdida de relaciones académicas.
- **Requisitos funcionales:**
  1. Incluir en el respaldo `createSystemBackup` las tablas `AulasVirtuales`, `MaterialesEducativos`, `Tareas`, `Entregas`, `EntregasVersiones`, `ComentariosEntregas`, `Examenes`, `PreguntasExamen`, `RubricasEvaluacion`, `CalificacionesEstudiantes` y `CierresPeriodos`.
  2. Garantizar que `restoreSystemBackup` preserve inalterables las calificaciones históricas de años cerrados.
  3. Verificar el hash checksum del respaldo antes de ejecutar cualquier restauración.
  4. Generar log de auditoría detallado tras cada operación de copia de seguridad o restauración.
- **Criterios de Aceptación:**
  - El respaldo genera un archivo JSON comprimido completo en Google Drive.
  - La restauración recupera la estructura del aula virtual y sus entregas sin alterar calificaciones históricas cerradas.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `createSystemBackup`, `restoreSystemBackup`, `CalificacionesEstudiantes`.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE AULA VIRTUAL Y GESTIÓN AVANZADA DEL APRENDIZAJE

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-LMS-01.** Control de concurrencia e integridad en cierres de período y libreta | **P1** | `closePeriodGradebook` / `saveGradebookGrades` |
| **2** | **T-LMS-02.** Refuerzo de autorización y propiedad en historial de entregas y comentarios | **P1** | `assertRecordOwnership` / RBAC |
| **3** | **T-LMS-10.** Mejoras de publicación, cierre de actividades y gestión de entregas tardías | **P2** | `submitAssignment` / Servidor |
| **4** | **T-LMS-11.** Protección contra archivos maliciosos y validación avanzada de cargas | **P2** | `uploadFile` / Magic bytes |
| **5** | **T-LMS-03.** Ordenamiento visual de materiales y gestión de contenidos compartidos | **P2** | `MaterialesEducativos` |
| **6** | **T-LMS-08.** Plantillas de comentarios predefinidos y calificación masiva por lote | **P2** | `ComentariosEntregas` |
| **7** | **T-LMS-14.** Gestión avanzada de rúbricas y consistencia de la calificación | **P2** | `RubricasEvaluacion` |
| **8** | **T-LMS-12.** Versionado explícito de materiales publicados y control de cambios | **P2** | `MaterialesEducativos` / Versiones |
| **9** | **T-LMS-13.** Integridad y reconciliación entre entregas, calificaciones y expediente | **P2** | `CalificacionesEstudiantes` |
| **10** | **T-LMS-04.** Módulo de anotación visual directa sobre entregas en PDF | **P2** | Visor PDF (`pdf-lib` / `PDF.js`) |
| **11** | **T-LMS-05.** Compatibilidad con paquetes educativos SCORM 1.2 y SCORM 2004 | **P2** | SCORM API |
| **12** | **T-LMS-06.** Motor de alertas tempranas por riesgo de incumplimiento académico | **P2** | `CasosSeguimiento` |
| **13** | **T-LMS-09.** Mejoras en la administración del banco de preguntas y evaluaciones | **P2** | `questions-bank.json` |
| **14** | **T-LMS-16.** Reutilización de actividades entre cursos y secciones con control de alcance | **P3** | `Tareas` / Multi-sección |
| **15** | **T-LMS-07.** Limpieza programada y segura de archivos temporales de cargas reanudables | **P3** | Drive cleanup |
| **16** | **T-LMS-17.** Panel de seguimiento de progreso con indicadores accionables | **P3** | Progress analytics |
| **17** | **T-LMS-18.** Auditoría operativa y observabilidad de tareas automáticas del aula | **P3** | `RegistrosAuditoria` |
| **18** | **T-LMS-19.** Mejoras en retroalimentación reutilizable y comunicación de revisiones | **P3** | `ComentariosEntregas` |
| **19** | **T-LMS-15.** Mejoras de navegación, accesibilidad y organización del aula virtual | **P3** | UI / WCAG AA |
| **20** | **T-LMS-20.** Validación integral de recuperación y conservación de datos educativos | **P3** | `createSystemBackup` |
