# Plataforma de Gestión Educativa (PWA)

## 1. Arquitectura General

Esta plataforma es una **Aplicación Web Progresiva (PWA)** diseñada para la gestión de tareas y exámenes en un entorno educativo. Su arquitectura sigue un modelo de **microservicios**, donde el frontend (una aplicación de una sola página - SPA) se comunica con servicios de backend independientes desplegados en **Google Apps Script**.

- **Frontend**: Construido con HTML, CSS (Tailwind CSS) y JavaScript puro. Se encarga de toda la lógica de la interfaz de usuario, la gestión de sesiones de usuario (a través de `localStorage`) y las llamadas a los microservicios del backend.
- **Backend**: Compuesto por tres microservicios independientes, cada uno desplegado como un proyecto de Google Apps Script. Esta separación permite un desarrollo, despliegue y mantenimiento desacoplado.
  - **Servicio de Usuarios**: Gestiona la autenticación y el registro.
  - **Servicio de Tareas**: Gestiona la creación, asignación, entrega y calificación de tareas.
  - **Servicio de Exámenes**: Gestiona la creación, realización y calificación de exámenes.
- **Persistencia de Datos**:
  - **Google Sheets**: Actúa como la base de datos principal, almacenando toda la información estructurada (usuarios, tareas, entregas, etc.).
  - **Google Drive**: Se utiliza para el almacenamiento de archivos no estructurados, como las entregas de tareas de los estudiantes.

El flujo de comunicación es siempre iniciado por el cliente. El frontend envía solicitudes `POST` a la URL del microservicio correspondiente, que procesa la solicitud, interactúa con Google Sheets o Drive, y devuelve una respuesta en formato JSON.

---

## 2. Estructura del Repositorio

El repositorio está organizado de la siguiente manera para separar claramente las responsabilidades del frontend y el backend.

```
/
├── backend/
│   ├── user-service/
│   │   └── Code.gs         # Microservicio de Usuarios
│   ├── task-service/
│   │   └── Code.gs         # Microservicio de Tareas
│   └── exam-service/
│       └── Code.gs         # Microservicio de Exámenes
│
├── css/
│   ├── styles.css          # Estilos CSS generales
│   └── exam-manager.css    # Estilos específicos para el módulo de exámenes
│
├── js/
│   ├── config.js           # Configuración de URLs de microservicios
│   ├── auth.js             # Lógica de login y registro
│   ├── student.js          # Lógica para el dashboard del estudiante
│   ├── teacher.js          # Lógica para el dashboard del profesor
│   └── exam-manager.js     # Lógica consolidada para todo el ciclo de vida de los exámenes
│
├── exam-manager.html       # Vista única para tomar, ver y calificar exámenes
├── ... (otros archivos .html)
│
└── README.md               # Este documento
```

- **`backend/`**: Contiene los microservicios. Cada subcarpeta es un proyecto de Google Apps Script independiente y autocontenido.
- **`css/`**: Almacena hojas de estilo. `exam-manager.css` contiene estilos exclusivos del módulo de exámenes.
- **`js/`**: Contiene la lógica del frontend. `exam-manager.js` es el nuevo controlador para todo lo relacionado con exámenes.
  - `config.js` es crítico, ya que define los puntos de entrada para cada microservicio.
- **Archivos `.html`**: Definen la estructura de la interfaz de usuario. `exam-manager.html` es el nuevo punto de entrada para todas las vistas de exámenes.

---

## 3. Backend (Microservicios)

Cada servicio es un proyecto de Google Apps Script autocontenido.

### 3.1. Servicio de Usuarios (`user-service`)

- **Propósito**: Gestionar la identidad y autenticación de los usuarios.
- **Dependencias**: Google Sheets (`Usuarios`).

#### Endpoints

El servicio expone un único `doPost` que actúa como enrutador para las siguientes acciones:

| Acción | `action` | Payload | Flujo de Proceso | Respuesta Exitosa |
| :--- | :--- | :--- | :--- | :--- |
| **Registrar Usuario** | `registerUser` | `{nombre, grado, seccion, email, password}` | 1. Valida que los campos no estén vacíos.<br>2. Genera un `userId` único.<br>3. Hashea la contraseña con SHA-256.<br>4. Añade una nueva fila a la hoja `Usuarios`. | `{status: "success", message: "Usuario registrado."}` |
| **Iniciar Sesión** | `loginUser` | `{email, password}` | 1. Valida que los campos no estén vacíos.<br>2. Hashea la contraseña proporcionada.<br>3. Itera sobre la hoja `Usuarios` buscando una coincidencia de email y contraseña hasheada.<br>4. Si encuentra coincidencia, devuelve los datos del usuario. | `{status: "success", data: {userId, nombre, grado, seccion, rol}}` |

### 3.2. Servicio de Tareas (`task-service`)

- **Propósito**: Gestionar el ciclo de vida completo de las tareas, desde su creación hasta su calificación.
- **Dependencias**: Google Sheets (`Tareas`, `Entregas`, `Usuarios`), Google Drive.

#### Endpoints

| Acción | `action` | Payload | Flujo de Proceso | Respuesta Exitosa |
| :--- | :--- | :--- | :--- | :--- |
| **Crear Tarea** | `createTask` | `{titulo, tipo, ...}` | 1. Genera un `tareaId` único.<br>2. Añade una nueva fila a la hoja `Tareas` con los detalles proporcionados. | `{status: "success", message: "Tarea creada."}` |
| **Obtener Tareas de Estudiante** | `getStudentTasks` | `{userId, grado, seccion}` | 1. Lee todas las `Tareas` y `Entregas`.<br>2. Filtra las tareas que corresponden al grado/sección del estudiante.<br>3. Para cada tarea, busca si existe una entrega asociada a ese `userId`.<br>4. Devuelve una lista combinada de tareas con su estado de entrega. | `{status: "success", data: [...]}` |
| **Entregar Tarea** | `submitAssignment`| `{userId, tareaId, fileData, ...}` | 1. Busca los datos del usuario y la tarea.<br>2. Crea una jerarquía de carpetas en Google Drive: `Grado/Sección/Nombre Alumno/Parcial/Asignatura`.<br>3. Decodifica el archivo (`base64`) y lo guarda en la carpeta correspondiente.<br>4. Añade una nueva fila a la hoja `Entregas` con la URL del archivo y estado "Pendiente". | `{status: "success", message: "Tarea entregada."}` |
| **Calificar Tarea** | `gradeSubmission`| `{entregaId, calificacion, estado, comentario}` | 1. Busca la fila correspondiente en la hoja `Entregas` por `entregaId`.<br>2. Actualiza las columnas de calificación, estado y comentario. | `{status: "success", message: "Calificación actualizada."}` |
| **Obtener Actividad (Profesor)** | `getTeacherActivity`| `{}` | 1. Lee `Usuarios`, `Tareas` y `Entregas`.<br>2. Realiza un "join" en el script para combinar los datos y obtener nombres de alumnos y títulos de tareas.<br>3. Devuelve una lista de todas las entregas de tareas con información enriquecida. | `{status: "success", data: [...]}` |

### 3.3. Servicio de Exámenes (`exam-service`)

- **Propósito**: Gestionar el ciclo de vida de los exámenes.
- **Dependencias**: Google Sheets (`Examenes`, `PreguntasExamen`, `EntregasExamen`, `Usuarios`).

#### Endpoints

| Acción | `action` | Payload | Flujo de Proceso | Respuesta Exitosa |
| :--- | :--- | :--- | :--- | :--- |
| **Crear Examen** | `createExam` | `{titulo, preguntas, ...}` | 1. Genera un `examenId` único y lo guarda en la hoja `Examenes`.<br>2. Itera sobre la lista de preguntas, generando un `preguntaId` para cada una y guardándolas en la hoja `PreguntasExamen`. | `{status: "success", message: "Examen creado."}` |
| **Obtener Preguntas** | `getExamQuestions`| `{examenId}` | 1. Busca los detalles del examen en la hoja `Examenes`.<br>2. Filtra la hoja `PreguntasExamen` para obtener todas las preguntas asociadas a ese `examenId`.<br>3. Devuelve los detalles del examen y su lista de preguntas. | `{status: "success", data: {titulo, tiempoLimite, preguntas: [...]}}` |
| **Entregar Examen**| `submitExam` | `{examenId, userId, respuestas, estado}` | 1. Obtiene las respuestas correctas de la hoja `PreguntasExamen`.<br>2. Compara las respuestas del estudiante con las correctas y calcula una calificación.<br>3. Guarda el resultado, la calificación y el estado en la hoja `EntregasExamen`. | `{status: "success", data: {calificacionTotal, resultados: [...]}}` |
| **Reactivar Examen**| `reactivateExam`| `{entregaExamenId}` | 1. Busca la entrega en `EntregasExamen` por su ID.<br>2. Cambia el estado de la entrega a "Reactivado". | `{status: "success", message: "Examen reactivado."}` |
| **Obtener Actividad de Exámenes** | `getTeacherExamActivity`| `{}` | 1. Similar a su contraparte de tareas, lee `Usuarios`, `Examenes` y `EntregasExamen`.<br>2. Combina los datos para devolver una lista enriquecida de todas las entregas de exámenes. | `{status: "success", data: [...]}` |

---

## 4. Persistencia de Datos

### 4.1. Google Sheets

La hoja de cálculo con ID `1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww` es la base de datos de la aplicación.

<details>
<summary><strong>Estructura Detallada de Hojas</strong></summary>

**Hoja: `Usuarios`**
| Columna | Nombre | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| A | `userId` | `String` | ID único del usuario (ej. `USR-167...`). |
| B | `nombre` | `String` | Nombre completo. |
| C | `grado` | `String` | Grado del estudiante. |
| D | `seccion` | `String` | Sección del estudiante. |
| E | `email` | `String` | Correo para login. |
| F | `password` | `String` | Contraseña hasheada (SHA-256). |
| G | `rol` | `String` | "Estudiante" o "Profesor". |

**Hoja: `Tareas`**
| Columna | Nombre | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| A | `tareaId` | `String` | ID único de la tarea (ej. `TSK-167...`). |
| B | `tipo` | `String` | "Tarea" o "Credito Extra". |
| C | `titulo` | `String` | Título. |
| D | `descripcion` | `String` | Descripción. |
| E | `parcial` | `String` | Parcial al que corresponde. |
| F | `asignatura` | `String` | Asignatura. |
| G | `gradoAsignado`| `String` | Grado objetivo. |
| H | `seccionAsignada`| `String` | Sección objetivo (vacío para todas). |
| I | `fechaLimite` | `Date` | Fecha límite. |
| J | `tareaOriginalId`| `String` | Para "Credito Extra", ID de la tarea rechazada. |

**Hoja: `Entregas`**
| Columna | Nombre | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| A | `entregaId` | `String` | ID único de la entrega (ej. `ENT-167...`). |
| B | `tareaId` | `String` | Clave foránea a `Tareas`. |
| C | `userId` | `String` | Clave foránea a `Usuarios`. |
| D | `fechaEntrega`| `Date` | Timestamp de la entrega. |
| E | `fileUrl` | `String` | URL del archivo en Google Drive. |
| F | `calificacion`| `Number` | Nota asignada. |
| G | `estado` | `String` | "Pendiente", "Revisada", "Rechazada". |
| H | `comentario` | `String` | Feedback del profesor. |

**Hoja: `Examenes`**
| Columna | Nombre | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| A | `examenId` | `String` | ID único del examen (ej. `EXM-167...`). |
| B-G | ... | ... | Campos análogos a la hoja `Tareas`. |

**Hoja: `PreguntasExamen`**
| Columna | Nombre | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| A | `preguntaId` | `String` | ID único de la pregunta. |
| B | `examenId` | `String` | Clave foránea a `Examenes`. |
| C | `preguntaTipo` | `String` | "opcion_multiple", "completacion", etc. |
| D | `textoPregunta` | `String` | Enunciado. |
| E | `opciones` | `String` | JSON con las opciones. |
| F | `respuestaCorrecta`| `String` | Respuesta correcta. |

**Hoja: `EntregasExamen`**
| Columna | Nombre | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| A | `entregaExamenId`| `String` | ID único de la entrega. |
| B | `examenId` | `String` | Clave foránea a `Examenes`. |
| C | `userId` | `String` | Clave foránea a `Usuarios`. |
| D | `fechaEntrega`| `Date` | Timestamp de finalización. |
| E | `resultados` | `String` | JSON con las respuestas del estudiante. |
| F | `calificacionTotal`| `Number` | Nota final (0-100). |
| G | `estado` | `String` | "Entregado", "Bloqueado", "Reactivado". |

</details>

### 4.2. Google Drive

- **ID de la Carpeta Raíz**: `1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB`
- **Estructura Jerárquica**: Los archivos de las entregas de tareas se organizan automáticamente en la siguiente estructura para facilitar su localización:
  ```
  [Carpeta Raíz]
  └── [Grado]
      └── [Sección]
          └── [Nombre del Alumno]
              └── [Parcial]
                  └── [Asignatura]
                      └── [Archivo de la tarea]
  ```
- **Convención de Nombres**: El archivo subido se renombra con el título de la tarea a la que corresponde.

---

## 5. Frontend

El frontend es una aplicación cliente que consume los microservicios.

- **`config.js`**: Punto central de configuración. Define el objeto `SERVICE_URLS` que mapea cada servicio (`USER`, `TASK`, `EXAM`) a su URL de despliegue en Google Apps Script. **Es el único lugar que se debe modificar al desplegar los servicios**.
- **`auth.js`**: Maneja los formularios de `login.html` y `register.html`. Se comunica exclusivamente con el **microservicio de usuarios**. Tras un login exitoso, guarda los datos del usuario en `localStorage` y redirige al dashboard correspondiente.
- **`teacher.js`**: Controla el `teacher-dashboard.html`.
  - **Creación**: Llama al servicio de `TASK` para crear tareas y al de `EXAM` para crear exámenes.
  - **Visualización**: Para mostrar la lista de actividades, llama a los servicios de `TASK` y `EXAM` para obtener todas las entregas y actividades base.
  - **Enlace a Calificación**: Renderiza los enlaces para que el profesor pueda acceder al nuevo módulo de calificación de exámenes en `exam-manager.html`.
- **`student.js`**: Controla el `student-dashboard.html`. Llama a los servicios `TASK` y `EXAM` para obtener las actividades del estudiante y renderiza un enlace a `exam-manager.html` para realizar un examen.
- **`exam-manager.js`**: Es el nuevo controlador central para todo el ciclo de vida de un examen. Gestiona `exam-manager.html` y se comunica exclusivamente con el **microservicio de exámenes**.
  - **Para Estudiantes**: Maneja la obtención de preguntas (`getExamQuestions`) y el envío de respuestas (`submitExam`).
  - **Para Profesores**: Maneja la obtención de la lista de entregas (`getExamSubmissions`), la visualización de los detalles de una entrega (`getSubmissionDetails`) y el envío de la calificación (`gradeSubmission`).

---

## 6. Despliegue

El despliegue de la plataforma se realiza en dos partes:

### 6.1. Frontend

El frontend es estático y está alojado en GitHub Pages. Cualquier cambio en la rama principal se despliega automáticamente.

### 6.2. Backend (Microservicios)

Cada microservicio debe ser desplegado **de forma independiente**.

1. **Crear Proyecto**: Por cada carpeta en `backend/`, crea un nuevo proyecto en Google Apps Script.
2. **Copiar Código**: Copia el contenido del archivo `Code.gs` de la carpeta local al proyecto en la nube.
3. **Desplegar**:
   - Haz clic en **"Implementar" > "Nueva implementación"**.
   - Elige el tipo **"Aplicación web"**.
   - Asegúrate de que **"Quién tiene acceso"** esté configurado como **"Cualquiera"**.
4. **Configurar URL**:
   - Copia la URL de la aplicación web que te proporciona Google.
   - Pégala en el objeto `SERVICE_URLS` dentro de `js/config.js` en la propiedad correspondiente.
5. **Repetir**: Repite este proceso para los tres microservicios.

---

## 7. Portal Público de Contenidos

Además del portal de gestión PWA, el sitio cuenta con una sección pública de contenidos estáticos accesibles para cualquier visitante.

### 7.1. Arquitectura del Contenido

- **Punto de Entrada**: `index.html` es la página principal. Contiene la navegación y la estructura para cargar dinámicamente el contenido y las actividades.
- **Generación de Contenido**: El contenido no está hardcodeado en el HTML. Se define en tres objetos JavaScript dentro de `index.html`:
  - `presentationData`: Define la estructura del menú "Cursos", enlazando a presentaciones (`.html`).
  - `additionalResourcesData`: Define el menú "Recursos Adicionales", incluyendo artículos (`.html`) y actividades interactivas.
  - `downloadContentData`: Define el contenido de la sección "Contenido de Clases", enlazando a archivos descargables (`.pdf`).
- **Organización de Carpetas**: El contenido educativo está organizado jerárquicamente por grado y asignatura para facilitar su mantenimiento. Ejemplo:
  - `Decimo_Info_Apli/`: Contiene los materiales para la clase de Informática Aplicada de Décimo Grado.
  - `II_BTP_A/analisis_diseno/`: Materiales para Análisis y Diseño de II de BTP.

### 7.2. Tipos de Contenido

- **Temas de Clases y Presentaciones**:
  - **Formato**: Son archivos `.html` que actúan como presentaciones interactivas o páginas de contenido.
  - **Ubicación**: Se encuentran dentro de las carpetas de cada asignatura, como `Informatica_I/historia_computacion.htm`.
  - **Acceso**: Se acceden a través del menú de navegación "Cursos". La estructura de este menú se genera a partir del objeto `presentationData` en `index.html`.

- **Zona de Descargas**:
  - **Formato**: Son principalmente archivos `.pdf` y `.docx` que sirven como guías de estudio, hojas de trabajo o versiones descargables de las presentaciones.
  - **Ubicación**: Al igual que las presentaciones, están en las carpetas de las asignaturas.
  - **Acceso**: Se acceden a través de la sección "Contenido de Clases" en `index.html`. El menú se genera a partir del objeto `downloadContentData`.

- **Artículos**:
  - **Formato**: Son archivos `.html` diseñados para ser leídos como artículos informativos.
  - **Ubicación**: Típicamente dentro de las carpetas de asignaturas.
  - **Acceso**: Se enlazan desde el menú "Recursos Adicionales", definido por el objeto `additionalResourcesData`.

- **Zona de Actividades (Juegos)**:
  - **Propósito**: Ofrecer herramientas interactivas para reforzar el aprendizaje de una manera lúdica.
  - **Ubicación**: Centralizados en la carpeta `juegos/`.
  - **Actividades Disponibles**:
    - **`perifericos.html`**: Un juego para clasificar periféricos de computadora como dispositivos de entrada, salida o mixtos.
    - **`webmaster_quiz.html`**: Un cuestionario sobre conceptos de desarrollo y cultura web.
    - **`destreza_teclado.html`**: Una actividad para practicar y medir la velocidad y precisión al teclear.
  - **Acceso**: Se cargan dinámicamente en la página principal a través de los menús "Recursos Adicionales" o "Actividades Prácticas".
