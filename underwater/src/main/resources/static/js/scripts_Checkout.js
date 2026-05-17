// ================================================================
// scripts_Checkout.js — Underwater
// ================================================================

// Variables globales del módulo
var carritoActual    = { items: [] };
var metodoPagoActual = 'PSE'; // valor por defecto
var cuponAplicado    = null;  // { codigo, descuento } cuando hay cupón activo

// ── Verificar sesión ────────────────────────────────────────────
(function() {
  var id  = localStorage.getItem('uw-id');
  var rol = localStorage.getItem('uw-rol');
  if (!id) { window.location.replace('/login'); return; }
  if (rol === 'VENDEDOR' || rol === 'ADMIN') { window.location.href = '/index'; }
})();

// ── DOMContentLoaded ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  var uid = localStorage.getItem('uw-id');
  if (!uid) return;

  // Recuperar cupón aplicado en el carrito (si lo hay)
  var cuponGuardado = sessionStorage.getItem('uw-cupon');
  if (cuponGuardado) {
    try { cuponAplicado = JSON.parse(cuponGuardado); } catch(e) {}
  }

  // 1. Cargar carrito
  try {
    var res  = await fetch('/api/carrito?usuarioId=' + uid);
    var data = await res.json();
    carritoActual = data;
    renderResumen(data.items || []);
  } catch(e) {
    console.error('Error cargando carrito:', e);
    document.getElementById('btn-confirmar-pago').disabled = true;
  }

  // 2. Pre-rellenar dirección del perfil
  try {
    var res2   = await fetch('/api/comprador/perfil?usuarioId=' + uid);
    var perfil = await res2.json();
    var nombre = localStorage.getItem('uw-nombre') || perfil.nombre || '';

    if (nombre) document.getElementById('dir-nombre').value = nombre;
    if (perfil.telefono) document.getElementById('dir-telefono').value = perfil.telefono;

    if (perfil.direccion) {
      document.getElementById('dir-linea').value = perfil.direccion;

      // Mostrar tarjeta de dirección guardada
      var cont = document.getElementById('direcciones-guardadas');
      if (cont) {
        cont.innerHTML =
          '<div style="background:#f0fdf4;border:1px solid rgba(22,163,74,0.25);padding:14px 16px;margin-bottom:16px;cursor:pointer" onclick="document.getElementById(\'dir-guardada\').style.display=\'none\'">'
          + '<p style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#16a34a;font-weight:800;margin-bottom:4px">✓ DIRECCIÓN GUARDADA</p>'
          + '<p style="font-size:0.88rem;font-weight:700;color:#0f172a">' + nombre + '</p>'
          + '<p style="font-size:0.82rem;color:#64748b">' + perfil.direccion + '</p>'
          + (perfil.telefono ? '<p style="font-size:0.78rem;color:#64748b">📞 ' + perfil.telefono + '</p>' : '')
          + '</div>';
      }
    }
  } catch(e) { /* No hay perfil guardado — campos vacíos */ }

  // 3. Registrar eventos métodos de pago
  document.querySelectorAll('.metodo-pago-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { seleccionarMetodo(this); });
  });
});

// ── Render resumen lateral ─────────────────────────────────────
function renderResumen(items) {
  var cont  = document.getElementById('resumen-items');
  var total = 0;

  if (!items || !items.length) {
    if (cont) cont.innerHTML = '<p style="color:#64748b;text-align:center;padding:20px;font-size:0.88rem">Tu carrito está vacío</p>';
    var btn = document.getElementById('btn-confirmar-pago');
    if (btn) btn.disabled = true;
    return;
  }

  if (cont) {
    cont.innerHTML = items.map(function(i) {
      var precio = (i.precioDescuento && i.precioDescuento > 0) ? i.precioDescuento : i.precio;
      var sub    = precio * i.cantidad;
      total += sub;
      return '<div class="resumen-item">'
        + '<div style="flex:1;min-width:0">'
          + '<p class="resumen-item-nombre">' + (i.nombre || '') + '</p>'
          + '<p class="resumen-item-variante">Talla ' + (i.talla||'—') + ' · x' + i.cantidad + '</p>'
        + '</div>'
        + '<span class="resumen-item-precio">$' + Number(sub).toLocaleString('es-CO') + '</span>'
        + '</div>';
    }).join('');
  }

  var totalEl = document.getElementById('resumen-total-valor');
  if (totalEl) totalEl.textContent = '$' + Number(total).toLocaleString('es-CO');

  var contadorEl = document.getElementById('contador-carrito');
  if (contadorEl) contadorEl.textContent = items.reduce(function(s, i) { return s + i.cantidad; }, 0);
}

// ── Seleccionar método de pago ─────────────────────────────────
function seleccionarMetodo(el) {
  document.querySelectorAll('.metodo-pago-btn').forEach(function(b) { b.classList.remove('activo'); });
  el.classList.add('activo');
  metodoPagoActual = el.dataset.metodo;
  var formTarjeta = document.getElementById('form-tarjeta');
  if (formTarjeta) formTarjeta.style.display = (metodoPagoActual === 'Tarjeta') ? 'block' : 'none';
}

// ── Validar formulario de dirección ───────────────────────────
function validarDir() {
  var nombre   = document.getElementById('dir-nombre')?.value.trim()   || '';
  var telefono = document.getElementById('dir-telefono')?.value.trim() || '';
  var linea    = document.getElementById('dir-linea')?.value.trim()    || '';
  var ciudad   = document.getElementById('dir-ciudad')?.value          || '';
  var errEl    = document.getElementById('error-dir');

  if (!nombre)   { if (errEl) errEl.textContent = 'El nombre es requerido';   return null; }
  if (!telefono) { if (errEl) errEl.textContent = 'El teléfono es requerido'; return null; }
  if (!linea)    { if (errEl) errEl.textContent = 'La dirección es requerida'; return null; }
  if (!ciudad)   { if (errEl) errEl.textContent = 'Selecciona la ciudad';      return null; }
  if (errEl) errEl.textContent = '';

  return {
    nombre:       nombre,
    telefono:     telefono,
    linea:        linea,
    ciudad:       ciudad,
    departamento: document.getElementById('dir-departamento')?.value.trim() || ''
  };
}

// ── Confirmar pago — función principal ────────────────────────
async function confirmarPago() {
  var uid    = localStorage.getItem('uw-id');
  var nombre = localStorage.getItem('uw-nombre');
  var email  = localStorage.getItem('uw-email');
  var errEl  = document.getElementById('error-pago');
  var btn    = document.getElementById('btn-confirmar-pago');

  if (errEl) errEl.textContent = '';

  // Validar dirección
  var dir = validarDir();
  if (!dir) return;

  // Validar carrito no vacío
  if (!carritoActual.items || !carritoActual.items.length) {
    if (errEl) errEl.textContent = 'Tu carrito está vacío';
    return;
  }

  // Validar método de pago
  if (!metodoPagoActual) {
    if (errEl) errEl.textContent = 'Selecciona un método de pago';
    return;
  }

  // Deshabilitar botón
  if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }

  try {
    var descuentoFinal = cuponAplicado ? cuponAplicado.descuento : 0;
    var codigoCupon    = cuponAplicado ? cuponAplicado.codigo    : null;

    var res = await fetch('/api/pedidos', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId:        uid,
        nombreUsuario:    nombre,
        correoUsuario:    email,
        metodoPago:       metodoPagoActual,
        descuento:        descuentoFinal,
        direccionEntrega: dir
      })
    });

    var data = await res.json();

    if (data.exito) {
      // Incrementar usoActual del cupón si se usó uno
      if (codigoCupon) {
        fetch('/api/cupones/usar', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ codigo: codigoCupon })
        }).catch(function() {}); // silencioso — el pedido ya se creó
        cuponAplicado = null;
      }
      // Mostrar overlay de éxito
      var idCorto = data.id ? data.id.toString().slice(-8).toUpperCase() : '';
      var idEl    = document.getElementById('exito-pedido-id');
      if (idEl && idCorto) idEl.textContent = 'Pedido #' + idCorto;

      var overlay = document.getElementById('overlay-exito');
      if (overlay) overlay.style.display = 'flex';

      // Limpiar carrito local
      carritoActual = { items: [] };
      sessionStorage.removeItem('uw-cupon');
      var contadorEl = document.getElementById('contador-carrito');
      if (contadorEl) contadorEl.textContent = '0';

    } else {
      var msg = data.error || data.mensaje || 'Error al procesar el pago';
      if (errEl) errEl.textContent = '❌ ' + msg;
      if (btn) { btn.disabled = false; btn.textContent = 'Confirmar y pagar →'; }
    }

  } catch(e) {
    console.error('Error en confirmarPago:', e);
    if (errEl) errEl.textContent = '❌ Error de conexión. Intenta de nuevo.';
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar y pagar →'; }
  }
}

// ── Guardar dirección en perfil ───────────────────────────────
async function guardarDireccionPerfil() {
  var uid      = localStorage.getItem('uw-id');
  var linea    = document.getElementById('dir-linea')?.value.trim()    || '';
  var telefono = document.getElementById('dir-telefono')?.value.trim() || '';
  var btn      = document.getElementById('btn-guardar-dir-perfil');

  if (!linea) return;
  if (!uid)   return;

  try {
    var res  = await fetch('/api/comprador/perfil', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuarioId: uid, direccion: linea, telefono: telefono })
    });
    var data = await res.json();
    if (data.exito && btn) {
      btn.textContent = '✓ Dirección guardada';
      btn.style.color = '#16a34a';
      setTimeout(function() {
        btn.textContent = '💾 Guardar esta dirección en mi perfil';
        btn.style.color = '';
      }, 2500);
    }
  } catch(e) { console.error('Error guardando dirección:', e); }
}

// ── Formatear tarjeta ─────────────────────────────────────────
function formatarTarjeta(inp) {
  var v = inp.value.replace(/\D/g, '').substring(0, 16);
  inp.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatarExp(inp) {
  var v = inp.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
  inp.value = v;
}


console.log('✅ scripts_Checkout.js cargado');
