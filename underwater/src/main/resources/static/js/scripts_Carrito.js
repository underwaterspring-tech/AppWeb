// ================================================================
// scripts_Carrito.js — Underwater Marketplace
// Conectado a /api/carrito y /api/cupones
// ================================================================

const UW_ID = () => localStorage.getItem('uw-id');

let carritoActual  = { items: [] };
let descuentoCupon = 0;

// ── Formato precio ───────────────────────────────────────────────
function fmt(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); }

// ================================================================
// CARGAR CARRITO DESDE API
// ================================================================
async function cargarCarrito() {
  const usuarioId = UW_ID();

  // Si no hay sesión, mostrar carrito vacío
  if (!usuarioId) {
    mostrarCarritoVacio();
    return;
  }

  try {
    const res  = await fetch(`/api/carrito?usuarioId=${usuarioId}`);
    const data = await res.json();
    carritoActual = data;
    renderizarCarrito(data.items || []);
  } catch (err) {
    console.error('Error cargando carrito:', err);
    mostrarCarritoVacio();
  }
}

// ================================================================
// RENDERIZAR ITEMS
// ================================================================
function renderizarCarrito(items) {
  const lista = document.getElementById('lista-productos-carrito');
  const cuerpo = document.getElementById('cuerpo-carrito');
  const vacio  = document.getElementById('estado-carrito-vacio');

  if (!items || items.length === 0) {
    mostrarCarritoVacio();
    return;
  }

  if (cuerpo) cuerpo.style.display = '';
  if (vacio)  vacio.style.display  = 'none';

  // Agrupar por empresa
  const grupos = {};
  items.forEach(item => {
    const key = item.vendedorNombre || 'Tienda';
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(item);
  });

  lista.innerHTML = Object.entries(grupos).map(([empresa, productos]) => `
    <div class="grupo-empresa-carrito">
      <div class="encabezado-grupo-empresa">
        <div class="empresa-grupo-logo">${empresa.substring(0,2).toUpperCase()}</div>
        <div>
          <p class="empresa-grupo-nombre">${empresa}</p>
        </div>
        <span class="empresa-grupo-envio">✓ Envío gratis</span>
      </div>
      ${productos.map(item => renderizarItem(item)).join('')}
    </div>
  `).join('');

  // Registrar eventos de botones
  registrarEventosItems();
  calcularTotales(items);
}

function renderizarItem(item) {
  const precioReal = (item.precioDescuento && item.precioDescuento > 0) ? item.precioDescuento : item.precio;
  const subtotal   = precioReal * item.cantidad;
  const key        = `${item.productoId}__${item.talla}__${item.color}`;

  return `
    <div class="item-carrito" data-key="${key}"
         data-producto-id="${item.productoId}"
         data-talla="${item.talla || ''}"
         data-color="${item.color || ''}">
      <div class="item-imagen" onclick="window.location.href=\'/detalle?id=${item.productoId}\'" style="cursor:pointer">
        ${item.imagenes && item.imagenes.length
          ? `<img src="${item.imagenes[0]}" alt="${item.nombre}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<span style=font-size:2.5rem>👟</span>\'">`
          : item.imagen
            ? `<img src="${item.imagen}" alt="${item.nombre}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<span style=font-size:2.5rem>👟</span>\'">`
            : '<span style="font-size:2.5rem">👟</span>'}
      </div>
      <div class="item-info">
        <p class="item-marca">${item.marca || ''}</p>
        <p class="item-nombre">${item.nombre}</p>
        <div class="item-variantes">
          <span class="item-variante">Talla ${item.talla || '—'}</span>
          <span class="separador-variante">·</span>
          <span class="item-variante">${item.color || '—'}</span>
        </div>
      </div>
      <div class="item-controles">
        <div class="control-cantidad-carrito">
          <button class="boton-restar-item" data-key="${key}">−</button>
          <span class="cantidad-item">${item.cantidad}</span>
          <button class="boton-sumar-item"  data-key="${key}">+</button>
        </div>
        <div class="item-precio-contenedor">
          ${item.precioDescuento && item.precioDescuento > 0
            ? `<span class="item-precio-unitario-tachado">${fmt(item.precio)}</span>`
            : ''}
          <span class="item-precio-total">${fmt(subtotal)}</span>
        </div>
        <button class="boton-eliminar-item" data-key="${key}">✕ Eliminar</button>
      </div>
    </div>`;
}

function registrarEventosItems() {
  document.querySelectorAll('.boton-sumar-item').forEach(btn => {
    btn.addEventListener('click', function() { cambiarCantidad(this.dataset.key, 1); });
  });
  document.querySelectorAll('.boton-restar-item').forEach(btn => {
    btn.addEventListener('click', function() { cambiarCantidad(this.dataset.key, -1); });
  });
  document.querySelectorAll('.boton-eliminar-item').forEach(btn => {
    btn.addEventListener('click', function() { eliminarItem(this.dataset.key); });
  });
}

// ================================================================
// CAMBIAR CANTIDAD
// ================================================================
async function cambiarCantidad(key, delta) {
  const [productoId, talla, color] = key.split('__');
  const item = carritoActual.items.find(i =>
    i.productoId === productoId && i.talla === talla && i.color === color
  );
  if (!item) return;

  const nuevaCantidad = item.cantidad + delta;
  if (nuevaCantidad < 1) { eliminarItem(key); return; }
  if (nuevaCantidad > 10) return;

  try {
    const res = await fetch('/api/carrito/cantidad', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuarioId: UW_ID(), productoId, talla, color, cantidad: nuevaCantidad })
    });
    const data = await res.json();
    carritoActual = data.carrito;
    renderizarCarrito(carritoActual.items);
  } catch (err) { console.error('Error cantidad:', err); }
}

// ================================================================
// ELIMINAR ITEM
// ================================================================
async function eliminarItem(key) {
  const [productoId, talla, color] = key.split('__');
  const itemEl = document.querySelector(`[data-key="${key}"]`);
  if (itemEl) { itemEl.style.opacity = '0'; itemEl.style.transform = 'translateX(20px)'; itemEl.style.transition = 'all 0.3s'; }

  try {
    const res = await fetch('/api/carrito/item', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuarioId: UW_ID(), productoId, talla, color })
    });
    const data = await res.json();
    carritoActual = data.carrito;
    setTimeout(() => renderizarCarrito(carritoActual.items), 300);
  } catch (err) { console.error('Error eliminar:', err); }
}

// ================================================================
// VACIAR CARRITO
// ================================================================
const botonVaciar = document.getElementById('boton-vaciar-carrito');
if (botonVaciar) {
  botonVaciar.addEventListener('click', async function() {
    if (!confirm('¿Vaciar el carrito?')) return;
    try {
      await fetch(`/api/carrito?usuarioId=${UW_ID()}`, { method: 'DELETE' });
      carritoActual = { items: [] };
      mostrarCarritoVacio();
    } catch (err) { console.error('Error vaciar:', err); }
  });
}

// ================================================================
// CARRITO VACÍO
// ================================================================
function mostrarCarritoVacio() {
  const cuerpo = document.getElementById('cuerpo-carrito');
  const vacio  = document.getElementById('estado-carrito-vacio');
  const sub    = document.getElementById('subtitulo-carrito');
  if (cuerpo) cuerpo.style.display = 'none';
  if (vacio)  vacio.style.display  = 'flex';
  if (sub)    sub.textContent      = 'Tu carrito está vacío';
  actualizarContadorNavbar(0);
}

// ================================================================
// CALCULAR TOTALES
// ================================================================
function calcularTotales(items) {
  const subtotal = (items || []).reduce((sum, i) => {
    const p = (i.precioDescuento && i.precioDescuento > 0) ? i.precioDescuento : i.precio;
    return sum + p * i.cantidad;
  }, 0);

  const total = Math.max(subtotal - descuentoCupon, 0);
  const totalItems = (items || []).reduce((s, i) => s + i.cantidad, 0);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('valor-subtotal',   fmt(subtotal));
  set('valor-descuentos', descuentoCupon > 0 ? '− ' + fmt(descuentoCupon) : '− $0');
  set('valor-total',      fmt(total));
  set('cantidad-items-carrito', totalItems);
  actualizarContadorNavbar(totalItems);
}

function actualizarContadorNavbar(n) {
  const el = document.getElementById('contador-carrito');
  if (el) el.textContent = n;
}

// ================================================================
// CUPÓN
// ================================================================
const inputCupon        = document.getElementById('input-cupon');
const botonAplicarCupon = document.getElementById('boton-aplicar-cupon');
const mensajeCupon      = document.getElementById('mensaje-cupon');

if (botonAplicarCupon) {
  botonAplicarCupon.addEventListener('click', async function() {
    const codigo   = inputCupon.value.trim().toUpperCase();
    if (!codigo) { mostrarMsgCupon('Ingresa un código', false); return; }

    const subtotal = (carritoActual.items || []).reduce((s, i) => {
      const p = (i.precioDescuento && i.precioDescuento > 0) ? i.precioDescuento : i.precio;
      return s + p * i.cantidad;
    }, 0);

    try {
      const res  = await fetch('/api/cupones/validar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ codigo, subtotal })
      });
      const data = await res.json();

      if (data.valido) {
        descuentoCupon = data.descuento || 0;
        mostrarMsgCupon(data.mensaje, true);
        inputCupon.disabled           = true;
        botonAplicarCupon.textContent = '✓ Aplicado';
        botonAplicarCupon.style.background = '#2d6e2d';
        // Persistir para que checkout lo lea
        sessionStorage.setItem('uw-cupon', JSON.stringify({ codigo, descuento: descuentoCupon }));
        calcularTotales(carritoActual.items);
      } else {
        mostrarMsgCupon(data.mensaje, false);
        descuentoCupon = 0;
        sessionStorage.removeItem('uw-cupon');
        calcularTotales(carritoActual.items);
      }
    } catch (err) {
      mostrarMsgCupon('Error al validar el cupón', false);
    }
  });
}

if (inputCupon) inputCupon.addEventListener('keydown', e => { if (e.key === 'Enter' && botonAplicarCupon) botonAplicarCupon.click(); });

function mostrarMsgCupon(texto, ok) {
  if (!mensajeCupon) return;
  mensajeCupon.style.display = 'block';
  mensajeCupon.textContent   = texto;
  mensajeCupon.className     = ok ? 'cupon-valido' : 'cupon-invalido';
}

// ================================================================
// PROCEDER AL PAGO — lleva al checkout sin vaciar el carrito
// ================================================================
const botonPago = document.getElementById('boton-proceder-pago');
if (botonPago) {
  // Quitar onclick del HTML si existe y usar solo este listener
  botonPago.removeAttribute('onclick');
  botonPago.addEventListener('click', function() {
    if (!carritoActual.items || carritoActual.items.length === 0) {
      mostrarNotifCarrito('Tu carrito está vacío'); return;
    }
    const uid = UW_ID();
    const rol = localStorage.getItem('uw-rol');
    if (!uid) {
      if (confirm('Debes iniciar sesión para pagar. ¿Ir al login?')) window.location.href = '/login';
      return;
    }
    if (rol === 'VENDEDOR' || rol === 'ADMIN') {
      mostrarNotifCarrito('Los vendedores no pueden realizar compras.'); return;
    }
    // Ir al checkout — el carrito se mantiene en BD
    window.location.href = '/checkout';
  });
}

function mostrarNotifCarrito(msg) {
  var t = document.getElementById('toast-carrito');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast-carrito';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#FFFFFF;border:1px solid rgba(200,69,45,0.4);color:#e05252;padding:14px 20px;font-size:.82rem;font-weight:700;z-index:9999;transition:opacity .3s;max-width:320px';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._t); t._t = setTimeout(function(){ t.style.opacity='0'; }, 3000);
}

// Mantener por compatibilidad
async function realizarPedido() {
  window.location.href = '/checkout';
}
// dummy

// ── INIT ─────────────────────────────────────────────────────────
cargarCarrito();
console.log('✅ scripts_Carrito.js cargado');

// ── Productos sugeridos dinámicos ─────────────────────────────
var FONDOS_SUGERIDOS = ['#f0e8e8','#e8eaf0','#f4e8f0','#e8ecf0','#f0ece8','#e8f0ec'];

async function cargarSugeridos() {
  var grilla = document.getElementById('grilla-sugeridos');
  if (!grilla) return;

  try {
    var res      = await fetch('/api/productos?tamano=4&pagina=0&orden=destacados');
    var data     = await res.json();
    var productos = data.productos || data || [];

    if (!productos.length) {
      // Fallback — cargar los más recientes
      var res2 = await fetch('/api/productos?tamano=4&pagina=0&orden=novedad');
      var data2 = await res2.json();
      productos = data2.productos || data2 || [];
    }

    if (!productos.length) {
      grilla.innerHTML = '';
      return;
    }

    grilla.innerHTML = productos.slice(0,4).map(function(p, i) {
      var id     = p.id || p._id || '';
      var fondo  = FONDOS_SUGERIDOS[i % FONDOS_SUGERIDOS.length];
      var precio = p.precioDescuento && p.precioDescuento > 0 ? p.precioDescuento : p.precio;
      var precioHTML = p.precioDescuento && p.precioDescuento > 0
        ? '<span class="precio-descuento">$'+parseInt(p.precioDescuento).toLocaleString('es-CO')+'</span>'
          + '<span class="precio-original">$'+parseInt(p.precio).toLocaleString('es-CO')+'</span>'
        : '$'+parseInt(p.precio||0).toLocaleString('es-CO');

      // Imagen real o emoji
      var imgHTML = '';
      if (p.imagenes && p.imagenes.length) {
        imgHTML = '<img src="'+p.imagenes[0]+'" alt="'+p.nombre+'" '
          + 'style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" '
          + 'onerror="this.style.display=\'none\';this.parentElement.querySelector(\'.emoji-fallback\').style.display=\'flex\'">';
        imgHTML += '<span class="emoji-fallback" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:4rem">👟</span>';
      } else {
        imgHTML = '<span style="font-size:4rem">👟</span>';
      }

      var etiqueta = p.destacado
        ? '<span class="etiqueta-producto etiqueta-popular">🔥 Top</span>'
        : '<span class="etiqueta-producto etiqueta-nuevo">Nuevo</span>';

      var rating   = Math.round(p.valoracionPromedio || 0);
      var estrellas = '★'.repeat(rating) + '☆'.repeat(5-rating);
      var resenas  = p.totalResenas ? '('+p.totalResenas+')' : '';

      return '<div class="tarjeta-producto" style="cursor:pointer" onclick="window.location.href=\'/detalle?id=' + id + '\'">'
        + '<div class="imagen-producto" style="background:'+fondo+';position:relative;display:flex;align-items:center;justify-content:center">'
          + etiqueta
          + imgHTML
          + '<button class="boton-agregar-carrito" onclick="event.stopPropagation();agregarSugerido(\''+id+'\',this)">+ Agregar al carrito</button>'
        + '</div>'
        + '<div class="detalle-producto">'
          + '<p class="vendedor-producto">por <a href="#" class="enlace-vendedor">'+(p.vendedorNombre||'Tienda')+'</a></p>'
          + '<p class="marca-producto">'+(p.marca||'')+'</p>'
          + '<p class="nombre-producto">'+(p.nombre||'')+'</p>'
          + '<div class="estrellas-valoracion"><span class="estrellas">'+estrellas+'</span>'+(resenas?'<span class="cantidad-resenas">'+resenas+'</span>':'')+'</div>'
          + '<div class="pie-producto"><div class="precio-producto">'+precioHTML+'</div></div>'
        + '</div>'
      + '</div>';
    }).join('');

  } catch(e) {
    console.warn('Error cargando sugeridos:', e);
    grilla.innerHTML = '';
  }
}

async function agregarSugerido(productoId, btn) {
  if (typeof agregarAlCarrito === 'function') {
    agregarAlCarrito(productoId, btn);
  }
}

// Cargar sugeridos al iniciar
document.addEventListener('DOMContentLoaded', function() {
  cargarSugeridos();
});
