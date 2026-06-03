# Normas de Estandarización de Presentaciones IMA

Este documento define las reglas técnicas y pedagógicas obligatorias para todas las presentaciones HTML dentro del ecosistema educativo de la institución.

---

## 1. Estructura Obligatoria (16 Diapositivas)

Toda presentación debe seguir exactamente este orden:

1.  **Diapositiva 1: Portada Institucional**
    - Logo (imagenes/logo.png), Nombre del Tema, Asignatura, Grado/Sección, Nombre del Docente y Fecha.
2.  **Diapositiva 2: Objetivos de la Clase**
    - Al menos 2 objetivos de aprendizaje.
3.  **Diapositivas 3-10: Desarrollo de Contenido**
    - Mezcla de texto, imágenes y bloques de código.
4.  **Diapositivas 11-12: Cuestionario Interactivo**
    - 5 preguntas por diapositiva para un total de 10.
5.  **Diapositiva 13: Resumen de Puntos Clave**
6.  **Diapositiva 14: Asignación (Tarea)**
    - Tarea para realizar en casa con valor y fecha.
7.  **Diapositiva 15: Glosario Técnico**
8.  **Diapositiva 16: Despedida y Créditos**

---

## 2. Diseño Institucional

- **Encabezado Global:** Debe incluir el Logo, "ISEMED" y "Área de Informática".
- **Pie de Página Global:** Debe incluir la bandera de Honduras y el copyright.
- **Tipografía:** Inter o Poppins.
- **Colores:** Azul Institucional (#2563eb).

---

## 3. Navegación Estándar

- **Teclado:** Flecha derecha / Espacio (Avanzar), Flecha izquierda (Retroceder).
- **Móvil:** Swipe izquierda (Avanzar), Swipe derecha (Retroceder).
- **Fullscreen:** Doble toque en portada (móvil) o F11 (escritorio).
- **Auto-hide:** El encabezado y pie de página deben ocultarse automáticamente en modo Fullscreen.

---

## 4. Componentes Especiales

- **Concept Box:** `<div class="concept-box">` para definiciones importantes.
- **Code Box:** `<div class="code-box">` con resaltado de sintaxis manual.
- **Quiz:** Usar botones `.quiz-option-button` con feedback visual (Correcto/Incorrecto).

---

## 5. Auditoría de Calidad

Cada presentación debe ser validada contra:
- **NormalizeQuestion:** Los cuestionarios deben usar `correctAnswer` o `respuestaCorrecta`.
- **Integridad de Imágenes:** Todas las rutas deben apuntar a `imagenes/`.
- **Responsive:** Probar en vista móvil antes de publicar.
