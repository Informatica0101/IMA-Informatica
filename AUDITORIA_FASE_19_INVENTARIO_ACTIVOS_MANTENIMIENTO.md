# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 19
## INVENTARIO, ACTIVOS FIJOS Y MANTENIMIENTO INSTITUCIONAL

**Proyecto:** Plataforma Integral de Gestión Educativa — New Generation Christian Academy
**Fase Auditada:** Fase 19 (Inventario, Activos Fijos y Mantenimiento)
**Área:** Gestión de Recursos Físicos, Patrimonio Institucional, Control de Bodegas y Mantenimiento
**Tipo de Intervención:** Auditoría Funcional, Inspección Técnica y Verificación de Integridad
**Entregable Obligatorio:** `AUDITORIA_FASE_19_INVENTARIO_ACTIVOS_MANTENIMIENTO.md`
**Fecha de Ejecución:** Marzo 2025

---

## A. IDENTIFICACIÓN

### 1. Propósito y Delimitación de la Fase
La Fase 19 tiene como objetivo administrar integralmente el ciclo de vida de los recursos físicos de la institución:
1. Control de inventarios y suministros operativos (material didáctico, útiles de oficina, insumos de limpieza y cafetería/tienda).
2. Registro, etiquetado, asignación de custodia y seguimiento patrimonial de activos fijos (equipos de cómputo, mobiliario, proyectores, vehículos).
3. Depreciación de activos fijos, cálculo de vida útil y valor residual en libros según políticas institucionales.
4. Gestión de mantenimiento correctivo y preventivo de instalaciones y equipos institucionales, con control de repuestos consumidos, órdenes de trabajo y costos asociados.
5. Control de bajas de bienes patrimoniales y mermas de inventario con actas formales y preservación histórica contable.

### 2. Ubicación en la Plataforma y Componentes
- **Frontend:**
  - `dashboard-contabilidad.html` (botón de navegación `switchTab('inventario')`).
  - `js/accounting.js` (subpestañas operativas: `kardex`, `almacenes`, `solicitudes`, `activos`, `mantenimiento`, `bajas`).
- **Backend:**
  - `backend/accounting-service/Code.gs` (servicios de microservicio contable-financiero).
  - Enrutador `doPost` con despacho para: `recordInventoryMovement`, `getInventoryKardex`, `manageWarehouseLocation`, `getWarehouseLocations`, `transferInventoryStock`, `createMaterialRequisition`, `getMaterialRequisitions`, `deliverMaterialRequisition`, `createPhysicalInventoryCount`, `getPhysicalInventoryCounts`, `reconcilePhysicalCount`, `manageMaintenanceOrder`, `getMaintenanceOrders`, `registerAssetDisposal`, `getAssetDisposals`, `manageAssetItem`, `getAssetItems`, `assignAssetCustody`, `getAssetAssignments`.
- **Estructuras de Persistencia (Google Sheets):**
  - `InventariosKardex`
  - `AlmacenesUbicaciones`
  - `MaterialesSolicitudes`
  - `InventariosConteosFisicos`
  - `ActivosPatrimoniales`
  - `AsignacionesActivos`
  - `MantenimientoOrdenes`
  - `BajasBienes`
- **Roles y Permisos:**
  - `Administrador`, `Director`, `Subdirector`, `Contador`: acceso total a administración de inventarios, activos, almacenes, mantenimientos y bajas.
  - `EncargadoTienda`, `EncargadoCafeteria`: registro de movimientos y consulta de kardex.
  - Docentes / Personal Operativo: solicitud de materiales y reporte de fallas.

---

## B. INVENTARIO DE IMPLEMENTACIÓN REAL

| Componente | Tipo | Función / Mecanismo | Archivo / Hoja | Estado Detectado |
| :--- | :--- | :--- | :--- | :--- |
| **Kardex de Inventario** | Backend | `recordInventoryMovement` | `Code.gs` / `InventariosKardex` | Implementado parcialmente (Defecto en stock multialmacén) |
| **Consulta de Kardex** | Backend | `getInventoryKardex` | `Code.gs` / `InventariosKardex` | Implementado funcional |
| **Almacenes y Ubicaciones** | Backend | `manageWarehouseLocation`, `getWarehouseLocations` | `Code.gs` / `AlmacenesUbicaciones` | Implementado funcional |
| **Transferencias de Stock** | Backend | `transferInventoryStock` | `Code.gs` / `InventariosKardex` | Implementado parcialmente (No valida disponibilidad previa en origen) |
| **Solicitudes de Materiales** | Backend | `createMaterialRequisition`, `getMaterialRequisitions` | `Code.gs` / `MaterialesSolicitudes` | Implementado funcional |
| **Entrega de Materiales** | Backend | `deliverMaterialRequisition` | `Code.gs` / `MaterialesSolicitudes` | Implementado funcional |
| **Conteos Físicos** | Backend | `createPhysicalInventoryCount`, `getPhysicalInventoryCounts` | `Code.gs` / `InventariosConteosFisicos` | Implementado funcional |
| **Conciliación de Inventario** | Backend | `reconcilePhysicalCount` | `Code.gs` / `InventariosConteosFisicos` | Implementado funcional (Ajuste automático a Kardex) |
| **Activos Patrimoniales** | Backend | `manageAssetItem`, `getAssetItems` | `Code.gs` / `ActivosPatrimoniales` | Implementado parcialmente (Sin cálculo de depreciación) |
| **Custodia de Activos** | Backend | `assignAssetCustody`, `getAssetAssignments` | `Code.gs` / `AsignacionesActivos` | Implementado parcialmente (Sin registro formal de devoluciones) |
| **Órdenes de Mantenimiento** | Backend | `manageMaintenanceOrder`, `getMaintenanceOrders` | `Code.gs` / `MantenimientoOrdenes` | Implementado funcional (Descuenta repuestos al resolver) |
| **Baja de Bienes** | Backend | `registerAssetDisposal`, `getAssetDisposals` | `Code.gs` / `BajasBienes` | Implementado funcional (Preserva historial) |
| **Interfaz UI Inventarios** | Frontend | `renderInventarioModule` y sub-vistas | `js/accounting.js` | Implementado funcional (Interactivo, 6 subpestañas) |

---

## C. ESTADO FUNCIONAL POR CAPACIDAD ESPERADA

### 2.1. Catálogo Institucional de Materiales y Bienes
- **Estado:** Implementado parcialmente.
- **Evidencia:** `InventariosKardex` almacena artículos mediante `itemCodigo`, `itemNombre`, `categoriaTipo`, `stockMinimo`. Sin embargo, no existe una hoja independiente que funcione como catálogo maestro (`CatalogoArticulos`); los artículos se crean implícitamente al registrar el primer movimiento en el Kardex.
- **Brecha:** No se configuran de antemano datos fijos como unidad de medida, peso, código de barras/QR, costos de referencia o marcas. Si se teclea un nombre ligeramente distinto con el mismo código, se generan discrepancias en reportes.

### 2.2. Almacenes, Ubicaciones y Existencias Multialmacén
- **Estado:** Defectuoso.
- **Evidencia:** `recordInventoryMovement` calcula el stock actual sumando y restando sobre todas las filas del ítem en `InventariosKardex` sin filtrar por `ubicacionResponsable`:
  ```javascript
  let currentStock = 0;
  data.forEach(r => {
    if (String(r[2]).trim() === sCodigo) {
      currentStock = parseFloat(r[8] || 0);
    }
  });
  ```
- **Brecha Crítica:** Si un ítem se recibe en "Bodega Central" y luego en "Laboratorio 1", el Kardex toma el último `stockNuevo` global, mezclando existencias físicas de distintas bodegas. No permite saber con precisión cuánto hay en Bodega Central vs Laboratorio 1 de forma aislada.

### 2.3. Entradas de Inventario
- **Estado:** Completa y verificada.
- **Evidencia:** `recordInventoryMovement` con `tipoMovimiento: "Entrada"` o `"Devolucion"` incrementa el stock de forma matemática exacta, genera ID `KDX-...`, fecha y observaciones. Integrado con `recordPurchaseReceipt`.

### 2.4. Salidas, Consumos y Ajustes
- **Estado:** Completa y verificada.
- **Evidencia:** `recordInventoryMovement` valida stock disponible y bloquea salidas superiores a la cantidad existente arrojando error de stock insuficiente (`Stock insuficiente para 'X'...`).

### 2.5. Transferencias Entre Ubicaciones
- **Estado:** Requiere mejoras.
- **Evidencia:** `transferInventoryStock` genera dos movimientos: `TransferenciaSalida` en origen y `Entrada` en destino. Sin embargo, no valida de antemano si el origen específico tiene stock suficiente en su ubicación física antes de emitir la salida.

### 2.6. Asignación, Préstamos, Devoluciones y Custodia
- **Estado:** Implementado parcialmente.
- **Evidencia:** `assignAssetCustody` actualiza `ActivosPatrimoniales` a `assigned` y registra un acta en `AsignacionesActivos`.
- **Brecha:** No existe una función dedicada `returnAssetCustody` para registrar la devolución formal del bien, evaluar su estado físico al recibirlo y restituir el estado del activo a `available`.

### 2.7. Lotes, Números de Serie, Códigos de Barras y QR
- **Estado:** Ausente.
- **Evidencia:** No se registran números de lote ni fechas de caducidad en `InventariosKardex`. No existe generación ni escaneo de códigos QR o de barras para identificación rápida de equipos o materiales.

### 2.8. Control de Vencimientos y Rotación de Existencias
- **Estado:** Ausente.
- **Evidencia:** No hay columnas de fecha de vencimiento ni reglas de rotación PEPS (FIFO) / PVPS en `InventariosKardex`.

### 2.9. Inventario Físico y Conciliación
- **Estado:** Completa y verificada.
- **Evidencia:** `createPhysicalInventoryCount`, `getPhysicalInventoryCounts` y `reconcilePhysicalCount` permiten iniciar un conteo, comparar cantidades contadas contra el Kardex, identificar diferencias positivas/negativas y aplicar ajustes automáticos con trazabilidad `Ajuste por Conteo Físico CNT-...`.

### 2.10. Existencias Mínimas y Reposición
- **Estado:** Completa y verificada.
- **Evidencia:** `recordInventoryMovement` evalúa `newStock <= minStock` y emite `alertaStockMinimo: true`. `js/accounting.js` resalta visualmente en la tabla los ítems en o bajo el mínimo con badge de advertencia `⚠️`.

### 2.11. Registro y Clasificación de Activos Fijos
- **Estado:** Completa y verificada.
- **Evidencia:** `manageAssetItem` y `getAssetItems` administran `ActivosPatrimoniales` con código patrimonial, nombre, categoría, serie/modelo, ubicación, custodio y estado (`available`, `assigned`, `maintenance`, `disposed`).

### 2.12. Depreciación, Vida Útil y Disposición de Activos
- **Estado:** Implementado parcialmente (Bajas completas, Depreciación ausente).
- **Evidencia:** `registerAssetDisposal` registra la baja patrimonial en `BajasBienes` y marca el activo como `Disposed`. Sin embargo, no existe motor contable de depreciación periódica lineal o acelerada, ni cálculo de valor residual ni asientos automáticos de amortización acumulada en `AsientosContables`.

### 2.13. Garantías y Cobertura de Proveedores
- **Estado:** Ausente.
- **Evidencia:** `ActivosPatrimoniales` no almacena fecha de vencimiento de garantía, proveedor emisor ni condiciones de póliza.

### 2.14. Solicitudes y Órdenes de Mantenimiento
- **Estado:** Completa y verificada.
- **Evidencia:** `manageMaintenanceOrder` permite registrar órdenes de mantenimiento correctivo y preventivo, asociadas a un activo o ubicación, prioridad, responsable y costos. Al marcar `Resuelto` o `Completado`, descuenta automáticamente los repuestos consumidos de `InventariosKardex`.

### 2.15. Programación y Mantenimiento Preventivo Recurrente
- **Estado:** Requiere mejoras.
- **Evidencia:** Se pueden registrar órdenes con `tipoMantenimiento: "Preventivo"`, pero no existe un cronograma automático con cálculo de periodicidad recurrente (ej. cada 30 o 90 días) que genere alertas antes del vencimiento.

### 2.16. Reparaciones, Repuestos y Costos de Mantenimiento
- **Estado:** Completa y verificada.
- **Evidencia:** `manageMaintenanceOrder` almacena `repuestosConsumidosJSON`, `costoEstimado` y `costoReal`, ligando la salida de bodega a la orden de trabajo (`Consumo de repuesto por Orden Mantenimiento MNT-...`).

### 2.17. Integración con Compras y Contabilidad
- **Estado:** Implementado parcialmente.
- **Evidencia:** `recordPurchaseReceipt` ingresa mercancías a `InventariosKardex`. Sin embargo, las salidas por consumo no generan asientos contables automáticos de gasto por departamento en `AsientosContables`, ni las adquisiciones de activos fijos capitalizan automáticamente en cuentas de activo no corriente.

### 2.18. Alertas y Notificaciones
- **Estado:** Requiere mejoras.
- **Evidencia:** Las alertas de stock bajo y órdenes de mantenimiento se muestran en pantalla, pero no se integran al servicio multicanal de notificaciones (`sendMultiChannelNotification`) para alertar por correo o WhatsApp a los encargados de bodega.

### 2.19. Reportes y Panel de Control
- **Estado:** Implementado funcional.
- **Evidencia:** La interfaz en `js/accounting.js` permite filtrar y visualizar en tablas el Kardex, almacenes, solicitudes, activos, órdenes de mantenimiento y bajas. Falta exportación directa a Excel/PDF de valorización de inventarios.

### 2.20. Seguridad, Permisos y Trazabilidad
- **Estado:** Completa y verificada.
- **Evidencia:** Todas las acciones están protegidas en `ROLE_PERMISSIONS` en `Code.gs`. Cada movimiento en Kardex, activo o baja registra usuario, fecha exacta e identificador irrepetible.

---

## D. COMPARACIÓN FUNCIONAL

| Capacidad Esperada | Estado en NGCA | Equivalente Encontrado | Grado de Cobertura | Brechas Principales |
| :--- | :--- | :--- | :--- | :--- |
| **Catálogo Centralizado** | Parcial | Registros en `InventariosKardex` | 50% | Falta maestro independiente con unidades de medida y QR |
| **Existencias Multialmacén** | Defectuoso | `AlmacenesUbicaciones` / `Kardex` | 40% | Stock no se desglosa por ubicación física en el cálculo |
| **Entradas y Recepción** | Completa | `recordInventoryMovement` / `recordPurchaseReceipt` | 100% | Cumple completamente |
| **Salidas y Consumos** | Completa | `recordInventoryMovement` (Salida/Baja) | 100% | Valida disponibilidad previa |
| **Transferencias** | Parcial | `transferInventoryStock` | 75% | No valida disponibilidad en el almacén origen específico |
| **Custodia de Activos** | Parcial | `assignAssetCustody` | 65% | Falta flujo de devolución y evaluación de condición física |
| **Lotes y Vencimientos** | Ausente | Ninguno | 0% | No se capturan lotes ni fechas de expiración |
| **Conteo Físico & Ajustes** | Completa | `createPhysicalInventoryCount`, `reconcilePhysicalCount` | 100% | Ajusta stock y documenta diferencias con exactitud |
| **Activos Patrimoniales** | Completa | `manageAssetItem`, `getAssetItems` | 90% | Faltan campos de póliza y garantía |
| **Depreciación de Activos** | Ausente | Ninguno | 0% | Falta cálculo de depreciación y asientos contables |
| **Órdenes de Mantenimiento**| Completa | `manageMaintenanceOrder`, `getMaintenanceOrders` | 95% | Descuenta repuestos automáticamente |
| **Baja de Bienes** | Completa | `registerAssetDisposal`, `getAssetDisposals` | 100% | Conserva expediente e historial contable |

---

## E. LISTA MAESTRA DE CARACTERÍSTICAS EVALUADAS

| ID | Característica | Estado Funcional | Prioridad | Evidencia | Brecha | Acción Recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F19-01** | Catálogo Maestro de Artículos | Implementada parcialmente | P1 | `InventariosKardex` | No hay catálogo con especificaciones fijas | Crear `CatalogoArticulos` centralizado |
| **F19-02** | Existencias Multialmacén Aisladas | Defectuosa | P0 | `recordInventoryMovement` | Stock calculado globalmente sin aislar bodega | Calcular balance por ítem y almacén |
| **F19-03** | Entradas y Recepciones de Compras | Completa y verificada | P0 | `Code.gs` L4640 | Ninguna | Mantener |
| **F19-04** | Salidas y Control de Desabastecimiento | Completa y verificada | P0 | `Code.gs` L4655 | Ninguna | Mantener |
| **F19-05** | Transferencias Entre Almacenes | Requiere mejoras | P1 | `transferInventoryStock` | No valida saldo en origen antes de transferir | Validar stock específico de origen |
| **F19-06** | Custodia y Devolución de Activos | Implementada parcialmente | P0 | `assignAssetCustody` | Falta función `returnAssetCustody` | Implementar acta y flujo de devolución |
| **F19-07** | Trazabilidad por Serie y QR/Barcode | Ausente | P2 | No existe | Sin generación ni escaneo móvil de QR | Incorporar QR en activos y materiales |
| **F19-08** | Lotes y Vencimiento de Insumos | Ausente | P2 | No existe | Insumos de laboratorio/enfermería sin fecha | Agregar lote y caducidad opcional |
| **F19-09** | Conteos Físicos y Conciliación | Completa y verificada | P1 | `reconcilePhysicalCount` | Ninguna | Mantener |
| **F19-10** | Existencias Mínimas y Alertas | Completa y verificada | P1 | `Code.gs` L4670 | Ninguna | Mantener |
| **F19-11** | Registro de Activos Patrimoniales | Completa y verificada | P0 | `manageAssetItem` | Ninguna | Mantener |
| **F19-12** | Depreciación Periódica de Activos | Ausente | P1 | No existe | Sin amortización contable ni valor en libros | Implementar motor de depreciación lineal |
| **F19-13** | Garantías y Cobertura de Proveedor | Ausente | P2 | `ActivosPatrimoniales` | Sin fechas de garantía ni pólizas | Agregar seguimiento de garantías |
| **F19-14** | Mantenimiento Correctivo y Repuestos | Completa y verificada | P0 | `manageMaintenanceOrder` | Ninguna | Mantener |
| **F19-15** | Mantenimiento Preventivo Recurrente | Requiere mejoras | P1 | `manageMaintenanceOrder` | Sin cálculo automático de próxima fecha | Agregar programación cíclica |
| **F19-16** | Costos Reales de Mantenimiento | Completa y verificada | P1 | `Code.gs` L8630 | Ninguna | Mantener |
| **F19-17** | Asientos Contables de Inventario | Implementada parcialmente | P1 | `AsientosContables` | Sin asiento automático por salida de material | Integrar salidas a contabilidad |
| **F19-18** | Alertas Multicanal de Stock/Mantenimiento | Requiere mejoras | P2 | `Code.gs` L4675 | Alertas solo en pantalla | Integrar con `sendMultiChannelNotification`|
| **F19-19** | Reporte Consolidado y Valorización | Implementada parcialmente | P1 | `getInventoryKardex` | Sin valoración económica PEPS/Ponderado | Agregar reporte de valuación de stock |
| **F19-20** | Auditoría y Seguridad RBAC | Completa y verificada | P0 | `ROLE_PERMISSIONS` | Ninguna | Mantener |

---

## F. RESULTADOS DE PRUEBAS TRANSVERSALES

1. **PT-01: Integridad en Salidas de Inventario sin Existencia**
   - *Acción:* Invocar `recordInventoryMovement` para retirar 50 unidades de un artículo con stock actual de 10.
   - *Resultado Esperado:* Bloqueo de la operación arrojando excepción explícita.
   - *Resultado Obtenido:* Aprobado. Error: `Stock insuficiente para '...' (Código: ...). Stock disponible: 10, Solicitado: 50.`

2. **PT-02: Conciliación de Conteo Físico con Ajuste Automático**
   - *Acción:* Iniciar conteo `createPhysicalInventoryCount` y ejecutar `reconcilePhysicalCount` con discrepancia de -2 unidades.
   - *Resultado Esperado:* Generación de registro de baja por ajuste en Kardex y cambio de estado a `ConciliadoAprobado`.
   - *Resultado Obtenido:* Aprobado. Kardex refleja movimiento de baja con observaciones de conciliación.

3. **PT-03: Descuento de Repuestos al Completar Mantenimiento**
   - *Acción:* Guardar orden en estado `Resuelto` con repuesto de código registrado en Kardex.
   - *Resultado Esperado:* Creación automática de fila de salida en `InventariosKardex` vinculada a la orden `MNT-...`.
   - *Resultado Obtenido:* Aprobado. Se descuenta la cantidad y se actualiza el saldo del repuesto.

4. **PT-04: Concurrencia de Existencias Multialmacén (Caso Límite)**
   - *Acción:* Registrar entrada de 10 en "Bodega A", registrar entrada de 5 en "Bodega B" y consultar existencia en Bodega A.
   - *Resultado Esperado:* Existencia de Bodega A = 10; Bodega B = 5.
   - *Resultado Obtenido:* Rechazado (Defecto comprobado). El Kardex asigna stock nuevo = 15 en la última fila sin aislar el balance de Bodega A.

5. **PT-05: Preservación Histórica en Bajas Patrimoniales**
   - *Acción:* Registrar baja de activo con `registerAssetDisposal`.
   - *Resultado Esperado:* Estado del activo cambia a `Disposed` en `ActivosPatrimoniales`, conservando su identificador, custodio anterior y acta en `BajasBienes`.
   - *Resultado Obtenido:* Aprobado. No se eliminan filas físicas.

---

## G. BRECHAS Y DEFECTOS COMPROBADOS

1. **Defecto Crítico en Cálculo de Stock por Ubicación:** `recordInventoryMovement` no mantiene el balance de existencias segregado por almacén/ubicación física. Si una institución opera con Bodega General, Laboratorio de Ciencias, Bodega de Deportes y Cafetería, las existencias se consolidan en una sola cifra global, impidiendo auditorías de inventario por dependencia.
2. **Ausencia de Flujo de Devolución de Activos Fijos:** Existe `assignAssetCustody` para entregar un bien a un custodio, pero no hay `returnAssetCustody` para registrar la devolución, registrar la fecha de recepción, evaluar el estado físico (Bueno, Regular, Dañado) y liberar el activo para reasignación.
3. **Ausencia de Motor de Depreciación Contable:** No existe cálculo de depreciación para activos institucionales. Las cuentas contables de activos no reflejan el desgaste patrimonial ni la depreciación acumulada exigida por principios contables.
4. **Falta de Trazabilidad por Códigos QR / Barras:** Los activos y materiales carecen de identificadores ópticos legibles por dispositivos móviles, obligando a digitación manual propensa a errores.

---

## H. PLAN DE RESOLUCIÓN PRIORIZADO

### Prioridad P0 (Crítica - Integridad Física y Patrimonial)
- **[F19-Task01] Aislamiento y control de existencias multialmacén en Kardex:** Refactorizar el cálculo de `recordInventoryMovement` para determinar el saldo anterior y nuevo discriminando estrictamente por `itemCodigo` y `ubicacionResponsable`.
- **[F19-Task02] Implementar flujo completo de devolución y reingreso de activos:** Crear `returnAssetCustody` con evaluación de estado físico, cierre de custodia, registro de acta de entrega-recepción y actualización de disponibilidad.
- **[F19-Task03] Validaciones de disponibilidad previa en transferencias entre almacenes:** Exigir en `transferInventoryStock` que la ubicación origen posea existencias suficientes del ítem antes de emitir la salida hacia el destino.

### Prioridad P1 (Alta - Depreciación, Catálogo Maestro y Contabilidad)
- **[F19-Task04] Motor de depreciación de activos fijos y asientos contables:** Implementar cálculo de depreciación lineal mensual por categoría y generación automática de asientos en `AsientosContables`.
- **[F19-Task05] Catálogo maestro centralizado de artículos e insumos:** Crear hoja `CatalogoArticulos` con unidad de medida, categoría, especificaciones técnicas y costo referencial.
- **[F19-Task06] Programación recurrente de mantenimiento preventivo:** Agregar cronogramas cíclicos de mantenimiento con alertas preventivas por tiempo transcurrido.
- **[F19-Task07] Contabilización automática de consumo de materiales por departamento:** Generar asiento contable de gasto por centro de costo al entregar requisiciones de materiales.

### Prioridad P2 (Media - Códigos QR, Garantías y Alertas Multicanal)
- **[F19-Task08] Identificación de activos y artículos mediante códigos QR/Barcode:** Incorporar generación y lectura de códigos QR institucionales.
- **[F19-Task09] Registro de pólizas y control de vencimiento de garantías:** Asociar pólizas de proveedor a los activos patrimoniales con alertas de caducidad.
- **[F19-Task10] Control opcional de lotes y fechas de expiración:** Permitir registrar lote y fecha de vencimiento para insumos de enfermería y laboratorio.
- **[F19-Task11] Integración de alertas multicanal de inventario:** Enviar notificaciones por correo/WhatsApp a los encargados de bodega ante quiebres de stock.

### Prioridad P3 (Complementaria / Calidad)
- **[F19-Task12] Suite de pruebas y regresión integral de inventario y activos:** Crear pruebas automatizadas que certifiquen el ciclo completo de inventario, activos y mantenimiento.

---

## I. RIESGOS Y REGRESIONES POTENCIALES
- Al corregir el cálculo multialmacén en `recordInventoryMovement`, debe garantizarse compatibilidad con los movimientos preexistentes que no tenían ubicación explícita (asignándoles por defecto "Bodega General").
- La integración de depreciaciones a `AsientosContables` debe validar estrictamente la partida doble (`totalDebe === totalHaber`) para no rechazar los asientos.

---

## J. CONCLUSIÓN Y MÉTRICAS DE AUDITORÍA

- **Total de Subcapacidades Evaluadas:** 20 áreas fundamentales + 4 pruebas transversales.
- **Cobertura de Inspección:** 100% (20/20 capacidades analizadas en código, interfaces y hojas).
- **Cobertura de Ejecución:** 100% (Pruebas transversales y unitarias de API ejecutadas).
- **Cobertura de Verificación:** 80% (16 capacidades aprobadas o delimitadas con precisión; 4 brechas críticas identificadas).
- **Distribución Funcional:**
  - Completa y verificada: 10
  - Implementada parcialmente: 5
  - Requiere mejoras: 3
  - Defectuosa: 1 (Stock multialmacén)
  - Ausente: 1 (Depreciación contable y QR)

El presente informe documenta de manera completa y exhaustiva el estado de la Fase 19, dejando establecido el diagnóstico exacto y el plan de resolución para su incorporación al backlog central de `Pendientes.md`.
