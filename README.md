# Plataforma Integral de Gestión Institucional - New Generation Christian Academy

Bienvenido al centro de información y documentación funcional de la plataforma institucional de **New Generation Christian Academy** (Versión Global **1.0**).

La plataforma constituye un ecosistema digital centralizado que integra la gestión académica, administrativa, financiera, técnica, comunicativa y de soporte de la institución. Su propósito principal es conectar a la dirección, secretaría, cuerpo docente, estudiantes y padres de familia en un único entorno coordinado, eficiente, seguro y accesible.

---

## Control de Versionado Global y Regla de Incremento

* **Versión Global Pública Inicial**: **1.0**
* **Regla Estricta de Incremento Manual**: La versión global de la plataforma queda fijada en 1.0 y **únicamente** se modificará cuando el responsable o cliente autorizado lo solicite de forma expresa. No se incrementa automáticamente al aplicar correcciones de errores, renovaciones visuales, pruebas, publicaciones o actualizaciones de documentación.

---

## Visión General de Módulos y Funcionalidades Verificadas

### 1. Identidad Central, Seguridad y Portal de Accesos
* **Perfiles de Usuario y Roles Institucionales**: Gestión diferenciada para Administradores, Directores, Subdirectores, Personal de Secretaría, Contadores, Docentes, Estudiantes y Padres/Tutores.
* **Control de Permisos por Funcionalidad (RBAC Servidor)**: Acceso protegido en el servidor para asegurar que cada usuario consulte e interactúe únicamente con las opciones y datos que corresponden a su rol y responsabilidad.
* **Manejo de Cuentas y Estado de Usuarios**: Capacidad para crear, activar, suspender o desactivar cuentas de acceso garantizando la conservación inmutable del historial institucional.
* **Recuperación e Invitaciones de Clave**: Emisión de invitaciones seguras para la creación inicial de contraseñas y restablecimiento seguro mediante enlaces temporales de uso único.

### 2. Identidad Visual, Personalización Global y Diseño Institucional
* **Sistema de Diseño Sobrio y Profesional**: Normativa de colores centralizada en variables CSS que elimina tonos neón, colores chillantes, formas caricaturescas y bordes innecesarios, cumpliendo con pautas de accesibilidad WCAG 2.2 AA.
* **Paletas Institucionales Sugeridas**: Paletas predefinidas (Azul Institucional, Verde Sobrio, Gris Azulado, Borgoña Profesional) con previsualizador interactivo de botones, tablas, formularios y alertas.
* **Flujo Verificable de Aprobación**: Flujo formal donde el Administrador prepara una propuesta de diseño y Dirección la revisa y aprueba antes de publicarse globalmente a todos los usuarios.
* **Presentación del Logotipo en Inicio de Sesión**: Contenedor de fondo transparente, sin marcos sólidos ni contornos neón, conservando proporciones originales con sombra sutil y fallback elegante.

### 3. Módulo de Reporte de Problemas y Sistema de Tickets
* **Acceso Global desde Toda la Plataforma**: Botón flotante accesible desde todos los dashboards, herramientas, secciones, páginas y formularios.
* **Formulario Estricto y Contextual**: Auto-detección del área o función activa y validación obligatoria de dos campos ("¿Qué problema encontraste?" y "¿Qué esperabas que ocurriera?") con mínimo 20 caracteres significativos cada uno y contador en tiempo real.
* **Captura Contextual Automática en Servidor**: Generación de identificador único de ticket (`TICK-XXXXXX`), recolección segura de ID de cuenta, rol activo, área/sección, versión global (`1.0`), tipo de aplicación (PWA vs Escritorio) y marcas de tiempo sin exigir campos manuales.
* **Módulo Cliente "Mis Reportes"**: Espacio personal para consultar tickets propios, revisar mensajes del administrador e ingresar respuestas aclaratorias.
* **Módulo Administrativo Exclusivo de Soporte**: Interfaz de gestión exclusiva para Administrador, Desarrollador y Dirección con filtros por estado, búsqueda, notas internas privadas, respuestas públicas y máquina de estados (Enviado, En revisión, Se necesita información, Información recibida, Solucionado, Cerrado).

### 4. Gestión Académica, Matrícula y Estructura Escolar
* **Configuración del Ciclo Escolar y Calendario**: Planificación de años lectivos, períodos escolares (parciales, semestres, trimestres) y fechas clave en el calendario académico institucional.
* **Catálogo de Oferta Educativa**: Administración de niveles de enseñanza, grados, secciones y catálogo oficial de asignaturas y planes de estudio.
* **Expediente Digital Único del Estudiante**: Ficha académica integral del alumno que reúne datos personales, historial de grados cursados, antecedentes académicos y trayectoria en la institución.
* **Proceso de Admisiones y Matrícula**: Formulario de solicitud de ingreso, carga y revisión de documentos de admisión, asignación de cupos y matriculación formal anual.
* **Gestión de Cambios y Movimientos Estudiantiles**: Registro ordenado de cambios de sección, traslados internos/externos, retiros y reincorporaciones sin pérdida de registros históricos.
* **Asignaciones Docentes y Suplencias**: Control de asignaciones de profesores titulares y asistentes por materia y grupo, con soporte para coberturas y suplencias temporales con vigencia delimitada.

### 5. Aula Virtual, Contenidos y Material de Estudio
* **Aulas Virtuales Integradas**: Espacio interactivo por asignatura donde el docente publica avisos, anuncios de clase, recursos digitales y tareas.
* **Biblioteca de Contenidos y Guías de Estudio**: Almacenamiento y organización de presentaciones de clase, lecciones en línea, guías informativas y materiales didácticos descargables ordenados por unidad y tema.
* **Módulo Polimórfico de Tareas y Proyectos**: Creación de actividades de aprendizaje con instrucciones enriquecidas, fecha de disponibilidad programada y fecha límite de entrega.
* **Entrega Multimodal y Cargas Reanudables**: Carga de trabajos por parte de los estudiantes mediante archivos adjuntos, respuestas escritas o enlaces externos, con protocolo de carga reanudable por puntos de control (`uploadResumableFile`).
* **Comentarios Privados y Correcciones**: Canal de retroalimentación privada entre el profesor y el estudiante para revisiones, observaciones pedagógicas y devolución de trabajos para corrección.

### 6. Evaluaciones, Calificaciones y Trayectoria Académica
* **Libro de Calificaciones Consolidado**: Registro centralizado de calificaciones por parcial y asignatura con cálculo de promedios, ponderaciones por categoría e inalterabilidad histórica de periodos cerrados en el servidor.
* **Exámenes y Evaluaciones Interactivas**: Aplicación de evaluaciones en línea con bancos de preguntas por materia y calificación inmediata.
* **Rúbricas Analíticas de Evaluación**: Criterios e indicadores descriptivos para calificar desempeños complejos de manera transparente.
* **Módulo de Recuperaciones y Reposiciones**: Administración de exámenes de recuperación con reglas institucionales de sustitución o promediado de nota.
* **Boletines e Informes Académicos**: Generación de libretas de calificaciones, historiales académicos de desempeño y certificados institucionales.
* **Evaluación Formativa e Independiente**: Valoración separada de Comportamiento, Aseo Personal/Higiene y Presentación Personal que no altera las notas académicas del estudiante.

### 7. Asistencia, Puntualidad y Control Estudiantil
* **Control de Asistencia Diario y por Asignatura**: Registro de presencia, ausencias, tardanzas y salidas anticipadas.
* **Gestión de Justificaciones e Incidencias**: Tramitación de excusas médicas o justificantes presentados por los padres con adjuntos digitales y resolución administrativa.
* **Planes de Seguimiento por Ausentismo**: Alertas e indicadores oportunos para detectar patrones de inasistencia o impuntualidad recurrente.

### 8. Portal Familiar y Comunicación Institucional
* **Portal para Padres y Tutores Legalmente Autorizados**: Interfaz para consultar el progreso académico, asistencia, avisos y estado financiero de sus hijos o representados.
* **Vinculación Segura Familiar**: Proceso de vinculación formal mediante tokens de invitación autorizados por la secretaría.
* **Mensajería Interna e Institucional**: Canal directo de comunicación entre padres, docentes y dirección sin exponer números telefónicos privados.
* **Noticias y Tablón de Avisos**: Publicación de circulares, eventos y noticias con segmentación de público objetivo por nivel o grado.
* **Centro de Notificaciones con Alertas**: Notificaciones con indicadores de prioridad (tareas pendientes, eventos próximos, avisos urgentes).

### 9. Contabilidad, Tesorería, Cobros y Facturación
* **Estructura de Tarifas y Plan de Pagos**: Configuración de importes por matrícula, mensualidades, transporte, materiales y cargos extraordinarios fraccionados.
* **Estado de Cuenta Estudiantil y Gestión de Saldos**: Visualización en tiempo real de cargos, abonos, descuentos, becas y saldo pendiente por estudiante.
* **Recepción y Validación de Pagos**: Carga de comprobantes de transferencia por parte de la familia, revisión por el área contable y emisión de recibos oficiales en PDF con numeración correlativa única.
* **Facturación Fiscal Hondureña (SAR)**: Módulo de emisión de facturas fiscales que cumplen con las exigencias tributarias nacionales (CAI, Rango Autorizado, ISV 15%, RTN), independiente del recibo interno.
* **Gestión de Caja Chica y Cierres de Caja**: Control de movimientos diarios de ingresos y egresos, arqueo físico y cierres de caja equilibrados.
* **Conciliación Bancaria y Cuentas por Pagar**: Importación de extractos bancarios para cruce de depósitos y registro de compras o facturas de proveedores.
* **Contabilidad General y Asientos Contables**: Plan de cuentas institucional y generación de asientos contables por partida doble.

### 10. Recursos Humanos, Planillas y Administración de Personal
* **Expediente Laboral del Empleado**: Hoja de vida del colaborador, tipo de contrato, cargo, departamento, historial de puestos y estado de vinculación.
* **Control de Asistencia y Vacaciones de Colaboradores**: Registro de jornadas de trabajo, permisos, licencias y solicitudes de vacaciones.
* **Cálculo Oficial de Planillas e Impuestos**: Motor de nómina con cálculo automático de salarios, horas adicionales, bonificaciones y deducciones de ley en Honduras (IHSS, RAP, ISR).
* **Boletas Individuales de Pago**: Emisión digital de comprobantes de salario para consulta privada e inmutable por parte de cada colaborador.

### 11. Operaciones, Servicios Complementarios y Recursos
* **Inventario e Insumos Institucionales**: Control de existencias de materiales de consumo, entradas, salidas, préstamos y alertas de stock mínimo.
* **Activos Patrimoniales y Custodia**: Registro de equipos, mobiliario y bienes institucionales con asignación de responsables y estado de conservación.
* **Biblioteca Escolar**: Catálogo de libros y recursos educativos, control de ejemplares físicos, registro de préstamos, devoluciones y reservas.
* **Transporte Escolar**: Administración de unidades, conductores, rutas, paradas asignadas y control de capacidad por vehículo.

### 12. Gestión Documental, Migración e Integración SACE
* **Formularios y Constancias Escolares**: Emisión de constancias de estudio, conducta, justificaciones y solicitudes académicas mediante plantillas institucionales.
* **Motor de Importación de Datos**: Herramienta de carga masiva de expedientes, notas o listas desde archivos Excel/CSV con mapeo inteligente de columnas y vista previa de validación.
* **Completado de Plantillas Oficiales de SACE**: Generación automática de archivos compatibles con la plataforma oficial de la Secretaría de Educación (SACE), conservando formatos, fórmulas e identificadores originales.

### 13. Seguridad, Modo Sin Conexión, Respaldos y Monitoreo Técnico
* **Modo Sin Conexión & PWA**: Service Worker (`sw.js`) con precaché estático, almacén IndexedDB nativo (`ngca_offline_db`) y cola de sincronización en reconexión.
* **Monitoreo de Salud de Servicios (Ping-Pong)**: Consola de administración técnica que mide la disponibilidad y tiempo de respuesta en tiempo real de los microservicios backend.
* **Registro de Auditoría e Historial de Cambios**: Registro inmutable de eventos del sistema (`getStructuredLogs`) garantizando total trazabilidad de operaciones sensibles.
* **Respaldos Automatizados de Información**: Generación periódica de copias de seguridad de la base de datos almacenadas en Google Drive con verificación de integridad y preservación de notas históricas.

---

## Modos de Uso y Acceso por Interfaz

1. **Portal Público y Lecciones (`index.html`)**: Acceso libre a lecciones interactivas, presentaciones pedagógicas, noticias institucionales e información de contacto.
2. **Formulario de Inicio de Sesión (`login.html`)**: Acceso autenticado con presentación sobria del logotipo institucional y enlace a recuperación de clave.
3. **Panel del Estudiante (`student-dashboard.html`)**: Vista personalizada para el alumno con su horario, materias activas, entregas pendientes, calificaciones, guías de estudio, avisos, pagos y botón global de reporte de problemas.
4. **Panel Administrativo y Docente (`teacher-dashboard.html`)**: Espacio de trabajo adaptado por rol para profesores, personal de secretaría, dirección, contabilidad y administración técnica para calificar, gestionar solicitudes, administrar cobros y supervisar tickets de soporte.
5. **Módulo de Actividades Evaluativas (`exam.html`)**: Entorno enfocado para la realización de cuestionarios y evaluaciones académicas en línea.
