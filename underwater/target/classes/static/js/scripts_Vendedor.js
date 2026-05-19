// ── GUARD: Solo VENDEDOR ────────────────────────────────────────
(function() {
  var rol = localStorage.getItem('uw-rol');
  var id  = localStorage.getItem('uw-id');
  if (!id || rol !== 'VENDEDOR') {
    window.location.replace('/login');
    throw new Error('Acceso no autorizado');
  }
})();

// Modal confirmación — reemplaza confirm() nativo
function confirmarAccion(mensaje, callbackSi) {
  var modal = document.getElementById('modal-confirm-vendedor');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-confirm-vendedor';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px';
    document.body.appendChild(modal);
  }
  modal.innerHTML = '<div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:15px;padding:32px;max-width:380px;width:100%;text-align:center">'
    + '<p style="font-family:var(--fuente-titulos);font-size:1.3rem;letter-spacing:0.04em;color:#0F172A;margin-bottom:24px">' + mensaje + '</p>'
    + '<div style="display:flex;gap:12px;justify-content:center">'
      + '<button id="btn-cv-si" style="padding:11px 28px;background:#19876E;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Confirmar</button>'
      + '<button id="btn-cv-no" style="padding:11px 28px;background:none;border:1px solid #CBD5E1;color:#0F172A;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Cancelar</button>'
    + '</div>'
  + '</div>';
  modal.style.display = 'flex';
  document.getElementById('btn-cv-si').onclick = function() { modal.style.display='none'; callbackSi(); };
  document.getElementById('btn-cv-no').onclick = function() { modal.style.display='none'; };
}

// ================================================================
// scripts_Vendedor.js — Underwater Marketplace
// Panel vendedor completamente dinámico
// ================================================================

const UW_V = () => ({
  id:        localStorage.getItem('uw-id'),
  nombre:    localStorage.getItem('uw-nombre'),
  email:     localStorage.getItem('uw-email'),
  empresaId: localStorage.getItem('uw-empresaId')
});

// ── Verificar que es vendedor ────────────────────────────────────
(function() {
  const rol = localStorage.getItem('uw-rol');
  if (!rol || rol !== 'VENDEDOR') window.location.href = '/login';
})();

// ── Toast ────────────────────────────────────────────────────────
function mostrarToastV(msg) {
  let t = document.getElementById('toast-vendedor');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast-vendedor';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#FFFFFF;border:1px solid rgba(45,110,45,.4);color:#4caf50;padding:14px 20px;font-size:.82rem;font-weight:700;z-index:9999;transition:opacity .3s;max-width:320px;border-radius:4px;';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._t); t._t = setTimeout(() => t.style.opacity = '0', 3000);
}

// ── Cargar info sidebar ──────────────────────────────────────────
function cargarInfoSidebar() {
  const { nombre, email } = UW_V();
  const el  = document.getElementById('sidebar-nombre-admin');
  const el2 = document.getElementById('sidebar-email-admin');
  const av  = document.getElementById('sidebar-avatar-admin');
  if (el)  el.textContent  = nombre || 'Vendedor';
  if (el2) el2.textContent = email  || '';
  if (av)  av.textContent  = (nombre || 'V').substring(0, 2).toUpperCase();
}

// ================================================================
// NAVEGACIÓN
// ================================================================
const infoSeccionesV = {
  'dashboard-vendedor': { titulo:'Dashboard',           subtitulo:'Resumen de tu tienda' },
  'mis-productos':      { titulo:'Mis Productos',       subtitulo:'Productos publicados en el marketplace' },
  'nuevo-producto':     { titulo:'Agregar Producto',    subtitulo:'Completa los campos y publica tu producto' },
  'mis-pedidos':        { titulo:'Mis Pedidos',         subtitulo:'Pedidos recibidos en tu tienda' },
  'mi-empresa':         { titulo:'Datos de Mi Empresa', subtitulo:'Información pública de tu tienda' },
  'mis-cupones':        { titulo:'Mis Cupones',          subtitulo:'Crea y gestiona tus cupones de descuento' }
};

function cambiarSeccion(id) {
  document.querySelectorAll('.sidebar-enlace').forEach(e => e.classList.remove('activo'));
  const enlace = document.querySelector(`.sidebar-enlace[data-seccion="${id}"]`);
  if (enlace) enlace.classList.add('activo');
  document.querySelectorAll('.seccion-panel').forEach(s => s.classList.remove('activa'));
  const sec = document.getElementById('seccion-' + id);
  if (sec) sec.classList.add('activa');
  const info = infoSeccionesV[id];
  if (info) {
    const t = document.getElementById('titulo-seccion-actual');
    const s = document.getElementById('subtitulo-seccion-actual');
    if (t) t.textContent = info.titulo;
    if (s) s.textContent = info.subtitulo;
  }
  if (id === 'mis-productos')      cargarMisProductos();
  if (id === 'mis-pedidos')        cargarMisPedidosVendedor();
  if (id === 'mi-empresa')         cargarMiEmpresa();
  if (id === 'dashboard-vendedor') cargarDashboard();
  if (id === 'mis-cupones')        cargarMisCupones();
}

document.querySelectorAll('.sidebar-enlace').forEach(function(enlace) {
  enlace.addEventListener('click', function(e) { e.preventDefault(); cambiarSeccion(this.dataset.seccion); });
});

const botonIrNuevo = document.getElementById('boton-ir-nuevo-producto');
if (botonIrNuevo) botonIrNuevo.addEventListener('click', () => cambiarSeccion('nuevo-producto'));
const botonVolver = document.getElementById('boton-volver-productos');
if (botonVolver) botonVolver.addEventListener('click', () => cambiarSeccion('mis-productos'));

// ================================================================
// DASHBOARD
// ================================================================
async function cargarDashboard() {
  const { id, empresaId } = UW_V();
  if (!id) return;
  try {
    const [productos, pedidos] = await Promise.all([
      fetch(`/api/vendedor/productos?vendedorId=${id}`).then(r => r.json()),
      empresaId ? fetch(`/api/vendedor/pedidos?empresaId=${empresaId}&vendedorId=${id}`).then(r => r.json()) : Promise.resolve([])
    ]);
    const activos    = productos.filter(p => p.estado === 'ACTIVO').length;
    const pendientes = pedidos.filter(p => p.estado === 'PROCESANDO').length;
    const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;
    const totalVentas = pedidos.filter(p => p.estado !== 'CANCELADO')
      .reduce((s, p) => s + (p.total || 0), 0);

    const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    set('[data-metric="mis-productos"]',   activos);
    set('[data-metric="mis-pedidos"]',     pendientes);
    set('[data-metric="mis-ventas"]',      `$${Number(totalVentas).toLocaleString('es-CO')}`);
    set('[data-metric="total-productos"]', productos.length);

    // Pedidos pendientes en el dashboard
    const listaMasVendidos = document.getElementById('lista-mas-vendidos');
    if (listaMasVendidos) {
      const pending = pedidos.filter(p => p.estado === 'PROCESANDO').slice(0, 5);
      if (pending.length === 0) {
        listaMasVendidos.innerHTML = '<p style="text-align:center;padding:20px;color:#64748B;font-size:0.85rem">No hay pedidos pendientes</p>';
      } else {
        listaMasVendidos.innerHTML = pending.map(p => {
          const dir = p.direccionEntrega || {};
          return `<div style="padding:12px 0;border-bottom:1px solid #E2E8F0">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <p style="font-size:0.85rem;font-weight:700;color:#0F172A">${p.nombreUsuario || '—'}</p>
                <p style="font-size:0.72rem;color:#64748B">📍 ${dir.ciudad || '—'} · ${dir.linea || '—'}</p>
                <p style="font-size:0.72rem;color:#64748B">📞 ${dir.telefono || p.correoUsuario || '—'}</p>
              </div>
              <div style="text-align:right">
                <p style="font-family:var(--fuente-titulos);font-size:1.1rem;color:#0F172A">$${Number(p.total||0).toLocaleString('es-CO')}</p>
                <button onclick="cambiarSeccion('mis-pedidos')" style="font-size:0.7rem;background:none;border:none;color:#F97316;cursor:pointer;font-weight:700">Ver →</button>
              </div>
            </div>
          </div>`;
        }).join('');
      }
    }

    const badgePedidos = document.querySelector('.sidebar-enlace[data-seccion="mis-pedidos"] .sidebar-badge');
    if (badgePedidos) badgePedidos.textContent = pendientes || '';
  } catch (err) { console.error('Error dashboard:', err); }
}

// ================================================================
// MIS PRODUCTOS
// ================================================================
async function cargarMisProductos() {
  const { id } = UW_V();
  const tbody   = document.getElementById('tabla-mis-productos');
  if (!tbody || !id) return;
  try {
    const productos = await fetch(`/api/vendedor/productos?vendedorId=${id}`).then(r => r.json());
    const sub = document.querySelector('#seccion-mis-productos .seccion-panel-subtitulo');
    if (sub) sub.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''} en tu tienda`;
    if (productos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:#64748B">
        No tienes productos. <a href="#" onclick="cambiarSeccion('nuevo-producto')" style="color:#F97316">Agregar →</a></td></tr>`;
      return;
    }
    tbody.innerHTML = productos.map(p => `
      <tr data-id="${p.id || p._id}">
        <td><div class="celda-producto">
          <span class="producto-tabla-emoji">👟</span>
          <div><p class="producto-tabla-nombre">${p.nombre}</p><p class="producto-tabla-marca">${p.marca}</p></div>
        </div></td>
        <td>$${Number(p.precio).toLocaleString('es-CO')}</td>
        <td><span class="${p.stock > 0 ? 'stock-disponible' : 'stock-agotado'}">${p.stock} und</span></td>
        <td class="celda-gris">${p.tallas ? p.tallas.join(', ') : '—'}</td>
        <td class="celda-gris">${p.categoria || '—'}</td>
        <td>${badgeEstadoV(p.estado)}</td>
        <td><div class="acciones-tabla">
          <button class="boton-accion-tabla boton-ver-tabla" onclick="window.open('/detalle?id=${p.id || p._id}','_blank')">👁</button>
          <button class="boton-accion-tabla boton-editar-tabla" onclick="editarProducto('${p.id || p._id}')">✏️</button>
          <button class="boton-accion-tabla ${p.estado === 'ACTIVO' ? 'boton-suspender-tabla' : 'boton-activar-tabla'}"
                  onclick="toggleEstadoProducto('${p.id || p._id}','${p.estado}')">
            ${p.estado === 'ACTIVO' ? '⏸' : '▶'}
          </button>
          <button class="boton-accion-tabla" style="color:#e05252" onclick="eliminarProducto('${p.id || p._id}')">🗑</button>
        </div></td>
      </tr>`).join('');

    const inputBuscar = document.getElementById('buscar-mi-producto');
    if (inputBuscar) {
      inputBuscar.addEventListener('input', function() {
        const t = this.value.toLowerCase();
        tbody.querySelectorAll('tr').forEach(f => { f.style.display = f.textContent.toLowerCase().includes(t) ? '' : 'none'; });
      });
    }
  } catch (err) { console.error('Error productos:', err); }
}

function badgeEstadoV(estado) {
  const map = { ACTIVO:['badge-entregado','Activo'], BORRADOR:['badge-procesando','Borrador'], SUSPENDIDO:['badge-cancelado','Pausado'] };
  const b = map[estado] || ['','—'];
  return `<span class="badge-estado ${b[0]}">${b[1]}</span>`;
}

async function toggleEstadoProducto(id, estadoActual) {
  const nuevo = estadoActual === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
  try {
    const res = await fetch(`/api/vendedor/productos/${id}/estado`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ estado: nuevo, vendedorId: id }) });
    const data = await res.json();
    if (data.exito) { mostrarToastV(nuevo === 'ACTIVO' ? '✅ Producto activado' : 'Producto pausado'); cargarMisProductos(); }
  } catch { mostrarToastV('❌ Error'); }
}

async function eliminarProducto(id) {
  confirmarAccion('¿ELIMINAR PRODUCTO?', async function() {
  try {
    await fetch(`/api/vendedor/productos/${id}?vendedorId=${id}`, { method: 'DELETE' });
    mostrarToastV('Producto eliminado'); cargarMisProductos();
  } catch(e) { mostrarToastV('❌ Error'); }
  });
  return;
  try {
    await fetch(`/api/vendedor/productos/${id}?vendedorId=${id}`, { method: 'DELETE' });
    mostrarToastV('Producto eliminado'); cargarMisProductos();
  } catch { mostrarToastV('❌ Error'); }
}

// ================================================================
// FORMULARIO NUEVO / EDITAR PRODUCTO
// ================================================================
const formNuevoProducto    = document.getElementById('form-nuevo-producto');
const alertaExitoProducto  = document.getElementById('alerta-exito-producto');
const alertaErrorProducto  = document.getElementById('alerta-error-producto');
const botonGuardarBorrador = document.getElementById('boton-guardar-borrador');
let tallasSeleccionadas = [];

document.querySelectorAll('.boton-talla-form').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const talla = this.dataset.talla;
    this.classList.toggle('activo');
    if (this.classList.contains('activo')) { tallasSeleccionadas.push(talla); agregarCampoStock(talla); }
    else { tallasSeleccionadas = tallasSeleccionadas.filter(t => t !== talla); const c = document.getElementById('stock-talla-' + talla); if (c) c.remove(); }
    const cont = document.getElementById('contenedor-stock-por-talla');
    if (cont) cont.style.display = tallasSeleccionadas.length > 0 ? 'block' : 'none';
  });
});

function agregarCampoStock(talla) {
  const grilla = document.getElementById('grilla-stock-tallas');
  if (!grilla) return;
  const div = document.createElement('div');
  div.className = 'campo-stock-talla'; div.id = 'stock-talla-' + talla;
  div.innerHTML = `<label>Talla ${talla}</label><input type="number" min="0" value="0" class="campo-admin"/>`;
  grilla.appendChild(div);
}

const zonaCarga = document.getElementById('zona-carga-principal');
const inputImgs = document.getElementById('input-imagenes');
const previsualizar = document.getElementById('previsualizacion-imagenes');

if (zonaCarga) {
  zonaCarga.addEventListener('click', () => inputImgs?.click());
  zonaCarga.addEventListener('dragover', e => { e.preventDefault(); zonaCarga.style.borderColor = 'var(--color-rojo)'; });
  zonaCarga.addEventListener('dragleave', () => zonaCarga.style.borderColor = '');
  zonaCarga.addEventListener('drop', e => { e.preventDefault(); zonaCarga.style.borderColor = ''; procesarImgs(e.dataTransfer.files); });
}
if (inputImgs) inputImgs.addEventListener('change', () => procesarImgs(inputImgs.files));

function procesarImgs(archivos) {
  Array.from(archivos).forEach(f => {
    if (!f.type.startsWith('image/')) return;
    const div = document.createElement('div'); div.className = 'miniatura-cargada';
    const reader = new FileReader();
    reader.onload = e => { div.style.backgroundImage = `url(${e.target.result})`; div.style.backgroundSize = 'cover'; div.style.backgroundPosition = 'center'; };
    reader.readAsDataURL(f);
    const btn = document.createElement('button'); btn.className = 'boton-quitar-imagen'; btn.textContent = '✕';
    btn.addEventListener('click', () => div.remove());
    div.appendChild(btn); previsualizar?.appendChild(div);
  });
}

function construirDatosProducto() {
  const { id, empresaId } = UW_V();
  const colores = Array.from(document.querySelectorAll('#selector-colores-form input:checked')).map(c => c.value);
  const stockPorTalla = {};
  tallasSeleccionadas.forEach(t => { const inp = document.querySelector(`#stock-talla-${t} input`); stockPorTalla[t] = inp ? parseInt(inp.value) || 0 : 0; });
  const stock = Object.values(stockPorTalla).reduce((a, b) => a + b, 0);
  return {
    nombre:      document.getElementById('prod-nombre')?.value.trim(),
    marca:       document.getElementById('prod-marca')?.value,
    categoria:   document.getElementById('prod-categoria')?.value,
    genero:      document.getElementById('prod-genero')?.value,
    descripcion: document.getElementById('prod-descripcion')?.value.trim(),
    precio:      parseInt(document.getElementById('prod-precio')?.value) || 0,
    precioDescuento: parseInt(document.getElementById('prod-precio-descuento')?.value) || null,
    tallas: tallasSeleccionadas, colores, stockPorTalla, stock,
    vendedorId: id, empresaId: empresaId || null,
    vendedorNombre: localStorage.getItem('uw-nombre') || ''
  };
}

if (formNuevoProducto) {
  formNuevoProducto.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (alertaExitoProducto) alertaExitoProducto.style.display = 'none';
    if (alertaErrorProducto) alertaErrorProducto.style.display = 'none';
    const datos = construirDatosProducto();
    if (!datos.nombre || !datos.marca || !datos.categoria) {
      if (alertaErrorProducto) { alertaErrorProducto.textContent = '❌ Completa los campos requeridos'; alertaErrorProducto.style.display = 'block'; }
      return;
    }
    try {
      const res  = await fetch('/api/vendedor/productos', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(datos) });
      const data = await res.json();
      if (data.exito) {
        if (alertaExitoProducto) { alertaExitoProducto.textContent = '✅ ' + data.mensaje; alertaExitoProducto.style.display = 'block'; }
        setTimeout(() => cambiarSeccion('mis-productos'), 2000);
      } else {
        if (alertaErrorProducto) { alertaErrorProducto.textContent = '❌ ' + (data.mensaje || 'Error'); alertaErrorProducto.style.display = 'block'; }
      }
    } catch { if (alertaErrorProducto) { alertaErrorProducto.textContent = '❌ Error de conexión'; alertaErrorProducto.style.display = 'block'; } }
  });
}

if (botonGuardarBorrador) {
  botonGuardarBorrador.addEventListener('click', async function() {
    const datos = construirDatosProducto();
    try {
      const res  = await fetch('/api/vendedor/productos/borrador', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(datos) });
      const data = await res.json();
      mostrarToastV(data.exito ? '💾 ' + data.mensaje : '❌ ' + data.mensaje);
    } catch { mostrarToastV('❌ Error'); }
  });
}

function editarProducto(id) {
  fetch(`/api/vendedor/productos/${id}`).then(r => r.json()).then(p => {
    const set = (fId, val) => { const el = document.getElementById(fId); if (el) el.value = val || ''; };
    set('prod-nombre', p.nombre); set('prod-marca', p.marca); set('prod-categoria', p.categoria);
    set('prod-genero', p.genero); set('prod-descripcion', p.descripcion);
    set('prod-precio', p.precio); set('prod-precio-descuento', p.precioDescuento || '');
    tallasSeleccionadas = p.tallas || [];
    const grilla = document.getElementById('grilla-stock-tallas'); if (grilla) grilla.innerHTML = '';
    document.querySelectorAll('.boton-talla-form').forEach(btn => {
      if (tallasSeleccionadas.includes(btn.dataset.talla)) { btn.classList.add('activo'); agregarCampoStock(btn.dataset.talla); }
      else btn.classList.remove('activo');
    });
    if (p.stockPorTalla) { Object.keys(p.stockPorTalla).forEach(t => { const inp = document.querySelector(`#stock-talla-${t} input`); if (inp) inp.value = p.stockPorTalla[t]; }); }
    document.querySelectorAll('#selector-colores-form input').forEach(cb => { cb.checked = p.colores && p.colores.includes(cb.value); });
    const cont = document.getElementById('contenedor-stock-por-talla'); if (cont) cont.style.display = tallasSeleccionadas.length > 0 ? 'block' : 'none';
    if (formNuevoProducto) formNuevoProducto.dataset.editandoId = id;
    cambiarSeccion('nuevo-producto');
  }).catch(() => mostrarToastV('❌ Error cargando producto'));
}

// ================================================================
// MIS PEDIDOS — con datos completos del comprador
// ================================================================
async function cargarMisPedidosVendedor() {
  const { empresaId } = UW_V();
  const contenedor = document.getElementById('lista-pedidos-vendedor') ||
                     document.querySelector('#seccion-mis-pedidos .seccion-panel-header')?.parentElement;
  const tbody = document.getElementById('tabla-mis-pedidos') ||
                document.querySelector('#seccion-mis-pedidos .tabla-admin tbody');

  if (!empresaId) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748B">No tienes empresa registrada.</td></tr>';
    return;
  }

  try {
    const pedidos = await fetch(`/api/vendedor/pedidos?empresaId=${empresaId}&vendedorId=${id}`).then(r => r.json());

    // Actualizar contador en sidebar
    const pendientes = pedidos.filter(p => p.estado === 'PROCESANDO').length;
    const badge = document.querySelector('.sidebar-enlace[data-seccion="mis-pedidos"] .sidebar-badge');
    if (badge) badge.textContent = pendientes || '';

    if (!pedidos || pedidos.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:#64748B">No tienes pedidos aún.</td></tr>';
      return;
    }

    // Renderizar tabla con TODOS los datos del comprador y dirección
    if (tbody) {
      tbody.innerHTML = pedidos.map(p => {
        const estado  = (p.estado || 'PROCESANDO').toUpperCase();
        const clases  = { ENTREGADO:'badge-entregado', ENVIADO:'badge-enviado', PROCESANDO:'badge-proceso', CANCELADO:'badge-cancelado' };
        const textos  = { ENTREGADO:'Entregado', ENVIADO:'Enviado', PROCESANDO:'En proceso', CANCELADO:'Cancelado' };
        const total   = p.total || (p.items||[]).reduce((s,i) => s+(i.subtotal||0), 0);
        const fecha   = p.fechaPedido ? new Date(p.fechaPedido).toLocaleDateString('es-CO') : '—';
        const dir     = p.direccionEntrega || {};
        const items   = p.items || [];
        const id      = p.id || p._id || '';

        return `
          <tr data-id="${id}" style="cursor:pointer" onclick="verDetallePedidoV('${id}')">
            <td class="celda-gris" style="font-weight:700">#${id.toString().slice(-6).toUpperCase()}</td>
            <td>
              <p style="font-weight:700;color:#0F172A;font-size:0.85rem">${p.nombreUsuario || '—'}</p>
              <p style="font-size:0.72rem;color:#64748B">${p.correoUsuario || '—'}</p>
            </td>
            <td>
              <p style="font-size:0.82rem;color:#0F172A">${dir.linea || '—'}</p>
              <p style="font-size:0.72rem;color:#64748B">📍 ${dir.ciudad || '—'} ${dir.departamento ? '· '+dir.departamento : ''}</p>
              <p style="font-size:0.72rem;color:#64748B">📞 ${dir.telefono || '—'}</p>
            </td>
            <td class="celda-gris">${items.length} producto(s)</td>
            <td class="celda-gris" style="font-weight:700">$${Number(total).toLocaleString('es-CO')}</td>
            <td class="celda-gris">${fecha}</td>
            <td><span class="badge-estado ${clases[estado] || 'badge-pendiente'}">${textos[estado] || estado}</span></td>
            <td onclick="event.stopPropagation()">
              ${estado === 'PROCESANDO'
                ? `<button class="boton-accion-tabla boton-activar-tabla" onclick="marcarEnviado('${id}')">🚚 Enviar</button>`
                : '—'}
            </td>
          </tr>`;
      }).join('');
    }

    // Filtros de estado
    document.querySelectorAll('.filtro-pedido-btn, [data-filtro-pedido]').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filtro-pedido-btn, [data-filtro-pedido]').forEach(b => b.classList.remove('activo'));
        this.classList.add('activo');
        const est = this.dataset.filtroPedido || this.dataset.estado || 'todos';
        document.querySelectorAll('#tabla-mis-pedidos-vendedor tr, tbody[id="tabla-mis-pedidos-vendedor"] tr').forEach(tr => {
          const badge = tr.querySelector('.badge-estado');
          if (!badge) return;
          tr.style.display = (est === 'todos' || badge.textContent.toLowerCase().includes(est)) ? '' : 'none';
        });
      });
    });

  } catch (err) { console.error('Error pedidos vendedor:', err); mostrarToastV('❌ Error cargando pedidos'); }
}

// Modal detalle pedido del vendedor
function verDetallePedidoV(pedidoId) {
  fetch(`/api/pedidos/${pedidoId}`)
    .then(r => r.json())
    .then(p => {
      const dir   = p.direccionEntrega || {};
      const items = p.items || [];
      const total = p.total || items.reduce((s,i) => s+(i.subtotal||0), 0);

      let modal = document.getElementById('modal-pedido-vendedor');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-pedido-vendedor';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="background:#FFFFFF;border:1px solid #E2E8F0;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;padding:32px;position:relative">
          <button onclick="document.getElementById('modal-pedido-vendedor').style.display='none'"
            style="position:absolute;top:16px;right:16px;background:none;border:none;color:#64748B;font-size:1.2rem;cursor:pointer">✕</button>
          
          <h2 style="font-family:var(--fuente-titulos);font-size:1.8rem;letter-spacing:0.04em;color:#0F172A;margin-bottom:24px">
            PEDIDO <span style="color:#F97316">#${(p.id||p._id||'').toString().slice(-6).toUpperCase()}</span>
          </h2>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:16px">
              <p style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#64748B;margin-bottom:8px">DATOS DEL COMPRADOR</p>
              <p style="font-weight:700;color:#0F172A;margin-bottom:4px">${p.nombreUsuario || '—'}</p>
              <p style="font-size:0.8rem;color:#64748B">${p.correoUsuario || '—'}</p>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:16px">
              <p style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#64748B;margin-bottom:8px">DIRECCIÓN DE ENTREGA</p>
              <p style="font-weight:700;color:#0F172A;margin-bottom:4px">${dir.nombre || p.nombreUsuario || '—'}</p>
              <p style="font-size:0.8rem;color:#64748B">${dir.linea || '—'}</p>
              <p style="font-size:0.8rem;color:#64748B">${dir.ciudad || '—'}${dir.departamento ? ', '+dir.departamento : ''}</p>
              <p style="font-size:0.8rem;color:#64748B">📞 ${dir.telefono || '—'}</p>
            </div>
          </div>

          <div style="margin-bottom:20px">
            <p style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#64748B;margin-bottom:12px">PRODUCTOS</p>
            ${items.map(i => `
              <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E2E8F0">
                <div>
                  <p style="font-size:0.88rem;font-weight:700;color:#0F172A">${i.nombre}</p>
                  <p style="font-size:0.72rem;color:#64748B">Talla ${i.talla||'—'} · ${i.color||'—'} · x${i.cantidad||1}</p>
                </div>
                <span style="font-family:var(--fuente-titulos);font-size:1.1rem;color:#0F172A">$${Number(i.subtotal||0).toLocaleString('es-CO')}</span>
              </div>`).join('')}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid #E2E8F0">
            <div>
              <p style="font-size:0.72rem;color:#64748B">Método de pago: <strong style="color:#0F172A">${p.metodoPago || '—'}</strong></p>
              <p style="font-size:0.72rem;color:#64748B">Fecha: ${p.fechaPedido ? new Date(p.fechaPedido).toLocaleDateString('es-CO') : '—'}</p>
            </div>
            <div style="text-align:right">
              <p style="font-size:0.72rem;color:#64748B;text-transform:uppercase;letter-spacing:0.08em">Total</p>
              <p style="font-family:var(--fuente-titulos);font-size:2rem;color:#0F172A">$${Number(total).toLocaleString('es-CO')}</p>
            </div>
          </div>

          ${(p.estado||'').toUpperCase() === 'PROCESANDO' ? `
            <button onclick="marcarEnviado('${p.id||p._id}');document.getElementById('modal-pedido-vendedor').style.display='none'"
              style="width:100%;margin-top:20px;padding:14px;background:#F97316;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.85rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">
              🚚 Marcar como enviado
            </button>` : ''}
        </div>`;
      modal.style.display = 'flex';
    })
    .catch(() => mostrarToastV('❌ Error cargando pedido'));
}

async function marcarEnviado(id) {
  confirmarAccion('¿MARCAR COMO ENVIADO?', async function() {
  try {
    const res = await fetch(`/api/vendedor/pedidos/${id}/enviar`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ vendedorId: UW_V().id })});
    const data = await res.json();
    if (data.exito) { mostrarToastV('✅ Enviado'); cargarMisPedidosVendedor(); }
  } catch(e) { mostrarToastV('❌ Error'); }
  });
  return;
  try {
    const res  = await fetch(`/api/vendedor/pedidos/${id}/enviar`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ vendedorId: UW_V().id }) });
    const data = await res.json();
    if (data.exito) { mostrarToastV('✅ Pedido marcado como enviado'); cargarMisPedidosVendedor(); cargarDashboard(); }
  } catch { mostrarToastV('❌ Error'); }
}

// ================================================================
// MI EMPRESA
// ================================================================
async function cargarMiEmpresa() {
  const { id } = UW_V();
  if (!id) return;
  try {
    const res     = await fetch(`/api/vendedor/empresa?usuarioId=${id}`);
    if (!res.ok) return;
    const empresa = await res.json();
    const set  = (fId, val) => { const el = document.getElementById(fId); if (el) el.value = val || ''; };
    const setTxt = (fId, val) => { const el = document.getElementById(fId); if (el) el.textContent = val || ''; };
    set('emp-nombre', empresa.nombre || empresa.nombreEmpresa);
    set('emp-ciudad', empresa.ciudad);
    set('emp-descripcion', empresa.descripcion);
    set('emp-telefono', empresa.telefono);
    setTxt('empresa-nombre-display', empresa.nombre || empresa.nombreEmpresa);
    setTxt('empresa-nit-display', empresa.nit);
    setTxt('empresa-ciudad-display', empresa.ciudad);
    setTxt('empresa-estado-display', empresa.estado);
    const sidebarNombre = document.getElementById('sidebar-nombre-admin');
    if (sidebarNombre) sidebarNombre.textContent = empresa.nombre || empresa.nombreEmpresa || '';
    if (empresa._id) localStorage.setItem('uw-empresaId', empresa._id);
  } catch (err) { console.error('Error empresa:', err); }
}

const botonGuardarEmpresa = document.getElementById('boton-guardar-empresa');
if (botonGuardarEmpresa) {
  botonGuardarEmpresa.addEventListener('click', async function() {
    const { id } = UW_V();
    if (!id) return;
    const datos = {
      usuarioId:   id,
      nombre:      document.getElementById('emp-nombre')?.value.trim(),
      ciudad:      document.getElementById('emp-ciudad')?.value,
      descripcion: document.getElementById('emp-descripcion')?.value.trim(),
      telefono:    document.getElementById('emp-telefono')?.value.trim()
    };
    try {
      const res  = await fetch('/api/vendedor/empresa', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(datos) });
      const data = await res.json();
      mostrarToastV(data.exito ? '✅ Empresa actualizada' : '❌ ' + data.mensaje);
      if (data.exito) cargarMiEmpresa();
    } catch { mostrarToastV('❌ Error de conexión'); }
  });
}

// ================================================================
// CERRAR SESIÓN
// ================================================================
document.getElementById('boton-cerrar-sesion-admin')?.addEventListener('click', function() {
  confirmarAccion('¿CERRAR SESIÓN?', function() {
    fetch('/api/auth/logout', {method:'POST'}).catch(function(){});
    localStorage.clear();
    window.location.href = '/login';
  });
});

// ── INIT ─────────────────────────────────────────────────────────
cargarInfoSidebar();
cargarDashboard();

// ================================================================
// MIS CUPONES
// ================================================================
async function cargarMisCupones() {
  const { id } = UW_V();
  const tbody = document.getElementById('tabla-mis-cupones');
  if (!tbody || !id) return;

  try {
    const cupones = await fetch(`/api/cupones/vendedor?vendedorId=${id}`).then(r => r.json());

    if (!cupones || cupones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748B">No tienes cupones. ¡Crea tu primer cupón!</td></tr>';
      return;
    }

    tbody.innerHTML = cupones.map(c => {
      const vence  = c.fechaExpiracion ? new Date(c.fechaExpiracion).toLocaleDateString('es-CO') : '—';
      const usos   = `${c.usoActual || 0} / ${c.usoMaximo || '∞'}`;
      const valor  = c.tipo === 'PORCENTAJE' ? `${c.valor}%` : `$${Number(c.valor).toLocaleString('es-CO')}`;
      const minimo = c.minimoCompra > 0 ? `$${Number(c.minimoCompra).toLocaleString('es-CO')}` : '—';

      return `<tr>
        <td style="font-weight:800;letter-spacing:0.06em;color:var(--color-amarillo)">${c.codigo}</td>
        <td class="celda-gris">${c.tipo === 'PORCENTAJE' ? 'Porcentaje' : 'Valor fijo'}</td>
        <td style="font-weight:700;color:#0F172A">${valor}</td>
        <td class="celda-gris">${minimo}</td>
        <td class="celda-gris">${usos}</td>
        <td class="celda-gris">${vence}</td>
        <td><span class="badge-estado ${c.activo ? 'badge-entregado' : 'badge-cancelado'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <div class="acciones-tabla">
            <button class="boton-accion-tabla ${c.activo ? 'boton-suspender-tabla' : 'boton-activar-tabla'}"
                    onclick="toggleCupon('${c.id || c._id}',${c.activo})"
                    title="${c.activo ? 'Desactivar' : 'Activar'}">
              ${c.activo ? '⏸' : '▶'}
            </button>
            <button class="boton-accion-tabla" style="color:#e05252"
                    onclick="eliminarCupon('${c.id || c._id}')" title="Eliminar">🗑</button>
          </div>
        </td>
      </tr>`;
    }).join('');

  } catch(err) { mostrarToastV('❌ Error cargando cupones'); }
}

async function toggleCupon(id, estadoActual) {
  const { id: vendedorId } = UW_V();
  try {
    const res  = await fetch(`/api/cupones/${id}/toggle?vendedorId=${vendedorId}`, { method: 'PUT' });
    const data = await res.json();
    if (data.exito) { mostrarToastV(data.mensaje); cargarMisCupones(); }
    else mostrarToastV('❌ ' + data.mensaje);
  } catch { mostrarToastV('❌ Error'); }
}

async function eliminarCupon(id) {
  confirmarAccion('¿ELIMINAR CUPÓN?', async function() {
  const {id: vendedorId} = UW_V();
  try {
    const res = await fetch(`/api/cupones/${id}?vendedorId=${vendedorId}`, {method:'DELETE'});
    const data = await res.json();
    if (data.exito) { mostrarToastV('Cupón eliminado'); cargarMisCupones(); }
  } catch(e) { mostrarToastV('❌ Error'); }
  });
  return;
  const { id: vendedorId } = UW_V();
  try {
    const res  = await fetch(`/api/cupones/${id}?vendedorId=${vendedorId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.exito) { mostrarToastV('Cupón eliminado'); cargarMisCupones(); }
    else mostrarToastV('❌ ' + data.mensaje);
  } catch { mostrarToastV('❌ Error'); }
}

// Botones del formulario de cupones
document.addEventListener('DOMContentLoaded', function() {
  // Cargar reportes del vendedor
  if (typeof cargarMisReportes === 'function') cargarMisReportes();
  const btnNuevo    = document.getElementById('btn-nuevo-cupon');
  const btnGuardar  = document.getElementById('btn-guardar-cupon');
  const btnCancelar = document.getElementById('btn-cancelar-cupon');
  const formCont    = document.getElementById('form-nuevo-cupon-contenedor');

  if (btnNuevo) btnNuevo.addEventListener('click', function() {
    if (formCont) formCont.style.display = formCont.style.display === 'none' ? 'block' : 'none';
  });

  if (btnCancelar) btnCancelar.addEventListener('click', function() {
    if (formCont) formCont.style.display = 'none';
    limpiarFormCupon();
  });

  if (btnGuardar) btnGuardar.addEventListener('click', async function() {
    const { id, nombre } = UW_V();
    const empresaId   = localStorage.getItem('uw-empresaId');
    const codigo      = document.getElementById('cup-codigo')?.value.trim().toUpperCase();
    const tipo        = document.getElementById('cup-tipo')?.value;
    const valor       = parseInt(document.getElementById('cup-valor')?.value) || 0;
    const minimo      = parseInt(document.getElementById('cup-minimo')?.value) || 0;
    const usos        = parseInt(document.getElementById('cup-usos')?.value) || 100;
    const fecha       = document.getElementById('cup-fecha')?.value;
    const descripcion = document.getElementById('cup-descripcion')?.value.trim();
    const errEl       = document.getElementById('error-cupon');
    const exitoEl     = document.getElementById('exito-cupon');

    if (!codigo) { errEl.textContent='El código es requerido'; errEl.style.display='block'; return; }
    if (valor <= 0) { errEl.textContent='El valor debe ser mayor a 0'; errEl.style.display='block'; return; }
    if (tipo === 'PORCENTAJE' && valor > 100) { errEl.textContent='El porcentaje no puede ser mayor a 100'; errEl.style.display='block'; return; }
    errEl.style.display = 'none';

    try {
      const res  = await fetch('/api/cupones/crear', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ vendedorId:id, vendedorNombre:nombre, empresaId, codigo, tipo, valor, minimoCompra:minimo, usoMaximo:usos, fechaExpiracion:fecha||null, descripcion })
      });
      const data = await res.json();
      if (data.exito) {
        exitoEl.textContent = '✅ ' + data.mensaje; exitoEl.style.display = 'block';
        limpiarFormCupon();
        setTimeout(() => { exitoEl.style.display='none'; if(formCont) formCont.style.display='none'; }, 2000);
        cargarMisCupones();
      } else {
        errEl.textContent = '❌ ' + data.mensaje; errEl.style.display = 'block';
      }
    } catch { errEl.textContent = '❌ Error de conexión'; errEl.style.display = 'block'; }
  });
});

function limpiarFormCupon() {
  ['cup-codigo','cup-valor','cup-minimo','cup-usos','cup-fecha','cup-descripcion'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const errEl = document.getElementById('error-cupon'); if (errEl) errEl.style.display = 'none';
  const exitoEl = document.getElementById('exito-cupon'); if (exitoEl) exitoEl.style.display = 'none';
}
