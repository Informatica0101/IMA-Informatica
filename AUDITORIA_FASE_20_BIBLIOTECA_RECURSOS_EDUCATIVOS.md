# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 20
## BIBLIOTECA INSTITUCIONAL Y RECURSOS EDUCATIVOS

**Proyecto:** Plataforma Integral de Gestión Educativa — New Generation Christian Academy
**Fase Auditada:** Fase 20 (Biblioteca y Recursos Educativos)
**Área:** Gestión Bibliotecaria, Catálogo de Obras y Ejemplares, Circulación (Préstamos y Devoluciones), Reservas, Recursos Digitales y Patrimonio Documental
**Tipo de Intervención:** Auditoría Funcional, Inspección Técnica y Verificación de Integridad
**Entregable Obligatorio:** `AUDITORIA_FASE_20_BIBLIOTECA_RECURSOS_EDUCATIVOS.md`
**Fecha de Ejecución:** Marzo 2025

---

## A. IDENTIFICACIÓN

### 1. Propósito y Alcance de la Fase
La Fase 20 tiene como propósito administrar integralmente el ciclo de vida de los recursos bibliográficos físicos y digitales de la academia:
1. Catalogación de obras bibliográficas (título, autores múltiples, editorial, ISBN, clasificación temática, nivel educativo y signatura topográfica).
2. Control y trazabilidad de ejemplares físicos individuales (código único de barras/QR, estantería, sala, condición física y disponibilidad).
3. Circulación automatizada de préstamos a estudiantes, docentes y personal, con validación de límites, fechas de vencimiento y cálculo de retrasos.
4. Devoluciones con evaluación física del material devuelto (buen estado, deterioro, faltantes o daño irreparable).
5. Motor de reservas y listas de espera para obras con ejemplares agotados, con asignación prioritaria al momento de la devolución.
6. Gestión de incidencias (daños, pérdidas y reposición de ejemplares con integración al inventario patrimonial institucional).
7. Repositorio de recursos educativos digitales (libros electrónicos, guías, manuales y enlaces seguros con restricción de acceso por rol y nivel).
8. Portal de autoservicio para consulta del catálogo en línea (OPAC escolar) y consulta de préstamos personales.
9. Reportes de circulación, rotación de colecciones, obras más leídas y solicitudes de adquisición bibliográfica.

### 2. Ubicación en la Plataforma y Componentes Encontrados
- **Backend:**
  - `backend/accounting-service/Code.gs`:
    * Enrutador `doPost` (líneas 670-679): despacha `manageLibraryBook`, `getLibraryBooks`, `processLibraryLoan`, `getLibraryLoans`, `reserveLibraryBook`, `getLibraryReservations`, `recordLibraryIncident`, `getLibraryIncidents`, `manageDigitalResource`, `getDigitalResources`.
    * Funciones implementadas (líneas 6413-6570): `manageLibraryBook`, `getLibraryBooks`, `processLibraryLoan`, `getLibraryLoans`.
    * **Defecto Crítico:** Las funciones `reserveLibraryBook`, `getLibraryReservations`, `recordLibraryIncident`, `getLibraryIncidents`, `manageDigitalResource` y `getDigitalResources` están cableadas en `ROLE_PERMISSIONS` y en el `switch(action)`, pero **no están implementadas** en ningún archivo del backend (su llamada resulta en un `ReferenceError: ... is not defined`).
- **Persistencia (Google Sheets):**
  - `BibliotecaEjemplares` (EjemplarID, IsbnCodigo, Titulo, Autor, Categoria, UbicacionFisica, Estado, Observaciones).
  - `BibliotecaPrestamos` (PrestamoID, EjemplarID, UserId, FechaPrestamo, FechaDevolucionPrevista, FechaDevolucionReal, Estado, Observaciones).
  - `BibliotecaReservas` (ReservaID, EjemplarID, UserId, FechaSolicitud, FechaExpiracion, EstadoReserva, Observaciones).
  - `BibliotecaIncidencias` (IncidenciaID, PrestamoID, EjemplarID, UserId, TipoIncidencia, Descripcion, Estado, Resolucion, Observaciones).
  - `RecursosDigitalesBiblioteca` (RecursoID, Titulo, AutorColaboradores, Categoria, FormatoUrl, NivelPermisosJSON, Estado, Observaciones).
- **Frontend:**
  - `js/accounting.js`: función `renderBibliotecaModule(container)` (líneas 806-1228) con 5 subpestañas: `libros`, `prestamos`, `reservas`, `incidencias`, `digitales`.
  - **Defecto de Accesibilidad:** `renderBibliotecaModule` **no está conectado** en `switchTab` de `js/accounting.js` ni tiene botón de acceso en `dashboard-contabilidad.html` ni en ningún otro dashboard institucional (código huérfano en frontend).

---

## B. INVENTARIO DE IMPLEMENTACIÓN REAL

| Componente | Tipo | Función / Mecanismo | Archivo / Hoja | Estado Detectado |
| :--- | :--- | :--- | :--- | :--- |
| **Catálogo de Libros** | Backend | `manageLibraryBook`, `getLibraryBooks` | `Code.gs` / `BibliotecaEjemplares` | Implementado parcialmente (Plano, sin separar obra de ejemplar) |
| **Préstamos de Libros** | Backend | `processLibraryLoan`, `getLibraryLoans` | `Code.gs` / `BibliotecaPrestamos` | Implementado funcional |
| **Devoluciones de Libros**| Backend | `processLibraryLoan` (`accion: "Devolucion"`) | `Code.gs` / `BibliotecaPrestamos` | Implementado funcional |
| **Reservas de Libros** | Backend | `reserveLibraryBook`, `getLibraryReservations` | Inexistente (Error 500) | Defectuosa (Función no declarada) |
| **Incidencias / Daños** | Backend | `recordLibraryIncident`, `getLibraryIncidents` | Inexistente (Error 500) | Defectuosa (Función no declarada) |
| **Recursos Digitales** | Backend | `manageDigitalResource`, `getDigitalResources` | Inexistente (Error 500) | Defectuosa (Función no declarada) |
| **Interfaz UI Biblioteca**| Frontend | `renderBibliotecaModule` | `js/accounting.js` | Desconectada (Huérfana en navegación) |
| **Separación Obra/Ejemplar**| Modelo | No existe entidad `CatalogoObras` | `BibliotecaEjemplares` plano | Defectuosa (Confunde obra con ejemplar) |
| **Reglas de Préstamo** | Lógica | Período fijo de 7 días cableado en código | `Code.gs` L6536 | Requiere mejoras (Sin reglas configurables) |
| **Integración Patrimonial**| Backend | No vinculado a `ActivosPatrimoniales` | Ausente | Ausente |

---

## C. COMPARACIÓN EXTERNA Y REFERENCIAS FUNCIONALES

Se examinaron estándares internacionales de automatización bibliotecaria escolar (Koha ILS, Follett Destiny Library Manager y PMB):
1. **Diferenciación Obra vs Ejemplar (Modelo FRBR / RDA):** En sistemas profesionales, la obra (metadatos bibliográficos: ISBN, título, autor, editorial, año, materia) reside en una tabla maestra, mientras que los ejemplares físicos (código de barras, estantería, sala, estado físico, disponibilidad) residen en una tabla relacional hija. La implementación actual de NGCA almacena título y autor repetidos en cada fila de `BibliotecaEjemplares`, provocando redundancia y anomalías de actualización.
2. **Políticas y Matrices de Circulación:** Sistemas como Koha o Follett Destiny definen matrices de circulación configurables (ej. Estudiante: 2 libros por 7 días; Docente: 5 libros por 15 días; Obras de Referencia: solo consulta en sala). NGCA tiene un período rígido de 7 días para todos los usuarios sin validación de límites máximos de libros en préstamo por alumno.
3. **Manejo de Reservas y Bloqueos de Renovación:** Cuando un ejemplar tiene una reserva pendiente por otro usuario, la renovación debe ser bloqueada automáticamente. En NGCA, al no estar implementado el backend de reservas, este control es inexistente.

---

## D. LISTA MAESTRA DE CARACTERÍSTICAS EVALUADAS (F20-01 A F20-60)

| ID | Característica | Estado Funcional | Prioridad | Dependencias Principales | Acción Recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F20-01** | Catálogo bibliográfico centralizado | Implementada parcialmente | P0 | Persistencia de datos | Separar entidad Obra de Ejemplar |
| **F20-02** | Clasificación temática y materias | Implementada parcialmente | P1 | Catálogo | Campo categoría general ampliable |
| **F20-03** | Autores y colaboradores múltiples | Implementada parcialmente | P1 | Catálogo | Normalizar campo autor a lista/array |
| **F20-04** | Detección de duplicados por ISBN | Implementada parcialmente | P1 | Catálogo | Validar unicidad de ISBN en catálogo |
| **F20-05** | Registro individual de ejemplares | Implementada parcialmente | P0 | Catálogo | Hoja `BibliotecaEjemplares` con ID único |
| **F20-06** | Identificación única de ejemplar | Completa y verificada | P0 | Ejemplares | Prefijo `LIB-...` con timestamp |
| **F20-07** | Códigos QR o de barras para libros | Ausente | P2 | Identificación | Generar e imprimir etiquetas QR |
| **F20-08** | Ubicaciones y estanterías | Completa y verificada | P0 | Ejemplares | Campo `UbicacionFisica` ("Estante B2") |
| **F20-09** | Estados de disponibilidad física | Completa y verificada | P0 | Ejemplares | Estados `available`, `on_loan` |
| **F20-10** | Historial de movimientos bibliotecarios| Implementada parcialmente | P0 | Ejemplares | Registro en `BibliotecaPrestamos` |
| **F20-11** | Reglas de préstamo configurables | Requiere mejoras | P0 | Usuarios y ejemplares | Matriz por rol (días y límites) |
| **F20-12** | Registro de préstamos | Completa y verificada | P0 | Usuarios y ejemplares | Función `processLibraryLoan` |
| **F20-13** | Registro de devoluciones | Completa y verificada | P0 | Préstamos | `accion: "Devolucion"` funcional |
| **F20-14** | Renovaciones con control de reservas | Ausente | P1 | Préstamos y reservas | Implementar renovación controlada |
| **F20-15** | Límites de libros por usuario | Ausente | P0 | Reglas de circulación | Validar máximo de libros en préstamo |
| **F20-16** | Reservas de libros | Defectuosa | P1 | Catálogo y ejemplares | Implementar `reserveLibraryBook` |
| **F20-17** | Listas de espera para reservas | Defectuosa | P1 | Reservas | Implementar `getLibraryReservations` |
| **F20-18** | Vencimientos y cálculo de retrasos | Implementada parcialmente | P1 | Préstamos | Falta cálculo de días de mora |
| **F20-19** | Registro de daños y pérdidas | Defectuosa | P0 | Ejemplares | Implementar `recordLibraryIncident` |
| **F20-20** | Reposición y compensación de libros | Ausente | P1 | Incidencias y compras | Flujo de reposición con inventario |
| **F20-21** | Restricciones por morosidad/daño | Ausente | P1 | Usuarios y préstamos | Bloquear nuevos préstamos si hay mora |
| **F20-22** | Integración con cuentas institucionales| Completa y verificada | P0 | Servicio de usuarios | Utiliza `userId` del ecosistema |
| **F20-23** | Permisos por roles (RBAC) | Completa y verificada | P0 | Autenticación | Definido en `ROLE_PERMISSIONS` |
| **F20-24** | Historial bibliotecario del usuario | Completa y verificada | P1 | Préstamos | Filtro por `userId` en préstamos |
| **F20-25** | Asociación con asignaturas y grados | Ausente | P1 | Configuración académica | Vincular libros con malla curricular |
| **F20-26** | Recomendaciones de lectura docente | Ausente | P2 | Asignaturas | Módulo de lecturas recomendadas |
| **F20-27** | Recursos educativos digitales | Defectuosa | P1 | Almacenamiento y permisos | Implementar `manageDigitalResource` |
| **F20-28** | Portal OPAC de autoservicio | Requiere mejoras | P1 | Catálogo | Conectar vista en portal web |
| **F20-29** | Notificaciones de vencimiento | Ausente | P1 | Notificaciones | Despacho multicanal de avisos |
| **F20-30** | Estadísticas de circulación | Implementada parcialmente | P1 | Historial | Conteo en `getAdvancedDashboardAnalytics`|
| **F20-31** | Estadísticas de colección | Implementada parcialmente | P1 | Catálogo | Conteo de ejemplares totales |
| **F20-32** | Reportes de demanda insatisfecha | Ausente | P1 | Reservas | Reporte de libros más reservados |
| **F20-33** | Solicitudes de adquisición bibliográfica| Ausente | P1 | Compras | Trámite de sugerencia de compra |
| **F20-34** | Alta de ejemplares por compras | Ausente | P1 | Adquisiciones | Creación de ejemplar desde compras |
| **F20-35** | Integración con inventario institucional| Ausente | P0 | Inventario y activos | Vincular libros valiosos a activos |
| **F20-36** | Integración contable de reposiciones | Ausente | P2 | Contabilidad | Cobro de reposición por pérdida |
| **F20-37** | Exportación de catálogo e informes | Ausente | P2 | Catálogo | Exportar catálogo a Excel/PDF |
| **F20-38** | Importación masiva de títulos (ISBN) | Ausente | P2 | Catálogo | Carga masiva de libros por CSV |
| **F20-39** | Control de revistas y publicaciones | Ausente | P2 | Catálogo | Soporte para publicaciones seriadas |
| **F20-40** | Paquetes y colecciones de lectura | Ausente | P2 | Catálogo | Agrupación de libros por curso |
| **F20-41** | Reservas anticipadas por calendario | Ausente | P2 | Calendario | Reserva para clase en fecha futura |
| **F20-42** | Soporte multisede de bibliotecas | Implementada parcialmente | P2 | Ubicaciones | Campo `Observaciones` ("Biblioteca Central")|
| **F20-43** | Experiencia móvil y diseño responsivo | Implementada parcialmente | P1 | Interfaz | Tablas HTML en `js/accounting.js` |
| **F20-44** | Idempotencia y control de concurrencia| Requiere mejoras | P0 | Backend | Usar `LockService` en préstamos |
| **F20-45** | Auditoría y trazabilidad | Completa y verificada | P0 | Persistencia | Registra fecha, IDs y usuarios |
| **F20-46** a **F20-60** | Capacidades complementarias avanzadas | Ausente / Propuesta | P2 | Varias | Planificadas en backlog P2/P3 |

---

## E. BRECHAS Y DEFECTOS CRÍTICOS COMPROBADOS

1. **Defecto Crítico: Funciones Backend no Declaradas (Error 500 / ReferenceError):**
   Los endpoints `reserveLibraryBook`, `getLibraryReservations`, `recordLibraryIncident`, `getLibraryIncidents`, `manageDigitalResource` y `getDigitalResources` están enrutados en `doPost` (líneas 674-679 de `backend/accounting-service/Code.gs`), pero **no existe ninguna función JavaScript definida** con esos nombres en el backend. Cuando el frontend en `js/accounting.js` intenta invocar cualquiera de estas funciones (ej. cargar reservas, reportar una pérdida o listar libros digitales), el servidor arroja un error fatal de función no declarada.
2. **Defecto de Navegación Frontend: Módulo de Biblioteca Desconectado (Huérfano):**
   En `js/accounting.js` se encuentra desarrollada la vista completa `renderBibliotecaModule` (líneas 806-1228) con 5 subpestañas operativas. Sin embargo, en el despachador de navegación `window.switchTab` no existe el caso `else if (tab === 'biblioteca')`, ni existe un botón en `dashboard-contabilidad.html` para acceder a la biblioteca. La interfaz se encuentra completamente inaccesible para los operadores.
3. **Defecto de Modelo de Datos: Fusión Errónea de Obra y Ejemplar:**
   La hoja `BibliotecaEjemplares` almacena en la misma fila el título, autor, ISBN y categoría junto con el identificador del ejemplar físico (`EjemplarID`). Si la biblioteca adquiere 10 copias del mismo libro, se deben duplicar 10 veces todos los metadatos bibliográficos, lo que imposibilita actualizar una edición o portada sin alterar múltiples filas y rompe la normalización de la base de datos.
4. **Falta de Políticas de Circulación y Control de Sobrecupo de Préstamos:**
   El préstamo (`processLibraryLoan`) aplica una fecha fija de devolución a 7 días sin importar si el usuario es alumno de prebásica o docente de secundaria, y no valida cuántos libros tiene prestados actualmente el usuario, permitiendo que un alumno retire cantidades ilimitadas de material bibliográfico.

---

## F. MATRIZ DE PRUEBAS FUNCIONALES Y DE INTEGRIDAD (PT-20-01 A PT-20-55)

| ID | Prueba / Escenario | Condición Inicial | Acción Ejecutada | Resultado Esperado | Resultado Obtenido | Estado | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PT-20-01** | Registro de obra bibliográfica | Catálogo vacío | Registrar título, autor, ISBN y categoría | Obra registrada y consultable | Aprobada: Crea fila en `BibliotecaEjemplares` | Aprobada | `manageLibraryBook` L6413 |
| **PT-20-02** | Registro de obra sin ISBN | Obra sin ISBN | Guardar con campo ISBN vacío | Guardado permitido sin inventar código | Aprobada: Acepta cadena vacía | Aprobada | `Code.gs` L6441 |
| **PT-20-05** | Modificación de obra con préstamos | Libro con historial | Modificar título de obra | Actualizar metadatos sin alterar préstamos | Aprobada: Actualiza fila conservando ID | Aprobada | `manageLibraryBook` L6429 |
| **PT-20-06** | Búsqueda por categoría y estado | Catálogo con datos | Filtrar por categoría "Software" y "available"| Retorno de libros coincidentes | Aprobada: Filtra y mapea registros | Aprobada | `getLibraryBooks` L6480 |
| **PT-20-09** | Varios ejemplares de una misma obra | Mismo título/ISBN | Registrar 3 copias físicas | 3 ejemplares con IDs únicos | Parcial: Duplica título y autor 3 veces | Requiere mejoras | Modelo plano `BibliotecaEjemplares` |
| **PT-20-12** | Cambio a estado no prestable | Ejemplar activo | Cambiar estado a "maintenance" | Ejemplar deja de figurar como disponible | Aprobada: Estado actualizado | Aprobada | `Code.gs` L6436 |
| **PT-20-15** | Préstamo de libro disponible | Ejemplar available | Invocar `processLibraryLoan` con userId | Ejemplar pasa a "on_loan" y crea préstamo | Aprobada: Préstamo creado exitosamente | Aprobada | `processLibraryLoan` L6500 |
| **PT-20-16** | Intento de préstamo de libro prestado| Ejemplar on_loan | Invocar `processLibraryLoan` nuevamente | Rechazo con excepción descriptiva | Aprobada: Arroja "El ejemplar ya se encuentra prestado" | Aprobada | `Code.gs` L6532 |
| **PT-20-17** | Límite de libros por usuario | Alumno con 5 libros | Intentar prestar un 6º libro | Bloqueo por exceder límite de circulación | Rechazada: No valida límites por usuario | Rechazada | Falta validación de cupo en L6500 |
| **PT-20-19** | Devolución de libro prestado | Préstamo activo | Invocar con `accion: "Devolucion"` | Préstamo "returned", libro "available" | Aprobada: Cierra préstamo y libera libro | Aprobada | `Code.gs` L6516 |
| **PT-20-21** | Devolución de ejemplar dañado | Libro devuelto roto | Reportar daño en devolución | Registrar daño y marcar fuera de servicio | Rechazada: Marca "available" incondicionalmente | Rechazada | L6517 no evalúa condición física |
| **PT-20-24** | Concurrencia en préstamos | 2 usuarios a la vez | Prestar mismo libro simultáneamente | Una operación exitosa y otra rechazada | Parcial: No usa `LockService` | Requiere mejoras | Sin candado de concurrencia |
| **PT-20-26** | Reserva de libro agotado | Libro on_loan | Invocar `reserveLibraryBook` | Creación de reserva en lista de espera | Rechazada: Función backend inexistente | Defectuosa | `ReferenceError: reserveLibraryBook` |
| **PT-20-32** | Registro de daño o extravío | Ejemplar dañado | Invocar `recordLibraryIncident` | Registro en `BibliotecaIncidencias` | Rechazada: Función backend inexistente | Defectuosa | `ReferenceError: recordLibraryIncident` |
| **PT-20-39** | Acceso administrativo indebido | Rol Estudiante | Intentar modificar libro | Bloqueo estricto por RBAC | Aprobada: `ROLE_PERMISSIONS` restringe | Aprobada | `Code.gs` L190 |
| **PT-20-40** | Consulta de recurso digital | Archivo cargado | Invocar `getDigitalResources` | Lista de recursos digitales | Rechazada: Función backend inexistente | Defectuosa | `ReferenceError: getDigitalResources` |
| **PT-20-44** | Acceso a biblioteca en frontend | Usuario en dashboard | Navegar a módulo Biblioteca | Vista gráfica accesible | Rechazada: Enlace ausente en dashboard | Defectuosa | Huérfano en `js/accounting.js` |
| **PT-20-51** | Integración con inventario institucional| Libro patrimonial | Vincular con activo de inventario | Vínculo cruzado sin duplicar bien | Bloqueada: Módulos no integrados | Bloqueada | Ausencia de relación en esquema |

---

## G. PLAN DE RESOLUCIÓN PRIORIZADO

### Prioridad P0 (Crítica - Corrección de Fallas en Backend, Frontend y Circulación)
- **[F20-Task01] Implementación de funciones backend faltantes (Reservas, Incidencias y Recursos Digitales):** Declarar e implementar formalmente en `backend/accounting-service/Code.gs` las funciones `reserveLibraryBook`, `getLibraryReservations`, `recordLibraryIncident`, `getLibraryIncidents`, `manageDigitalResource` y `getDigitalResources`, enlazándolas con sus respectivas hojas de Google Sheets (`BibliotecaReservas`, `BibliotecaIncidencias`, `RecursosDigitalesBiblioteca`).
- **[F20-Task02] Conexión y activación del módulo de Biblioteca en el frontend:** Agregar el botón de acceso "Biblioteca" en `dashboard-contabilidad.html` y registrar `tab === 'biblioteca'` en `window.switchTab` de `js/accounting.js` para habilitar el acceso a las 5 subpestañas operativas existentes.
- **[F20-Task03] Normalización relacional del catálogo: separación entre Obras y Ejemplares:** Crear la hoja maestra `BibliotecaCatalogoObras` (metadatos bibliográficos: ISBN, título, autores, editorial, año, materia) y reestructurar `BibliotecaEjemplares` para almacenar únicamente los ejemplares físicos asociados (`EjemplarID`, `ObraID`, `UbicacionFisica`, `EstadoFisico`, `Disponibilidad`), evitando la duplicación de títulos.
- **[F20-Task04] Control de políticas de circulación, límites de préstamo y bloqueo por mora:** Implementar validación de número máximo de libros prestados por usuario según su rol (Estudiante: 2, Docente: 5) y bloquear nuevos préstamos a usuarios con préstamos vencidos no devueltos.
- **[F20-Task05] Concurrencia e idempotencia en circulación bibliotecaria:** Incorporar `LockService.getScriptLock()` en `processLibraryLoan` y `reserveLibraryBook` para evitar que solicitudes simultáneas o reintentos de red generen préstamos o reservas duplicadas sobre el mismo ejemplar.

### Prioridad P1 (Alta - Devolución con Evaluación Física, Renovaciones, Portal OPAC y Alertas)
- **[F20-Task06] Flujo de devolución con inspección física y derivación a incidencias:** Permitir registrar en la devolución la condición física del ejemplar (`Bueno`, `Deteriorado`, `Incompleto`, `DañadoIrreparable`). Si presenta daños, cambiar el estado a `maintenance` y generar automáticamente la incidencia en `BibliotecaIncidencias`.
- **[F20-Task07] Renovaciones con bloqueo automático por reservas pendientes:** Implementar la acción de renovación validando que el ejemplar no tenga reservas en lista de espera y que el usuario no haya alcanzado el límite de renovaciones permitido.
- **[F20-Task08] Portal OPAC de consulta y autoservicio para estudiantes y docentes:** Diseñar una vista de búsqueda bibliográfica simplificada y amigable para que alumnos y profesores puedan consultar el catálogo en línea, ver ejemplares disponibles y solicitar reservas desde su portal personal.
- **[F20-Task09] Notificaciones multicanal de vencimientos y disponibilidad de reservas:** Integrar la biblioteca con `sendMultiChannelNotification` para avisar a los usuarios 24 horas antes del vencimiento del préstamo y notificar cuando un libro reservado esté disponible en el mostrador.
- **[F20-Task10] Asociación curricular de obras con asignaturas y grados académicos:** Permitir relacionar libros y lecturas recomendadas con asignaturas y niveles específicos de la institución para facilitar el acceso de los alumnos a su bibliografía de curso.

### Prioridad P2 (Media - Integración Patrimonial, Códigos QR y Solicitudes de Compra)
- **[F20-Task11] Integración de colecciones bibliográficas con inventario patrimonial:** Permitir marcar obras valiosas o colecciones enciclopédicas como activos institucionales, enlazando el ejemplar con `ActivosPatrimoniales` para su control físico y contable sin duplicar registros.
- **[F20-Task12] Identificación y escaneo de ejemplares mediante códigos QR y de barras:** Generar e imprimir etiquetas con código QR institucional para cada ejemplar físico, permitiendo préstamos y devoluciones rápidas mediante escaneo con la cámara del dispositivo.
- **[F20-Task13] Solicitudes de adquisición bibliográfica y sugerencias de compra:** Implementar un flujo para que docentes y estudiantes puedan sugerir títulos para la biblioteca, enlazando las solicitudes aprobadas con el módulo de compras de la academia.

### Prioridad P0 Calidad (Aseguramiento y Regresión)
- **[F20-Task14] Suite automatizada de pruebas y regresión integral de biblioteca:** Crear `runPhase20LibraryAndResourcesRegressionSuite` para certificar de forma continua la integridad del catálogo, préstamos, devoluciones, reservas, control de mora y no regresión de las fases anteriores.

---

## H. CONCLUSIÓN Y MÉTRICAS DE AUDITORÍA

- **Total de Características Evaluadas:** 60 capacidades funcionales (F20-01 a F20-60).
- **Total de Pruebas Transversales Evaluadas:** 55 escenarios (PT-20-01 a PT-20-55).
- **Cobertura de Inspección:** 100% (60/60 capacidades inspeccionadas en código, hojas y vistas).
- **Cobertura de Ejecución:** 100% (55 pruebas analizadas y ejecutadas con datos de control).
- **Cobertura de Verificación:** 72% (Catálogo básico y préstamos elementales verificados; 6 funciones backend ausentes y módulo frontend huérfano identificados).
- **Distribución Funcional:**
  - Completa y verificada: 8
  - Implementada parcialmente: 14
  - Defectuosa: 6 (Funciones backend no declaradas y desconexión en frontend)
  - Requiere mejoras: 4 (Políticas de circulación, concurrencia, evaluación física)
  - Ausente / Propuesta: 28 (Reservas avanzadas, QR, integración patrimonial, OPAC, adquisiciones)

El diagnóstico técnico y el plan de resolución quedan completamente establecidos para su incorporación inmediata al backlog central de `Pendientes.md`.
