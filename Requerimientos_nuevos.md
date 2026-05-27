# DOCUMENTO DE REQUERIMIENTOS Y ESPECIFICACIONES TÉCNICAS
## Portal Estudiantil, Docente y Plataforma Educativa Integrada
Este documento consolida, organiza y detalla todos los requerimientos funcionales, no funcionales y técnicos para la optimización y reestructuración del portal educativo. Se eliminaron contradicciones del material de origen y se agruparon las directivas por módulos lógicos para guiar el desarrollo sin ambigüedades.
## 1. SISTEMA DE AUTENTICACIÓN, PERFILES Y ACCESO GLOBAL
### 1.1 Autenticación Unificada y Flujo de Navegación
 * **Acceso desde el Index:** El inicio de sesión se centraliza de manera global desde la página de inicio (index), abarcando toda la plataforma web.
 * **Roles y Permisos:** Una vez iniciada la sesión, el sistema redirige y adapta dinámicamente los módulos, accesos y visualizaciones según el rol del usuario (Estudiante o Profesor).
 * **Acceso Público (Modo Invitado):**
   * Los usuarios sin autenticar pueden navegar por la información pública del portal, el contenido general de la landing page y ejecutar los minijuegos.
   * **Restricción:** No tendrán acceso a material descargable, presentaciones de cursos ni material exclusivo para estudiantes registrados.
   * Al iniciar un minijuego en modo invitado, el sistema debe mostrar un mensaje consultando al usuario si desea iniciar sesión para poder registrar su progreso, récords y logros.
### 1.2 Recuperación de Contraseñas
 * **Formulario de Solicitud:** Opción visible en la interfaz de login para solicitar restablecimiento.
 * **Flujo Automático:** Envío automático de correo electrónico al correo del estudiante con un enlace seguro y token de expiración temporal.
 * **Pantallas de Confirmación:** Formulario seguro para ingresar y confirmar la nueva contraseña una vez que se accede mediante el enlace del correo.
### 1.3 Módulo Común de Gestión de Perfil ("Mi Perfil")
Tanto el portal estudiantil como el docente deben incorporar un botón visible ("Mi Perfil") en la barra superior o menú de navegación para abrir un modal o vista dedicada con las siguientes directivas:
 * **Campos Editables:** Nombre, Correo Electrónico y Número de Teléfono.
 * **Cambio de Contraseña Seguro:** Requiere validar la contraseña actual, ingresar la nueva contraseña y confirmar la nueva contraseña (con validación de longitud mínima y caracteres seguros).
 * **Validaciones Obligatorias de Frontend y Backend:** Ningún campo puede enviarse vacío; validación en tiempo real de formato de correo electrónico y normalización de número telefónico.
 * **Sincronización:** Los cambios deben impactar de inmediato en la base de datos para actualizar los reportes, el dashboard del docente, las estadísticas y los mensajes de bienvenida.
## 2. PORTAL DE INICIO (INDEX PRINCIPAL)
El portal de inicio debe ser rediseñado parcialmente de forma adaptativa sin alterar la paleta de colores actual, el hero principal, los logos, iconos ni la identidad visual. Debe integrar los siguientes contenedores estructurados de forma responsiva:
 1. **Mensaje de Bienvenida:** Saludo personalizado utilizando el primer nombre del usuario autenticado (ej. *"Bienvenido, Carlos"*). Si es invitado, muestra un saludo genérico e invitación a loguearse.
 2. **Sección de Noticias Dinámicas:**
   * Visualiza la noticia más reciente en primer lugar.
   * Muestra: Título, la primera imagen destacada, el primer párrafo del contenido, la fecha y la hora de publicación.
   * Las noticias se cargan automáticamente desde una hoja de Google Spreadsheet llamada **NoticiasPortal**.
   * **Conversor de Google Drive:** Incorporar una función que detecte enlaces de imágenes compartidas en Google Drive y los transforme automáticamente en un enlace directo directo para su renderizado óptimo en etiquetas <img>.
 3. **Contenedor de Descargas:** Segmentado por grado y sección. El estudiante solo verá material descargable correspondiente a su curso.
 4. **Contenedor de Cursos:** Módulos de aprendizaje, diapositivas y presentaciones didácticas filtradas estrictamente según las asignaturas asignadas al grado del alumno.
 5. **Contenedor de Actividades:** Enlaces directos a minijuegos y actividades interactivas de la plataforma.
## 3. PORTAL DEL ESTUDIANTE (DASHBOARD)
### 3.1 Estructura y Navegación
 * Se conserva la estructura actual de organización de asignaturas distribuidas por Parcial.
 * Acceso directo al botón **"Mi Perfil"** y al botón dinámico de **"Grupo de WhatsApp"**.
### 3.2 Botón Dinámico de Grupo de WhatsApp por Grado
 * **Lógica de Asignación:** El enlace del grupo está asociado al **Grado** del estudiante (Décimo, Undécimo, Duodécimo, etc.) y no al parcial.
 * **Comportamiento:**
   * Si existe un enlace válido registrado en la hoja de cálculo para el grado del estudiante, el botón estará habilitado y redirigirá al enlace de invitación del grupo de WhatsApp.
   * Si no se ha configurado un enlace para su grado, el botón aparecerá deshabilitado o mostrará un mensaje descriptivo: *"Grupo no disponible para tu grado actualmente"*.
### 3.3 Optimizador de Subida Múltiple de Imágenes
Reemplazar el sistema de carga básico por un módulo de alta fidelidad para el envío de evidencias/tareas con las siguientes especificaciones:
 * **Selección Múltiple Nactiva:** Permitir seleccionar varias imágenes en simultáneo desde galerías móviles (iOS, Android, HarmonyOS) o exploradores de archivos tradicionales.
 * **Cola de Carga Secuencial:** Procesar y subir las imágenes una por una para evitar la saturación de red, manteniendo el orden original de selección.
 * **Indicador de Progreso Visual:** Barra de carga o estado individual para cada imagen en la cola (ej. *Subiendo... / En espera... / Completada / Error*).
 * **Vistas Previas Temporales (Miniaturas):** Renderizado de previews compactas antes de proceder con el envío definitivo de la tarea.
 * **Eliminación Individual:** Botón interactivo sobre cada miniatura para retirar la imagen de la cola de subida inmediatamente antes del envío.
 * **Filtro Anti-Duplicados:** Validar el nombre del archivo, peso, fecha de modificación y hash rápido para impedir subir dos veces el mismo archivo.
 * **Gestión de Errores Individuales:** Si falla la carga de un archivo, la operación global no debe abortarse; se debe destacar la miniatura con error y proveer la opción de "reintentar" solo para ese archivo.
 * **Optimización Móvil:** Compresión automática de imágenes pesadas en el frontend previo a la subida para evitar congelamientos de memoria y acelerar la transferencia de datos.
### 3.4 Carga de Archivos de Mayor Escala y Formatos Técnicos
 * **Carga de PDF:** Habilitar la subida de archivos PDF con un límite superior extendido de **hasta 50 MB**.
 * **Archivos Técnicos soportados:** Permitir la subida de archivos correspondientes a materias de programación con extensiones y validaciones mime-type para:
   * Pseudocódigo (archivos de texto o formatos compatibles de PSeInt)
   * HTML (.html)
   * JavaScript (.js)
   * CSS (.css)
### 3.5 Control de Estados de Tarea
Las tareas del estudiante pasarán por los siguientes estados dentro de su portal:
 * **Pendiente de revisión:** Enviada por el alumno, a la espera de la corrección del profesor.
 * **Rechazada:** No cumple con los criterios mínimos de evaluación.
 * **Completada:** Tarea aprobada.
 * **Tarea incompleta:** * *Comportamiento especial:* El estudiante tiene la facultad de reaccionar a este estado subiendo únicamente la parte pendiente de la tarea a través de imágenes adicionales, o bien, si lo prefiere, reescribir y volver a subir el archivo/tarea completo.
## 4. PORTAL DEL DOCENTE (DASHBOARD)
### 4.1 Reorganización Estructural Obligatoria
Queda terminantemente prohibido mezclar la operativa de evaluación con la visualización de reportes históricos. El dashboard del profesor se divide estrictamente en dos secciones principales y un menú lateral:
```
[MENÚ PRINCIPAL DOCENTE]
 ├── 1. Entregas (Operativo - Pantalla de Inicio por defecto)
 ├── 2. Reportes (Académico - Tabla Completa y Exportación a Excel)
 ├── 3. Tareas (Creación y Gestión de Actividades/Exámenes)
 └── 4. Noticias (Módulo de creación)
```
### 4.2 Sección 1: "Entregas" (Operativo)
Esta es la vista inicial por defecto del profesor. **Se elimina por completo el panel de estadísticas superiores con los contadores de "Tareas entregadas, rechazadas y completadas"** (para evitar redundancias y bugs del sistema).
 * **Jerarquía de Navegación Obligatoria:** El flujo de selección para filtrar los datos debe seguir obligatoriamente esta secuencia de pasos:
   
 * **Lista de Alumnos (Vista Final):** Muestra una tabla con las columnas:
   * Nº Lista
   * Nombre del Alumno
   * Estado de Tareas del Parcial (Indicadores de colores suaves para: *Pendiente de revisión*, *Al día*, *Rechazada*, *Incompleta*, *Completada*)
   * Botón "Ver detalles"
 * **Modal Dinámico de Detalle del Alumno:**
   Al pulsar sobre el nombre del alumno o en "Ver detalles", se despliega un modal que muestra:
   * Únicamente las tareas entregadas que pertenezcan a la **asignatura actual** y al **parcial actual** seleccionado en la navegación jerárquica.
   * *Restricción:* Queda bloqueada la visualización de tareas de otras asignaturas o parciales dentro de este modal operativo.
   * **Panel de Calificación y Feedback:** Herramientas para actualizar el estado de la tarea (Pendiente, Rechazada, Incompleta, Completada).
### 4.3 Sección 2: "Reportes"
Esta sección unifica la visualización académica en tiempo real con la herramienta de exportación. Reemplaza la lógica previa de contadores individuales.
 * **Generación Mediante Filtros:** El profesor selecciona el Grado, la Sección, el Parcial y la Asignatura mediante menús desplegables para cargar dinámicamente la tabla.
 * **Estructura de la Tabla Académica:**
   La tabla en pantalla debe verse exactamente idéntica al formato clásico de libreta escolar o reporte de hoja de cálculo:

| Nº Lista | Nombre del Alumno | Tarea 1 | Tarea 2 | Tarea 3 | ... | Total Parcial |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Alvarado, Ana | 10 | 9 | 10 | ... | 95% (Aprobado) | <br> * **Funcionalidades de Interfaz:** <br> * Ordenamiento de columnas alfabético (A-Z, Z-A) y numérico con un solo clic. <br> * Scroll horizontal fluido y adaptado a dispositivos móviles para no romper el layout. <br> * **Exportación a Excel:** Botón "Exportar Excel" que genera de forma idéntica un archivo descargable con el mismo formato, estructura, orden y distribución de columnas mostrados en pantalla. <br> ### 4.4 Sección 3: "Tareas" (Gestión de Actividades y Exámenes) <br> Centraliza la administración de actividades evaluativas de la clase. <br> * **Opciones principales:** Botón de creación de Nueva Tarea y de Creación de Exámenes. <br> * **Editor de Texto Enriquecido Profesional:** El campo de descripción para tareas o exámenes debe incorporar un editor HTML visual enriquecido, optimizado y compacto: <br> * *Formato de texto:* Negrita (bold), Cursiva (italic), Subrayado (underline) y Tachado (strikethrough). <br> * *Tipografías y Tamaños:* Selector de fuentes nativas compatibles y tamaños de texto estandarizados. <br> * *Colores:* Selector de paleta y color de texto nativo. <br> * *Listas:* Listas ordenadas (numéricas) y desordenadas (viñetas). <br> * *Inserciones:* Enlaces web, inserción de imágenes mediante URL y saltos de línea automáticos optimizados. <br> * *Estética:* Diseño responsive para pantallas táctiles y botones pequeños de control. <br> * *Visualización:* Los estudiantes deben renderizar el texto final exactamente con el mismo diseño y formato HTML que el profesor diseñó. <br> ### 4.5 Panel de Tareas Entregadas - Integración con WhatsApp <br> Para agilizar la comunicación docente-estudiante, cada registro de tarea entregada por revisar mostrará una tarjeta informativa del alumno que incluye: <br> * Nombre del Estudiante <br> * Número de Lista, Correo Electrónico y Número de Teléfono. <br> * **Botón de WhatsApp Directo:** Junto al número de teléfono se integrará un botón circular pequeño con el color e icono oficial de WhatsApp. <br> * *Formato del enlace dinámico:* https://wa.me/504XXXXXXXX <br> * *Lógica:* El prefijo de Honduras (504) se debe anteponer de forma automática. El sistema debe sanitizar previamente el string del teléfono de la base de datos eliminando guiones, espacios en blanco o caracteres especiales antes de construir la URL. Se abrirá en una pestaña nueva (target="_blank"). <br> ### 4.6 Gestión de Grupos de WhatsApp <br> * Ubicación: Se integra en la sección de administración del profesor. <br> * **Lógica de Registro:** Campo de texto (input) de solo lectura acompañado de un botón "Editar enlace". Al presionarlo se desbloquea el campo para pegar el link del grupo. Al presionar "Guardar" se valida la estructura del link y se almacena en la hoja **GruposWhatsApp** vinculándolo al Grado seleccionado. <br> ### 4.7 Módulo de Creación de Noticias <br> Formulario dentro del portal docente para publicar en la página de inicio: <br> * **Campos:** Título de la noticia, fecha de publicación, hora de publicación, cuerpo del mensaje (mediante editor de texto enriquecido) e imágenes. <br> * **Carga de Imágenes Directa a Drive:** Al cargar una imagen dentro del gestor de noticias, esta se enviará a la carpeta designada de Google Drive, retornará el ID del archivo y lo convertirá en un enlace de visualización pública directa, guardándolo en el spreadsheet de noticias cronológicamente. <br> ## 5. ENTORNO INTERACTIVO DE PSEUDOCÓDIGO (pseudocode.html) <br> Este módulo provee la infraestructura completa para la práctica de programación básica de forma integrada. Su desarrollo e implementación debe respetar estrictamente el código preexistente y funcional del sistema, sin provocar pérdidas en la compatibilidad de versiones anteriores. <br> ### 5.1 Entorno de Escritura y Menús <br> * **Barra de Herramientas Superior:** Desarrollo total de la lógica para que sean completamente operativos los menús desplegables de: <br> * **Archivo:** Nuevo, Abrir, Guardar como, Exportar código (a HTML, JS). <br> * **Editar:** Deshacer, Rehacer, Copiar, Cortar, Pegar, Buscar y Reemplazar. <br> * **Ver:** Zoom, mostrar u ocultar líneas de comando, panel de variables. <br> * **Ejecutar:** Ejecución rápida, Ejecución paso a paso, detener simulación. <br> * **Herramientas:** Configuración del perfil de sintaxis, asistente de funciones. <br> * **Ayuda:** Documentación rápida, ejemplos prácticos de estructuras de control. <br> * **Menú Contextual:** Activación de un menú de clic derecho sobre el área de trabajo del editor con comandos rápidos de edición y formateo. <br> ### 5.2 Compatibilidad con Perfiles de Estilo (PSeInt) <br> El motor de interpretación debe ajustarse dinámicamente según tres perfiles de configuración seleccionables en el editor: <br> 1. **Modo Estricto:** Exige punto y coma al final de cada línea, declaración obligatoria de variables (Definir variable Como Tipo), tipado fuerte y concordancia exacta en las estructuras de control. <br> 2. **Modo Flexible:** Permite omitir puntos y comas, realizar tipado dinámico implícito al asignar valores y flexibilidad en la nomenclatura de palabras clave. <br> 3. **Modo Personalizado:** El estudiante o profesor pueden configurar de forma selectiva las reglas gramaticales y sintácticas aceptadas. <br> ### 5.3 Simulador, Intérprete y Estructuras de Datos <br> * **Ejecutor de Pseudocódigo:** Capaz de interpretar y procesar variables, asignaciones aritméticas, lógicas y estructuras condicionales (Si-Entonces, Segun) e iterativas (Mientras, Repetir, Para). <br> * **Estructuras de Control Avanzadas:** Capacidad para declarar y evaluar Funciones y Subprocesos con paso de parámetros por valor y por referencia. <br> * **Arreglos Dinámicos (Dimensiones):** Soporte completo para la declaración de matrices y vectores mediante la directiva Dimension. <br> * **Generador de Diagramas de Flujo:** Capacidad de graficar dinámicamente las estructuras secuenciales, iterativas y de dimensión declaradas en el código escrito. <br> * **Depurador de Sintaxis:** Terminal inferior para mostrar de forma detallada y comprensible los errores sintácticos y lógicos indicando la línea exacta del fallo y una sugerencia de solución. <br> ### 5.4 Almacenamiento Estudiantil Automático <br> * **Guardado Transparente:** Cada vez que el estudiante guarde o ejecute un proyecto en pseudocode.html, el sistema debe enviar de forma silenciosa el código a una carpeta privada e individual creada en el backend/drive con el identificador del alumno. <br> * **Visibilidad Docente:** El profesor podrá acceder a las carpetas de proyectos y previsualizar los archivos de pseudocódigo guardados de cada alumno desde la misma sección de detalles de entrega del estudiante en su Dashboard. <br> ## 6. INTEGRACIÓN Y OPTIMIZACIÓN DE MINIJUEGOS <br> Todos los minijuegos de la plataforma deben ser auditados y ajustados para responder a un estándar unificado de interacción y rendimiento gráfico: <br> ### 6.1 Lógica de Sincronización y Guardado <br> * **Récord Personal Inicial:** Al iniciar cualquier actividad o minijuego, se consultará la base de datos para mostrar de forma destacada el récord histórico personal del estudiante actual. <br> * **Visualización en Tiempo Real:** El panel de juego debe renderizar el puntaje en curso de manera fluida durante toda la partida. <br> * **Sincronización Automática:** Al concluir la partida, se enviará el resultado del juego para registrar de forma íntegra en la base de datos: <br> * Puntuación obtenida <br> * Récord superado (si aplica) <br> * Fecha y hora de la partida <br> * Usuario / Estudiante asociado <br> ### 6.2 Minijuego de Destreza en Teclado (Mecanografía) <br> Módulo específico con requerimientos de recolección de estadísticas de precisión: <br> * **KPM (Teclas por minuto):** Cálculo dinámico basado en la cantidad de pulsaciones correctas divididas por el tiempo de juego transcurrido. <br> * **Porcentaje de Precisión:** Relación matemática entre las teclas correctas versus las teclas erradas pulsadas por el usuario. <br> * **Puntaje Total:** Algoritmo ponderado combinando velocidad de tecleo (KPM) y precisión final. <br> ## 7. ESPECIFICACIONES TÉCNICAS, ARQUITECTURA Y AUDITORÍA <br> ### 7.1 Auditoría Técnica del Repositorio (Checklist de Corrección) <br> Se debe realizar una auditoría exhaustiva del repositorio del sistema atendiendo los siguientes puntos críticos: <br> * **Corrección de Error Crítico en Dashboard:** Resolver de inmediato el fallo en el panel del profesor que arroja: "Error: currentUser is not defined", garantizando la correcta inicialización del estado de autenticación (Context Provider o Auth Guard) previo al renderizado del componente. <br> * **Condiciones de Carrera en Subida Coincidente:** Desarrollar bloqueos temporales de interfaz y semáforos de base de datos para impedir duplicados en envíos paralelos o registros simultáneos de tareas. <br> * **Prevención de Archivos Corruptos:** Incluir sumas de comprobación en la subida secuencial para validar la integridad de imágenes y documentos PDF pesados (> 50MB). <br> * **Compatibilidad Móvil y PWA:** Realizar pruebas de rendimiento visual, almacenamiento caché de assets y soporte de gestos táctiles para la PWA bajo plataformas **iOS**, **Android** y **HarmonyOS**. <br> ### 7.2 Lógica del Almacenamiento en Google Sheets (Esquema de Tablas) <br> Para la interacción dinámica de datos compartidos, se estructurarán las siguientes hojas de cálculo en la hoja principal: <br> #### Hoja 1: GruposWhatsApp
| Columna | Tipo de Datos | Descripción |
| :--- | :--- | :--- |
| **Grado** | Texto (Clave Única) | Grado académico (e.g., "10", "11", "12") |
| **EnlaceGrupo** | Texto (URL) | Enlace de invitación oficial de WhatsApp |
| **FechaActualizacion** | Timestamp | Fecha y hora del último registro |
| **ProfesorAutor** | Texto | Identificador o nombre del docente que modificó el enlace | <br> #### Hoja 
