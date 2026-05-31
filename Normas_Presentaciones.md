# Normas de Generación de Presentaciones Académicas (ISEMED)

Este documento establece las normas obligatorias para la creación y actualización de presentaciones didácticas dentro de la plataforma académica.

## 1. Estructura Obligatoria (16 Diapositivas)

Todas las presentaciones deben constar de exactamente 16 diapositivas distribuidas de la siguiente manera:

*   **Diapositiva 1:** Portada del tema. Incluye Título, Nombre del Docente, Fecha y Grado/Sección.
*   **Diapositivas 2 a 6:** Desarrollo del Tema Principal 1. Explicaciones claras y ejemplos simples.
*   **Diapositiva 7:** Ejercicio Práctico del Tema Principal 1. Incluye definiciones y conceptos clave.
*   **Diapositivas 8 a 12:** Desarrollo del Tema Principal 2 (o continuación avanzada del tema).
*   **Diapositiva 13:** Ejercicio Práctico del Tema Principal 2.
*   **Diapositivas 14 a 15:** Cuestionario Interactivo (Evaluación).
    *   Mínimo 10 preguntas (5 por diapositiva).
    *   La respuesta correcta debe ser breve en comparación con las opciones incorrectas.
*   **Diapositiva 16:** Asignación (Tarea) indicada en el plan de clases.

## 2. Reglas de Diseño y Estilo

*   **Estilo Visual:** Diseño sobrio, profesional y académico.
*   **Densidad de Información:** Evitar la saturación de texto. Priorizar la legibilidad.
*   **Fuentes y Tipografía:** Utilizar 'Inter' para cuerpo de texto y 'Poppins' para títulos.
*   **Colores Institucionales:** Respetar la paleta definida en el sistema (Azul, Naranja, Gris, Blanco).
*   **Gráficos:** Se prohíben imágenes externas para diagramas o esquemas. Deben generarse mediante HTML, CSS o JavaScript nativo.
*   **Framework:** Utilizar Tailwind CSS v4 para el estilizado.

## 3. Sistema de Navegación

La presentación debe responder a los siguientes controles:

*   **Avanzar:** Clic izquierdo, Barra espaciadora o Flecha derecha.
*   **Retroceder:** Tecla Retroceso (Backspace) o Flecha izquierda.
*   **Pantalla Completa (F11):** Al estar en modo pantalla completa, se deben ocultar automáticamente el encabezado, pie de página y botones de navegación de la interfaz global para maximizar el área de proyección.

## 4. Restricciones de Contenido

*   **Fuentes Autorizadas:** Únicamente se permite extraer información de los PDFs oficiales proporcionados en la carpeta de la asignatura correspondiente.
*   **Análisis de Planes de Clase:** Es obligatorio identificar el tema correspondiente a la fecha exacta mediante el Plan de Clases oficial.
*   **Coherencia Temporal:** Revisar el tema anterior y siguiente para evitar saltos lógicos o repeticiones innecesarias.
*   **Temas Secundarios:** Solo se permite complementar información externa (como ejercicios de PSeInt o estructuras de control) si están explícitamente mencionados en el plan de clases.

## 5. Integración al Sistema

Las presentaciones terminadas deben integrarse en el archivo `js/data.js` para ser visibles en la sección "Cursos" del menú principal, respetando los filtros de Rol, Grado, Sección y Asignatura.
