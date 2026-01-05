# Proyecto de Renovación de Plataforma Estudiantil

## 1. Resumen General

Este proyecto consiste en la creación de una plataforma web para la gestión de tareas estudiantiles. La plataforma estará dividida en dos experiencias de usuario distintas: una aplicación web progresiva (PWA) optimizada para dispositivos móviles y una versión de escritorio. El backend se apoyará completamente en los servicios de Google (Google Sheets, Google Drive y Apps Script) para una administración centralizada y de bajo costo.

## 2. Arquitectura Técnica

*   **Frontend (Móvil):** Aplicación Web Progresiva (PWA) enfocada en la experiencia del estudiante para el registro, inicio de sesión y subida de tareas.
*   **Frontend (Escritorio):** Interfaz web tradicional para una visualización más amplia de los contenidos, orientada tanto a estudiantes como a profesores.
*   **Backend:**
    *   **Microservicio de Carga:** Un script de Google Apps Script actuará como API para gestionar la subida de archivos.
    *   **Base de Datos:** Una hoja de cálculo de Google Sheets almacenará la información de los estudiantes, las tareas, las entregas y las calificaciones.
    *   **Almacenamiento de Archivos:** Una carpeta de Google Drive contendrá todos los archivos subidos por los estudiantes, organizados jerárquicamente.

---

## 3. Estructura de la Base de Datos (Google Sheets)

Para que la plataforma funcione correctamente, tu hoja de cálculo de Google Sheets debe contener las siguientes hojas con sus respectivas columnas. **Es crucial que los nombres de las hojas y las columnas sean exactamente como se describen a continuación.**

### **Hoja 1: `Usuarios`**

Esta hoja contendrá la información de todas las cuentas de la plataforma, tanto de estudiantes como de profesores.

| Columna | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `UserID` | Un identificador único para cada usuario. Se generará automáticamente. | `USR-1662588568` |
| `NombreCompleto` | El nombre y apellido del usuario. | `Ana Sofía Paredes` |
| `Email` | El correo electrónico que servirá como nombre de usuario para el login. | `ana.paredes@email.com` |
| `PasswordHash`| La contraseña del usuario, procesada con un algoritmo de hashing por seguridad. **Nunca guardes contraseñas en texto plano.** | `(valor generado por el sistema)` |
| `Rol` | Define los permisos del usuario. Debe ser `Estudiante` o `Profesor`. | `Estudiante` |
| `Grado` | El grado al que pertenece el estudiante. | `Décimo` |
| `Seccion` | La sección a la que pertenece el estudiante (opcional). | `A` |


### **Hoja 2: `Tareas`**

Esta hoja centralizará la gestión de todas las asignaciones académicas.

| Columna | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `TareaID` | Un identificador único para cada asignación. Se generará automáticamente. | `TSK-1662589123` |
| `Tipo` | El tipo de asignación. Valores posibles: `Tarea`, `Examen`, `Proyecto`, `CreditoExtra`, `Recuperacion`. | `Examen` |
| `Titulo` | El nombre de la asignación. | `Examen Parcial 1 - Biología` |
| `Descripcion` | Instrucciones detalladas para la asignación. | `Responder las 5 preguntas adjuntas.`|
| `FechaCreacion`| La fecha en que se creó la asignación (automático). Formato `dd/mm/aaaa`. | `07/09/2024` |
| `FechaLimite` | La fecha límite para la entrega. Formato `dd/mm/aaaa`. | `14/09/2024` |
| `GradoAsignado`| El grado al que se le asigna esta tarea. | `Décimo` |
| `SeccionAsignada` | La sección específica a la que se le asigna (puede dejarse en blanco para asignar a todas las secciones de un grado). | `A` |


### **Hoja 3: `Entregas`**

Esta hoja registrará cada archivo o respuesta que un estudiante envíe para una tarea.

| Columna | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `EntregaID` | Un identificador único para cada entrega. Se generará automáticamente. | `ENT-1662589456` |
| `TareaID` | El ID de la tarea a la que corresponde esta entrega (relaciona esta hoja con `Tareas`). | `TSK-1662589123` |
| `UserID` | El ID del estudiante que realiza la entrega (relaciona esta hoja con `Usuarios`). | `USR-1662588568` |
| `FechaEntrega` | La fecha y hora en que se realizó la entrega (automático). | `13/09/2024 14:30` |
| `EnlaceArchivo` | La URL pública al archivo subido en Google Drive. | `http://drive.google.com/...` |
| `RespuestaTexto`| El contenido de la respuesta para preguntas de tipo ensayo en un examen. | `La célula es la unidad...` |
| `Calificacion` | El estado de la entrega. Valores posibles: `Aprobada`, `Incompleta`, `Reprobada`, `Aprobada tardía`, `Pendiente`. | `Pendiente` |


### **Hoja 4: `Contenido`**

Esta hoja almacenará los recursos y materiales de la clase que no son tareas calificables.

| Columna | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `ContenidoID`| Un identificador único para cada recurso. Se generará automáticamente. | `CON-1662589987` |
| `Titulo` | El nombre del recurso. | `Presentación: El Sistema Solar` |
| `Descripcion`| Una breve descripción del contenido. | `Diapositivas de la clase del 05/09.` |
| `Tipo` | El tipo de contenido. Valores posibles: `Descargable`, `Presentacion`, `Actividad`. | `Presentacion` |
| `EnlaceRecurso`| La URL pública al recurso (puede ser un archivo en Drive, un video, etc.). | `http://drive.google.com/...` |
| `GradoAsignado`| El grado al que se le asigna este contenido. | `Décimo` |
| `SeccionAsignada`| La sección específica a la que se le asigna el contenido. | `A` |


### **Hoja 5: `ExamenPreguntas`**

Si una `Tarea` es de tipo `Examen`, sus preguntas se almacenarán aquí.

| Columna | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `PreguntaID`| Un identificador único para cada pregunta. Se generará automáticamente. | `PREG-1662590123` |
| `TareaID` | El ID del examen al que pertenece esta pregunta (relaciona esta hoja con `Tareas`). | `TSK-1662589123` |
| `TipoPregunta`| El formato de la pregunta. Valores posibles: `Texto`, `Ensayo`, `Imagen`. | `Texto` |
| `TextoPregunta`| El enunciado de la pregunta. | `¿Cuál es la capital de Honduras?` |
| `EnlaceImagen`| Si `TipoPregunta` es `Imagen`, esta es la URL pública a la imagen de la pregunta. | `http://drive.google.com/...` |

---

## 4. Flujo de Usuario y Lógica de Negocio

### 4.1. Estudiantes
*   **Registro y Login:** Se registran y acceden con su `Email` y `Password`.
*   **Panel Principal:** Al entrar, verán dos secciones principales:
    1.  **Tareas Pendientes:** Una lista de todas las asignaciones de la hoja `Tareas` que les correspondan por su `Grado` y `Seccion` y que aún no tengan una `Entrega` registrada.
    2.  **Contenido de la Clase:** Una lista de todos los recursos de la hoja `Contenido` que les correspondan.
*   **Entregas:** Podrán subir archivos para las tareas o responder preguntas de ensayo en los exámenes.

### 4.2. Profesores
*   **Creación de Cuentas:** Las cuentas de `Profesor` se crean directamente en la hoja `Usuarios` de Google Sheets.
*   **Panel Principal:** Tendrán una vista para:
    *   **Crear Contenido:** Añadir nuevas filas a la hoja `Contenido`.
    *   **Crear Asignaciones:** Añadir nuevas filas a la hoja `Tareas` (y `ExamenPreguntas` si es un examen).
    *   **Calificar Entregas:** Ver una lista de las últimas entregas de la hoja `Entregas`. Podrán hacer clic en cada una para ver el archivo o la respuesta y actualizar la columna `Calificacion` en la fila correspondiente.

## 5. Despliegue

1.  **Desplegar el Backend (Google Apps Script):**
    *   Abre el archivo `backend/backend.gs` en el editor de Google Apps Script.
    *   Ve a `Implementar` > `Nueva implementación` > Tipo `Aplicación web`.
    *   Asegúrate de que **"Quién tiene acceso"** esté configurado como **`Cualquier persona`**.
    *   Copia la **URL de la aplicación web** que se genera.

2.  **Configurar el Frontend:**
    *   Abre el archivo `js/config.js`.
    *   Pega la URL del backend en la variable `BACKEND_URL`.
