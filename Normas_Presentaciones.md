##Normas de Estandarización de Presentaciones IMA (v2.0)

Objetivo

Este documento establece las normas técnicas, visuales, pedagógicas y de accesibilidad obligatorias para todas las presentaciones HTML del ecosistema educativo IMA.

Su cumplimiento es obligatorio para:

- Presentaciones nuevas.
- Presentaciones modificadas.
- Presentaciones migradas.
- Presentaciones generadas mediante IA.
- Presentaciones generadas manualmente.

Ninguna presentación podrá considerarse finalizada si incumple cualquiera de las reglas establecidas en este documento.

---

#1. Estructura Obligatoria (16 Diapositivas)

Todas las presentaciones deberán contener exactamente 16 diapositivas.

No se permite:

- Menos de 16 diapositivas.
- Más de 16 diapositivas.
- Alterar el orden establecido.

---

Diapositiva 1 - Portada Institucional

Elementos obligatorios

1. Logo institucional.
2. Nombre del tema.
3. Nombre de la asignatura.
4. Grado y sección.
5. Nombre del docente.
6. Fecha.

Restricciones

- Mantener la estructura visual oficial.
- Mantener alineación centrada.
- No modificar tamaños institucionales.
- No modificar colores oficiales.
- No modificar la posición del logo.

---

Diapositivas 2 a 6 - Desarrollo del Tema Principal

Deben incluir:

- Conceptos.
- Definiciones.
- Explicaciones.
- Ejemplos.
- Diagramas.
- Ilustraciones.

Cada diapositiva debe desarrollar una idea concreta.

Evitar:

- Muros de texto.
- Párrafos extensos.
- Diapositivas sin apoyo visual.

---

Diapositiva 7 - Ejercicio Práctico

Debe incluir:

- Aplicación de conceptos.
- Resolución guiada.
- Participación activa del estudiante.

---

Diapositivas 8 a 12 - Desarrollo Avanzado

Si existe un segundo tema:

- Desarrollarlo progresivamente.

Si no existe:

- Continuar el tema principal a nivel avanzado.

Deben incluir:

- Casos reales.
- Aplicaciones prácticas.
- Ejemplos completos.

---

Diapositiva 13 - Ejercicio Avanzado

Debe contener:

- Resolución de problemas.
- Análisis.
- Aplicación práctica.

---

Diapositivas 14 y 15 - Cuestionario

Requisitos mínimos

- 10 preguntas.
- 5 preguntas por diapositiva.

Reglas de calidad

Las preguntas deben:

- Ser claras.
- Tener una sola respuesta correcta.
- Evitar ambigüedad.

Los distractores:

- Deben parecer plausibles.
- No deben ser absurdos.
- No deben revelar la respuesta correcta.

Distribución

La respuesta correcta:

- No debe repetirse consecutivamente.
- Debe variar de posición.

Longitud

La respuesta correcta:

- No debe ser más corta.
- No debe ser más larga.

Debe mantener una longitud visual similar al resto de opciones.

---

Diapositiva 16 - Asignación

Debe incluir:

- Actividad.
- Objetivo.
- Puntaje.
- Fecha de entrega.
- Criterios de evaluación.

---

2. Diseño Institucional

Tipografía

Títulos

font-family: 'Poppins', sans-serif;

Contenido General

font-family: 'Inter', sans-serif;

---

Código Fuente

Todos los ejemplos de código deben utilizar una tipografía monoespaciada similar a entornos de programación educativos.

Tipografías permitidas:

font-family:
'Consolas',
'Courier New',
'Lucida Console',
'Monaco',
monospace;

No utilizar:

- Arial
- Inter
- Poppins
- Times New Roman

para fragmentos de código.

---

Bloques de Código

Todo código deberá mostrarse utilizando:

<pre><code>
...
</code></pre>

Requisitos visuales

- Fondo diferenciado.
- Bordes redondeados.
- Scroll horizontal cuando sea necesario.
- Sangría preservada.
- Espaciado interno adecuado.

Ejemplo recomendado:

.code-block {
    font-family: Consolas, Monaco, monospace;
    background: #1e293b;
    color: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    overflow-x: auto;
}

---

3. Ejemplos Técnicos Obligatorios

Cuando una presentación trate temas de desarrollo web o programación:

Todos los ejemplos deberán mostrarse de forma dual.

HTML

<h1>Hola Mundo</h1>

CSS

h1 {
    color: blue;
}

Cuando aplique también deberá mostrarse:

JavaScript

console.log("Hola Mundo");

No mostrar únicamente una parte del ejemplo.

---

4. Imágenes y Recursos Visuales

Uso de imágenes

Las imágenes deben:

- Relacionarse con el contenido.
- Aportar valor educativo.
- Mantener calidad adecuada.

No utilizar imágenes decorativas sin propósito pedagógico.

---

Adaptabilidad

Toda imagen deberá cumplir:

max-width: 100%;
height: auto;
object-fit: contain;

Debe evitarse:

- Desbordamiento.
- Recortes involuntarios.
- Distorsión.

---

Texto Alternativo

Toda imagen deberá incluir:

alt="Descripción educativa de la imagen"

---

5. Navegación Universal

Escritorio

Avanzar:

- Click lado derecho.
- Flecha derecha.
- Barra espaciadora.
- PageDown.

Retroceder:

- Click lado izquierdo.
- Flecha izquierda.
- PageUp.

---

Móvil y PWA

Avanzar:

- Tap lado derecho.
- Swipe derecha a izquierda.

Retroceder:

- Tap lado izquierdo.
- Swipe izquierda a derecha.

---

6. Encabezado y Pie de Página

Todas las presentaciones deben utilizar:

#page-header
#page-footer

exactamente iguales a los utilizados por el portal principal.

No se permiten variantes locales.

---

7. Pantalla Completa

Debe soportar:

requestFullscreen()

Activación mediante:

- Doble clic en primera diapositiva.
- Doble toque en primera diapositiva.

---

Comportamiento Obligatorio

Al entrar en pantalla completa:

- Ocultar encabezado.
- Ocultar pie de página.
- Maximizar contenido.

Al salir:

- Restaurar encabezado.
- Restaurar pie de página.

---

8. Prevención de Suspensión

Cuando el navegador lo permita:

navigator.wakeLock

debe utilizarse para evitar que la pantalla se apague durante la presentación.

---

9. Compatibilidad

Toda presentación debe funcionar correctamente en:

- Chrome Desktop
- Edge Desktop
- Chrome Android
- PWA instalada
- GitHub Pages

---

10. Integración con QuizPro

Todas las preguntas deben poder ser detectadas por QuizPro.

Formato obligatorio:

{
  "question": "",
  "options": [],
  "answer": "",
  "tema": "",
  "asignatura": "",
  "grado": "",
  "nivel": ""
}

---

11. Clasificación Académica

Toda pregunta debe poseer:

- Asignatura.
- Tema.
- Grado.
- Nivel.

No se permite:

{
  "tema": "General"
}

salvo que el contenido realmente corresponda a una introducción general de la asignatura.

---

12. Auditoría Final Obligatoria

Antes de publicar una presentación se deberá verificar:

- Navegación.
- Cuestionarios.
- Compatibilidad móvil.
- Compatibilidad escritorio.
- Compatibilidad PWA.
- Encabezado.
- Pie de página.
- Pantalla completa.
- Imágenes.
- Integración QuizPro.
- Ejemplos de código.
- Accesibilidad.

Si cualquiera de estos puntos falla, la presentación deberá considerarse no conforme y corregirse antes de publicarse.
