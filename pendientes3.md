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



---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE DE EVALUACIONES, CALIFICACIONES Y RESULTADOS ACADÉMICOS

### T-CAL-01 [P1] — Control de concurrencia y protección contra sobrescrituras en el guardado masivo de calificaciones

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`saveGradebookGrades`), `js/teacher.js`.
- **Problema detectado:** `saveGradebookGrades` actualiza calificaciones por lote sin un bloqueo exclusivo que proteja las operaciones concurrentes. Cuando dos docentes o usuarios autorizados modifican simultáneamente las mismas calificaciones, existe riesgo de que una operación sobrescriba los cambios de otra sin advertencia.
- **Requisitos funcionales:**
  - Incorporar un mecanismo de exclusión mutua en las operaciones de escritura que afecten al mismo conjunto de calificaciones.
  - Implementar `LockService.getScriptLock()` cuando corresponda al alcance compartido del servicio y adquirir el bloqueo antes de leer el estado que se utilizará para decidir qué datos guardar.
  - Definir un tiempo máximo de espera para obtener el bloqueo (10 segundos) y devolver un error controlado si no está disponible.
  - Liberar el bloqueo mediante un bloque `finally`, tanto cuando la operación finalice correctamente como cuando ocurra una excepción.
  - Validar los identificadores de evaluación, estudiante, asignatura, sección y período antes de modificar registros.
  - Evitar que una actualización parcial destruya campos no incluidos en la solicitud.
  - Detectar conflictos entre el estado leído por el cliente y el estado vigente en el servidor. Cuando dos usuarios editen el mismo registro, no sobrescribir automáticamente una versión más reciente sin una política de resolución explícita.
  - Mantener el comportamiento de permisos y el bloqueo de períodos cerrados e históricos.
  - Garantizar que los reintentos de una misma solicitud no generen duplicados ni apliquen dos veces una operación.
- **Cambios requeridos:**
  - Revisar el flujo completo de lectura, validación, cálculo y escritura de `saveGradebookGrades`.
  - Incorporar bloqueo, validaciones previas y liberación segura.
  - Implementar un mecanismo de detección de versiones o modificaciones concurrentes (versión de registro, marca de actualización o huella del estado original).
  - Definir el resultado de cada fila cuando un lote contenga registros válidos, inválidos o en conflicto.
  - Actualizar el frontend para informar qué calificaciones se guardaron, cuáles fallaron y cuáles requieren resolver un conflicto.
  - Registrar los conflictos relevantes en la bitácora de auditoría.
- **Comportamiento esperado:** Si dos usuarios intentan modificar una misma calificación, el sistema debe conservar una versión válida y comunicar el conflicto cuando corresponda. Si las operaciones afectan a estudiantes diferentes, no deben bloquearse innecesariamente.
- **Criterios de aceptación:**
  1. Dos solicitudes simultáneas sobre el mismo registro no provocan sobrescrituras silenciosas.
  2. Una solicitud que no consigue el bloqueo finaliza con un error controlado y permite reintentarla.
  3. Una excepción durante la escritura no deja el bloqueo retenido.
  4. Los reintentos no crean filas duplicadas ni duplican cambios.
  5. Los lotes informan resultados por registro, sin presentar como exitoso un lote que contenga errores no resueltos.
  6. Las reglas de autorización y cierre siguen aplicándose en el servidor.
  7. Las pruebas de concurrencia comprueban tanto registros compartidos como registros independientes.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** Ninguna tarea previa. Debe coordinarse con T-CAL-03, T-CAL-05 y T-CAL-07.

---

### T-CAL-02 [P1] — Validación estricta y coherencia de las ponderaciones de evaluación

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`saveEvaluationCategory`, `getEvaluationCategories`), `js/teacher.js`.
- **Problema detectado:** `saveEvaluationCategory` permite registrar ponderaciones cuya suma puede ser inferior o superior al 100 %. Esto puede producir resultados incorrectos, criterios de evaluación inconsistentes y diferencias entre lo configurado y lo que recibe el estudiante.
- **Requisitos funcionales:**
  - Validar las ponderaciones en el servidor, no solamente en la interfaz.
  - Determinar la suma por el ámbito exacto al que pertenecen las reglas: asignatura, sección, período, año lectivo y sistema de evaluación, según el modelo existente.
  - Exigir una suma del 100 % cuando el sistema configurado utilice ponderación porcentual total.
  - Permitir otros modelos de cálculo legítimos, como puntuación total acumulada, sin aplicarles indebidamente la regla del 100 %.
  - Impedir ponderaciones negativas, valores no numéricos, valores infinitos y combinaciones incompatibles.
  - Definir qué ocurre con categorías desactivadas, categorías opcionales y categorías sin actividades registradas.
  - Evitar que una categoría perteneciente a otro período, asignatura o configuración intervenga en el cálculo.
  - Mostrar el total actual, la diferencia respecto del 100 % y las categorías que originan el error.
  - Permitir guardar una configuración incompleta como borrador únicamente si el modelo de la plataforma lo admite y si no puede utilizarse para calcular o publicar notas (`esBorrador = true`).
  - Evitar que la modificación de una categoría cambie silenciosamente resultados de períodos ya cerrados.
- **Cambios requeridos:**
  - Añadir validación de integridad en `saveEvaluationCategory` y en cualquier operación que active o modifique un sistema de evaluación.
  - Centralizar las reglas de validación para que las distintas pantallas no implementen criterios diferentes.
  - Incorporar estados de configuración (borrador, válida, activa) compatibles con el modelo actual.
  - Presentar errores de validación específicos y accionables en la interfaz administrativa.
  - Validar la configuración completa antes de activar el sistema o permitir el cierre de un período.
- **Comportamiento esperado:** Una configuración porcentual no puede activarse mientras sus ponderaciones sean inconsistentes. Los usuarios reciben una explicación precisa del error y pueden corregirlo sin perder los valores introducidos.
- **Criterios de aceptación:**
  1. Una suma de 100 % se acepta cuando todas las categorías cumplen las reglas.
  2. Sumas de 99 %, 101 %, valores negativos y datos inválidos se rechazan para una configuración porcentual activa.
  3. Una configuración basada en puntos no se rechaza por no sumar 100 %.
  4. La validación se aplica incluso si se llama directamente al servicio backend.
  5. Las categorías de otra asignatura o período no se mezclan en la suma.
  6. La configuración inválida no puede utilizarse para publicar calificaciones.
  7. Una modificación de ponderaciones no altera los resultados históricos protegidos.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-CAL-03 para el versionado y aislamiento de las reglas.

---

### T-CAL-03 [P1] — Versionado de sistemas de evaluación e inalterabilidad de resultados históricos

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`saveGradebookGrades`, `closePeriodGradebook`), `backend/user-service/Code.gs`.
- **Problema detectado:** Las ponderaciones y reglas de evaluación pueden modificarse después de haber sido utilizadas. Aunque el sistema protege los años históricos frente a la edición ordinaria de notas, no se ha acreditado un aislamiento completo de las versiones de las reglas que produjeron los resultados originales.
- **Requisitos funcionales:**
  - Mantener una versión identificable de cada configuración de evaluación utilizada para calcular calificaciones.
  - Asociar las notas calculadas con la versión de las reglas aplicadas, incluyendo ponderaciones, escala, precisión, regla de redondeo y política de recuperación cuando corresponda.
  - Al cerrar un período, conservar una instantánea verificable en `CierresPeriodos` de la configuración y los resultados finales.
  - Impedir que editar una configuración activa modifique retroactivamente las notas publicadas o cerradas.
  - Permitir crear una nueva versión para períodos abiertos o para períodos futuros sin alterar las versiones anteriores.
  - Conservar la nota original, la nota resultante, la regla aplicada y la identidad del responsable de cualquier rectificación autorizada.
  - Preservar la inalterabilidad de años históricos mediante controles del servidor, aunque se intente llamar directamente a las funciones.
  - Definir un procedimiento administrativo excepcional para corregir errores históricos con autorización de Secretaría/Dirección sin habilitar una edición directa e invisible.
  - Diferenciar una recalculación de una rectificación manual y registrar ambas operaciones.
- **Cambios requeridos:**
  - Revisar el modelo de `CategoriasEvaluacion`, `CalificacionesEstudiantes` y `CierresPeriodos`.
  - Añadir identificadores de versión o instantáneas de configuración, evitando duplicar información sin necesidad.
  - Modificar los cálculos para utilizar la versión asociada al período y no simplemente la configuración activa más reciente.
  - Registrar una huella de integridad o un mecanismo equivalente que permita detectar modificaciones no autorizadas.
  - Establecer cómo se migrarán los datos históricos que no tienen una versión explícita de las reglas.
  - Evitar inventar retroactivamente una configuración histórica que no pueda demostrarse a partir de los datos disponibles.
- **Comportamiento esperado:** Una nota cerrada debe poder reproducirse con las reglas que se utilizaron cuando fue calculada. Una modificación futura de categorías o escalas no cambia por sí sola el expediente previamente publicado.
- **Criterios de aceptación:**
  1. Cambiar una ponderación activa no altera las notas de un período cerrado.
  2. Cada cierre conserva la versión de reglas utilizada.
  3. Una recalculación identifica expresamente la versión de origen y el motivo.
  4. Una rectificación deja trazabilidad del valor anterior y del nuevo.
  5. Una llamada directa al backend no puede eludir la protección de años históricos (`esAnoHistoricoAnterior === true`).
  6. Los datos antiguos sin versión quedan identificados como tales y no reciben versiones históricas ficticias.
  7. Los boletines y el expediente muestran los resultados correspondientes a la versión oficial del período.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-02, T-CAL-06, T-CAL-07 y T-CAL-12.

---

### T-CAL-04 [P1] — Validación de la relación familiar y autorización de acceso a reportes académicos

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`getStudentAcademicReport`), `backend/user-service/Code.gs` (`RelacionesFamiliares`), `js/api.js`.
- **Problema detectado:** Las consultas a `getStudentAcademicReport` deben verificar la relación entre el usuario solicitante y el estudiante cuando se trata de padres, tutores o responsables. Una autorización general por rol no basta para conceder acceso a los expedientes de cualquier alumno.
- **Requisitos funcionales:**
  - Validar la identidad autenticada en el servidor mediante `assertRecordOwnership` en cada solicitud de información académica protegida.
  - Si el solicitante es estudiante, limitar la consulta a su propio expediente (`authenticatedUserId === targetUserId`).
  - Si es padre, tutor o responsable, comprobar en `RelacionesFamiliares` que existe una relación válida y activa con el estudiante solicitado.
  - Aplicar las reglas institucionales correspondientes al estado de la relación, autorizaciones vigentes y posibles restricciones de acceso.
  - No confiar en identificadores de estudiante enviados por el frontend como prueba de autorización.
  - Aplicar la misma comprobación a boletines, historiales, resultados de recuperación, certificados, descargas PDF y cualquier endpoint que permita obtener información equivalente.
  - Evitar que una consulta por identificador, URL directa o modificación manual de parámetros permita acceder a datos de otro estudiante.
  - Responder con un error controlado `403 Forbidden` y registrar evento `AUTH_PERMISSION_DENIED` sin revelar si un estudiante existe cuando el solicitante no tiene autorización.
- **Cambios requeridos:**
  - Revisar `getStudentAcademicReport` y todas las funciones relacionadas con informes y descargas.
  - Centralizar la autorización por estudiante para evitar que distintos servicios implementen comprobaciones contradictorias.
  - Revisar los permisos de `ROLE_PERMISSIONS` en conjunto con las relaciones familiares.
  - Verificar que las descargas de documentos vuelvan a comprobar la autorización en el servidor y no dependan de una URL permanente accesible sin control.
- **Comportamiento esperado:** Cada usuario puede consultar exclusivamente los expedientes que le corresponde visualizar según su rol y relación autorizada.
- **Criterios de aceptación:**
  1. Un estudiante no puede consultar el expediente de otro cambiando el identificador enviado.
  2. Un familiar solo accede a estudiantes relacionados y autorizados en `RelacionesFamiliares`.
  3. Un familiar sin relación vigente no obtiene boletines ni historiales mediante endpoints alternativos.
  4. Los roles administrativos conservan el acceso que les corresponde por sus permisos institucionales.
  5. Las descargas de PDF aplican los mismos controles que la consulta en pantalla.
  6. Las pruebas negativas verifican que no se filtran calificaciones ni datos personales en los mensajes de error.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `RelacionesFamiliares`, `assertRecordOwnership`, `getStudentAcademicReport`.

---

### T-CAL-05 [P1] — Separación inequívoca entre nota cero, nota pendiente, actividad exenta y actividad no aplicable

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`getGradebookData`, `saveGradebookGrades`), `js/teacher.js`.
- **Problema detectado:** Los valores `null` devueltos por `getGradebookData` pueden convertirse implícitamente en `0` en `js/teacher.js`. Esto penaliza al estudiante antes de que exista una calificación definitiva y mezcla situaciones académicas diferentes.
- **Requisitos funcionales:**
  - Distinguir, como mínimo, entre:
    - Calificada: existe una nota válida, incluido el cero.
    - Pendiente: aún no se ha registrado una calificación (`null` / sin entregar).
    - Exenta: la actividad no debe penalizar al estudiante (`EX`) y se excluye del cálculo según la política institucional.
    - No aplicable: la actividad no corresponde al estudiante o al grupo.
    - No presentada: existe evidencia de que el estudiante no entregó o no realizó la actividad, con una política de puntuación definida.
    - Anulada: la actividad fue invalidada y no debe intervenir en el resultado.
  - No inferir que una actividad no presentada equivale a cero sin aplicar la política de evaluación configurada.
  - Evitar que una calificación pendiente se muestre como cero en la libreta, los gráficos, los promedios parciales y los boletines.
  - Excluir las actividades exentas del denominador o ponderación de acuerdo con la regla configurada.
  - Mostrar el estado de cada actividad mediante una etiqueta accesible, sin depender exclusivamente del color.
  - Impedir el cierre o la publicación en `closePeriodGradebook` cuando existan pendientes que incumplan las condiciones de cierre, o convertirlas automáticamente a 0 si no cuentan con prórroga autorizada.
  - Permitir que la institución defina cómo tratar ausencias justificadas, actividades recuperables y actividades anuladas.
- **Cambios requeridos:**
  - Revisar los valores de estado que devuelve el backend y el tratamiento de los valores vacíos en el frontend.
  - Centralizar el cálculo de promedios para evitar diferencias entre libro de notas, reportes, gráficos y PDF.
  - Añadir validaciones para impedir que un estado académico se convierta accidentalmente en otro durante el guardado.
  - Ajustar los filtros, contadores y alertas para diferenciar pendientes de calificaciones insuficientes.
- **Comportamiento esperado:** Una nota pendiente permanece pendiente y no reduce artificialmente el promedio. Un cero explícito sí participa en el cálculo conforme a la configuración. Una exención no perjudica al estudiante.
- **Criterios de aceptación:**
  1. Una casilla sin calificación no se transforma en cero al cargar, editar, guardar o imprimir.
  2. Una nota explícita de cero se conserva y participa en el cálculo.
  3. Una actividad exenta se excluye según la regla configurada.
  4. Una actividad no presentada recibe el tratamiento establecido por la política institucional.
  5. Los promedios de frontend y backend coinciden para los mismos datos.
  6. Los boletines identifican correctamente los estados pendientes o incompletos.
  7. El cierre detecta los pendientes que impiden cerrar el período.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-CAL-02, T-CAL-03 y T-CAL-06.

---

### T-CAL-06 [P2] — Política institucional de precisión decimal, redondeo y presentación de resultados

- **Componentes relacionados:** `backend/exam-service/Code.gs`, `js/teacher.js`, `js/student.js`, `js/ui-common.js`.
- **Problema detectado:** No existe una política homogénea acreditada para el número de decimales y el método de redondeo. Los cálculos del frontend, el backend y los informes impresos pueden producir resultados distintos.
- **Requisitos funcionales:**
  - Configurar la precisión decimal aplicable a notas individuales, promedios, porcentajes y resultados finales mediante `formatAcademicGrade(number, precision, roundingMode)`.
  - Definir el método de redondeo utilizado (`Aritmetico` conventional vs. `Truncado`), según la normativa institucional.
  - Distinguir la precisión de almacenamiento de la precisión de presentación.
  - Evitar redondear prematuramente los valores intermedios cuando la política exige conservar mayor precisión.
  - Definir en qué etapa se redondea: nota individual, subtotal, promedio ponderado o resultado final.
  - Centralizar la función de cálculo y redondeo en el backend o en un módulo compartido con comportamiento determinista.
  - Aplicar la misma política a la libreta, el portal del estudiante, los boletines, los historiales, los gráficos y las exportaciones SACE.
  - Permitir una política diferenciada únicamente cuando una regla oficial o institucional lo justifique.
  - Mantener la versión de la política aplicada a los resultados cerrados.
- **Cambios requeridos:**
  - Identificar todos los puntos donde se calcula, redondea o formatea una nota.
  - Sustituir las operaciones duplicadas por una regla común.
  - Separar el valor numérico de su formato visual para no realizar cálculos sobre cadenas formateadas.
  - Incorporar pruebas con valores límite, decimales periódicos y resultados próximos a la nota mínima de aprobación (ej. 69.5% vs 70%).
- **Comportamiento esperado:** El mismo expediente produce los mismos valores numéricos en todas las vistas y documentos. La presentación puede mostrar menos decimales que los utilizados internamente, sin modificar el resultado académico.
- **Criterios de aceptación:**
  1. Los mismos datos producen resultados idénticos en frontend, backend y PDF.
  2. Los valores situados en los límites de redondeo se resuelven conforme a la política configurada.
  3. La decisión de aprobación se toma con el valor definido por la normativa aplicable, no con una cadena de texto formateada.
  4. Las notas cerradas conservan la regla de redondeo de su período.
  5. Las pruebas cubren valores cero, negativos no permitidos, máximos, decimales y notas cercanas al umbral de aprobación.
  6. Cambiar el formato visual no cambia la nota almacenada ni la decisión académica.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-03 y T-CAL-05.

---

### T-CAL-07 [P2] — Flujo formal de rectificación de calificaciones después del cierre

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`reopenPeriodGradebook`, `saveGradebookGrades`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** Existe un mecanismo de reapertura justificada (`reopenPeriodGradebook`), pero se necesita un flujo de rectificación que haga explícitos el motivo, la autorización, los valores afectados y la trazabilidad del cambio.
- **Requisitos funcionales:**
  - Exigir un motivo obligatorio para toda rectificación posterior al cierre en la tabla `RectificacionesNotas` (`RectificacionID`, `CalificacionID`, `ValorAnterior`, `ValorNuevo`, `Motivo`, `AutorizadoPor`, `FechaRectificacion`).
  - Registrar el usuario solicitante, la fecha, el estudiante, la evaluación, el valor anterior, el nuevo valor y la justificación ("Error de transcripción", "Revisión de examen", "Resolución de Secretaría").
  - Permitir aprobación por un usuario autorizado cuando la política institucional lo requiera (`Secretaría`, `Director`, `Administrador`).
  - Diferenciar el permiso para solicitar una rectificación del permiso para aprobarla o ejecutarla.
  - Evitar que un docente modifique directamente un período cerrado mediante una llamada alternativa al backend.
  - Conservar los documentos y resultados anteriores como evidencia histórica, identificándolos como sustituidos cuando corresponda.
  - Recalcular los resultados dependientes de la nota corregida de forma controlada y reproducible.
  - Registrar qué boletines, promedios o documentos oficiales deben regenerarse o invalidarse.
  - Mantener la inalterabilidad de los años históricos, salvo que se utilice un procedimiento excepcional explícitamente autorizado y auditable.
  - Proporcionar al estudiante y al familiar autorizado la versión oficial vigente, sin ocultar que existió una rectificación cuando la normativa o la política institucional exija mostrarla.
- **Cambios requeridos:**
  - Definir estados de solicitud, aprobación, rechazo y aplicación, según el flujo institucional.
  - Añadir un historial específico de rectificaciones en `RectificacionesNotas`.
  - Integrar el flujo con `reopenPeriodGradebook`, `saveGradebookGrades` y el sistema de publicación.
  - Invalidar o marcar como desactualizados los documentos derivados de las notas modificadas.
  - Evitar que una rectificación aprobada cambie reglas de evaluación o resultados no relacionados.
- **Comportamiento esperado:** La rectificación de una nota cerrada es un procedimiento controlado, justificable y reversible mediante un nuevo registro de corrección, sin borrar la historia original.
- **Criterios de aceptación:**
  1. Una rectificación sin motivo se rechaza.
  2. Un usuario sin autorización no puede aprobar ni ejecutar el cambio.
  3. El historial conserva los valores anterior y nuevo.
  4. Los promedios dependientes se recalculan usando las reglas correctas.
  5. Los documentos derivados quedan identificados como vigentes o desactualizados.
  6. El sistema no permite alterar directamente un año histórico protegido (`esAnoHistoricoAnterior === true`).
  7. Las rectificaciones aparecen en los registros de auditoría con su responsable y fecha.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-CAL-01, T-CAL-03 y T-CAL-06.

---

### T-CAL-08 [P2] — Módulo de observaciones cualitativas y seguimiento actitudinal

- **Componentes relacionados:** `backend/exam-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`, `student-dashboard.html`.
- **Problema detectado:** Las rúbricas permiten registrar criterios cualitativos vinculados a actividades, pero no existe una interfaz independiente para documentar observaciones de comportamiento, hábitos de trabajo y desarrollo actitudinal por período para el boletín.
- **Requisitos funcionales:**
  - Crear la tabla `ObservacionesCualitativasPeriodo` (`ID`, `UserID`, `PeriodoID`, `Asignatura`, `Conducta`, `ObservacionPedagogica`, `FechaRegistro`).
  - Permitir que el personal autorizado registre observaciones cualitativas asociadas al estudiante, año lectivo y período.
  - Diferenciar observaciones generales, fortalezas, aspectos por mejorar, seguimiento de competencias y acuerdos de apoyo.
  - Permitir asociar una observación a una competencia, criterio de rúbrica o área formativa cuando corresponda.
  - Admitir comentarios descriptivos y escalas cualitativas configurables, por ejemplo, alcanzado, en desarrollo y requiere apoyo.
  - Mantener estas observaciones separadas de las notas numéricas, salvo que una rúbrica configurada establezca explícitamente una conversión.
  - Permitir observaciones privadas para personal autorizado y observaciones publicables para estudiantes o familiares.
  - Incorporar controles para evitar que comentarios internos confidenciales aparezcan accidentalmente en boletines.
  - Registrar autor, fecha, última modificación y período correspondiente.
  - Permitir editar o rectificar observaciones conforme a los permisos y mantener la trazabilidad de los cambios.
  - Ofrecer filtros por estudiante, período, competencia, docente y estado de publicación.
  - Permitir seleccionar qué observaciones se incorporan al boletín y generar un resumen cualitativo comprensible.
- **Cambios requeridos:**
  - Crear o adaptar la estructura de persistencia `ObservacionesCualitativasPeriodo`.
  - Incorporar una interfaz docente en `teacher-dashboard.html` para registrar y consultar observaciones.
  - Integrar la consulta con el expediente del estudiante y el proceso de generación de boletines en `getStudentAcademicReport`.
  - Definir permisos de lectura y edición para docentes, dirección, orientación, secretaría, estudiantes y familiares.
  - Validar longitudes, contenido vacío y estados de publicación.
  - Evitar la exposición de datos sensibles que no sean necesarios para el seguimiento académico.
- **Comportamiento esperado:** El docente puede documentar el progreso del estudiante sin inventar una nota numérica. El centro puede comunicar observaciones seleccionadas a la familia, manteniendo separadas las notas oficiales y los comentarios internos.
- **Criterios de aceptación:**
  1. Se puede crear, editar y consultar una observación según los permisos.
  2. Una observación no modifica automáticamente las calificaciones.
  3. Las observaciones privadas no aparecen en el portal familiar ni en boletines públicos.
  4. Cada registro conserva autoría, fecha y período.
  5. El boletín incluye únicamente observaciones autorizadas para publicación.
  6. Las rúbricas y observaciones cualitativas pueden consultarse de forma coherente sin duplicar innecesariamente la información.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-04 para la autorización de acceso y T-CAL-09 para su inclusión en boletines.

---

### T-CAL-09 [P2] — Diagnóstico previo y generación masiva fiable de boletines PDF

- **Componentes relacionados:** `backend/accounting-service/Code.gs` (`generateSchoolDocument`), `backend/exam-service/Code.gs`, `js/teacher.js`.
- **Problema detectado:** La generación masiva de boletines no cuenta con un diagnóstico previo (`preCheckGradebookForReportCards`) que identifique notas pendientes, matrículas inconsistentes y otras condiciones capaces de producir documentos incompletos o incorrectos.
- **Requisitos funcionales:**
  - Ejecutar la validación previa `preCheckGradebookForReportCards` antes de generar los documentos masivos.
  - Identificar estudiantes matriculados sin asignaturas o secciones requeridas, matrículas duplicadas, estudiantes sin calificaciones esperadas, períodos no cerrados y resultados no publicados.
  - Diferenciar errores bloqueantes, advertencias y situaciones informativas.
  - Permitir filtrar por año lectivo, período, grado, sección y grupo de estudiantes.
  - Mostrar un resumen de cuántos documentos se pueden generar, cuántos requieren corrección y cuántos no se pueden emitir.
  - Permitir generar únicamente los boletines válidos, sin incluir estudiantes con errores bloqueantes.
  - Producir un resultado individual por estudiante y un resumen global del lote.
  - Detectar fallos de renderizado, documentos vacíos, archivos duplicados y problemas de almacenamiento.
  - Evitar que un error en un estudiante cancele silenciosamente todo el lote.
  - Permitir reintentar únicamente los documentos fallidos sin duplicar los ya generados.
  - Identificar el período y la versión de las calificaciones utilizadas en cada documento.
  - Ofrecer una vista previa y un mecanismo de revisión antes de publicar o distribuir los archivos.
  - No exponer boletines a familiares hasta que la autorización y el estado de publicación sean válidos.
- **Cambios requeridos:**
  - Incorporar la función de diagnóstico `preCheckGradebookForReportCards` previa a la renderización.
  - Definir un informe de validación con errores, advertencias y acciones recomendadas.
  - Separar el proceso en preparación, validación, generación y verificación final.
  - Registrar el estado individual de cada documento.
  - Añadir una herramienta para consultar lotes anteriores y localizar archivos fallidos o desactualizados.
- **Comportamiento esperado:** La institución conoce los problemas antes de iniciar la generación y puede resolverlos o excluir los registros afectados. Cada boletín generado se vincula a un resultado académico válido y verificable.
- **Criterios de aceptación:**
  1. El diagnóstico detecta pendientes y matrículas inconsistentes de los tipos definidos.
  2. No se genera un boletín oficial con notas pendientes que impidan su emisión.
  3. Los errores se muestran por estudiante y con una explicación comprensible.
  4. El fallo de un documento no elimina ni duplica los demás.
  5. El sistema permite reintentar los documentos fallidos.
  6. Cada PDF queda asociado al estudiante, período y versión de resultados.
  7. Una modificación posterior de las notas permite identificar los boletines que necesitan regeneración.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-03, T-CAL-04, T-CAL-05 y T-CAL-07.

---

### T-CAL-10 [P2] — Validación integral y exportación fiable de resultados para SACE Honduras

- **Componentes relacionados:** `backend/accounting-service/Code.gs` (`verifySACETemplateCompatibility`, `generateSACEReportFile`), `js/teacher.js`.
- **Problema detectado:** El servicio valida determinadas columnas y genera un archivo con calificaciones ordinarias y recuperaciones. Sin embargo, se requiere enriquecer la interfaz docente para validar la estructura de la plantilla oficial SACE y exportar el archivo de carga masiva con códigos e indicadores de estado.
- **Requisitos funcionales:**
  - Vincular en `js/teacher.js` los controles para invocar `verifySACETemplateCompatibility` y `generateSACEReportFile`.
  - Mantener la compatibilidad con la plantilla oficial SACE de Honduras (`identidad`, `nombreAlumno`, `calificacionOrdinaria`, `recuperacion`, `resultadoFinalSACE`, `estadoAprobacion`).
  - Verificar nombres, orden, obligatoriedad, tipo de dato, formato y restricciones de las columnas exigidas en `PlantillasSACEVerificadas`.
  - Identificar la versión de plantilla (`SACE-2026-v2`) y el tipo de exportación a los que corresponde la validación.
  - Validar identidad del estudiante, matrícula, año lectivo, grado, sección, asignatura y período.
  - Detectar identidades vacías o inválidas, registros duplicados, estudiantes fuera del grupo seleccionado y calificaciones fuera de rango.
  - Verificar que las notas ordinarias y de recuperación correspondan al mismo estudiante, asignatura y período.
  - Aplicar la regla SACE de resultado final como `Math.max(notaOrdinaria, notaRecuperacion)` y nota mínima de aprobación oficial de 70% (`APROBADO` vs `REPROBADO`).
  - Diferenciar la validación estructural del archivo de la validación de contenido académico.
  - Proporcionar un diagnóstico antes de generar el archivo final.
  - Generar un archivo de prueba o vista previa para que el personal autorizado pueda verificar su contenido.
  - Conservar la plantilla, fecha de verificación, reglas aplicadas y resultado de la validación.
  - Permitir descargar el archivo y un informe de validación con errores y advertencias.
- **Cambios requeridos:**
  - Revisar `verifySACETemplateCompatibility` y `generateSACEReportFile`.
  - Separar la validación de plantilla, la validación académica, el mapeo de campos y la generación del archivo.
  - Incorporar pruebas con plantillas válidas, columnas ausentes, columnas inesperadas, datos inválidos y resultados de recuperación.
  - Registrar las exportaciones para poder reproducir qué datos y reglas generaron cada archivo.
- **Comportamiento esperado:** La plataforma genera archivos cuya estructura y contenido han sido validados frente a la especificación oficial SACE de Honduras, e informa con claridad cualquier condición que impida su uso.
- **Criterios de aceptación:**
  1. La plantilla se rechaza cuando faltan columnas obligatorias o sus formatos son incompatibles.
  2. Los datos inválidos se detectan antes de generar el archivo definitivo.
  3. La regla de recuperación (`Math.max`) y aprobación (70%) se aplica según la especificación correspondiente.
  4. Las identidades y calificaciones se vinculan al estudiante correcto.
  5. La validación produce un informe legible de errores y advertencias.
  6. La exportación registra la plantilla y las reglas utilizadas en `PlantillasSACEVerificadas`.
  7. La interfaz distingue entre archivo generado, archivo validado y archivo oficialmente aceptado.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-03, T-CAL-05 y T-CAL-06.

---

### T-CAL-11 [P2] — Edición rápida y navegación por teclado en el libro de calificaciones

- **Componentes relacionados:** `teacher-dashboard.html`, `js/teacher.js`.
- **Problema detectado:** El ingreso manual de notas en secciones numerosas (30+ alumnos) mediante clic en cada celda resulta lento e incómodo para los docentes. La navegación por teclado puede perder el foco si no está optimizada.
- **Requisitos funcionales:**
  - Permitir navegar entre celdas de la libreta mediante flechas (Arriba, Abajo, Izquierda, Derecha), `Enter` y `Tab`.
  - Mantener el foco en la celda esperada después de editar, guardar o mostrar un error (ej. presionar `Enter` o `Flecha Abajo` desplaza el foco a la celda de abajo).
  - Resaltar visualmente la celda activa y mostrar un indicador de cambios no guardados.
  - Permitir editar una nota sin que la tabla se vuelva a renderizar completamente y pierda la posición del usuario.
  - Validar el rango y formato de la nota antes de confirmar el cambio.
  - Indicar visualmente las celdas modificadas, guardadas, pendientes de guardar y con errores.
  - Evitar que el cambio de foco guarde accidentalmente valores incompletos.
  - Ofrecer guardado por lote con indicadores de progreso y resultado.
  - Permitir recuperar la edición ante un fallo de red sin duplicar ni perder silenciosamente los valores introducidos.
  - Mantener accesibilidad para navegación sin ratón y lectores de pantalla (WCAG 2.2 AA).
  - Respetar las restricciones de edición de períodos cerrados y años históricos.
  - Permitir filtrar por estudiante y localizar rápidamente una fila sin alterar el conjunto de notas seleccionado.
- **Cambios requeridos:**
  - Revisar los manejadores de eventos, el ciclo de renderizado y el estado local de la tabla en `js/teacher.js`.
  - Evitar reemplazar toda la tabla cuando basta con actualizar una celda o una fila.
  - Incorporar un modelo de cambios pendientes que distinga los datos locales de los confirmados por el servidor.
  - Añadir mensajes de error asociados a la celda y no únicamente alertas globales.
  - Verificar el comportamiento en escritorio, tabletas y dispositivos móviles.
- **Comportamiento esperado:** El docente puede registrar notas consecutivamente sin perder el foco, comprende qué valores están guardados y puede corregir errores sin reiniciar la edición de todo el grupo.
- **Criterios de aceptación:**
  1. La navegación por teclado mantiene el orden esperado entre celdas.
  2. La actualización de una nota no desplaza el foco a otra fila inesperada.
  3. Los errores de validación conservan el valor introducido y permiten corregirlo.
  4. Los estados de guardado son distinguibles y accesibles.
  5. Una desconexión no provoca que las notas pendientes se presenten como guardadas.
  6. La tabla funciona con grupos de más de 30 estudiantes sin pérdida de foco en las pruebas.
  7. Los controles de edición respetan los permisos y el estado del período.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-01 y T-CAL-05.

---

### T-CAL-12 [P2] — Versionado de rúbricas aplicadas a actividades y entregas

- **Componentes relacionados:** `backend/exam-service/Code.gs` (`getRubrics`, `saveRubric`), `backend/task-service/Code.gs`, `js/teacher.js`.
- **Problema detectado:** Las rúbricas se almacenan como plantillas en `RubricasEvaluacion`, pero si un docente modifica la plantilla maestro, los trabajos previamente calificados podrían recalcularse con los nuevos valores, alterando notas históricas.
- **Requisitos funcionales:**
  - Al calificar una entrega mediante rúbrica, guardar una copia estática congelada en JSON del esquema y puntuación de la rúbrica dentro del registro de la entrega en `EntregasVersiones`.
  - Crear una versión nueva cuando se modifique una rúbrica maestro que ya se haya utilizado.
  - Conservar los criterios, niveles de desempeño, descripciones, puntuaciones máximas y ponderaciones de cada versión.
  - Asociar cada evaluación aplicada a la versión exacta de la rúbrica que utilizó.
  - Evitar que la modificación de una plantilla altere la interpretación de las calificaciones anteriores.
  - Permitir reutilizar una rúbrica en otras actividades sin compartir accidentalmente cambios posteriores.
  - Definir si una rúbrica puede modificarse cuando existen entregas en borrador, calificadas o publicadas.
  - Si se necesita recalificar con una versión nueva, ejecutar una operación explícita, autorizada y trazable.
  - Conservar la puntuación por criterio, los comentarios y la nota total resultante.
  - Permitir consultar la rúbrica histórica junto con la evaluación del estudiante.
- **Cambios requeridos:**
  - Revisar `RubricasEvaluacion` y las estructuras de `task-service` que guardan resultados de rúbricas.
  - Incorporar identificadores de versión o copia congelada en JSON en `EntregasVersiones`.
  - Ajustar las interfaces de creación, edición y selección de rúbricas para diferenciar plantillas nuevas de versiones utilizadas.
  - Vincular las entregas calificadas a su versión histórica.
- **Comportamiento esperado:** La rúbrica que se visualiza en una evaluación antigua es exactamente la que se aplicó al calificarla, incluso si la plantilla maestro ha cambiado desde entonces.
- **Criterios de aceptación:**
  1. Modificar una rúbrica utilizada crea una nueva versión o conserva una instantánea congelada en `EntregasVersiones`.
  2. Las entregas antiguas siguen mostrando los criterios originales.
  3. La puntuación histórica no cambia por editar la plantilla.
  4. Una recalificación explícita registra el responsable, la versión nueva y los resultados anteriores.
  5. La rúbrica histórica puede consultarse desde la evaluación correspondiente.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-03 y T-CAL-06.

---

### T-CAL-13 [P3] — Panel de alertas antes del cierre de período

- **Componentes relacionados:** `js/teacher.js`, `teacher-dashboard.html`, `backend/exam-service/Code.gs`.
- **Problema detectado:** No existe una herramienta consolidada en el dashboard docente que señale con anticipación calificaciones pendientes, actividades sin evaluar y estudiantes en riesgo de no alcanzar los resultados esperados (< 70%).
- **Requisitos funcionales:**
  - Crear el panel "Alertas de Cierre y Avance de Evaluaciones" en `teacher-dashboard.html`.
  - Mostrar un panel de estado por docente, asignatura, sección y período.
  - Identificar actividades que no tienen calificaciones registradas, grupos con calificación incompleta y estudiantes con resultados parciales insuficientes (< 70%).
  - Diferenciar riesgo académico, ausencia de datos y error de configuración.
  - Calcular las alertas utilizando las ponderaciones, estados y reglas de evaluación vigentes.
  - Mostrar cuántas actividades faltan y cuáles pueden afectar el cierre.
  - Permitir abrir la libreta directamente desde cada alerta.
  - Ofrecer filtros por grado, sección, asignatura, docente y período.
  - Permitir configurar umbrales de alerta sin alterar la nota oficial.
  - Diferenciar una proyección provisional de un resultado definitivo.
  - Evitar mostrar a estudiantes o familiares alertas internas que no les correspondan.
  - Identificar qué condiciones bloquean realmente el cierre y cuáles son recomendaciones preventivas.
- **Cambios requeridos:**
  - Crear una consulta consolidada que reutilice las reglas oficiales de cálculo (`getGradebookData`).
  - Añadir la interfaz de alertas en `teacher-dashboard.html` con enlaces a las actividades y estudiantes afectados.
  - Incorporar indicadores de completitud de la evaluación por período.
  - Definir criterios de riesgo que no dependan de convertir notas pendientes en ceros.
- **Comportamiento esperado:** Antes del cierre, el docente puede identificar y resolver las evaluaciones faltantes y reconocer los casos que necesitan seguimiento académico, sin confundir proyecciones con notas definitivas.
- **Criterios de aceptación:**
  1. Las actividades sin notas aparecen como pendientes, no como ceros.
  2. Las alertas coinciden con los datos y ponderaciones de la libreta.
  3. Los resultados provisionales se identifican expresamente.
  4. Cada alerta permite acceder al registro que requiere atención.
  5. El panel respeta los permisos del usuario.
  6. Los indicadores se actualizan después de guardar una calificación.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-02, T-CAL-05 y T-CAL-06.

---

### T-CAL-14 [P3] — Comparativa longitudinal del desempeño académico

- **Componentes relacionados:** `js/teacher.js`, `js/student.js`, `js/ui-common.js` (`renderUniversalConfigurableChart`).
- **Problema detectado:** Los resultados se consolidan por período y año lectivo, pero se requiere una herramienta de análisis dinámico que permita comparar la evolución académica entre parciales sin mezclar escalas o versiones de evaluación incompatibles.
- **Requisitos funcionales:**
  - Renderizar mediante `renderUniversalConfigurableChart` un gráfico de líneas o barras comparando las notas obtenidas en el Parcial I, II, III y IV por materia.
  - Comparar resultados entre períodos, asignaturas y años lectivos.
  - Mostrar promedios, tasas de aprobación, cantidad de estudiantes evaluados, pendientes y recuperaciones.
  - Permitir comparar la evolución individual del estudiante con su propio historial y, cuando los permisos lo permitan, analizar tendencias agregadas de una sección o grado.
  - Diferenciar una mejora real de una diferencia provocada por cambios de escala, ponderación o reglas de evaluación.
  - Mostrar la cantidad de registros que sustentan cada indicador.
  - Identificar períodos incompletos y excluirlos de comparaciones definitivas cuando corresponda.
  - Permitir filtros por año lectivo, grado, sección, asignatura y período.
  - Ofrecer gráficos de tendencia y tablas con valores exactos.
  - Evitar clasificaciones engañosas cuando los grupos tienen tamaños distintos.
  - Restringir la consulta de datos individuales a usuarios autorizados (el estudiante o tutor solo consulta su propia gráfica).
- **Cambios requeridos:**
  - Preparar consultas de resultados históricos que respeten el versionado de las reglas (`getStudentAcademicReport`).
  - Incorporar visualizaciones de evolución y comparativas entre períodos mediante `renderUniversalConfigurableChart`.
  - Definir qué indicadores se pueden comparar directamente y cuáles requieren advertencias o normalización.
  - Incluir metadatos de período, escala, cantidad de registros y estado de publicación.
- **Comportamiento esperado:** Los docentes y responsables autorizados pueden identificar tendencias y cambios en el rendimiento, con información suficiente para interpretar correctamente los resultados.
- **Criterios de aceptación:**
  1. Las comparaciones utilizan períodos y registros identificados correctamente.
  2. Las escalas incompatibles no se presentan como directamente equivalentes sin advertencia.
  3. Los períodos incompletos se identifican.
  4. Los valores de los gráficos coinciden con los de las tablas.
  5. Los filtros no mezclan estudiantes de otras secciones o años.
  6. Los usuarios sin permiso no acceden a datos individuales de otros estudiantes.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-03, T-CAL-04 y T-CAL-06.

---

### T-CAL-15 [P3] — Conciliación entre libro de notas, boletines y expediente académico definitivo

- **Componentes relacionados:** `backend/exam-service/Code.gs`, `backend/academic-service/Code.gs`, `js/teacher.js`.
- **Problema detectado:** Los resultados se utilizan en diferentes vistas y documentos. Se necesita una herramienta que permita identificar discrepancias numéricas entre las calificaciones registradas en el libro docente, las notas publicadas, los boletines generados y los datos consolidados en el expediente.
- **Requisitos funcionales:**
  - Implementar la rutina de conciliación `reconcileAcademicGrades(grado, seccion, periodo)`.
  - Comparar las calificaciones persistidas en `CalificacionesEstudiantes`, `RecuperacionesEstudiante` y `ExpedientesEstudiantes`.
  - Verificar promedios, recuperaciones, estados de publicación, matrícula, asignatura, período y año lectivo.
  - Detectar documentos generados con una versión anterior de las notas.
  - Identificar duplicados, registros faltantes, referencias huérfanas y diferencias de cálculo (> 0.01 puntos).
  - Clasificar los hallazgos como informativos, advertencias o errores que requieren corrección.
  - Mostrar el valor esperado, el valor encontrado y la regla usada para calcularlo.
  - Permitir filtrar por estudiante, sección, asignatura, período y tipo de discrepancia.
  - No modificar automáticamente los datos oficiales durante la conciliación.
  - Permitir iniciar una corrección autorizada a partir de un hallazgo, manteniendo la trazabilidad.
  - Registrar fecha, usuario y resultado de cada conciliación.
  - Permitir repetir el análisis y comprobar que una discrepancia se resolvió.
- **Cambios requeridos:**
  - Crear el proceso `reconcileAcademicGrades` que compare las fuentes de información académica y los documentos generados.
  - Definir qué fuente constituye el resultado oficial en cada estado del flujo académico.
  - Incorporar una interfaz de conciliación con detalles por registro.
  - Vincular las discrepancias con el flujo de rectificación y regeneración de boletines.
- **Comportamiento esperado:** El personal autorizado puede identificar y resolver diferencias entre los registros académicos y los documentos publicados sin que el sistema altere automáticamente las notas oficiales.
- **Criterios de aceptación:**
  1. Una diferencia de promedio o estado de publicación se detecta y muestra con suficiente detalle.
  2. Los boletines desactualizados quedan identificados.
  3. Las reglas de cálculo y la versión utilizadas aparecen en los detalles de la discrepancia.
  4. Ejecutar la conciliación no modifica por sí solo las calificaciones.
  5. Las correcciones se realizan mediante operaciones autorizadas y auditables.
  6. Un segundo análisis permite verificar que el hallazgo fue resuelto.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-CAL-03, T-CAL-05, T-CAL-06, T-CAL-07 y T-CAL-09.

---

### T-CAL-16 [P3] — Respaldo íntegro, verificable y recuperable del historial de calificaciones

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`createSystemBackup`, `restoreSystemBackup`), `backend/exam-service/Code.gs`.
- **Problema detectado:** La plataforma dispone de mecanismos generales de respaldo, pero se necesita comprobar que el historial académico conserva versiones, rectificaciones, reglas de evaluación y resultados relacionados de manera consistente.
- **Requisitos funcionales:**
  - Incluir en el payload de `createSystemBackup` las tablas `CalificacionesEstudiantes`, `CierresPeriodos`, `RecuperacionesEstudiante`, `CategoriasEvaluacion`, `RubricasEvaluacion`, `RectificacionesNotas` y los metadatos necesarios para interpretar los resultados históricos.
  - Mantener las relaciones entre estudiantes, matrículas, asignaturas, períodos, evaluaciones y documentos.
  - Registrar fecha, alcance, versión del esquema y resultado de cada respaldo.
  - Verificar integridad mediante sumas de comprobación hash (checksum), recuentos o mecanismos equivalentes.
  - Detectar respaldos incompletos y errores de lectura o escritura.
  - Mantener la protección de los respaldos y restringir el acceso a usuarios autorizados.
  - Evitar que una restauración en `restoreSystemBackup` sobrescriba o altere datos de períodos o años cerrados sin un procedimiento explícito de autorización.
  - Probar la restauración en un entorno separado y verificar que los resultados académicos sean consistentes.
  - Preservar la trazabilidad de rectificaciones y no restaurar únicamente la última nota perdiendo el historial anterior.
  - Definir una política de retención compatible con las obligaciones institucionales de conservación de expedientes.
  - Registrar cada restauración, su responsable, el conjunto recuperado y las validaciones ejecutadas.
- **Cambios requeridos:**
  - Revisar la integración entre el respaldo general y los datos académicos (`createSystemBackup`).
  - Incorporar las nuevas estructuras de versiones, observaciones y rectificaciones (`RectificacionesNotas`) al alcance de los respaldos.
  - Añadir verificaciones posteriores a la generación y restauración.
  - Documentar el procedimiento de recuperación ante corrupción o pérdida de registros.
- **Comportamiento esperado:** La institución puede recuperar un conjunto coherente de datos académicos y demostrar que los resultados, las reglas y las rectificaciones siguen relacionados correctamente.
- **Criterios de aceptación:**
  1. El respaldo incluye las estructuras necesarias para reconstruir el historial de calificaciones.
  2. La verificación detecta datos faltantes o inconsistentes.
  3. Una restauración de prueba conserva las relaciones entre estudiantes, evaluaciones, períodos y reglas.
  4. Las rectificaciones históricas permanecen consultables después de la restauración.
  5. Los respaldos y las restauraciones quedan registrados en auditoría.
  6. No es posible restaurar sobre producción de forma accidental mediante una operación ordinaria.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-CAL-03, T-CAL-07 y T-CAL-12.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE 9 (EVALUACIONES Y CALIFICACIONES)

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-CAL-01.** Control de concurrencia y protección contra sobrescrituras en el guardado masivo | **P1** | `saveGradebookGrades` / `LockService` |
| **2** | **T-CAL-02.** Validación estricta y coherencia de las ponderaciones de evaluación | **P1** | `saveEvaluationCategory` |
| **3** | **T-CAL-03.** Versionado de sistemas de evaluación e inalterabilidad de resultados históricos | **P1** | `closePeriodGradebook` / Server-side guard |
| **4** | **T-CAL-04.** Validación de la relación familiar y autorización de acceso a reportes académicos | **P1** | `assertRecordOwnership` / `RelacionesFamiliares` |
| **5** | **T-CAL-05.** Separación inequívoca entre nota cero, nota pendiente, actividad exenta y no aplicable | **P2** | `getGradebookData` |
| **6** | **T-CAL-06.** Política institucional de precisión decimal, redondeo y presentación de resultados | **P2** | `formatAcademicGrade` |
| **7** | **T-CAL-07.** Flujo formal de rectificación de calificaciones después del cierre | **P2** | `RectificacionesNotas` |
| **8** | **T-CAL-10.** Validación integral y exportación fiable de resultados para SACE Honduras | **P2** | `generateSACEReportFile` |
| **9** | **T-CAL-08.** Módulo de observaciones cualitativas y seguimiento actitudinal | **P2** | `ObservacionesCualitativasPeriodo` |
| **10** | **T-CAL-09.** Diagnóstico previo y generación masiva fiable de boletines PDF | **P2** | `generateSchoolDocument` |
| **11** | **T-CAL-11.** Edición rápida y navegación por teclado en el libro de calificaciones | **P2** | `js/teacher.js` / Table UX |
| **12** | **T-CAL-12.** Versionado de rúbricas aplicadas a actividades y entregas | **P2** | `RubricasEvaluacion` |
| **13** | **T-CAL-13.** Panel de alertas antes del cierre de período | **P3** | Universal Chart Engine |
| **14** | **T-CAL-14.** Comparativa longitudinal del desempeño académico | **P3** | `renderUniversalConfigurableChart` |
| **15** | **T-CAL-15.** Conciliación entre libro de notas, boletines y expediente académico definitivo | **P3** | Reconciliation Engine |
| **16** | **T-CAL-16.** Respaldo íntegro, verificable y recuperable del historial de calificaciones | **P3** | `createSystemBackup` |



---

## BACKLOG DE RESOLUCIÓN Y MEJORA: FASE 10. ASISTENCIA, DISCIPLINA Y CONVIVENCIA ESCOLAR

### T-ASI-01 [P1] — Control de concurrencia transaccional en el registro masivo de asistencia

**Problema que debe resolverse**

El guardado por lote de "saveAttendanceRecords" puede ejecutarse simultáneamente desde varias sesiones de usuario sobre los mismos registros. Esto puede provocar sobrescrituras silenciosas, resultados inconsistentes o pérdida de modificaciones realizadas por otro docente.

**Alcance de los cambios**

- "backend/academic-service/Code.gs".
- Funciones "openAttendanceSession", "saveAttendanceRecords" y "getAttendanceForSession".
- Identificación de sesiones, registros de asistencia y versiones de sus modificaciones.
- "js/teacher.js" y la cola de sincronización de "js/persistence.js", cuando corresponda.

**Requisitos funcionales**

1. Implementar exclusión mutua en las operaciones críticas de escritura mediante "LockService" de Google Apps Script. Utilizar un bloqueo apropiado al ámbito de concurrencia y liberarlo siempre mediante "finally".
2. No mantener el bloqueo durante operaciones ajenas a la escritura crítica, como renderizado, envío de notificaciones o procesamiento de documentos.
3. Validar en el servidor:
   - Identificador de sesión.
   - Estado de la sesión.
   - Identidad del usuario que modifica la asistencia.
   - Autorización del usuario para el grado, sección, materia y sesión.
   - Pertenencia de cada estudiante a la lista correspondiente.
   - Validez de los estados de asistencia.
4. Incorporar control de versiones o un mecanismo equivalente de concurrencia optimista. La versión consultada por el cliente debe compararse con la versión vigente antes de aplicar cambios.
5. Detectar conflictos cuando dos usuarios intenten modificar el mismo registro. No permitir que el último guardado sobrescriba silenciosamente el anterior.
6. Permitir que se guarden los registros independientes que no tengan conflictos, siempre que el resultado identifique claramente los registros aceptados y rechazados.
7. Admitir claves de idempotencia para que los reintentos de una operación no dupliquen registros ni generen eventos repetidos.
8. Hacer que la sincronización de registros pendientes desde IndexedDB utilice el mismo mecanismo de validación y concurrencia que las operaciones en línea.
9. Registrar en la bitácora quién modificó cada registro, cuándo lo hizo, qué cambió y si la operación fue manual o una sincronización.
10. Devolver errores estructurados para distinguir conflictos, permisos insuficientes, sesiones cerradas, datos inválidos y fallos temporales.

**Comportamiento esperado**

Si dos docentes consultan una misma sesión y uno guarda cambios antes que el otro, el segundo debe recibir un aviso de conflicto al intentar guardar una versión desactualizada. La interfaz debe permitir recargar los datos y volver a aplicar las modificaciones que todavía sean pertinentes.

Si una operación falla, no debe comunicar un guardado completo cuando solo se hayan almacenado algunos registros. Los resultados parciales deben estar identificados individualmente.

**Criterios de aceptación**

- Dos usuarios modifican simultáneamente al mismo estudiante: el conflicto se detecta y no hay sobrescritura silenciosa.
- Dos usuarios modifican estudiantes distintos: se conservan los cambios compatibles.
- Un cliente reintenta una solicitud ya procesada: no se crean duplicados.
- Un usuario intenta guardar asistencia en una sesión ajena: el servidor rechaza la operación.
- Una sesión cerrada recibe una solicitud de modificación: el servidor la rechaza.
- Una sincronización fuera de línea encuentra un conflicto: el registro queda pendiente de resolución, no se declara sincronizado.
- Una prueba con múltiples escrituras concurrentes demuestra que no existen registros duplicados ni estados finales inconsistentes.
- Los errores temporales permiten reintentar sin repetir efectos secundarios.

**Dependencias:** T-ASI-02, para las reglas de estado y cierre de sesiones; T-ASI-04, para las restricciones de períodos cerrados; T-ASI-11, para la interacción de la interfaz ante conflictos; T-ASI-16, para conservar la trazabilidad de las modificaciones.

---

### T-ASI-02 [P1] — Distinción estricta entre sesión no registrada, ausencia confirmada y excusa autorizada

**Problema que debe resolverse**

Una sesión sin registros no equivale a una ausencia confirmada. La plataforma debe impedir que una sesión incompleta, un fallo de carga o un registro pendiente de sincronización produzcan porcentajes de inasistencia incorrectos o alertas injustificadas.

**Alcance de los cambios**

- "SesionesAsistencia".
- "RegistrosAsistencia".
- "JustificacionesAsistencia".
- "IncidenciasAsistencia".
- "openAttendanceSession", "saveAttendanceRecords", "getAttendanceForSession", "submitAttendanceJustification", "reviewAttendanceJustification" y "getStudentAttendanceSummary".
- "js/teacher.js", "js/student.js" y las interfaces de responsables familiares.

**Requisitos funcionales**

1. Separar el estado de la sesión del estado individual de asistencia.

   La sesión debe distinguir, como mínimo:
   - No iniciada.
   - Abierta.
   - En proceso de finalización.
   - Cerrada y completa.
   - Cerrada con incidencias pendientes de resolución, si el flujo institucional lo permite.
   - Anulada.

2. Los registros individuales deben distinguir, según la configuración institucional:
   - Presente.
   - Tardanza.
   - Ausente injustificado.
   - Ausente con justificación pendiente.
   - Ausente justificado.
   - Permiso autorizado.
   - Salida anticipada.
   - Estado pendiente de confirmación.

3. Los estados anteriores deben modelarse sin confundir situaciones distintas. Una ausencia justificada no debe borrar el hecho histórico de la ausencia ni convertirse en una asistencia presencial.

4. Si se necesita mantener compatibilidad con el estado existente "Justificada", definir una migración o normalización explícita que conserve la relación con la justificación y el estado original.

5. Al abrir una sesión, generar o recuperar la lista esperada de estudiantes sin convertir automáticamente a todos los que carecen de registro en ausentes.

6. Incorporar una validación de completitud antes de cerrar una sesión:
   - Número de estudiantes esperados.
   - Número de registros realizados.
   - Registros pendientes.
   - Estudiantes incorporados o retirados durante la sesión.
   - Conflictos de sincronización.

7. Permitir el cierre excepcional de una sesión incompleta únicamente mediante un permiso autorizado, con motivo obligatorio y registro de auditoría.

8. Establecer reglas configurables para calcular asistencia:
   - Qué estados cuentan como asistencia.
   - Qué estados cuentan como ausencia.
   - Qué estados se excluyen del denominador.
   - Cómo se calcula la tardanza.
   - Cómo se tratan las salidas anticipadas.
   - Cómo se manejan las sesiones anuladas y las justificaciones pendientes.

9. Mantener separados los indicadores de asistencia, puntualidad y ausencia justificada.

10. Aplicar las mismas reglas de cálculo en el portal del estudiante, los informes docentes, los paneles administrativos y las exportaciones.

11. Definir transiciones válidas de estado y evitar combinaciones contradictorias. Por ejemplo, una misma sesión no debe mostrar simultáneamente al estudiante como presente y ausente.

12. Cuando una justificación sea aprobada, actualizar el estado derivado sin duplicar la sesión, la ausencia ni el expediente de justificación.

13. Mantener la fecha, hora, autor y motivo de cada cambio de estado.

**Comportamiento esperado**

Una sesión no registrada o incompleta debe mostrarse como pendiente de completar, no como una jornada de ausencias. Una justificación pendiente debe seguir identificándose como tal hasta que sea aprobada o rechazada. Los porcentajes y las alertas deben calcularse únicamente sobre los datos que cumplen las reglas configuradas.

**Criterios de aceptación**

- Una sesión sin registros no genera ausencias automáticas.
- Una sesión parcialmente completada muestra cuántos estudiantes están pendientes.
- Una justificación pendiente no se presenta como aprobada.
- Aprobar una justificación modifica la clasificación correspondiente sin duplicar el registro.
- Los mismos datos producen el mismo porcentaje en todos los módulos.
- Una sesión anulada no afecta indebidamente los indicadores.
- Una modificación manual de estado requiere autorización y deja trazabilidad.
- Se prueban los cálculos con cero sesiones válidas, sesiones completas, sesiones incompletas, tardanzas, permisos y ausencias justificadas.

**Dependencias:** T-ASI-01, para evitar conflictos durante las transiciones; T-ASI-04, para impedir modificaciones retroactivas indebidas; T-ASI-07, para generar alertas con datos válidos; T-ASI-12 y T-ASI-15, para sincronizar y conciliar los resultados.

---

### T-ASI-03 [P1] — Verificación de relaciones familiares y autorización de notificaciones

**Problema que debe resolverse**

Las notificaciones por ausencias o tardanzas deben consultar las relaciones familiares vigentes en el servidor. No se debe confiar en destinatarios enviados por el navegador ni enviar información de un estudiante a una persona que no esté autorizada para recibirla.

**Alcance de los cambios**

- "RelacionesFamiliares".
- "sendMultiChannelNotification".
- Funciones que generan alertas de asistencia.
- Resolución de destinatarios, plantillas, colas y registros de entrega.
- Portal familiar y preferencias de notificación.

**Requisitos funcionales**

1. Consultar dinámicamente las relaciones familiares del estudiante en el backend antes de preparar cada notificación.
2. Verificar que la relación:
   - Corresponda al estudiante afectado.
   - Esté activa.
   - Tenga la autorización necesaria para el tipo de comunicación.
   - No haya sido revocada ni sustituida por una relación más reciente.
3. Diferenciar entre responsable legal, contacto de emergencia, persona autorizada para recoger al estudiante y otros contactos. Una relación de contacto no debe otorgar automáticamente todos los privilegios.
4. Permitir configurar qué tipos de notificaciones puede recibir cada responsable, de acuerdo con la política institucional.
5. No incluir destinatarios suministrados directamente por el cliente sin validación del servidor.
6. Resolver por separado el derecho a recibir información y el canal de entrega disponible.
7. Aplicar plantillas con divulgación mínima de datos:
   - Aviso de ausencia o tardanza.
   - Solicitud de justificación.
   - Recordatorio de autorización.
   - Notificación administrativa.
   - Comunicación sobre un caso de convivencia, únicamente cuando corresponda y exista autorización.
8. Evitar incluir descripciones disciplinarias, datos de otros estudiantes, documentos adjuntos o detalles sensibles en notificaciones generales.
9. Registrar el evento, destinatarios autorizados, canal, fecha, resultado del envío y errores. Las credenciales y los tokens no deben aparecer en la bitácora.
10. Implementar reintentos limitados y control de duplicados. Un reintento no debe enviar múltiples avisos equivalentes.
11. Permitir gestionar preferencias de comunicación sin desactivar comunicaciones institucionales obligatorias que deban mantenerse según la política aplicable.
12. Incorporar un mecanismo para revisar entregas fallidas y reintentar cuando sea procedente.
13. Volver a comprobar la autorización cuando una notificación se retrase en una cola y se procese después de que la relación familiar haya cambiado.
14. Mantener una vista administrativa de las notificaciones pendientes, entregadas, fallidas y descartadas por falta de autorización.

**Comportamiento esperado**

Si un contacto deja de estar autorizado después de generarse un evento, la cola debe volver a validar su elegibilidad antes del envío. Si ya no corresponde enviarle la información, el mensaje debe descartarse de forma segura y quedar registrado como no enviado por autorización insuficiente.

**Criterios de aceptación**

- Una persona sin relación autorizada no recibe alertas aunque conozca el identificador del estudiante.
- Una relación inactiva no se utiliza como destinataria.
- Un contacto autorizado únicamente para emergencias no recibe automáticamente detalles disciplinarios.
- Los mensajes fallidos pueden reintentarse sin duplicación.
- Los registros de auditoría permiten reconstruir el resultado de cada envío sin exponer secretos.
- Las plantillas no revelan información de otros estudiantes.
- Se prueban cambios de tutela, relaciones revocadas, múltiples responsables y destinatarios sin canal válido.

**Dependencias:** T-ASI-02, para identificar correctamente el evento que genera la alerta; T-ASI-07, para las notificaciones por patrones de inasistencia; T-ASI-08 y T-ASI-09, para proteger las comunicaciones vinculadas con expedientes y compromisos.

---

### T-ASI-04 [P1] — Protección de registros de períodos y años escolares cerrados

**Problema que debe resolverse**

Los registros de asistencia de períodos concluidos deben conservar su integridad. Una corrección posterior no debe modificar silenciosamente datos históricos ni alterar un boletín, informe o porcentaje ya emitido.

**Alcance de los cambios**

- "SesionesAsistencia".
- "RegistrosAsistencia".
- "JustificacionesAsistencia".
- "CasosSeguimiento".
- Configuración de períodos académicos.
- Funciones de escritura, corrección y cierre.
- Informes y resúmenes asociados.

**Requisitos funcionales**

1. Definir estados explícitos para períodos académicos y años escolares, incluyendo abierto, en cierre y cerrado.
2. Validar en el servidor el estado del período asociado a cada operación. No depender de que la interfaz oculte los botones de edición.
3. Bloquear la creación, modificación o eliminación ordinaria de registros dentro de períodos cerrados.
4. Permitir correcciones excepcionales únicamente a roles autorizados, con:
   - Motivo obligatorio.
   - Identidad del solicitante.
   - Fecha y hora.
   - Valores anteriores y nuevos.
   - Aprobación adicional cuando la política institucional lo requiera.
5. Conservar el valor original y registrar la corrección como una operación trazable. No sobrescribir el historial de forma que resulte imposible reconstruirlo.
6. Impedir que las modificaciones de períodos cerrados se realicen mediante llamadas alternativas, sincronización offline, importaciones o funciones administrativas que no apliquen las mismas reglas.
7. Definir cómo afectan las correcciones aprobadas a los resúmenes, informes y boletines ya generados.
8. Registrar qué documentos o cálculos deben regenerarse después de una corrección autorizada.
9. Mantener una vista histórica de las versiones de un registro.
10. Proteger también los períodos cerrados frente a cambios indirectos, como la modificación de horarios, listas de matrícula o reglas de cálculo.
11. Permitir consultar los datos históricos sin otorgar permisos de edición.
12. Establecer una operación de cierre verificable que identifique sesiones pendientes, justificaciones sin resolver, conflictos de sincronización y discrepancias.

**Comportamiento esperado**

Una operación ordinaria sobre un período cerrado debe rechazarse en el servidor. Una corrección autorizada debe quedar registrada como una rectificación, conservando los valores previos y permitiendo identificar los informes que requieren actualización.

**Criterios de aceptación**

- Un docente no puede modificar una sesión de un año cerrado.
- Una sincronización pendiente no puede alterar un período cerrado sin el flujo de rectificación autorizado.
- Toda corrección excepcional conserva el historial anterior y el motivo.
- Los informes afectados por una corrección quedan identificados para su regeneración.
- El cierre detecta registros incompletos y discrepancias conocidas.
- Una consulta histórica no modifica datos.
- Se comprueba que todos los puntos de escritura del backend respetan la misma política.

**Dependencias:** T-ASI-01 y T-ASI-02; T-ASI-12 y T-ASI-15, para actualizar los resultados derivados; T-ASI-16, para respaldar el historial y las rectificaciones.

---

### T-ASI-05 [P2] — Portal de marcación diaria de entrada y salida del personal

**Problema que debe resolverse**

Existen registros de horas extras y turnos de almuerzo, pero no un mecanismo completo de marcación diaria de entrada y salida del personal docente y administrativo.

**Alcance de los cambios**

- Nuevo módulo de control horario del personal.
- Esquema de persistencia para jornadas y marcaciones.
- Integración con "AprobacionHorasExtras" y "TurnosAlmuerzo".
- Paneles de personal, dirección y administración.
- Notificaciones de incidencias horarias.

**Requisitos funcionales**

1. Permitir registrar, como mínimo:
   - Entrada.
   - Inicio y finalización de almuerzo, cuando corresponda.
   - Salida.
   - Incidencias de marcación.
2. Configurar horarios y tolerancias por empleado, puesto, jornada, día y calendario laboral.
3. Diferenciar marcación original, corrección solicitada y corrección aprobada.
4. Registrar fecha y hora del servidor, usuario, método de marcación y dispositivo o contexto técnico disponible. No confiar en la hora del navegador como única fuente.
5. Admitir PIN individual o autenticación de usuario. Si se habilita un terminal compartido, limitar los intentos, ocultar datos personales y evitar que una sesión quede abierta para el siguiente empleado.
6. No considerar el PIN un factor de autenticación fuerte por sí solo. Si el entorno lo requiere, combinarlo con una sesión autenticada o un dispositivo administrado.
7. Detectar:
   - Entrada tardía.
   - Salida anticipada.
   - Falta de entrada o salida.
   - Marcaciones duplicadas.
   - Jornadas que exceden el horario previsto.
   - Inconsistencias entre turnos y marcaciones.
8. Permitir turnos partidos, jornadas variables, permisos, ausencias autorizadas y ajustes por calendario institucional.
9. Calcular tiempo trabajado, tiempo de descanso y diferencias respecto al horario previsto mediante reglas configurables y documentadas.
10. Separar las horas calculadas de las horas extras solicitadas, aprobadas y efectivamente reconocidas.
11. Vincular las incidencias horarias con el flujo existente de "AprobacionHorasExtras", sin aprobar automáticamente pagos ni deducciones.
12. Incorporar una pantalla para que cada empleado consulte sus marcaciones y solicite correcciones.
13. Permitir a los responsables autorizados revisar, aprobar o rechazar correcciones con motivo obligatorio.
14. Crear informes por empleado, departamento, período y tipo de incidencia.
15. No usar la marcación para aplicar automáticamente sanciones laborales o deducciones sin revisión y autorización conforme a las reglas institucionales aplicables.

**Comportamiento esperado**

El personal puede marcar su jornada desde un dispositivo autorizado o terminal institucional. El sistema compara las marcaciones con el horario vigente, identifica incidencias y permite solicitar correcciones sin alterar el registro original.

**Criterios de aceptación**

- Se registra correctamente una jornada normal y una jornada con almuerzo.
- Las marcaciones repetidas no generan horas trabajadas duplicadas.
- La hora del cliente no puede utilizarse para falsificar libremente el momento de la marcación.
- Los permisos y calendarios modifican los cálculos de manera coherente.
- El empleado solo puede consultar sus propias marcaciones.
- Las correcciones requieren autorización y dejan historial.
- Las horas extras calculadas no se confunden con las aprobadas.
- Los informes concuerdan con las marcaciones y los horarios aplicables.

**Dependencias:** Modelo de roles y permisos vigente; Configuración de calendarios y horarios del personal; Integración con "AprobacionHorasExtras" y "TurnosAlmuerzo"; T-ASI-14 para exportar los informes horarios, si se incluye dentro del alcance de exportación.

---

### T-ASI-06 [P2] — Módulo de solicitudes, autorización y registro de salidas anticipadas

**Problema que debe resolverse**

Aunque existe la estructura "SalidasAnticipadas" y "PermisosAutorizacionesEstudiante", se requiere un flujo completo y verificable que conecte la solicitud, la aprobación, la identificación de quien recoge al estudiante y el registro de su salida efectiva.

**Alcance de los cambios**

- "SalidasAnticipadas".
- "PermisosAutorizacionesEstudiante".
- "RelacionesFamiliares".
- Portal familiar, docente y administrativo.
- Generación y validación de pases de salida.
- Integración con asistencia y notificaciones.

**Requisitos funcionales**

1. Permitir solicitudes por responsables autorizados y por personal institucional habilitado.
2. Registrar estudiante, fecha, hora prevista, motivo, solicitante, persona autorizada para recogerlo y observaciones pertinentes.
3. Definir estados del flujo: borrador, pendiente de aprobación, aprobado, rechazado, cancelado, emitido, salida registrada y vencido.
4. Configurar quién puede solicitar, aprobar, emitir y validar una salida.
5. Validar la relación del solicitante con el estudiante y su facultad para autorizar esa operación.
6. Permitir autorización previa, autorización excepcional presencial y rechazo justificado.
7. Incorporar validación de identidad de la persona que recoge al estudiante mediante un procedimiento institucional. No exponer documentos de identidad en pantallas públicas o mensajes generales.
8. Generar un pase con identificador único, fecha de vencimiento y estado verificable. Si se utiliza un código QR, este debe ser opaco o contener un token limitado, no información personal legible.
9. Evitar la reutilización del pase después de registrar la salida o de que expire.
10. Registrar quién verificó la identidad y quién confirmó la salida efectiva.
11. Diferenciar la hora prevista de la hora real de salida.
12. Actualizar el registro de asistencia cuando corresponda, sin convertir una salida autorizada en una ausencia injustificada.
13. Notificar a los responsables autorizados sobre aprobación, rechazo, cancelación y salida efectivamente registrada.
14. Permitir anular una autorización con motivo y conservar el historial.
15. Gestionar salidas de emergencia mediante un procedimiento separado que no dependa de una aprobación digital ordinaria.
16. Mostrar en la lista de estudiantes del día si existe un permiso aprobado, pendiente o vencido, con información limitada al personal autorizado.

**Comportamiento esperado**

Una solicitud aprobada no se considera una salida realizada hasta que el personal registra la salida efectiva. Un pase vencido, utilizado o cancelado no puede volver a utilizarse. La asistencia refleja el hecho real y conserva la autorización que lo respalda.

**Criterios de aceptación**

- Una persona no autorizada no puede solicitar ni aprobar una salida en nombre del estudiante.
- Una solicitud pendiente no genera un pase válido.
- Un pase vencido o ya utilizado es rechazado.
- La hora real queda registrada separadamente de la prevista.
- La salida actualiza la asistencia sin duplicar registros.
- La notificación se envía únicamente a destinatarios autorizados.
- Las cancelaciones y excepciones quedan registradas con su responsable.
- Se prueban salidas ordinarias, emergencias, retiros por personas autorizadas y autorizaciones revocadas.

**Dependencias:** T-ASI-03, para validar responsables y notificaciones; T-ASI-02, para la clasificación de asistencia; T-ASI-08, si se adjuntan documentos sensibles; T-ASI-16, para la conservación histórica.

---

### T-ASI-07 [P2] — Motor configurable de alertas por inasistencias y tardanzas reiteradas

**Problema que debe resolverse**

Las notificaciones asociadas a una ausencia o tardanza individual no sustituyen un sistema de detección de patrones. La plataforma debe identificar acumulaciones, tendencias y casos que requieran seguimiento, sin generar falsas alertas por datos incompletos o justificaciones pendientes.

**Alcance de los cambios**

- Motor de reglas y procesamiento de eventos de asistencia.
- "RegistrosAsistencia", "SesionesAsistencia" y "JustificacionesAsistencia".
- "CasosSeguimiento".
- "sendMultiChannelNotification".
- Panel de alertas para docentes, orientación y dirección.

**Requisitos funcionales**

1. Permitir configurar reglas por centro, período, grado, sección, nivel educativo y tipo de incidencia.
2. Contemplar condiciones como:
   - Número de ausencias injustificadas en un período.
   - Porcentaje de asistencia inferior a un umbral.
   - Tardanzas repetidas.
   - Secuencias de ausencias consecutivas.
   - Ausencias en determinadas sesiones o materias.
   - Incremento de incidencias respecto de un período anterior.
3. Permitir establecer ventanas de cálculo, umbrales, severidad, frecuencia de evaluación y destinatarios.
4. Excluir sesiones no registradas, anuladas o no válidas para el cálculo.
5. Tratar las justificaciones pendientes de acuerdo con una política explícita. No deben clasificarse como definitivamente injustificadas antes de la resolución.
6. Recalcular las alertas cuando se corrijan registros o se aprueben justificaciones.
7. Evitar la generación de alertas duplicadas para un mismo caso y período.
8. Agrupar eventos relacionados en una alerta o caso de seguimiento cuando resulte útil.
9. Diferenciar alerta informativa, alerta que requiere revisión y caso que requiere intervención.
10. Mostrar los registros que originaron la alerta, la regla aplicada, la fecha de detección y el cálculo que la sustenta.
11. Permitir que un usuario autorizado reconozca, asigne, comente, cierre o derive una alerta.
12. No cerrar automáticamente una alerta de seguimiento activo solo porque el porcentaje haya mejorado; conservar el historial y exigir resolución según la regla correspondiente.
13. Incorporar mecanismos de supresión temporal y revisión para evitar notificaciones excesivas.
14. Resolver destinatarios mediante "RelacionesFamiliares" y permisos vigentes.
15. Crear o vincular un "CasoSeguimiento" cuando la regla lo requiera, sin duplicar casos existentes.
16. Permitir configurar las reglas sin modificar el código y conservar el historial de cambios en su configuración.

**Comportamiento esperado**

Cuando un estudiante alcanza un umbral configurable, el sistema genera una alerta trazable, identifica los registros que la justifican y asigna las acciones correspondientes. Si posteriormente se aprueba una justificación, recalcula el caso y actualiza la alerta sin borrar su historial.

**Criterios de aceptación**

- Un umbral configurable genera una alerta exactamente cuando corresponde.
- Una sesión incompleta no genera una falsa ausencia.
- La aprobación de una justificación recalcula el patrón.
- Un evento repetido no crea alertas duplicadas.
- La alerta muestra su regla, cálculo y registros de origen.
- Los destinatarios se validan en el servidor.
- Las alertas pueden asignarse, comentarse y resolverse con trazabilidad.
- Se verifica el comportamiento con umbrales, ventanas, períodos cerrados y cambios retroactivos autorizados.

**Dependencias:** T-ASI-02 y T-ASI-03; T-ASI-09, para vincular alertas con planes de acompañamiento; T-ASI-13, para visualizar los patrones consolidados.

---

### T-ASI-08 [P2] — Acceso seguro a evidencias documentales de expedientes de convivencia

**Problema que debe resolverse**

Los enlaces directos de Google Drive pueden permitir acceso a documentos sin que el sistema vuelva a verificar la identidad, la vigencia de la sesión y los permisos sobre el caso disciplinario.

**Alcance de los cambios**

- Gestión de evidencias adjuntas a "CasosSeguimiento" y "ObservacionesConvivencia".
- Backend de acceso a archivos.
- Almacenamiento en Google Drive.
- "validateRolePermission".
- Componentes frontend que muestran o descargan documentos.

**Requisitos funcionales**

1. Implementar un endpoint de acceso controlado a las evidencias que compruebe la sesión autenticada y los permisos del usuario sobre el expediente concreto.
2. No utilizar el conocimiento de un identificador de archivo, URL o ID de caso como prueba suficiente de autorización.
3. Evitar que los archivos confidenciales se compartan mediante enlaces públicos o permisos generales de Drive.
4. Utilizar una política de acceso que impida a los usuarios acceder directamente a los archivos fuera del flujo autorizado. Si el diseño del almacenamiento permite omitir el proxy, corregir también los permisos del archivo.
5. Validar que el archivo solicitado pertenece al caso indicado y que el usuario puede consultar ese caso.
6. Para descargas diferidas, usar tokens de acceso de corta duración, de alcance limitado y con protección contra manipulación. Los tokens no deben sustituir la autorización inicial ni permitir acceso a otros archivos.
7. Evitar tokens reutilizables indefinidamente. Definir expiración, revocación y alcance de cada acceso.
8. Verificar el tipo, tamaño y contenido permitido de los archivos durante la carga.
9. Evitar ejecutar archivos adjuntos como contenido activo. Servirlos con encabezados y tratamiento apropiados para descarga o visualización segura.
10. Registrar accesos, descargas, rechazos y errores sin guardar tokens ni contenido sensible en la bitácora.
11. Aplicar límites de tamaño, controles de frecuencia y respuestas de error que no revelen la existencia de expedientes a usuarios no autorizados.
12. Gestionar la revocación de permisos cuando una persona deja de ser docente asignado, orientador o directivo autorizado.
13. Permitir la descarga individual y, si se habilita la descarga agrupada, aplicar las mismas verificaciones a cada archivo.
14. Mantener un procedimiento de eliminación o retención de evidencias conforme a la política institucional, sin destruir indebidamente la trazabilidad del expediente.

**Comportamiento esperado**

El usuario accede a una evidencia solo si tiene autorización vigente sobre el caso. Si pierde ese permiso, los enlaces o tokens previos dejan de proporcionar acceso conforme al mecanismo de revocación establecido.

**Criterios de aceptación**

- Una URL copiada por un usuario no autorizado no permite descargar la evidencia.
- Un token vencido, alterado o correspondiente a otro archivo es rechazado.
- Un usuario autorizado para un caso no puede descargar archivos de otro caso cambiando un identificador.
- Los permisos de Drive no permiten eludir la autorización de la aplicación.
- Los archivos inválidos o no permitidos se rechazan.
- Las descargas y denegaciones quedan registradas sin exponer credenciales.
- Se comprueba el comportamiento tras revocar un rol o reasignar un caso.

**Dependencias:** Sistema de autenticación y RBAC; T-ASI-09, para los documentos vinculados a planes de acompañamiento; T-ASI-16, para conservar la trazabilidad de los documentos y sus cambios.

---

### T-ASI-09 [P2] — Flujo formal de compromisos pedagógicos y planes de acompañamiento conductual

**Problema que debe resolverse**

Los campos "AccionesJSON" y las notas de seguimiento permiten almacenar información sobre acciones y compromisos, pero se necesita un ciclo de vida estructurado que permita asignar responsables, establecer plazos, comprobar avances y documentar resultados.

**Alcance de los cambios**

- "CasosSeguimiento".
- "getCaseFollowUpNotes" y "addCaseFollowUpNote".
- Estructura de "AccionesJSON" y sus validaciones.
- "ObservacionesConvivencia".
- Interfaces de docentes, orientación, dirección y responsables autorizados.

**Requisitos funcionales**

1. Definir un modelo estructurado para los planes de acompañamiento, evitando depender exclusivamente de un campo JSON libre para representar estados y relaciones.
2. Cada plan debe contener:
   - Identificador único.
   - Caso asociado.
   - Estudiante o participantes vinculados.
   - Fecha de apertura.
   - Motivo y objetivos concretos.
   - Responsable principal.
   - Participantes autorizados.
   - Acciones y compromisos.
   - Fechas de inicio y vencimiento.
   - Indicadores o criterios de revisión.
   - Estado del plan.
   - Historial de seguimiento.
3. Permitir acciones individuales con responsable, fecha límite, estado, comentarios y evidencia opcional.
4. Definir estados de caso y plan, por ejemplo: abierto, en evaluación, planificado, en seguimiento, pendiente de revisión, resuelto, cerrado y reabierto.
5. Diferenciar la resolución de una incidencia del cierre de su plan de acompañamiento. Resolver un incidente no implica necesariamente completar todas las acciones posteriores.
6. Permitir programar revisiones periódicas y registrar el resultado de cada revisión.
7. Notificar vencimientos, revisiones pendientes y compromisos no completados a las personas autorizadas.
8. Permitir registrar avances, incumplimientos, cambios de responsable y ajustes de objetivos con fecha, autor y motivo.
9. Incorporar plantillas configurables para intervenciones pedagógicas, mediación, compromisos conductuales y reuniones con responsables.
10. Permitir planes de acompañamiento preventivo que no requieran clasificar al estudiante como infractor.
11. Evitar que una observación inicial se convierta automáticamente en una sanción o una conclusión definitiva.
12. Diferenciar hechos observados, testimonios, valoraciones profesionales, decisiones y acciones ejecutadas.
13. Mantener la confidencialidad por caso, rol y asignación.
14. Permitir adjuntar evidencias mediante el acceso seguro de T-ASI-08.
15. Incorporar el registro de participantes, incluidos los distintos estudiantes y miembros del personal involucrados en un mismo incidente.
16. Permitir derivar un caso a orientación o dirección con motivo, destinatario y registro de aceptación de la derivación.
17. Evitar el cierre automático de un plan por ausencia de actividad o por cumplimiento de una fecha.
18. Generar un historial de seguimiento que permita consultar las acciones realizadas sin sobrescribir notas previas.

**Comportamiento esperado**

Cada caso puede contar con un plan de acciones con responsables y fechas. Los usuarios autorizados registran avances y revisiones; el sistema identifica compromisos vencidos y permite documentar la resolución o reapertura del caso.

**Criterios de aceptación**

- Un plan puede crearse, asignarse, actualizarse, revisarse y cerrarse.
- Cada acción conserva responsable, estado y fechas.
- Una acción vencida se identifica sin cambiar automáticamente el estado del caso.
- La reapertura conserva la información de la resolución anterior.
- Las notas anteriores no desaparecen cuando se añade una nueva.
- Un docente sin asignación no puede consultar el plan completo.
- Las plantillas permiten crear planes consistentes y configurables.
- Se prueban casos con múltiples participantes, evidencias, cambios de responsable y revisiones vencidas.

**Dependencias:** T-ASI-03, para las comunicaciones a responsables; T-ASI-07, para la derivación desde alertas de asistencia; T-ASI-08, para las evidencias; T-ASI-16, para la conservación histórica.

---

### T-ASI-10 [P2] — Registro y validación de asistencia en actividades extracurriculares, eventos y excursiones

**Problema que debe resolverse**

La asistencia vinculada a sesiones académicas ordinarias no cubre necesariamente eventos, actividades extracurriculares, salidas de campo y excursiones. Estos contextos requieren listas específicas, responsables, autorizaciones y control de salida y retorno.

**Alcance de los cambios**

- Nuevo modelo de actividades y sesiones extraordinarias.
- Integración con "SesionesAsistencia" y "RegistrosAsistencia".
- Autorizaciones de participación.
- Gestión de responsables de actividad.
- Notificaciones y reportes.

**Requisitos funcionales**

1. Permitir crear actividades con nombre, tipo, fecha, horario, ubicación, organizador, responsable y lista de participantes.
2. Permitir seleccionar participantes por grado, sección, grupo, lista manual o criterios autorizados.
3. Registrar la participación prevista, autorización requerida, autorización recibida y asistencia efectiva como estados independientes.
4. Para excursiones, permitir registrar salida, llegada, controles intermedios cuando proceda y retorno.
5. Permitir listas de asistencia por grupo y responsable, con registro de quién realizó cada marcación.
6. Diferenciar presente, ausente, tardanza, retiro anticipado, no autorizado para participar y pendiente de confirmar.
7. Registrar observaciones operativas sin incluir información sensible innecesaria.
8. Permitir que un participante sea asignado a un grupo o responsable específico.
9. Detectar discrepancias entre la lista de participantes autorizados y la lista de asistencia efectiva.
10. Notificar a los responsables autorizados cambios relevantes, cancelaciones y situaciones de ausencia cuando corresponda.
11. Aplicar permisos específicos para que solo el personal asignado pueda editar la asistencia de la actividad.
12. Conservar la asistencia ordinaria sin duplicar una misma sesión académica por la asistencia a una actividad extraordinaria.
13. Definir si una actividad afecta la asistencia académica del día y cómo se refleja esa excepción en los cálculos.
14. Permitir imprimir o exportar listas operativas y generar un informe posterior a la actividad.
15. Admitir captura temporal sin conexión, con sincronización y detección de conflictos al recuperar conectividad.
16. Evitar que una lista offline o una autorización pendiente se interpreten como confirmación de asistencia o autorización definitiva.

**Comportamiento esperado**

El responsable de una actividad consulta la lista asignada, valida las autorizaciones y registra la participación real. Al finalizar, el sistema conserva un registro completo de los participantes previstos, presentes, ausentes y de las incidencias de salida o retorno.

**Criterios de aceptación**

- Una actividad puede crearse y asignarse a responsables.
- Las autorizaciones y la asistencia se consultan por separado.
- Un usuario ajeno a la actividad no puede modificar su lista.
- La asistencia extraordinaria no duplica la ordinaria.
- Se detectan participantes sin autorización cuando esta es obligatoria.
- Las marcaciones offline se sincronizan sin duplicados y muestran conflictos.
- Los informes permiten reconstruir la participación y las incidencias de la actividad.

**Dependencias:** T-ASI-01, para concurrencia y sincronización; T-ASI-02, para los estados de asistencia; T-ASI-03, para notificaciones; T-ASI-06, si la actividad requiere gestionar permisos de salida.

---

### T-ASI-11 [P2] — Edición rápida, navegación por teclado y accesibilidad en la toma de asistencia

**Problema que debe resolverse**

La marcación diaria es una operación repetitiva que debe ser rápida, precisa y accesible. La mejora no consiste únicamente en reducir clics: debe minimizar errores, mantener la claridad de los estados y funcionar en dispositivos móviles y equipos con conectividad limitada.

**Alcance de los cambios**

- "js/teacher.js".
- Vistas de asistencia en "teacher-dashboard.html".
- Componentes de tabla, formularios, modales y mensajes de estado.
- Integración con el guardado por lote y la sincronización offline.

**Requisitos funcionales**

1. Presentar la lista de estudiantes con identificación suficiente para evitar confusiones entre personas con nombres similares.
2. Permitir cambiar el estado de asistencia mediante teclado, sin depender exclusivamente del ratón o de controles táctiles.
3. Definir una navegación consistente con Tab, Shift+Tab, flechas, Enter y Espacio según el tipo de control.
4. Permitir marcación masiva por estado, con confirmación o posibilidad de deshacer antes de guardar.
5. No aplicar acciones masivas a estudiantes fuera del filtro visible ni a registros que no estén dentro de la sesión autorizada.
6. Resaltar visualmente los registros modificados y los que todavía no se han guardado.
7. Mostrar claramente si el registro está guardado, pendiente de sincronización, en conflicto o rechazado.
8. Incorporar búsqueda y filtros por nombre, identificador y estado, sin perder las modificaciones locales al cambiar la vista.
9. Mantener el foco al actualizar la lista, guardar o mostrar errores.
10. Ofrecer etiquetas textuales además de colores e iconos para distinguir los estados.
11. Proporcionar mensajes accesibles para lectores de pantalla y evitar depender exclusivamente de avisos visuales.
12. Permitir confirmar el cierre de una sesión cuando existan estudiantes pendientes.
13. Evitar la pérdida de modificaciones al recargar o cambiar accidentalmente de pantalla, utilizando el mecanismo de persistencia disponible.
14. Incorporar indicadores de conectividad y de cola de sincronización.
15. Adaptar la interfaz a pantallas pequeñas sin ocultar información necesaria ni provocar desplazamientos horizontales innecesarios.
16. Permitir revisar un resumen de los cambios antes del guardado definitivo.
17. Medir el tiempo de carga y el tiempo de interacción con listas representativas del tamaño real de los grupos.

**Comportamiento esperado**

El docente puede marcar y revisar una lista completa sin utilizar el ratón, identificar los cambios no guardados y corregir errores antes de confirmar. Una pérdida temporal de conectividad no debe hacer desaparecer los datos pendientes.

**Criterios de aceptación**

- La toma de asistencia puede completarse usando solo teclado.
- Los controles muestran foco visible y tienen etiquetas comprensibles.
- La marcación masiva afecta únicamente a los estudiantes seleccionados.
- Los cambios locales sobreviven a una interrupción temporal de conectividad.
- Los errores de guardado identifican qué registros requieren atención.
- Los colores no son el único medio para distinguir estados.
- Las pruebas de usabilidad verifican que la nueva interfaz no aumenta los errores de marcación.
- Las mediciones de rendimiento se realizan con listas de tamaño representativo y se documentan los resultados.

**Dependencias:** T-ASI-01, para mostrar y resolver conflictos; T-ASI-02, para los estados y validaciones; T-ASI-04, para mostrar correctamente las restricciones de períodos cerrados.

---

### T-ASI-12 [P2] — Sincronización de justificaciones aprobadas con el expediente y los informes académicos

**Problema que debe resolverse**

La aprobación de una justificación modifica el registro de asistencia, pero se requiere asegurar que todos los resúmenes, informes, expedientes y documentos derivados reflejen el cambio sin inconsistencias ni duplicaciones.

**Alcance de los cambios**

- "submitAttendanceJustification".
- "reviewAttendanceJustification".
- "getAttendanceJustifications".
- "getStudentAttendanceSummary".
- "RegistrosAsistencia", "JustificacionesAsistencia" y módulos que consuman los datos de asistencia.
- Boletines e informes que presenten indicadores de asistencia.

**Requisitos funcionales**

1. Definir la justificación como un registro propio relacionado con el estudiante, el período y la sesión o sesiones afectadas.
2. Conservar el estado de la solicitud, el motivo, la decisión, el autor y las fechas relevantes.
3. Diferenciar el estado de la solicitud del estado derivado de asistencia.
4. Al aprobar o rechazar una justificación, actualizar los registros afectados mediante una operación idempotente.
5. Identificar las vistas, informes y cálculos que dependen del registro modificado.
6. Actualizar los indicadores de asistencia y puntualidad sin duplicar los eventos originales.
7. Si un resumen se almacena físicamente, invalidarlo o recalcularlo con un mecanismo verificable. No asumir que el cambio en la hoja original actualiza automáticamente todos los resúmenes.
8. Mantener una relación trazable entre la justificación, la decisión y el registro de asistencia que modifica.
9. Gestionar justificaciones que afecten varias sesiones, períodos o materias mediante una relación explícita con cada registro afectado.
10. Rechazar solicitudes que intenten modificar registros que no pertenecen al estudiante o período indicados.
11. Permitir revisar las justificaciones y sus resoluciones desde el expediente del estudiante según los permisos.
12. Evitar mostrar el motivo detallado de una justificación en módulos que solo necesitan conocer su estado.
13. Definir qué ocurre cuando una justificación se aprueba después de emitirse un boletín o cerrarse un período.
14. Marcar los informes afectados que deban regenerarse y conservar la versión previamente emitida cuando sea necesario.
15. Garantizar que las operaciones repetidas no dupliquen justificaciones, cambios de estado ni notificaciones.
16. Incluir una vista de discrepancias entre justificaciones aprobadas y registros de asistencia que todavía no reflejan la resolución.

**Comportamiento esperado**

Una decisión aprobada actualiza de manera consistente la clasificación de la asistencia y sus resúmenes dependientes. La plataforma conserva el hecho histórico, la justificación y la decisión administrativa, y permite identificar documentos que requieren actualización.

**Criterios de aceptación**

- Aprobar una justificación actualiza todos los registros afectados.
- Repetir la operación no duplica los cambios.
- Una justificación rechazada no modifica indebidamente la asistencia.
- Los informes reflejan la misma clasificación que el expediente.
- Una corrección de período cerrado sigue el procedimiento excepcional autorizado.
- Las discrepancias entre solicitud y registro se detectan y pueden resolverse.
- Las pruebas incluyen solicitudes múltiples, decisiones repetidas, cambios retroactivos autorizados y documentos ya emitidos.

**Dependencias:** T-ASI-02, para los estados de asistencia; T-ASI-04, para períodos cerrados; T-ASI-14, para exportaciones coherentes; T-ASI-15, para conciliación de los datos derivados.

---

### T-ASI-13 [P3] — Panel consolidado de puntualidad, asistencia y ausentismo

**Problema que debe resolverse**

Los porcentajes y gráficos individuales existentes no proporcionan necesariamente una visión consolidada que permita comparar períodos, grados, secciones, materias y patrones de puntualidad de manera consistente.

**Alcance de los cambios**

- "getStudentAttendanceSummary".
- Motor de gráficos de "js/ui-common.js".
- Paneles de docentes, orientación y dirección.
- Nuevos servicios de agregación de indicadores.
- Filtros y permisos de consulta.

**Requisitos funcionales**

1. Ofrecer vistas agregadas por centro, año escolar, período, grado, sección, materia y rango de fechas, de acuerdo con los permisos del usuario.
2. Presentar, como mínimo:
   - Porcentaje de asistencia.
   - Número y porcentaje de ausencias justificadas.
   - Número y porcentaje de ausencias injustificadas.
   - Número de tardanzas.
   - Tendencia de puntualidad.
   - Estudiantes con patrones reiterados.
   - Sesiones incompletas que afecten la fiabilidad de los datos.
3. Separar indicadores de asistencia y puntualidad. No utilizar una única cifra que oculte diferencias relevantes.
4. Mostrar numerador, denominador, período y reglas de cálculo de cada indicador.
5. Excluir del cálculo las sesiones no válidas según la política de asistencia.
6. Permitir comparar períodos equivalentes y consultar tendencias históricas.
7. Incorporar filtros interactivos que actualicen las métricas y las tablas relacionadas.
8. Permitir navegar desde un indicador agregado a los datos individuales cuando el rol tenga autorización para hacerlo.
9. No revelar nombres ni expedientes individuales en vistas agregadas de usuarios que no necesiten esa información.
10. Diferenciar valores nulos, datos insuficientes y resultados iguales a cero.
11. Mostrar la fecha de actualización de los datos y señalar si existen procesos de sincronización pendientes.
12. Evitar cálculos divergentes entre gráficos, tablas y exportaciones mediante un servicio de agregación común.
13. Permitir configurar umbrales de visualización y alertas según el centro educativo.
14. Incorporar tablas accesibles y una alternativa textual a las visualizaciones.
15. Optimizar las consultas para evitar recorrer repetidamente todas las hojas de cálculo por cada componente del panel.
16. Definir cuándo los datos agregados pueden almacenarse en caché y cómo invalidarlos cuando se modifica la asistencia.

**Comportamiento esperado**

La dirección puede detectar tendencias de ausentismo y puntualidad, filtrar por período y localizar los grupos que requieren revisión. Los datos agregados deben coincidir con los registros individuales y señalar las limitaciones de cobertura cuando existan sesiones pendientes.

**Criterios de aceptación**

- Los indicadores coinciden con los cálculos validados a partir de registros de prueba.
- Los filtros actualizan todas las visualizaciones relacionadas.
- El panel diferencia cero de datos insuficientes.
- Las sesiones incompletas no producen conclusiones engañosas.
- Los usuarios sin permiso no pueden navegar a datos individuales.
- La fecha de actualización y las limitaciones de los datos son visibles.
- Se documenta el rendimiento con volúmenes representativos.
- Las exportaciones y los gráficos utilizan las mismas reglas de cálculo.

**Dependencias:** T-ASI-02, para las reglas de cálculo; T-ASI-07, para identificar patrones y alertas; T-ASI-12 y T-ASI-15, para garantizar la coherencia de los indicadores.

---

### T-ASI-14 [P3] — Exportación estructurada de informes de asistencia en Excel y PDF

**Problema que debe resolverse**

Los datos de asistencia deben poder utilizarse en procesos administrativos, reuniones, revisiones y comunicaciones institucionales sin depender exclusivamente de las pantallas del sistema.

**Alcance de los cambios**

- Servicio de generación de informes.
- "generateSchoolDocument".
- Vistas de informes de asistencia y convivencia.
- Exportación a Excel y PDF.
- Permisos de consulta y descarga.

**Requisitos funcionales**

1. Permitir generar informes por estudiante, grado, sección, materia, docente, período y rango de fechas.
2. Incorporar informes diferenciados para:
   - Asistencia diaria.
   - Historial individual.
   - Resumen por período.
   - Tardanzas y ausencias.
   - Justificaciones pendientes, aprobadas y rechazadas.
   - Salidas anticipadas.
   - Actividades extraordinarias.
   - Indicadores consolidados.
3. Permitir configurar columnas, filtros, orden, agrupaciones y períodos, manteniendo las reglas de cálculo institucionales.
4. Incluir en cada informe la fecha de generación, período cubierto, filtros aplicados y definiciones necesarias para interpretar las métricas.
5. Generar archivos Excel estructurados en filas y columnas, con encabezados consistentes y tipos de datos adecuados.
6. Evitar que identificadores, fechas y valores numéricos se exporten de manera ambigua por formatos regionales.
7. Generar PDF con paginación, encabezados, títulos, totales y tablas legibles.
8. Controlar la repetición de encabezados en tablas extensas y evitar que los registros queden cortados de manera que se pierda su significado.
9. No incluir datos disciplinarios sensibles en informes generales de asistencia.
10. Aplicar permisos específicos al generar, consultar y descargar cada informe.
11. Validar los filtros y la autorización en el servidor, no solo en la interfaz.
12. Establecer límites razonables de volumen y un mecanismo para procesar informes extensos sin bloquear operaciones interactivas.
13. Mostrar un estado claro durante la generación y comunicar los errores sin afirmar que el archivo existe cuando la generación falló.
14. Evitar nombres de archivo ambiguos y utilizar convenciones consistentes que identifiquen tipo de informe y período.
15. Registrar quién generó y descargó informes sensibles, cuando corresponda.
16. Permitir comparar el archivo exportado con los datos que se muestran en pantalla.
17. Si se ofrece una exportación de expedientes disciplinarios, aplicar un conjunto de permisos y controles más restrictivo que el utilizado para los informes ordinarios de asistencia.

**Comportamiento esperado**

El usuario autorizado puede seleccionar los filtros, generar el informe, revisar sus datos y descargarlo en el formato solicitado. Los totales y estados coinciden con los que presenta la plataforma para el mismo conjunto de datos.

**Criterios de aceptación**

- Cada tipo de informe genera un archivo válido y legible.
- Los filtros aplicados aparecen reflejados en el resultado.
- Los totales coinciden con los cálculos del sistema.
- Las fechas y los números mantienen su significado al abrir el Excel.
- Los PDF extensos conservan encabezados y paginación.
- Los usuarios no autorizados no pueden generar ni descargar informes sensibles.
- Los errores de generación se notifican sin producir enlaces inválidos.
- Se prueban volúmenes pequeños, medianos y representativos del uso real.

**Dependencias:** T-ASI-02, para los estados y cálculos; T-ASI-12 y T-ASI-13, para los datos consolidados; T-ASI-15, para detectar discrepancias antes de exportar informes oficiales.

---

### T-ASI-15 [P3] — Herramienta de conciliación entre registros diarios y resúmenes académicos

**Problema que debe resolverse**

Los registros individuales, las justificaciones, los resúmenes calculados y los boletines pueden divergir si una actualización no se propaga correctamente o si existen datos históricos inconsistentes. Se requiere una herramienta que detecte, clasifique y permita resolver esas diferencias.

**Alcance de los cambios**

- "SesionesAsistencia".
- "RegistrosAsistencia".
- "JustificacionesAsistencia".
- "getStudentAttendanceSummary".
- Resúmenes y documentos académicos.
- Nuevo servicio de conciliación y panel administrativo.

**Requisitos funcionales**

1. Definir una fuente de verdad para cada dato:
   - Sesión y estado de cierre.
   - Registro individual de asistencia.
   - Estado de justificación.
   - Reglas de cálculo.
   - Resumen calculado.
   - Valores incorporados en informes o boletines.
2. Ejecutar conciliaciones por estudiante, período, materia, grado y sección.
3. Comparar los registros de origen con los valores derivados y detectar:
   - Sesiones sin registros esperados.
   - Registros duplicados.
   - Justificaciones aprobadas que no se reflejan en la asistencia.
   - Resúmenes desactualizados.
   - Diferencias de denominador.
   - Estados incompatibles.
   - Boletines que no coinciden con la versión vigente de los datos.
4. Mostrar para cada discrepancia el valor de origen, el valor derivado, la regla aplicable y la posible causa.
5. Clasificar los resultados en categorías como correcto, discrepancia informativa, requiere revisión y requiere corrección autorizada.
6. Permitir ejecutar una conciliación sin modificar los datos.
7. Permitir recalcular resúmenes derivados cuando la discrepancia sea reproducible y el procedimiento esté autorizado.
8. No corregir automáticamente los registros originales cuando la causa sea incierta.
9. Exigir revisión humana para conflictos que afecten registros cerrados, decisiones administrativas o documentos oficiales.
10. Mantener un registro de conciliaciones, resultados, acciones ejecutadas y usuario responsable.
11. Permitir repetir una conciliación sin duplicar correcciones ni generar cambios artificiales.
12. Ofrecer una vista para revisar discrepancias en lote y priorizarlas según impacto.
13. Detectar si el resumen o el boletín corresponde a una versión anterior de los datos.
14. Permitir identificar los documentos que deben regenerarse tras una rectificación autorizada.
15. Incorporar un modo de simulación que muestre qué cambiaría al recalcular un resumen antes de aplicar la operación.
16. Generar informes de discrepancias por período y tipo de problema.

**Comportamiento esperado**

El administrador puede ejecutar una conciliación, consultar las diferencias y determinar cuáles requieren una reparación automática controlada o una corrección manual. Las discrepancias se resuelven sin sobrescribir los registros históricos ni ocultar la causa del problema.

**Criterios de aceptación**

- Los registros correctos no generan falsos positivos.
- Las discrepancias sembradas deliberadamente se detectan y clasifican.
- El modo de simulación no modifica los datos.
- El recálculo autorizado produce el resultado esperado y es idempotente.
- Los casos ambiguos se envían a revisión, no se corrigen automáticamente.
- Las correcciones quedan registradas con usuario, fecha, motivo y resultado.
- Se identifica qué boletines o informes necesitan regeneración.
- La conciliación puede ejecutarse repetidamente sin generar diferencias artificiales.

**Dependencias:** T-ASI-02, para los estados canónicos; T-ASI-04, para las restricciones históricas; T-ASI-12, para la sincronización de justificaciones; T-ASI-13 y T-ASI-14, para mantener coherentes indicadores y exportaciones.

---

### T-ASI-16 [P3] — Respaldo verificable e historial inmutable de asistencia y convivencia

**Problema que debe resolverse**

La conservación de los registros en hojas de cálculo no garantiza por sí sola que puedan recuperarse de una eliminación accidental, una modificación indebida, una corrupción de datos o una inconsistencia propagada a varios módulos.

**Alcance de los cambios**

- Registros de asistencia.
- Justificaciones.
- Incidencias y casos de seguimiento.
- Observaciones de convivencia.
- Evidencias adjuntas.
- Historial de modificaciones y operaciones de conciliación.
- Mecanismo de respaldo y restauración.

**Requisitos funcionales**

1. Definir una política de respaldo para los registros operativos y los expedientes de convivencia.
2. Identificar qué datos deben respaldarse:
   - Sesiones y registros individuales.
   - Justificaciones y sus decisiones.
   - Incidencias y participantes.
   - Casos, planes de acompañamiento y seguimientos.
   - Referencias a evidencias y metadatos.
   - Historial de modificaciones.
   - Configuración necesaria para interpretar los registros históricos.
3. Establecer frecuencia de respaldo, retención, responsables y objetivos de recuperación acordes con el impacto de los datos.
4. Separar los respaldos de la fuente operativa y limitar los permisos de modificación o eliminación de las copias.
5. Conservar las evidencias documentales con los controles de acceso definidos para su categoría de sensibilidad.
6. Registrar cada ejecución de respaldo, su fecha, alcance, resultado, volumen y errores.
7. Verificar la integridad de las copias mediante comprobaciones de consistencia y, cuando corresponda, hashes de archivos o manifiestos.
8. No considerar un respaldo válido únicamente porque se haya creado un archivo. Debe verificarse que el contenido sea legible y completo.
9. Mantener un historial de cambios que permita reconstruir quién modificó un registro, cuándo, qué cambió y con qué motivo.
10. Proteger los eventos históricos frente a la edición ordinaria. Las correcciones deben añadirse como nuevos eventos o rectificaciones trazables.
11. Definir procedimientos para restaurar datos sin sobrescribir indiscriminadamente registros válidos que se hayan creado después del respaldo.
12. Incorporar una restauración de prueba en un entorno controlado.
13. Verificar las relaciones entre registros restaurados, estudiantes, períodos, justificaciones, casos y archivos adjuntos.
14. Detectar referencias rotas a evidencias y registrar las que no puedan recuperarse.
15. Definir controles para evitar que una restauración duplique sesiones, notificaciones, justificaciones o casos.
16. Permitir consultas de auditoría por estudiante, período, usuario, tipo de evento y caso.
17. Restringir el acceso a los respaldos y a las funciones de restauración a personal autorizado.
18. Definir un procedimiento de conservación y eliminación conforme a la política institucional y las obligaciones aplicables, sin prometer una conservación ilimitada de datos personales.
19. Permitir verificar que una copia corresponde a un momento concreto y que no ha sido modificada de forma no autorizada.
20. Documentar los resultados de las pruebas de recuperación y las limitaciones encontradas.

**Comportamiento esperado**

La institución puede verificar que los respaldos están completos, consultar el historial de modificaciones y recuperar datos ante una incidencia. La restauración conserva las relaciones entre registros y no genera duplicados ni borra silenciosamente información válida posterior al respaldo.

**Criterios de aceptación**

- Una ejecución de respaldo registra su alcance y resultado.
- Una copia incompleta o ilegible se identifica como fallida.
- Una restauración de prueba recupera los registros y sus relaciones.
- Las correcciones históricas conservan los valores anteriores y el motivo.
- Los respaldos no son modificables por los roles ordinarios de asistencia.
- Los archivos adjuntos restaurados mantienen los controles de acceso correspondientes.
- La restauración no duplica registros ni vuelve a enviar notificaciones ya procesadas.
- Se comprueba la recuperación de datos de asistencia, justificaciones y expedientes de convivencia.
- La institución dispone de resultados documentados de la prueba de recuperación.

**Dependencias:** T-ASI-01, para registrar correctamente las operaciones concurrentes; T-ASI-04, para el historial de períodos cerrados; T-ASI-08, para la gestión de evidencias; T-ASI-09, para los planes y seguimientos; T-ASI-12 y T-ASI-15, para recuperar y verificar los datos derivados.

---

### MATRIZ DE DEPENDENCIAS Y ORDEN DE EJECUCIÓN RECOMENDADO FASE 10 (ASISTENCIA Y CONVIVENCIA)

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-ASI-01.** Control de concurrencia transaccional en el registro masivo de asistencia | **P1** | `saveAttendanceRecords` / `LockService` |
| **2** | **T-ASI-02.** Distinción entre sesión no registrada, ausencia y excusa | **P1** | `RegistrosAsistencia` |
| **3** | **T-ASI-03.** Verificación de relaciones familiares y autorización de notificaciones | **P1** | `RelacionesFamiliares` / RBAC |
| **4** | **T-ASI-04.** Protección de registros de períodos y años escolares cerrados | **P1** | `CierresPeriodos` |
| **5** | **T-ASI-08.** Acceso seguro a evidencias documentales de expedientes de convivencia | **P2** | RBAC / Drive proxy |
| **6** | **T-ASI-06.** Módulo de salidas anticipadas y pases de salida | **P2** | `SalidasAnticipadas` |
| **7** | **T-ASI-07.** Motor configurable de alertas por inasistencias e impuntualidades | **P2** | `CasosSeguimiento` / Notificaciones |
| **8** | **T-ASI-09.** Compromisos pedagógicos y planes de acompañamiento conductual | **P2** | `CasosSeguimiento` |
| **9** | **T-ASI-11.** Edición rápida, navegación por teclado y accesibilidad en toma de lista | **P2** | `js/teacher.js` / Table UX |
| **10** | **T-ASI-12.** Sincronización de justificaciones aprobadas con expediente | **P2** | `JustificacionesAsistencia` |
| **11** | **T-ASI-05.** Portal de marcación diaria de entrada y salida del personal | **P2** | Control horario laboral |
| **12** | **T-ASI-10.** Asistencia en excursiones, eventos y validación de permisos | **P2** | Permisos / Salidas |
| **13** | **T-ASI-13.** Panel consolidado de puntualidad, asistencia y ausentismo | **P3** | Universal Chart Engine |
| **14** | **T-ASI-14.** Exportación estructurada de informes de asistencia Excel/PDF | **P3** | `generateSchoolDocument` |
| **15** | **T-ASI-15.** Herramienta de conciliación entre registros diarios y resúmenes | **P3** | Reconciliation Engine |
| **16** | **T-ASI-16.** Respaldo verificable e historial inmutable de asistencia y convivencia | **P3** | `createSystemBackup` |



---

## BACKLOG DE IMPLEMENTACIÓN Y OPTIMIZACIÓN: FASE 11. COMUNICACIÓN Y COLABORACIÓN INSTITUCIONAL

### T-COM-01 [P1] — Actualización en tiempo real del centro unificado de comunicaciones

**Estado de partida:** Funcional. La actualización de contadores y notificaciones requiere recargar la vista.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`getUnifiedNotifications`, `getUserNotifications`, `markNotificationAsRead`), `js/ui-common.js`, `js/teacher.js`, `js/student.js`.

#### Requerimientos funcionales

- Actualizar automáticamente el contador de mensajes sin leer, las notificaciones pendientes y los avisos urgentes sin recargar la página.
- Mantener una bandeja unificada que consolide comunicados institucionales, mensajes internos, recordatorios y solicitudes administrativas, sin presentar el mismo evento varias veces.
- Permitir abrir cada elemento desde la bandeja y navegar hasta su conversación, comunicado, trámite o evento de origen, siempre que el usuario tenga autorización.
- Distinguir claramente los elementos nuevos, leídos, pendientes de confirmación y completados.
- Incorporar filtros por tipo de comunicación, prioridad, fecha, estado de lectura y contexto.
- Permitir marcar como leído, archivar y acceder al historial desde la propia bandeja, respetando las reglas de cada tipo de elemento.
- Actualizar los contadores de forma coherente cuando se lee un mensaje desde otra vista, se recibe una respuesta o se confirma un comunicado.
- Mostrar los avisos urgentes con suficiente prominencia, sin convertir todas las notificaciones en alertas invasivas.

#### Cambios necesarios

- Incorporar un mecanismo de actualización incremental, mediante sondeo periódico, sincronización por eventos o la alternativa compatible con la infraestructura existente.
- Evitar consultas completas e innecesarias a todos los servicios cuando solo hayan cambiado unos pocos elementos.
- Gestionar la conexión interrumpida, los errores temporales, las sesiones vencidas y la recuperación después de recuperar la conectividad.
- Evitar solicitudes simultáneas redundantes y respuestas fuera de orden que sobrescriban información más reciente.
- Incorporar indicadores de última sincronización y estados de carga, error y recuperación.
- Revisar los servicios de origen para que compartan identificadores estables y estados compatibles con la bandeja unificada.

#### Comportamiento esperado

La persona usuaria recibe una notificación y ve actualizarse la bandeja y su contador sin recargar la página. Si abre el mismo mensaje desde otra sección, el estado se sincroniza. Si pierde conexión, la interfaz informa de la situación sin presentar datos antiguos como recién actualizados.

#### Criterios de aceptación

1. Una notificación nueva aparece en la bandeja dentro de un intervalo máximo de 10 segundos en condiciones normales de conectividad.
2. El contador coincide con la cantidad real de elementos no leídos que corresponden al usuario.
3. Abrir o confirmar un elemento actualiza su estado y el contador sin duplicar registros.
4. Recibir una misma notificación desde dos servicios no produce dos entradas para el mismo evento.
5. Tras una interrupción de red, la bandeja recupera la sincronización sin perder ni duplicar elementos.
6. Los usuarios no pueden acceder a notificaciones ajenas manipulando identificadores o parámetros.
7. Las actualizaciones no provocan recargas completas ni consultas innecesarias de alto volumen.
8. Se comprueba el comportamiento en escritorio y dispositivos móviles.

**Dependencias:** T-COM-02, T-COM-06, T-COM-07 y T-COM-10.

---

### T-COM-02 [P1] — Segmentación avanzada de destinatarios y aislamiento de información

**Estado de partida:** Funcional. La resolución de audiencias y la autorización por rol se realizan en el servidor.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`createInstitutionalAnnouncement`, `sendMultiChannelNotification`), `RelacionesFamiliares`, `Matriculas`, `Secciones`, asignaciones docentes.

#### Requerimientos funcionales

- Permitir dirigir comunicaciones a toda la institución, roles autorizados, grados, secciones, asignaturas, grupos docentes, familias y destinatarios individuales.
- Permitir combinar criterios de segmentación, siempre que el emisor tenga permiso para consultar y seleccionar esos grupos.
- Resolver las audiencias definitivas en el servidor, utilizando las matrículas, asignaciones, relaciones familiares, roles y permisos vigentes.
- Distinguir entre destinatarios previstos, destinatarios elegibles, destinatarios excluidos y destinatarios que no pudieron ser resueltos.
- Permitir previsualizar el alcance de una comunicación antes de enviarla, mostrando cantidades por grupo y una lista de destinatarios únicamente cuando el rol lo permita.
- Evitar que un destinatario vea las direcciones de correo, teléfonos, expedientes o datos personales de otros receptores sin autorización.
- Aplicar cambios de matrícula, sección, relación familiar o asignación docente al resolver futuras comunicaciones.
- Definir el tratamiento de las comunicaciones ya enviadas cuando cambia una relación académica o familiar, conservando la trazabilidad histórica sin conceder acceso indebido.
- Permitir excluir destinatarios específicos únicamente cuando la política institucional y el tipo de comunicación lo permitan.
- Distinguir comunicaciones obligatorias de avisos opcionales para que las preferencias personales no supriman notificaciones legal o institucionalmente requeridas.

#### Cambios necesarios

- Revisar las reglas de autorización en los puntos de creación, consulta, envío, respuesta, descarga de adjuntos y lectura de reportes.
- Centralizar o armonizar la resolución de audiencias para evitar que cada canal aplique reglas diferentes.
- Validar nuevamente los permisos en el momento del envío, no solo cuando se abre el formulario.
- Implementar una vista previa del alcance que no revele datos personales a usuarios sin autorización.
- Registrar los criterios utilizados para resolver la audiencia y el resultado de la resolución, evitando almacenar copias innecesarias de información sensible.
- Gestionar explícitamente destinatarios inválidos, relaciones ambiguas, usuarios inactivos y grupos vacíos.

#### Comportamiento esperado

Una comunicación dirigida a una sección se entrega únicamente a los usuarios que cumplen los criterios autorizados. Los destinatarios no pueden acceder a mensajes de otros grupos. Si una relación académica cambia antes del envío, el sistema recalcula la audiencia según las reglas vigentes.

#### Criterios de aceptación

1. Las combinaciones de rol, grado, sección, asignatura y relación familiar producen la audiencia prevista.
2. Una solicitud manipulada desde el navegador no permite enviar comunicaciones a grupos no autorizados.
3. Ningún usuario puede consultar destinatarios, mensajes, adjuntos o reportes fuera de su alcance.
4. La vista previa y el resultado efectivo del envío coinciden, salvo cambios concurrentes identificados y registrados.
5. Se prueban usuarios con varias funciones, familias con varios estudiantes, matrículas inactivas, cambios de sección y cuentas deshabilitadas.
6. Los canales externos respetan la misma audiencia autorizada que la bandeja interna.
7. Las comunicaciones obligatorias no se omiten por preferencias destinadas a avisos opcionales.
8. Los fallos de resolución impiden el envío cuando existe riesgo de fuga de información.

**Dependencias:** T-COM-03, T-COM-04, T-COM-06, T-COM-07 y T-COM-08.

---

### T-COM-03 [P1] — Seguridad, confidencialidad y trazabilidad integral

**Estado de partida:** Funcional. Existe registro estructurado de operaciones, pero debe verificarse su cobertura y resistencia ante accesos indebidos.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`getInternalMessages`, `getInstitutionalAnnouncements`, `logStructuredEvent`), proxy de descarga Drive, `ROLE_PERMISSIONS`.

#### Requerimientos funcionales

- Aplicar autorización en el servidor para crear, consultar, modificar, retirar, responder, confirmar, exportar y enviar comunicaciones.
- Mantener la separación de acceso entre Dirección, Secretaría, docentes, estudiantes, familias y personal administrativo.
- Proteger el contenido de los mensajes, los datos de los destinatarios y los adjuntos durante el transporte y en los sistemas de almacenamiento.
- Evitar que los registros de auditoría almacenen contraseñas, credenciales de proveedores, tokens de acceso o contenido sensible innecesario.
- Registrar, como mínimo, el actor, el rol efectivo, la operación, el identificador del recurso, la fecha y hora, el resultado y el motivo de los fallos relevantes.
- Registrar los cambios de estado de los comunicados y envíos, incluidos creación, aprobación cuando corresponda, publicación, cancelación, reintento y confirmación.
- Diferenciar las operaciones ejecutadas por una persona de las acciones automáticas del sistema.
- Conservar evidencia de las comunicaciones institucionales que requieran trazabilidad, según la política de retención.
- Evitar que usuarios ordinarios modifiquen o eliminen los registros de auditoría.
- Gestionar credenciales de correo, SMS y otros proveedores mediante mecanismos seguros, sin exponerlas en interfaces, respuestas del servicio o registros.
- Aplicar límites razonables a consultas, envíos masivos y operaciones sensibles.

#### Cambios necesarios

- Auditar los puntos de entrada de los microservicios y las rutas de acceso a Google Sheets, Google Drive y proveedores externos.
- Verificar que los permisos se validan del lado servidor y que los identificadores proporcionados por el cliente no se consideran prueba de autorización.
- Revisar el transporte cifrado, el almacenamiento de credenciales y los permisos de los adjuntos en Drive.
- Uniformar el esquema de auditoría y correlacionar una operación de envío con sus intentos, resultados y destinatarios.
- Añadir controles contra duplicación maliciosa de solicitudes, abuso de envíos masivos y consultas excesivas.
- Definir qué datos se conservan, durante cuánto tiempo y quién puede consultarlos.

#### Comportamiento esperado

Cada operación sensible puede reconstruirse mediante su historial. Los usuarios solo ven las comunicaciones autorizadas. Los fallos quedan registrados sin revelar secretos y las credenciales de los canales externos no aparecen en el frontend ni en las respuestas de depuración.

#### Criterios de aceptación

1. Las pruebas de acceso horizontal y vertical impiden consultar o modificar recursos de otros usuarios o roles.
2. Las pruebas de manipulación de identificadores no permiten saltarse las autorizaciones.
3. Las operaciones críticas producen registros de auditoría con actor, acción, recurso, fecha y resultado.
4. Los registros no contienen credenciales ni secretos recuperables.
5. Los adjuntos privados no son accesibles mediante enlaces públicos no autorizados.
6. Se comprueba el manejo de sesiones vencidas, usuarios deshabilitados y errores del proveedor.
7. Los registros de auditoría no pueden ser modificados por perfiles sin privilegios.
8. Existe una política documentada de conservación y acceso a los registros.

**Dependencias:** T-COM-02, T-COM-04, T-COM-06 y T-COM-07.

---

### T-COM-04 [P2] — Ciclo de vida de comunicados oficiales y circulares

**Estado de partida:** Funcional. Se admiten prioridades, adjuntos y confirmaciones de lectura.

- **Componentes relacionados:** `AnunciosInstitucionales`, `backend/user-service/Code.gs` (`createInstitutionalAnnouncement`, `getInstitutionalAnnouncements`), `js/teacher.js`, `js/student.js`.

#### Requerimientos funcionales

- Gestionar comunicados, noticias, circulares, avisos urgentes y notificaciones oficiales con tipos claramente diferenciados.
- Incorporar un ciclo de vida con estados como borrador, pendiente de aprobación cuando aplique, programado, publicado, suspendido, retirado y archivado.
- Permitir que la institución configure qué tipos de comunicado requieren aprobación y qué roles pueden aprobarlos.
- Conservar autor, fechas de creación y publicación, audiencia, prioridad, vigencia y estado.
- Permitir definir fecha de inicio y finalización de la publicación, sin eliminar el historial al vencer la vigencia.
- Admitir texto estructurado, enlaces y adjuntos con controles de tamaño, formato y acceso.
- Permitir editar un comunicado publicado únicamente según los permisos y las reglas de la institución.
- Mantener un historial de modificaciones y mostrar cuándo una comunicación fue actualizada después de su publicación.
- Diferenciar entre retirar una comunicación de la vista activa y eliminarla físicamente de los registros.
- Permitir indicar si la lectura es informativa o si exige confirmación explícita.
- Permitir destacar comunicaciones urgentes sin convertir la prioridad en un mecanismo para eludir permisos o controles.
- Ofrecer vistas previas para escritorio y móvil y para los distintos tipos de destinatario.
- Evitar que las ediciones cambien silenciosamente la versión que un usuario ya confirmó haber leído.

#### Cambios necesarios

- Revisar el modelo de datos y las transiciones de estado.
- Incorporar validaciones de fechas, permisos, campos obligatorios y adjuntos.
- Registrar versiones o revisiones de los comunicados.
- Integrar la publicación con la resolución de audiencia, la bandeja unificada y el motor de notificaciones.
- Añadir una vista de gestión con borradores, pendientes de aprobación, programados, publicados y vencidos.
- Implementar operaciones seguras para cancelar una publicación programada o corregir un comunicado difundido.

#### Comportamiento esperado

Un comunicado puede redactarse, aprobarse cuando sea necesario, publicarse en el momento definido y retirarse de la vista activa al vencer. Los cambios posteriores quedan identificados y no borran el historial ni las confirmaciones existentes.

#### Criterios de aceptación

1. Los estados solo permiten transiciones válidas y autorizadas.
2. Los comunicados programados no se publican antes de la fecha configurada.
3. Los comunicados vencidos dejan de aparecer como vigentes, pero permanecen accesibles en el historial autorizado.
4. La edición posterior a una confirmación genera una revisión identificable.
5. Los adjuntos respetan los permisos de la audiencia y las restricciones de formato.
6. Los usuarios no autorizados no pueden publicar ni aprobar comunicados manipulando solicitudes.
7. Las comunicaciones urgentes y obligatorias conservan su clasificación durante la distribución.
8. Las notificaciones correspondientes se generan sin duplicar el mismo evento.

**Dependencias:** T-COM-02, T-COM-03, T-COM-06, T-COM-07 y T-COM-08.

---

### T-COM-05 [P2] — Mensajería interna contextual y gestión de conversaciones

**Estado de partida:** Funcional. Existen conversaciones individuales y grupales vinculables a asignaturas, expedientes y trámites.

- **Componentes relacionados:** `MensajesInternos`, `backend/user-service/Code.gs` (`sendInternalMessage`, `getInternalMessages`, `getInternalConversations`), `js/teacher.js`, `js/student.js`.

#### Requerimientos funcionales

- Permitir conversaciones individuales y grupales entre perfiles autorizados.
- Mantener mensajes agrupados por conversación, con orden cronológico estable, autor, fecha, estado de envío y estado de lectura cuando corresponda.
- Permitir responder dentro de una conversación, conservar el contexto y distinguir mensajes nuevos de mensajes anteriores.
- Admitir adjuntos autorizados y validar tipo, tamaño y acceso.
- Permitir silenciar conversaciones, archivarlas y recuperar su historial.
- Mostrar el contexto relacionado, por ejemplo, estudiante, asignatura, trámite o expediente, sin exponerlo a miembros que no tengan acceso.
- Permitir que los usuarios autorizados consulten conversaciones anteriores aunque el asunto académico haya cambiado, siempre de acuerdo con la política de acceso histórico.
- Definir reglas para editar o retirar mensajes enviados, conservando trazabilidad cuando sea necesario.
- Incorporar indicadores de disponibilidad y horarios de contacto configurables, sin presentar esos indicadores como garantía de respuesta inmediata.
- Permitir reportar mensajes inapropiados o problemas de comunicación a los responsables autorizados.
- Evitar que una respuesta a un mensaje antiguo se confunda con una comunicación nueva sobre otro asunto.

#### Cambios necesarios

- Revisar el modelo de conversaciones, mensajes, participantes y referencias contextuales.
- Asegurar que los permisos se validan por conversación y también por cada recurso vinculado.
- Implementar paginación o carga progresiva para conversaciones extensas.
- Añadir búsqueda dentro de la conversación, indicadores de mensajes no leídos y sincronización de estados.
- Establecer límites para adjuntos y mecanismos de validación.
- Integrar las preferencias de notificación y el control de frecuencia de T-COM-07.

#### Comportamiento esperado

Los usuarios pueden mantener conversaciones ordenadas, recuperar mensajes anteriores y navegar al contexto asociado. Las conversaciones archivadas o silenciadas siguen disponibles, pero respetan las preferencias de aviso y los permisos de acceso.

#### Criterios de aceptación

1. Los mensajes se muestran en el orden correcto, incluso si llegan respuestas con retraso.
2. Los usuarios no autorizados no pueden entrar en una conversación mediante un enlace directo.
3. El contexto relacionado solo se muestra cuando el usuario tiene permiso para consultarlo.
4. Silenciar una conversación reduce las notificaciones opcionales sin impedir el acceso al contenido.
5. Los adjuntos inválidos o no autorizados son rechazados.
6. Los mensajes editados o retirados respetan la política de historial y no alteran indebidamente la evidencia de lectura.
7. La interfaz permite recuperar conversaciones extensas sin cargar todo el historial de una sola vez.
8. Se comprueba el funcionamiento con conexiones intermitentes y varios dispositivos.

**Dependencias:** T-COM-02, T-COM-03, T-COM-06, T-COM-07 y T-COM-10.

---

### T-COM-06 [P2] — Motor de notificaciones internas y adaptadores multicanal

**Estado de partida:** Funcional. Existen configuraciones de proveedores y registros de envíos externos.

- **Componentes relacionados:** `CanalesProveedoresConfig`, `RegistroEnviosExternos`, `backend/user-service/Code.gs` (`sendMultiChannelNotification`, `configureNotificationChannel`, `sendChannelNotificationTest`), `#modal-channel-config` en `teacher-dashboard.html`.

#### Requerimientos funcionales

- Unificar la generación y distribución de notificaciones originadas por comunicados, mensajes, eventos de calendario, tareas administrativas y avisos financieros autorizados.
- Separar el evento que genera la notificación de los canales por los que se distribuye.
- Admitir canales internos y, cuando exista una integración válida, correo electrónico, SMS y WhatsApp.
- Tratar Messenger u otros canales como integraciones opcionales sujetas a disponibilidad, autorización y compatibilidad real del proveedor.
- Mantener una interfaz común para los adaptadores, con operaciones diferenciadas de preparación, envío, consulta de estado y gestión de errores según las capacidades del proveedor.
- Validar destinatarios, credenciales, parámetros y plantillas antes de enviar.
- Permitir probar una integración sin enviar mensajes reales a destinatarios ajenos a la prueba.
- Registrar los estados de cada intento: pendiente, en proceso, aceptado por el proveedor, entregado cuando el proveedor lo confirme, fallido y estado desconocido.
- No confundir aceptación por el proveedor con entrega efectiva ni entrega con lectura.
- Gestionar límites del proveedor, errores temporales, fallos permanentes y tiempos de espera.
- Respetar las preferencias de los usuarios y las reglas institucionales aplicables a cada tipo de notificación.
- Permitir mensajes específicos por canal, con contenido adaptado a las limitaciones de longitud, formato y enlaces.
- Evitar que una caída del proveedor impida recibir una notificación por los canales internos disponibles.

#### Cambios necesarios

- Revisar `CanalesProveedoresConfig` y `RegistroEnviosExternos` para comprobar que representan correctamente las integraciones, intentos y estados.
- Separar el proceso de generación de notificaciones del proceso de envío a proveedores.
- Incorporar un mecanismo persistente de procesamiento pendiente y reintentos controlados, compatible con la infraestructura existente.
- Añadir clasificación de errores, tiempos de espera, límites de reintentos y gestión de circuitos temporalmente inactivos.
- Proteger credenciales y separar la configuración de pruebas de la configuración de producción.
- Incorporar correlación entre el evento original, la notificación interna y los envíos externos.
- Permitir desactivar un canal defectuoso sin deshabilitar la bandeja interna ni otros proveedores.

#### Comportamiento esperado

Un evento autorizado genera una notificación interna y, cuando corresponda, envíos externos. Si un proveedor falla temporalmente, el sistema registra el error y gestiona el reintento sin bloquear los demás canales ni crear mensajes duplicados.

#### Criterios de aceptación

1. Un mismo evento puede distribuirse por varios canales sin duplicar su registro de origen.
2. La caída de un proveedor no impide el funcionamiento de los canales independientes.
3. Los estados muestran únicamente aquello que la respuesta del proveedor permite confirmar.
4. Los errores temporales y permanentes reciben tratamientos diferentes.
5. Las pruebas de integración no envían mensajes reales fuera del destino de prueba autorizado.
6. Las credenciales no aparecen en el navegador ni en los registros.
7. Los destinatarios y contenidos respetan las autorizaciones y preferencias aplicables.
8. El historial permite reconstruir qué canales se intentaron, cuándo y con qué resultado.
9. Se verifican los límites y formatos reales de cada proveedor integrado.

**Dependencias:** T-COM-02, T-COM-03, T-COM-07 y T-COM-14.

---

### T-COM-07 [P1] — Idempotencia, deduplicación y control de frecuencia

**Estado de partida:** Se detectó una brecha explícita: falta un mecanismo de deduplicación idempotente mediante `DeduplicationKey` en la cola de envíos externos.

- **Componentes relacionados:** `PreferenciasNotificacion`, `backend/user-service/Code.gs` (`sendMultiChannelNotification`, `getNotificationPreferences`), `js/ui-common.js`.

#### Requerimientos funcionales

- Asignar una clave de idempotencia estable (`DeduplicationKey`) a cada operación lógica de envío.
- Reutilizar la misma clave cuando se reintenta la misma operación y generar una nueva cuando se trata de un envío legítimamente distinto.
- Evitar duplicados provocados por reintentos AJAX, doble clic, recarga de página, tiempos de espera o ejecución concurrente.
- Distinguir entre un evento original, sus destinatarios, los canales de distribución y los intentos realizados para cada destino.
- Permitir reintentar operaciones cuyo resultado sea conocido como fallido, sin volver a ejecutar un envío que ya se haya completado.
- Gestionar el resultado desconocido cuando el proveedor pudo haber aceptado un mensaje, pero la respuesta no llegó.
- Evitar prometer entrega exactamente una vez cuando el proveedor externo no ofrece garantías de idempotencia. En esos casos, definir una política de reconciliación y riesgo de duplicación.
- Aplicar límites de frecuencia por usuario, canal, tipo de evento y ventana temporal.
- Agrupar avisos informativos repetidos cuando sea adecuado, sin combinar mensajes urgentes, obligatorios o transaccionales que deban llegar por separado.
- Permitir preferencias por categoría y canal, con opciones de frecuencia compatibles con las políticas institucionales.
- Respetar las preferencias de silenciar o resumir avisos opcionales sin suprimir confirmaciones obligatorias o alertas que la institución haya definido como críticas.
- Evitar que dos servicios generen notificaciones equivalentes sobre el mismo evento.

#### Cambios necesarios

- Incorporar `DeduplicationKey` y las restricciones de unicidad necesarias en el almacenamiento de envíos.
- Definir el ámbito de unicidad de la clave y el ciclo de vida de los registros de idempotencia.
- Garantizar la creación atómica de la operación lógica y la reserva del envío, dentro de las posibilidades de la persistencia utilizada.
- Añadir estados de procesamiento para evitar que dos ejecuciones concurrentes envíen la misma operación.
- Implementar una política explícita para tiempos de espera, reintentos y resultados desconocidos.
- Revisar las reglas de frecuencia, agrupación y preferencias para que se apliquen uniformemente en los distintos canales.
- Conservar evidencia de los intentos bloqueados por duplicación y de las decisiones de supresión por frecuencia, sin generar registros excesivos.

#### Comportamiento esperado

Si una solicitud se repite por un tiempo de espera, el sistema reconoce que corresponde al mismo envío y no crea una segunda comunicación. Si el estado del proveedor es incierto, el sistema evita reintentar ciegamente cuando ello pueda duplicar el mensaje.

#### Criterios de aceptación

1. Repetir diez veces una misma solicitud lógica no genera diez envíos.
2. Dos ejecuciones concurrentes con la misma clave no producen envíos duplicados.
3. Una nueva comunicación legítima no queda bloqueada por una clave anterior.
4. Los reintentos conservan el identificador de la operación original.
5. Se prueban tiempos de espera antes y después de que el proveedor acepte el mensaje.
6. El sistema distingue estados fallidos, completados y desconocidos.
7. Las notificaciones informativas repetitivas pueden agruparse o limitarse según las reglas configuradas.
8. Los avisos obligatorios no se suprimen por un límite de frecuencia destinado a notificaciones opcionales.
9. Las preferencias se aplican de manera consistente en la bandeja interna y en los canales externos.
10. Los registros permiten explicar por qué un envío fue ejecutado, reintentado, agrupado o suprimido.

**Dependencias:** T-COM-02, T-COM-03, T-COM-06, T-COM-12 y T-COM-14.

---

### T-COM-08 [P2] — Confirmaciones de lectura, respuestas estructuradas y seguimiento

**Estado de partida:** Funcional. Se registran confirmaciones explícitas y existen reportes de lectura por sección.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`submitAnnouncementReceiptConfirmation`, `getAnnouncementReadReport`), `js/student.js`, `js/teacher.js`.

#### Requerimientos funcionales

- Diferenciar entre notificación generada, entregada por un canal, abierta, marcada como leída y confirmada explícitamente por el destinatario.
- Mantener la confirmación explícita para los comunicados que la requieren.
- Registrar destinatario, comunicado y versión, fecha y hora, tipo de respuesta y estado de procesamiento.
- Permitir respuestas estructuradas, como aceptación, autorización, rechazo, solicitud de aclaración o confirmación de asistencia, según el tipo de comunicación.
- Permitir preguntas o comentarios cuando el flujo institucional lo requiera.
- Definir fechas límite para respuestas y mostrar si están pendientes, completadas o vencidas.
- Permitir corregir una respuesta únicamente mediante un procedimiento autorizado y trazable.
- Mostrar reportes por grado, sección, destinatario, tipo de comunicación y estado de confirmación, de acuerdo con los permisos.
- Permitir identificar destinatarios pendientes sin revelar información a usuarios que no estén autorizados.
- Facilitar recordatorios dirigidos exclusivamente a los destinatarios que aún no han respondido.
- Permitir exportar reportes autorizados con fecha de corte y criterios de selección.
- Evitar interpretar una apertura automática de correo o una notificación de entrega como confirmación expresa de lectura.

#### Cambios necesarios

- Revisar el modelo de confirmaciones para vincular cada respuesta con la versión exacta del comunicado.
- Separar los estados técnicos del canal de los estados de lectura y respuesta.
- Incorporar formularios de respuesta configurables para las comunicaciones que los necesiten.
- Añadir filtros, indicadores de avance y listas de pendientes en los reportes.
- Integrar los recordatorios con el motor de notificaciones y la deduplicación.
- Definir reglas de acceso y conservación para confirmaciones que tengan consecuencias administrativas.

#### Comportamiento esperado

Dirección o Secretaría puede publicar una circular obligatoria, consultar quién confirmó la versión vigente y enviar recordatorios únicamente a quienes siguen pendientes. Los reportes distinguen las confirmaciones explícitas de los estados técnicos de entrega o apertura.

#### Criterios de aceptación

1. Cada confirmación queda asociada al destinatario y a la versión correcta.
2. Una respuesta repetida no crea confirmaciones contradictorias ni duplica el registro.
3. Los cambios posteriores del comunicado no alteran las confirmaciones históricas.
4. Los reportes coinciden con los registros individuales y con la audiencia efectiva.
5. Los recordatorios se dirigen únicamente a destinatarios pendientes y autorizados.
6. Se puede distinguir claramente entre entregado, leído y confirmado.
7. Los usuarios no autorizados no pueden consultar las respuestas ni los reportes.
8. Los formularios de respuesta validan campos, fechas límite y estados permitidos.

**Dependencias:** T-COM-02, T-COM-03, T-COM-04, T-COM-06 y T-COM-07.

---

### T-COM-09 [P2] — Calendario institucional, convocatorias y recordatorios

**Estado de partida:** Funcional. Se agregan eventos académicos, reuniones, exámenes y actividades institucionales.

- **Componentes relacionados:** `EventosCalendario`, `backend/user-service/Code.gs` (`getInstitutionalCalendarEvents`, `getPendingReminders`, `getAppointmentBookings`, `bookAppointment`), `js/teacher.js`, `js/student.js`.

#### Requerimientos funcionales

- Mostrar eventos según el calendario y los permisos del usuario: institucionales, académicos, reuniones, evaluaciones y actividades relevantes.
- Permitir vistas mensual, semanal y de agenda, con navegación accesible entre fechas.
- Diferenciar eventos de asistencia obligatoria, eventos informativos y actividades opcionales.
- Gestionar convocatorias con fecha, hora, duración, ubicación o enlace autorizado, organizador, destinatarios y descripción.
- Permitir confirmar asistencia, rechazar una invitación o indicar que se necesita una alternativa, cuando corresponda.
- Permitir reuniones presenciales y virtuales sin asumir que toda reunión dispone de integración externa.
- Gestionar cambios, cancelaciones y reprogramaciones, notificando a los participantes afectados.
- Permitir recordatorios configurables y prevenir que se envíen varias veces para un mismo evento.
- Respetar la zona horaria institucional y mostrar fechas y horas de manera coherente para los participantes.
- Vincular reuniones con estudiantes, grupos, asignaturas o trámites cuando corresponda.
- Mostrar conflictos de horario y advertir al organizador antes de confirmar una convocatoria incompatible.
- Permitir consultar el historial de invitaciones, respuestas y cambios.
- Diferenciar una invitación enviada de una invitación aceptada por el destinatario.

#### Cambios necesarios

- Revisar el modelo de eventos, invitaciones, participantes, respuestas y recordatorios.
- Incorporar estados de participación y un historial de cambios.
- Integrar la generación de recordatorios con T-COM-06 y T-COM-07.
- Implementar validación de fechas, duración, zona horaria y permisos de edición.
- Añadir controles para reprogramaciones y cancelaciones, evitando conservar recordatorios de eventos cancelados.
- Incorporar detección de conflictos cuando los datos disponibles permitan determinar la disponibilidad.

#### Comportamiento esperado

Los participantes reciben una convocatoria, pueden responder y ven actualizaciones cuando cambia la reunión. Los recordatorios respetan las preferencias y no se envían después de una cancelación. El calendario refleja el estado real de la invitación.

#### Criterios de aceptación

1. Los eventos aparecen únicamente a los usuarios autorizados.
2. Las invitaciones y respuestas se registran individualmente.
3. Una reprogramación actualiza el evento y los recordatorios pendientes.
4. Una cancelación impide enviar recordatorios futuros del evento cancelado.
5. Las fechas y horas se muestran correctamente en los límites de día y cambios de zona horaria.
6. Los conflictos detectables se señalan antes de confirmar la convocatoria.
7. Los recordatorios no se duplican.
8. El calendario funciona en dispositivos móviles y con navegación por teclado.

**Dependencias:** T-COM-02, T-COM-06 y T-COM-07.

---

### T-COM-10 [P2] — Relaciones bidireccionales entre comunicaciones, expedientes y trámites

**Estado de partida:** Funcional. Los mensajes incluyen una referencia contextual (`ReferenciaContextoID`) que permite navegar al recurso asociado.

- **Componentes relacionados:** `MensajesInternos`, `backend/user-service/Code.gs` (`sendInternalMessage`, `getDepartmentalWorkInbox`), `js/teacher.js`, `js/student.js`.

#### Requerimientos funcionales

- Permitir vincular comunicados y conversaciones con estudiantes, familias, matrículas, asignaturas, trámites, documentos, cobros y otros recursos institucionales autorizados.
- Mostrar la referencia contextual en la comunicación y permitir navegar desde el recurso a las comunicaciones relacionadas.
- Mantener un identificador estable y un tipo de recurso explícito para cada referencia.
- Validar los permisos del usuario tanto al abrir la comunicación como al navegar al recurso de destino.
- Manejar recursos eliminados, archivados, trasladados o cuyo acceso haya sido revocado.
- Permitir consultar el historial de comunicaciones vinculadas desde un expediente, cuando el rol tenga autorización.
- Evitar duplicar la información original del expediente dentro del mensaje cuando basta con mantener una referencia segura.
- Mantener los vínculos cuando el título visible o algunos metadatos del recurso cambian.
- Evitar referencias ambiguas cuando existen varios estudiantes, trámites o documentos con nombres similares.
- Distinguir las referencias contextuales de los adjuntos, ya que un documento vinculado no necesariamente debe descargarse ni compartirse.
- Registrar las asociaciones y cambios relevantes cuando la trazabilidad institucional lo requiera.

#### Cambios necesarios

- Normalizar el formato de las referencias contextuales y los tipos de recurso permitidos.
- Revisar los puntos de integración entre el servicio de usuarios, el servicio académico y el servicio contable.
- Crear validaciones comunes para identificar recursos existentes y comprobar permisos.
- Añadir enlaces de retorno entre el expediente y las comunicaciones relacionadas.
- Incorporar un tratamiento explícito para referencias inválidas o inaccesibles.
- Evitar que la resolución automática de una referencia exponga datos financieros o académicos fuera del alcance autorizado.

#### Comportamiento esperado

Una persona autorizada puede abrir una conversación vinculada a un trámite y regresar al expediente desde el que se originó. Si pierde el permiso sobre ese expediente, no obtiene acceso indirecto mediante el enlace de la conversación.

#### Criterios de aceptación

1. Los vínculos funcionan entre las vistas de comunicación y los recursos autorizados.
2. Una referencia manipulada no permite acceder a otro expediente.
3. Los cambios en títulos o metadatos no rompen los vínculos basados en identificadores estables.
4. Los recursos archivados o eliminados muestran un estado comprensible sin revelar datos indebidos.
5. Los usuarios pueden consultar el historial contextual permitido sin duplicaciones.
6. Se prueban referencias de los servicios académico y contable.
7. La navegación conserva un retorno razonable a la conversación o al expediente de origen.

**Dependencias:** T-COM-02, T-COM-03, T-COM-05 y T-COM-09.

---

### T-COM-11 [P3] — Búsqueda avanzada, archivo e historial de comunicaciones

**Estado de partida:** Capacidad por desarrollar o ampliar según la disponibilidad real de búsqueda y archivado en los módulos existentes.

- **Componentes relacionados:** `BandejaNotificaciones`, `AnunciosInstitucionales`, `MensajesInternos`, `backend/user-service/Code.gs` (`getUnifiedNotifications`, `getInternalConversations`), `js/ui-common.js`.

#### Requerimientos funcionales

- Permitir buscar comunicaciones por texto, remitente, destinatario, fecha, tipo, prioridad, estado, contexto y conversación.
- Permitir combinar filtros y conservarlos mientras el usuario navega por los resultados.
- Incluir comunicados vigentes, vencidos y archivados cuando el usuario tenga autorización.
- Permitir archivar y recuperar comunicaciones personales sin eliminar el registro institucional original.
- Diferenciar el archivo personal del archivo institucional y de la retirada oficial de un comunicado.
- Mantener enlaces a las conversaciones y recursos relacionados.
- Mostrar fragmentos relevantes de los resultados sin revelar contenido no autorizado.
- Ordenar los resultados por relevancia o fecha y ofrecer paginación para grandes volúmenes.
- Permitir limpiar filtros y recuperar búsquedas recientes cuando resulte útil.
- Respetar la política de conservación y eliminación de datos.
- Permitir búsquedas desde dispositivos móviles y mediante teclado.
- Evitar que las consultas devuelvan resultados de otros usuarios, familias, grupos o expedientes.

#### Cambios necesarios

- Revisar los mecanismos de consulta disponibles en los servicios y la estructura de las hojas de cálculo.
- Implementar filtros del lado servidor con validación de permisos.
- Añadir paginación y límites de consulta para evitar cargar el historial completo.
- Definir el modelo de archivo y los estados de visibilidad.
- Evaluar índices o mecanismos de búsqueda compatibles con la infraestructura existente si el volumen de datos lo requiere.
- Incorporar mensajes claros para búsquedas sin resultados, errores y restricciones de acceso.

#### Comportamiento esperado

Un usuario puede localizar una circular antigua o recuperar una conversación archivada sin recorrer manualmente todas las comunicaciones. Los resultados respetan las autorizaciones y el archivo personal no modifica el historial institucional.

#### Criterios de aceptación

1. Las combinaciones de filtros producen resultados correctos.
2. Los usuarios solo encuentran recursos autorizados.
3. Archivar una conversación no elimina sus mensajes ni las evidencias institucionales.
4. La paginación no repite ni omite resultados al navegar por páginas estables.
5. Las búsquedas de texto y metadatos se comportan de forma consistente.
6. Se comprueba el rendimiento con un volumen representativo de comunicaciones.
7. Las políticas de conservación y acceso se aplican a los resultados archivados.

**Dependencias:** T-COM-03, T-COM-05, T-COM-08 y T-COM-10.

---

### T-COM-12 [P3] — Plantillas, envíos programados y automatizaciones controladas

**Estado de partida:** Capacidad por desarrollar o ampliar según las funciones de programación existentes.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`createInstitutionalAnnouncement`, `sendMultiChannelNotification`), `js/teacher.js`.

#### Requerimientos funcionales

- Crear una biblioteca de plantillas para circulares, recordatorios, convocatorias, avisos académicos y comunicaciones administrativas.
- Permitir que las plantillas tengan nombre, categoría, contenido, idioma, variables permitidas, estado y permisos de uso.
- Incorporar variables dinámicas para datos autorizados, como nombre del destinatario, estudiante relacionado, fecha, asignatura y enlace al recurso (ej. `{NombreEstudiante}`, `{Grado}`, `{Materia}`).
- Validar que las variables obligatorias estén disponibles antes de programar o enviar.
- Mostrar una vista previa del mensaje personalizado antes del envío.
- Permitir programar comunicaciones para una fecha y hora determinadas y cancelar la programación antes de su ejecución.
- Permitir automatizaciones basadas en eventos definidos, como un vencimiento, una convocatoria o una confirmación pendiente.
- Definir condiciones de activación, audiencia, canal, plantilla, frecuencia, límites y tratamiento de errores.
- Impedir que una automatización cree ciclos de notificaciones o dispare múltiples mensajes por una misma transición de estado.
- Mantener una versión identificable de la plantilla utilizada en cada envío.
- Permitir desactivar una automatización sin borrar su historial.
- Exigir aprobación cuando la política institucional lo requiera, especialmente para comunicaciones masivas o de carácter oficial.
- Evitar incluir información sensible en variables o canales que no sean adecuados para transmitirla.

#### Cambios necesarios

- Incorporar entidades para plantillas, versiones, programaciones y reglas de automatización si no existen equivalentes.
- Integrar la ejecución programada con el motor de notificaciones y la deduplicación.
- Añadir validación de variables, permisos, audiencias y fechas.
- Registrar las ejecuciones y los motivos de omisión o fallo.
- Implementar controles de concurrencia para evitar que dos procesos ejecuten el mismo envío programado.
- Añadir opciones de prueba y previsualización que no contacten a destinatarios reales.
- Definir límites de frecuencia y mecanismos para pausar reglas problemáticas.

#### Comportamiento esperado

Una comunicación programada se ejecuta una sola vez en el momento previsto, con la audiencia y la versión de plantilla configuradas. Una regla automática no genera avisos repetidos por un mismo evento y puede desactivarse sin perder su historial.

#### Criterios de aceptación

1. Las variables se resuelven correctamente para distintos destinatarios.
2. Una variable obligatoria ausente bloquea el envío y explica el error.
3. Cancelar una programación impide su ejecución posterior.
4. La ejecución concurrente no genera duplicados.
5. Cada envío puede vincularse con la versión de plantilla y la regla que lo originaron.
6. Las automatizaciones respetan permisos, preferencias y límites de frecuencia.
7. Se pueden probar plantillas sin enviar mensajes externos.
8. Las reglas desactivadas no generan nuevas comunicaciones.
9. Los fallos quedan registrados y pueden diagnosticarse.

**Dependencias:** T-COM-02, T-COM-03, T-COM-06, T-COM-07 y T-COM-14.

---

### T-COM-13 [P3] — Accesibilidad, experiencia móvil y reducción de fatiga de notificaciones

**Estado de partida:** Requiere validación específica de accesibilidad y optimización de la experiencia de uso.

- **Componentes relacionados:** `teacher-dashboard.html`, `student-dashboard.html`, `js/ui-common.js`, `js/teacher.js`, `js/student.js`.

#### Requerimientos funcionales

- Asegurar que la bandeja, los comunicados, los formularios de confirmación, la mensajería y el calendario sean utilizables con teclado y tecnologías de asistencia (WCAG 2.2 AA).
- Aplicar criterios WCAG 2.2 nivel AA en los componentes incluidos en el alcance.
- Mantener contraste suficiente, foco visible (cierre con `ESC`), etiquetas accesibles, nombres descriptivos de controles y mensajes de error comprensibles.
- No depender exclusivamente del color, sonido, animación o posición para comunicar prioridades y estados.
- Ofrecer una experiencia responsive para pantallas pequeñas, sin ocultar acciones esenciales ni exigir desplazamientos horizontales innecesarios.
- Permitir configurar preferencias por categoría, canal y frecuencia, con opciones claras para avisos opcionales.
- Diferenciar notificaciones urgentes, obligatorias e informativas mediante texto, iconografía y jerarquía visual.
- Agrupar notificaciones relacionadas cuando ello no altere el sentido ni suprima información importante.
- Evitar enviar avisos reiterados por cambios menores o eventos que el usuario ya haya consultado.
- Permitir horarios de silencio para comunicaciones no urgentes, con reglas institucionales explícitas para excepciones.
- Proporcionar controles para reducir el ruido visual y acceder fácilmente a los pendientes importantes.
- Evitar que la interfaz sugiera que una persona debe responder inmediatamente fuera de su horario de disponibilidad.
- Garantizar que los controles de confirmación, autorización y respuesta puedan completarse sin depender de gestos complejos.

#### Cambios necesarios

- Revisar los componentes visuales y los flujos de interacción de los módulos de comunicación.
- Corregir problemas de foco, orden de tabulación, nombres accesibles, contraste y escalado de texto.
- Implementar preferencias de notificación con persistencia y aplicación uniforme entre canales.
- Incorporar reglas de agrupación y silenciamiento coordinadas con T-COM-07.
- Mejorar estados vacíos, errores, carga, confirmación y recuperación.
- Comprobar la interacción en dispositivos móviles, zoom y navegación por teclado.
- Evitar que los mensajes urgentes dependan de animaciones o de avisos sonoros.

#### Comportamiento esperado

La plataforma permite completar las acciones de comunicación desde un teléfono o mediante teclado y lector de pantalla. El usuario puede reducir notificaciones opcionales sin perder acceso a comunicados obligatorios ni a avisos críticos definidos por la institución.

#### Criterios de aceptación

1. Los flujos principales cumplen los criterios WCAG 2.2 AA aplicables, respaldados por pruebas automáticas y revisión manual.
2. Todas las acciones principales pueden completarse con teclado.
3. El foco es visible y sigue un orden lógico.
4. Los errores de formularios se identifican y anuncian de forma accesible.
5. Los diseños funcionan en pantallas pequeñas y con ampliación de texto.
6. Las preferencias se mantienen después de cerrar sesión y volver a entrar.
7. Las notificaciones opcionales respetan la frecuencia y los horarios configurados.
8. Los avisos obligatorios siguen las reglas institucionales y no se silencian accidentalmente.
9. La agrupación no elimina información crítica ni mezcla comunicaciones con acciones diferentes.

**Dependencias:** T-COM-01, T-COM-06, T-COM-07 y T-COM-08.

---

### T-COM-14 [P3] — Supervisión operativa, métricas de entrega y diagnóstico

**Estado de partida:** Existen configuraciones de canales y registros de envíos. Se requiere ampliar la capacidad de supervisión y diagnóstico.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`getNotificationChannelConfigs`, `sendChannelNotificationTest`), `RegistroEnviosExternos`, `js/teacher.js`.

#### Requerimientos funcionales

- Proporcionar una vista operativa de los canales externos, sus configuraciones, disponibilidad conocida, errores recientes y resultados de pruebas.
- Mostrar volúmenes de notificaciones generadas, enviadas, aceptadas, entregadas cuando exista confirmación del proveedor, fallidas, reintentadas y pendientes.
- Diferenciar los indicadores por canal, proveedor, tipo de comunicación y periodo.
- Mostrar la antigüedad de la cola pendiente y la cantidad de operaciones con estado desconocido.
- Permitir localizar un envío mediante su identificador y reconstruir el evento de origen, los intentos y el resultado.
- Mostrar causas de error comprensibles y acciones de diagnóstico sugeridas.
- Permitir realizar pruebas controladas de conectividad y configuración, sin enviar mensajes a destinatarios reales no autorizados.
- Permitir desactivar un canal con problemas y reactivarlo tras una comprobación satisfactoria.
- Alertar a los responsables cuando se superen umbrales configurables de fallos, retrasos o acumulación de envíos.
- Diferenciar las métricas operativas de los indicadores de lectura y respuesta de los destinatarios.
- Proteger los datos personales en los paneles, informes y exportaciones.
- Registrar las acciones administrativas que alteren la configuración de los proveedores.
- Evitar que los indicadores presenten una prueba de conexión satisfactoria como garantía de entrega de todos los mensajes.

#### Cambios necesarios

- Normalizar los estados y motivos de error almacenados en `RegistroEnviosExternos`.
- Incorporar correlación entre evento original, operación idempotente, intento y respuesta del proveedor.
- Crear consultas agregadas que no requieran cargar todos los registros individuales.
- Añadir filtros por periodo, canal, estado y proveedor.
- Definir umbrales y reglas de alerta para detectar problemas operativos.
- Incorporar controles de permisos para separar la consulta de métricas de la gestión de credenciales.
- Añadir una vista de detalle que muestre el historial de un envío sin exponer secretos.
- Establecer mecanismos para identificar colas bloqueadas, configuraciones inválidas y errores repetitivos.

#### Comportamiento esperado

Un responsable autorizado puede identificar qué canal presenta fallos, localizar un envío específico, conocer sus intentos y distinguir entre una demora del proveedor y un error de configuración. Puede ejecutar una prueba controlada y verificar el resultado sin exponer credenciales ni datos innecesarios.

#### Criterios de aceptación

1. Las métricas coinciden con los registros de origen para el periodo consultado.
2. Los estados de entrega reflejan las garantías reales del proveedor.
3. Los envíos fallidos pueden rastrearse desde el evento original hasta el último intento.
4. Los datos agregados se consultan sin cargar todos los registros de forma indiscriminada.
5. Las pruebas de canal no contactan destinatarios no autorizados.
6. Las credenciales y secretos no aparecen en el panel, las exportaciones ni los mensajes de error.
7. Las alertas se activan cuando se cumplen las condiciones configuradas y no se repiten sin control.
8. Se puede identificar una cola atascada o una acumulación anormal de fallos.
9. Los usuarios sin permisos administrativos no pueden cambiar la configuración de los proveedores.

**Dependencias:** T-COM-03, T-COM-06, T-COM-07 y T-COM-12.

---

### T-COM-15 [P2] — Preferencias de comunicación por categoría, canal y frecuencia

**Estado de partida:** Existe `getNotificationPreferences`; debe comprobarse y ampliarse la granularidad de las preferencias y su aplicación efectiva.

- **Componentes relacionados:** `PreferenciasNotificacion`, `backend/user-service/Code.gs` (`getNotificationPreferences`, `sendMultiChannelNotification`), `js/ui-common.js`.

#### Requerimientos funcionales

- Permitir que cada usuario configure, dentro de las opciones autorizadas, qué avisos opcionales desea recibir y por qué canales.
- Separar preferencias por categorías, por ejemplo, comunicados institucionales, mensajes directos, eventos de calendario, recordatorios académicos y avisos administrativos.
- Ofrecer frecuencias apropiadas, como inmediata, resumen periódico o desactivada para categorías opcionales compatibles.
- Permitir silenciar conversaciones o grupos concretos sin deshabilitar todas las comunicaciones.
- Definir qué preferencias puede configurar el usuario y cuáles son obligatorias por política institucional.
- Mantener las preferencias al cambiar de dispositivo o volver a iniciar sesión.
- Aplicar los cambios de forma consistente a la bandeja, al correo, a SMS y a otros canales realmente habilitados.
- Mostrar claramente las consecuencias de desactivar una categoría.
- Evitar que una preferencia de correo desactive accidentalmente una notificación interna necesaria.
- Diferenciar avisos informativos de confirmaciones, autorizaciones y alertas críticas.
- Permitir que la institución configure valores predeterminados y excepciones justificadas.
- Conservar el historial necesario para explicar por qué una notificación fue enviada o suprimida.

#### Cambios necesarios

- Revisar el esquema de `PreferenciasNotificacion`.
- Definir reglas de precedencia entre preferencias personales, configuración institucional y obligaciones de comunicación.
- Incorporar validación de valores y persistencia segura.
- Integrar las preferencias con T-COM-06, T-COM-07 y T-COM-12.
- Añadir una interfaz sencilla para consultar y modificar preferencias.
- Registrar las decisiones de distribución relevantes sin generar un historial excesivo de datos personales.

#### Comportamiento esperado

Un usuario puede optar por recibir resúmenes de avisos informativos y notificaciones inmediatas de mensajes directos. Los cambios se aplican de forma consistente y no suprimen comunicaciones obligatorias que deban recibirse.

#### Criterios de aceptación

1. Las preferencias persisten entre sesiones y dispositivos.
2. Cada categoría respeta los canales y frecuencias seleccionados.
3. Los avisos obligatorios se distinguen de los opcionales.
4. Una preferencia no puede deshabilitar por error una categoría crítica.
5. Las preferencias se aplican tanto a las notificaciones nuevas como a las programaciones que aún no se hayan ejecutado, según las reglas definidas.
6. El usuario puede identificar por qué un aviso fue enviado o no enviado cuando tenga derecho a conocerlo.
7. Los cambios de preferencias no generan notificaciones duplicadas.
8. Los perfiles administrativos no pueden modificar preferencias personales fuera de sus atribuciones.

**Dependencias:** T-COM-02, T-COM-03, T-COM-06 y T-COM-07.

---

### T-COM-16 [P2] — Resúmenes de actividad y vista consolidada para familias con varios estudiantes

**Estado de partida:** Se identifica como una ampliación de valor para el centro de comunicaciones y el portal familiar.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`getFamilyConsolidatedSummary`, `getGuardianStudents`), `student-dashboard.html`, `js/student.js`.

#### Requerimientos funcionales

- Ofrecer resúmenes de actividad con comunicaciones recientes, avisos pendientes, próximos eventos y acciones requeridas.
- Permitir elegir una frecuencia para los resúmenes opcionales, cuando el canal lo admita.
- Agrupar información por estudiante dentro de una misma cuenta familiar cuando exista una relación válida y autorizada.
- Diferenciar claramente los datos de cada estudiante para evitar confusiones entre nombres, grados, asignaturas y pendientes.
- Permitir abrir el comunicado, evento o acción desde el resumen.
- Excluir del resumen los contenidos que el destinatario no esté autorizado a consultar.
- No incluir calificaciones, datos financieros u otra información sensible en canales inadecuados.
- Evitar incluir en el mismo mensaje familiar información que deba permanecer separada por permisos o por confidencialidad.
- Respetar las preferencias del usuario y las reglas de frecuencia.
- Diferenciar información reciente de tareas pendientes y de eventos próximos.
- Evitar repetir en cada resumen comunicaciones que ya no requieran acción, salvo que la política institucional indique lo contrario.
- Mantener un registro de los resúmenes generados y de su resultado técnico, sin confundirlo con confirmaciones individuales de lectura.

#### Cambios necesarios

- Integrar la información de la bandeja, los comunicados, el calendario y los recordatorios.
- Resolver las relaciones familiares desde los datos autorizados del sistema (`RelacionesFamiliares`).
- Implementar reglas de agrupación, deduplicación y selección de contenido.
- Incorporar plantillas específicas para resúmenes y validación del contenido antes del envío.
- Integrar la programación con T-COM-06, T-COM-07, T-COM-12 y T-COM-15.

#### Comportamiento esperado

Una persona responsable de varios estudiantes puede consultar un resumen organizado por estudiante, con enlaces a las acciones pendientes. El sistema excluye automáticamente los datos que no corresponden a su relación autorizada y no convierte el resumen en una confirmación de lectura de cada elemento.

#### Criterios de aceptación

1. Cada estudiante aparece únicamente para responsables con relación autorizada.
2. Los elementos se agrupan correctamente por estudiante y categoría.
3. El resumen no contiene datos sensibles no autorizados para ese canal.
4. Los elementos repetidos se consolidan según reglas definidas.
5. Los enlaces llevan al recurso correcto y vuelven a validar permisos.
6. Los resúmenes respetan frecuencia, preferencias y límites de envío.
7. La generación de resúmenes no crea confirmaciones de lectura falsas.
8. Se comprueban familias con un estudiante, varios estudiantes y cambios de relación familiar.

**Dependencias:** T-COM-02, T-COM-06, T-COM-07, T-COM-10, T-COM-12 y T-COM-15.

---

### T-COM-17 [P3] — Gestión de incidencias y seguimiento de comunicaciones problemáticas

**Estado de partida:** Capacidad complementaria por implementar si no existe una herramienta equivalente en el sistema.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`submitProblemTicket`, `getProblemTickets`), `js/ui-common.js`.

#### Requerimientos funcionales

- Permitir reportar una comunicación no recibida, un enlace roto, un adjunto inaccesible, una convocatoria incorrecta o un problema de entrega.
- Vincular la incidencia con el mensaje, comunicado, evento o envío afectado.
- Registrar categoría, descripción, fecha, usuario reportante, estado, responsable y resolución.
- Permitir estados como recibida, en revisión, pendiente de información, resuelta y cerrada.
- Permitir que los responsables autorizados añadan notas internas sin mostrarlas al reportante.
- Mostrar al usuario el estado de su incidencia y la resolución que le corresponda conocer.
- Evitar que el reporte de una incidencia permita consultar mensajes o datos de otros usuarios.
- Permitir identificar problemas recurrentes por canal, tipo de comunicación o módulo.
- Vincular las incidencias técnicas con el diagnóstico de T-COM-14.
- Evitar que reportar una comunicación como no recibida genere automáticamente un reenvío duplicado sin comprobar el estado anterior.

#### Cambios necesarios

- Incorporar un registro de incidencias vinculado a los recursos de comunicación.
- Definir permisos, estados, campos y reglas de asignación.
- Integrar el seguimiento con los registros de entrega y la bandeja unificada.
- Incorporar validaciones para evitar reportes duplicados de la misma incidencia.
- Añadir una vista de seguimiento para el usuario y una vista de gestión para responsables autorizados.

#### Comportamiento esperado

El usuario puede informar de un problema y consultar su estado. El responsable puede localizar el envío original, diagnosticarlo y decidir si corresponde reintentar, corregir o cerrar la incidencia sin duplicar la comunicación automáticamente.

#### Criterios de aceptación

1. Cada incidencia queda vinculada al recurso correcto.
2. Los permisos impiden consultar incidencias ajenas sin autorización.
3. Los cambios de estado y las acciones de gestión quedan registrados.
4. Las incidencias duplicadas pueden identificarse y tratarse de manera controlada.
5. La resolución puede relacionarse con el historial del envío original.
6. Reportar una incidencia no provoca por sí solo un envío repetido.
7. Los problemas recurrentes pueden agruparse mediante filtros operativos.

**Dependencias:** T-COM-03, T-COM-06, T-COM-07 y T-COM-14.

---

### T-COM-18 [P3] — Políticas de retención, conservación y exportación de comunicaciones

**Estado de partida:** Requiere definir y verificar las políticas aplicables a los distintos tipos de comunicación y sus evidencias.

- **Componentes relacionados:** `backend/user-service/Code.gs` (`purgeStructuredLogs`, `createSystemBackup`), Google Drive, Google Sheets.

#### Requerimientos funcionales

- Diferenciar la conservación de mensajes personales, comunicados oficiales, confirmaciones, registros de entrega, adjuntos y registros de auditoría.
- Definir periodos de conservación según el tipo de dato y las necesidades institucionales aplicables.
- Evitar la eliminación automática de evidencias que deban conservarse por obligaciones administrativas o políticas vigentes.
- Permitir archivar comunicaciones vencidas sin confundir el archivo con la eliminación.
- Permitir exportaciones autorizadas con filtros y fecha de corte.
- Incluir en cada exportación los metadatos necesarios para interpretar el contenido y su contexto.
- Restringir las exportaciones masivas a perfiles autorizados.
- Registrar quién exportó qué información, cuándo y bajo qué alcance.
- Evitar que la exportación incluya destinatarios, adjuntos o referencias contextuales no autorizados.
- Definir el tratamiento de datos personales cuando una cuenta se deshabilita o cambia su relación con la institución.
- Permitir aplicar una política de eliminación cuando corresponda, con controles y registro de ejecución.
- Gestionar las referencias a documentos archivados o eliminados para evitar enlaces rotos que parezcan activos.

#### Cambios necesarios

- Inventariar los tipos de comunicación y datos asociados.
- Definir reglas de retención diferenciadas, aprobadas por los responsables institucionales pertinentes.
- Implementar controles de acceso, exportación y eliminación acordes con dichas reglas.
- Incorporar registro de operaciones de exportación y mantenimiento.
- Verificar las implicaciones de la retención sobre Google Sheets, Google Drive y los registros de los proveedores externos.
- Establecer un procedimiento para comprobar el resultado de los procesos de conservación y eliminación.

#### Comportamiento esperado

La institución puede consultar y exportar el historial autorizado sin perder la trazabilidad requerida. Los datos se conservan o eliminan conforme a reglas definidas, y las operaciones administrativas sobre el historial quedan registradas.

#### Criterios de aceptación

1. Cada tipo de dato tiene una política de conservación definida.
2. Las exportaciones respetan filtros y permisos.
3. Cada exportación sensible queda registrada.
4. Los procesos de eliminación no afectan datos fuera de su alcance.
5. Los recursos conservados mantienen referencias coherentes.
6. Los registros que deban conservarse no se eliminan mediante operaciones ordinarias de archivo.
7. Se comprueba el resultado de las políticas sobre las hojas de cálculo y los archivos asociados.

**Dependencias:** T-COM-03, T-COM-08, T-COM-10 y T-COM-11.

---

### T-COM-19 [P3] — Acciones directas desde las comunicaciones y seguimiento de tareas pendientes

**Estado de partida:** Ampliación funcional para conectar las comunicaciones con las acciones institucionales que requieren una respuesta o gestión.

- **Componentes relacionados:** `SolicitudesTramites`, `FirmasConformidades`, `backend/user-service/Code.gs` (`processWorkflowDecision`), `js/ui-common.js`.

#### Requerimientos funcionales

- Permitir que una comunicación incluya acciones concretas, como confirmar asistencia, responder una solicitud, presentar una autorización o abrir un trámite.
- Mostrar claramente qué acción se solicita, quién debe ejecutarla y cuál es la fecha límite.
- Vincular cada acción con el comunicado o conversación de origen.
- Registrar el estado de la acción, su responsable, fecha de creación y fecha de finalización.
- Evitar que pulsar un enlace se interprete como completar una acción que requiere confirmación explícita.
- Permitir acceder a la acción directamente desde la bandeja, el resumen y la comunicación original.
- Mostrar las acciones pendientes y vencidas sin duplicar tareas cuando el mismo evento se presenta en varias vistas.
- Respetar los permisos del recurso al abrir y completar la acción.
- Permitir que la institución defina qué acciones requieren respuesta obligatoria y cuáles son opcionales.
- Actualizar el estado en todas las vistas cuando una acción se completa desde cualquiera de ellas.
- Registrar el resultado de acciones con consecuencias administrativas.
- Evitar que un recordatorio de una acción ya completada se envíe por una condición desactualizada.

#### Cambios necesarios

- Definir un modelo común para acciones vinculadas a comunicaciones, reutilizando entidades existentes cuando resulte apropiado.
- Integrar el estado de la acción con la bandeja, el calendario y los recordatorios.
- Añadir validación de responsables, permisos y fechas límite.
- Incorporar idempotencia para las operaciones de finalización.
- Integrar la programación de recordatorios con T-COM-06, T-COM-07 y T-COM-12.

#### Comportamiento esperado

El destinatario puede abrir una comunicación y completar la acción solicitada desde el enlace correspondiente. El estado se refleja en la bandeja y el calendario, y dejan de generarse recordatorios una vez cumplida la tarea.

#### Criterios de aceptación

1. Cada acción tiene un identificador y un vínculo inequívoco con su comunicación de origen.
2. Completar una acción actualiza todas las vistas correspondientes.
3. Repetir una operación de finalización no duplica resultados.
4. Un enlace abierto no se interpreta automáticamente como una autorización o respuesta.
5. Las acciones vencidas y pendientes se identifican correctamente.
6. Los recordatorios se detienen al completar o cancelar la acción.
7. Las acciones con consecuencias administrativas conservan evidencia del resultado.
8. Los permisos se validan al abrir y al completar la acción.

**Dependencias:** T-COM-02, T-COM-03, T-COM-06, T-COM-07, T-COM-09, T-COM-10 y T-COM-12.

---

### MATRIZ DE DEPENDENCIAS Y ORDEN DE EJECUCIÓN RECOMENDADO FASE 11 (COMUNICACIÓN INSTITUCIONAL)

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-COM-07.** Idempotencia, deduplicación (`DeduplicationKey`) y control de frecuencia | **P1** | `sendMultiChannelNotification` / Idempotencia |
| **2** | **T-COM-02.** Segmentación avanzada de destinatarios y aislamiento de información | **P1** | RBAC / `ROLE_PERMISSIONS` |
| **3** | **T-COM-03.** Seguridad, confidencialidad y trazabilidad integral | **P1** | Drive proxy / Log audit |
| **4** | **T-COM-06.** Motor de notificaciones internas y adaptadores multicanal | **P2** | `sendMultiChannelNotification` |
| **5** | **T-COM-15.** Preferencias de comunicación por categoría, canal y frecuencia | **P2** | `PreferenciasNotificacion` |
| **6** | **T-COM-01.** Actualización en tiempo real del centro unificado de comunicaciones | **P1** | `getUnifiedNotifications` / Bandeja |
| **7** | **T-COM-04.** Ciclo de vida de comunicados oficiales y circulares | **P2** | `AnunciosInstitucionales` |
| **8** | **T-COM-05.** Mensajería interna contextual y gestión de conversaciones | **P2** | `MensajesInternos` |
| **9** | **T-COM-08.** Confirmaciones de lectura, respuestas estructuradas y seguimiento | **P2** | `submitAnnouncementReceiptConfirmation` |
| **10** | **T-COM-09.** Calendario institucional, convocatorias y recordatorios | **P2** | `EventosCalendario` |
| **11** | **T-COM-10.** Relaciones bidireccionales entre comunicaciones, expedientes y trámites | **P2** | `ReferenciaContextoID` |
| **12** | **T-COM-14.** Supervisión operativa, métricas de entrega y diagnóstico | **P3** | `RegistroEnviosExternos` |
| **13** | **T-COM-11.** Búsqueda avanzada, archivo e historial de comunicaciones | **P3** | Search engine / Privacy |
| **14** | **T-COM-12.** Plantillas, envíos programados y automatizaciones controladas | **P3** | Dynamic variables engine |
| **15** | **T-COM-13.** Accesibilidad, experiencia móvil y reducción de fatiga de notificaciones | **P3** | UI / WCAG AA |
| **16** | **T-COM-16.** Resúmenes de actividad y vista consolidada para familias multihijo | **P2** | `getFamilyConsolidatedSummary` |
| **17** | **T-COM-17.** Gestión de incidencias y seguimiento de comunicaciones problemáticas | **P3** | Support tickets |
| **18** | **T-COM-18.** Políticas de retención, conservación y exportación de comunicaciones | **P3** | Data retention policy |
| **19** | **T-COM-19.** Acciones directas desde las comunicaciones y seguimiento de tareas | **P3** | `SolicitudesTramites` |


---

## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE DE BIENESTAR ESTUDIANTIL, ORIENTACIÓN Y SEGUIMIENTO DE CASOS

### T-ORI-01 [P1] — Control de concurrencia transaccional con LockService en expedientes de seguimiento

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`addCaseFollowUpNote`), `js/teacher.js`.
- **Problema detectado:** Las actualizaciones concurrentes de expedientes en `CasosSeguimiento` (agregando notas o modificando el estado del caso) pueden producir sobrescrituras, pérdida de actuaciones, duplicación de registros o inconsistencias entre el estado del caso, sus responsables y el historial. La existencia de operaciones de escritura no garantiza que una secuencia de cambios relacionados se complete de forma coherente al carecer de un bloqueo exclusivo mediante `LockService.getScriptLock()`.
- **Alcance de los cambios:**
  - Revisar las operaciones de creación y actualización de casos, asignaciones, notas, actuaciones, planes y estados.
  - Incorporar mecanismos de exclusión mutua mediante `LockService` donde corresponda en Google Apps Script.
  - Implementar controles de concurrencia para evitar que una actualización basada en datos antiguos sobrescriba cambios recientes.
  - Separar las operaciones que necesitan protección exclusiva de aquellas que pueden ejecutarse sin bloqueo.
  - Establecer un orden consistente para actualizar el registro principal, sus elementos relacionados y el historial.
  - Incorporar identificadores de operación o mecanismos de idempotencia para evitar duplicaciones por reintentos.
  - Gestionar tiempos máximos de espera, liberación de bloqueos y errores recuperables.
  - Validar los datos nuevamente dentro de la sección protegida, en lugar de depender de comprobaciones efectuadas antes de adquirir el bloqueo.
  - Evitar que el frontend muestre una operación como exitosa cuando el servidor no haya confirmado la persistencia.
  - Implementar recuperación o compensación explícita cuando una operación de varias etapas falle parcialmente.
- **Requisitos funcionales:**
  1. Cada actualización debe comprobar que el caso y las relaciones que pretende modificar siguen siendo válidos.
  2. Dos operaciones simultáneas sobre el mismo recurso no deben ocasionar pérdida silenciosa de información.
  3. Una misma solicitud reenviada por un error de conexión no debe crear dos casos, notas, citas o actuaciones.
  4. Cuando exista un conflicto de actualización, el sistema debe rechazar el cambio incompatible o solicitar que se revise la información más reciente.
  5. Los errores de bloqueo deben generar una respuesta controlada que permita reintentar la operación.
  6. Los bloqueos deben liberarse en todos los caminos de ejecución, incluidos los errores.
  7. El historial solo debe registrar como completadas las operaciones efectivamente confirmadas.
  8. Las operaciones de lectura deben continuar disponibles siempre que no comprometan la consistencia o la confidencialidad.
- **Comportamiento esperado:** Cuando dos profesionales intenten actualizar un caso simultáneamente, el sistema preservará ambos cambios si son compatibles. Si existe un conflicto real, no sobrescribirá silenciosamente el trabajo anterior. Los reintentos no generarán duplicados y los errores dejarán el caso en un estado recuperable.
- **Criterios de aceptación:**
  - Dos actualizaciones simultáneas de campos diferentes conservan ambos cambios cuando corresponda.
  - Dos actualizaciones incompatibles del mismo campo no producen una sobrescritura silenciosa.
  - Los envíos repetidos de una misma operación no duplican registros.
  - Una excepción durante una actualización no deja referencias huérfanas ni un estado que aparente estar confirmado.
  - Los bloqueos se liberan incluso cuando se produce una excepción (`try...finally lock.releaseLock()`).
  - Se prueban concurrencia, tiempos de espera, reintentos, desconexiones y errores parciales.
  - El resultado persistido coincide con el mensaje de confirmación mostrado al usuario.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-ORI-08, T-ORI-10 y T-ORI-16 cuando estas operaciones actualicen planes, historial o respaldos. La solución debe proteger las operaciones compartidas sin ampliar innecesariamente el alcance de los cambios.

---

### T-ORI-02 [P1] — Confidencialidad granular y aislamiento RBAC de notas sensibles de orientación

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`getCaseFollowUpNotes`, `assertRecordOwnership`), `backend/user-service/Code.gs`.
- **Problema detectado:** La protección basada en categorías de usuario o roles generales no garantiza por sí sola que cada profesional acceda exclusivamente a los casos, notas y recursos que necesita. Las notas de consejería psicológica son accesibles por roles docentes generales en endpoints de la API sin validación estricta de propiedad o permiso explícito. Es necesario controlar la autorización efectiva por operación y por recurso, incluyendo accesos indirectos desde listados, informes y notificaciones.
- **Alcance de los cambios:**
  - Revisar la autorización del servidor en todas las operaciones relacionadas con expedientes, notas, citas, incidencias, planes y adjuntos.
  - Ampliar el modelo de permisos para diferenciar entre lectura, creación, modificación, asignación, cierre, exportación y administración.
  - Establecer niveles de confidencialidad para las notas y los documentos, con categorías definidas según las necesidades institucionales (`PrivadoOrientacion`, `CompartidoTutores`, `Directivo`).
  - Permitir restricciones por responsabilidad asignada, equipo autorizado y acceso específico al caso, cuando corresponda.
  - Separar las notas privadas de orientación de las observaciones académicas o administrativas que puedan compartirse con otros profesionales.
  - Aplicar los permisos en búsquedas, contadores, paneles, exportaciones, impresiones y notificaciones.
  - Revalidar los permisos en el servidor en cada operación sensible, sin confiar en los controles de la interfaz.
  - Registrar las consultas y modificaciones sensibles que deban ser auditables.
  - Evitar la exposición de notas, datos personales o contenido confidencial en registros técnicos y mensajes de error.
  - Definir el tratamiento de accesos excepcionales, incluyendo quién los autoriza, su alcance y su duración.
- **Requisitos funcionales:**
  1. Los permisos deben evaluar la identidad autenticada, el recurso solicitado, la operación y las condiciones de acceso aplicables.
  2. Conocer el identificador de un caso no debe permitir acceder a él.
  3. El acceso a una nota privada no debe otorgar automáticamente acceso al resto del expediente.
  4. La autorización de un responsable debe poder revocarse sin eliminar el historial de sus actuaciones.
  5. Los administradores técnicos no deben obtener acceso indiscriminado al contenido sensible por el mero hecho de administrar la infraestructura.
  6. Las notificaciones deben mostrar únicamente la información necesaria y autorizada.
  7. Los documentos exportados deben aplicar las mismas restricciones que los datos originales.
  8. Los cambios de permisos deben reflejarse en las siguientes operaciones, aunque el usuario conserve una página abierta.
  9. El sistema debe distinguir entre un recurso inexistente y uno al que el usuario no tiene acceso cuando la política de seguridad requiera evitar la revelación de su existencia.
- **Comportamiento esperado:** Un docente puede recibir una tarea pedagógica relacionada con un estudiante sin acceder a las notas privadas del orientador. Un profesional asignado puede consultar únicamente el contenido permitido por su autorización. La pérdida de asignación o de permisos impide nuevos accesos al recurso protegido.
- **Criterios de aceptación:**
  - Las operaciones de lectura y escritura se prueban con usuarios autorizados, no autorizados, deshabilitados y con permisos revocados.
  - La manipulación de identificadores, roles o parámetros no permite ampliar privilegios.
  - Los listados y búsquedas no filtran datos de casos restringidos.
  - Las exportaciones, impresiones y adjuntos respetan la autorización de origen.
  - La revocación de permisos impide el acceso posterior a través de enlaces guardados.
  - Las acciones sensibles dejan registros de auditoría sin duplicar ni revelar innecesariamente el contenido de las notas.
  - Las pruebas comprueban permisos por recurso y operación, no únicamente por rol.
- **Riesgo de Regresión:** Medio.
- **Dependencias:** T-ORI-03, T-ORI-04, T-ORI-10 y T-ORI-14. Las reglas de acceso deben definirse antes de ampliar las capacidades de búsqueda y exportación.

---

### T-ORI-03 [P1] — Verificación estricta de propiedad y relaciones familiares en el portal de familias

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`getStudentFile`), `backend/user-service/Code.gs` (`RelacionesFamiliares`), `js/student.js`.
- **Problema detectado:** El portal de estudiantes y familias debe garantizar que cada usuario solo consulte los expedientes y servicios de los estudiantes con los que mantiene una relación autorizada. Una asociación existente en la interfaz o el envío de un identificador de estudiante no demuestra que exista autorización vigente.
- **Alcance de los cambios:**
  - Revisar la relación entre cuentas de usuario, estudiantes y responsables familiares en `RelacionesFamiliares`.
  - Validar en el servidor la relación vigente para cada consulta o acción realizada desde el portal.
  - Comprobar el acceso a solicitudes de citas, planes de apoyo compartidos, notificaciones y documentos.
  - Definir qué información puede consultar un responsable familiar y cuál permanece restringida al personal autorizado.
  - Gestionar relaciones múltiples, cambios de responsable, restricciones institucionales y vínculos que dejan de estar vigentes.
  - Evitar que el cambio de identificadores en solicitudes o URLs permita consultar a otro estudiante.
  - Revisar los enlaces compartidos, las sesiones abiertas y las notificaciones antiguas cuando cambia la relación de acceso.
  - Asegurar que la interfaz no presente como accesible información que el servidor rechazará.
- **Requisitos funcionales:**
  1. La autorización debe comprobarse para el estudiante concreto y la operación solicitada.
  2. Las relaciones familiares deben proceder de registros institucionales verificables, no de datos enviados libremente por el cliente.
  3. La existencia de una relación con un estudiante no debe conceder acceso a todos los estudiantes de una misma familia o domicilio sin una autorización explícita.
  4. La solicitud de una cita debe respetar las facultades del usuario que la solicita.
  5. Los planes de apoyo deben compartir únicamente la información expresamente autorizada para ese destinatario.
  6. Las relaciones revocadas deben dejar de permitir nuevas consultas.
  7. Los cambios de matrícula, grado o sección no deben romper las relaciones válidas ni crear otras automáticamente.
  8. Los intentos de acceso indebido deben rechazarse sin revelar datos del estudiante objetivo.
- **Comportamiento esperado:** Una familia puede acceder a la información autorizada de sus estudiantes vinculados. Si pierde la autorización, ya no puede consultar expedientes, citas o planes restringidos, aunque conserve una URL o una sesión iniciada anteriormente.
- **Criterios de aceptación:**
  - Se prueban cuentas vinculadas a un estudiante, a varios estudiantes, sin vínculos y con relaciones revocadas.
  - La sustitución de un identificador en una petición no permite acceder a otro expediente.
  - Los accesos a citas y planes aplican las mismas comprobaciones de relación.
  - Los cambios de relación se reflejan en las siguientes consultas.
  - Las pantallas no muestran información privada antes de recibir la autorización del servidor.
  - Los intentos no autorizados no generan modificaciones ni notificaciones con datos sensibles.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-ORI-02 y T-ORI-06.

---

### T-ORI-04 [P1] — Proxy de descarga segura con token firmado para evidencias adjuntas en Google Drive

- **Componentes relacionados:** `backend/user-service/Code.gs` (`getSecureDocumentStream`), `backend/academic-service/Code.gs`.
- **Problema detectado:** Los adjuntos de incidencias y expedientes (fotografías, evaluaciones externas, citatorios) se almacenan en Google Drive entregando URLs públicas directas, quedando expuestos fuera del control de permisos de la plataforma.
- **Alcance de los cambios:**
  - Revisar cómo se almacenan, consultan y comparten los identificadores y enlaces de archivos adjuntos.
  - Implementar un mecanismo de descarga controlada (`getSecureDocumentStream`) que valide la sesión y los permisos antes de entregar el archivo.
  - Si la arquitectura admite descargas temporales firmadas, utilizar tokens criptográficamente seguros, de duración limitada y asociados al recurso autorizado.
  - Evitar que el token incluya información confidencial legible o permita cambiar el identificador del archivo.
  - Verificar la vigencia, integridad y alcance del token en el servidor.
  - Mantener los archivos privados en Drive y evitar conceder permisos públicos como solución a problemas de descarga.
  - Revisar el comportamiento de enlaces copiados, reenvíos, sesiones vencidas y permisos revocados.
  - Controlar los errores de archivos eliminados, movidos o inaccesibles.
  - Registrar los eventos relevantes de acceso sin guardar tokens completos ni credenciales.
- **Requisitos funcionales:**
  1. Antes de generar una descarga, el servidor debe verificar que el usuario tiene acceso al caso y al adjunto.
  2. Los tokens deben ser impredecibles, verificables y de corta duración.
  3. El token debe quedar asociado al archivo y al alcance de la autorización concedida.
  4. La modificación del identificador del archivo o del contenido del token debe invalidar la solicitud.
  5. La revocación de permisos debe impedir nuevas autorizaciones de descarga.
  6. La solución debe evitar enlaces permanentes con acceso público.
  7. Los errores no deben revelar identificadores internos innecesarios ni información sobre archivos de otros usuarios.
  8. Deben respetarse las limitaciones reales de Google Apps Script, Drive y el método de entrega seleccionado.
- **Comportamiento esperado:** Un usuario autorizado puede descargar un adjunto durante el periodo permitido. Un usuario sin autorización, un token vencido o un enlace manipulado no puede obtener el archivo. Compartir la URL temporal no debe convertirla en un permiso permanente.
- **Criterios de aceptación:**
  - Se comprueba una descarga válida y una descarga con token vencido.
  - Se prueba la manipulación del token y del identificador del archivo.
  - Se prueba el acceso después de revocar permisos.
  - Los archivos permanecen privados en Drive.
  - La URL no permite descargar indefinidamente el archivo.
  - Los errores de acceso no revelan el contenido del adjunto.
  - Los registros técnicos no conservan tokens reutilizables.
  - Se documentan las limitaciones de revocación inmediata inherentes al mecanismo de descarga elegido.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-ORI-02. Requiere comprobar las capacidades reales de almacenamiento y entrega de archivos antes de seleccionar la implementación.

---

### T-ORI-05 [P2] — Flujo formal de derivación institucional entre docentes, orientación y Dirección

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`referStudentToGuidance`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** La capacidad de cambiar el responsable de un caso no equivale a disponer de un flujo de derivación que permita aceptar, devolver, priorizar y supervisar las solicitudes de atención. Actualmente los docentes derivan casos mediante notas libres sin acuse de recibo o aceptación formal por consejería.
- **Alcance de los cambios:**
  - Definir un flujo configurable de derivación entre docentes, orientación, coordinación y Dirección.
  - Diferenciar la asignación directa de una derivación que requiere aceptación.
  - Incorporar motivo, fecha, emisor, destinatario, prioridad operativa y estado de la derivación.
  - Permitir aceptar, rechazar justificadamente, devolver para completar información y reasignar una derivación.
  - Mantener el caso original y relacionar con él todas las transferencias.
  - Definir qué información acompaña a cada derivación según los permisos del destinatario.
  - Mostrar las derivaciones pendientes de aceptación y las que superen el plazo establecido.
  - Notificar los cambios de responsabilidad a las personas autorizadas.
  - Registrar las decisiones y transferencias en la cronología.
  - Gestionar destinatarios inactivos, derivaciones duplicadas y ausencia de responsables disponibles.
- **Requisitos funcionales:**
  1. Toda derivación debe tener un origen, un destinatario o equipo, una fecha y un estado (`Pendiente`, `Aceptada`, `Devuelta`, `Rechazada`).
  2. La aceptación debe hacer efectiva la responsabilidad conforme al flujo definido.
  3. Un rechazo o devolución debe incluir un motivo y mantener la responsabilidad anterior o activar un estado explícito de reasignación.
  4. El sistema no debe considerar atendido un caso solo porque se envió una derivación.
  5. Las derivaciones deben poder consultarse por estado, destinatario y antigüedad.
  6. Los destinatarios solo deben recibir información compatible con sus permisos.
  7. El historial debe conservar las transferencias anteriores.
  8. La falta de respuesta debe poder identificarse y escalarse según las reglas institucionales.
- **Comportamiento esperado:** Una derivación puede seguirse desde su creación hasta su aceptación, devolución o cierre. El sistema identifica quién debe actuar en cada momento y evita que un caso quede sin responsable por una transferencia incompleta.
- **Criterios de aceptación:**
  - Se completa una derivación desde su creación hasta la aceptación.
  - Se prueban rechazo, devolución, reasignación y destinatario inactivo.
  - Una derivación pendiente no se contabiliza como una intervención completada.
  - Los cambios de responsabilidad se reflejan en permisos y paneles.
  - Las derivaciones repetidas no crean duplicados.
  - La cronología permite reconstruir todo el proceso.
  - Los destinatarios no pueden consultar notas fuera de su autorización.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-02 y T-ORI-10.

---

### T-ORI-06 [P2] — Gestión avanzada de citas de orientación, conflictos horarios y recordatorios

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`CitasOrientacion`, `bookAppointment`), `js/teacher.js`, `js/student.js`.
- **Problema detectado:** El sistema dispone de operaciones para reservar, consultar y cambiar el estado de citas, pero debe garantizar que la agenda represente la disponibilidad efectiva, que los cambios se propaguen a los recordatorios y que el seguimiento de cada entrevista quede documentado sin solapamientos en un mismo bloque de tiempo.
- **Alcance de los cambios:**
  - Revisar la agenda de profesionales, la disponibilidad, las duraciones y los estados de las citas en `CitasOrientacion`.
  - Implementar o completar la detección de conflictos entre citas del mismo profesional y, cuando proceda, del mismo recurso o espacio físico.
  - Gestionar reservas, confirmaciones, reprogramaciones, cancelaciones y ausencias.
  - Incorporar políticas configurables para duración, anticipación, intervalos, disponibilidad y ventanas de atención.
  - Implementar recordatorios configurables, con control de duplicados y cancelación de avisos obsoletos.
  - Relacionar las citas con el estudiante y el caso correspondiente cuando proceda.
  - Separar los datos logísticos de la cita de su motivo confidencial y de las notas de entrevista.
  - Registrar el resultado de la entrevista, los acuerdos y la siguiente actuación.
  - Permitir consultar citas pendientes de confirmar, próximas, vencidas y completadas.
  - Gestionar solicitudes duplicadas y cambios de disponibilidad posteriores a una reserva.
  - Asegurar que los horarios se interpretan de forma coherente con la zona horaria institucional.
- **Requisitos funcionales:**
  1. Una cita debe tener estudiante, responsable, fecha, hora, duración y estado válidos.
  2. La comprobación de disponibilidad debe realizarse en el servidor al confirmar la reserva.
  3. Dos solicitudes concurrentes no deben reservar el mismo intervalo incompatible.
  4. Los recordatorios deben depender del estado actual de la cita y no solo de la planificación inicial.
  5. Cancelar o reprogramar debe actualizar los recordatorios pendientes.
  6. La cita debe poder registrar asistencia, resultado y próxima acción.
  7. Los usuarios externos solo deben consultar la información que les corresponda.
  8. Las citas canceladas o vencidas no deben permanecer como futuras en la agenda.
  9. Los errores de notificación no deben borrar una reserva confirmada.
- **Comportamiento esperado:** La agenda muestra la disponibilidad y el estado reales. Cada cita conserva su historial de cambios y, una vez atendida, permite documentar el resultado y programar el seguimiento necesario.
- **Criterios de aceptación:**
  - Dos reservas simultáneas incompatibles no pueden confirmarse ambas.
  - Una reprogramación libera el horario anterior y comprueba el nuevo.
  - Una cancelación impide enviar recordatorios futuros asociados a la cita cancelada.
  - Los reintentos no duplican reservas ni recordatorios.
  - Las citas completadas pueden asociarse a actuaciones posteriores.
  - Se prueban ausencias, citas vencidas, cambios de responsable y fallos de notificación.
  - Los datos privados de la entrevista no aparecen en las vistas generales de agenda.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-ORI-01, T-ORI-02, T-ORI-03 y T-ORI-10.

---

### T-ORI-07 [P2] — Motor configurable de alertas tempranas por ausentismo, rendimiento y riesgo de deserción

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`evaluateEarlyWarningAlerts`), `backend/user-service/Code.gs`.
- **Problema detectado:** La generación automatizada de casos a partir de faltas o bajo rendimiento puede provocar alertas duplicadas, intervenciones desproporcionadas o expedientes abiertos sin una revisión humana previa. El sistema necesita explicar las alertas, controlar su ciclo de vida y permitir evaluar su utilidad.
- **Alcance de los cambios:**
  - Revisar las reglas actuales que relacionan asistencia y rendimiento con la creación de casos.
  - Implementar un motor de reglas configurables con indicadores, umbrales, periodos de observación y destinatarios autorizados.
  - Incorporar, cuando existan datos fiables, patrones de ausentismo, ausencias consecutivas, deterioro de asistencia, asignaturas reprobadas y cambios relevantes del rendimiento.
  - Registrar la regla activada, los datos de origen, el periodo evaluado y la fecha de detección.
  - Diferenciar alertas nuevas, revisadas, atendidas, descartadas justificadamente y resueltas.
  - Evitar duplicados mediante agrupación de alertas relacionadas y vinculación con casos activos.
  - Incorporar mecanismos de reevaluación cuando cambian las calificaciones o la asistencia.
  - Distinguir entre una condición que persiste y una recaída posterior a su resolución.
  - Gestionar datos faltantes, desactualizados, anulados o corregidos.
  - Permitir revisar los resultados de las reglas y ajustar sus umbrales sin reescribir silenciosamente el historial.
  - Establecer una cola de revisión humana antes de crear o escalar un caso sensible, salvo que exista una regla institucional explícita y debidamente autorizada para una actuación concreta.
  - Evitar que la falta de datos se interprete como un indicador favorable o desfavorable.
  - Permitir medir volumen de alertas, tiempos de revisión, proporción de alertas útiles y falsas alarmas.
- **Requisitos funcionales:**
  1. Cada regla debe definir el indicador, las condiciones, el periodo de evaluación y los destinatarios autorizados.
  2. La alerta debe explicar por qué se generó y permitir consultar los datos de origen dentro de los permisos aplicables.
  3. Las alertas repetidas por una misma condición deben actualizar o relacionarse con la alerta existente en lugar de crear registros ilimitados.
  4. Las condiciones resueltas deben reflejarse en el estado de la alerta.
  5. Una recaída debe registrarse como un nuevo evento relacionado con el historial previo.
  6. El sistema debe permitir que un profesional confirme, descarte justificadamente o convierta una alerta en una actuación de seguimiento.
  7. La creación de un caso debe quedar registrada como una decisión diferenciada de la detección automática.
  8. Los indicadores deben poder configurarse conforme a los datos disponibles y las necesidades institucionales.
  9. Los indicadores no deben utilizar atributos personales irrelevantes ni producir conclusiones automáticas sobre el estado psicológico o las circunstancias familiares de un estudiante.
  10. La indisponibilidad de los servicios académicos debe impedir que se presenten evaluaciones incompletas como resultados definitivos.
  11. Deben poder identificarse las reglas que generan alertas excesivas o que no producen actuaciones útiles.
  12. Las alertas deben tener responsables, estados y plazos de revisión cuando la política institucional los establezca.
- **Comportamiento esperado:** El sistema detecta condiciones que requieren atención y proporciona evidencia comprensible para revisarlas. Las alertas se convierten en actuaciones mediante un proceso controlled, y el equipo puede evaluar qué reglas ayudan realmente a detectar y atender necesidades.
- **Criterios de aceptación:**
  - Las reglas se prueban con datos que cumplen y no cumplen cada condición.
  - Los umbrales y periodos se aplican correctamente.
  - Los datos incompletos o desactualizados quedan identificados.
  - Las condiciones persistentes no generan alertas duplicadas sin control.
  - Las recaídas se distinguen de los eventos ya resueltos.
  - La resolución de una alerta no elimina su historial.
  - Se puede medir cuántas alertas fueron revisadas, atendidas, descartadas y vinculadas a casos.
  - Las alertas no se presentan como diagnósticos ni decisiones definitivas.
  - Se comprueba la integración con asistencia, calificaciones y casos existentes.
  - Las reglas pueden modificarse y probarse sin alterar retroactivamente las alertas históricas.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-ORI-01, T-ORI-02, T-ORI-08 y T-ORI-10. La integración con datos académicos requiere coordinación con T-ORI-12.

---

### T-ORI-08 [P2] — Planes de acompañamiento estructurados, medibles y revisables

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`PlanesAcompanamiento`, `saveSupportPlan`), `js/teacher.js`.
- **Problema detectado:** La existencia de planes con objetivos en JSON y fechas de revisión no garantiza que sus acciones sean verificables, que tengan responsables y plazos individuales, o que se pueda distinguir entre una actividad completada y un objetivo alcanzado.
- **Alcance de los cambios:**
  - Revisar el modelo actual de `PlanesAcompanamiento`, incluyendo los campos y estructuras de objetivos.
  - Definir una estructura consistente para objetivos, acciones, responsables, plazos, indicadores, resultados y estado.
  - Incorporar acciones individuales con fechas de vencimiento y seguimiento.
  - Registrar acuerdos, revisiones, evidencias pertinentes y resultados observables.
  - Diferenciar entre objetivo propuesto, acordado, en curso, cumplido, no cumplido, revisado y cancelado cuando proceda.
  - Establecer una fecha de próxima revisión y avisos sobre acciones vencidas.
  - Permitir ajustar los objetivos y acciones conservando el historial de cambios.
  - Vincular el plan al caso correspondiente sin duplicar la información principal del expediente.
  - Definir qué partes del plan pueden compartir docentes, orientación, coordinación y responsables familiares.
  - Gestionar planes suspendidos, cerrados, reabiertos y sustituidos por nuevas versiones.
  - Evitar que un plan se considere exitoso por el mero hecho de haber marcado sus tareas como completadas.
- **Requisitos funcionales:**
  1. Cada objetivo debe tener una descripción concreta y un criterio que permita valorar su avance.
  2. Cada acción debe incluir responsable, estado y fecha o regla de revisión cuando corresponda.
  3. Las revisiones deben registrar fecha, participante autorizado, resultado y siguientes pasos.
  4. El plan debe permitir identificar acciones vencidas y objetivos sin avance documentado.
  5. Completar una acción no debe marcar automáticamente el objetivo como alcanzado.
  6. Los cambios deben conservar las versiones anteriores de objetivos y acciones relevantes.
  7. El cierre debe registrar el resultado alcanzado o explicar por qué no pudo alcanzarse.
  8. Las notas privadas deben conservar su clasificación de acceso aunque otros colaboradores puedan consultar el estado operativo del plan.
  9. Los datos deben validarse al guardar, y las estructuras JSON deben tener un formato coherente que permita consultarlas y modificarlas de forma segura.
  10. Los planes existentes deben seguir siendo consultables durante una migración del formato de datos.
- **Comportamiento esperado:** Cada plan permite saber qué se pretende mejorar, qué acciones deben realizarse, quién es responsable, cuándo se revisará el progreso y qué resultado se obtuvo. Los cambios de objetivos no borran la historia ni convierten automáticamente una actividad realizada en un resultado positivo.
- **Criterios de aceptación:**
  - Se crea, actualiza, revisa, cierra y reabre un plan.
  - Los objetivos y acciones se muestran de forma coherente en las vistas relacionadas.
  - Las acciones vencidas se identifican correctamente.
  - Los cambios conservan el historial anterior.
  - Los datos incompletos o con formato inválido se rechazan con mensajes claros.
  - Los planes existentes no pierden información durante la adaptación del modelo.
  - Las tareas completadas y los objetivos alcanzados se contabilizan por separado.
  - Los permisos se aplican tanto al plan como a sus notas y documentos relacionados.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-01, T-ORI-02, T-ORI-10 y T-ORI-11.

---

### T-ORI-09 [P2] — Integridad histórica de expedientes y actuaciones de períodos cerrados

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/exam-service/Code.gs` (`CierresPeriodos`).
- **Problema detectado:** Los expedientes y actuaciones vinculados a períodos académicos cerrados no deben quedar expuestos a modificaciones accidentales o retroactivas que alteren la historia de la atención. La protección debe coexistir con los procedimientos legítimos de rectificación y seguimiento posterior. Al cerrar formalmente un año lectivo, los expedientes de orientación deben congelarse.
- **Alcance de los cambios:**
  - Identificar las entidades de bienestar que dependen de un período académico.
  - Definir qué operaciones quedan restringidas al cerrar un período y qué funciones continúan disponibles.
  - Impedir la modificación ordinaria de actuaciones históricas cuando el período esté cerrado.
  - Establecer un procedimiento autorizado para correcciones justificadas.
  - Registrar el valor anterior, el nuevo valor, el autor, la fecha y el motivo de la rectificación cuando corresponda.
  - Permitir agregar nuevas actuaciones sin modificar las anteriores.
  - Separar el cierre académico de un período del cierre operativo de un caso de bienestar.
  - Definir cómo se gestionan los casos que siguen activos después del cierre de un período.
  - Revisar permisos para exportar, consultar y corregir registros históricos.
  - Evitar que una actualización de matrícula o configuración académica modifique accidentalmente los datos históricos.
- **Requisitos funcionales:**
  1. El cierre del período debe aplicar las restricciones previstas a los registros relacionados.
  2. Las operaciones permitidas después del cierre deben estar definidas explícitamente.
  3. Las correcciones autorizadas deben dejar evidencia de la modificación y su motivo en auditoría.
  4. Una nueva intervención posterior debe añadirse al historial sin reescribir las anteriores.
  5. Los casos activos deben poder continuar su seguimiento cuando la política institucional lo permita.
  6. La restricción no debe depender exclusivamente de que el frontend oculte botones.
  7. Los cambios de período, grado o sección no deben alterar las relaciones históricas del expediente.
- **Comportamiento esperado:** Los registros históricos permanecen protegidos frente a cambios ordinarios. Cuando se necesita corregir información o continuar un caso, el sistema permite hacerlo mediante operaciones diferenciadas y trazables. Intento de editar un plan de apoyo perteneciente a un año cerrado devuelve un mensaje de error de período cerrado.
- **Criterios de aceptación:**
  - Un usuario sin autorización no puede modificar registros protegidos mediante llamadas directas al servidor.
  - Una corrección autorizada conserva evidencia del cambio.
  - Se pueden registrar actuaciones nuevas en un caso activo que atraviesa el cierre académico, según las reglas definidas.
  - El historial mantiene las fechas y relaciones originales.
  - Los cambios de matrícula no modifican retroactivamente la identidad del estudiante ni las actuaciones.
  - Los permisos de consulta y exportación siguen aplicándose a los registros históricos.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-02 y T-ORI-10. La aplicación concreta depende de cómo se representen los períodos y cierres académicos en el sistema.

---

### T-ORI-10 [P2] — Cronología unificada y bitácora de actuaciones pedagógicas

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`getCaseFollowUpNotes`), `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** La información de casos, notas, citas, incidencias, derivaciones y planes puede estar distribuida entre varias entidades. Sin una cronología unificada, reconstruir la evolución de un caso exige consultar manualmente diferentes registros y aumenta el riesgo de omitir actuaciones. El orientador requiere visualizar la línea de tiempo completa combinando citas atendidas, incidencias de conducta, avisos de asistencia y notas de seguimiento.
- **Alcance de los cambios:**
  - Definir una vista cronológica que integre los eventos relevantes del caso.
  - Relacionar las actuaciones con sus registros originales en lugar de duplicar sus datos completos.
  - Incorporar eventos de apertura, asignación, derivación, cita, intervención, revisión del plan, alerta, cambio de estado y cierre.
  - Diferenciar eventos informativos, actuaciones realizadas, decisiones y tareas pendientes.
  - Mostrar autor, fecha, tipo de evento y resultado según los permisos del usuario con etiquetas visuales por tipo de actuación (Entrevista, Incidencia, Plan de Apoyo, Cita, Carta de Compromiso).
  - Permitir filtrar la cronología por categoría, responsable, periodo, rango de fechas y tipo de actuación.
  - Registrar correcciones y cambios relevantes sin borrar silenciosamente los eventos previos.
  - Garantizar que los eventos no se registren como completados antes de confirmar la operación.
  - Controlar la duplicación de eventos cuando una misma operación se reintente.
  - Separar los datos de auditoría técnica de las notas profesionales del expediente.
  - Mantener el orden cronológico ante actualizaciones tardías o registros importados.
- **Requisitos funcionales:**
  1. Cada evento debe tener un identificador estable, tipo, fecha y referencia al recurso de origen.
  2. Los eventos deben mantener la relación correcta con el caso y el estudiante.
  3. La cronología debe reflejar los cambios de estado y responsabilidad.
  4. Los eventos deben distinguir entre fecha del hecho, fecha de registro y fecha de modificación cuando sea necesario.
  5. La vista debe mostrar únicamente los detalles autorizados.
  6. Los eventos corregidos deben conservar la trazabilidad correspondiente.
  7. Los registros de origen deben seguir siendo la referencia para consultar detalles y modificar la entidad cuando esté permitido.
  8. La cronología debe permitir identificar las actuaciones sin resultado, las próximas acciones y los periodos sin seguimiento.
  9. La carga de la cronología no debe requerir descargar innecesariamente todos los expedientes o notas confidenciales.
- **Comportamiento esperado:** El profesional autorizado puede reconstruir la evolución del caso desde una única vista, identificar qué ocurrió y qué falta por hacer, y acceder al registro original cuando tenga permiso. La cronología mantiene coherencia con los módulos que producen los eventos.
- **Criterios de aceptación:**
  - Las citas, planes, derivaciones e incidencias aparecen vinculadas al caso correcto en la vista del expediente.
  - Los eventos no se duplican por reintentos.
  - Los cambios de responsable y estado quedan reflejados.
  - Las actuaciones fallidas no aparecen como completadas.
  - Los filtros mantienen la coherencia cronológica.
  - Los usuarios no autorizados no obtienen contenido privado desde la cronología.
  - Los cambios tardíos no destruyen el orden histórico ni confunden la fecha del hecho con la fecha de registro.
  - La cronología coincide con los registros originales después de crear, modificar y cerrar actuaciones.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-01, T-ORI-02, T-ORI-05, T-ORI-06 y T-ORI-08.

---

### T-ORI-11 [P2] — Búsqueda avanzada multicriterio y panel de seguimiento pendiente

- **Componentes relacionados:** `js/teacher.js`, `teacher-dashboard.html`, `js/ui-common.js`.
- **Problema detectado:** La existencia de listados de casos no garantiza que los profesionales puedan priorizar sus pendientes, identificar casos sin responsable y localizar actuaciones vencidas. El panel de orientación requiere un buscador avanzado para filtrar expedientes por grado, sección, categoría de caso (`RiesgoAcademico`, `Conducta`, `Familiar`) y estado (`Activo`, `EnRevision`, `Cerrado`). La búsqueda también puede convertirse en un canal de filtración si no aplica los mismos permisos que el expediente.
- **Alcance de los cambios:**
  - Crear el panel "Centro de Control de Orientación y Consejería" en `teacher-dashboard.html`.
  - Implementar o completar la búsqueda por identificador, estudiante, estado, categoría, responsable y fechas.
  - Añadir filtros combinados para grado, sección, tipo de riesgo, estado del plan, citas pendientes, derivaciones sin aceptar, planes con revisión vencida, acciones pendientes y alertas sin revisar.
  - Incorporar vistas operativas para casos sin responsable, sin actividad reciente o con más de 15 días de inactividad o compromisos vencidos.
  - Mostrar fecha de apertura, última actuación y próxima revisión cuando corresponda.
  - Permitir combinar filtros, ordenar resultados y paginar listados extensos.
  - Incluir vistas personales de tareas y vistas de supervisión para roles autorizados.
  - Garantizar que los contadores y listados utilicen los mismos criterios.
  - Evitar que las búsquedas revelen la existencia de casos confidenciales mediante sugerencias, autocompletado o mensajes de error.
  - Optimizar las consultas para no cargar todos los registros en el navegador.
  - Incorporar estados vacíos, mensajes de error recuperables y actualización de resultados tras modificar un caso.
- **Requisitos funcionales:**
  1. Los filtros deben aplicarse sobre los registros que el usuario está autorizado a consultar.
  2. Los casos sin responsable y las acciones vencidas deben identificarse mediante criterios verificables.
  3. Los resultados deben indicar los criterios de filtrado aplicados.
  4. Los contadores deben corresponder a los registros realmente incluidos en cada vista.
  5. Las búsquedas deben soportar combinaciones de criterios sin mezclar casos de diferentes estudiantes.
  6. La vista personal debe diferenciar tareas asignadas al usuario de casos que solo puede consultar.
  7. Las vistas de supervisión deben limitarse a la información autorizada para ese rol.
  8. La ordenación y paginación no deben duplicar ni omitir registros válidos.
  9. Las métricas operativas deben representar volumen y estado del trabajo, no asumir que una mayor cantidad de intervenciones equivale a una mejor atención.
- **Comportamiento esperado:** Cada profesional puede localizar los casos y acciones que le corresponden y priorizar los pendientes. Los supervisores autorizados pueden identificar cargas de trabajo y retrasos sin acceder a notas privadas que no necesitan consultar.
- **Criterios de aceptación:**
  - Se prueban filtros individuales y combinados.
  - Los resultados coinciden con los registros que cumplen las condiciones.
  - Los contadores coinciden con sus listados.
  - Los casos restringidos no aparecen en búsquedas de usuarios sin autorización.
  - La paginación mantiene resultados estables y no duplica registros.
  - Los cambios de estado actualizan las vistas y contadores.
  - Se prueban casos sin responsable, sin actividad, con tareas vencidas y con varios responsables históricos.
  - El rendimiento se verifica con un volumen representativo de datos.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-02, T-ORI-05, T-ORI-07, T-ORI-08 y T-ORI-10.

---

### T-ORI-12 [P2] — Sincronización controlada de planes de apoyo con el expediente académico y la libreta de notas

- **Componentes relacionados:** `backend/user-service/Code.gs`, `backend/exam-service/Code.gs` (`CalificacionesEstudiantes`).
- **Problema detectado:** Los planes de apoyo pueden requerir coordinación con docentes y ajustes pedagógicos, pero una integración inadecuada puede duplicar datos, revelar notas privadas o modificar calificaciones sin una autorización académica explícita. Cuando un plan autoriza una adecuación curricular o exención justificada, el sistema debe sincronizar dicho estado con el libro de calificaciones.
- **Alcance de los cambios:**
  - Identificar qué datos académicos son necesarios para el seguimiento de un plan.
  - Definir una interfaz de coordinación entre planes de apoyo, asistencia, calificaciones y expediente académico.
  - Vincular los indicadores con sus registros originales y mostrar su fecha de actualización.
  - Permitir registrar medidas pedagógicas autorizadas, exenciones y adecuaciones curriculares, responsables y periodos de aplicación.
  - Reflejar automáticamente en `CalificacionesEstudiantes` el estado `Eximido` (`EX`) para las actividades indicadas en la resolución.
  - Separar los ajustes pedagógicos autorizados de las modificaciones ordinarias de calificaciones.
  - Evitar que un plan de acompañamiento modifique automáticamente notas, asistencia oficial o resultados académicos sin las reglas de negocio pertinentes.
  - Gestionar exenciones o adaptaciones solo si existen reglas institucionales y permisos explícitos para ello.
  - Mantener las notas privadas de orientación fuera de la libreta académica general.
  - Gestionar cambios de grado, sección, asignaturas y períodos.
  - Definir un comportamiento controlado ante fallos o retrasos de sincronización.
  - Registrar las modificaciones que afecten a los datos académicos y el origen de cada cambio.
- **Requisitos funcionales:**
  1. Cada dato académico mostrado debe tener un origen identificable y una fecha de actualización.
  2. El sistema debe distinguir entre una recomendación pedagógica y un cambio académico oficialmente aplicado.
  3. Las medidas de apoyo deben tener responsable, periodo de vigencia y estado cuando corresponda.
  4. Las modificaciones de calificaciones o exenciones requieren autorización específica y validación de las reglas académicas.
  5. La integración no debe copiar notas confidenciales a los módulos académicos.
  6. Los cambios en la matrícula deben actualizar las relaciones vigentes sin alterar el historial.
  7. Un fallo de sincronización debe identificarse y no presentarse como una actualización exitosa.
  8. Los conflictos entre datos deben resolverse mediante una regla explícita, no por sobrescritura silenciosa.
- **Comportamiento esperado:** Los profesionales autorizados pueden coordinar apoyos con el contexto académico pertinente. Las medidas se documentan y siguen sin convertir automáticamente un plan de bienestar en una modificación no autorizada de la evaluación oficial.
- **Criterios de aceptación:**
  - Los datos académicos mostrados coinciden con sus fuentes autorizadas.
  - Las medidas pedagógicas pueden crearse, asignarse, revisar y finalizar.
  - La aprobación de una adecuación en el plan de apoyo actualiza la libreta de notas excluyendo la actividad del cálculo del promedio.
  - Los cambios académicos requieren los permisos correspondientes.
  - Las notas privadas no aparecen en las vistas generales de calificaciones.
  - Los fallos de integración generan un estado identificable.
  - Los cambios de matrícula conservan la asociación histórica del caso.
  - Se prueban datos desactualizados, conflictos, cambios de asignaturas y períodos cerrados.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-ORI-02, T-ORI-07, T-ORI-08 y T-ORI-10.

---

### T-ORI-13 [P3] — Panel consolidado de indicadores de bienestar y clima escolar por grado

- **Componentes relacionados:** `js/teacher.js`, `js/ui-common.js` (`renderUniversalConfigurableChart`), `teacher-dashboard.html`.
- **Problema detectado:** La existencia de alertas individuales no proporciona necesariamente una visión operativa de patrones colectivos. Se requiere un panel que permita identificar necesidades de seguimiento por grado, sección o período sin exponer información individual innecesaria ni violar la confidencialidad.
- **Alcance de los cambios:**
  - Crear un panel agregado para roles autorizados de orientación, coordinación y Dirección en `teacher-dashboard.html`.
  - Renderizar mediante `renderUniversalConfigurableChart` gráficos estadísticos de barras/rosca con la distribución de casos por categoría.
  - Incorporar indicadores de casos activos, nuevos, cerrados, sin responsable y con actuaciones vencidas.
  - Mostrar tendencias agregadas de alertas de asistencia y rendimiento, derivaciones y seguimiento de planes.
  - Permitir filtros por período académico, grado, sección, categoría de caso y estado.
  - Diferenciar volumen de casos, tiempos de atención, carga de trabajo y resultados documentados.
  - Mostrar la fecha de actualización y la cobertura de los datos.
  - Permitir navegar desde un indicador agregado hacia los registros individuales solo si el usuario tiene autorización.
  - Evitar comparaciones que interpreten automáticamente una mayor cantidad de casos como peor desempeño de un grado o profesional.
  - Incorporar mecanismos para reducir el riesgo de identificar estudiantes en grupos muy pequeños.
  - Evitar la presentación de indicadores basados en datos incompletos como si fueran representativos.
- **Requisitos funcionales:**
  1. Cada indicador debe tener una definición clara y una fuente de datos identificable.
  2. Los filtros deben aplicarse de manera consistente a todos los indicadores relacionados.
  3. Los datos deben diferenciar períodos, estados y categorías para evitar comparaciones incompatibles.
  4. El panel debe mostrar cuándo se actualizaron los datos.
  5. Los resultados agregados no deben revelar detalles de casos restringidos.
  6. Los indicadores de resultados deben distinguir entre tareas completadas, objetivos alcanzados y casos cerrados.
  7. Las tasas deben incluir un denominador pertinente cuando se comparen grupos o períodos.
  8. El panel debe identificar datos faltantes o cobertura insuficiente.
  9. Las exportaciones deben aplicar las mismas restricciones de acceso que el panel.
- **Comportamiento esperado:** Los responsables autorizados pueden observar tendencias operativas y determinar dónde se necesita revisar la cobertura del seguimiento. El panel ofrece información útil para organizar recursos sin convertirse en una herramienta de estigmatización o clasificación automática de estudiantes.
- **Criterios de aceptación:**
  - Los indicadores coinciden con los registros que los componen.
  - Los filtros actualizan todos los elementos relacionados.
  - Los datos de distintos períodos no se mezclan.
  - La navegación a un caso individual vuelve a validar permisos.
  - Los grupos pequeños se protegen cuando existe riesgo de identificación.
  - Los indicadores incompletos muestran su limitación.
  - Se verifica que los totales, porcentajes y tendencias utilizan denominadores coherentes.
  - Los datos históricos siguen siendo interpretables después de cambiar las reglas de alertas.
  - El dashboard directivo muestra tendencias de clima escolar y casos atendidos sin comprometer la confidencialidad individual.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-02, T-ORI-07, T-ORI-10 y T-ORI-11.

---

### T-ORI-14 [P3] — Exportación estructurada de informes de orientación y actas en PDF y Excel

- **Componentes relacionados:** `backend/accounting-service/Code.gs` (`generateSchoolDocument`), `backend/academic-service/Code.gs`.
- **Problema detectado:** La generación de documentos institucionales debe ofrecer informes útiles (Ficha de Seguimiento Psicopedagógico y Actas de Compromiso en PDF con estampa oficial e identificador único) y coherentes con el expediente, pero también impedir que una exportación revele información confidencial a destinatarios no autorizados.
- **Alcance de los cambios:**
  - Revisar las capacidades existentes de generación de documentos en `generateSchoolDocument` y determinar qué formatos están realmente implementados.
  - Implementar la plantilla `FichaSeguimientoOrientacion` y plantillas para informes de seguimiento, resúmenes de caso, actas de entrevista, planes de acompañamiento e informes agregados.
  - Permitir seleccionar el alcance del informe según los permisos del usuario.
  - Incorporar datos identificativos necesarios, fechas, responsables, actuaciones, acuerdos, estado, firmas digitales y estampa de confidencialidad cuando corresponda.
  - Diferenciar los informes operativos de los informes que contienen notas sensibles.
  - Restringir la generación del documento exclusivamente a roles autorizados (`Orientador`, `Director`).
  - Implementar exportación a PDF para documentos legibles y a Excel para datos estructurados que deban analizarse.
  - Incorporar encabezados, fechas de generación, identificación del período y paginación cuando proceda.
  - Registrar quién genera el documento y qué alcance de datos se incluyó.
  - Validar que los filtros aplicados se reflejen en el archivo.
  - Evitar que las fórmulas, hojas ocultas, metadatos o enlaces del archivo expongan información no visible.
  - Gestionar errores de generación, archivos incompletos y descargas interrumpidas.
- **Requisitos funcionales:**
  1. La exportación debe comprobar permisos antes de recuperar los datos y antes de entregar el documento.
  2. Los informes deben incluir solo los campos autorizados para el tipo de documento.
  3. Los datos deben coincidir con los registros de origen en el momento de la generación.
  4. Los informes deben distinguir hechos, actuaciones, acuerdos y estados, sin presentar conclusiones no documentadas.
  5. Los documentos deben identificar cuándo se generaron y a qué período o selección corresponden.
  6. La exportación de notas sensibles debe requerir autorización específica.
  7. Los archivos no deben quedar almacenados en ubicaciones públicas.
  8. Los errores deben comunicarse sin generar un archivo parcial que aparente estar completo.
  9. La exportación Excel debe estructurar los datos en columnas coherentes y evitar contenido ejecutable no confiable en celdas.
  10. Los informes agregados deben evitar la divulgación accidental de expedientes individuales.
- **Comportamiento esperado:** El usuario autorizado genera documentos legibles, completos y coherentes con la información consultada. El archivo respeta los permisos y los filtros, y no incorpora datos adicionales por el mero hecho de estar disponibles en el sistema. El PDF se emite con marca de agua confidencial.
- **Criterios de aceptación:**
  - Se generan correctamente los formatos definidos para cada tipo de informe.
  - Los datos exportados coinciden con el expediente de origen.
  - Los filtros y permisos se mantienen en el documento.
  - Los usuarios no autorizados no pueden exportar notas sensibles.
  - Se comprueba el contenido visible y la estructura interna de los archivos.
  - Los errores de generación no producen documentos aparentemente válidos pero incompletos.
  - Se prueban expedientes extensos, caracteres especiales, campos vacíos y datos adjuntos.
  - Se verifica que las descargas no concedan acceso público permanente a los documentos.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-02, T-ORI-04 y T-ORI-10. El diseño de informes agregados debe coordinarse con T-ORI-13.

---

### T-ORI-15 [P3] — Conciliación entre incidencias, actuaciones y resumen del expediente

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`reconcileGuidanceRecords`), `backend/user-service/Code.gs`.
- **Problema detectado:** La coexistencia de incidencias, observaciones, casos y resúmenes en `CasosSeguimiento` y `PlanesAcompanamiento` puede producir registros duplicados o diferencias entre la información original y la síntesis mostrada en el expediente. Es necesario detectar esas discrepancias sin fusionar automáticamente hechos distintos.
- **Alcance de los cambios:**
  - Identificar las entidades que representan incidencias, observaciones, actuaciones y resúmenes.
  - Desarrollar la rutina de conciliación `reconcileGuidanceRecords(userId)`.
  - Definir reglas para detectar posibles duplicados y registros relacionados.
  - Comparar fechas, estudiante, categoría, origen y referencias disponibles.
  - Crear una vista de revisión para que personal autorizado confirme si los registros son duplicados, relacionados o independientes.
  - Permitir vincular registros relacionados al mismo caso sin eliminar sus registros de origen.
  - Establecer un procedimiento trazable para corregir asociaciones erróneas.
  - Actualizar los resúmenes del expediente a partir de registros válidos y autorizados.
  - Distinguir entre la información original y las síntesis elaboradas por el sistema o por un profesional.
  - Identificar incidencias sin caso asociado cuando la política requiera seguimiento.
  - Evitar que las coincidencias aproximadas produzcan fusiones automáticas irreversibles.
- **Requisitos funcionales:**
  1. La detección de duplicados debe apoyarse en criterios explícitos y mostrar las coincidencias relevantes.
  2. La coincidencia de nombre o fecha por sí sola no debe provocar una fusión automática.
  3. La conciliación debe conservar los identificadores y la procedencia de los registros originales.
  4. Las correcciones de asociaciones deben quedar registradas.
  5. Los resúmenes deben diferenciar datos confirmados, relaciones pendientes de revisión y síntesis profesionales.
  6. Los usuarios solo deben revisar registros dentro de su ámbito de autorización.
  7. La resolución de una coincidencia no debe eliminar evidencia histórica.
  8. Los registros sin relación válida deben poder identificarse y corregirse mediante un proceso autorizado.
- **Comportamiento esperado:** El sistema identifica posibles inconsistencias y ofrece herramientas para revisarlas. Los profesionales pueden relacionar registros correctamente, corregir asociaciones y mantener un resumen fiel al expediente sin perder la información de origen.
- **Criterios de aceptación:**
  - Se detectan registros que cumplen las reglas de coincidencia definidas.
  - Se distinguen duplicados probables de eventos diferentes.
  - La confirmación de una relación conserva los registros originales.
  - La corrección de una asociación deja evidencia de quién la realizó y cuándo.
  - Los resúmenes coinciden con los registros válidos que deben representar.
  - Los usuarios no autorizados no pueden revisar ni conciliar registros restringidos.
  - Se prueban incidencias repetidas, registros relacionados, fechas distintas y estudiantes con nombres similares.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** T-ORI-02, T-ORI-08 y T-ORI-10.

---

### T-ORI-16 [P3] — Respaldo integral, verificable y protegido de expedientes de bienestar

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`createSystemBackup`, `restoreSystemBackup`), `backend/user-service/Code.gs`.
- **Problema detectado:** Los expedientes dependen de varios registros relacionados (`CasosSeguimiento`, `PlanesAcompanamiento`, `CitasOrientacion`, `ObservacionesConvivencia`) y pueden incluir información sensible y archivos adjuntos. Un respaldo que copie únicamente las hojas principales no garantiza que sea posible reconstruir los casos, sus actuaciones y sus documentos manteniendo la confidencialidad RBAC.
- **Alcance de los cambios:**
  - Revisar el sistema de respaldo existente (`createSystemBackup`, `restoreSystemBackup`) y sus capacidades reales de recuperación.
  - Identificar todas las entidades que forman parte de un expediente: casos, notas, planes, citas, incidencias, derivaciones, historial y relaciones con adjuntos.
  - Definir un procedimiento consistente para capturar registros relacionados y su estado en un momento identificable.
  - Incorporar verificaciones de integridad, conteos y relaciones entre registros respaldados.
  - Mantener controles de acceso equivalentes o más restrictivos para las copias de datos sensibles.
  - Evitar que los respaldos se almacenen en ubicaciones públicas o accesibles por usuarios sin autorización.
  - Registrar fecha, alcance, resultado y errores de cada ejecución.
  - Definir procedimientos de restauración que permitan recuperar datos sin duplicar expedientes o sobrescribir información posterior indebidamente.
  - Establecer mecanismos de retención y eliminación de copias conforme a las políticas institucionales aplicables.
  - Determinar cómo se respaldan y verifican los archivos adjuntos almacenados en Drive.
  - Probar la recuperación en un entorno controlado.
  - Definir cómo se comprueba que los datos restaurados conservan sus identificadores, relaciones y restricciones de acceso.
- **Requisitos funcionales:**
  1. El respaldo debe incluir todas las entidades necesarias para reconstruir el expediente y sus relaciones.
  2. Debe poder verificarse que los registros respaldados no están incompletos o corruptos.
  3. Las copias deben mantener la confidencialidad de los datos originales.
  4. Cada respaldo debe identificarse por fecha, alcance y resultado.
  5. La restauración debe comprobar las relaciones entre estudiantes, casos, notas, planes, citas y adjuntos.
  6. Los procedimientos de recuperación deben prevenir duplicados y conflictos con registros existentes.
  7. Las copias deben estar protegidas frente a modificaciones no autorizadas.
  8. La restauración debe probarse antes de considerarse operativa.
  9. Los fallos parciales deben identificarse explícitamente, sin marcar el respaldo como íntegro.
  10. La política de retención debe distinguir las copias operativas de los registros históricos que deban conservarse.
- **Comportamiento esperado:** El sistema puede recuperar un expediente completo y coherente, incluidos sus registros relacionados y los adjuntos necesarios, sin exponer la información ni duplicar datos. Los responsables pueden verificar cuándo se creó el respaldo y si pasó las comprobaciones de integridad.
- **Criterios de aceptación:**
  - Se genera un respaldo que incluye todas las entidades y relaciones definidas.
  - Se verifican conteos, identificadores y referencias entre registros.
  - Se detectan los adjuntos ausentes o inaccesibles.
  - Se restaura una muestra representativa en un entorno controlled.
  - Los datos restaurados conservan las relaciones y los permisos previstos.
  - Los respaldos no quedan accesibles públicamente.
  - Los fallos parciales se registran y no se presentan como respaldo exitoso.
  - Se comprueba que una restauración no duplica expedientes ni elimina cambios posteriores sin un procedimiento explícito.
  - Se documentan los resultados y las limitaciones reales de la recuperación.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** T-ORI-02, T-ORI-04 y T-ORI-10. La integración con el sistema general de respaldo debe aprovechar los mecanismos existentes y evitar crear una vía paralela sin necesidad.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE 12 (BIENESTAR Y ORIENTACIÓN)

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-ORI-01.** Control de concurrencia transaccional con LockService | **P1** | `addCaseFollowUpNote` / `LockService` |
| **2** | **T-ORI-02.** Confidencialidad granular y aislamiento RBAC de notas sensibles | **P1** | `assertRecordOwnership` / RBAC |
| **3** | **T-ORI-03.** Verificación de propiedad y relaciones familiares en portal familiar | **P1** | `RelacionesFamiliares` |
| **4** | **T-ORI-04.** Proxy de descarga segura con token firmado para evidencias Drive | **P1** | `getSecureDocumentStream` |
| **5** | **T-ORI-05.** Flujo formal de derivación institucional entre docentes, orientación y Dirección | **P2** | `referStudentToGuidance` |
| **6** | **T-ORI-06.** Gestión avanzada de citas de orientación, conflictos horarios y recordatorios | **P2** | `bookAppointment` |
| **7** | **T-ORI-07.** Motor configurable de alertas tempranas por ausentismo, rendimiento y riesgo de deserción | **P2** | `evaluateEarlyWarningAlerts` |
| **8** | **T-ORI-08.** Planes de acompañamiento estructurados, medibles y revisables | **P2** | `PlanesAcompanamiento` |
| **9** | **T-ORI-09.** Integridad histórica de expedientes y actuaciones de períodos cerrados | **P2** | `CierresPeriodos` |
| **10** | **T-ORI-10.** Cronología unificada y bitácora de actuaciones pedagógicas | **P2** | `getCaseFollowUpNotes` |
| **11** | **T-ORI-11.** Búsqueda avanzada multicriterio y panel de seguimiento pendiente | **P2** | `teacher-dashboard.html` / UI |
| **12** | **T-ORI-12.** Sincronización controlada de planes de apoyo con el expediente académico y la libreta de notas | **P2** | `CalificacionesEstudiantes` |
| **13** | **T-ORI-13.** Panel consolidado de indicadores de bienestar y clima escolar por grado | **P3** | Universal Chart Engine |
| **14** | **T-ORI-14.** Exportación estructurada de informes de orientación y actas en PDF y Excel | **P3** | `generateSchoolDocument` |
| **15** | **T-ORI-15.** Conciliación entre incidencias, actuaciones y resumen del expediente | **P3** | Reconciliation Engine |
| **16** | **T-ORI-16.** Respaldo integral, verificable y protegido de expedientes de bienestar | **P3** | `createSystemBackup` |


## PLAN DE TRABAJO DETALLADO Y UNIFICADO: FASE DE SUPERVISIÓN DOCENTE Y CALIDAD EDUCATIVA

### T-SUP-01 [P1] — Control de concurrencia transaccional con LockService en evaluaciones y observaciones docentes

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`saveSupervisionObservation`), `js/teacher.js`.
- **Problema detectado:** Al guardar las respuestas de rúbricas y observaciones de aula en `ObservacionesSupervision` y actualizar el estado en `SupervisionesDocentes`, el servidor no aplica un bloqueo exclusivo con `LockService`. Evaluaciones concurrentes por parte de coordinadores o supervisores pueden provocar carreras y sobrescritura de observaciones.
- **Requisitos funcionales:**
  1. Adquirir `LockService.getScriptLock()` antes de actualizar `ObservacionesSupervision` y `SupervisionesDocentes`.
  2. Verificar que la supervisión exista y no esté en estado `Finalizada` o `Cerrada` por otra sesión.
  3. Manejar reintentos y liberar el bloqueo en bloques `finally`.
- **Criterios de Aceptación:**
  - Operaciones concurrentes de registro de observaciones no sobreescriben datos ni producen registros duplicados.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `saveSupervisionObservation`, `LockService`.

---

### T-SUP-02 [P1] — Confidencialidad granular y aislamiento RBAC de evaluaciones y comentarios privados docentes

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`getSupervisionObservation`), `backend/user-service/Code.gs`.
- **Problema detectado:** Las observaciones pedagógicas y comentarios privados sobre el desempeño docente deben aislarse estrictamente para que solo sean accesibles por el docente evaluado, el supervisor asignado y Dirección/Coordinación.
- **Requisitos funcionales:**
  1. Validar en `getSupervisionObservation` que el `authUserId` corresponda al docente observado, al supervisor o a roles `Director`/`Coordinador`.
  2. Ocultar comentarios internos de supervisión en las respuestas API entregadas a docentes cuando el campo esté marcado como borrador o confidencial.
- **Criterios de Aceptación:**
  - Docentes no autorizados o de otras asignaturas reciben error de permiso al intentar consultar observaciones ajenas.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `getSupervisionObservation`, `assertRecordOwnership`.

---

### T-SUP-03 [P1] — Módulo estructurado de gestión de jornalizaciones, sílabos y planes de clase

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** Falta un módulo dedicado para que los docentes elaboren, estructuren y organicen sus jornalizaciones y sílabos por unidades, semanas y temas con objetivos de aprendizaje y competencias.
- **Requisitos funcionales:**
  1. Crear la tabla `JornalizacionesDocentes` (`JornalizacionID`, `DocenteUserId`, `AsignaturaID`, `Grado`, `Seccion`, `Periodo`, `EstructuraJSON`, `Estado`, `FechaEntrega`).
  2. Implementar interfaz en `teacher-dashboard.html` para la edición estructurada por semanas y temas.
- **Criterios de Aceptación:**
  - El docente puede crear, editar y guardar su jornalización curricular por período lectivo.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `teacher-dashboard.html`, `js/teacher.js`.

---

### T-SUP-04 [P1] — Ciclo de vida formal de entrega, revisión, aprobación y devolución de documentación pedagógica

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`.
- **Problema detectado:** No existe un flujo trazable que controle la fecha límite de entrega de planificaciones, la revisión por coordinación y la devolución con observaciones para corrección (`RequiereCorrecciones`).
- **Requisitos funcionales:**
  1. Implementar la máquina de estados de documentación: `Borrador` -> `Entregado` -> `EnRevision` -> `Aprobado` / `RequiereCorrecciones`.
  2. Registrar el historial de revisiones, observaciones del coordinador y fecha efectiva de reentrega.
- **Criterios de Aceptación:**
  - El coordinador puede devolver una jornalización indicando observaciones, cambiando su estado a `RequiereCorrecciones` e informando al docente.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `JornalizacionesDocentes`.

---

### T-SUP-05 [P1] — Módulo de gestión de suplencias docentes y asignaciones temporales con delegación de permisos

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/user-service/Code.gs`, `js/teacher.js`.
- **Problema detectado:** Cuando un docente titular se ausenta, no existe un mecanismo para asignar un docente suplente con permisos temporales para registrar asistencia, calificar tareas y consultar planes del período de sustitución.
- **Requisitos funcionales:**
  1. Crear la tabla `SuplenciasDocentes` (`SuplenciaID`, `DocenteTitularID`, `DocenteSuplenteID`, `AsignaturaID`, `Grado`, `Seccion`, `FechaInicio`, `FechaFin`, `Estado`).
  2. Otorgar permisos temporales acotados estrictamente al rango de fechas de la suplencia.
- **Criterios de Aceptación:**
  - El docente suplente visualiza la asignatura asignada temporalmente y registra asistencia durante el período de la suplencia, perdiendo el acceso al vencer la fecha fin.
- **Riesgo de Regresión:** Medio.
- **Dependencias:** `ROLE_PERMISSIONS`, `HorariosClases`.

---

### T-SUP-06 [P2] — Rúbricas configurables multicriterio para observaciones de aula

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`saveSupervisionObservation`), `teacher-dashboard.html`.
- **Problema detectado:** La plataforma requiere soportar rúbricas institucionales adaptables con diferentes niveles de desempeño (Excelente, Satisfactorio, Debe Mejorar, Insatisfactorio) y ponderaciones por dimensión pedagógica.
- **Requisitos funcionales:**
  1. Almacenar la definición de rúbricas en `RubricasSupervision` con criterios y niveles.
  2. Evaluar y calcular automáticamente el puntaje global obtenido en la observación.
- **Criterios de Aceptación:**
  - El formulario de observación renderiza los criterios dinámicos de la rúbrica seleccionada y calcula el resumen de desempeño.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `saveSupervisionObservation`.

---

### T-SUP-07 [P2] — Planes de mejora pedagógica con alertas de fechas objetivo y compromisos

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`saveTeacherImprovementPlan`, `getTeacherImprovementPlans`), `js/teacher.js`.
- **Problema detectado:** Los planes de mejora en `PlanesMejoraPedagogica` deben contar con alertas automáticas cuando la `FechaObjetivo` o la `FechaRevision` están próximas a vencer o se encuentran desfasadas sin cumplimiento.
- **Requisitos funcionales:**
  1. Consultar planes con estado `EnEjecucion` y comparar `FechaObjetivo` con la fecha actual.
  2. Generar tareas pendientes y avisos en la bandeja de coordinación para revisiones vencidas.
- **Criterios de Aceptación:**
  - El panel de coordinación resalta los planes de mejora docente cuyo plazo de revisión ha expirado.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `PlanesMejoraPedagogica`.

---

### T-SUP-08 [P2] — Bitácora diaria de clases impartidas y avance curricular real vs. planificado

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** No existe un registro donde el docente confirme el contenido real impartido en cada sesión de clase para compararlo contra la jornalización aprobada.
- **Requisitos funcionales:**
  1. Crear la tabla `BitacoraClasesImpartidas` (`BitacoraID`, `SesionID`, `DocenteUserId`, `Fecha`, `TemaImpartido`, `AvancePorcentaje`, `ObservacionesDocente`).
  2. Calcular el porcentaje de cumplimiento curricular acumulado por asignatura y grado.
- **Criterios de Aceptación:**
  - El docente registra al finalizar la clase el tema impartido y el sistema actualiza el porcentaje de avance respecto a la planificación.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `SesionesAsistencia`, `JornalizacionesDocentes`.

---

### T-SUP-09 [P2] — Supervisión de carga horaria docente y prevención de solapamientos

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `js/teacher.js`.
- **Problema detectado:** Se requiere auditar la carga horaria semanal de cada docente detectando sobrecargas superiores a la jornada contratada o cruces de horario entre secciones.
- **Requisitos funcionales:**
  1. Desarrollar la función `auditTeacherWorkload(docenteUserId)` que sume las horas lectivas asignadas.
  2. Alertar cuando un docente tenga más horas asignadas de las permitidas o solapamientos en un mismo bloque de tiempo.
- **Criterios de Aceptación:**
  - El asignador de horarios recibe una advertencia si intenta asignar un bloque horaria que colisiona con otra sección del docente.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `HorariosClases`, `AsignacionesDocentes`.

---

### T-SUP-10 [P2] — Inalterabilidad de evaluaciones docentes en períodos o años lectivos cerrados

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/exam-service/Code.gs` (`CierresPeriodos`).
- **Problema detectado:** Al cerrar un año escolar o período de evaluación, las evaluaciones docentes y planes de mejora asociados deben congelarse para prevenir modificaciones extemporáneas.
- **Requisitos funcionales:**
  1. Verificar si la fecha de la supervisión corresponde a un período con estado `Cerrado`.
  2. Bloquear cualquier actualización en `SupervisionesDocentes` y `ObservacionesSupervision` para períodos cerrados.
- **Criterios de Aceptación:**
  - Intento de editar una observación de un período cerrado devuelve un error de inalterabilidad histórica.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `CierresPeriodos`, `SupervisionesDocentes`.

---

### T-SUP-11 [P2] — Búsqueda avanzada, filtrado y centro de control de supervisión docente

- **Componentes relacionados:** `js/teacher.js`, `teacher-dashboard.html`.
- **Problema detectado:** Coordinación requiere un panel consolidado con búsquedas multicriterio para filtrar observaciones por docente, nivel, estado (`Programada`, `Finalizada`), y rango de fechas.
- **Requisitos funcionales:**
  1. Implementar el buscador en la sección `#section-supervision` de `teacher-dashboard.html`.
  2. Permitir filtrar por estado de la observación, docente y asignatura.
- **Criterios de Aceptación:**
  - El coordinador filtra rápidamente observaciones finalizadas o pendientes de un departamento específico.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `teacher-dashboard.html`, `js/teacher.js`.

---

### T-SUP-12 [P2] — Integración entre asistencia docente, ausentismo y activación de suplencias

- **Componentes relacionados:** `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs` (`HorariosLaborales`).
- **Problema detectado:** Las ausencias o tardanzas justificadas registradas en el control laboral de personal deben sugerir automáticamente la apertura de una suplencia docente para las clases del día.
- **Requisitos funcionales:**
  1. Detectar registros de inasistencia en `HorariosLaborales` o `IncapacidadesMedicas`.
  2. Generar aviso a Coordinación para asignar un reemplazo temporal.
- **Criterios de Aceptación:**
  - El registro de una incapacidad médica de un docente activa un aviso de suplencia requerida en el panel de coordinación.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `HorariosLaborales`, `SuplenciasDocentes`.

---

### T-SUP-13 [P3] — Dashboard consolidado de indicadores de calidad educativa e informes agregados

- **Componentes relacionados:** `js/teacher.js`, `js/ui-common.js` (`renderUniversalConfigurableChart`), `teacher-dashboard.html`.
- **Problema detectado:** La Dirección requiere visualizar métricas globales de cumplimiento de entregas pedagógicas, nivel promedio de desempeño docente por área y avance de planes de mejora.
- **Requisitos funcionales:**
  1. Renderizar mediante `renderUniversalConfigurableChart` gráficos agregados de desempeño sin exponer nombres individuales en reportes públicos.
  2. Calcular el porcentaje institucional de cumplimiento de planificaciones.
- **Criterios de Aceptación:**
  - El dashboard directivo presenta gráficos de barra/rosca con los niveles de desempeño pedagógico consolidados por departamento.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `renderUniversalConfigurableChart`, `SupervisionesDocentes`.

---

### T-SUP-14 [P3] — Exportación oficial de la Ficha de Evaluación y Acompañamiento Docente en PDF

- **Componentes relacionados:** `backend/accounting-service/Code.gs` (`generateSchoolDocument`), `backend/academic-service/Code.gs`.
- **Problema detectado:** Permitir a coordinadores y directores emitir el informe oficial de evaluación docente en PDF con firmas de conformidad y sello institucional.
- **Requisitos funcionales:**
  1. Crear la plantilla `FichaEvaluacionDocente` en `generateSchoolDocument`.
  2. Incluir puntajes de rúbrica, fortalezas, oportunidades de mejora, compromisos del docente y firma digital.
- **Criterios de Aceptación:**
  - El archivo PDF de la ficha de evaluación se genera correctamente con todos los criterios y acuerdos de desempeño.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `generateSchoolDocument`, `ObservacionesSupervision`.

---

### T-SUP-15 [P3] — Herramienta de conciliación entre observaciones de aula y planes de mejora

- **Componentes relacionados:** `backend/academic-service/Code.gs`.
- **Problema detectado:** Asegurar que cada supervisión finalizada con oportunidades de mejora críticas cuente con un plan de acompañamiento activo registrado en `PlanesMejoraPedagogica`.
- **Requisitos funcionales:**
  1. Implementar la rutina de conciliación `reconcileSupervisionImprovementPlans()`.
  2. Identificar observaciones con puntaje bajo que no tengan un plan de mejora vinculado.
- **Criterios de Aceptación:**
  - La rutina identifica supervisiones con brechas pedagógicas que requieren la apertura inmediata de un plan de mejora.
- **Riesgo de Regresión:** Nulo.
- **Dependencias:** `ObservacionesSupervision`, `PlanesMejoraPedagogica`.

---

### T-SUP-16 [P3] — Respaldo integral e inmutable de registros de supervisión pedagógica

- **Componentes relacionados:** `backend/academic-service/Code.gs` (`createSystemBackup`, `restoreSystemBackup`).
- **Problema detectado:** Garantizar que las copias de seguridad incluyan las tablas de evaluación docente y que la restauración mantenga intacta la privacidad RBAC de las notas de desempaño.
- **Requisitos funcionales:**
  1. Incluir `SupervisionesDocentes`, `ObservacionesSupervision`, `PlanesMejoraPedagogica` y `JornalizacionesDocentes` en `createSystemBackup`.
  2. Verificar la integridad de los datos de supervisión al ejecutar `restoreSystemBackup`.
- **Criterios de Aceptación:**
  - El backup institucional respalda y restaura el 100% de los expedientes de evaluación docente manteniendo las restricciones de confidencialidad.
- **Riesgo de Regresión:** Bajo.
- **Dependencias:** `createSystemBackup`, `restoreSystemBackup`.

---

### ORDEN DE EJECUCIÓN RECOMENDADO FASE 13 (SUPERVISIÓN DOCENTE Y CALIDAD)

| Orden | Tarea | Prioridad | Dependencia principal |
| :---: | :--- | :---: | :--- |
| **1** | **T-SUP-01.** Control de concurrencia transaccional con LockService | **P1** | `saveSupervisionObservation` / `LockService` |
| **2** | **T-SUP-02.** Confidencialidad granular y aislamiento RBAC de evaluaciones | **P1** | `assertRecordOwnership` / RBAC |
| **3** | **T-SUP-03.** Módulo estructurado de jornalizaciones, sílabos y planes de clase | **P1** | `teacher-dashboard.html` / UI |
| **4** | **T-SUP-04.** Ciclo de vida de entrega, revisión, aprobación y devolución | **P1** | `JornalizacionesDocentes` |
| **5** | **T-SUP-05.** Módulo de suplencias docentes y delegación de permisos | **P1** | `ROLE_PERMISSIONS` |
| **6** | **T-SUP-06.** Rúbricas configurables multicriterio para observaciones | **P2** | `saveSupervisionObservation` |
| **7** | **T-SUP-07.** Planes de mejora pedagógica con alertas de fechas objetivo | **P2** | `PlanesMejoraPedagogica` |
| **8** | **T-SUP-08.** Bitácora diaria de clases impartidas y avance curricular | **P2** | `SesionesAsistencia` |
| **9** | **T-SUP-09.** Supervisión de carga horaria docente y prevención de solapamientos | **P2** | `HorariosClases` |
| **10** | **T-SUP-10.** Inalterabilidad de evaluaciones en períodos cerrados | **P2** | `CierresPeriodos` |
| **11** | **T-SUP-11.** Búsqueda avanzada y centro de control de supervisión docente | **P2** | `teacher-dashboard.html` / UI |
| **12** | **T-SUP-12.** Integración entre asistencia docente y suplencias | **P2** | `HorariosLaborales` |
| **13** | **T-SUP-13.** Dashboard consolidado de indicadores de calidad educativa | **P3** | Universal Chart Engine |
| **14** | **T-SUP-14.** Exportación oficial de Ficha de Evaluación Docente PDF | **P3** | `generateSchoolDocument` |
| **15** | **T-SUP-15.** Conciliación entre observaciones y planes de mejora | **P3** | Reconciliation Engine |
| **16** | **T-SUP-16.** Respaldo integral e inmutable de registros de supervisión | **P3** | `createSystemBackup` |
