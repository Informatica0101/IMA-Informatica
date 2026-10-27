# Mapa de Dependencias Académicas e Infraestructura Funcional
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**
**Versión Global:** 1.0 Final - Fase 3 Completada

---

## 1. MATRIZ MAESTRA DE REQUISITOS Y NIVELES DE SERVICIO

| Dominio Funcional | Módulo o Capacidad | Requisitos Cubiertos | Flujos e Interfaces Vinculadas | Estado Funcional | Nivel de Prioridad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Seguridad & Acceso** | Control de Privilegios por Servidor | Verificación de roles en servidor, protección contra alteración de perfiles | Portal de Inicio de Sesión, Todos los Dashboards | Completo y verificado | P0 Crítico |
| **Expedientes** | Ficha Estudiantil Única | Historial inmutable, datos de salud, antecedentes, tutores y fusión de registros | Dashboard de Dirección, Secretaría y Docencia | Completo y verificado | P0 Crítico |
| **Gestión Documental** | Numeración Segura y CUV | Generación atómica de constancias con Código Único de Verificación | Módulo de Emisión Documental y Verificación Pública | Completo y verificado | P0 Crítico |
| **Finanzas & SAR** | Facturación Fiscal Nacional | CAI, rangos autorizados, RTN, ISV 15% y retenciones de ley | ERP Financiero y Módulo de Cobros | Completo y verificado | P0 Crítico |
| **Recursos Humanos** | Nómina y Leyes Hondureñas | Cálculo de sueldos, deducciones legales (IHSS, RAP, ISR), boletas y contratos | Dashboard de Recursos Humanos y Autoservicio | Completo y verificado | P0 Crítico |
| **Experiencia de Usuario** | Omnibox de Búsqueda Global | Búsqueda multi-entidad centralizada accesible con atajo de teclado | Atajo `Ctrl + K`, Barra Superior e Interfaz General | Completo y verificado | P1 Alto |
| **Experiencia de Usuario** | Cierre de Modales y Foco | Cierre de ventanas emergentes con tecla Escape y devolución de foco visual | Todos los diálogos modales de la plataforma | Completo y verificado | P1 Alto |
| **Experiencia de Usuario** | Protección de Formulario | Advertencia de cambios no guardados y prevención de descarte de datos | Formularios de Registro, Edición y Configuración | Completo y verificado | P1 Alto |
| **Experiencia de Usuario** | Accesibilidad WCAG 2.2 AA | Etiquetas de voz, alto contraste y atributos accesibles en diálogos | Todos los componentes y vistas | Completo y verificado | P1 Alto |
| **Experiencia de Usuario** | Actividad Reciente Contextual | Historial ordenado por rol de avisos y tareas con salto directo | Paneles de Control y Menú Principal | Completo y verificado | P1 Alto |
| **Movilidad & PWA** | Operación Sin Conexión | Caché de recursos, cola de sincronización diferida e indicador de red | Service Worker, Dispositivos Móviles y Tabletas | Completo y verificado | P1 Alto |

---

## 2. ARQUITECTURA DE MÓDULOS Y MAPA DE INTERACCIÓN INSTITUCIONAL

### 2.1 Módulo de Navegación, Búsqueda y Experiencia de Usuario
- **Buscador Omnibox Global (`Ctrl + K`):** Consulta unificada de estudiantes, docentes, avisos y trámites.
- **Normalización de Búsquedas:** Búsqueda flexible e insensible a tildes o acentos ortográficos.
- **Centro de Notificaciones e Indicadores:** Indicador discreto de estado de conexión, marcas de tiempo de actualización de datos y panel de notificaciones unificado.
- **Menú Responsivo Móvil:** Drawer lateral con acordión de secciones por rol e indicador visual de la página activa.
- **Historial y Actividad Reciente:** Registro cronológico por perfil con acceso directo a expedientes y elementos consultados.

### 2.2 Módulo de Gestión Académica, Aulas y Evaluaciones
- **Estructura Curricular de 12 Áreas:** Matemáticas, Ciencias Naturales, Computación, Español, Inglés, Ciencias Sociales, Arte, Educación Física, Valores, Emprendimiento, Agricultura y Clases Complementarias.
- **Aula Virtual y Tareas Multimodales:** Publicación de contenidos, asignaciones con entregas digitales, rúbricas de evaluación paso a paso y comentarios privados.
- **Libro de Calificaciones y Boletines:** Ponderación de calificaciones por parcial, cuadros de honor e informes para padres.
- **Evaluación Formativa Independiente:** Registro separado de conducta, presentación personal y aseo.
- **Exportación SACE:** Generación de archivos de notas compatibles con la Secretaría de Educación de Honduras.

### 2.3 ERP Financiero, Facturación y Tesorería
- **Planes de Pago y Recibos:** Planes fraccionados de colegiatura, registro de comprobantes de depósito y emisión de recibos PDF.
- **Facturación Fiscal SAR:** Módulo tributario con CAI, rangos correlativos y facturación oficial.
- **Autenticación Documental por CUV:** Verificación pública por código QR o CUV impreso en certificados y constancias.
- **Caja Chica y Conciliación Bancaria:** Arqueos de caja diaria y conciliaciones de extractos de banco.

### 2.4 Recursos Humanos, Autoservicio y Desempeño
- **Expedientes Laborales y Contratos:** Administración de colaboradores, contratos, vencimientos y cargos.
- **Portal de Autoservicio del Empleado:** Consulta de recibos de pago, saldo de vacaciones, turnos asignados y capacitaciones.
- **Evaluación del Desempeño e Incidencias:** Evaluaciones periódicas de competencias, planes de mejora, actas disciplinarias y seguimiento de turnos.
- **Planillas de Sueldo:** Cálculo de salario con deducciones IHSS, RAP e ISR vigentes en Honduras.

### 2.5 Operaciones, Activos, Transporte y Biblioteca
- **Inventario Consumible y Activos Patrimoniales:** Control de Kardex, existencias mínimas y ficha de activos con responsables.
- **Biblioteca Física y Préstamos:** Préstamos de ejemplares, reservas, devoluciones y mora.
- **Transporte Escolar:** Gestión de unidades, rutas, paradas y capacidad.

### 2.6 Identidad, Permisos y Gobierno de la Información (Fase 4)
- **Firma Criptográfica HMAC-SHA256:** Sesiones de usuario firmadas con caducidad automatizada e invalidación en tiempo real.
- **Aislamiento ABAC e IDOR:** Protección de datos personales donde las consultas de estudiantes y tutores se restringen estrictamente a su contexto verificado.
- **Delegaciones de Seguridad y Matriz Dinámica:** Permisos temporales entre usuarios con fecha de vigencia y matriz de permisos por rol administrable.
- **Retención y Gobierno de Privacidad ARCO:** Políticas automáticas de conservación de datos y trámites formales de derechos sobre datos personales.
- **Propagación de Cambios y Tablero de Cumplimiento:** Bus de eventos de seguridad para invalidación inmediata de cachés en microservicios, tablero de monitoreo de auditoría e inconsistencias.

---

## 3. MAPA DE DOMINIOS Y AUTORIDAD DE DATOS

- **Identidad, Cuentas y Accesos:** Control centralizado de usuarios, perfiles de persona, relaciones familiares y auditoría de eventos.
- **Gestión Académica y Expedientes:** Control exclusivo de fichas estudiantiles, admisiones, asignaturas, horarios, matrículas y actas de notas.
- **Finanzas y Recursos Humanos:** Administración exclusiva de cuentas por cobrar, recibos, facturas fiscales, contabilidad general, expedientes de personal y planillas.
- **Aulas Virtuales y Tareas:** Gestión de guías, proyectos, asignaciones y entregas estudiantiles.
- **Evaluaciones y Exámenes:** Banco de preguntas y evaluaciones en línea.

### 2.7 Restricciones Curriculares y Dependencias entre Asignaturas (Fase 7 - TAREA-F7-IMP-18)
- **Tabla RestriccionesCurriculares:** Persistencia de reglas de dependencia entre asignaturas (`RestriccionID`, `TipoRestriccion`, `AsignaturaIdOrigen`, `AsignaturaIdDestino`, `Ambito`, `Grado`, `Seccion`, `AnoID`, `ReglaRegimen`, `Estado`, `CreadoPor`, `FechaCreacion`).
- **Endpoints:** `getCurricularConstraints` (Consulta de restricciones filtradas por año, grado y sección), `saveCurricularConstraint` (Registro y validación de reglas con detección de contradicciones).
- **Integración con checkScheduleConflict:** Evaluación automática de co-requisitos simultáneos, bloques consecutivos, exclusividad horaria y secuencia obligatoria durante la asignación y publicación de horarios.
- **Interfaz y Modal:** `#modal-curricular-constraints` en `teacher-dashboard.html` y controladores `openCurricularConstraintsModal`, `loadCurricularConstraintsList`, `handleSaveCurricularConstraintSubmit` en `js/teacher.js`.

### 2.8 Control de Capacidad y Distribución de Estudiantes por Sección (Fase 7 - TAREA-F7-IMP-19)
- **Endpoint:** `getSectionCapacityAnalyticsReport` (Análisis dinámico de matrícula activa por sección vs aforo físico de aulas y cupos administrativos).
- **Integración:** Evaluación cruzada con `Matriculas`, `OfertaAcademica` y `SedesAulas` vía `HorariosClase` para generar alertas preventivas y proponer aulas alternativas con aforo suficiente.
- **Interfaz y Modal:** `#modal-section-capacity-control` en `teacher-dashboard.html` y controladores `openSectionCapacityControlModal` y `loadSectionCapacityControlData` en `js/teacher.js`.

### 2.9 Rendimiento y Escalabilidad de Consultas de Planificación (Fase 7 - TAREA-F7-IMP-20)
- **Mecanismo de Caché:** `CacheService` de Google Apps Script con claves compuestas por año lectivo, grado, sección y docente ID (`schedules_...`).
- **Mecanismo de Involución/Purga:** Endpoint `invalidateScheduleCache` invocado en mutaciones para garantizar coherencia sin lecturas obsoletas.
- **Control Cliente:** Soporte para parámetro `bypassCache` en `js/teacher.js` y `js/student.js` para recargas forzadas bajo demanda.

### 2.10 Auditoría Operativa y Trazabilidad de Planificación (Fase 7 - TAREA-F7-IMP-21)
- **Endpoint:** `getAcademicPlanningAuditLogs` (Consolidación de trazabilidad operacional desde `HistorialCambiosEntidad` y `BitacoraTraceability`).
- **Control de Acceso:** Restricción a roles autorizados (Administrador, Director, Subdirector, Coordinador, Desarrollador) en `ROLE_PERMISSIONS`.
- **Interfaz y Modal:** `#modal-academic-audit-logs` en `teacher-dashboard.html` y controladores `openAcademicAuditLogsModal` y `loadAcademicPlanningAuditLogs` en `js/teacher.js`.

### 2.11 Plantillas de Horarios y Reutilización Controlada (Fase 7 - TAREA-F7-IMP-22)
- **Tabla PlantillasHorarios:** Almacenamiento de estructuras semanales de distribución de asignaturas (`PlantillaID`, `NombrePlantilla`, `Grado`, `Seccion`, `AnoBase`, `EstructuraJSON`, `Estado`).
- **Endpoints:** `saveScheduleTemplate`, `getScheduleTemplates`, `applyScheduleTemplate` (con modo previsualización y verificación de conflictos sin sobreescribir la plantilla original).
- **Interfaz y Modal:** `#modal-schedule-templates` en `teacher-dashboard.html` y controladores `openScheduleTemplatesModal`, `loadScheduleTemplatesList`, `handleSaveScheduleTemplateSubmit` y `promptApplyScheduleTemplate` en `js/teacher.js`.
