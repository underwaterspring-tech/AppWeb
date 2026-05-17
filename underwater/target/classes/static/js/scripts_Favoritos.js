// ── GUARD: Usuario logueado ─────────────────────────────────────
(function() {
  var id = localStorage.getItem('uw-id');
  if (!id) { window.location.replace('/login'); throw new Error('No autenticado'); }
})();

// ================================================================
// scripts_Favoritos.js — Underwater Marketplace
// Carga y gestiona los favoritos del usuario
// ================================================================

var FONDOS_FAV = ['#f0ece4','#faf0e8','#f4e8f0','#e8f0e8','#e8eaf0'];
var COLORES_FAV = {
  negro:'#111', blanco:'#fff', rojo:'#c8452d', azul:'#1a3a6e',
  verde:'#2d6e2d', gris:'#888', rosado:'#e91e8c', morado:'#8b5cf6',
  naranja:'#f97316', amarillo:'#eab308', cafe:'#7c5c3e'
};

window.addEventListener('load', function() {
  cargarFavoritos();
});

async function cargarFavoritos() {
  var usuarioId = localStorage.getItem('uw-id');
  var grilla    = document.getElementById('grilla-favoritos');
  var vacio     = document.getElementById('favoritos-vacio');
  var sinSesion = document.getElementById('fav-sin-sesion');
  var sub       = document.getElementById('subtitulo-pagina-comprador');

  if (!usuarioId) {
    if (sinSesion) sinSesion.style.display = 'block';
    return;
  }

  try {
    var res  = await fetch('/api/favoritos?usuarioId=' + usuarioId);
    var favs = await res.json();

    if (!favs || favs.length === 0) {
      if (vacio) vacio.style.display = 'block';
      if (sub)   sub.textContent = '0 favoritos';
      return;
    }

    if (sub) sub.textContent = favs.length + ' producto' + (favs.length !== 1 ? 's' : '') + ' guardado' + (favs.length !== 1 ? 's' : '');

    grilla.innerHTML = favs.map(function(f, i) {
      var precio   = (f.precioDescuento && f.precioDescuento > 0) ? f.precioDescuento : f.precio;
      var original = (f.precioDescuento && f.precioDescuento > 0) ? f.precio : null;
      var fondo    = FONDOS_FAV[i % FONDOS_FAV.length];

      var colores = (f.colores || []).slice(0, 3).map(function(c) {
        var k  = c.toLowerCase();
        var bg = COLORES_FAV[k] || '#ccc';
        var b  = k === 'blanco' ? 'border:2px solid #ddd;' : '';
        return '<div class="circulo-color" style="background:' + bg + ';' + b + '"></div>';
      }).join('');

      var imgHTML = (f.imagenes && f.imagenes.length > 0)
        ? '<img src="' + f.imagenes[0] + '" alt="' + (f.nombre || '') + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">'
        : '<span style="font-size:3.5rem">&#128095;</span>';

      var etiqueta = original
        ? '<span class="etiqueta-producto etiqueta-oferta">-' + Math.round((1 - precio / original) * 100) + '%</span>'
        : '<span class="etiqueta-producto etiqueta-popular">Top</span>';

      var precioHTML = original
        ? '<span style="text-decoration:line-through;color:#64748B;font-size:0.8em;margin-right:6px">$' + Number(original).toLocaleString('es-CO') + '</span>$' + Number(precio || 0).toLocaleString('es-CO')
        : '$' + Number(precio || 0).toLocaleString('es-CO');

      return '<div class="tarjeta-favorito revelar" data-producto-id="' + f.productoId + '">'
        + '<div class="tarjeta-producto" onclick="window.location.href=\'/detalle?id=' + f.productoId + '\'" style="cursor:pointer">'
          + '<div class="imagen-producto" style="background:' + fondo + '">'
            + etiqueta
            + imgHTML
            + '<button class="boton-agregar-carrito" onclick="event.stopPropagation();agregarFavCarrito(\'' + f.productoId + '\',this)">+ Agregar al carrito</button>'
          + '</div>'
          + '<div class="detalle-producto">'
            + '<p class="vendedor-producto">por <a href="#" class="enlace-vendedor">' + (f.vendedorNombre || 'Tienda') + '</a></p>'
            + '<p class="marca-producto">' + (f.marca || '') + '</p>'
            + '<p class="nombre-producto">' + (f.nombre || '—') + '</p>'
            + '<div class="pie-producto">'
              + '<div class="precio-producto">' + precioHTML + '</div>'
              + '<div class="colores-disponibles">' + colores + '</div>'
            + '</div>'
          + '</div>'
        + '</div>'
        + '<button class="btn-quitar-favorito" onclick="quitarFavorito(\'' + f.productoId + '\',this)">&#10005; Quitar</button>'
      + '</div>';
    }).join('');

    setTimeout(function() {
      document.querySelectorAll('.revelar').forEach(function(el) {
        el.classList.add('visible');
      });
    }, 100);

  } catch(err) {
    console.error('Error favoritos:', err);
    if (grilla) grilla.innerHTML = '<p style="text-align:center;color:#64748B;padding:40px">Error cargando favoritos.</p>';
  }
}

async function quitarFavorito(productoId, btn) {
  var usuarioId = localStorage.getItem('uw-id');
  var tarjeta   = btn.closest('.tarjeta-favorito');
  tarjeta.style.transition = 'opacity 0.3s,transform 0.3s';
  tarjeta.style.opacity    = '0';
  tarjeta.style.transform  = 'scale(0.9)';
  try {
    await fetch('/api/favoritos', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ usuarioId: usuarioId, productoId: productoId })
    });
    setTimeout(function() {
      tarjeta.remove();
      var grilla = document.getElementById('grilla-favoritos');
      var vacio  = document.getElementById('favoritos-vacio');
      var sub    = document.getElementById('subtitulo-pagina-comprador');
      if (!grilla || grilla.children.length === 0) {
        if (vacio) vacio.style.display = 'block';
        if (sub)   sub.textContent = '0 favoritos';
      } else if (sub) {
        var n = grilla.children.length;
        sub.textContent = n + ' producto' + (n !== 1 ? 's' : '') + ' guardado' + (n !== 1 ? 's' : '');
      }
    }, 300);
  } catch(e) {
    tarjeta.style.opacity   = '1';
    tarjeta.style.transform = '';
  }
}

async function agregarFavCarrito(productoId, btn) {
  var usuarioId = localStorage.getItem('uw-id');
  if (!usuarioId) { window.location.href = '/login'; return; }
  // Usar modal global de talla/color/cantidad
  if (typeof agregarAlCarrito === 'function') {
    agregarAlCarrito(productoId, btn);
  } else {
    try {
      var res  = await fetch('/api/carrito/agregar', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ usuarioId:usuarioId, productoId:productoId, talla:'', color:'', cantidad:1 })
      });
      var data = await res.json();
      if (data.exito) {
        var orig = btn.textContent;
        btn.textContent = '✓ Agregado'; btn.style.background = '#16a34a';
        var cont = document.getElementById('contador-carrito');
        if (cont) cont.textContent = (data.carrito&&data.carrito.items||[]).reduce(function(s,i){return s+i.cantidad;},0);
        setTimeout(function(){ btn.textContent=orig; btn.style.background=''; }, 1500);
      }
    } catch(e) { console.error('Error carrito:', e); }
  }
}

console.log('scripts_Favoritos.js cargado');
