# Implementaciones Nuevas - Junio 2026

Este documento detalla las nuevas funcionalidades y mejoras visuales solicitadas para la plataforma.

## 1. Encabezado Global y Optimización del Layout
- [x] **1.1 Aumento del tamaño de los logos**: Mejorar la visibilidad del logo de la institución y la bandera de Honduras.
- [x] **1.2 Reducción de márgenes laterales**: Reducir espacio horizontal en Header, Body, Dashboards, Footer y secciones de contenido para mayor aprovechamiento del viewport.
- [x] **1.3 Ajuste del título institucional**: Reducir espacio vertical entre "ISEMED" y "Área de Informática".

## 2. Dashboard del Profesor
- [x] **2.1 Optimización del cuadro de evidencias**: Ajustar la tabla de evidencias para eliminar el scroll horizontal, reduciendo espacios entre columnas y ajustando anchos al contenido.
- [x] **2.2 Tarjeta "Estado Académico"**: Reducir altura y padding vertical de la tarjeta ubicada debajo de "Estado Académico".

## 3. Dashboard del Estudiante
- [x] **3.1 Vista previa de archivos**: Implementar miniaturas (thumbnails) para los archivos seleccionados en el módulo de carga de tareas.
- [x] **3.2 Lista de archivos desplazable**: Si hay múltiples archivos, mostrar una lista con scroll interno, manteniendo visibles los botones "Entregar tarea" y "Cancelar".
- [x] **3.3 Soporte para archivos > 50 MB**: Implementar subida por fragmentos (chunking) para evitar errores después del 100%.
- [x] **3.4 Sistema de errores comprensibles**: Convertir errores técnicos en mensajes entendibles para el estudiante (ej. "Archivo corrupto", "Error de conexión").
- [x] **3.5 Eliminación de encabezado redundante**: Quitar el bloque "Mi Portal Académico", "Bienvenido, Usuario" y "Grupo de WhatsApp" del dashboard, ya que se duplica en la tarjeta principal.
- [x] **3.6 Gestión de archivos temporales**: Eliminación automática de archivos cargados si se cancela o abandona el proceso, con mensaje de advertencia previo.

## 4. Tablero de Noticias
- [x] **4.1 Extracto de contenido**: Mostrar el primer párrafo o un fragmento representativo de la noticia.
- [x] **4.2 Miniatura de portada**: Agregar thumbnail de la imagen principal en cada noticia.
- [x] **4.3 Botón "Seguir leyendo" funcional**: Conectar el botón al sistema de noticias completo, creando la navegación o página necesaria si no existe.
- [x] **4.4 Noticias en Inicio**: Mostrar como mínimo las tres noticias más recientes en `index.html`, en orden descendente.
- [x] **4.5 Formato de noticia**: Cada noticia debe mostrar: Thumbnail, Título, Fecha, Extracto y Botón "Seguir leyendo".
