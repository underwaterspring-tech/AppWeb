// ================================================================
// scripts_Comprador.js — Underwater Marketplace
// Conectado a /api/comprador, /api/pedidos, /api/favoritos
// ================================================================

const UW = () => ({
  id:     localStorage.getItem('uw-id'),
  nombre: localStorage.getItem('uw-nombre'),
  email:  localStorage.getItem('uw-email'),
  rol:    localStorage.getItem('uw-rol')
});

// ── TOAST ────────────────────────────────────────────────────────
function mostrarToast(mensaje) {
  let toast = document.getElementById('toast-comprador');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-comprador';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#FFFFFF;border:1px solid rgba(45,110,45,0.4);color:#4caf50;padding:14px 20px;font-size:0.82rem;font-weight:700;z-index:9999;transition:opacity 0.3s;max-width:320px;';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.style.opacity = '0', 3000);
}

// ================================================================
// PERFIL — cargar datos del usuario
// ================================================================
async function cargarPerfil() {
  const { id, nombre, email } = UW();
  if (!id) return;

  // Actualizar UI con lo que hay en sesión primero
  const setEl = (sel, val) => { const el = document.getElementById(sel); if (el) el.value = val || ''; };
  const setTxt = (sel, val) => { const el = document.getElementById(sel); if (el) el.textContent = val || ''; };

  setTxt('perfil-nombre-completo', nombre);
  setTxt('perfil-email',           email);

  const partes = (nombre || '').split(' ');
  const avatar = document.getElementById('perfil-avatar');
  if (avatar) avatar.textContent = partes.map(p => p[0]).join('').substring(0, 2).toUpperCase();

  try {
    const res  = await fetch(`/api/comprador/perfil?usuarioId=${id}`);
    const data = await res.json();

    const nombreParts = (data.nombre || '').split(' ');
    setEl('cuenta-nombre',    nombreParts[0] || '');
    setEl('cuenta-apellido',  nombreParts.slice(1).join(' ') || '');
    setEl('cuenta-email',     data.email    || '');
    setEl('cuenta-telefono',  data.telefono || '');
    setEl('cuenta-direccion', data.direccion|| '');

    setTxt('perfil-nombre-completo', data.nombre);
    setTxt('perfil-email',           data.email);
    setTxt('perfil-miembro-desde',   data.fechaRegistro ? 'Miembro desde ' + formatearFecha(data.fechaRegistro) : '');

    if (avatar && data.nombre) {
      avatar.textContent = data.nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
    }
  } catch (err) {
    console.warn('Error cargando perfil:', err);
  }
}

// ── GUARDAR DATOS PERSONALES ─────────────────────────────────────
const formDatos = document.getElementById('form-datos-personales');
if (formDatos) {
  formDatos.addEventListener('submit', async function(e) {
    e.preventDefault();
    const { id } = UW();
    if (!id) return;

    const nombre    = (document.getElementById('cuenta-nombre')?.value.trim() || '') + ' ' + (document.getElementById('cuenta-apellido')?.value.trim() || '');
    const telefono  = document.getElementById('cuenta-telefono')?.value.trim();
    const direccion = document.getElementById('cuenta-direccion')?.value.trim();

    try {
      const res = await fetch('/api/comprador/perfil', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ usuarioId: id, nombre: nombre.trim(), telefono, direccion })
      });
      const data = await res.json();
      if (data.exito) {
        localStorage.setItem('uw-nombre', nombre.trim());
        const exito = document.getElementById('exito-datos');
        if (exito) { exito.style.display = 'block'; setTimeout(() => exito.style.display = 'none', 3000); }
        mostrarToast('✅ Datos actualizados');
      }
    } catch (err) { mostrarToast('❌ Error al guardar'); }
  });
}

// ── CAMBIAR CONTRASEÑA ───────────────────────────────────────────
const formPassword = document.getElementById('form-cambiar-password');
if (formPassword) {
  formPassword.addEventListener('submit', async function(e) {
    e.preventDefault();
    const { id } = UW();
    if (!id) return;

    const actual    = document.getElementById('pass-actual')?.value;
    const nueva     = document.getElementById('pass-nueva')?.value;
    const confirmar = document.getElementById('pass-confirmar')?.value;
    const errEl     = document.getElementById('error-password');

    if (!actual || !nueva || !confirmar) { if (errEl) errEl.textContent = 'Completa todos los campos'; return; }
    if (nueva !== confirmar)             { if (errEl) errEl.textContent = 'Las contraseñas no coinciden'; return; }
    if (nueva.length < 8)                { if (errEl) errEl.textContent = 'Mínimo 8 caracteres'; return; }
    if (errEl) errEl.textContent = '';

    try {
      const res = await fetch('/api/comprador/cambiar-password', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ usuarioId: id, passwordActual: actual, passwordNueva: nueva })
      });
      const data = await res.json();
      if (data.exito) {
        const exito = document.getElementById('exito-password');
        if (exito) { exito.style.display = 'block'; setTimeout(() => exito.style.display = 'none', 3000); }
        mostrarToast('✅ Contraseña actualizada');
        formPassword.reset();
      } else {
        if (errEl) errEl.textContent = data.mensaje || 'Error al cambiar contraseña';
      }
    } catch (err) { mostrarToast('❌ Error de conexión'); }
  });
}

// ── MOSTRAR/OCULTAR CONTRASEÑA ───────────────────────────────────
document.querySelectorAll('.btn-toggle-password').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const campo = document.getElementById(this.dataset.target);
    if (!campo) return;
    campo.type       = campo.type === 'password' ? 'text' : 'password';
    this.textContent = campo.type === 'password' ? '👁' : '🙈';
  });
});

// ================================================================
// PEDIDOS — cargar mis pedidos
// ================================================================
async function cargarMisPedidos() {
  const { id } = UW();
  const contenedor = document.getElementById('lista-pedidos') || document.querySelector('.lista-pedidos');
  if (!contenedor || !id) return;

  try {
    const res     = await fetch(`/api/pedidos?usuarioId=${id}`);
    const pedidos = await res.json();

    if (!pedidos || pedidos.length === 0) {
      contenedor.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#64748B">
          <p style="font-size:2rem;margin-bottom:12px">📦</p>
          <p>No tienes pedidos aún.</p>
          <a href="/catalogo" class="boton-principal" style="display:inline-block;margin-top:20px;text-decoration:none;padding:12px 28px">Ver catálogo →</a>
        </div>`;
      return;
    }

    contenedor.innerHTML = pedidos.map(p => {
      const estado     = (p.estado || 'PROCESANDO').toUpperCase();
      const mapaClase  = { ENTREGADO:'badge-entregado', ENVIADO:'badge-enviado', PROCESANDO:'badge-procesando', PENDIENTE:'badge-pendiente', CANCELADO:'badge-cancelado' };
      const mapaTexto  = { ENTREGADO:'✓ Entregado', ENVIADO:'↑ Enviado', PROCESANDO:'⏳ En proceso', PENDIENTE:'⏳ Pendiente', CANCELADO:'✕ Cancelado' };
      const claseBadge = mapaClase[estado] || 'badge-pendiente';
      const textBadge  = mapaTexto[estado]  || estado;
      const fecha      = p.fechaPedido ? formatearFecha(p.fechaPedido) : '—';
      const items      = p.items || [];
      const total      = p.total || items.reduce((s, i) => s + (i.subtotal || 0), 0);
      const puedeCancel = estado === 'PROCESANDO' || estado === 'PENDIENTE';

      return `
        <div class="tarjeta-pedido" data-estado="${estado.toLowerCase()}" data-id="${p.id || p._id}">
          <div class="tarjeta-pedido-header">
            <div>
              <p class="pedido-numero">Pedido #${(p.id || p._id || '').toString().slice(-8).toUpperCase()}</p>
              <p class="pedido-fecha">${fecha}</p>
            </div>
            <span class="badge-pedido ${claseBadge}">${textBadge}</span>
          </div>
          <div class="tarjeta-pedido-items">
            ${items.map(i => `
              <div class="item-pedido-mini">
                <span class="item-pedido-nombre">${i.nombre} — Talla ${i.talla}</span>
                <span class="item-pedido-precio">$${Number(i.subtotal || 0).toLocaleString('es-CO')}</span>
              </div>`).join('')}
          </div>
          <div class="tarjeta-pedido-footer">
            <p class="pedido-total">Total: <strong>$${Number(total).toLocaleString('es-CO')}</strong></p>
            <div class="pedido-acciones">
              ${puedeCancel ? `<button class="btn-pedido-cancelar" data-id="${p.id || p._id}">Cancelar</button>` : ''}
              <button class="btn-dejar-resena">⭐ Dejar reseña</button>
            </div>
          </div>
        </div>`;
    }).join('');

    // Eventos cancelar
    contenedor.querySelectorAll('.btn-pedido-cancelar').forEach(btn => {
      btn.addEventListener('click', async function() {
        const pedidoId = this.dataset.id;
        if (typeof abrirModalCancelar === 'function') { abrirModalCancelar(pedidoId); return; }
        try {
          const res  = await fetch(`/api/pedidos/${pedidoId}/cancelar?usuarioId=${id}`, { method: 'PUT' });
          const data = await res.json();
          if (data.exito) { mostrarToast('Pedido cancelado.'); cargarMisPedidos(); }
          else mostrarToast('❌ ' + data.error);
        } catch { mostrarToast('❌ Error de conexión'); }
      });
    });

    // Filtros de estado
    registrarFiltrosPedidos();

  } catch (err) {
    console.error('Error cargando pedidos:', err);
    contenedor.innerHTML = '<p style="text-align:center;color:#64748B;padding:40px">Error al cargar pedidos.</p>';
  }
}

function registrarFiltrosPedidos() {
  const filtrosBtnEstado = document.querySelectorAll('.filtro-estado-btn');
  filtrosBtnEstado.forEach(function(boton) {
    boton.addEventListener('click', function() {
      filtrosBtnEstado.forEach(b => b.classList.remove('activo'));
      this.classList.add('activo');
      const estadoFiltro = this.dataset.estado;
      document.querySelectorAll('.tarjeta-pedido').forEach(t => {
        t.style.display = (estadoFiltro === 'todos' || t.dataset.estado === estadoFiltro) ? '' : 'none';
      });
    });
  });
}

// ================================================================
// FAVORITOS — cargar y gestionar
// ================================================================
async function cargarFavoritos() {
  const { id } = UW();
  const grilla  = document.getElementById('grilla-favoritos');
  const vacio   = document.getElementById('favoritos-vacio');
  if (!grilla || !id) return;

  try {
    const res  = await fetch(`/api/favoritos?usuarioId=${id}`);
    const favs = await res.json();

    if (!favs || favs.length === 0) {
      grilla.style.display = 'none';
      if (vacio) vacio.style.display = 'block';
      return;
    }

    grilla.style.display = '';
    if (vacio) vacio.style.display = 'none';

    const FONDOS = ['#f0ece4','#e8f0e8','#f0e8e8','#e8eaf0','#faf0e8'];

    grilla.innerHTML = favs.map((f, i) => {
      const precio   = f.precioDescuento && f.precioDescuento > 0 ? f.precioDescuento : f.precio;
      const fondo    = FONDOS[i % FONDOS.length];
      const imgs     = f.imagenes || [];
      const imgHTML  = imgs.length > 0
        ? `<img src="${imgs[0]}" alt="${f.nombre}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`
        : '👟';

      return `
        <div class="tarjeta-favorito revelar" data-producto-id="${f.productoId}">
          <div class="tarjeta-producto" onclick="window.location.href='detalle.html?id=${f.productoId}'" style="cursor:pointer">
            <div class="imagen-producto" style="background:${fondo}">
              ${imgHTML}
              <button class="boton-agregar-carrito" onclick="event.stopPropagation();agregarAlCarritoDesde('${f.productoId}',this)">
                + Agregar al carrito
              </button>
            </div>
            <div class="detalle-producto">
              <p class="vendedor-producto">por <span>${f.vendedorNombre || 'Tienda'}</span></p>
              <p class="nombre-producto">${f.nombre || '—'}</p>
              <div class="pie-producto">
                <div class="precio-producto">$${Number(precio || 0).toLocaleString('es-CO')}</div>
              </div>
            </div>
          </div>
          <button class="btn-quitar-favorito" data-producto-id="${f.productoId}">✕ Quitar</button>
        </div>`;
    }).join('');

    // Eventos quitar favorito
    grilla.querySelectorAll('.btn-quitar-favorito').forEach(btn => {
      btn.addEventListener('click', async function() {
        const productoId = this.dataset.productoId;
        try {
          await fetch('/api/favoritos', {
            method:  'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ usuarioId: id, productoId })
          });
          const tarjeta = this.closest('.tarjeta-favorito');
          tarjeta.style.cssText = 'opacity:0;transform:scale(0.9);transition:all 0.3s';
          setTimeout(() => { tarjeta.remove(); if (!grilla.querySelector('.tarjeta-favorito')) { grilla.style.display='none'; if(vacio) vacio.style.display='block'; } }, 300);
          mostrarToast('Eliminado de favoritos');
        } catch { mostrarToast('❌ Error'); }
      });
    });

  } catch (err) { console.error('Error favoritos:', err); }
}

async function agregarAlCarritoDesde(productoId, boton) {
  const { id } = UW();
  if (!id) { window.location.href = '/login'; return; }

  try {
    const res = await fetch('/api/carrito/agregar', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuarioId: id, productoId, talla: '', color: '', cantidad: 1 })
    });
    const data = await res.json();
    if (data.exito) {
      const orig = boton.textContent;
      boton.textContent = '✓ ¡Agregado!';
      boton.style.background = '#2d6e2d';
      setTimeout(() => { boton.textContent = orig; boton.style.background = ''; }, 1500);
    }
  } catch { mostrarToast('❌ Error al agregar'); }
}

// ================================================================
// RESEÑAS — modal
// ================================================================
const modalResena     = document.getElementById('modal-resena');
const btnCerrarModal  = document.getElementById('btn-cerrar-modal-resena');
const estrellasClick  = document.querySelectorAll('.estrella-click');
const textoValoracion = document.getElementById('texto-valoracion');
const btnEnviarResena = document.getElementById('btn-enviar-resena');
const errorResena     = document.getElementById('error-resena');
let valoracionElegida = 0;
let productoIdResena  = null;

const textoValoraciones = { 1:'😞 Muy malo', 2:'😐 Regular', 3:'🙂 Bueno', 4:'😊 Muy bueno', 5:'🤩 Excelente' };

document.querySelectorAll('.btn-dejar-resena, #btn-abrir-modal-resena').forEach(function(btn) {
  btn.addEventListener('click', function() {
    valoracionElegida = 0;
    productoIdResena  = this.dataset.productoId || null;
    estrellasClick.forEach(e => { e.classList.remove('activa'); e.style.color = ''; });
    if (textoValoracion) textoValoracion.textContent = 'Selecciona una valoración';
    const inp = document.getElementById('input-comentario-resena');
    if (inp) inp.value = '';
    if (errorResena) errorResena.textContent = '';
    if (modalResena) modalResena.style.display = 'flex';
  });
});

if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => { if (modalResena) modalResena.style.display = 'none'; });
if (modalResena) modalResena.addEventListener('click', e => { if (e.target === modalResena) modalResena.style.display = 'none'; });

estrellasClick.forEach(function(estrella) {
  estrella.addEventListener('mouseenter', function() {
    const val = parseInt(this.dataset.valor);
    estrellasClick.forEach(e => e.style.color = parseInt(e.dataset.valor) <= val ? 'var(--color-amarillo)' : '');
    if (textoValoracion) textoValoracion.textContent = textoValoraciones[val] || '';
  });
  estrella.addEventListener('mouseleave', function() {
    estrellasClick.forEach(e => e.style.color = parseInt(e.dataset.valor) <= valoracionElegida ? 'var(--color-amarillo)' : '');
    if (textoValoracion) textoValoracion.textContent = valoracionElegida > 0 ? textoValoraciones[valoracionElegida] : 'Selecciona una valoración';
  });
  estrella.addEventListener('click', function() {
    valoracionElegida = parseInt(this.dataset.valor);
    estrellasClick.forEach(e => e.classList.toggle('activa', parseInt(e.dataset.valor) <= valoracionElegida));
    if (textoValoracion) textoValoracion.textContent = textoValoraciones[valoracionElegida];
  });
});

if (btnEnviarResena) {
  btnEnviarResena.addEventListener('click', async function() {
    const comentario = document.getElementById('input-comentario-resena')?.value.trim();
    if (valoracionElegida === 0) { if (errorResena) errorResena.textContent = 'Selecciona una valoración'; return; }
    if (!comentario)             { if (errorResena) errorResena.textContent = 'Escribe un comentario'; return; }
    if (errorResena) errorResena.textContent = '';

    const { id, nombre } = UW();
    try {
      await fetch('/api/comprador/resenas', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ usuarioId: id, productoId: productoIdResena, nombreUsuario: nombre, valoracion: valoracionElegida, comentario })
      });
      if (modalResena) modalResena.style.display = 'none';
      mostrarToast('⭐ ¡Reseña publicada!');
    } catch { mostrarToast('❌ Error al enviar reseña'); }
  });
}

// ================================================================
// CERRAR SESIÓN — manejado por scripts_MiCuenta.js
// ================================================================

// ================================================================
// PÁGINA DE ESPERA — verificar estado aprobación
// ================================================================
const btnVerificarEstado = document.getElementById('btn-verificar-estado');
if (btnVerificarEstado) {
  btnVerificarEstado.addEventListener('click', async function() {
    const email = localStorage.getItem('uw-email');
    if (!email) return;
    const orig = this.textContent;
    this.textContent = '⏳ Verificando...';
    this.disabled    = true;

    try {
      // Intentar hacer login de nuevo para ver si ya fue aprobado
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password: '__check__' }) // password incorrecta a propósito
      });
      const data = await res.json();

      if (data.exito && data.rol === 'VENDEDOR') {
        // Fue aprobado — guardar sesión y redirigir
        localStorage.setItem('uw-id',        data.id);
        localStorage.setItem('uw-nombre',    data.nombre);
        localStorage.setItem('uw-email',     data.email);
        localStorage.setItem('uw-rol',       data.rol);
        localStorage.setItem('uw-empresaId', data.empresaId || '');
        window.location.href = '/panel-vendedor';
      } else {
        mostrarToast('Tu empresa sigue en revisión. Te notificaremos pronto.');
      }
    } catch {
      mostrarToast('No se pudo verificar el estado. Intenta más tarde.');
    }

    this.textContent = orig;
    this.disabled    = false;
  });
}

// ── Cargar datos según página ─────────────────────────────────────
function formatearFecha(f) {
  try { return new Date(f).toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' }); }
  catch { return f; }
}

document.addEventListener('DOMContentLoaded', function() {
  const pagina = window.location.pathname.split('/').filter(Boolean).pop()?.replace('.html','')?.toLowerCase() || '';
  if (pagina === 'mi_cuenta'  || pagina === 'mi-cuenta')  cargarPerfil();
  if (pagina === 'pedidos'    || pagina === 'mis-pedidos') cargarMisPedidos();
  if (pagina === 'favoritos'  || pagina === 'mis-favoritos') cargarFavoritos();
});

console.log('✅ scripts_Comprador.js cargado');

// ================================================================
// MIS REPORTES — Comprador/Vendedor
// ================================================================
async function cargarMisReportes() {
  var uid  = localStorage.getItem('uw-id');
  var cont = document.getElementById('lista-mis-reportes-comprador')
          || document.getElementById('lista-mis-reportes-vendedor');
  if (!cont || !uid) return;

  cont.innerHTML = '<p style="color:#64748B;text-align:center;padding:32px;font-size:0.88rem">Cargando reportes...</p>';

  try {
    var res      = await fetch('/api/reportes/mis-reportes?usuarioId=' + uid);
    var reportes = await res.json();

    if (!Array.isArray(reportes) || !reportes.length) {
      cont.innerHTML = '<div style="text-align:center;padding:48px 24px">'
        + '<p style="font-size:2rem;margin-bottom:12px">📋</p>'
        + '<p style="font-size:0.88rem;color:#64748B">No has enviado ningún reporte todavía.</p>'
        + '</div>';
      return;
    }

    var colores = { PENDIENTE:'#e8a838', RESUELTO:'#16a34a', REVISADO:'#2563eb' };

    cont.innerHTML = '<div style="display:flex;flex-direction:column;gap:10px">'
      + reportes.map(function(r) {
          var estado = (r.estado||'PENDIENTE').toUpperCase();
          var color  = colores[estado] || '#888';
          var fecha  = r.fechaCreacion
            ? new Date(r.fechaCreacion).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})
            : '—';

          var html = '<div style="background:#F8FAFC;border:1px solid #E2E8F0;overflow:hidden">';
          html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #E2E8F0">';
          html +=   '<div>';
          html +=     '<p style="font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:#64748B;margin-bottom:3px">'+(r.tipo||'OTRO')+' · '+fecha+'</p>';
          html +=     '<p style="font-size:0.88rem;font-weight:700;color:#0F172A">'+(r.asunto||'—')+'</p>';
          html +=   '</div>';
          html +=   '<span style="font-size:0.62rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:'+color+';border:1px solid '+color+';padding:3px 8px">'+estado+'</span>';
          html += '</div>';
          html += '<div style="padding:12px 16px">';
          html +=   '<p style="font-size:0.82rem;color:#d4cfc8;line-height:1.6">'+(r.descripcion||'')+'</p>';

          // Respuesta del admin
          if (r.respuestaAdmin) {
            var fechaResp = r.fechaRespuesta
              ? new Date(r.fechaRespuesta).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})
              : '';
            html += '<div style="margin-top:12px;background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2);padding:12px 14px">';
            html +=   '<p style="font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:#16a34a;font-weight:800;margin-bottom:6px">';
            html +=     '✓ Respuesta del administrador'+(fechaResp?' · '+fechaResp:'');
            html +=   '</p>';
            html +=   '<p style="font-size:0.84rem;color:#0F172A;line-height:1.6">'+r.respuestaAdmin+'</p>';
            html += '</div>';
          } else {
            html += '<p style="margin-top:10px;font-size:0.75rem;color:#666;font-style:italic">El administrador aún no ha respondido.</p>';
          }

          html += '</div></div>';
          return html;
        }).join('')
      + '</div>';

  } catch(e) {
    cont.innerHTML = '<p style="color:#c8452d;text-align:center;padding:32px">Error al cargar reportes.</p>';
  }
}