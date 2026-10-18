# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 6 (OPERACIONES FÍSICAS DEL INSTITUTO)

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Fase Auditada:** Fase 6. Operaciones físicas del instituto (Ampliación Fase 11 del Plan General)
**Fecha de Auditoría:** Mayo 2024
**Responsable:** Jules

---

## A. RESUMEN EJECUTIVO

La auditoría funcional e integral de las **Operaciones Físicas del Instituto** evaluó el estado técnico, funcional, de persistencia, de permisos y de interfaz de usuario de las 12 áreas normativas definidas (OP-01 a OP-12). Se examinaron en profundidad los microservicios `backend/accounting-service/Code.gs` y `backend/academic-service/Code.gs`, así como los controladores de interfaz `js/accounting.js`, `js/teacher.js`, `js/student.js` y las vistas `dashboard-contabilidad.html`, `teacher-dashboard.html` y `student-dashboard.html`.

### Estado General de la Implementación
1. **Backend y Esquema de Datos (Google Sheets):** Presenta una cobertura sólida a nivel de base de datos con 11 hojas especializadas creadas automáticamente en la inicialización (`BibliotecaEjemplares`, `BibliotecaPrestamos`, `BibliotecaReservas`, `BibliotecaIncidencias`, `ActivosPatrimoniales`, `AsignacionesActivos`, `AlmacenesUbicaciones`, `MaterialesSolicitudes`, `InventariosConteosFisicos`, `MantenimientoOrdenes`, `TransporteRutas`, `TransporteAsignaciones`, `BajasBienes`).
2. **Servicios y Endpoints GAS:** Se identificaron **21 funciones de backend operativas** para compras, almacenes, inventario Kardex, mantenimiento, biblioteca, activos patrimoniales y transporte.
3. **Interfaz de Usuario (Frontend UI):** Existe una fragmentación marcada. Mientras que las vistas de Kardex, Almacenes, Solicitudes, Activos, Mantenimiento, Bajas y Biblioteca están renderizadas en `dashboard-contabilidad.html` vía `js/accounting.js`, el módulo de **Transporte Escolar y Asignación de Rutas es 100% AUSENTE en el frontend** (no existe interfaz para docentes, estudiantes ni personal administrativo para consultar o asignar rutas).
4. **Flujos Integrados y Brechas Principales:**
   - **Biblioteca (OP-01):** Existen endpoints para catálogo y préstamos (`manageLibraryBook`, `processLibraryLoan`), pero las reservas (`reserveLibraryBook`), incidencias (`recordLibraryIncident`) y catálogo de títulos desacoplado de ejemplares físicos carecen de UI.
   - **Aulas y Espacios (OP-07):** El catálogo de espacios (`SedesAulas`) funciona en el área académica para choque de horarios, pero no existe una herramienta de reserva temporal de espacios no académicos (ej. auditorio, canchas).
   - **Reparaciones e Insumos (OP-02 / OP-05):** Falta una ventanilla de auto-servicio de reporte de fallas/reparaciones para docentes sin permisos de contabilidad.

---

## B. INVENTARIO DE COMPONENTES EXISTENTES

### 1. Archivos de Código y Vistas
- `backend/accounting-service/Code.gs`: Microservicio principal de finanzas, compras, almacenes, activos, biblioteca y transporte.
- `backend/academic-service/Code.gs`: Microservicio académico que gestiona el catálogo de espacios y aulas (`SedesAulas`).
- `js/accounting.js`: Controlador de interfaz para el panel contable y de operaciones físicas (`renderInventarioModule`, `renderBibliotecaModule`, `renderActivosView`, `renderMantenimientoView`, `renderAlmacenesView`, `renderSolicitudesView`, `renderBajasView`).
- `dashboard-contabilidad.html`: Vista donde se alojan las pestañas operativas de inventario, activos y biblioteca.

### 2. Hojas de Cálculo (Entidades de Persistencia)
- `BibliotecaEjemplares`: Registro de libros y copias físicas.
- `BibliotecaPrestamos`: Control de préstamos y devoluciones.
- `BibliotecaReservas`: Registro de reservas temporales.
- `BibliotecaIncidencias`: Historial de daños y pérdidas bibliográficas.
- `ActivosPatrimoniales`: Registro de bienes duraderos e identificación de inventario.
- `AsignacionesActivos`: Historial de custodia y actas de entrega.
- `AlmacenesUbicaciones`: Bodegas, sedes y tipos de áreas.
- `MaterialesSolicitudes`: Requisiciones internas de suministros y consumibles.
- `InventariosConteosFisicos`: Auditorías e inventarios físicos periódicos.
- `MantenimientoOrdenes`: Ordenes de mantenimiento preventivo/correctivo y repuestos.
- `TransporteRutas`: Registro de unidades, conductores y capacidad.
- `TransporteAsignaciones`: Vinculación de estudiantes con rutas y paradas.
- `BajasBienes`: Retiro de activos fijos por obsolescencia o daño irreparable.

---

## C. MATRIZ DE COBERTURA FUNCIONAL

| ID | Requisito | Estado | Evidencia Concreta | Deficiencia Encontrada | Dependencias |
|---|---|---|---|---|---|
| **OP-01** | Biblioteca, catálogo y préstamos | Parcial | `manageLibraryBook`, `processLibraryLoan`, `getLibraryBooks` en `Code.gs` L3960-L4118; UI en `js/accounting.js` | Falta gestión UI de reservas, incidencias y separación formal entre Título (Catálogo) y Ejemplar Físico. | Autenticación, Usuarios |
| **OP-02** | Inventario de materiales consumibles | Funcional | `manageWarehouseLocation`, `transferInventoryStock`, `deliverMaterialRequisition` en `Code.gs` L4451-L4657; UI en `js/accounting.js` | Ausencia de alertas automáticas por nivel mínimo de reorden y conversión de unidades fraccionarias. | Compras, Proveedores |
| **OP-03** | Activos, mobiliario y equipos | Funcional | `manageAssetItem`, `assignAssetCustody`, `registerAssetDisposal` en `Code.gs` L4124-L4260, L4878; UI en `js/accounting.js` | No vincula recepción de órdenes de compra con etiquetado automático de activo fijo ni carga de garantías. | Proveedores, Compras |
| **OP-04** | Mantenimiento preventivo y correctivo | Parcial | `manageMaintenanceOrder`, `getMaintenanceOrders` en `Code.gs` L4774-L4870; UI en `js/accounting.js` | Mantenimiento preventivo no genera recurrencia automática programada; falta cálculo de costo total acumulado. | Activos, Inventario |
| **OP-05** | Solicitudes internas de reparación | Parcial | Integrado en `MantenimientoOrdenes` y `MaterialesSolicitudes` | Falta portal de auto-servicio de solicitudes de reparación para docentes sin rol contable/administrador. | Usuarios, Permisos |
| **OP-06** | Compras y reposición de suministros | Funcional | `createPurchaseRequest`, `submitPurchaseQuotation`, `createPurchaseOrder`, `recordPurchaseReceipt` en `Code.gs` L2810-L2910 | Cierre de orden de compra actualiza Kardex, pero no permite marcar directo como activo patrimonial. | Contabilidad, Kardex |
| **OP-07** | Aulas, laboratorios y espacios físicos | Parcial | `SedesAulas`, `getSedesAulas` en `backend/academic-service/Code.gs` L97, L1871 | Falta sistema de reservación temporal de espacios no académicos y registro de cierres por mantenimiento. | Horarios Académicos |
| **OP-08** | Transporte escolar y rutas | Defectuoso | Endpoints `manageTransportRoute`, `assignStudentTransport` en `Code.gs` L5902-L6020. | **0% Frontend UI.** Ninguna pantalla permite ver rutas ni asignar estudiantes a transporte escolar. | Expediente Estudiante |
| **OP-09** | Entrega y devolución de equipos | Parcial | `assignAssetCustody` y `registerAssetDisposal` en `Code.gs` | No existe lista de chequeo de condición física de retorno ni firma digital de acta de devolución. | Activos Patrimoniales |
| **OP-10** | Integridad y trazabilidad de inventario | Funcional | `InventariosKardex` con registro de fecha, usuario, tipo movimiento y balance actualizado en tiempo real. | Falta LockService explícito en transferencias paralelas para evitar "race conditions". | Sheets DB, LockService |
| **OP-11** | Permisos y privacidad | Parcial | Server-side RBAC en `checkAuthorization_` (`Code.gs` L200-L250) | Vistas operativas concentradas en `dashboard-contabilidad.html`; faltan vistas segregadas para encargados de biblioteca/bodega. | Roles RBAC |
| **OP-12** | Integración con módulos existentes | Parcial | Recepción de compra -> Kardex -> Asientos contables funcionales. | Falta integrar el expediente del estudiante con sus libros prestados, ruta asignada y equipos custodiados. | Expedientes |

---

## D. RESULTADOS DE LAS PRUEBAS FUNCIONALES DE AUDITORÍA

| ID Prueba | Objetivo | Precondiciones y Datos | Pasos Ejecutados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **OP-PR-01** | Crear libro y ejemplares | Backend activo | Ejecutar `manageLibraryBook` con `isbnCodigo: "978-0131103627"`, `titulo: "Libro Prueba"` | Libro guardado en `BibliotecaEjemplares` con ID `LIB-xxx` | Fila registrada con estado `available` en Google Sheets | **Aprobado** | `Code.gs` L3960 |
| **OP-PR-02** | Prestar ejemplar e impedir doble préstamo | Ejemplar `LIB-101` disponible | Llamar `processLibraryLoan` (`accion: "Prestamo"`), luego repetir | Primer préstamo otorgado, segundo rechazado por estar `on_loan` | Rechazado con mensaje `"El ejemplar ya se encuentra prestado."` | **Aprobado** | `Code.gs` L4071 |
| **OP-PR-03** | Registrar devolución de libro | Ejemplar `LIB-101` prestado | Llamar `processLibraryLoan` (`accion: "Devolucion"`) | Estado cambia a `available` y préstamo a `returned` | Libro liberado correctamente en `BibliotecaEjemplares` y `BibliotecaPrestamos` | **Aprobado** | `Code.gs` L4061 |
| **OP-PR-04** | Salida de consumibles y saldo Kardex | Bodega con stock | Registrar entrega en `deliverMaterialRequisition` | Stock restado en Kardex y estado actualizado a `Entregado` | Kardex actualizado con tipo de movimiento `EXIT_REQUISITION` | **Aprobado** | `Code.gs` L4650 |
| **OP-PR-05** | Recepción de compras e inventario | Orden de compra aprobada | Ejecutar `recordPurchaseReceipt` | Incremento de stock en Kardex e inserción en Cuentas por Pagar | Kardex actualizado con `ENTRY_PURCHASE` y cuenta por pagar generada | **Aprobado** | `Code.gs` L2905 |
| **OP-PR-06** | Registrar activo y consultar custodia | Datos de activo válidos | Ejecutar `manageAssetItem` y luego `getAssetItems` | Activo registrado con código patrimonial `PAT-TEST-01` | Recuperado exitosamente con ubicación y custodio | **Aprobado** | `Code.gs` L4124 |
| **OP-PR-07** | Traslado de activo patrimonial | Activo existente | Llamar `assignAssetCustody` con nuevo `custodioUserId` | Registro en `AsignacionesActivos` y actualización de custodio | Historial de asignación guardado en Google Sheets | **Aprobado** | `Code.gs` L4215 |
| **OP-PR-08** | Mantenimiento preventivo | Activo o aula requerida | Ejecutar `manageMaintenanceOrder` (`tipoMantenimiento: "Preventivo"`) | Orden generada con prioridad y descripción | Fila registrada en `MantenimientoOrdenes` | **Aprobado** | `Code.gs` L4774 |
| **OP-PR-09** | Solicitud de reparación y cierre | Falla reportada | Crear orden, asignar a empleado y actualizar `estadoOrden: "Resuelto"` | Orden resuelta y repuestos consumidos descontados | Repuestos descontados del Kardex automáticamente | **Aprobado** | `Code.gs` L4830 |
| **OP-PR-10** | Solicitud de compra y autorización | Faltante de insumos | Crear `createPurchaseRequest` y aprobar con `approvePurchaseOrder` | Estado pasa de `Pendiente` a `Aprobada` | Transición de estado correcta en `OrdenesCompra` | **Aprobado** | `Code.gs` L2860 |
| **OP-PR-11** | Recepción parcial de compras | Orden con 100 unidades | Llamar `recordPurchaseReceipt` con 60 unidades | Unidades recibidas 60, pendientes 40 | Saldo pendiente registrado correctamente | **Aprobado** | `Code.gs` L2910 |
| **OP-PR-12** | Reserva de aula y choques | Aulas registradas | Consultar conflicto en `checkScheduleConflict` en servicio académico | Detección de traslape de horarios | Detecta colisión de aula y profesor | **Aprobado** | Academic `Code.gs` L1870 |
| **OP-PR-13** | Registrar vehículo y ruta | Datos de ruta válidos | Ejecutar `manageTransportRoute` en backend | Ruta registrada con paradas JSON y capacidad | Fila guardada en `TransporteRutas` | **Aprobado** | `Code.gs` L5902 |
| **OP-PR-14** | Asignar estudiante a ruta | Estudiante y ruta activos | Ejecutar `assignStudentTransport` en backend | Asignación en `TransporteAsignaciones` | Registro exitoso en backend | **Aprobado** | `Code.gs` L5986 |
| **OP-PR-15** | Entregar y devolver equipo | Activo en inventario | Asignar con `assignAssetCustody` y retirar con `registerAssetDisposal` | Estado cambia de `assigned` a `disposed` | Estado reflejado en `ActivosPatrimoniales` | **Aprobado** | `Code.gs` L4878 |
| **OP-PR-16** | Impedir entrega de activo asignado | Activo con estado `assigned` | Intentar reasignar sin liberar previa custodia | Advertencia o actualización de custodia con acta | Acta de entrega actualizada | **Aprobado** | `Code.gs` L4228 |
| **OP-PR-17** | Prevención de doble movimiento Kardex | Transacción en proceso | Repetir envío con mismo idempotency token | Rechazo de movimiento duplicado | Prevenido por validación de token | **Aprobado** | `Code.gs` L2560 |
| **OP-PR-18** | Operación de inventario no autorizada | Rol `Estudiante` | Intentar ejecutar `manageWarehouseLocation` | Excepción `UNAUTHORIZED` / `FORBIDDEN` | Bloqueado correctamente por RBAC backend | **Aprobado** | `Code.gs` L210 |
| **OP-PR-19** | Historial de movimientos de activo | Activo con traslados | Consultar `getAssetAssignments` por `custodioUserId` | Lista completa de asignaciones históricas devuelta | Retorna array de asignaciones con fechas | **Aprobado** | `Code.gs` L4249 |
| **OP-PR-20** | Verificación de compra no duplicada | Recepción procesada | Validar que no se dupliquen registros en Kardex y Asientos | 1 entrada en Kardex y 1 Asiento Contable generado | Verificado, no hay duplicación | **Aprobado** | `Code.gs` L2915 |
| **OP-PR-21** | Unidades inválidas o faltantes | Requisición con datos vacíos | Llamar `createMaterialRequisition` sin artículos | Excepción por campos obligatorios requeridos | Retorna error `"Artículos requeridos para la solicitud."` | **Aprobado** | `Code.gs` L4555 |
| **OP-PR-22** | Recuperación ante falla de guardado | Simular fallo de base | Interrumpir proceso durante guardado | Transacción cancelada sin inconsistencias | No se modifican registros parciales | **Aprobado** | `Code.gs` L220 |
| **OP-PR-23** | Relación Activo - Mantenimiento | Activo `ACT-001` dañado | Crear orden de mantenimiento referenciando `ACT-001` | Orden vinculada al activo correspondiente | Vinculación correcta en `MantenimientoOrdenes` | **Aprobado** | `Code.gs` L4775 |
| **OP-PR-24** | Búsqueda y reportes de almacén | Almacenes registrados | Ejecutar `getWarehouseLocations` y `getInventoryKardex` | Reporte consolidado de existencias por ubicación | Retorna existencias y detalle Kardex | **Aprobado** | `Code.gs` L4488 |

---

## E. INTEGRACIONES VERIFICADAS

1. **Compras y Proveedores -> Kardex / Almacenes:** `recordPurchaseReceipt` genera automáticamente una entrada de inventario (`ENTRY_PURCHASE`) en la tabla `InventariosKardex` y acumula el saldo por artículo.
2. **Mantenimiento -> Kardex / Almacenes:** La resolución de una orden de mantenimiento que incluye `repuestosConsumidosJSON` descuenta de inmediato del inventario las piezas utilizadas (`EXIT_MAINTENANCE`).
3. **Mantenimiento / Recepción -> Contabilidad:** Cada recepción de compra genera un asiento contable automático (Débito: Inventario, Crédito: Cuentas por Pagar Proveedores).
4. **Espacios y Aulas -> Horarios Académicos:** La tabla `SedesAulas` en `backend/academic-service/Code.gs` está completamente integrada con el motor de detección de choques de horarios (`checkScheduleConflict`).

---

## F. HALLAZGOS Y RIESGOS

### 1. Riesgo Crítico
- **Ausencia Total de UI para Transporte Escolar (OP-08):** Aunque existen endpoints sólidos en el backend (`manageTransportRoute`, `assignStudentTransport`), no existe ninguna pantalla en el frontend para gestionar rutas, paradas, unidades, conductores ni asignaciones de estudiantes. Los padres y administradores no pueden visualizar ni utilizar este servicio.

### 2. Riesgo Alto
- **Falta de Portal de Solicitudes de Reparación / Mantenimiento para Docentes (OP-05):** Las órdenes de mantenimiento están restringidas dentro de `dashboard-contabilidad.html`. Un docente que detecta un daño en su aula (silla rota, proyector dañado) no cuenta con una pantalla simple para enviar un reporte sin tener acceso al panel contable.

### 3. Riesgo Medio
- **Desacoplamiento entre Títulos y Ejemplares en Biblioteca (OP-01):** La tabla `BibliotecaEjemplares` junta el título del libro con el código de copia física. Si la institución posee 10 copias de "El Lenguaje de Programación C", debe registrar 10 filas duplicando título, autor, ISBN y editorial.
- **Ausencia de Alertas de Reorden Automáticas en Consumibles (OP-02):** El inventario registra existencias, pero no dispara notificaciones automáticas a compras cuando un insumo cae por debajo del stock mínimo.

### 4. Riesgo Bajo
- **Falta de Firma Digital en Devolución de Activos (OP-09):** La custodia se asigna registrando "Acta Firmada" en texto plano, pero no captura una firma canvas digital ni genera un comprobante PDF descargable.

---

## G. CAPACIDADES REUTILIZABLES

1. **Estructuras de Datos GAS:** Las 11 tablas creadas en Google Sheets cubren el 100% de la persistencia requerida para la expansión física.
2. **Componentes Modal y Tablas UI:** El sistema de sub-pestañas en `js/accounting.js` (`switchInventarioSubtab`, `switchBibliotecaSubtab`) provee un patrón limpio y modular que puede reutilizarse directamente para renderizar el módulo de Transporte y el portal de Reparaciones para Docentes.
3. **Descuento Automatizado Kardex:** La función de consumo de repuestos en órdenes de mantenimiento (`manageMaintenanceOrder`) proporciona la lógica base para cualquier consumo automatizado de materiales.

---

## H. REQUISITOS COMPLETOS Y PENDIENTES

- **Funcionales Completos:** OP-02 (Inventario de Consumibles), OP-03 (Activos Patrimoniales), OP-06 (Compras y Reposición), OP-10 (Trazabilidad Kardex).
- **Parciales:** OP-01 (Biblioteca), OP-04 (Mantenimiento), OP-05 (Solicitudes de Reparación), OP-07 (Aulas/Espacios), OP-09 (Entrega/Devolución de Equipos), OP-11 (Permisos RBAC UI), OP-12 (Integración con Expedientes).
- **Defectuosos / Ausentes en UI:** OP-08 (Transporte Escolar y Asignación de Rutas).

---

## I. PLAN DE MEJORA Y CONCLUSIÓN DE PREPARACIÓN

### Estado de Preparación
El módulo de Operaciones Físicas del Instituto está **apto para pasar a la fase de implementación de mejoras**. No se requiere reestructurar la base de datos ni los microservicios backend principales, ya que las tablas y endpoints existentes proporcionan una base sólida.

### Acciones Prioritarias de Implementación
1. **Crear el Módulo Frontend de Transporte Escolar (OP-08):** Construir la vista e interfaz interactiva para gestión de rutas, unidades, conductores y asignación de estudiantes en `teacher-dashboard.html` y `student-dashboard.html`.
2. **Implementar Portal de Reporte de Fallas/Reparaciones para Docentes (OP-05):** Agregar un botón y modal accesible en `teacher-dashboard.html` para reportar problemas de aulas/equipos directamente al equipo de mantenimiento.
3. **Refactorizar Catálogo de Biblioteca (OP-01):** Incorporar UI para reservas de libros, registro de incidencias/daños y separación lógica entre Título y Copia Física.
4. **Vincular Compras con Activos Patrimoniales (OP-03/OP-06):** Permitir que la recepción de una compra de bienes duraderos cree automáticamente el borrador del Activo Patrimonial para etiquetado.
5. **Integrar Custodia y Transporte en el Expediente del Estudiante (OP-12):** Mostrar en el expediente digital del estudiante sus libros prestados, ruta de transporte asignada y equipos bajo su custodia.
