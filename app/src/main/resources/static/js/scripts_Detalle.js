

var API_URL_DETALLE = '/api/productos';

// ----------------------------------------------------------------
// INICIALIZACIÓN: leer ?id= y cargar producto
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  var params     = new URLSearchParams(window.location.search);
  var productoId = params.get('id');

  if (productoId) {
    cargarProductoDetalle(productoId);
  } else {
    // Sin id → página funciona con el HTML estático (producto de prueba)
    console.warn('No se encontró ?id= en la URL. Mostrando datos estáticos.');
    inicializarInteractividad();
  }
});


// ----------------------------------------------------------------
// CARGAR PRODUCTO DESDE BACKEND
// ----------------------------------------------------------------
async function cargarProductoDetalle(productoId) {
  try {
    var res = await fetch(API_URL_DETALLE + '/' + productoId);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var p = await res.json();
    poblarPagina(p);
    inicializarInteractividad();
  } catch (err) {
    console.error('Error cargando producto:', err);
    // Muestra un aviso no intrusivo y deja el HTML estático visible
    var aviso = document.createElement('p');
    aviso.textContent = '⚠ No se pudo cargar el producto (id: ' + productoId + ')';
    aviso.style.cssText = 'color:#c8452d;text-align:center;padding:1rem';
    var seccion = document.getElementById('seccion-detalle-producto');
    if (seccion) seccion.prepend(aviso);
    inicializarInteractividad();
  }
}


// ----------------------------------------------------------------
// POBLAR LA PÁGINA CON LOS DATOS DEL BACKEND
// ----------------------------------------------------------------
function poblarPagina(p) {
  // ── Título del navegador ──
  document.title = (p.nombre || 'Producto') + ' — NexoShop';

  // ── Breadcrumb ──
  var rutaNombre = document.getElementById('ruta-nombre-producto');
  if (rutaNombre) rutaNombre.textContent = p.nombre || '';

  // ── Empresa / vendedor ──
  var nombreEmpresa = document.getElementById('nombre-empresa-vendedora');
  if (nombreEmpresa) nombreEmpresa.textContent = p.vendedorNombre || p.vendedorId || 'NexoShop';

  // ── Marca y nombre ──
  var marcaEl = document.getElementById('marca-detalle');
  if (marcaEl) marcaEl.textContent = p.marca || '';

  var nombreEl = document.getElementById('nombre-producto-detalle');
  if (nombreEl) nombreEl.textContent = p.nombre || '';

  // ── Descripción ──
  var descEl = document.querySelector('#contenido-descripcion .texto-descripcion');
  if (descEl && p.descripcion) descEl.textContent = p.descripcion;

  // ── Precio ──
  var tieneDescuento = p.precioDescuento != null && p.precioDescuento > 0 && p.precioDescuento < p.precio;
  var precioAnterior = document.getElementById('precio-anterior-detalle');
  var precioActual   = document.getElementById('precio-actual-detalle');
  var ahorro         = document.getElementById('porcentaje-descuento');

  if (tieneDescuento) {
    if (precioAnterior) { precioAnterior.textContent = '$' + fmt(p.precio); precioAnterior.style.display = ''; }
    if (precioActual)   precioActual.textContent = '$' + fmt(p.precioDescuento);
    if (ahorro) {
      var diff = p.precio - p.precioDescuento;
      ahorro.textContent = 'Ahorras $' + fmt(diff);
    }
  } else {
    if (precioAnterior) precioAnterior.style.display = 'none';
    if (precioActual)   precioActual.textContent = '$' + fmt(p.precio);
    if (ahorro)         ahorro.style.display = 'none';
  }

  // ── Descuento badge ──
  var badge = document.getElementById('badge-descuento-detalle');
  if (badge) {
    if (tieneDescuento) {
      badge.textContent = '-' + Math.round((1 - p.precioDescuento / p.precio) * 100) + '%';
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ── Imagen principal ──
  var contenedorImg = document.getElementById('imagen-principal-producto');
  if (contenedorImg && p.imagenes && p.imagenes.length > 0) {
    contenedorImg.innerHTML =
      '<img src="' + p.imagenes[0] + '" alt="' + (p.nombre||'') + '" ' +
      'style="width:100%;height:100%;object-fit:cover;border-radius:inherit" ' +
      'onerror="this.style.display=\'none\'">';
  }

  // ── Miniaturas ──
  var miniaturas = document.getElementById('miniaturas-galeria');
  if (miniaturas && p.imagenes && p.imagenes.length > 0) {
    miniaturas.innerHTML = '';
    p.imagenes.forEach(function(src, idx) {
      var div = document.createElement('div');
      div.className = 'miniatura-imagen' + (idx === 0 ? ' activa' : '');
      div.dataset.imagen = idx;
      div.dataset.src = src;
      div.innerHTML = '<img src="' + src + '" alt="Vista ' + (idx+1) + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">';
      miniaturas.appendChild(div);
    });
    // Registrar clics de miniaturas con imágenes reales
    miniaturas.querySelectorAll('.miniatura-imagen').forEach(function(min) {
      min.addEventListener('click', function() {
        miniaturas.querySelectorAll('.miniatura-imagen').forEach(function(m){ m.classList.remove('activa'); });
        min.classList.add('activa');
        if (contenedorImg) {
          var img = contenedorImg.querySelector('img');
          if (img) img.src = min.dataset.src;
        }
      });
    });
  }

  // ── Tallas ──
  var contenedorTallas = document.getElementById('opciones-talla-detalle');
  if (contenedorTallas && p.tallas && p.tallas.length > 0) {
    contenedorTallas.innerHTML = '';
    p.tallas.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className = 'opcion-talla-detalle';
      btn.dataset.talla = t;
      btn.textContent = t;
      contenedorTallas.appendChild(btn);
    });
  }

  // ── Colores ──
  var contenedorColores = document.getElementById('opciones-color-detalle');
  if (contenedorColores && p.colores && p.colores.length > 0) {
    contenedorColores.innerHTML = '';
    p.colores.forEach(function(c, idx) {
      var btn = document.createElement('button');
      btn.className = 'opcion-color-detalle' + (idx === 0 ? ' activo' : '');
      btn.dataset.color = c;
      btn.style.background = colorACss(c);
      btn.title = c;
      if (c.toLowerCase() === 'blanco') btn.style.border = '2px solid #ccc';
      contenedorColores.appendChild(btn);
    });
    // Texto color inicial
    var textoColor = document.getElementById('color-seleccionado-texto');
    if (textoColor && p.colores[0]) textoColor.textContent = p.colores[0];
  }

  // ── Stock ──
  var stockEl = document.getElementById('texto-stock-disponible');
  if (stockEl) {
    if (p.stock > 0) {
      stockEl.textContent = '✓ ' + p.stock + ' unidades disponibles';
    } else {
      stockEl.textContent = '⚠ Sin stock disponible';
    }
  }

  // ── Valoración ──
  if (p.valoracionPromedio) {
    var estrellasEl = document.getElementById('estrellas-producto');
    if (estrellasEl) {
      var n = Math.round(p.valoracionPromedio);
      var s = '';
      for (var i=0;i<n;i++) s+='★';
      for (var i=n;i<5;i++) s+='☆';
      estrellasEl.textContent = s;
    }
  }

  // ── Logo empresa (iniciales) ──
  var logoEmpresa = document.getElementById('logo-empresa-vendedora');
  if (logoEmpresa) {
    var nombre = p.vendedorNombre || p.vendedorId || 'NS';
    logoEmpresa.textContent = nombre.substring(0, 2).toUpperCase();
  }
}


// ----------------------------------------------------------------
// INTERACTIVIDAD (igual que antes, ahora reutiliza los elementos
// que poblarPagina() ya actualizó, o los estáticos del HTML)
// ----------------------------------------------------------------
function inicializarInteractividad() {

  // Galería de miniaturas (si no fueron reemplazadas por imágenes reales)
  var miniaturasGaleria    = document.querySelectorAll('.miniatura-imagen[data-imagen]');
  var emojiPrincipal       = document.getElementById('emoji-imagen-principal');
  var imagenesProducto     = ['👟', '👟', '👟', '👟'];

  miniaturasGaleria.forEach(function(miniatura) {
    if (miniatura.dataset.src) return; // ya tiene handler con imagen real
    miniatura.addEventListener('click', function() {
      miniaturasGaleria.forEach(function(m){ m.classList.remove('activa'); });
      miniatura.classList.add('activa');
      var indice = parseInt(miniatura.dataset.imagen);
      if (emojiPrincipal) emojiPrincipal.textContent = imagenesProducto[indice] || '👟';
    });
  });

  // Selector de color
  var opcionesColor          = document.querySelectorAll('.opcion-color-detalle');
  var textoColorSeleccionado = document.getElementById('color-seleccionado-texto');
  opcionesColor.forEach(function(opcion) {
    opcion.addEventListener('click', function() {
      opcionesColor.forEach(function(o){ o.classList.remove('activo'); });
      opcion.classList.add('activo');
      if (textoColorSeleccionado) textoColorSeleccionado.textContent = opcion.dataset.color;
    });
  });

  // Selector de talla
  var opcionesTalla          = document.querySelectorAll('.opcion-talla-detalle:not(.sin-stock)');
  var textoTallaSeleccionada = document.getElementById('talla-seleccionada-texto');
  var botonAgregarCarrito    = document.getElementById('boton-agregar-al-carrito');
  var botonComprarAhora      = document.getElementById('boton-comprar-ahora');
  var tallaElegida           = null;

  opcionesTalla.forEach(function(opcion) {
    opcion.addEventListener('click', function() {
      opcionesTalla.forEach(function(o){ o.classList.remove('activo'); });
      opcion.classList.add('activo');
      tallaElegida = opcion.dataset.talla;
      if (textoTallaSeleccionada) textoTallaSeleccionada.textContent = 'Talla ' + tallaElegida;
      if (botonAgregarCarrito) { botonAgregarCarrito.disabled = false; botonAgregarCarrito.textContent = '+ Agregar al carrito'; }
      if (botonComprarAhora)   botonComprarAhora.disabled = false;
    });
  });

  // Control de cantidad
  var botonRestar     = document.getElementById('boton-restar-cantidad');
  var botonSumar      = document.getElementById('boton-sumar-cantidad');
  var textoCantidad   = document.getElementById('cantidad-seleccionada');
  var stockMaximo     = parseInt((document.getElementById('texto-stock-disponible') || {}).textContent || '99') || 99;
  var cantidadElegida = 1;

  if (botonSumar) botonSumar.addEventListener('click', function() {
    if (cantidadElegida < stockMaximo) { cantidadElegida++; if (textoCantidad) textoCantidad.textContent = cantidadElegida; }
  });
  if (botonRestar) botonRestar.addEventListener('click', function() {
    if (cantidadElegida > 1) { cantidadElegida--; if (textoCantidad) textoCantidad.textContent = cantidadElegida; }
  });

  // Agregar al carrito
  if (botonAgregarCarrito) {
    botonAgregarCarrito.addEventListener('click', function() {
      if (!tallaElegida) return;
      var colorActivo = document.querySelector('.opcion-color-detalle.activo');
      var colorElegido = colorActivo ? colorActivo.dataset.color : '—';
      console.log('Carrito:', { talla: tallaElegida, color: colorElegido, cantidad: cantidadElegida });

      var textoOriginal = botonAgregarCarrito.textContent;
      botonAgregarCarrito.textContent = '✓ ¡Agregado!';
      botonAgregarCarrito.style.background = '#2d6e2d';
      var contador = document.getElementById('contador-carrito');
      if (contador) contador.textContent = parseInt(contador.textContent || '0') + cantidadElegida;
      setTimeout(function() {
        botonAgregarCarrito.textContent = textoOriginal;
        botonAgregarCarrito.style.background = '';
      }, 2000);
      // TODO: POST /api/carrito
    });
  }

  // Comprar ahora
  if (botonComprarAhora) {
    botonComprarAhora.addEventListener('click', function() {
      if (!tallaElegida) return;
      window.location.href = 'carrito.html';
    });
  }

  // Favorito
  var botonFavoritoDetalle = document.getElementById('boton-favorito-detalle');
  var botonFavoritoAccion  = document.getElementById('boton-favorito-accion');
  var esFavorito = false;
  function toggleFavorito() {
    esFavorito = !esFavorito;
    if (botonFavoritoDetalle) botonFavoritoDetalle.textContent = esFavorito ? '❤️' : '♡';
    if (botonFavoritoAccion)  botonFavoritoAccion.textContent  = esFavorito ? '❤️ Guardado' : '♡ Guardar';
    // TODO: POST/DELETE /api/favoritos
  }
  if (botonFavoritoDetalle) botonFavoritoDetalle.addEventListener('click', toggleFavorito);
  if (botonFavoritoAccion)  botonFavoritoAccion.addEventListener('click', toggleFavorito);

  // Tabs
  var tabsDetalle    = document.querySelectorAll('.tab-detalle');
  var contenidosTabs = document.querySelectorAll('.contenido-tab');
  tabsDetalle.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabsDetalle.forEach(function(t){ t.classList.remove('activo'); });
      contenidosTabs.forEach(function(c){ c.style.display = 'none'; });
      tab.classList.add('activo');
      var contenido = document.getElementById('contenido-' + tab.dataset.tab);
      if (contenido) contenido.style.display = 'block';
    });
  });

  // Enlace a reseñas
  var enlaceResenas = document.getElementById('numero-resenas');
  if (enlaceResenas) {
    enlaceResenas.addEventListener('click', function() {
      var tabResenas = document.querySelector('.tab-detalle[data-tab="resenas"]');
      if (tabResenas) tabResenas.click();
      var seccionTabs = document.getElementById('seccion-tabs-detalle');
      if (seccionTabs) seccionTabs.scrollIntoView({ behavior: 'smooth' });
    });
  }

  console.log('✅ scripts_Detalle.js inicializado');
}


// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------
function fmt(v) { return parseInt(v).toLocaleString('es-CO'); }

function colorACss(n) {
  var m = { negro:'#111', blanco:'#fff', rojo:'#c8452d', azul:'#1a3a6e',
            verde:'#2d6e2d', gris:'#888', morado:'#8b5cf6', cafe:'#7c5a3c',
            naranja:'#e67e22', rosa:'#ff6b6b', amarillo:'#f1c40f' };
  return m[(n||'').toLowerCase()] || '#ccc';
}