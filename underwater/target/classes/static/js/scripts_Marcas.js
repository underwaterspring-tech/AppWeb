// ================================================================
// scripts_Marcas.js — Underwater
// ================================================================
document.addEventListener('DOMContentLoaded', async function() {
  var grilla = document.getElementById('grilla-marcas');
  try {
    var res      = await fetch('/api/productos?tamano=1000&pagina=0');
    var data     = await res.json();
    var productos = Array.isArray(data) ? data : (data.productos || []);

    var marcas = {};
    productos.forEach(function(p) {
      var m = (p.marca || '').trim();
      if (m) marcas[m] = (marcas[m] || 0) + 1;
    });

    var lista = Object.keys(marcas).sort();
    if (!lista.length) {
      grilla.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--texto-suave)">No hay marcas disponibles.</p>';
      return;
    }
    grilla.innerHTML = lista.map(function(marca) {
      return '<div class="tarjeta-marca" onclick="window.location.href=\'/catalogo?marca=' + encodeURIComponent(marca) + '\'">'
        + '<span class="marca-nombre">' + marca.toUpperCase() + '</span>'
        + '<div class="marca-linea"></div>'
        + '<span class="marca-cant">' + marcas[marca] + ' producto' + (marcas[marca] !== 1 ? 's' : '') + '</span>'
        + '</div>';
    }).join('');
  } catch(e) {
    grilla.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--rojo)">Error cargando marcas.</p>';
  }
});
