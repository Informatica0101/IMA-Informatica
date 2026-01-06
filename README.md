# Proyecto de Renovación de Plataforma Estudiantil

## ... (Secciones 1-4 sin cambios) ...

---

## 5. Despliegue y Configuración Crítica

Para que la aplicación funcione, debes conectar el backend (Google Apps Script) con tus propios archivos de Google. Sigue estos pasos cuidadosamente.

### **Paso 1: Preparar tus Archivos de Google**

1.  **Crea una Hoja de Cálculo (Google Sheet):**
    *   Crea una nueva hoja de cálculo en tu Google Drive.
    *   **Obtén su ID:** La URL de la hoja se verá así: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`. Copia la parte larga del medio que corresponde al `SPREADSHEET_ID`.
    *   **Crea las Hojas Internas:** Dentro de este archivo, crea las 5 hojas con los nombres exactos: `Usuarios`, `Tareas`, `Entregas`, `Contenido`, `ExamenPreguntas`.

2.  **Crea una Carpeta en Google Drive:**
    *   Crea una nueva carpeta en Google Drive donde se guardarán todos los archivos de los estudiantes.
    *   **Obtén su ID:** Abre la carpeta. La URL se verá así: `https://drive.google.com/drive/folders/DRIVE_FOLDER_ID`. Copia la parte final que corresponde al `DRIVE_FOLDER_ID`.

### **Paso 2: Configurar y Desplegar el Backend**

1.  **Abre el Script:** Abre el archivo `backend/backend.gs`.
2.  **Pega tus IDs:** En las primeras líneas del script, reemplaza los marcadores de posición con los IDs que copiaste en el paso anterior:
    ```javascript
    const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI";
    const DRIVE_FOLDER_ID = "TU_DRIVE_FOLDER_ID_AQUI";
    ```
3.  **Despliega el Script:**
    *   Abre el archivo `backend/backend.gs` en el editor de Google Apps Script.
    *   Ve a **"Implementar" > "Nueva implementación"**.
    *   En "Descripción", pon "Versión inicial".
    *   En **"Quién tiene acceso"**, selecciona **"Cualquier persona"**. *Esto es crucial para que la app funcione.*
    *   Haz clic en **"Implementar"**.
    *   Copia la **URL de la aplicación web** que se genera.

### **Paso 3: Configurar el Frontend**

1.  **Abre `js/config.js`**.
2.  **Pega la URL del Backend:** Reemplaza el marcador de posición con la URL de la aplicación web que copiaste:
    ```javascript
    const BACKEND_URL = 'URL_DE_TU_IMPLEMENTACION_AQUI';
    ```

---

## 6. Solución de Problemas Comunes

### **Error: "Ocurrió un error técnico al intentar registrar..."**

Si ves este mensaje genérico en la página, casi siempre significa que el backend falló por una de estas dos razones:

1.  **IDs Incorrectos en `backend/backend.gs`:** El `SPREADSHEET_ID` o `DRIVE_FOLDER_ID` que pegaste en el script son incorrectos. El script no puede encontrar tus archivos y falla.
    *   **Solución:** Vuelve al **Paso 1** y asegúrate de haber copiado los IDs correctos. Luego, vuelve a implementar el backend (Paso 2.3).

2.  **Nombres de Hojas Incorrectos:** Los nombres de las hojas dentro de tu Google Sheet no coinciden **exactamente** con `Usuarios`, `Tareas`, `Entregas`, `Contenido` y `ExamenPreguntas`.
    *   **Solución:** Abre tu Google Sheet y renombra las hojas para que coincidan perfectamente, respetando mayúsculas y minúsculas.

### **Error al visitar la URL del backend: "Función de secuencia de comandos no encontrada: doGet"**

Esto es **normal y esperado**. Significa que tu backend está en línea pero no está diseñado para ser visitado directamente desde un navegador. Solo responde a las peticiones que le hace la aplicación.
