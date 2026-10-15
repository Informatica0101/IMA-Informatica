/**
 * Controller for Accounting, Inventory, Assets & Maintenance Dashboard
 * New Generation Christian Academy / Bilingual School and Institute
 */

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
  ['kardex', 'almacenes', 'solicitudes', 'activos', 'mantenimiento', 'bajas'].forEach(s => {
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

window.loadKardexData = function () {
  const container = document.getElementById('kardex-table-container');
  if (!container) return;

  fetchApi('ACCOUNTING', 'getInventoryKardex', {})
    .then(res => {
      const items = (res && res.kardex) ? res.kardex : [];
      if (items.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay registros en el Kardex de inventario.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">Código</th>
              <th class="p-2">Ítem</th>
              <th class="p-2">Categoría</th>
              <th class="p-2">Movimiento</th>
              <th class="p-2 text-right">Cant.</th>
              <th class="p-2 text-right">Stock Nuevo</th>
              <th class="p-2">Ubicación</th>
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
            <td class="p-2 text-gray-500">${k.categoriaTipo || 'Consumible'}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${k.tipoMovimiento === 'Entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${k.tipoMovimiento}</span></td>
            <td class="p-2 text-right font-bold">${k.cantidad}</td>
            <td class="p-2 text-right font-black ${isBajo ? 'text-rose-600' : 'text-emerald-600'}">${k.stockNuevo} ${isBajo ? '⚠️' : ''}</td>
            <td class="p-2 text-gray-600">${k.ubicacionResponsable || 'Bodega'}</td>
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
            <td class="p-2 text-right">
              <button onclick="handleAsignarCustodia('${a.activoId}')" class="px-2 py-1 bg-blue-50 text-blue-600 rounded font-bold text-[10px] hover:bg-blue-100 uppercase">Custodia</button>
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

function renderComprasModule(container) {
  container.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
      <h4 class="text-base font-black text-gray-800 uppercase flex items-center gap-2">
        <i class="fas fa-shopping-cart text-purple-600"></i> Gestión de Compras & Proveedores (Fase 18)
      </h4>
      <p class="text-xs text-gray-600">Gestión de Solicitudes de Compra, Cotizaciones Comparativas y Recepción de Bienes.</p>
      <div class="p-4 bg-purple-50 rounded-xl text-xs text-purple-800 font-bold">
        Módulo de Compras Activo e Integrado con Inventario y Cuentas por Pagar.
      </div>
    </div>
  `;
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

  fetchApi('ACCOUNTING', 'getLibraryBooks', {})
    .then(res => {
      const books = (res && res.libros) ? res.libros : [];
      if (books.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-400 font-bold uppercase">No hay libros registrados en catálogo.</div>`;
        return;
      }
      let html = `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
              <th class="p-2">Ejemplar ID</th>
              <th class="p-2">Título</th>
              <th class="p-2">Autor</th>
              <th class="p-2">Ubicación</th>
              <th class="p-2">Estado</th>
              <th class="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
      `;
      books.forEach(b => {
        const isDisp = b.estado === 'available';
        html += `
          <tr class="hover:bg-gray-50">
            <td class="p-2 font-mono font-bold text-indigo-600">${b.ejemplarId}</td>
            <td class="p-2 font-bold text-gray-800">${b.titulo}</td>
            <td class="p-2 text-gray-600">${b.autor}</td>
            <td class="p-2 text-gray-500">${b.ubicacionFisica}</td>
            <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isDisp ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${b.estado}</span></td>
            <td class="p-2 text-right flex justify-end gap-1">
              ${isDisp ? `<button onclick="handlePrestarLibro('${b.ejemplarId}')" class="px-2 py-1 bg-indigo-600 text-white rounded font-bold text-[10px] hover:bg-indigo-700 uppercase">Prestar</button>` : ''}
              <button onclick="handleReservarLibro('${b.ejemplarId}')" class="px-2 py-1 bg-gray-100 text-gray-700 rounded font-bold text-[10px] hover:bg-gray-200 uppercase">Reservar</button>
            </td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      container.innerHTML = html;
    })
    .catch(err => {
      container.innerHTML = `<div class="p-4 text-rose-600 font-bold text-center">Error al cargar libros: ${err.message}</div>`;
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
