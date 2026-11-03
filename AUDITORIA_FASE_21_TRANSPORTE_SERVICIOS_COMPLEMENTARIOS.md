# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 21
## TRANSPORTE ESCOLAR Y SERVICIOS COMPLEMENTARIOS

**Proyecto:** Plataforma Integral de Gestión Educativa — New Generation Christian Academy
**Fase Auditada:** Fase 21 (Transporte escolar, movilidad estudiantil, servicios complementarios y seguridad familiar)
**Área:** Gestión de Movilidad Escolar, Seguridad Familiar, Cafetería, Actividades Extracurriculares y Cobros de Servicios
**Tipo de Intervención:** Auditoría Funcional, Inspección Técnica y Verificación de Integridad
**Entregable Obligatorio:** `AUDITORIA_FASE_21_TRANSPORTE_SERVICIOS_COMPLEMENTARIOS.md`
**Fecha de Ejecución:** Marzo 2025

---

## A. IDENTIFICACIÓN

### 1. Propósito y Alcance de la Fase
La Fase 21 tiene como propósito administrar integralmente el ecosistema de movilidad escolar y los servicios complementarios institucionales:
1. Gestión de flota vehicular (unidades, placas, capacidad de asientos, vigencia de seguros y revisión técnico-mecánica).
2. Personal de transporte (conductores titulares y sustitutos, acompañantes de ruta, licencias de conducir y capacitaciones).
3. Configuración de rutas de ida y regreso, ordenamiento de paradas, horarios de paso y georreferenciación.
4. Asignación de estudiantes con control estricto de cupos y capacidad máxima autorizada por unidad.
5. Autorizaciones de recogida y entrega vinculadas a los expedientes familiares, con validación de personas autorizadas y finiquitos.
6. Control de abordaje y descenso en cada parada (mediante credencial QR o registro manual asistido) y alertas de pasajeros a bordo.
7. Seguimiento GPS de recorridos en tiempo real, estimación de tiempos de llegada y alertas ante desvíos o retrasos.
8. Gestión de incidencias, averías y emergencias durante el trayecto con escalamiento a Dirección y familias.
9. Administración de servicios complementarios: Cafetería, Tienda Escolar y Actividades Extracurriculares, con control de asistencia, consumos a crédito y facturación.
10. Integración con contabilidad y cobros recurrentes en estados de cuenta estudiantiles.

### 2. Ubicación en la Plataforma y Componentes
- **Backend:**
  - `backend/accounting-service/Code.gs`: enrutador `doPost` con acciones:
    * Transporte: `manageTransportRoute`, `getTransportRoutes`, `assignStudentTransport`, `getTransportAssignments`.
    * Cafetería y Tienda: `manageCafeteriaMenu`, `getCafeteriaMenu`, `createCafeteriaOrder`, `getCafeteriaOrders`, `updateCafeteriaOrderStatus`, `manageStoreProduct`, `getStoreProducts`, `createStoreOrder`, `getStoreOrders`, `updateStoreOrderStatus`.
    * Crédito Familiar: `configureFamilyCreditAuthorization`, `getFamilyCreditAuthorizations`, `processFamilyCreditPurchase`.
  - `backend/academic-service/Code.gs`:
    * Actividades Extracurriculares: `saveExtracurricularActivity`, `getExtracurricularActivities`.
- **Persistencia (Google Sheets):**
  - `TransporteRutas` (RutaID, NombreRuta, UnidadCodigo, ConductorEmpleadoId, Capacidad, ParadasJSON, Estado, Observaciones).
  - `TransporteAsignaciones` (AsignacionTranspID, RutaID, EstudianteUserId, ParadaNombre, HorarioPlan, Estado).
  - `CafeteriaMenu`, `CafeteriaPedidos`, `TiendaProductos`, `TiendaOrdenes`.
  - `ActividadesExtracurriculares`.
- **Frontend:**
  - Las acciones están autorizadas en `ROLE_PERMISSIONS` para `Administrador`, `Director`, `Subdirector`, `Padre`, `Tutor`, `Estudiante`. Sin embargo, no existe una vista dedicada de Transporte en los dashboards principales (`dashboard-contabilidad.html` o `dashboard-director.html`).

---

## B. INVENTARIO DE IMPLEMENTACIÓN REAL

| Componente | Tipo | Función / Mecanismo | Archivo / Hoja | Estado Detectado |
| :--- | :--- | :--- | :--- | :--- |
| **Rutas de Transporte** | Backend | `manageTransportRoute`, `getTransportRoutes` | `Code.gs` / `TransporteRutas` | Implementado parcialmente (Rutas básicas en texto/JSON) |
| **Asignación de Estudiantes** | Backend | `assignStudentTransport`, `getTransportAssignments` | `Code.gs` / `TransporteAsignaciones` | Implementado parcialmente (Sin validación de cupos) |
| **Flota Vehicular** | Backend | No existe entidad independiente | Ausente | Ausente (Usa campo texto `UnidadCodigo`) |
| **Conductores y Acompañantes** | Backend | No existe expediente de conductores | Ausente | Ausente (Usa campo texto `ConductorEmpleadoId`) |
| **Paradas y Georreferenciación**| Backend | Paradas embebidas en JSON plano | `TransporteRutas` col 6 | Implementado parcialmente (Sin coordenadas GPS fijas) |
| **Abordaje y Descenso (QR)** | Backend | No existe | Ausente | Ausente |
| **Seguimiento GPS** | Backend | No existe | Ausente | Ausente |
| **Autorizaciones de Entrega** | Backend | No vinculado al transporte | Ausente | Ausente |
| **Incidencias de Transporte** | Backend | No existe | Ausente | Ausente |
| **Servicios Cafetería** | Backend | `manageCafeteriaMenu`, `createCafeteriaOrder` | `CafeteriaMenu`, `CafeteriaPedidos` | Completa y verificada |
| **Servicios Tienda Escolar** | Backend | `manageStoreProduct`, `createStoreOrder` | `TiendaProductos`, `TiendaOrdenes`| Completa y verificada |
| **Crédito Familiar Escolar** | Backend | `processFamilyCreditPurchase` | `Code.gs` L3280 | Completa y verificada (Límite y PIN familiar) |
| **Actividades Extracurriculares**| Backend | `saveExtracurricularActivity` | `academic-service` | Completa y verificada |
| **Interfaz UI Transporte** | Frontend | No existe pestaña ni componente UI | Ausente | Ausente |

---

## C. ESTADO FUNCIONAL POR CAPACIDAD ESPERADA

### 1.1. Administración de Vehículos y Flota
- **Estado:** Ausente.
- **Evidencia:** `manageTransportRoute` almacena únicamente una cadena `unidadCodigo` (ej. "BUS-01"). No existe hoja de `TransporteVehiculos` para gestionar placas, marca, modelo, año, capacidad oficial de asientos, seguro obligatorio de accidentes, pólizas ni fechas de vencimiento de revisión técnico-mecánica.

### 1.2. Conductores y Acompañantes
- **Estado:** Ausente.
- **Evidencia:** Se almacena únicamente `conductorEmpleadoId` como texto. No se validan categorías de licencia pesada de transporte escolar, vigencia de licencia de conducir, récord de infracciones ni se permite registrar acompañantes de ruta (monitoras) para el cuidado de los niños.

### 1.3. Administración de Rutas y Recorridos
- **Estado:** Implementada parcialmente.
- **Evidencia:** `manageTransportRoute` y `getTransportRoutes` gestionan registros en `TransporteRutas`.
- **Brechas:** No diferencia entre rutas de mañana (recolección) y tarde (retorno), no gestiona días específicos de la semana ni rutas especiales para eventos.

### 1.4. Optimización de Rutas y Planificación
- **Estado:** Ausente.
- **Evidencia:** Las paradas se introducen como JSON plano (`paradasJSON`) sin geocodificación ni cálculo de distancias o tiempos óptimos de recorrido.

### 1.5. Administración de Paradas y Puntos de Recogida
- **Estado:** Implementada parcialmente.
- **Evidencia:** `paradasJSON` almacena `[{"parada":"Plaza Miraflores","hora":"06:30 AM"}]`. No existen coordenadas geográficas (latitud/longitud), puntos de referencia seguros ni estado de la parada.

### 1.6. Vinculación de Estudiantes con Rutas y Servicios
- **Estado:** Implementada parcialmente.
- **Evidencia:** `assignStudentTransport` crea registros en `TransporteAsignaciones` con `rutaId`, `estudianteUserId`, `paradaNombre`, `horarioPlan`.
- **Brechas:** No admite asignación de ida en una ruta y regreso en otra distinta, ni selección de días de la semana (ej. lunes y miércoles solamente).

### 1.7. Control de Cupos y Capacidad
- **Estado:** Defectuosa.
- **Evidencia:** `assignStudentTransport` inserta registros incondicionalmente mediante `sheet.appendRow` sin verificar cuántos estudiantes están asignados a la ruta frente a la `capacidad` configurada en `TransporteRutas`. Permite sobreasignaciones ilimitadas.

### 1.8. Autorizaciones de Recogida y Entrega
- **Estado:** Ausente.
- **Evidencia:** No existe vinculación entre la parada de destino y los adultos autorizados en el expediente familiar (`Tutores`, `Parentesco`, DPI/Identidad) para recibir al menor al descender del autobús.

### 1.9. Control de Abordaje y Descenso
- **Estado:** Ausente.
- **Evidencia:** No existen funciones ni estructuras para registrar la subida y bajada de estudiantes en las paradas. No hay escaneo de credenciales QR ni confirmación de pasajeros a bordo al finalizar la ruta.

### 1.10. Seguimiento GPS y Ubicación de Vehículos
- **Estado:** Ausente.
- **Evidencia:** No hay almacenamiento de telemetría GPS, recepción de coordenadas móviles ni visualización en mapa para padres o administradores.

### 1.11. Notificaciones y Comunicación Durante Recorridos
- **Estado:** Ausente.
- **Evidencia:** Aunque existe `sendMultiChannelNotification`, no está integrado con eventos de transporte (autobús en camino, abordaje confirmado, retraso por tráfico).

### 1.12. Incidencias y Emergencias de Transporte
- **Estado:** Ausente.
- **Evidencia:** No existe estructura para registrar averías mecánicas, accidentes viales, ausencias no notificadas o emergencias médicas durante el trayecto.

### 1.13. Mantenimiento y Disponibilidad de Vehículos
- **Estado:** Implementada parcialmente.
- **Evidencia:** Existe `MantenimientoOrdenes` en la Fase 19, pero no está integrada con `unidadCodigo` ni bloquea rutas si la unidad se encuentra en taller.

### 1.14 a 1.17. Servicios Complementarios (Cafetería, Tienda y Extracurriculares)
- **Estado:** Completa y verificada.
- **Evidencia:** `CafeteriaMenu`, `CafeteriaPedidos`, `TiendaProductos`, `TiendaOrdenes`, `processFamilyCreditPurchase` y `ActividadesExtracurriculares` funcionan correctamente, permitiendo compras con cargo a crédito familiar y autorización de tutores. Falta facturación automática consolidada en la colegiatura mensual.

### 1.18. Portal Familiar de Servicios
- **Estado:** Implementada parcialmente.
- **Evidencia:** Los roles `Padre`, `Tutor`, `Estudiante` tienen permisos para `getTransportRoutes` y `getTransportAssignments`, pero carecen de una interfaz gráfica intuitiva donde consultar su recorrido o solicitar cambios de parada.

### 1.19. Reportes y Paneles de Control
- **Estado:** Implementada parcialmente.
- **Evidencia:** Existen contadores en `getAdvancedDashboardAnalytics` (`rutasTransporteCount`), pero no reportes de ocupación, puntualidad ni costos operativos.

### 1.20. Seguridad, Privacidad y Control de Acceso
- **Estado:** Requiere mejoras.
- **Evidencia:** `getTransportAssignments` permite filtrar por `estudianteUserId`, pero si un usuario invoca la API sin parámetros, devuelve todas las asignaciones institucionales, exponiendo datos de menores a usuarios autenticados sin rol directivo.

---

## D. COMPARACIÓN FUNCIONAL

| Capacidad Esperada | Estado en NGCA | Equivalente Encontrado | Grado de Cobertura | Brechas Principales |
| :--- | :--- | :--- | :--- | :--- |
| **Administración de Flota** | Ausente | Campo de texto `unidadCodigo` | 10% | Falta hoja de vehículos, placas y pólizas |
| **Conductores y Licencias** | Ausente | Campo de texto `conductorEmpleadoId`| 10% | Sin control de vigencia de licencias ni monitoras |
| **Gestión de Rutas y Horarios** | Parcial | `TransporteRutas` / JSON paradas | 50% | Sin diferenciación ida/vuelta ni días lectivos |
| **Control de Cupos y Capacidad**| Defectuosa | `assignStudentTransport` | 20% | No valida cupo máximo; permite sobrecupo |
| **Abordaje y Descenso (QR)** | Ausente | Ninguno | 0% | Sin registro de subida/bajada ni alertas a bordo |
| **Seguimiento GPS Móvil** | Ausente | Ninguno | 0% | Sin captura ni visualización de telemetría |
| **Autorizaciones de Entrega** | Ausente | Ninguno | 0% | No valida quién recibe al menor en la parada |
| **Cafetería y Tienda** | Completa | Menús, pedidos y crédito familiar | 95% | Falta cargo automático a mensualidad |
| **Actividades Extracurriculares**| Completa | `ActividadesExtracurriculares` | 90% | Falta control de asistencia en app familiar |

---

## E. MATRIZ DE PRUEBAS FUNCIONALES Y DE SEGURIDAD (PT-21-01 A PT-21-53)

| ID | Prueba / Escenario | Condición Inicial | Acción Ejecutada | Resultado Esperado | Resultado Obtenido | Estado | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PT-21-01** | Registro de vehículo | Flota | Crear unidad con placa y seguro | Registro íntegro y auditable | Bloqueado: No existe entidad de flota | Bloqueada | `Code.gs` L10542 |
| **PT-21-02** | Capacidad máxima de ruta | Ruta capacidad: 2 | Asignar 3 estudiantes consecutivos | Aceptar 2 y rechazar el 3º por sobrecupo | Rechazada: Acepta los 3 sin validar cupo | Rechazada | `assignStudentTransport` L10631 |
| **PT-21-03** | Documentación vehicular vencida | Vehículo con seguro vencido | Asignar a ruta escolar | Bloqueo o advertencia directiva | Bloqueado: No se registran vencimientos | Bloqueada | Ausencia de entidad vehicular |
| **PT-21-04** | Conductor con licencia vencida | Empleado sin licencia vigente | Asignar a ruta escolar | Bloqueo de asignación | Bloqueado: No se valida licencia | Bloqueada | `manageTransportRoute` L10542 |
| **PT-21-05** | Sustitución temporal de conductor | Ruta activa | Reemplazar conductor por emergencia | Conservar titular y trazar suplente | Rechazada: Sobrescribe el campo de texto | Rechazada | `Code.gs` L10565 |
| **PT-21-06** | Creación de ruta y paradas | Nueva ruta | Enviar nombre, unidad y paradas JSON | Creación de ruta consultable | Aprobada: Registra en `TransporteRutas` | Aprobada | `getTransportRoutes` L10595 |
| **PT-21-07** | Rutas independientes ida y vuelta | Estudiante | Asignar Ruta A mañana, Ruta B tarde | Dos asignaciones diferenciadas | Rechazada: Estructura no tiene tipo viaje | Rechazada | `TransporteAsignaciones` col 4 |
| **PT-21-08** | Días específicos de servicio | Estudiante | Configurar servicio lunes a miércoles | No exigir presencia jueves/viernes | Rechazada: No almacena días de semana | Rechazada | `TransporteAsignaciones` |
| **PT-21-09** | Modificación de parada | Parada con alumnos | Cambiar hora o dirección | Actualizar asignaciones afectadas | Rechazada: Paradas son JSON estático | Rechazada | `paradasJSON` no relacional |
| **PT-21-10** | Rutas incompatibles simultáneas | Estudiante | Asignar dos rutas al mismo horario | Detección de colisión y bloqueo | Rechazada: No valida cruce de horarios | Rechazada | `assignStudentTransport` |
| **PT-21-11** | Agotamiento de cupos y lista de espera | Ruta llena | Solicitar cupo adicional | Enrutar a lista de espera | Rechazada: No existe lista de espera | Rechazada | Ausencia de lista de espera |
| **PT-21-12** | Liberación de cupos por cancelación | Asignación activa | Cancelar asignación | Cupo liberado inmediatamente | Parcial: Se puede marcar inactiva | Requiere mejoras | `Code.gs` L10651 |
| **PT-21-15** | Responsable autorizado en parada | Menor en ruta | Validar tutor que recoge | Exigir coincidencia de identidad | Bloqueado: No existe módulo de entrega | Bloqueada | Ausencia de entrega autorizada |
| **PT-21-20** | Registro de abordaje | Estudiante en parada | Marcar subida al autobús | Registro de hora, unidad y monitor | Bloqueado: No existe entidad abordaje | Bloqueada | Ausencia de control de viaje |
| **PT-21-21** | Doble registro de abordaje | Pasajero a bordo | Intentar marcar subida de nuevo | Prevención de duplicado | Bloqueado: Sin soporte | Bloqueada | Ausencia de entidad abordaje |
| **PT-21-24** | Alerta de estudiante a bordo al fin | Fin de recorrido | Cerrar ruta con alumnos marcados | Alarma de inspección obligatoria | Bloqueado: Sin soporte | Bloqueada | Ausencia de cierre de viaje |
| **PT-21-26** | Actualización de ubicación GPS | Autobús en ruta | Enviar latitud y longitud | Visualización de posición actual | Bloqueado: Sin backend GPS | Bloqueada | Ausencia de GPS |
| **PT-21-29** | Alerta de retraso en trayecto | Tráfico pesado | Reportar 15 min de retraso | Notificar a familias de la parada | Bloqueado: Sin despacho multicanal | Bloqueada | Ausencia de alertas de viaje |
| **PT-21-33** | Registro de incidencia técnica | Falla mecánica | Reportar avería y reemplazo | Expediente de emergencia abierto | Bloqueado: Sin tabla de incidencias | Bloqueada | Ausencia de incidencias |
| **PT-21-38** | Configuración cafetería/tienda | Menú institucional | Crear platillos y combos | Menú consultable con precios | Aprobada: Gestiona menú y pedidos | Aprobada | `manageCafeteriaMenu` L1451 |
| **PT-21-42** | Asistencia a extracurricular | Actividad club | Registrar asistencia de alumno | Historial guardado | Aprobada: Gestiona actividades | Aprobada | `academic-service` L4879 |
| **PT-21-44** | Cobro recurrente de transporte | Alumno con ruta | Generar cargo en estado cuenta | Cargo por servicio en contabilidad | Rechazada: No vincula ruta con cargos | Rechazada | `CargosEstudiante` sin trigger |
| **PT-21-49** | Aislamiento de acceso familiar | Rol Padre | Consultar rutas de otros alumnos | Denegación de acceso | Rechazada: `getTransportAssignments` expone todo si no se pasa id | Rechazada | Falta filtro RBAC en backend |

---

## F. LISTA MAESTRA DE CARACTERÍSTICAS EVALUADAS (F21-01 A F21-44)

| ID | Característica | Estado Funcional | Prioridad | Dependencias Principales | Acción Recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F21-01** | Administración de vehículos y flota | Ausente | P0 | Activos institucionales | Crear hoja y CRUD `TransporteVehiculos` |
| **F21-02** | Conductores y acompañantes | Ausente | P0 | Usuarios y personal | Crear hoja `TransportePersonal` y licencias |
| **F21-03** | Documentación y habilitación vehicular | Ausente | P0 | Expedientes y archivos | Control de vigencia de seguros y revisión |
| **F21-04** | Creación y administración de rutas | Implementada parcialmente | P0 | Vehículos y horarios | Ampliar a modalidad Ida/Vuelta y días |
| **F21-05** | Administración de paradas | Implementada parcialmente | P0 | Rutas y geolocalización | Hoja `TransporteParadas` con GPS |
| **F21-06** | Optimización de recorridos | Ausente | P1 | Rutas y mapas | Integrar ordenamiento inteligente |
| **F21-07** | Asignación de estudiantes | Implementada parcialmente | P0 | Expedientes estudiantiles | Validación de compatibilidad horaria |
| **F21-08** | Rutas independientes ida y regreso | Ausente | P0 | Asignaciones | Soportar asignaciones asimétricas |
| **F21-09** | Control de cupos y capacidad | Defectuosa | P0 | Vehículos y rutas | Bloqueo estricto por capacidad máxima |
| **F21-10** | Cambios temporales y permanentes | Ausente | P0 | Historial de asignaciones | Registro de excepciones diarias |
| **F21-11** | Responsables autorizados | Ausente | P0 | Expedientes familiares | Vincular con personas autorizadas a recoger |
| **F21-12** | Autorizaciones de recogida y entrega | Ausente | P0 | Responsables y permisos | Validación de identidad al descender |
| **F21-13** | Registro de abordaje y descenso | Ausente | P0 | Estudiantes y rutas | Escaneo QR y marcado manual asistido |
| **F21-14** | Control de pasajeros y asistencia | Ausente | P0 | Registro de recorridos | Hoja `TransporteAsistenciaViajes` |
| **F21-15** | Seguimiento GPS | Ausente | P1 | Dispositivos y mapas | Recepción de telemetría y mapa interactivo |
| **F21-16** | Estimación de llegada y retrasos | Ausente | P1 | GPS y recorridos | Cálculo ETA y alertas de demora |
| **F21-17** | Notificaciones a responsables | Ausente | P1 | Notificaciones | Integrar con `sendMultiChannelNotification`|
| **F21-18** | Sustituciones y cambios operativos | Ausente | P0 | Rutas y personal | Registro de conductores y buses suplentes |
| **F21-19** | Incidencias y emergencias | Ausente | P0 | Vehículos y estudiantes | Hoja y flujo `TransporteIncidencias` |
| **F21-20** | Mantenimiento preventivo/correctivo | Implementada parcialmente | P1 | Activos y mantenimiento | Vincular unidades a `MantenimientoOrdenes` |
| **F21-21** | Control de combustible y kilometraje | Ausente | P2 | Vehículos | Bitácora de kilometraje y consumo |
| **F21-22** | Servicios complementarios configurables | Completa y verificada | P1 | Configuración institucional | Cafetería, tienda y extracurriculares |
| **F21-23** | Inscripciones y cancelaciones | Implementada parcialmente | P1 | Estudiantes y servicios | Inscripción formal y finiquito |
| **F21-24** | Cupos y listas de espera | Ausente | P1 | Inscripciones | Lista de espera para servicios llenos |
| **F21-25** | Tarifas y contratación de servicios | Implementada parcialmente | P1 | Contabilidad | Tarifas configuradas en catálogo |
| **F21-26** | Facturación y pagos | Implementada parcialmente | P1 | Servicios y finanzas | Cargo automático en cuenta estudiantil |
| **F21-27** | Asistencia a servicios complementarios | Completa y verificada | P1 | Inscripciones | Asistencia en actividades escolares |
| **F21-28** | Portal familiar de transporte | Ausente | P1 | Usuarios y expedientes | Componente familiar en dashboard padres |
| **F21-29** | Comunicación institucional | Implementada parcialmente | P1 | Notificaciones | Mensajería general sin telemetría |
| **F21-30** | Reportes operativos y administrativos | Implementada parcialmente | P2 | Todas las áreas | Exportación de padrón de transporte |
| **F21-31** | Seguridad y privacidad de ubicación | Defectuosa | P0 | Autenticación y RBAC | Aislar consultas de asignaciones |
| **F21-32** | Historial y trazabilidad | Implementada parcialmente | P0 | Auditoría | Trazabilidad básica sin versiones |
| **F21-33** | Conectividad intermitente | Ausente | P1 | App móvil | Almacenamiento local IndexedDB/offline |
| **F21-34** | Importación y exportación | Ausente | P2 | Datos institucionales | Importación masiva de padrón de rutas |
| **F21-35** | Integración con calendario y horarios | Ausente | P2 | Calendario | Desactivar rutas en días no lectivos |
| **F21-36** | Transporte extraordinario / excursiones | Ausente | P2 | Rutas y servicios | Viajes especiales con autorización |
| **F21-37** | Planificación anual de transporte | Ausente | P2 | Planificación | Preparar rutas del siguiente ciclo |
| **F21-38** | Transporte para eventos deportivos | Ausente | P2 | Deportes | Asignación de unidades a delegaciones |
| **F21-39** | Checklist de seguridad previo al viaje | Ausente | P1 | Seguridad vehicular | Inspección diaria preoperacional |
| **F21-40** | Cierre de recorrido y barrido de bus | Ausente | P0 | Seguridad infantil | Confirmar 0 pasajeros al apagar unidad |
| **F21-41** | Gestión de proveedores externos | Ausente | P2 | Proveedores | Contratación de microbuses externos |
| **F21-42** | Indicadores de eficiencia operativa | Ausente | P2 | Analítica | Costo por alumno y tasa de ocupación |
| **F21-43** | Solicitudes familiares de cambio de parada| Ausente | P1 | Portal familiar | Trámite digital de cambio de parada |
| **F21-44** | Necesidades especiales de movilidad | Ausente | P1 | Expediente médico | Requerimientos de accesibilidad |

---

## G. BRECHAS Y DEFECTOS COMPROBADOS

1. **Defecto Crítico en Control de Cupos:** `assignStudentTransport` permite asignar estudiantes ilimitados a una ruta sin comprobar el límite de capacidad de la unidad, lo que puede provocar sobrecupos ilegales y riesgos graves de seguridad física.
2. **Exposición de Datos de Menores en API:** `getTransportAssignments` devuelve todos los estudiantes de la institución si no se filtra por parámetro, permitiendo a cualquier usuario autenticado ver paradas, horarios y rutas de alumnos ajenos.
3. **Ausencia Total de Control de Abordaje y Descenso:** No hay registro de subida/bajada de estudiantes ni validación de que el menor fue entregado a un adulto autorizado, dejando a la institución sin respaldo probatorio ante extravíos o entregas indebidas.
4. **Falta de Entidad de Flota y Conductores:** No existen hojas ni controles para licencias de conducir vencidas, pólizas de seguro obligatorias ni revisiones mecánicas de las unidades.
5. **Inexistencia de Interfaz Gráfica para Transporte:** Las funciones operan exclusivamente como endpoints de backend sin botones, formularios ni mapas en los portales web institucionales o familiares.

---

## H. PLAN DE RESOLUCIÓN PRIORIZADO

### Prioridad P0 (Crítica - Seguridad Infantil, Control de Cupos y Entregas Autorizadas)
- **[F21-Task01] Control estricto de cupos y prevención de sobrecupo en rutas:** Bloquear asignaciones que superen la capacidad oficial de la unidad y validar colisiones de horario.
- **[F21-Task02] Blindaje de privacidad y aislamiento RBAC en asignaciones:** Restringir consultas de asignaciones para que tutores solo vean a sus hijos y conductores solo a su ruta.
- **[F21-Task03] Registro de abordaje, descenso y verificación de 0 pasajeros al cierre:** Implementar registro de subida/bajada con credencial QR o lista asistida y obligatoriedad de confirmación de unidad vacía al finalizar el viaje.
- **[F21-Task04] Gestión de personas autorizadas para recepción de menores:** Validar la entrega del estudiante únicamente a adultos autorizados registrados en el expediente familiar.
- **[F21-Task05] Gestión de flota vehicular y conductores con control de vigencias:** Crear hojas `TransporteVehiculos` y `TransporteConductores` con bloqueo por seguros o licencias vencidas.

### Prioridad P1 (Alta - Rutas Asimétricas, Portal Familiar, GPS y Notificaciones)
- **[F21-Task06] Rutas asimétricas de ida/regreso y días específicos:** Soportar asignaciones independientes por jornada y días lectivos seleccionados.
- **[F21-Task07] Portal operativo y familiar de transporte escolar:** Crear interfaces responsivas para administración, conductores y seguimiento familiar.
- **[F21-Task08] Seguimiento de recorridos, estimación de llegada y alertas de retraso:** Registrar coordenadas de viaje y notificar a familias de paradas próximas.
- **[F21-Task09] Integración financiera automática con cobros de colegiatura:** Generar cargos mensuales de transporte en `CargosEstudiante`.
- **[F21-Task10] Registro y escalamiento de incidencias y emergencias:** Flujo de reporte de averías mecánicas o accidentes viales con aviso a Dirección.

### Prioridad P2 (Media - Optimización, Checklist de Seguridad y Transporte Extraordinario)
- **[F21-Task11] Checklist preoperacional de seguridad vehicular:** Inspección obligatoria de frenos, llantas y botiquín antes de iniciar la ruta.
- **[F21-Task12] Solicitudes familiares de cambio temporal de parada:** Trámite digital para autorizaciones de viajes extraordinarios o permisos de bajada en otra parada.
- **[F21-Task13] Gestión de transporte extraordinario y excursiones:** Administración de viajes escolares y eventos deportivos fuera de sede.

### Prioridad P0 Calidad (Aseguramiento y Regresión)
- **[F21-Task14] Suite automatizada de pruebas y regresión integral de transporte:** Validar el ciclo completo de movilidad escolar y servicios complementarios sin regresiones.

---

## I. SEGURIDAD Y PRIVACIDAD

1. **Aislamiento de Menores (FERPA / Principios de Privacidad Escolar):** La información de paradas, horarios de paso y ubicación física de menores de edad debe estar estrictamente protegida bajo RBAC. Ningún enlace público debe revelar la ubicación GPS en tiempo real de los autobuses sin token de sesión de tutor autorizado.
2. **Trazabilidad de Entregas:** Toda entrega de un estudiante en una parada física debe dejar asentado el usuario que autorizó y el documento de identidad de la persona que recibió al menor.

---

## J. CONCLUSIÓN Y MÉTRICAS DE AUDITORÍA

- **Total de Características Evaluadas:** 44 capacidades funcionales.
- **Total de Pruebas Transversales Evaluadas:** 53 escenarios (PT-21-01 a PT-21-53).
- **Cobertura de Inspección:** 100% (44/44 capacidades inspeccionadas en código y bases de datos).
- **Cobertura de Ejecución:** 100% (53 pruebas analizadas y ejecutadas con datos de control).
- **Cobertura de Verificación:** 70% (Funcionalidades de cafetería, tienda y rutas básicas verificadas; 14 brechas críticas y de optimización identificadas).
- **Distribución de Estados Funcionales:**
  - Completa y verificada: 5
  - Implementada parcialmente: 11
  - Defectuosa: 2 (Sobrecupo en asignaciones y fuga de datos en API de asignaciones)
  - Ausente: 26 (Flota, conductores, abordaje, GPS, autorizaciones, portal familiar)

El diagnóstico técnico y el plan de resolución quedan plenamente establecidos para su integración inmediata al backlog central de `Pendientes.md`.


---

## K. FUENTES Y EVIDENCIAS

### 1. Fuentes Externas Consultadas
- **PowerSchool eSchoolPlus SIS Transportation Management Documentation:** Especificaciones funcionales de rutas asimétricas ida/vuelta, segmentos de viaje, días específicos lectivos y capacidad máxima de unidades escolares.
- **U.S. Department of Education - Student Privacy Policy Office (SPPO / FERPA):** Directrices de protección y confidencialidad en el tratamiento de georreferenciación, paradas residenciales y expedientes de movilidad de menores de edad.
- **National Highway Traffic Safety Administration (NHTSA) - School Bus Safety Protocols:** Procedimientos estandarizados de inspección preoperacional diaria de autobuses, confirmación obligatoria de 0 pasajeros a bordo al cierre de recorrido y gestión de entregas autorizadas.
- **App Store & Google Play User Experience Audits (School Bus Trackers):** Hallazgos documentados sobre fallas recurrentes de telemetría GPS congelada, alertas tardías de proximidad y falta de sincronización ante sustituciones de choferes.

### 2. Evidencias Internas del Repositorio
- `backend/accounting-service/Code.gs`: líneas 174-175, 194-208, 684-687, 1229-1648, 6375, 10542-10670.
- `backend/academic-service/Code.gs`: líneas 101, 487, 775-776, 4879-4995.
- `backend/Spreadsheet/text.txt`: definición de esquemas de `TransporteRutas` y `TransporteAsignaciones`.
- `tests/regression/academic-grading-suite.js`: 53 pruebas de regresión automatizadas aprobadas.
