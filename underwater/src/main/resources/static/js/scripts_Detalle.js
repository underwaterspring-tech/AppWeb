// ================================================================
// scripts_Detalle.js — Underwater Marketplace
// Producto dinámico + reseñas reales + control de roles
// ================================================================

var API_DETALLE = '/api/productos';
var productoActual = null;

function getSesionD() {
  return {
    id:     localStorage.getItem('uw-id'),
    nombre: localStorage.getItem('uw-nombre'),
    rol:    localStorage.getItem('uw-rol')
  };
}

document.addEventListener('DOMContentLoaded', function() {
  var params     = new URLSearchParams(window.location.search);
  var productoId = params.get('id');
  if (productoId) {
    cargarProductoDetalle(productoId);
  } else {
    inicializarInteractividad();
  }
});

// ================================================================
// CARGAR PRODUCTO
// ================================================================
async function cargarProductoDetalle(id) {
  try {
    var res = await fetch(API_DETALLE + '/' + id);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    productoActual = await res.json();
    poblarPagina(productoActual);
    cargarResenas(id);
    inicializarInteractividad();
    verificarSiEsFavorito(id);
    controlarRoles();
    // Cargar productos relacionados de la misma categoría
    cargarProductosRelacionados(id, productoActual.categoria);
  } catch(err) {
    console.error('Error cargando producto:', err);
    inicializarInteractividad();
    controlarRoles();
  }
}

// ================================================================
// CONTROL DE ROLES — vendedor no puede comprar
// ================================================================
function controlarRoles() {
  var rol = getSesionD().rol;
  if (rol === 'VENDEDOR' || rol === 'ADMIN') {
    var btnCarrito = document.getElementById('boton-agregar-al-carrito');
    var btnComprar = document.getElementById('boton-comprar-ahora');
    var btnFav     = document.getElementById('boton-favorito-accion');
    var secAcciones = document.getElementById('seccion-acciones-compra');
    if (btnCarrito) { btnCarrito.disabled = true; btnCarrito.textContent = 'Solo compradores'; btnCarrito.style.opacity = '0.4'; }
    if (btnComprar) { btnComprar.disabled = true; btnComprar.style.opacity = '0.4'; }
    if (btnFav)     { btnFav.style.display = 'none'; }
    // Mostrar aviso
    if (secAcciones) {
      var aviso = document.createElement('p');
      aviso.style.cssText = 'font-size:0.75rem;color:#64748B;margin-top:8px;font-style:italic';
      aviso.textContent = 'Los vendedores no pueden realizar compras.';
      secAcciones.appendChild(aviso);
    }
  }
}

// ================================================================
// POBLAR PÁGINA CON DATOS REALES
// ================================================================
function poblarPagina(p) {
  document.title = (p.nombre || 'Producto') + ' — Underwater';

  var setTxt = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val || ''; };

  setTxt('ruta-nombre-producto',     p.nombre);
  setTxt('nombre-empresa-vendedora', p.vendedorNombre || 'Tienda');
  setTxt('marca-detalle',            p.marca);
  setTxt('nombre-producto-detalle',  p.nombre);

  // Logo empresa
  var logoEl = document.getElementById('logo-empresa-vendedora');
  if (logoEl) logoEl.textContent = (p.vendedorNombre || 'UW').substring(0, 2).toUpperCase();

  // Link ver tienda
  var verTienda = document.getElementById('enlace-ver-tienda');
  if (verTienda && p.vendedorNombre) verTienda.href = '/catalogo?empresa=' + encodeURIComponent(p.vendedorNombre);

  // Descripción
  var descEl = document.querySelector('#contenido-descripcion .texto-descripcion');
  if (descEl && p.descripcion) descEl.textContent = p.descripcion;

  // Precio
  var tieneDesc  = p.precioDescuento != null && p.precioDescuento > 0 && p.precioDescuento < p.precio;
  var precAnt    = document.getElementById('precio-anterior-detalle');
  var precAct    = document.getElementById('precio-actual-detalle');
  var ahorro     = document.getElementById('porcentaje-descuento');
  var badge      = document.getElementById('badge-descuento-detalle');
  var fmt = function(v) { return '$' + parseInt(v||0).toLocaleString('es-CO'); };

  if (tieneDesc) {
    if (precAnt) { precAnt.textContent = fmt(p.precio); precAnt.style.display = ''; }
    if (precAct) precAct.textContent = fmt(p.precioDescuento);
    if (ahorro)  ahorro.textContent  = 'Ahorras ' + fmt(p.precio - p.precioDescuento);
    if (badge)   { badge.textContent = '-' + Math.round((1 - p.precioDescuento / p.precio) * 100) + '%'; badge.style.display = ''; }
  } else {
    if (precAnt) precAnt.style.display = 'none';
    if (precAct) precAct.textContent = fmt(p.precio);
    if (ahorro)  ahorro.style.display = 'none';
    if (badge)   badge.style.display  = 'none';
  }

  // Imagen principal
  var imgCont = document.getElementById('imagen-principal-producto');
  if (imgCont && p.imagenes && p.imagenes.length > 0) {
    imgCont.innerHTML = '<img src="' + p.imagenes[0] + '" alt="' + (p.nombre||'') + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display=\'none\'">';
  }

  // Miniaturas
  var minis = document.getElementById('miniaturas-galeria');
  if (minis && p.imagenes && p.imagenes.length > 0) {
    minis.innerHTML = '';
    p.imagenes.forEach(function(src, idx) {
      var div = document.createElement('div');
      div.className = 'miniatura-imagen' + (idx === 0 ? ' activa' : '');
      div.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover">';
      div.addEventListener('click', function() {
        minis.querySelectorAll('.miniatura-imagen').forEach(function(m){ m.classList.remove('activa'); });
        div.classList.add('activa');
        if (imgCont) {
          var img = imgCont.querySelector('img');
          if (img) img.src = src;
        }
      });
      minis.appendChild(div);
    });
  }

  // Tallas
  var contTallas = document.getElementById('opciones-talla-detalle');
  if (contTallas && p.tallas && p.tallas.length > 0) {
    contTallas.innerHTML = '';
    p.tallas.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className   = 'opcion-talla-detalle';
      btn.dataset.talla = t;
      btn.textContent   = t;
      contTallas.appendChild(btn);
    });
  }

  // Colores
  var MAPA_C = { negro:'#111',blanco:'#fff',rojo:'#c8452d',azul:'#1a3a6e',verde:'#2d6e2d',gris:'#888',morado:'#8b5cf6',naranja:'#f97316',rosa:'#ff6b6b',cafe:'#7c5c3e',amarillo:'#eab308' };
  var contColores = document.getElementById('opciones-color-detalle');
  if (contColores && p.colores && p.colores.length > 0) {
    contColores.innerHTML = '';
    p.colores.forEach(function(c, idx) {
      var btn = document.createElement('button');
      btn.className     = 'opcion-color-detalle' + (idx === 0 ? ' activo' : '');
      btn.dataset.color = c;
      btn.style.background = MAPA_C[c.toLowerCase()] || '#ccc';
      btn.title = c;
      if (c.toLowerCase() === 'blanco') btn.style.border = '2px solid #ccc';
      contColores.appendChild(btn);
    });
    var txtColor = document.getElementById('color-seleccionado-texto');
    if (txtColor) txtColor.textContent = p.colores[0];
  }

  // Stock
  var stockEl = document.getElementById('texto-stock-disponible');
  if (stockEl) stockEl.textContent = p.stock > 0 ? '✓ ' + p.stock + ' disponibles' : '⚠ Sin stock';

  // Valoración
  var numProm = document.getElementById('numero-promedio');
  var estProm = document.getElementById('estrellas-promedio');
  var numRes  = document.getElementById('numero-resenas');
  var txtRes  = document.getElementById('total-resenas-texto');
  if (numProm) numProm.textContent = (p.valoracionPromedio || 0).toFixed(1);
  if (numRes)  numRes.textContent  = (p.totalResenas || 0) + ' reseñas';
  if (txtRes)  txtRes.textContent  = (p.totalResenas || 0) + ' reseñas';
  if (estProm) {
    var k = Math.round(p.valoracionPromedio || 0);
    estProm.textContent = '★'.repeat(k) + '☆'.repeat(5 - k);
  }

  // Tab reseñas
  var tabResenas = document.querySelector('.tab-detalle[data-tab="resenas"]');
  if (tabResenas) tabResenas.textContent = 'Reseñas (' + (p.totalResenas || 0) + ')';
}

// ================================================================
// CARGAR RESEÑAS REALES
// ================================================================
async function cargarResenas(productoId) {
  var lista = document.getElementById('lista-resenas');
  var barras = document.getElementById('barras-valoracion');
  if (!lista) return;

  try {
    var res  = await fetch('/api/comprador/resenas?productoId=' + productoId);
    var data = await res.json();
    var resenas = data.resenas || [];
    var promedio = data.promedio || 0;
    var total    = data.total || 0;

    // Actualizar barras de valoración
    if (barras && total > 0) {
      var conteo = {1:0, 2:0, 3:0, 4:0, 5:0};
      resenas.forEach(function(r) { if (r.valoracion >= 1 && r.valoracion <= 5) conteo[r.valoracion]++; });
      [5,4,3,2,1].forEach(function(n) {
        var pct = total > 0 ? Math.round((conteo[n] / total) * 100) : 0;
        var fila = barras.querySelector('.fila-barra-valoracion:nth-child(' + (6-n) + ')');
        if (fila) {
          var relleno = fila.querySelector('.barra-valoracion-relleno');
          var pctEl   = fila.querySelector('.porcentaje-valoracion');
          if (relleno) relleno.style.width = pct + '%';
          if (pctEl)   pctEl.textContent   = pct + '%';
        }
      });
    }

    // Renderizar reseñas o estado vacío
    if (!resenas.length) {
      lista.innerHTML = '<div style="text-align:center;padding:40px;color:#64748B">'
        + '<p style="font-size:1.5rem;margin-bottom:8px">💬</p>'
        + '<p>Aún no hay reseñas. ¡Sé el primero en opinar!</p></div>';
    } else {
      var COLORES_AV = ['var(--color-rojo)','#f0b429','#2d6e2d','#1a3a6e','#8b5cf6'];
      lista.innerHTML = resenas.map(function(r, i) {
        var iniciales = (r.nombreUsuario||'U').split(' ').map(function(p){return p[0]||'';}).join('').substring(0,2).toUpperCase();
        var color     = COLORES_AV[i % COLORES_AV.length];
        var estrellas = '★'.repeat(r.valoracion) + '☆'.repeat(5 - r.valoracion);
        var fecha     = r.fechaResena ? new Date(r.fechaResena).toLocaleDateString('es-CO', {year:'numeric',month:'long',day:'numeric'}) : '';
        return '<div class="tarjeta-resena">'
          + '<div class="resena-encabezado">'
            + '<div class="resena-avatar" style="background:' + color + '">' + iniciales + '</div>'
            + '<div class="resena-autor-info">'
              + '<p class="resena-autor-nombre">' + (r.nombreUsuario||'Usuario') + '</p>'
              + '<p class="resena-fecha">' + fecha + '</p>'
            + '</div>'
            + '<div class="resena-estrellas" style="color:#f0b429">' + estrellas + '</div>'
          + '</div>'
          + '<p class="resena-texto">' + (r.comentario||'') + '</p>'
          + '</div>';
      }).join('');
    }

    // Formulario para escribir reseña (solo compradores logueados)
    agregarFormularioResena(productoId);

  } catch(err) {
    console.error('Error reseñas:', err);
    lista.innerHTML = '<p style="color:#64748B;text-align:center;padding:20px">Error cargando reseñas.</p>';
  }
}

// ================================================================
// FORMULARIO DE RESEÑA — solo para COMPRADORES logueados
// ================================================================
function agregarFormularioResena(productoId) {
  var s = getSesionD();
  if (!s.id || s.rol !== 'COMPRADOR') return;

  // Buscar el contenedor de reseñas, si no existe crear uno al final del producto
  var contResenas = document.getElementById('contenido-resenas');
  if (!contResenas) {
    contResenas = document.querySelector('#seccion-tabs-detalle') || document.querySelector('main') || document.body;
  }

  // Evitar duplicar
  if (document.getElementById('form-nueva-resena')) return;

  var form = document.createElement('div');
  form.id = 'form-nueva-resena';
  form.style.cssText = 'margin-bottom:32px;padding:24px;background:#F8FAFC;border:1px solid #E2E8F0';
  form.innerHTML = '<h3 style="font-family:var(--fuente-titulos);font-size:1.3rem;letter-spacing:0.04em;color:#0F172A;margin-bottom:16px">ESCRIBE TU RESEÑA</h3>'
    + '<div id="selector-estrellas-det" style="display:flex;gap:8px;margin-bottom:12px;font-size:2rem;cursor:pointer">'
      + '<span class="estrella-det" data-val="1" style="color:#444">★</span>'
      + '<span class="estrella-det" data-val="2" style="color:#444">★</span>'
      + '<span class="estrella-det" data-val="3" style="color:#444">★</span>'
      + '<span class="estrella-det" data-val="4" style="color:#444">★</span>'
      + '<span class="estrella-det" data-val="5" style="color:#444">★</span>'
    + '</div>'
    + '<p id="texto-val-det" style="font-size:0.8rem;color:#64748B;margin-bottom:14px">Selecciona una valoración</p>'
    + '<textarea id="comentario-resena-det" rows="4" placeholder="Cuéntanos tu experiencia con este producto..." style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);font-size:0.88rem;padding:12px 16px;resize:vertical;outline:none;box-sizing:border-box"></textarea>'
    + '<p id="error-resena-det" style="color:#e05252;font-size:0.78rem;margin-top:6px;display:none"></p>'
    + '<button id="btn-publicar-resena-det" style="margin-top:12px;padding:12px 28px;background:#F97316;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.82rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Publicar reseña</button>';

  // Insertar ANTES de la lista
  var lista = document.getElementById('lista-resenas');
  contResenas.insertBefore(form, lista);

  // Lógica de estrellas
  var valElegida = 0;
  var textos = {1:'😞 Muy malo',2:'😐 Regular',3:'🙂 Bueno',4:'😊 Muy bueno',5:'🤩 Excelente'};
  var estrellas = form.querySelectorAll('.estrella-det');

  estrellas.forEach(function(est) {
    est.addEventListener('mouseover', function() {
      var v = parseInt(this.dataset.val);
      estrellas.forEach(function(e) { e.style.color = parseInt(e.dataset.val) <= v ? '#f0b429' : '#444'; });
      document.getElementById('texto-val-det').textContent = textos[v] || '';
    });
    est.addEventListener('mouseout', function() {
      estrellas.forEach(function(e) { e.style.color = parseInt(e.dataset.val) <= valElegida ? '#f0b429' : '#444'; });
      document.getElementById('texto-val-det').textContent = valElegida > 0 ? textos[valElegida] : 'Selecciona una valoración';
    });
    est.addEventListener('click', function() {
      valElegida = parseInt(this.dataset.val);
      estrellas.forEach(function(e) { e.style.color = parseInt(e.dataset.val) <= valElegida ? '#f0b429' : '#444'; });
      document.getElementById('texto-val-det').textContent = textos[valElegida];
    });
  });

  // Publicar reseña
  document.getElementById('btn-publicar-resena-det').addEventListener('click', async function() {
    var comentario = document.getElementById('comentario-resena-det').value.trim();
    var errEl      = document.getElementById('error-resena-det');
    if (valElegida === 0) { errEl.textContent='Selecciona una valoración'; errEl.style.display='block'; return; }
    if (!comentario)      { errEl.textContent='Escribe un comentario'; errEl.style.display='block'; return; }
    errEl.style.display = 'none';
    this.disabled = true; this.textContent = 'Publicando...';

    try {
      var res  = await fetch('/api/comprador/resenas', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ usuarioId: s.id, productoId: productoId, nombreUsuario: s.nombre, valoracion: valElegida, comentario: comentario })
      });
      var data = await res.json();
      if (data.exito) {
        form.innerHTML = '<div style="text-align:center;padding:20px;color:#4caf50"><p style="font-size:1.5rem">⭐</p><p style="font-weight:700">¡Reseña publicada! Gracias por tu opinión.</p></div>';
        cargarResenas(productoId);
      } else {
        errEl.textContent = data.mensaje || 'Error al publicar'; errEl.style.display='block';
        this.disabled = false; this.textContent = 'Publicar reseña';
      }
    } catch(e) {
      errEl.textContent = 'Error de conexión'; errEl.style.display='block';
      this.disabled = false; this.textContent = 'Publicar reseña';
    }
  });
}

// ================================================================
// INTERACTIVIDAD — tallas, colores, carrito, favoritos
// ================================================================
function inicializarInteractividad() {
  // Colores
  var opcionesColor = document.querySelectorAll('.opcion-color-detalle');
  var txtColor      = document.getElementById('color-seleccionado-texto');
  opcionesColor.forEach(function(op) {
    op.addEventListener('click', function() {
      opcionesColor.forEach(function(o){ o.classList.remove('activo'); });
      op.classList.add('activo');
      if (txtColor) txtColor.textContent = op.dataset.color;
    });
  });

  // Tallas
  var opcionesTalla = document.querySelectorAll('.opcion-talla-detalle');
  var txtTalla      = document.getElementById('talla-seleccionada-texto');
  var btnAgregar    = document.getElementById('boton-agregar-al-carrito');
  var btnComprar    = document.getElementById('boton-comprar-ahora');
  var tallaElegida  = null;

  opcionesTalla.forEach(function(op) {
    op.addEventListener('click', function() {
      opcionesTalla.forEach(function(o){ o.classList.remove('activo'); });
      op.classList.add('activo');
      tallaElegida = op.dataset.talla;
      if (txtTalla)   txtTalla.textContent = 'Talla ' + tallaElegida;
      if (btnAgregar) { btnAgregar.disabled = false; btnAgregar.textContent = '+ Agregar al carrito'; }
      if (btnComprar) btnComprar.disabled = false;
    });
  });

  // Cantidad
  var btnRestar   = document.getElementById('boton-restar-cantidad');
  var btnSumar    = document.getElementById('boton-sumar-cantidad');
  var txtCantidad = document.getElementById('cantidad-seleccionada');
  var cantidad    = 1;
  if (btnSumar)  btnSumar.addEventListener('click',  function() { if (cantidad < 10) { cantidad++; if (txtCantidad) txtCantidad.textContent = cantidad; } });
  if (btnRestar) btnRestar.addEventListener('click', function() { if (cantidad > 1)  { cantidad--; if (txtCantidad) txtCantidad.textContent = cantidad; } });

  // AGREGAR AL CARRITO
  if (btnAgregar) {
    btnAgregar.addEventListener('click', async function() {
      var s = getSesionD();
      if (!s.id) { window.location.href = '/login'; return; }
      if (s.rol === 'VENDEDOR' || s.rol === 'ADMIN') return;
      if (!tallaElegida) { alert('Selecciona una talla'); return; }

      var colorActivo  = document.querySelector('.opcion-color-detalle.activo');
      var colorElegido = colorActivo ? colorActivo.dataset.color : '';
      var productoId   = productoActual ? (productoActual.id || productoActual._id) : new URLSearchParams(window.location.search).get('id');

      try {
        var res  = await fetch('/api/carrito/agregar', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ usuarioId:s.id, productoId:productoId, talla:tallaElegida, color:colorElegido, cantidad:cantidad })
        });
        var data = await res.json();
        if (data.exito) {
          var orig = this.textContent;
          this.textContent = '✓ ¡Agregado!'; this.style.background = '#2d6e2d';
          var totalItems = (data.carrito && data.carrito.items || []).reduce(function(s,i){ return s+i.cantidad; }, 0);
          var cont = document.getElementById('contador-carrito');
          if (cont) cont.textContent = totalItems;
          setTimeout(function() { btnAgregar.textContent = orig; btnAgregar.style.background = ''; }, 2000);
        }
      } catch(err) { console.error('Error carrito:', err); }
    });
  }

  // COMPRAR AHORA
  if (btnComprar) {
    btnComprar.addEventListener('click', function() {
      var s = getSesionD();
      if (!s.id) { window.location.href = '/login'; return; }
      if (!tallaElegida) { alert('Selecciona una talla'); return; }
      window.location.href = '/checkout';
    });
  }

  // FAVORITO
  var btnFavDet = document.getElementById('boton-favorito-detalle');
  var btnFavAcc = document.getElementById('boton-favorito-accion');
  var esFav     = false;

  async function toggleFavorito() {
    var s = getSesionD();
    if (!s.id) { window.location.href = '/login'; return; }
    var productoId = productoActual
      ? String(productoActual.id || productoActual._id || '')
      : new URLSearchParams(window.location.search).get('id');
    if (!productoId) { console.warn('Sin productoId'); return; }

    esFav = !esFav;
    if (btnFavDet) btnFavDet.textContent = esFav ? '❤️' : '♡';
    if (btnFavAcc) btnFavAcc.textContent = esFav ? '❤️ Guardado' : '♡ Guardar';
    if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos(esFav ? +1 : -1);

    try {
      var metodo = esFav ? 'POST' : 'DELETE';
      var res = await fetch('/api/favoritos', {
        method: metodo,
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ usuarioId: s.id, productoId: productoId })
      });
      var data = await res.json();
      if (!data.exito) {
        // Revertir si falló
        esFav = !esFav;
        if (btnFavDet) btnFavDet.textContent = esFav ? '❤️' : '♡';
        if (btnFavAcc) btnFavAcc.textContent = esFav ? '❤️ Guardado' : '♡ Guardar';
        if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos(esFav ? +1 : -1);
        console.error('Error favorito:', data);
      }
    } catch(err) {
      esFav = !esFav;
      if (btnFavDet) btnFavDet.textContent = esFav ? '❤️' : '♡';
      if (btnFavAcc) btnFavAcc.textContent = esFav ? '❤️ Guardado' : '♡ Guardar';
      if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos(esFav ? +1 : -1);
      console.error('Error favorito:', err);
    }
  }

  if (btnFavDet) btnFavDet.addEventListener('click', toggleFavorito);
  if (btnFavAcc) btnFavAcc.addEventListener('click', toggleFavorito);

  // Si no hay usuario logueado, mostrar tooltip en favoritos
  var s = getSesionD();
  if (!s.id) {
    if (btnFavDet) { btnFavDet.title = 'Inicia sesión para guardar'; }
    if (btnFavAcc) { btnFavAcc.title = 'Inicia sesión para guardar'; }
  }

  // TABS
  var tabsDet   = document.querySelectorAll('.tab-detalle');
  var contsTabs = document.querySelectorAll('.contenido-tab');
  tabsDet.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabsDet.forEach(function(t){ t.classList.remove('activo'); });
      contsTabs.forEach(function(c){ c.style.display = 'none'; });
      tab.classList.add('activo');
      var cont = document.getElementById('contenido-' + tab.dataset.tab);
      if (cont) cont.style.display = 'block';
    });
  });
}

// Verificar si ya es favorito
async function verificarSiEsFavorito(productoId) {
  var s = getSesionD();
  if (!s.id) return;
  try {
    var res  = await fetch('/api/favoritos/check?usuarioId=' + s.id + '&productoId=' + productoId);
    var data = await res.json();
    if (data.esFavorito) {
      var btnFavDet = document.getElementById('boton-favorito-detalle');
      var btnFavAcc = document.getElementById('boton-favorito-accion');
      if (btnFavDet) btnFavDet.textContent = '❤️';
      if (btnFavAcc) btnFavAcc.textContent = '❤️ Guardado';
    }
  } catch(e) {}
}

console.log('✅ scripts_Detalle.js cargado');

// ================================================================
// PRODUCTOS RELACIONADOS — misma categoría, excluyendo el actual
// ================================================================
async function cargarProductosRelacionados(productoId, categoria) {
  var grilla = document.getElementById('grilla-productos-relacionados');
  if (!grilla) return;

  var FONDOS = ['#f0ece4','#e8f0e8','#f0e8e8','#e8eaf0','#faf0e8','#e8f4f0','#f4e8f0','#e8ecf0'];
  var MAPA_C = { negro:'#111',blanco:'#fff',rojo:'#c8452d',azul:'#1a3a6e',verde:'#2d6e2d',gris:'#888',morado:'#8b5cf6',naranja:'#f97316',rosa:'#ff6b6b',cafe:'#7c5a3c',amarillo:'#eab308' };

  try {
    // Traer productos de la misma categoría
    var url = '/api/productos?tamano=20&pagina=0';
    if (categoria) url += '&categoria=' + encodeURIComponent(categoria);
    var res  = await fetch(url);
    var data = await res.json();
    var todos = Array.isArray(data) ? data : (data.productos || []);

    // Filtrar el producto actual y tomar máximo 4
    var relacionados = todos
      .filter(function(p) { return String(p.id||p._id) !== String(productoId); })
      .slice(0, 4);

    // Si no hay suficientes de la misma categoría, completar con cualquier producto
    if (relacionados.length < 4) {
      var res2  = await fetch('/api/productos?tamano=10&pagina=0');
      var data2 = await res2.json();
      var otros = Array.isArray(data2) ? data2 : (data2.productos || []);
      otros.forEach(function(p) {
        if (relacionados.length >= 4) return;
        var id = String(p.id||p._id);
        var yaEsta = id === String(productoId) || relacionados.some(function(r){ return String(r.id||r._id) === id; });
        if (!yaEsta) relacionados.push(p);
      });
    }

    if (!relacionados.length) {
      grilla.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748B;padding:20px">No hay productos relacionados.</p>';
      return;
    }

    grilla.innerHTML = relacionados.map(function(p, i) {
      var id         = String(p.id || p._id);
      var precio     = parseFloat(p.precio || 0);
      var desc       = parseFloat(p.precioDescuento || 0);
      var tieneDesc  = desc > 0 && desc < precio;
      var fondo      = FONDOS[i % FONDOS.length];
      var imgs       = p.imagenes || [];
      var imgHTML    = imgs.length > 0
        ? '<img src="' + imgs[0] + '" alt="' + (p.nombre||'') + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">'
        : '<span style="font-size:3rem">👟</span>';
      var precioHTML = tieneDesc
        ? '<span class="precio-tachado">$' + parseInt(precio).toLocaleString('es-CO') + '</span><span class="precio-oferta">$' + parseInt(desc).toLocaleString('es-CO') + '</span>'
        : '$' + parseInt(precio).toLocaleString('es-CO');
      var etiqueta = tieneDesc
        ? '<span class="etiqueta-producto etiqueta-oferta">-' + Math.round((1-desc/precio)*100) + '%</span>'
        : '<span class="etiqueta-producto etiqueta-nuevo">Nuevo</span>';
      var cols = (p.colores||[]).slice(0,3).map(function(c){
        var bg = MAPA_C[c.toLowerCase()]||'#ccc';
        return '<div class="circulo-color" style="background:'+bg+'"></div>';
      }).join('');
      var rating = p.valoracionPromedio || 0;
      var estrellas = '★'.repeat(Math.round(rating)) + '☆'.repeat(5-Math.round(rating));

      return '<div class="tarjeta-producto" style="cursor:pointer" onclick="window.location.href=\'/detalle?id='+id+'\'">'
        + '<div class="imagen-producto" style="background:'+fondo+'">'
          + etiqueta + imgHTML
          + '<button class="boton-agregar-carrito" onclick="event.stopPropagation();agregarRelacionado(\''+id+'\',this)">+ Agregar al carrito</button>'
        + '</div>'
        + '<div class="detalle-producto">'
          + '<p class="vendedor-producto">por <a href="#" class="enlace-vendedor">' + (p.vendedorNombre||'Tienda') + '</a></p>'
          + '<p class="marca-producto">' + (p.marca||'') + '</p>'
          + '<p class="nombre-producto">' + (p.nombre||'—') + '</p>'
          + '<div class="estrellas-valoracion"><span class="estrellas">' + estrellas + '</span></div>'
          + '<div class="pie-producto"><div class="precio-producto">' + precioHTML + '</div><div class="colores-disponibles">' + cols + '</div></div>'
        + '</div>'
      + '</div>';
    }).join('');

  } catch(err) {
    console.error('Error productos relacionados:', err);
    grilla.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748B;padding:20px">Error cargando productos.</p>';
  }
}

async function agregarRelacionado(productoId, btn) {
  var s = getSesionD();
  if (!s.id) { window.location.href = '/login'; return; }
  if (s.rol === 'VENDEDOR' || s.rol === 'ADMIN') return;
  // Usar modal global de talla/color
  if (typeof agregarAlCarrito === 'function') {
    agregarAlCarrito(productoId, btn);
  } else {
    var orig = btn.textContent; btn.textContent = '...'; btn.disabled = true;
    try {
      var res = await fetch('/api/carrito/agregar', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({usuarioId:s.id, productoId:productoId, talla:'', color:'', cantidad:1})
      });
      var data = await res.json();
      if (data.exito) {
        btn.textContent='✓'; btn.style.background='#16a34a';
        var cont=document.getElementById('contador-carrito');
        if(cont) cont.textContent=(data.carrito&&data.carrito.items||[]).reduce(function(s,i){return s+i.cantidad;},0);
        setTimeout(function(){btn.textContent=orig;btn.style.background='';btn.disabled=false;},1500);
      } else { btn.textContent=orig; btn.disabled=false; }
    } catch(e) { btn.textContent=orig; btn.disabled=false; }
  }
}