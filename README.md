# Ecosistema Educativo New Generation Christian Academy - Plataforma Integral de Gestión Institucional

Bienvenido a la documentación oficial y guía funcional del **Ecosistema Educativo New Generation Christian Academy** (Versión Global **1.0** - Fase 5 Final: Admisiones, Aspirantes, Vinculación de Responsables y Portal de Familias).

La plataforma constituye una solución tecnológica centralizada que integra la gestión académica, administrativa, financiera, comunicativa, de recursos humanos y de operaciones físicas de la institución. Conecta en tiempo real a directivos, coordinadores, docentes, estudiantes, padres de familia y personal administrativo en un entorno único, seguro, intuitivo y accesible desde navegadores web y dispositivos móviles (PWA).

---

## Módulos Funcionales, Herramientas y Servicios Institucionales

### 1. Experiencia de Usuario, Navegación Unificada y Accesibilidad
* **Omnibox de Búsqueda Global (`Ctrl + K`):** Buscador inteligente centralizado que permite localizar rápidamente estudiantes, usuarios, avisos, documentos, trámites administrativos y accesos directos de navegación con resaltado automático de coincidencias.
* **Búsquedas Normalizadas e Insensibles a Tildes:** Normalización automática de caracteres con diacríticos que permite encontrar registros sin importar variaciones ortográficas o de acentuación.
* **Cierre Universal de Modales y Restauración de Foco:** Control táctil y por teclado (`Tecla Escape`) que cierra ventanas emergentes activas restaurando automáticamente el foco visual al elemento de origen para mejorar el flujo de trabajo.
* **Protección Contra Pérdida de Cambios No Guardados:** Detección en tiempo real de modificaciones en formularios estáticos y dinámicos que previene la salida accidental de la página sin confirmar descartes.
* **Indicadores de Frescura y Sincronización de Datos:** Placas informativas de tiempo relativo ("Hace X min") que señalan la actualización de la información con botón de refresco manual e indicadores claros de estado.
* **Menú Lateral Responsivo por Rol (Drawer Móvil):** Navegación adaptativa con menú tipo acordeón para dispositivos móviles que expande secciones contextuales según el perfil del usuario activo y resalta la vista en uso.
* **Indicador de Conexión y Estado en Línea:** Insignia discreta en tiempo real que distingue entre conectividad a red y disponibilidad de servicios para operar con seguridad.
* **Sistema Integrado de Reporte de Incidencias Técnicas:** Modal de soporte que permite a los usuarios reportar problemas especificando área funcional, descripción y comportamiento esperado con seguimiento directo.
* **Cumplimiento de Accesibilidad WCAG 2.2 AA:** Interfaz adaptada con contraste optimizado, etiquetas de voz para lectores de pantalla en botones e iconos, e identificadores accesibles en todos los diálogos modales.
* **Vista de Actividad Reciente Contextual:** Historial ordenado cronológicamente por rol que diferencia entre avisos informativos y tareas pendientes, permitiendo retornar con un clic a registros previamente consultados.
* **Preferencias Personalizadas y Esqueletos de Carga:** Opciones individuales de densidad de pantalla, temas y vistas con indicadores visuales animados durante la carga de información.

### 2. Gestión Académica, Admisiones, Matrícula y Expediente Estudiantil
* **Ciclo Escolar y Estructura Curricular:** Planificación de periodos lectivos (parciales, semestres, trimestres), jornadas académicas, catálogo de 12 áreas curriculares estructuradas y planes de estudio.
* **Expediente Digital Único:** Registro integral del estudiante que consolida datos personales, tutores legales, documentos digitalizados, línea de tiempo de movimientos académicos (traslados, cambios de sección, retiros) y prevención de expedientes duplicados.
* **Formulario Público de Admisión y Stepper Guiado:** Proceso público de postulación de aspirantes accesible en móvil y escritorio con stepper de pasos, validación de DNI de 13 dígitos (+504), consentimiento ARCO y consulta pública por código de seguimiento.
* **Consola Administrativa de Admisiones y Matrícula:** Panel exclusivo para Secretaría General que permite auditar postulaciones, evaluar requisitos, agendar entrevistas/evaluaciones, gestionar listas de espera con orden de prelación, controlar cupos atómicos por sección y realizar la conversión a expediente estudiantil.
* **Gestión Documental Pre-Matrícula:** Carga y calificación de documentos de aspirantes adjuntos a su código de postulación antes de formalizar la matrícula, con migración automática de archivos al expediente.
* **Detección y Resolución de Duplicados:** Algoritmo de detección de coincidencias exactas, altas y medias entre aspirantes y estudiantes existentes con panel de resolución motivada.
* **Guardado Automático de Borradores y Optimización:** Auto-guardado híbrido local/servidor con recuperación tras desconexiones, paginación en servidor y caché selectiva de 10 minutos para ofertas académicas.
* **Gestión de Horarios y Espacios Físicos:** Matriz de horarios por nivel, grado y docente, control de capacidad de aulas, prevención automática de solapamiento de horarios y asignación de docentes sustitutos.

### 3. Aula Virtual, LMS y Material Didáctico
* **Aulas Virtuales por Asignatura:** Publicación de anuncios, guías de estudio, lecciones interactivas, presentaciones y recursos educativos digitales.
* **Proyectos, Tareas Multimodales y Rúbricas:** Creación de asignaciones con fechas de entrega, cargas de archivos adjuntos, rúbricas de evaluación paso a paso y retroalimentación privada docente-estudiante.
* **Biblioteca Digital y Recursos Reutilizables:** Catálogo organizado de lecturas, proyectos interdisciplinarios, guías didácticas y material complementario etiquetado por área y grado.

### 4. Evaluaciones, Calificaciones e Informes Académicos
* **Libro de Calificaciones Consolidado:** Registro centralizado de notas por parcial y materia con ponderaciones parametrizables, cálculo de promedios e inalterabilidad de periodos cerrados.
* **Evaluaciones y Cuestionarios en Línea:** Aplicación de exámenes interactivos con bancos de preguntas por asignatura y calificación automatizada.
* **Boletines y Cuadros de Honor:** Generación de libretas de calificaciones, cuadros de honor, fichas de rendimiento e historiales académicos para padres y estudiantes.
* **Evaluación Formativa Independiente:** Valoración separada de conducta, presentación personal e higiene que no altera los promedios académicos.
* **Compatibilidad con Secretaría de Educación (SACE):** Exportación de reportes académicos en el formato oficial requerido por la Secretaría de Educación de Honduras.

### 4. Planificación Académica, Horarios y Gestión de Recursos
* **Matriz Interactiva de Planificación Horaria:** Visualización y edición dinámica de la distribución semanal de clases con perspectivas por docente, grado, sección y aula.
* **Detección e Invariantes de Conflictos:** Validación en tiempo real para prevenir colisiones de horario, sobreposición de docentes, aulas ocupadas y choques de infraestructura.
* **Resolución Asistida de Conflictos:** Propuesta automática de alternativas disponibles de aulas libres, franjas de tiempo desocupadas y docentes sustitutos.
* **Escenarios Borrador de Planificación Masiva:** Generación y evaluación de alternativas de distribución horaria sin alterar el calendario oficial publicado.
* **Capacidad y Carga Laboral Docente:** Configuración de topes semanales de horas de clase por contrato y preferencias de jornada laboral.
* **Disponibilidad, Equipamiento y Mantenimiento de Aulas:** Gestión de capacidad física, inventario de recursos tecnológicos en aula y ventanas de indisponibilidad por mantenimiento.
* **Control de Sobrecarga de Evaluaciones:** Validación preventiva para evitar la programación excesiva de exámenes el mismo día para un grupo estudiantil.
* **Excepciones de Sesión Única:** Registro de cancelaciones o reprogramaciones puntuales de una fecha sin alterar la serie de clases recurrentes.
* **Historial de Versiones y Restauración Controlada:** Registro de versiones de horarios publicados, comparación visual de cambios y restauración garantizada de matrices.
* **Notificaciones Automatizadas de Cambio de Horario:** Avisos en tiempo real a docentes, padres y estudiantes ante reprogramaciones, cambios de aula o docentes sustitutos.
* **Sincronización en Tiempo Real del Horario Familiar:** Visualización del horario actualizado en el Portal Estudiantil y Familiar con indicador de frescura de información.
* **Reportes Analíticos de Calidad y Ocupación:** Métricas de porcentaje de uso de aulas, equidad en la distribución de carga docente y balance de bloques lectivos.
* **Importación y Exportación Masiva de Horarios:** Carga e inserción masiva de planes horarios en formatos CSV y JSON con pre-validación de formato y conflictos.
* **Previsualización de Impacto de Publicación:** Evaluación de bloques afectados, aulas involucradas y alertas previas a la publicación oficial de horarios.
* **Protección y Control de Concurrencia:** Garantía de coherencia de datos ante ediciones simultáneas en la matriz de planificación.
* **Sustituciones y Reasignaciones Docentes:** Registro de coberturas temporales con asignación de docentes sustitutos y control de vigencia.
* **Reserva de Eventos y Recursos Institucionales:** Solicitud y apartado de aulas, laboratorios, auditorios y equipos para actividades especiales.
* **Restricciones Curriculares y Dependencias entre Asignaturas:** Configuración de co-requisitos simultáneos, bloques consecutivos de clases y exclusividades de horario.
* **Control de Aforo y Capacidad de Secciones:** Comparación continua entre la matrícula activa, el límite administrativo y la capacidad física del aula con sugerencia de espacios alternativos.
* **Herramientas de Impresión y Exportación Oficial:** Formateo especial para impresión A4 con membrete institucional, sello de versión publicada y marca de agua oficial.
* **Personalización de Vistas de Calendario:** Filtros por categoría de evento (clases, exámenes, actos institucionales, mantenimiento) y leyenda cromática adaptativa.
* **Verificación Automatizada de Calidad de Planificación:** Batería de pruebas continuas que aseguran la consistencia y ausencia de regresiones en la programación académica.

### 5. Portal Familiar y Comunicación Multicanal
* **Consola Multiestudiante para Padres:** Vista consolidada para tutores con múltiples hijos inscritos, permitiendo alternar fácilmente entre expedientes, calificaciones y avisos.
* **Comunicación Institucional Segura:** Circulares, noticias, avisos generales y mensajería interna entre padres, docentes y dirección.
* **Centro de Notificaciones:** Sistema de alertas en tiempo real para tareas pendientes, convocatorias a reuniones, avisos financieros y avisos de rendimiento académico.

### 6. ERP Financiero, Pagos, Cobros y Facturación SAR
* **Planes de Pago y Convenios Familiares:** Desglose de colegiaturas, matrícula, transporte, servicios especiales y estructuración de acuerdos de pago personalizados.
* **Recepción y Validación de Pagos:** Carga de comprobantes por parte de las familias, cola de revisión contable y emisión de recibos oficiales descargables en PDF.
* **Facturación Fiscal Hondureña (SAR):** Emisión de facturas fiscales de cumplimiento tributario nacional (CAI, Rango Autorizado, ISV 15%, RTN).
* **Numeración Documental CUV:** Generación atómica de documentos oficiales con Código Único de Verificación para verificación pública anticorrupción.
* **Tesorería, Caja Chica y Cierres:** Arqueos diarios de caja, depósitos bancarios, conciliaciones de extractos y estados financieros comparativos.

### 7. Recursos Humanos, Planillas y Administración de Personal
* **Expediente Laboral y Contratos:** Control de personal, contratos de trabajo, avisos de vencimiento y asignación de cargos por departamento.
* **Gestión de Asistencia, Permisos y Vacaciones:** Solicitud y aprobación de vacaciones, justificaciones médicas, registro de asistencia e incidencias laborales.
* **Cálculo Oficial de Planillas:** Procesamiento de sueldos, horas adicionales, bonificaciones y retenciones de ley en Honduras (IHSS, RAP, ISR).
* **Portal de Autoservicio del Empleado:** Espacio privado para que el colaborador consulte sus boletas de pago, historial de vacaciones, turnos asignados, capacitaciones y contratos.
* **Evaluación del Desempeño y Capacitación:** Evaluaciones periódicas de competencias por puesto, planes de desarrollo profesional, historial de sanciones e incidencias, y seguimiento de certificaciones.

### 8. Operaciones Físicas, Inventario y Recursos
* **Almacén e Inventario Consumible:** Control de existencias de materiales, entradas, salidas por consumo interno y alertas de desabastecimiento.
* **Activos Patrimoniales y Custodia:** Registro de bienes, equipos y mobiliario con asignación de responsables y seguimiento de mantenimiento preventivo/correctivo.
* **Biblioteca Física:** Préstamo y devolución de libros, control de ejemplares, reservas y registro de incidencias.
* **Transporte Escolar:** Gestión de unidades, rutas, paradas asignadas y control de capacidad por vehículo.

### 9. Gobernanza, Seguridad y Soporte Técnico
* **Control de Acceso Basado en Roles y Atributos (RBAC/ABAC):** Firmas criptográficas HMAC-SHA256 para tokens de sesión y restricciones de privacidad a nivel de objeto e identidad en el servidor (`_verifiedUserId`).
* **Revocación de Sesiones y Control de Fuerza Bruta:** Invalidación en tiempo real de credenciales revocadas o suspendidas y bloqueo automático ante intentos fallidos reiterados con registro de auditoría (`LOGIN_FAILED`).
* **Motor Transversal de Delegaciones Temporales:** Delegación de capacidades específicas con fechas de vigencia y autorizaciones acotadas.
* **Retención y Anonimización Automatizada de Datos:** Evaluación periódica de plazos de conservación, purga de bitácoras obsoletas, anonimización de cuentas inactivas y preservación legal obligatoria para expedientes académicos y financieros.
* **Matriz Dinámica de Permisos y Gobierno ARCO:** Configuración de reglas de acceso por rol y panel de solicitudes de derechos sobre datos personales (Acceso, Rectificación, Cancelación y Oposición).
* **Trazabilidad, Diffs e Historial de Cambios:** Registro de versiones anteriores y posteriores sanitizadas para reconstrucción cronológica de modificaciones en cuentas y recursos.
* **Gestión de Cargos, Departamentos y Ciclo de Vida de Cuentas:** Máquina de estados con transiciones permitidas para cuentas de usuario, asignación de cargos e historial de adscripciones.
* **Propagación de Eventos de Seguridad y Reintentos:** Cola de eventos de seguridad que notifica y purga cachés locales e inter-servicio en tiempo real con cola de reintentos.
* **Tablero de Seguridad, Auditoría y Cumplimiento:** Panel interactivo de monitoreo de intentos fallidos, accesos revocados, delegaciones activas, reportes de revisión de privilegios y paginación en servidor de bitácoras.
* **Escáner de Reconciliación de Identidad:** Sistema automatizado de detección y autocorrección de inconsistencias referenciales, delegaciones huérfanas y adscripciones obsoletas.
* **Tablero de Salud Operativa e Indicadores:** Monitor en tiempo real del estado de los servicios, volumen de peticiones y prevención de cuotas de almacenamiento.
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
