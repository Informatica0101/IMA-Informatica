# Normas de Estandarización de Presentaciones IMA (v7.0)

## Propósito
Este documento define las reglas técnicas, visuales, pedagógicas y de compatibilidad obligatorias para todas las presentaciones HTML del ecosistema educativo IMA.

Ninguna presentación será válida si no cumple el 100% de estas normas.

---

# 1. Estructura Académica Obligatoria (16 diapositivas exactas)

Toda presentación debe contener EXACTAMENTE 16 diapositivas.

No se permite:
- Menos de 16
- Más de 16
- Reordenamiento de estructura

---

## Diapositiva 1 — Portada Institucional
Elementos obligatorios:
- Logo institucional (../imagenes/logo.png)
- Título del tema
- Asignatura
- Grado y sección
- Docente
- Fecha

Restricciones:
- No modificar proporciones del logo
- No cambiar alineación base
- Mantener jerarquía visual institucional

---

## Diapositivas 2 a 6 — Desarrollo del tema
- Explicación progresiva
- Definiciones claras
- Ejemplos
- Diagramas cuando sea necesario

Prohibido:
- Párrafos largos sin separación
- Saturación de texto

---

## Diapositiva 7 — Ejercicio práctico
Aplicación directa del contenido visto.

---

## Diapositivas 8 a 12 — Desarrollo avanzado o segundo tema
Si no existe segundo tema:
- Continuar profundización del tema principal

---

## Diapositiva 13 — Ejercicio avanzado

Código obligatorio (estilo consola tipo Code Studio / PSeInt):

```console
// Ejemplo de estilo obligatorio
IF edad > 18 THEN
   PRINT "Mayor de edad"
ENDIF
```

Reglas:
- Usar fuente tipo consola (Console / monospace estilo PSeInt)
- Mantener indentación estricta
- No usar estilos decorativos

---

## Diapositivas 14-15 — Cuestionario

- 10 preguntas mínimo
- 5 por diapositiva

Reglas:
- Una sola respuesta correcta
- Distractores plausibles
- No respuestas obvias

---

## Diapositiva 16 — Asignación
Debe incluir:
- Actividad
- Objetivo
- Puntaje
- Fecha de entrega

---

# 2. Diseño institucional

## Tipografía obligatoria
- Títulos: Poppins
- Texto: Inter
- Código: Console / monospace (tipo PSeInt o Code Studio)

---

## Paleta institucional
- Azul
- Naranja
- Gris
- Blanco

---

# 3. Encabezado y pie global

Obligatorio:
- #page-header (igual a index.html)
- #page-footer (igual a index.html)

No se permiten versiones alternativas.

---

# 4. Navegación

## Escritorio
- Click derecha → avanzar
- Click izquierda → retroceder
- Flechas + espacio

## Móvil
- Swipe izquierda → avanzar
- Swipe derecha → retroceder

---

# 5. Pantalla completa

Activación:
- requestFullscreen()
- doble clic o doble toque en primera diapositiva

Comportamiento:
- Ocultar header y footer automáticamente
- Mantener navegación activa

---

# 6. Imágenes
- Deben tener alt obligatorio
- No desbordar diapositiva
- Siempre responsivas

---

# 7. Integridad académica (CRÍTICO)

Toda pregunta debe incluir:
{
  question,
  options,
  answer,
  tema,
  asignatura,
  grado,
  nivel
}

PROHIBIDO:
- "General" como tema
- Clasificación automática por keywords
- Inferencias no académicas

Clasificación SOLO desde origen de la presentación.

---

# 8. Auditoría obligatoria

Antes de aprobar:
- Navegación funcional
- Cuestionarios funcionales
- Modo fullscreen
- Compatibilidad móvil
- Encabezado y footer correctos
