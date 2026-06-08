# Reporte de Auditoría Pedagógica - Mayo 2026

## 1. Mapeo de Temas por Asignatura (Fase 10)

Se han extraído los siguientes conceptos clave de las presentaciones oficiales para alimentar el **Perfil de Dominio del Estudiante**.

### 1.1. Programación (Undécimo)
- **Lógica**: Algoritmos, Diagramas de Flujo, Pseudocódigo.
- **Estructuras**: Condicionales, Bucle Mientras, Bucle Repetir.
- **Datos**: Arreglos, Modelos de Bases de Datos.
- **Fundamentos**: Lenguajes Compilados vs Interpretados, Historia de la Programación.

### 1.2. Diseño Web (Duodécimo)
- **HTML**: Semántica, Tablas, Listas, Imágenes y Multimedia, Formularios.
- **CSS**: Selectores, Unidades de Medida, Modelo de Caja, Posicionamiento, Flexbox, Grid.
- **JS**: Fundamentos, Manipulación del DOM, Gestión de Eventos.

### 1.3. Informática I / Aplicada
- **Hardware**: Periféricos (Entrada/Salida/Mixtos), Partes de la Computadora, Dispositivos de Almacenamiento.
- **Sistemas**: Software de Sistema vs Aplicación, Funciones del SO, Línea de Comandos.
- **Seguridad**: Malware (Virus, Troyanos, Ransomware), Antivirus, Seguridad Proactiva.

---

## 2. Reporte de Inconsistencias (Phase 10)

Durante la auditoría profunda del repositorio se identificaron los siguientes hallazgos:

| Hallazgo | Impacto | Recomendación |
| :--- | :--- | :--- |
| **Duplicidad de SO** | Baja | Diferenciar el contenido de 10mo (Conceptos) vs 11mo (Instalación y Comandos). |
| **Nomenclatura Discrepante** | Media | Unificar "Diseño Web" y "Webmaster" en el Banco de Preguntas. |
| **Gaps de Contenido** | Alta | El nivel "Avanzado" de los juegos incluye "Service Workers" y "PWAs", pero no existen presentaciones que cubran estos temas. |
| **Falta de Tags** | Media | El 15% de las preguntas en presentaciones legacy no poseen el atributo `tema`, dificultando la analítica por concepto. |

---

## 3. Acciones de Remediación

1.  **Tagging Automático**: Implementar en `js/teacher.js` un mapeo de palabras clave para asignar temas a preguntas huérfanas durante la migración.
2.  **Unificación Académica**: Se ha implementado `window.normalizeSubject` para consolidar registros de "Programación I" y "Programación II".
3.  **Refuerzo de Banco**: El Banco Central ahora permite definir el tema explícitamente para evitar ambigüedades.
