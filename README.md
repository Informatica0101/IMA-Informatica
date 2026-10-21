# Ecosistema Educativo New Generation Christian Academy - Plataforma Integral de Gestión Institucional

Bienvenido a la documentación oficial y guía funcional del **Ecosistema Educativo New Generation Christian Academy** (Versión Global **1.0**).

La plataforma constituye una solución tecnológica centralizada que integra la gestión académica, administrativa, financiera, comunicativa, de recursos humanos y de operaciones físicas de la institución. Conecta en tiempo real a directivos, coordinadores, docentes, estudiantes, padres de familia y personal administrativo en un entorno único, seguro, intuitivo y accesible desde navegadores web y dispositivos móviles (PWA).

---

## Módulos Funcionales y Servicios Institucionales

### 1. Gestión Académica, Matrícula y Expediente Estudiantil
* **Ciclo Escolar y Estructura Curricular:** Planificación de periodos lectivos (parciales, semestres, trimestres), jornadas académicas, catálogo de asignaturas y planes de estudio.
* **Expediente Digital Único:** Registro integral del estudiante que consolida datos personales, tutores legales, documentos digitalizados, línea de tiempo de movimientos académicos (traslados, cambios de sección, retiros) y prevención de expedientes duplicados.
* **Admisiones y Matrícula:** Formulario de solicitud de ingreso, carga y revisión de requisitos, asignación de secciones y matriculación formal anual.
* **Gestión de Horarios y Espacios Físicos:** Matriz de horarios por nivel, grado y docente, control de capacidad de aulas, prevención automática de solapamiento de horarios y asignación de docentes sustitutos.

### 2. Aula Virtual, LMS y Material Didáctico
* **Aulas Virtuales por Asignatura:** Publicación de anuncios, guías de estudio, lecciones interactivas, presentaciones y recursos educativos digitales.
* **Proyectos y Tareas Multimodales:** Creación de asignaciones con fechas de entrega, cargas de archivos adjuntos, respuestas en línea y retroalimentación privada docente-estudiante.
* **Biblioteca Digital y Contenidos:** Catálogo organizado de lecturas, guías didácticas y material complementario por unidad de aprendizaje.

### 3. Evaluaciones, Calificaciones e Informes Académicos
* **Libro de Calificaciones Consolidado:** Registro centralizado de notas por parcial y materia con ponderaciones parametrizables, cálculo de promedios e inalterabilidad de periodos cerrados.
* **Evaluaciones y Cuestionarios en Línea:** Aplicación de exámenes interactivos con bancos de preguntas por asignatura y calificación automatizada.
* **Boletines y Cuadros de Honor:** Generación de libretas de calificaciones, cuadros de honor, fichas de rendimiento e historiales académicos para padres y estudiantes.
* **Evaluación Formativa Independiente:** Valoración separada de conducta, presentación personal e higiene que no altera los promedios académicos.
* **Compatibilidad con Secretaría de Educación (SACE):** Exportación de reportes académicos en el formato oficial requerido por la Secretaría de Educación de Honduras.

### 4. Portal Familiar y Comunicación Multicanal
* **Consola Multiestudiante para Padres:** Vista consolidada para tutores con múltiples hijos inscritos, permitiendo alternar fácilmente entre expedientes, calificaciones y avisos.
* **Comunicación Institucional Segura:** Circulares, noticias, avisos generales y mensajería interna entre padres, docentes y dirección.
* **Centro de Notificaciones:** Sistema de alertas en tiempo real para tareas pendientes, convocatorias a reuniones, avisos financieros y avisos de rendimiento académico.

### 5. ERP Financiero, Pagos, Cobros y Facturación SAR
* **Planes de Pago y Convenios Familiares:** Desglose de colegiaturas, matrícula, transporte, servicios especiales y estructuración de acuerdos de pago personalizados.
* **Recepción y Validación de Pagos:** Carga de comprobantes por parte de las familias, cola de revisión contable y emisión de recibos oficiales descargables en PDF.
* **Facturación Fiscal Hondureña (SAR):** Emisión de facturas fiscales de cumplimiento tributario nacional (CAI, Rango Autorizado, ISV 15%, RTN).
* **Tesorería, Caja Chica y Cierres:** Arqueos diarios de caja, depósitos bancarios, conciliaciones de extractos y estados financieros comparativos.

### 6. Recursos Humanos, Planillas y Administración de Personal
* **Expediente Laboral y Contratos:** Control de personal, contratos de trabajo, avisos de vencimiento y asignación de cargos por departamento.
* **Gestión de Asistencia, Permisos y Vacaciones:** Solicitud y aprobación de vacaciones, justificaciones médicas, registro de asistencia e incidencias laborales.
* **Cálculo Oficial de Planillas:** Procesamiento de sueldos, horas adicionales, bonificaciones y retenciones de ley en Honduras (IHSS, RAP, ISR).
* **Portal de Autoservicio del Empleado:** Espacio privado para que el colaborador consulte sus boletas de pago, historial de vacaciones, turnos asignados y capacitaciones.
* **Evaluación del Desempeño y Capacitación:** Evaluaciones periódicas de competencias por puesto, planes de desarrollo profesional y seguimiento de certificaciones.

### 7. Operaciones Físicas, Inventario y Recursos
* **Almacén e Inventario Consumible:** Control de existencias de materiales, entradas, salidas por consumo internos y alertas de desabastecimiento.
* **Activos Patrimoniales y Custodia:** Registro de bienes, equipos y mobiliario con asignación de responsables y seguimiento de mantenimiento preventivo/correctivo.
* **Biblioteca Física:** Préstamo y devolución de libros, control de ejemplares, reservas y registro de incidencias.
* **Transporte Escolar:** Gestión de unidades, rutas, paradas asignadas y control de capacidad por vehículo.

### 8. Gobernanza, Seguridad y Soporte Técnico
* **Control de Acceso Basado en Roles (RBAC):** Restricciones de privacidad y permisos en el servidor según el rol activo (Dirección, Secretaría, Contabilidad, Docente, Estudiante, Padre/Tutor).
* **Soporte y Reporte de Problemas:** Sistema de tickets integrado con seguimiento de estados y notas de atención técnica.
* **Respaldo e Integridad de Datos:** Generación periódica de copias de seguridad de datos institucionales con verificación de sumas de comprobación.
* **Operación Sin Conexión (PWA):** Soporte de navegación en dispositivos móviles con cola de sincronización automática al recuperar señal.

---

## Estructura General y Flujo de Interacción Institucional

```
+-----------------------------------------------------------------------------------+
|                        ECOSISTEMA EDUCATIVO INSTITUCIONAL                         |
+-----------------------------------------------------------------------------------+
                                          |
     +--------------------+---------------+---------------+--------------------+
     |                    |                               |                    |
     v                    v                               v                    v
+----------+    +-------------------+           +-------------------+    +-----------+
| PARENT & |    | STUDENT DASHBOARD |           | TEACHER & ACADEMIC|    |FINANCIAL &|
| GUARDIAN |    +-------------------+           |     DASHBOARD     |    |   HR ERP  |
| PORTAL   |    | - Horarios & Aulas|           +-------------------+    +-----------+
+----------+    | - Tareas & Guías  |           | - Control de Notas|    | - Cobros  |
| - Fichas |    | - Calificaciones  |           | - Asistencia      |    | - SAR CAI |
| - Pagos  |    | - Materiales      |           | - Planificación   |    | - Planilla|
| - Avisos |    | - Notificaciones  |           | - Expedientes     |    | - Activos |
+----------+    +-------------------+           +-------------------+    +-----------+
     |                    |                               |                    |
     +--------------------+---------------+---------------+--------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           MOTOR CENTRAL DE SERVICIOS                              |
|   (Seguridad RBAC, Reglas de Negocio, Trazabilidad, Base de Datos & Almacenamiento)|
+-----------------------------------------------------------------------------------+
```

---

## Diagrama de Flujo: Ciclo de Emisión Documental y Verificación CUV

```
[ Usuario Autorizado ] ---> ( Selecciona Plantilla ) ---> ( Asigna Datos de Estudiante )
                                                                 |
                                                                 v
                                                     < Adquiere Candado Atómico >
                                                                 |
                                                                 v
                                                     [ Calcula Correlativo Oficial ]
                                                                 |
                                                                 v
                                                     [ Genera CUV Único Garantizado ]
                                                                 |
                                                                 v
                                                     [ Registra Documento Oficial ]
                                                                 |
                                                                 v
                                                     < Libera Candado Atómico >
                                                                 |
                                                                 v
[ Documento Emitido PDF / QR ] <-------------------- [ Retorna ID, Correlativo & CUV ]
             |
             v
( Verificación Pública por CUV ) ---> [ Autenticación Oficial en Plataforma ]
```

---

## Normativa Visual y Accesibilidad
La interfaz de usuario cumple estrictamente con las pautas de accesibilidad **WCAG 2.2 AA**, garantizando contrastes legibles, jerarquía tipográfica clara, diseño responsivo adaptativo para pantallas de escritorio, tabletas y teléfonos móviles, y esquemas de color institucionales aprobados por la Dirección.
