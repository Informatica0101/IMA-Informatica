# Normas de Estandarización de Presentaciones IMA (v5.0)

Este documento define las reglas técnicas y pedagógicas obligatorias para todas las presentaciones HTML dentro del ecosistema educativo de la institución.

---

## 1. Estructura Obligatoria (16 Diapositivas)

Toda presentación debe seguir exactamente este orden:

1.  **Diapositiva 1: Portada Institucional**
    - Logo centralizado (../imagenes/logo.png).
    - Título del Tema (font-black, poppins).
    - Metadatos: Asignatura, Grado/Sección, Docente, Fecha.
2.  **Diapositivas 2 a 6:** Desarrollo del Tema Principal 1. Explicaciones claras y ejemplos estructurados.
*   **Diapositiva 7:** Ejercicio Práctico del Tema Principal 1. Incluye definiciones y conceptos clave.
*   **Diapositivas 8 a 12:** Desarrollo del Tema Principal 2 o continuación avanzada del tema si no hay tema segundario.
*   **Diapositiva 13:** Ejercicio Práctico del Tema Principal 2 o ejercicio para resolver en clase.
    - Los bloques de código deben usar `<pre><code>`.
4.  **Diapositivas 14-15: Cuestionario Interactivo**
    - 5 preguntas por diapositiva.
    - Integración con QuizPro (deben ser detectables por regex).
5.**Diapositiva 14: Asignación Práctica**
    - Instrucciones de la tarea, puntaje y fecha de entrega.

---

## 2. Diseño y UX Institucional

- **Encabezado (#page-header):** Logo, "ISEMED", "Área de Informática", link a Inicio.
- **Pie de Página (#page-footer):** Bandera de HN, Copyright, Versión del diseño.
- **Tipografía:** Inter (Cuerpo), Poppins (Títulos).
- **Consistencia:** Usar Tailwind CSS para espaciados y bordes redondeados (rounded-xl/2xl).

---

## 3. Navegación Universal (Requerimiento Crítico)

### Escritorio
- **Clicks:** Click izquierdo en mitad derecha (Avanzar), mitad izquierda (Retroceder).
- **Teclado:** `Flecha Derecha`, `Espacio`, `PageDown` (Avanzar) | `Flecha Izquierda`, `PageUp` (Retroceder).

### Móvil / PWA
- **Gestos:** Swipe Izquierda (Avanzar), Swipe Derecha (Retroceder).
- **Toques:** Tap lado derecho (Avanzar), Tap lado izquierdo (Retroceder).
- **Fullscreen:** Doble toque en la primera diapositiva.

### Modo Pantalla Completa
- Se debe invocar via `requestFullscreen()`.
- El encabezado y pie de página **DEBEN ocultarse** automáticamente.
- Se debe usar `Wake Lock API` para prevenir que la pantalla se apague durante la lectura.

---

## 4. Auditoría de Datos
- Las preguntas deben seguir el esquema: `{ question: "", options: [], answer: "" }`.
- Todas las imágenes deben tener un `alt` descriptivo.
- Las rutas a recursos compartidos deben usar rutas relativas (`../imagenes/`).
