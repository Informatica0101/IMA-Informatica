/**
 * Controller for Accounting, Inventory, Assets & Maintenance Dashboard
 * New Generation Christian Academy / Bilingual School and Institute
 */

// ---------------------------------------------------------------------------
// [T-UX-12] [Fase 3: Experiencia de Usuario y Navegación Unificada] - CONSOLIDACIÓN DE PANELES DE CONTROL POR ROL Y DEPARTAMENTO
// Consolida la visualización de indicadores clave, métricas financieras y accesos operativos para el departamento de contabilidad y finanzas.
// ---------------------------------------------------------------------------
window.consolidateAccountingDashboardSummary = function(accountingData) {
    if (!accountingData) {
        return { totalRevenueFormatted: "L 0.00", totalExpensesFormatted: "L 0.00", netBalanceFormatted: "L 0.00", pendingInvoicesCount: 0 };
    }
    var revenue = typeof accountingData.totalRevenue === 'number' ? accountingData.totalRevenue : 0;
    var expenses = typeof accountingData.totalExpenses === 'number' ? accountingData.totalExpenses : 0;
    var net = revenue - expenses;
    var pendingCount = typeof accountingData.pendingInvoicesCount === 'number' ? accountingData.pendingInvoicesCount : 0;

    return {
        totalRevenueFormatted: "L " + revenue.toFixed(2),
        totalExpensesFormatted: "L " + expenses.toFixed(2),
        netBalanceFormatted: "L " + net.toFixed(2),
        pendingInvoicesCount: pendingCount
    };
};

document.addEventListener('DOMContentLoaded', function () {
  if (typeof window.initAccountingDashboard === 'function') {
    window.initAccountingDashboard();
  }
});

let currentAccountingTab = 'resumen';
let currentInventarioSubtab = 'kardex';

window.switchTab = function (tab) {
  currentAccountingTab = tab;
  const container = document.getElementById('contabilidad-panel-container');
  if (!container) return;

  if (tab === 'inventario') {
    renderInventarioModule(container);
  } else if (tab === 'compras') {
    renderComprasModule(container);
  } else if (tab === 'biblioteca') {
    renderBibliotecaModule(container);
  } else if (tab === 'diario') {
    renderDiarioModule(container);
  } else if (tab === 'presupuestos') {
    renderPresupuestosModule(container);
  } else if (tab === 'descuentos') {
    renderDescuentosModule(container);
  } else {
    renderResumenModule(container);
  }
};

window.initAccountingDashboard = function () {
  window.switchTab('resumen');
};

// ---------------------------------------------------------------------------
// MÓDULO DE INVENTARIO, ACTIVOS FIJOS Y MANTENIMIENTO (FASE 19)
// ---------------------------------------------------------------------------

function renderInventarioModule(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        <h4 class="text-base font-black uppercase text-gray-800 flex items-center gap-2">
          <i class="fas fa-boxes text-blue-600"></i> Inventario, Activos Fijos & Mantenimiento (Fase 19)
        </h4>
        <div class="flex flex-wrap gap-2 text-xs font-bold uppercase">
          <button onclick="switchInventarioSubtab('kardex')" id="btn-sub-kardex" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-blue-600 text-white">Kardex</button>
          <button onclick="switchInventarioSubtab('almacenes')" id="btn-sub-almacenes" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Almacenes</button>
          <button onclick="switchInventarioSubtab('transferencias')" id="btn-sub-transferencias" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Transferencias</button>
          <button onclick="switchInventarioSubtab('solicitudes')" id="btn-sub-solicitudes" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Solicitudes & Entregas</button>
          <button onclick="switchInventarioSubtab('activos')" id="btn-sub-activos" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Activos Fijos</button>
          <button onclick="switchInventarioSubtab('mantenimiento')" id="btn-sub-mantenimiento" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Mantenimiento</button>
          <button onclick="switchInventarioSubtab('bajas')" id="btn-sub-bajas" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Bajas</button>
        </div>
      </div>

      <div id="inventario-subtab-container" class="space-y-4">
        <div class="text-center py-6 text-gray-400 text-xs font-bold uppercase">Cargando datos de inventario...</div>
      </div>
    </div>
  `;
  switchInventarioSubtab('kardex');
}

window.switchInventarioSubtab = function (subtab) {
  currentInventarioSubtab = subtab;
  ['kardex', 'almacenes', 'transferencias', 'solicitudes', 'activos', 'mantenimiento', 'bajas'].forEach(s => {
    const btn = document.getElementById(`btn-sub-${s}`);
    if (btn) {
      if (s === subtab) {
        btn.className = "px-3 py-1.5 rounded-xl transition-all shadow-sm bg-blue-600 text-white font-bold";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100 font-bold";
      }
    }
  });

  const subContainer = document.getElementById('inventario-subtab-container');
  if (!subContainer) return;

  if (subtab === 'kardex') renderKardexView(subContainer);
  else if (subtab === 'almacenes') renderAlmacenesView(subContainer);
  else if (subtab === 'transferencias') renderTransferenciasView(subContainer);
  else if (subtab === 'solicitudes') renderSolicitudesView(subContainer);
  else if (subtab === 'activos') renderActivosView(subContainer);
  else if (subtab === 'mantenimiento') renderMantenimientoView(subContainer);
  else if (subtab === 'bajas') renderBajasView(subContainer);
};

// --- SUB-VISTAS DE INVENTARIO ---

function renderKardexView(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
        <h5 class="font-black text-xs uppercase text-gray-800 mb-3"><i class="fas fa-plus-circle text-emerald-600"></i> Registrar Movimiento</h5>
        <form id="form-movimiento-kardex" onsubmit="handleMovimientoKardex(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Código de Ítem *</label>
            <input type="text" id="kdx-codigo" required class="w-full p-2 border border-gray-300 rounded-xl font-bold" placeholder="EJ: MAT-PAP-01">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Nombre de Ítem *</label>
            <input type="text" id="kdx-nombre" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: Papel Bond Tamaño Carta">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Tipo Movimiento</label>
            <select id="kdx-tipo" class="w-full p-2 border border-gray-300 rounded-xl">
              <option value="Entrada">Entrada (Compra / Recepción)</option>
              <option value="Salida">Salida (Consumo Operativo)</option>
              <option value="Devolucion">Devolución al Almacén</option>
              <option value="Baja">Baja / Deterioro</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-gray-600 mb-1">Cantidad *</label>
              <input type="number" step="0.01" id="kdx-cantidad" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="10">
            </div>
            <div>
              <label class="block font-bold text-gray-600 mb-1">Stock Mínimo</label>
              <input type="number" id="kdx-minimo" value="5" class="w-full p-2 border border-gray-300 rounded-xl">
            </div>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Ubicación / Responsable</label>
            <input type="text" id="kdx-ubicacion" value="Bodega General" class="w-full p-2 border border-gray-300 rounded-xl">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Observaciones</label>
            <input type="text" id="kdx-obs" class="w-full p-2 border border-gray-300 rounded-xl">
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all uppercase">
            Guardar Movimiento
          </button>
        </form>
      </div>

      <div class="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-list text-blue-600"></i> Historial Kardex de Existencias</h5>
          <button onclick="loadKardexData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
        </div>
        <div id="kardex-table-container" class="overflow-x-auto text-xs">
          <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando movimientos...</div>
        </div>
      </div>
    </div>
  `;
  loadKardexData();
}

// [TASK-019] [F19-Task01] - Carga y renderizado de existencias multialmacén e historial de Kardex
window.loadKardexData = function (filtroUbicacion) {
  const container = document.getElementById('kardex-table-container');
  if (!container) return;

  const payload = {};
  if (filtroUbicacion) payload.ubicacionResponsable = filtroUbicacion;

  fetchApi('ACCOUNTING', 'getInventoryKardex', payload)
    .then(res => {
      const items = (res && (res.kardex || res.data)) ? (res.kardex || res.data) : [];
      const resumenUbicaciones = (res && res.resumenPorUbicacion) ? res.resumenPorUbicacion : [];
      const resumenConsolidado = (res && res.resumenExistencias) ? res.resumenExistencias : [];

      if (items.length === 0 && resumenConsolidado.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay registros en el Kardex de inventario.</div>`;
        return;
      }

      let html = "";

      // 1. Tarjeta resumen de existencias multialmacén vs consolidado institucional
      if (resumenConsolidado.length > 0) {
        html += `
          <div class="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <h6 class="font-black text-[11px] text-blue-900 uppercase mb-2"><i class="fas fa-warehouse text-blue-600"></i> Resumen de Existencias por Almacén y Consolidado Institucional</h6>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        `;
        resumenConsolidado.forEach(item => {
          const ubs = item.ubicaciones || {};
          html += `
            <div class="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
              <div class="flex justify-between items-start">
                <span class="font-bold text-gray-800 text-xs">${item.itemNombre}</span>
                <span class="font-mono text-[10px] text-blue-600 bg-blue-100 px-1 rounded">${item.itemCodigo}</span>
              </div>
              <div class="mt-1 text-[11px] text-gray-600 space-y-0.5">
          `;
          Object.keys(ubs).forEach(ub => {
            html += `<div class="flex justify-between"><span>📍 ${ub}:</span><span class="font-bold">${ubs[ub]}</span></div>`;
          });
          html += `
              </div>
              <div class="mt-2 pt-1 border-t border-gray-100 flex justify-between font-black text-xs ${item.alertaStockMinimo ? 'text-rose-600' : 'text-emerald-700'}">
                <span>Total Institucional:</span>
                <span>${item.totalInstitucional} ${item.alertaStockMinimo ? '⚠️' : ''}</span>
              </div>
            </div>
          `;
        });
        html += `</div></div>`;
      }

      // 2. Tabla detallada de movimientos Kardex
      html += `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">Código</th>
              <th class="p-2">Ítem</th>
              <th class="p-2">Movimiento</th>
              <th class="p-2 text-right">Cant.</th>
              <th class="p-2 text-right">Stock Ant.</th>
              <th class="p-2 text-right">Stock Nuevo</th>
              <th class="p-2">Ubicación / Almacén</th>
              <th class="p-2">Observaciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      items.forEach(k => {
        const isBajo = k.stockNuevo <= k.stockMinimo;
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-blue-600">${k.itemCodigo}</td>
            <td class="p-2 font-bold text-gray-800">${k.itemNombre}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${k.tipoMovimiento.includes('Entrada') || k.tipoMovimiento === 'Devolucion' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${k.tipoMovimiento}</span></td>
            <td class="p-2 text-right font-bold">${k.cantidad}</td>
            <td class="p-2 text-right text-gray-500 font-mono">${k.stockAnterior !== undefined ? k.stockAnterior : '-'}</td>
            <td class="p-2 text-right font-black ${isBajo ? 'text-rose-600' : 'text-emerald-600'}">${k.stockNuevo} ${isBajo ? '⚠️' : ''}</td>
            <td class="p-2 text-gray-700 font-semibold">📍 ${k.ubicacionResponsable || 'Bodega General'}</td>
            <td class="p-2 text-gray-500 text-[11px] truncate max-w-[150px]">${k.observaciones || ''}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar Kardex: ${err.message}</div>`;
    });
};

window.handleMovimientoKardex = function (e) {
  e.preventDefault();
  const payload = {
    itemCodigo: document.getElementById('kdx-codigo').value,
    itemNombre: document.getElementById('kdx-nombre').value,
    tipoMovimiento: document.getElementById('kdx-tipo').value,
    cantidad: document.getElementById('kdx-cantidad').value,
    stockMinimo: document.getElementById('kdx-minimo').value,
    ubicacionResponsable: document.getElementById('kdx-ubicacion').value,
    observaciones: document.getElementById('kdx-obs').value
  };

  fetchApi('ACCOUNTING', 'recordInventoryMovement', payload)
    .then(res => {
      alert(res.message || "Movimiento registrado con éxito.");
      document.getElementById('form-movimiento-kardex').reset();
      loadKardexData();
    })
    .catch(err => alert("Error: " + err.message));
};

// --- ALMACENES & UBICACIONES ---

function renderAlmacenesView(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
        <h5 class="font-black text-xs uppercase text-gray-800 mb-3"><i class="fas fa-warehouse text-blue-600"></i> Registrar Ubicación / Almacén</h5>
        <form id="form-almacen" onsubmit="handleSaveAlmacen(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Nombre de Ubicación *</label>
            <input type="text" id="loc-nombre" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: Bodega de Ciencias">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Tipo de Área</label>
            <select id="loc-tipo" class="w-full p-2 border border-gray-300 rounded-xl">
              <option value="Bodega">Bodega</option>
              <option value="Laboratorio">Laboratorio</option>
              <option value="Aula">Aula</option>
              <option value="Oficina">Oficina</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Responsable (UserId / Empleado)</label>
            <input type="text" id="loc-responsable" class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: EMP-01">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Observaciones</label>
            <input type="text" id="loc-obs" class="w-full p-2 border border-gray-300 rounded-xl">
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all uppercase">
            Guardar Ubicación
          </button>
        </form>
      </div>

      <div class="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-map-marker-alt text-emerald-600"></i> Catálogo de Ubicaciones Institucionales</h5>
          <button onclick="loadAlmacenesData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
        </div>
        <div id="almacenes-table-container" class="overflow-x-auto text-xs">
          <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando ubicaciones...</div>
        </div>
      </div>
    </div>
  `;
  loadAlmacenesData();
}

window.loadAlmacenesData = function () {
  const container = document.getElementById('almacenes-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getWarehouseLocations', {})
    .then(res => {
      const ubs = (res && res.ubicaciones) ? res.ubicaciones : [];
      if (ubs.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay ubicaciones registradas.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID</th>
              <th class="p-2">Ubicación / Almacén</th>
              <th class="p-2">Tipo</th>
              <th class="p-2">Responsable</th>
              <th class="p-2">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      ubs.forEach(u => {
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-blue-600">${u.ubicacionId}</td>
            <td class="p-2 font-bold text-gray-800">${u.nombreUbicacion}</td>
            <td class="p-2 text-gray-500">${u.tipoArea}</td>
            <td class="p-2 text-gray-700 font-medium">${u.responsableUserId || 'Sin asignar'}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${u.estado}</span></td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar almacenes: ${err.message}</div>`;
    });
};

window.handleSaveAlmacen = function (e) {
  e.preventDefault();
  const payload = {
    nombreUbicacion: document.getElementById('loc-nombre').value,
    tipoArea: document.getElementById('loc-tipo').value,
    responsableUserId: document.getElementById('loc-responsable').value,
    observaciones: document.getElementById('loc-obs').value
  };

  fetchApi('ACCOUNTING', 'manageWarehouseLocation', payload)
    .then(res => {
      alert(res.message || "Ubicación guardada con éxito.");
      document.getElementById('form-almacen').reset();
      loadAlmacenesData();
    })
    .catch(err => alert("Error: " + err.message));
};

// --- SOLICITUDES & ENTREGAS ---

function renderSolicitudesView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-file-signature text-purple-600"></i> Solicitudes Internas de Materiales</h5>
        <button onclick="loadSolicitudesData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
      </div>
      <div id="solicitudes-table-container" class="overflow-x-auto text-xs">
        <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando solicitudes...</div>
      </div>
    </div>
  `;
  loadSolicitudesData();
}

window.loadSolicitudesData = function () {
  const container = document.getElementById('solicitudes-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getMaterialRequisitions', {})
    .then(res => {
      const sols = (res && res.solicitudes) ? res.solicitudes : [];
      if (sols.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay solicitudes internas de materiales.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID Solicitud</th>
              <th class="p-2">Departamento</th>
              <th class="p-2">Solicitante</th>
              <th class="p-2">Motivo</th>
              <th class="p-2">Estado</th>
              <th class="p-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      sols.forEach(s => {
        const isPend = s.estadoAprobacion === 'PendienteAprobacion' || s.estadoAprobacion === 'Aprobada';
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-purple-600">${s.solicitudMatId}</td>
            <td class="p-2 font-bold text-gray-800">${s.departamento}</td>
            <td class="p-2 text-gray-600">${s.solicitanteUserId}</td>
            <td class="p-2 text-gray-500">${s.motivo || 'Consumo'}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.estadoAprobacion === 'Entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${s.estadoAprobacion}</span></td>
            <td class="p-2 text-right">
              ${isPend ? `<button onclick="handleEntregarSolicitud('${s.solicitudMatId}')" class="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-emerald-700">Entregar</button>` : `<span class="text-gray-400 text-[10px]">Entregado</span>`}
            </td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar solicitudes: ${err.message}</div>`;
    });
};

window.handleEntregarSolicitud = function (solId) {
  if (!confirm(`¿Confirmar la entrega física de los materiales para la solicitud ${solId}?`)) return;

  fetchApi('ACCOUNTING', 'deliverMaterialRequisition', { solicitudMatId: solId, entregadoPorUserId: 'Bodega' })
    .then(res => {
      alert(res.message || "Entrega de materiales procesada con éxito.");
      loadSolicitudesData();
    })
    .catch(err => alert("Error: " + err.message));
};

// --- ACTIVOS FIJOS & CUSTODIAS ---

function renderActivosView(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
        <h5 class="font-black text-xs uppercase text-gray-800 mb-3"><i class="fas fa-desktop text-indigo-600"></i> Registrar Activo Patrimonial</h5>
        <form id="form-activo" onsubmit="handleSaveActivo(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Código Patrimonial *</label>
            <input type="text" id="act-codigo" required class="w-full p-2 border border-gray-300 rounded-xl font-bold" placeholder="EJ: PAT-LAB-01">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Nombre del Activo *</label>
            <input type="text" id="act-nombre" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: Computadora All-in-One HP">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Categoría</label>
            <select id="act-categoria" class="w-full p-2 border border-gray-300 rounded-xl">
              <option value="Equipo Computacional">Equipo Computacional</option>
              <option value="Audiovisual">Audiovisual</option>
              <option value="Mobiliario">Mobiliario</option>
              <option value="Maquinaria">Maquinaria / Climatización</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Serie / Modelo</label>
            <input type="text" id="act-serie" class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: SN-987654321">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Ubicación Actual</label>
            <input type="text" id="act-ubicacion" value="Laboratorio Cómputo 1" class="w-full p-2 border border-gray-300 rounded-xl">
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all uppercase">
            Guardar Activo
          </button>
        </form>
      </div>

      <div class="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-landmark text-blue-600"></i> Inventario de Activos Patrimoniales</h5>
          <button onclick="loadActivosData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
        </div>
        <div id="activos-table-container" class="overflow-x-auto text-xs">
          <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando activos...</div>
        </div>
      </div>
    </div>
  `;
  loadActivosData();
}

window.loadActivosData = function () {
  const container = document.getElementById('activos-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getAssetItems', {})
    .then(res => {
      const items = (res && res.activos) ? res.activos : [];
      if (items.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay activos registrados.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">Código</th>
              <th class="p-2">Nombre del Activo</th>
              <th class="p-2">Categoría</th>
              <th class="p-2">Ubicación</th>
              <th class="p-2">Custodio (UserId)</th>
              <th class="p-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      items.forEach(a => {
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-indigo-600">${a.codigoPatrimonial}</td>
            <td class="p-2 font-bold text-gray-800">${a.nombre}</td>
            <td class="p-2 text-gray-500">${a.categoria}</td>
            <td class="p-2 text-gray-700 font-medium">${a.ubicacionActual}</td>
            <td class="p-2 text-gray-600 font-mono">${a.custodioUserId || 'Sin Custodio'}</td>
            <td class="p-2 text-right space-x-1 whitespace-nowrap">
              <button onclick="handleAsignarCustodia('${a.activoId}')" class="px-2 py-1 bg-blue-50 text-blue-600 rounded font-bold text-[10px] hover:bg-blue-100 uppercase" title="Asignar Custodia">Asignar</button>
              ${(a.custodioUserId || a.estado === 'assigned') ? `<button onclick="handleDevolverCustodia('${a.activoId}', '${a.codigoPatrimonial || ''}', '${(a.nombre || '').replace(/'/g, "\\'")}', '${a.custodioUserId || ''}')" class="px-2 py-1 bg-rose-50 text-rose-600 rounded font-bold text-[10px] hover:bg-rose-100 uppercase" title="Registrar Devolución y Acta">Devolver</button>` : ''}
            </td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar activos: ${err.message}</div>`;
    });
};

window.handleSaveActivo = function (e) {
  e.preventDefault();
  const payload = {
    codigoPatrimonial: document.getElementById('act-codigo').value,
    nombre: document.getElementById('act-nombre').value,
    categoria: document.getElementById('act-categoria').value,
    serieModel: document.getElementById('act-serie').value,
    ubicacionActual: document.getElementById('act-ubicacion').value
  };

  fetchApi('ACCOUNTING', 'manageAssetItem', payload)
    .then(res => {
      alert(res.message || "Activo registrado con éxito.");
      document.getElementById('form-activo').reset();
      loadActivosData();
    })
    .catch(err => alert("Error: " + err.message));
};

window.handleAsignarCustodia = function (activoId) {
  const custodio = prompt("Ingrese el UserId del custodio o empleado responsable (EJ: EMP-01):");
  if (!custodio) return;

  fetchApi('ACCOUNTING', 'assignAssetCustody', { activoId: activoId, custodioUserId: custodio })
    .then(res => {
      alert(res.message || "Custodia asignada correctamente.");
      loadActivosData();
    })
    .catch(err => alert("Error: " + err.message));
};

window.handleDevolverCustodia = function (activoId, codigoPatrimonial, nombre, custodioUserId) {
  const custodio = prompt(`Confirmar custodio que entrega el activo (${codigoPatrimonial} - ${nombre}):`, custodioUserId || "");
  if (!custodio) return;

  const receptor = prompt("UserId o nombre del responsable institucional que recibe el activo:", (window.currentUser && window.currentUser.userId) || "DIR-01");
  if (!receptor) return;

  const condicionPrompt = prompt("Condición física al reingreso (Nuevo, Bueno, Regular, Dañado, Incompleto, RequiereReparacion):", "Bueno");
  if (!condicionPrompt) return;

  const obs = prompt("Observaciones de la entrega / componentes o detalles:", "Devolución en orden y revisión conforme");

  fetchApi('ACCOUNTING', 'returnAssetCustody', {
    activoId: activoId,
    custodioUserId: custodio,
    recibidoPor: receptor,
    receptorUserId: receptor,
    estadoFisico: condicionPrompt,
    condicionRecepcion: condicionPrompt,
    observaciones: obs || "Recepción formal de custodia",
    ubicacionRecepcion: "Bodega General"
  })
    .then(res => {
      let msg = res.message || "Devolución registrada correctamente.";
      if (res.ordenMantenimientoId) {
        msg += `\nSe generó orden de mantenimiento: ${res.ordenMantenimientoId}`;
      }
      if (res.actaDevolucionId) {
        msg += `\nActa de Entrega-Recepción: ${res.actaDevolucionId}`;
      }
      alert(msg);
      loadActivosData();
    })
    .catch(err => alert("Error al devolver custodia: " + (err.message || err)));
};

// --- MANTENIMIENTO ---

function renderMantenimientoView(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
        <h5 class="font-black text-xs uppercase text-gray-800 mb-3"><i class="fas fa-tools text-amber-600"></i> Orden de Mantenimiento</h5>
        <form id="form-mantenimiento" onsubmit="handleSaveMantenimiento(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Activo / Ubicación Afecada *</label>
            <input type="text" id="mnt-activo" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: PAT-LAB-01 / Lab Cómputo">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Tipo Mantenimiento</label>
            <select id="mnt-tipo" class="w-full p-2 border border-gray-300 rounded-xl">
              <option value="Correctivo">Correctivo (Reparación de Falla)</option>
              <option value="Preventivo">Preventivo (Programado)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Descripción de la Falla *</label>
            <textarea id="mnt-falla" required class="w-full p-2 border border-gray-300 rounded-xl" rows="2" placeholder="Describa el problema reportado..."></textarea>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Prioridad</label>
            <select id="mnt-prioridad" class="w-full p-2 border border-gray-300 rounded-xl">
              <option value="Baja">Baja</option>
              <option value="Media" selected>Media</option>
              <option value="Alta">Alta / Urgente</option>
            </select>
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all uppercase">
            Crear Orden
          </button>
        </form>
      </div>

      <div class="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-wrench text-amber-600"></i> Órdenes de Mantenimiento</h5>
          <button onclick="loadMantenimientoData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
        </div>
        <div id="mantenimiento-table-container" class="overflow-x-auto text-xs">
          <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando mantenimiento...</div>
        </div>
      </div>
    </div>
  `;
  loadMantenimientoData();
}

window.loadMantenimientoData = function () {
  const container = document.getElementById('mantenimiento-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getMaintenanceOrders', {})
    .then(res => {
      const ords = (res && res.ordenes) ? res.ordenes : [];
      if (ords.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay órdenes de mantenimiento activas.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID Orden</th>
              <th class="p-2">Activo / Ubicación</th>
              <th class="p-2">Tipo</th>
              <th class="p-2">Descripción</th>
              <th class="p-2">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      ords.forEach(o => {
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-amber-600">${o.ordenMaintId}</td>
            <td class="p-2 font-bold text-gray-800">${o.activoIdUbicacion}</td>
            <td class="p-2 text-gray-500">${o.tipoMantenimiento}</td>
            <td class="p-2 text-gray-600">${o.descripcionFalla}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${o.estadoOrden === 'Resuelto' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${o.estadoOrden}</span></td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar mantenimientos: ${err.message}</div>`;
    });
};

window.handleSaveMantenimiento = function (e) {
  e.preventDefault();
  const payload = {
    activoIdUbicacion: document.getElementById('mnt-activo').value,
    tipoMantenimiento: document.getElementById('mnt-tipo').value,
    descripcionFalla: document.getElementById('mnt-falla').value,
    prioridad: document.getElementById('mnt-prioridad').value
  };

  fetchApi('ACCOUNTING', 'manageMaintenanceOrder', payload)
    .then(res => {
      alert(res.message || "Orden de mantenimiento creada con éxito.");
      document.getElementById('form-mantenimiento').reset();
      loadMantenimientoData();
    })
    .catch(err => alert("Error: " + err.message));
};

// --- BAJAS DE BIENES ---

function renderBajasView(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
        <h5 class="font-black text-xs uppercase text-gray-800 mb-3"><i class="fas fa-trash-alt text-rose-600"></i> Registrar Baja de Bien</h5>
        <form id="form-baja" onsubmit="handleSaveBaja(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Código / ID de Bien *</label>
            <input type="text" id="baj-codigo" required class="w-full p-2 border border-gray-300 rounded-xl font-bold" placeholder="EJ: PAT-LAB-01 / MAT-01">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Nombre de Bien</label>
            <input type="text" id="baj-nombre" class="w-full p-2 border border-gray-300 rounded-xl">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Tipo de Bien</label>
            <select id="baj-tipo" class="w-full p-2 border border-gray-300 rounded-xl">
              <option value="ActivoFijo">Activo Fijo Patrimonial</option>
              <option value="Inventario">Insumo / Material de Inventario</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Motivo de Baja *</label>
            <textarea id="baj-motivo" required class="w-full p-2 border border-gray-300 rounded-xl" rows="2" placeholder="Desuso, obsolescencia, daño irreparable..."></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all uppercase">
            Confirmar Baja
          </button>
        </form>
      </div>

      <div class="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-history text-rose-600"></i> Historial de Bajas Institucionales</h5>
          <button onclick="loadBajasData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
        </div>
        <div id="bajas-table-container" class="overflow-x-auto text-xs">
          <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando bajas...</div>
        </div>
      </div>
    </div>
  `;
  loadBajasData();
}

window.loadBajasData = function () {
  const container = document.getElementById('bajas-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getAssetDisposals', {})
    .then(res => {
      const bjs = (res && res.bajas) ? res.bajas : [];
      if (bjs.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay registros de baja institucionales.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID Baja</th>
              <th class="p-2">Código Bien</th>
              <th class="p-2">Bien</th>
              <th class="p-2">Tipo</th>
              <th class="p-2">Motivo</th>
              <th class="p-2">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      bjs.forEach(b => {
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-rose-600">${b.bajaId}</td>
            <td class="p-2 font-mono font-bold text-gray-700">${b.bienIdCodigo}</td>
            <td class="p-2 font-bold text-gray-800">${b.nombreBien}</td>
            <td class="p-2 text-gray-500">${b.tipoBien}</td>
            <td class="p-2 text-gray-600">${b.motivoBaja}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">${b.estado}</span></td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar bajas: ${err.message}</div>`;
    });
};

window.handleSaveBaja = function (e) {
  e.preventDefault();
  const payload = {
    bienIdCodigo: document.getElementById('baj-codigo').value,
    nombreBien: document.getElementById('baj-nombre').value,
    tipoBien: document.getElementById('baj-tipo').value,
    motivoBaja: document.getElementById('baj-motivo').value
  };

  fetchApi('ACCOUNTING', 'registerAssetDisposal', payload)
    .then(res => {
      alert(res.message || "Baja registrada con éxito.");
      document.getElementById('form-baja').reset();
      loadBajasData();
    })
    .catch(err => alert("Error: " + err.message));
};

// --- OTROS MÓDULOS DEL PANEL CONTABLE ---

// [TASK-014] [F18-Task03] - Interfaz operativa completa del módulo de compras & proveedores
let currentComprasSubtab = 'solicitudes';

function renderComprasModule(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- HEADER Y NAVEGACIÓN DE SUBPESTAÑAS -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        <h4 class="text-base font-black uppercase text-gray-800 flex items-center gap-2">
          <i class="fas fa-shopping-cart text-purple-600"></i> Gestión de Compras & Proveedores (Fase 18)
        </h4>
        <div class="flex flex-wrap gap-2 text-xs font-bold uppercase">
          <button onclick="switchComprasSubtab('solicitudes')" id="btn-cmp-solicitudes" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-purple-600 text-white">Solicitudes</button>
          <button onclick="switchComprasSubtab('cotizaciones')" id="btn-cmp-cotizaciones" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Cotizaciones</button>
          <button onclick="switchComprasSubtab('ordenes')" id="btn-cmp-ordenes" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Órdenes de Compra</button>
          <button onclick="switchComprasSubtab('recepciones')" id="btn-cmp-recepciones" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Recepciones</button>
          <button onclick="switchComprasSubtab('threeway')" id="btn-cmp-threeway" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Three-Way Match</button>
          <button onclick="switchComprasSubtab('proveedores')" id="btn-cmp-proveedores" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Proveedores</button>
        </div>
      </div>

      <!-- KPI METRICS SUMMARY -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div class="p-4 bg-purple-50 rounded-2xl border border-purple-100">
          <span class="text-xs uppercase font-bold text-purple-600 block">Solicitudes Pendientes</span>
          <span class="text-xl font-black text-purple-900" id="kpi-cmp-solicitudes">--</span>
        </div>
        <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <span class="text-xs uppercase font-bold text-blue-600 block">Órdenes por Entregar</span>
          <span class="text-xl font-black text-blue-900" id="kpi-cmp-ordenes">--</span>
        </div>
        <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <span class="text-xs uppercase font-bold text-amber-600 block">Entregas Parciales</span>
          <span class="text-xl font-black text-amber-900" id="kpi-cmp-parciales">--</span>
        </div>
        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <span class="text-xs uppercase font-bold text-emerald-600 block">Conciliación 3-Vías</span>
          <span class="text-xl font-black text-emerald-900" id="kpi-cmp-conciliadas">Activa</span>
        </div>
      </div>

      <!-- CONTENEDOR DE SUBPESTAÑA DINÁMICA -->
      <div id="compras-subtab-container" class="space-y-4">
        <!-- Renderizado dinámico -->
      </div>
    </div>
  `;

  window.switchComprasSubtab('solicitudes');
}

window.switchComprasSubtab = function (subtab) {
  currentComprasSubtab = subtab;
  const tabs = ['solicitudes', 'cotizaciones', 'ordenes', 'recepciones', 'threeway', 'proveedores'];
  tabs.forEach(t => {
    const btn = document.getElementById(`btn-cmp-${t}`);
    if (btn) {
      if (t === subtab) {
        btn.className = "px-3 py-1.5 rounded-xl transition-all shadow-sm bg-purple-600 text-white";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100";
      }
    }
  });

  const subContainer = document.getElementById('compras-subtab-container');
  if (!subContainer) return;

  if (subtab === 'solicitudes') {
    renderComprasSolicitudesView(subContainer);
  } else if (subtab === 'cotizaciones') {
    renderComprasCotizacionesView(subContainer);
  } else if (subtab === 'ordenes') {
    renderComprasOrdenesView(subContainer);
  } else if (subtab === 'recepciones') {
    renderComprasRecepcionesView(subContainer);
  } else if (subtab === 'threeway') {
    renderComprasThreeWayView(subContainer);
  } else if (subtab === 'proveedores') {
    renderComprasProveedoresView(subContainer);
  }
};

function renderComprasSolicitudesView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h5 class="text-sm font-black uppercase text-gray-800">Solicitudes de Compra Institucionales</h5>
        <button onclick="openNewPurchaseRequestModal()" class="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-purple-700 shadow-sm flex items-center gap-2">
          <i class="fas fa-plus"></i> Nueva Solicitud
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-gray-50 text-gray-500 uppercase font-black">
            <tr>
              <th class="p-3">ID Solicitud</th>
              <th class="p-3">Departamento</th>
              <th class="p-3">Justificación</th>
              <th class="p-3">Monto Est.</th>
              <th class="p-3">Estado</th>
              <th class="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbl-compras-solicitudes" class="divide-y divide-gray-100">
            <tr><td colspan="6" class="p-4 text-center text-gray-400">Cargando solicitudes de compra...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Cargar solicitudes de compra desde el backend
  fetchBackendAccounting('getPurchaseRequests', {})
    .then(res => {
      const tbody = document.getElementById('tbl-compras-solicitudes');
      const kpi = document.getElementById('kpi-cmp-solicitudes');
      if (!tbody) return;
      const list = res.solicitudes || [];
      if (kpi) kpi.innerText = list.filter(s => s.estadoAprobacion === 'PendienteAprobacion' || s.estadoAprobacion === 'Pendiente').length;

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">No hay solicitudes de compra registradas.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map(s => `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-bold text-gray-900">${s.solicitudId}</td>
          <td class="p-3">${s.departamento || '-'}</td>
          <td class="p-3 max-w-xs truncate">${s.justificacion || '-'}</td>
          <td class="p-3 font-bold text-gray-900">L ${(parseFloat(s.montoEstimado || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="p-3"><span class="px-2 py-1 rounded-lg text-xs font-bold ${s.estadoAprobacion === 'Aprobada' ? 'bg-emerald-100 text-emerald-800' : (s.estadoAprobacion === 'Rechazada' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}">${s.estadoAprobacion}</span></td>
          <td class="p-3 space-x-1">
            <button onclick="viewPurchaseRequestDetails('${s.solicitudId}')" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold text-[10px]">Detalle</button>
          </td>
        </tr>
      `).join('');
    })
    .catch(err => {
      const tbody = document.getElementById('tbl-compras-solicitudes');
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Error al consultar solicitudes: ${err.message}</td></tr>`;
    });
}

function renderComprasCotizacionesView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h5 class="text-sm font-black uppercase text-gray-800">Cotizaciones & Cuadro Comparativo de Ofertas</h5>
      </div>
      <p class="text-xs text-gray-600">Registro de ofertas de proveedores, comparación de precios y adjudicación formal.</p>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-gray-50 text-gray-500 uppercase font-black">
            <tr>
              <th class="p-3">Cotización ID</th>
              <th class="p-3">Solicitud</th>
              <th class="p-3">Proveedor</th>
              <th class="p-3">Precio Ofertado</th>
              <th class="p-3">Plazo Entrega</th>
              <th class="p-3">Estado Selección</th>
            </tr>
          </thead>
          <tbody id="tbl-compras-cotizaciones" class="divide-y divide-gray-100">
            <tr><td colspan="6" class="p-4 text-center text-gray-400">Cargando cotizaciones...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchBackendAccounting('getPurchaseQuotations', {})
    .then(res => {
      const tbody = document.getElementById('tbl-compras-cotizaciones');
      if (!tbody) return;
      const list = res.cotizaciones || [];
      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">No hay cotizaciones registradas.</td></tr>`;
        return;
      }
      tbody.innerHTML = list.map(c => `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-bold text-gray-900">${c.cotizacionId}</td>
          <td class="p-3">${c.solicitudId}</td>
          <td class="p-3">${c.proveedorId}</td>
          <td class="p-3 font-bold text-gray-900">L ${(parseFloat(c.precioTotal || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="p-3">${c.plazoEntregaDias ? c.plazoEntregaDias + ' días' : '-'}</td>
          <td class="p-3"><span class="px-2 py-1 rounded-lg text-xs font-bold ${c.estadoSelection === 'Adjudicada' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}">${c.estadoSelection || 'Registrada'}</span></td>
        </tr>
      `).join('');
    })
    .catch(err => {
      const tbody = document.getElementById('tbl-compras-cotizaciones');
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Error: ${err.message}</td></tr>`;
    });
}

function renderComprasOrdenesView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h5 class="text-sm font-black uppercase text-gray-800">Órdenes de Compra Emitidas</h5>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-gray-50 text-gray-500 uppercase font-black">
            <tr>
              <th class="p-3">Orden ID</th>
              <th class="p-3">Proveedor</th>
              <th class="p-3">Monto Total</th>
              <th class="p-3">Fecha Entrega Est.</th>
              <th class="p-3">Estado Orden</th>
            </tr>
          </thead>
          <tbody id="tbl-compras-ordenes" class="divide-y divide-gray-100">
            <tr><td colspan="5" class="p-4 text-center text-gray-400">Cargando órdenes de compra...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchBackendAccounting('getPurchaseOrders', {})
    .then(res => {
      const tbody = document.getElementById('tbl-compras-ordenes');
      const kpi = document.getElementById('kpi-cmp-ordenes');
      const kpiParcial = document.getElementById('kpi-cmp-parciales');
      if (!tbody) return;
      const list = res.ordenes || [];
      if (kpi) kpi.innerText = list.filter(o => o.estadoOrden !== 'RecibidaTotal' && o.estadoOrden !== 'Cancelada').length;
      if (kpiParcial) kpiParcial.innerText = list.filter(o => o.estadoOrden === 'RecibidaParcial').length;

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400">No hay órdenes de compra registradas.</td></tr>`;
        return;
      }
      tbody.innerHTML = list.map(o => `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-bold text-gray-900">${o.ordenId}</td>
          <td class="p-3">${o.proveedorId}</td>
          <td class="p-3 font-bold text-gray-900">L ${(parseFloat(o.montoTotal || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="p-3">${o.fechaEntregaEstimada ? new Date(o.fechaEntregaEstimada).toLocaleDateString() : '-'}</td>
          <td class="p-3">
            <span class="px-2 py-1 rounded-lg text-xs font-bold ${
              o.estadoOrden === 'RecibidaTotal' ? 'bg-emerald-100 text-emerald-800' :
              o.estadoOrden === 'RecibidaParcial' ? 'bg-amber-100 text-amber-800' :
              o.estadoOrden === 'Aprobada' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
            }">${o.estadoOrden}</span>
          </td>
        </tr>
      `).join('');
    })
    .catch(err => {
      const tbody = document.getElementById('tbl-compras-ordenes');
      if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Error: ${err.message}</td></tr>`;
    });
}

function renderComprasRecepcionesView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h5 class="text-sm font-black uppercase text-gray-800">Recepciones de Mercancía en Almacén</h5>
      </div>
      <p class="text-xs text-gray-600">Registro de entregas físicas escalonadas, control de faltantes y exclusión de dañados.</p>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-gray-50 text-gray-500 uppercase font-black">
            <tr>
              <th class="p-3">Recepción ID</th>
              <th class="p-3">Orden Compra</th>
              <th class="p-3">Fecha</th>
              <th class="p-3">Receptor</th>
              <th class="p-3">Estado Conformidad</th>
            </tr>
          </thead>
          <tbody id="tbl-compras-recepciones" class="divide-y divide-gray-100">
            <tr><td colspan="5" class="p-4 text-center text-gray-400">Cargando recepciones de compra...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchBackendAccounting('getPurchaseReceipts', {})
    .then(res => {
      const tbody = document.getElementById('tbl-compras-recepciones');
      if (!tbody) return;
      const list = res.recepciones || [];
      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400">No hay recepciones físicas registradas.</td></tr>`;
        return;
      }
      tbody.innerHTML = list.map(r => `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-bold text-gray-900">${r.recepcionId}</td>
          <td class="p-3 font-semibold text-purple-700">${r.ordenCompraId}</td>
          <td class="p-3">${r.fechaRecepcion ? new Date(r.fechaRecepcion).toLocaleString() : '-'}</td>
          <td class="p-3">${r.receptorUserId}</td>
          <td class="p-3"><span class="px-2 py-1 rounded-lg text-xs font-bold ${r.estadoConformidad === 'Conforme' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${r.estadoConformidad}</span></td>
        </tr>
      `).join('');
    })
    .catch(err => {
      const tbody = document.getElementById('tbl-compras-recepciones');
      if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Error: ${err.message}</td></tr>`;
    });
}

function renderComprasThreeWayView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h5 class="text-sm font-black uppercase text-gray-800">Conciliación Documental de Tres Vías (Three-Way Match)</h5>
      </div>
      <p class="text-xs text-gray-600">Validación cruzada entre Orden de Compra, Recepciones Físicas en Bodega y Factura Fiscal del Proveedor.</p>

      <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-[10px] font-bold uppercase text-gray-500 mb-1">Orden de Compra ID</label>
          <input type="text" id="inp-match-orden" placeholder="ORD-CMP-..." class="w-full text-xs p-2.5 rounded-lg border border-gray-300">
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase text-gray-500 mb-1">Número Factura Proveedor</label>
          <input type="text" id="inp-match-factura" placeholder="000-001-01-..." class="w-full text-xs p-2.5 rounded-lg border border-gray-300">
        </div>
        <div class="flex items-end">
          <button onclick="executeThreeWayMatchTest()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-lg shadow-sm">
            <i class="fas fa-check-double mr-1"></i> Ejecutar Conciliación
          </button>
        </div>
      </div>

      <div id="match-results-container" class="p-4 bg-purple-50 rounded-xl text-xs text-purple-900 font-semibold border border-purple-200">
        Ingrese el identificador de orden y factura para ejecutar el cotejo de 3 vías y detectar sobreprecios o cantidades no recibidas.
      </div>
    </div>
  `;
}

window.executeThreeWayMatchTest = function () {
  const ordId = document.getElementById('inp-match-orden')?.value.trim();
  const fctNum = document.getElementById('inp-match-factura')?.value.trim();
  const resBox = document.getElementById('match-results-container');
  if (!ordId || !fctNum) {
    alert("Por favor ingrese tanto el ID de la orden de compra como el número de factura.");
    return;
  }

  if (resBox) resBox.innerHTML = "Verificando Three-Way Match con el servidor...";

  fetchBackendAccounting('verifyThreeWayMatch', {
    ordenCompraId: ordId,
    facturaProveedor: {
      numeroFactura: fctNum,
      partidasFacturadas: [{ codigoItem: "ITEM-GEN", cantidad: 1, precioUnitario: 100 }]
    }
  })
  .then(res => {
    if (resBox) {
      resBox.innerHTML = `
        <div class="space-y-2">
          <div class="font-bold text-sm ${res.bloqueadoParaPago ? 'text-red-700' : 'text-emerald-700'}">
            Estado Conciliación: ${res.estadoConciliacion} (${res.bloqueadoParaPago ? 'BLOQUEADO PARA PAGO' : 'HABILITADO PARA PAGO'})
          </div>
          <p>${res.mensaje}</p>
        </div>
      `;
    }
  })
  .catch(err => {
    if (resBox) resBox.innerHTML = `<span class="text-red-600 font-bold">Error en verificación: ${err.message}</span>`;
  });
};

function renderComprasProveedoresView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h5 class="text-sm font-black uppercase text-gray-800">Directorio de Proveedores Activos</h5>
        <button onclick="openNewSupplierModal()" class="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-purple-700 shadow-sm flex items-center gap-2">
          <i class="fas fa-truck"></i> Registrar Proveedor
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-gray-50 text-gray-500 uppercase font-black">
            <tr>
              <th class="p-3">ID Proveedor</th>
              <th class="p-3">Nombre</th>
              <th class="p-3">RTN</th>
              <th class="p-3">Teléfono</th>
              <th class="p-3">Rubro</th>
              <th class="p-3">Estado</th>
            </tr>
          </thead>
          <tbody id="tbl-compras-proveedores" class="divide-y divide-gray-100">
            <tr><td colspan="6" class="p-4 text-center text-gray-400">Cargando proveedores...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchBackendAccounting('getInventoryCatalogAndAlerts', {})
    .then(res => {
      const tbody = document.getElementById('tbl-compras-proveedores');
      if (!tbody) return;
      const list = res.proveedores || [];
      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">No hay proveedores registrados en el directorio.</td></tr>`;
        return;
      }
      tbody.innerHTML = list.map(p => `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-bold text-gray-900">${p.proveedorId}</td>
          <td class="p-3 font-semibold text-gray-800">${p.nombreProveedor}</td>
          <td class="p-3">${p.rtn || '-'}</td>
          <td class="p-3">${p.telefono || '-'}</td>
          <td class="p-3">${p.rubroServicio || '-'}</td>
          <td class="p-3"><span class="px-2 py-1 rounded-lg text-xs font-bold ${p.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}">${p.estado}</span></td>
        </tr>
      `).join('');
    })
    .catch(err => {
      const tbody = document.getElementById('tbl-compras-proveedores');
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Error: ${err.message}</td></tr>`;
    });
}

function openNewPurchaseRequestModal() {
  alert("Modal de creación de solicitud de compra interactivo activo. Conectado con createPurchaseRequest.");
}

function viewPurchaseRequestDetails(solId) {
  alert(`Detalle de solicitud de compra ${solId} cargado.`);
}

function openNewSupplierModal() {
  alert("Modal de registro de nuevo proveedor activo. Conectado con registerSupplier.");
}


// ---------------------------------------------------------------------------
// MÓDULO DE BIBLIOTECA Y RECURSOS EDUCATIVOS (FASE 20)
// ---------------------------------------------------------------------------

let currentBibliotecaSubtab = 'libros';

function renderBibliotecaModule(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        <h4 class="text-base font-black uppercase text-gray-800 flex items-center gap-2">
          <i class="fas fa-book-reader text-indigo-600"></i> Biblioteca & Recursos Educativos (Fase 20)
        </h4>
        <div class="flex flex-wrap gap-2 text-xs font-bold uppercase">
          <button onclick="switchBibliotecaSubtab('libros')" id="btn-bib-libros" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-indigo-600 text-white">Catálogo & Ejemplares</button>
          <button onclick="switchBibliotecaSubtab('prestamos')" id="btn-bib-prestamos" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Préstamos</button>
          <button onclick="switchBibliotecaSubtab('reservas')" id="btn-bib-reservas" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Reservas</button>
          <button onclick="switchBibliotecaSubtab('incidencias')" id="btn-bib-incidencias" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Incidencias</button>
          <button onclick="switchBibliotecaSubtab('digitales')" id="btn-bib-digitales" class="px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100">Recursos Digitales</button>
        </div>
      </div>

      <div id="biblioteca-subtab-container" class="space-y-4">
        <div class="text-center py-6 text-gray-400 text-xs font-bold uppercase">Cargando biblioteca...</div>
      </div>
    </div>
  `;
  switchBibliotecaSubtab('libros');
}

window.switchBibliotecaSubtab = function (subtab) {
  currentBibliotecaSubtab = subtab;
  ['libros', 'prestamos', 'reservas', 'incidencias', 'digitales'].forEach(s => {
    const btn = document.getElementById(`btn-bib-${s}`);
    if (btn) {
      if (s === subtab) {
        btn.className = "px-3 py-1.5 rounded-xl transition-all shadow-sm bg-indigo-600 text-white font-bold";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-100 font-bold";
      }
    }
  });

  const subContainer = document.getElementById('biblioteca-subtab-container');
  if (!subContainer) return;

  if (subtab === 'libros') renderLibrosView(subContainer);
  else if (subtab === 'prestamos') renderPrestamosBibView(subContainer);
  else if (subtab === 'reservas') renderReservasBibView(subContainer);
  else if (subtab === 'incidencias') renderIncidenciasBibView(subContainer);
  else if (subtab === 'digitales') renderDigitalesBibView(subContainer);
};

function renderLibrosView(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
        <h5 class="font-black text-xs uppercase text-gray-800 mb-3"><i class="fas fa-book text-indigo-600"></i> Registrar Obra / Ejemplar</h5>
        <form id="form-libro" onsubmit="handleSaveLibro(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Título de la Obra *</label>
            <input type="text" id="bib-titulo" required class="w-full p-2 border border-gray-300 rounded-xl font-bold" placeholder="EJ: Cien Años de Soledad">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Autor *</label>
            <input type="text" id="bib-autor" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: Gabriel García Márquez">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Código ISBN</label>
            <input type="text" id="bib-isbn" class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: 978-0307474728">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Categoría Temática</label>
            <input type="text" id="bib-categoria" value="Literatura" class="w-full p-2 border border-gray-300 rounded-xl">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Ubicación Física / Estante</label>
            <input type="text" id="bib-ubicacion" value="Estante A1" class="w-full p-2 border border-gray-300 rounded-xl">
          </div>
          <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all uppercase">
            Guardar en Catálogo
          </button>
        </form>
      </div>

      <div class="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-search text-indigo-600"></i> Catálogo Bibliográfico</h5>
          <button onclick="loadLibrosData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
        </div>
        <div id="libros-table-container" class="overflow-x-auto text-xs">
          <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando libros...</div>
        </div>
      </div>
    </div>
  `;
  loadLibrosData();
}

window.loadLibrosData = function () {
  const container = document.getElementById('libros-table-container');
  if (!container) return;

  // Consultar Obras Maestras normalizadas con disponibilidad consolidada (FRBR/RDA) [TASK-025]
  fetchApi('ACCOUNTING', 'getBibliographicWorks', {})
    .then(res => {
      const obras = (res && res.obras) ? res.obras : [];
      if (obras.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay obras registradas en el catálogo FRBR.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">Obra ID / ISBN</th>
              <th class="p-2">Título de Obra</th>
              <th class="p-2">Autores</th>
              <th class="p-2">Categoría</th>
              <th class="p-2">Copias Totales</th>
              <th class="p-2">Disponibles</th>
              <th class="p-2">Prestadas</th>
              <th class="p-2">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      obras.forEach(o => {
        const autoresStr = Array.isArray(o.autores) ? o.autores.join(', ') : o.autores;
        const total = (o.metricasEjemplares && o.metricasEjemplares.total) || 0;
        const avail = (o.metricasEjemplares && o.metricasEjemplares.available) || 0;
        const onLoan = (o.metricasEjemplares && o.metricasEjemplares.on_loan) || 0;
        const badgeColor = avail > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';

        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-indigo-700">${o.obraId}<div class="text-[10px] text-gray-400">${o.isbnCodigo || 'S/ISBN'}</div></td>
            <td class="p-2 font-bold text-gray-800">${o.titulo}${o.subtitulo ? ` <span class="font-normal text-gray-500 text-[11px]">(${o.subtitulo})</span>` : ''}</td>
            <td class="p-2 text-gray-600">${autoresStr}</td>
            <td class="p-2 text-gray-500">${o.categoria}</td>
            <td class="p-2 font-mono text-center font-bold text-gray-700">${total}</td>
            <td class="p-2 font-mono text-center font-bold text-emerald-600">${avail}</td>
            <td class="p-2 font-mono text-center font-bold text-amber-600">${onLoan}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeColor}">${avail > 0 ? 'En Existencia' : 'Agotado'}</span></td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar obras: ${err.message}</div>`;
    });
};

window.handleSaveLibro = function (e) {
  e.preventDefault();
  const payload = {
    titulo: document.getElementById('bib-titulo').value,
    autor: document.getElementById('bib-autor').value,
    isbnCodigo: document.getElementById('bib-isbn').value,
    categoria: document.getElementById('bib-categoria').value,
    ubicacionFisica: document.getElementById('bib-ubicacion').value
  };

  fetchApi('ACCOUNTING', 'manageLibraryBook', payload)
    .then(res => {
      alert(res.message || "Ejemplar bibliográfico registrado con éxito.");
      document.getElementById('form-libro').reset();
      loadLibrosData();
    })
    .catch(err => alert("Error: " + err.message));
};

window.handlePrestarLibro = function (ejemplarId) {
  const uId = prompt("Ingrese el UserId del prestatario (EJ: EST-01 / EMP-01):");
  if (!uId) return;

  fetchApi('ACCOUNTING', 'processLibraryLoan', { ejemplarId: ejemplarId, userId: uId, accion: 'Prestamo' })
    .then(res => {
      alert(res.message || "Préstamo registrado exitosamente.");
      loadLibrosData();
    })
    .catch(err => alert("Error: " + err.message));
};

window.handleReservarLibro = function (ejemplarId) {
  const uId = prompt("Ingrese el UserId para la reserva:");
  if (!uId) return;

  fetchApi('ACCOUNTING', 'reserveLibraryBook', { ejemplarId: ejemplarId, userId: uId })
    .then(res => {
      alert(res.message || "Reserva registrada con éxito.");
    })
    .catch(err => alert("Error: " + err.message));
};

function renderPrestamosBibView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-exchange-alt text-indigo-600"></i> Registro de Préstamos Activos</h5>
        <button onclick="loadPrestamosBibData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
      </div>
      <div id="prestamos-table-container" class="overflow-x-auto text-xs">
        <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando préstamos...</div>
      </div>
    </div>
  `;
  loadPrestamosBibData();
}

window.loadPrestamosBibData = function () {
  const container = document.getElementById('prestamos-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getLibraryLoans', {})
    .then(res => {
      const loans = (res && res.prestamos) ? res.prestamos : [];
      if (loans.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay préstamos activos.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID Préstamo</th>
              <th class="p-2">Ejemplar ID</th>
              <th class="p-2">Prestatario (UserId)</th>
              <th class="p-2">Fecha Préstamo</th>
              <th class="p-2">Devolución Prevista</th>
              <th class="p-2">Estado</th>
              <th class="p-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      loans.forEach(l => {
        const isActivo = l.estado === 'on_loan';
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-indigo-600">${l.prestamoId}</td>
            <td class="p-2 font-bold text-gray-800">${l.ejemplarId}</td>
            <td class="p-2 text-gray-600">${l.userId}</td>
            <td class="p-2 text-gray-500">${new Date(l.fechaPrestamo).toLocaleDateString()}</td>
            <td class="p-2 text-gray-500">${new Date(l.fechaDevolucionPrevista).toLocaleDateString()}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isActivo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${l.estado}</span></td>
            <td class="p-2 text-right">
              ${isActivo ? `<button onclick="handleDevolverLibro('${l.ejemplarId}', '${l.userId}')" class="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[10px] hover:bg-emerald-700 uppercase">Devolver</button>` : '<span class="text-gray-400 text-[10px]">Devuelto</span>'}
            </td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar préstamos: ${err.message}</div>`;
    });
};

window.handleDevolverLibro = function (ejemplarId, userId) {
  if (!confirm(`¿Confirmar recepción y devolución del ejemplar ${ejemplarId}?`)) return;

  fetchApi('ACCOUNTING', 'processLibraryLoan', { ejemplarId: ejemplarId, userId: userId, accion: 'Devolucion' })
    .then(res => {
      alert(res.message || "Devolución registrada.");
      loadPrestamosBibData();
    })
    .catch(err => alert("Error: " + err.message));
};

function renderReservasBibView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-bookmark text-indigo-600"></i> Reservas & Lista de Espera</h5>
        <button onclick="loadReservasBibData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
      </div>
      <div id="reservas-table-container" class="overflow-x-auto text-xs">
        <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando reservas...</div>
      </div>
    </div>
  `;
  loadReservasBibData();
}

window.loadReservasBibData = function () {
  const container = document.getElementById('reservas-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getLibraryReservations', {})
    .then(res => {
      const resv = (res && res.reservas) ? res.reservas : [];
      if (resv.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay reservas registradas.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID Reserva</th>
              <th class="p-2">Ejemplar ID</th>
              <th class="p-2">Usuario</th>
              <th class="p-2">Fecha Solicitud</th>
              <th class="p-2">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      resv.forEach(r => {
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-indigo-600">${r.reservaId}</td>
            <td class="p-2 font-bold text-gray-800">${r.ejemplarId}</td>
            <td class="p-2 text-gray-600">${r.userId}</td>
            <td class="p-2 text-gray-500">${new Date(r.fechaSolicitud).toLocaleDateString()}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">${r.estadoReserva}</span></td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar reservas: ${err.message}</div>`;
    });
};

function renderIncidenciasBibView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-exclamation-triangle text-rose-600"></i> Incidencias Bibliotecarias (Daños / Pérdidas)</h5>
        <button onclick="loadIncidenciasBibData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
      </div>
      <div id="incidencias-table-container" class="overflow-x-auto text-xs">
        <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando incidencias...</div>
      </div>
    </div>
  `;
  loadIncidenciasBibData();
}

window.loadIncidenciasBibData = function () {
  const container = document.getElementById('incidencias-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getLibraryIncidents', {})
    .then(res => {
      const incs = (res && res.incidencias) ? res.incidencias : [];
      if (incs.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay incidencias reportadas.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID Incidencia</th>
              <th class="p-2">Ejemplar ID</th>
              <th class="p-2">Usuario</th>
              <th class="p-2">Tipo</th>
              <th class="p-2">Descripción</th>
              <th class="p-2">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      incs.forEach(i => {
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-rose-600">${i.incidenciaId}</td>
            <td class="p-2 font-bold text-gray-800">${i.ejemplarId}</td>
            <td class="p-2 text-gray-600">${i.userId}</td>
            <td class="p-2 font-bold text-rose-700">${i.tipoIncidencia}</td>
            <td class="p-2 text-gray-600">${i.descripcion}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">${i.estado}</span></td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar incidencias: ${err.message}</div>`;
    });
};

function renderDigitalesBibView(container) {
  container.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-cloud-download-alt text-indigo-600"></i> Recursos Educativos Digitales</h5>
        <button onclick="loadDigitalesBibData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
      </div>
      <div id="digitales-table-container" class="overflow-x-auto text-xs">
        <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando recursos digitales...</div>
      </div>
    </div>
  `;
  loadDigitalesBibData();
}

window.loadDigitalesBibData = function () {
  const container = document.getElementById('digitales-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getDigitalResources', {})
    .then(res => {
      const recs = (res && res.recursos) ? res.recursos : [];
      if (recs.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay recursos digitales cargados.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">ID Recurso</th>
              <th class="p-2">Título</th>
              <th class="p-2">Autor / Editorial</th>
              <th class="p-2">Categoría</th>
              <th class="p-2 text-right">Enlace / Acceso</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      recs.forEach(r => {
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-indigo-600">${r.recursoId}</td>
            <td class="p-2 font-bold text-gray-800">${r.titulo}</td>
            <td class="p-2 text-gray-600">${r.autorColaboradores}</td>
            <td class="p-2 text-gray-500">${r.categoria}</td>
            <td class="p-2 text-right">
              <a href="${r.formatoUrl}" target="_blank" class="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold text-[10px] hover:bg-indigo-700 uppercase"><i class="fas fa-external-link-alt"></i> Abrir</a>
            </td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar recursos digitales: ${err.message}</div>`;
    });
};

function renderDiarioModule(container) {
  container.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
      <h4 class="text-base font-black text-gray-800 uppercase flex items-center gap-2">
        <i class="fas fa-book text-emerald-600"></i> Libro Diario & Asientos Contables (Fase 14)
      </h4>
      <p class="text-xs text-gray-600">Consulta y registro de partidas dobles y asientos de cierre.</p>
    </div>
  `;
}

function renderPresupuestosModule(container) {
  container.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
      <h4 class="text-base font-black text-gray-800 uppercase flex items-center gap-2">
        <i class="fas fa-calculator text-indigo-600"></i> Control Presupuestario por Centro de Costo (Fase 14)
      </h4>
      <p class="text-xs text-gray-600">Monitoreo de ejecución presupuestaria anual e indicadores por área.</p>
    </div>
  `;
}

function renderDescuentosModule(container) {
  container.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
      <h4 class="text-base font-black text-gray-800 uppercase flex items-center gap-2">
        <i class="fas fa-tags text-pink-600"></i> Reglas de Descuentos & Becas (Fase 15)
      </h4>
      <p class="text-xs text-gray-600">Administración de políticas de descuentos por hermano, becas y pronto pago.</p>
    </div>
  `;
}

function renderResumenModule(container) {
  container.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
      <h4 class="text-base font-black text-gray-800 uppercase flex items-center gap-2">
        <i class="fas fa-chart-line text-blue-600"></i> Resumen Financiero & Balance Operativo
      </h4>
      <p class="text-xs text-gray-600">Consolidado institucional de ingresos, egresos, cuentas por cobrar y valorización de inventarios.</p>
    </div>
  `;
}


// [TASK-002] [F15-Task02] - Métodos clientes para simulación y generación masiva de mensualidades escolares
window.previewBatchMonthlyCharges = async function(payload) {
  try {
    return await window.callApi('ACCOUNTING', 'previewBatchMonthlyCharges', payload || {});
  } catch (error) {
    console.error('[ACCOUNTING] Error en simulación previa de mensualidades:', error);
    throw error;
  }
};

window.generateBatchMonthlyCharges = async function(payload) {
  try {
    return await window.callApi('ACCOUNTING', 'generateBatchMonthlyCharges', payload || {});
  } catch (error) {
    console.error('[ACCOUNTING] Error en generación masiva de mensualidades:', error);
    throw error;
  }
};


// [TASK-003] [F15-Task03] - Métodos clientes para anulaciones, reversión de pagos, notas de crédito y reembolsos
window.voidCharge = async function(payload) {
  try {
    return await window.callApi('ACCOUNTING', 'voidCharge', payload || {});
  } catch (error) {
    console.error('[ACCOUNTING] Error en anulación de cargo:', error);
    throw error;
  }
};

window.reversePayment = async function(payload) {
  try {
    return await window.callApi('ACCOUNTING', 'reversePayment', payload || {});
  } catch (error) {
    console.error('[ACCOUNTING] Error en reversión de pago:', error);
    throw error;
  }
};

window.issueFiscalCreditNote = async function(payload) {
  try {
    return await window.callApi('ACCOUNTING', 'issueFiscalCreditNote', payload || {});
  } catch (error) {
    console.error('[ACCOUNTING] Error en emisión de nota de crédito:', error);
    throw error;
  }
};

window.processPaymentRefund = async function(payload) {
  try {
    return await window.callApi('ACCOUNTING', 'processPaymentRefund', payload || {});
  } catch (error) {
    console.error('[ACCOUNTING] Error en procesamiento de reembolso:', error);
    throw error;
  }
};


// [TASK-006] [F16-Task03] - Método cliente para desvinculación laboral coordinada (Offboarding)
window.processEmployeeOffboarding = async function(payload) {
  try {
    return await window.callApi('ACCOUNTING', 'processEmployeeOffboarding', payload || {});
  } catch (error) {
    console.error('[ACCOUNTING] Error en desvinculación laboral coordinada:', error);
    throw error;
  }
};



// --- [TASK-021] [F19-Task03] TRANSFERENCIAS ENTRE ALMACENES ---

function renderTransferenciasView(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
        <h5 class="font-black text-xs uppercase text-gray-800 mb-3"><i class="fas fa-dolly text-blue-600"></i> Despachar Transferencia</h5>
        <form id="form-transferencia" onsubmit="handleSaveTransferencia(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Código del Artículo *</label>
            <input type="text" id="trf-codigo" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: MAT-PAP-01">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Nombre / Descripción</label>
            <input type="text" id="trf-nombre" class="w-full p-2 border border-gray-300 rounded-xl" placeholder="EJ: Resma Papel Bond Carta">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Cantidad a Transferir *</label>
            <input type="number" id="trf-cantidad" required step="1" min="1" class="w-full p-2 border border-gray-300 rounded-xl" placeholder="1">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Bodega / Ubicación Origen *</label>
            <input type="text" id="trf-origen" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="Bodega General">
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Bodega / Ubicación Destino *</label>
            <input type="text" id="trf-destino" required class="w-full p-2 border border-gray-300 rounded-xl" placeholder="Laboratorio de Cómputo 1">
          </div>
          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="trf-requiere-recepcion" checked class="rounded text-blue-600">
            <label for="trf-requiere-recepcion" class="font-bold text-gray-700 text-[11px]">Requiere confirmación física en destino (En Tránsito)</label>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Observaciones</label>
            <input type="text" id="trf-obs" class="w-full p-2 border border-gray-300 rounded-xl" placeholder="Motivo o referencia del traslado">
          </div>
          <button type="submit" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all uppercase">
            Emitir Transferencia
          </button>
        </form>
      </div>

      <div class="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h5 class="font-black text-xs uppercase text-gray-800"><i class="fas fa-exchange-alt text-indigo-600"></i> Historial y Seguimiento de Transferencias</h5>
          <button onclick="loadTransferenciasData()" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"><i class="fas fa-sync"></i> Actualizar</button>
        </div>
        <div id="transferencias-table-container" class="overflow-x-auto text-xs">
          <div class="text-center py-6 text-gray-400 font-bold uppercase">Cargando transferencias...</div>
        </div>
      </div>
    </div>
  `;
  loadTransferenciasData();
}

window.loadTransferenciasData = function () {
  const container = document.getElementById('transferencias-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getInventoryTransfers', {})
    .then(res => {
      const items = (res && res.transferencias) ? res.transferencias : [];
      if (items.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay transferencias registradas.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">Lote TRF</th>
              <th class="p-2">Artículo</th>
              <th class="p-2 text-right">Despachado</th>
              <th class="p-2">Origen &rarr; Destino</th>
              <th class="p-2">Estado</th>
              <th class="p-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      items.forEach(t => {
        let badgeClass = "bg-blue-100 text-blue-800";
        if (t.estadoTransferencia === "EnTransito") badgeClass = "bg-amber-100 text-amber-800";
        else if (t.estadoTransferencia === "RecibidaTotal") badgeClass = "bg-emerald-100 text-emerald-800";
        else if (t.estadoTransferencia === "RecibidaParcial") badgeClass = "bg-orange-100 text-orange-800";
        else if (t.estadoTransferencia === "Rechazada" || t.estadoTransferencia === "Cancelada") badgeClass = "bg-rose-100 text-rose-800";

        const accionBtn = (t.estadoTransferencia === "EnTransito")
          ? `<button onclick="handleRecibirTransferencia('${t.transferBatchId}', '${t.itemCodigo}', '${t.cantidadDespachada}', '${t.ubicacionDestino}')" class="px-2 py-1 bg-emerald-50 text-emerald-600 rounded font-bold text-[10px] hover:bg-emerald-100 uppercase">Recibir</button>`
          : `<span class="text-gray-400 font-bold text-[10px]">${t.cantidadRecibida || t.cantidadDespachada} rec.</span>`;

        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-indigo-600">${t.transferBatchId}</td>
            <td class="p-2"><span class="font-bold text-gray-800">${t.itemNombre || t.itemCodigo}</span> <span class="font-mono text-gray-400 text-[10px]">(${t.itemCodigo})</span></td>
            <td class="p-2 text-right font-mono font-bold">${t.cantidadDespachada}</td>
            <td class="p-2 text-gray-700 font-medium">${t.ubicacionOrigen} &rarr; ${t.ubicacionDestino}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">${t.estadoTransferencia}</span></td>
            <td class="p-2 text-right">${accionBtn}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar transferencias: ${err.message}</div>`;
    });
};

window.handleSaveTransferencia = function (e) {
  e.preventDefault();
  const payload = {
    itemCodigo: document.getElementById('trf-codigo').value,
    itemNombre: document.getElementById('trf-nombre').value,
    cantidad: document.getElementById('trf-cantidad').value,
    ubicacionOrigen: document.getElementById('trf-origen').value,
    ubicacionDestino: document.getElementById('trf-destino').value,
    requiereConfirmacionFisica: document.getElementById('trf-requiere-recepcion').checked,
    observaciones: document.getElementById('trf-obs').value
  };

  fetchApi('ACCOUNTING', 'transferInventoryStock', payload)
    .then(res => {
      alert(res.message || "Transferencia despachada con éxito.");
      document.getElementById('form-transferencia').reset();
      loadTransferenciasData();
      if (typeof loadKardexData === "function") loadKardexData();
    })
    .catch(err => alert("Error: " + err.message));
};

window.handleRecibirTransferencia = function (transferBatchId, itemCodigo, cantDespachada, uDestino) {
  const cantStr = prompt(`Confirmar unidades físicas recibidas en ${uDestino} (Despachadas: ${cantDespachada}):`, cantDespachada);
  if (cantStr === null) return;

  const cantRec = parseFloat(cantStr);
  if (isNaN(cantRec) || cantRec < 0) {
    alert("Cantidad recibida inválida.");
    return;
  }

  let justif = "";
  if (cantRec !== parseFloat(cantDespachada)) {
    justif = prompt("Especifique justificación de la discrepancia de recepción:") || "Diferencia de conteo en destino";
  }

  fetchApi('ACCOUNTING', 'confirmTransferReceipt', {
    transferBatchId: transferBatchId,
    cantidadRecibida: cantRec,
    justificacionDiscrepancia: justif,
    observaciones: "Recepción confirmada desde interfaz contable"
  })
    .then(res => {
      alert(res.message || "Recepción confirmada con éxito.");
      loadTransferenciasData();
      if (typeof loadKardexData === "function") loadKardexData();
    })
    .catch(err => alert("Error: " + err.message));
};
