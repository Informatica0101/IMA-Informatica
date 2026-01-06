# Plataforma de Gestión de Tareas Estudiantiles

Esta es una plataforma web diseñada para que los estudiantes puedan entregar tareas y los profesores puedan gestionarlas y calificarlas. La aplicación utiliza Google Sheets como base de datos y Google Drive para el almacenamiento de archivos.

## Configuración Principal

- **ID de Google Sheet:** `1txfudU4TR4AhVtvFgGRT5Wtmwjl78hK4bfR4XbRwwww`
- **ID de Carpeta de Google Drive:** `1D-VlJ52-olcfcDUSSsVLDzkeT2SvkDcB`

## Estructura de la Base de Datos (Google Sheets)

El archivo de Google Sheets (`SPREADSHEET_ID`) debe contener las siguientes hojas con las columnas especificadas:

### Hoja: `Usuarios`

Almacena la información de los usuarios registrados.

| Columna A | Columna B | Columna C | Columna D | Columna E | Columna F        | Columna G |
|-----------|-----------|-----------|-----------|-----------|------------------|-----------|
| `userId`  | `nombre`  | `grado`   | `seccion` | `email`   | `hashedPassword` | `rol`     |

- **userId:** Identificador único (ej. `USR-1678886400000`).
- **rol:** Puede ser "Estudiante" o "Profesor".

### Hoja: `Tareas`

Almacena las tareas o exámenes creados por los profesores.

| Columna A | Columna B | Columna C | Columna D   | Columna E | Columna F  | Columna G     | Columna H         | Columna I     |
|-----------|-----------|-----------|-------------|-----------|------------|---------------|-------------------|---------------|
| `tareaId` | `tipo`    | `titulo`  | `descripcion` | `parcial` | `asignatura` | `gradoAsignado` | `seccionAsignada` | `fechaLimite` |

- **tareaId:** Identificador único (ej. `TSK-1678886400000`).
- **tipo:** Puede ser "Tarea" o "Examen".

### Hoja: `Entregas`

Registra cada entrega realizada por un estudiante.

| Columna A   | Columna B | Columna C | Columna D    | Columna E  | Columna F      |
|-------------|-----------|-----------|--------------|------------|----------------|
| `entregaId` | `tareaId` | `userId`  | `fechaEntrega` | `archivoUrl` | `calificacion` |

- **entregaId:** Identificador único (ej. `ENT-1678886400000`).
- **calificacion:** Inicialmente vacía. El profesor la actualiza después.

## Estructura de Archivos en Google Drive

Los archivos entregados por los estudiantes se organizan automáticamente en la siguiente estructura jerárquica dentro de la carpeta raíz (`DRIVE_FOLDER_ID`):

```
/Grado/Sección/Nombre del Alumno/Parcial/Asignatura/archivo_entregado.pdf
```
El archivo se renombra automáticamente para que coincida con el título de la tarea.
