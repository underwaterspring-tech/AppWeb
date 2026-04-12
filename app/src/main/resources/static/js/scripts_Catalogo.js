
var API_URL = '/api/productos';

var FONDOS_TARJETA = [
  '#f0ece4','#e8f0e8','#f0e8e8','#e8eaf0',
  '#faf0e8','#e8f4f0','#f4e8f0','#e8ecf0','#eef0e8'
];

var estado = {
  genero:'todos', categorias:[], marcas:[], empresas:[],
  colores:[], tallas:[], precioMax:800000,
  orden:'relevancia', pagina:0, tamano:9, totalPaginas:1
};

var grillaCatalogo, botonAnterior, botonSiguiente, numerosWrapper,
    sliderPrecio, valorPrecioMaximo, contenedorFiltrosActivos,
    botonesGenero, botonesTalla, botonesColor, checkboxesFiltro;


// ================================================================
// CARGAR PRODUCTOS
// ================================================================
async function cargarProductos() {
  var params = new URLSearchParams();
  params.set('genero',    estado.genero);
  params.set('precioMax', estado.precioMax);
  params.set('orden',     estado.orden);
  params.set('pagina',    estado.pagina);
  params.set('tamano',    estado.tamano);
  if (estado.categorias.length) params.set('categorias', estado.categorias.join(','));
  if (estado.marcas.length)     params.set('marcas',     estado.marcas.join(','));
  if (estado.empresas.length)   params.set('empresas',   estado.empresas.join(','));
  if (estado.colores.length)    params.set('colores',    estado.colores.join(','));
  if (estado.tallas.length)     params.set('tallas',     estado.tallas.join(','));

  grillaCatalogo.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:3rem;opacity:.5">Cargando productos...</p>';

  try {
    var res  = await fetch(API_URL + '?' + params.toString());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    renderizarProductos(data.productos || []);
    actualizarPaginacion(data.totalItems, data.totalPaginas, data.paginaActual);
  } catch (err) {
    console.error('Error:', err);
    grillaCatalogo.innerHTML = '<p style="color:#c8452d;padding:2rem;grid-column:1/-1">Error: ' + err.message + '</p>';
  }
}


// ================================================================
// RENDERIZAR TARJETAS
// ================================================================
function renderizarProductos(lista) {
  document.getElementById('numero-resultados').textContent = lista.length;

  if (!lista.length) {
    grillaCatalogo.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:3rem;opacity:.6">Sin resultados.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < lista.length; i++) {
    var p = lista[i];

    var tieneDescuento = p.precioDescuento != null && p.precioDescuento > 0 && p.precioDescuento < p.precio;
    var precioHTML = tieneDescuento
      ? '<span class="precio-tachado">$' + fmt(p.precio) + '</span><span class="precio-oferta">$' + fmt(p.precioDescuento) + '</span>'
      : '$' + fmt(p.precio);

    var etiquetaHTML = tieneDescuento
      ? '<span class="etiqueta-producto etiqueta-oferta">-' + Math.round((1 - p.precioDescuento / p.precio) * 100) + '%</span>'
      : '<span class="etiqueta-producto etiqueta-nuevo">Nuevo</span>';

    var coloresHTML = '';
    if (p.colores) {
      for (var j = 0; j < p.colores.length; j++)
        coloresHTML += '<div class="circulo-color" style="background:' + colorACss(p.colores[j]) + '" title="' + p.colores[j] + '"></div>';
    }

    var fondo  = FONDOS_TARJETA[i % FONDOS_TARJETA.length];
    var idProd = p.id || '';

    var imagenInterior;
    if (p.imagenes && p.imagenes.length > 0) {
      imagenInterior =
        '<img src="' + p.imagenes[0] + '" alt="' + (p.nombre || '') + '" ' +
        'style="width:100%;height:100%;object-fit:cover;display:block" ' +
        'onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
        '<span class="emoji-producto" style="display:none">' + emojiCat(p.categoria) + '</span>';
    } else {
      imagenInterior = '<span class="emoji-producto">' + emojiCat(p.categoria) + '</span>';
    }

    html +=
      '<div class="tarjeta-producto-catalogo" data-id="' + idProd + '" style="cursor:pointer">' +
        '<div class="imagen-producto-catalogo" style="background:' + fondo + '">' +
          etiquetaHTML +
          imagenInterior +
          '<div class="botones-hover-producto">' +
            '<button class="boton-favorito-catalogo" title="Favorito" onclick="event.stopPropagation()">&#9825;</button>' +
            '<button class="boton-ver-detalle" title="Ver detalle" onclick="event.stopPropagation();irADetalle(\'' + idProd + '\')">&#128065;</button>' +
          '</div>' +
          '<button class="boton-agregar-carrito" data-id="' + idProd + '" onclick="event.stopPropagation()">+ Carrito</button>' +
        '</div>' +
        '<div class="detalle-producto">' +
          '<p class="vendedor-producto">por <a href="#" class="enlace-vendedor" onclick="event.stopPropagation()">' + (p.vendedorNombre || p.vendedorId || 'NexoShop') + '</a></p>' +
          '<p class="marca-producto">' + (p.marca || '') + '</p>' +
          '<p class="nombre-producto">' + (p.nombre || '') + '</p>' +
          '<div class="estrellas-valoracion"><span class="estrellas">' + estrellas(p.valoracionPromedio) + '</span></div>' +
          '<div class="pie-producto">' +
            '<div class="precio-producto">' + precioHTML + '</div>' +
            '<div class="colores-disponibles">' + coloresHTML + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  grillaCatalogo.innerHTML = html;

  // Clic en cualquier parte de la tarjeta → ir al detalle
  var tarjetas = grillaCatalogo.querySelectorAll('.tarjeta-producto-catalogo');
  for (var k = 0; k < tarjetas.length; k++) {
    tarjetas[k].addEventListener('click', function () {
      irADetalle(this.dataset.id);
    });
  }
}


// ================================================================
// NAVEGACIÓN AL DETALLE
// ================================================================
window.irADetalle = function(productoId) {
  if (!productoId) return;
  window.location.href = 'Detalle.html?id=' + productoId;
};


// ================================================================
// HELPERS
// ================================================================
function fmt(v) { return parseInt(v).toLocaleString('es-CO'); }

function emojiCat(cat) {
  var m = { deportivos:'👟', casual:'👟', tacones:'👠', botas:'🥾', sandalias:'🩴', loafers:'🥿' };
  return m[(cat||'').toLowerCase()] || '👟';
}

function colorACss(n) {
  var m = { negro:'#111', blanco:'#fff', rojo:'#c8452d', azul:'#1a3a6e',
            verde:'#2d6e2d', gris:'#888', morado:'#8b5cf6', cafe:'#7c5a3c',
            naranja:'#e67e22', rosa:'#ff6b6b', amarillo:'#f1c40f' };
  return m[(n||'').toLowerCase()] || '#ccc';
}

function estrellas(v) {
  var s = '', n = Math.round(v || 0);
  for (var i=0;i<n;i++) s+='★';
  for (var i=n;i<5;i++) s+='☆';
  return s;
}


// ================================================================
// PAGINACIÓN
// ================================================================
function actualizarPaginacion(totalItems, totalPaginas, paginaActual) {
  estado.totalPaginas = totalPaginas;
  botonAnterior.disabled  = paginaActual === 0;
  botonSiguiente.disabled = paginaActual >= totalPaginas - 1;
  numerosWrapper.innerHTML = '';
  for (var i = 0; i < totalPaginas; i++) {
    var btn = document.createElement('button');
    btn.className = 'numero-pagina' + (i === paginaActual ? ' activo' : '');
    btn.textContent = i + 1;
    (function(p){ btn.onclick = function(){ estado.pagina=p; cargarProductos(); }; })(i);
    numerosWrapper.appendChild(btn);
  }
}


// ================================================================
// ETIQUETAS FILTROS ACTIVOS
// ================================================================
function mostrarEtiquetaFiltro(tipo, valor, activo) {
  var id = 'etiqueta-' + tipo + '-' + valor;
  if (activo) {
    if (!document.getElementById(id)) {
      var tag = document.createElement('span');
      tag.className = 'etiqueta-filtro-activo'; tag.id = id;
      tag.innerHTML = valor + ' <button class="boton-quitar-etiqueta" onclick="window.quitarFiltro(\'' + tipo + '\',\'' + valor + '\')">×</button>';
      contenedorFiltrosActivos.appendChild(tag);
    }
  } else { var el = document.getElementById(id); if (el) el.remove(); }
}

window.quitarFiltro = function(tipo, valor) {
  if (tipo==='talla')  { var b=document.querySelector('.boton-talla[data-talla="'+valor+'"]'); if(b)b.classList.remove('activo'); estado.tallas=estado.tallas.filter(function(t){return t!==valor;}); }
  if (tipo==='color')  { var b=document.querySelector('.boton-color[data-color="'+valor+'"]'); if(b)b.classList.remove('activo'); estado.colores=estado.colores.filter(function(c){return c!==valor;}); }
  if (tipo==='check')  { var cb=document.querySelector('.checkbox-filtro[value="'+valor+'"]'); if(cb){cb.checked=false;cb.dispatchEvent(new Event('change'));} }
  var el=document.getElementById('etiqueta-'+tipo+'-'+valor); if(el)el.remove();
};


// ================================================================
// DOM READY
// ================================================================
document.addEventListener('DOMContentLoaded', function() {

  grillaCatalogo           = document.getElementById('grilla-productos-catalogo');
  botonAnterior            = document.getElementById('boton-anterior');
  botonSiguiente           = document.getElementById('boton-siguiente');
  numerosWrapper           = document.getElementById('numeros-pagina');
  sliderPrecio             = document.getElementById('slider-precio');
  valorPrecioMaximo        = document.getElementById('valor-precio-maximo');
  contenedorFiltrosActivos = document.getElementById('contenedor-filtros-activos');
  botonesGenero            = document.querySelectorAll('.boton-genero');
  botonesTalla             = document.querySelectorAll('.boton-talla');
  botonesColor             = document.querySelectorAll('.boton-color');
  checkboxesFiltro         = document.querySelectorAll('.checkbox-filtro');

  botonAnterior.addEventListener('click', function(){ if(estado.pagina>0){estado.pagina--;cargarProductos();} });
  botonSiguiente.addEventListener('click', function(){ if(estado.pagina<estado.totalPaginas-1){estado.pagina++;cargarProductos();} });
  sliderPrecio.addEventListener('input', function(){ estado.precioMax=parseInt(this.value); valorPrecioMaximo.textContent='$'+estado.precioMax.toLocaleString('es-CO'); });

  botonesGenero.forEach(function(btn){
    btn.addEventListener('click', function(){ botonesGenero.forEach(function(b){b.classList.remove('activo');}); btn.classList.add('activo'); estado.genero=btn.dataset.genero; });
  });
  botonesTalla.forEach(function(btn){
    btn.addEventListener('click', function(){ btn.classList.toggle('activo'); var t=btn.dataset.talla; if(btn.classList.contains('activo')){estado.tallas.push(t);mostrarEtiquetaFiltro('talla',t,true);}else{estado.tallas=estado.tallas.filter(function(x){return x!==t;});mostrarEtiquetaFiltro('talla',t,false);} });
  });
  botonesColor.forEach(function(btn){
    btn.addEventListener('click', function(){ btn.classList.toggle('activo'); var c=btn.dataset.color; if(btn.classList.contains('activo')){estado.colores.push(c);mostrarEtiquetaFiltro('color',c,true);}else{estado.colores=estado.colores.filter(function(x){return x!==c;});mostrarEtiquetaFiltro('color',c,false);} });
  });
  checkboxesFiltro.forEach(function(cb){
    cb.addEventListener('change', function(){ var g=cb.closest('.grupo-filtro'); var ng=g.querySelector('.filtro-nombre').textContent.toLowerCase(); var v=cb.value; var l; if(ng.includes('categor'))l=estado.categorias; else if(ng.includes('marca'))l=estado.marcas; else if(ng.includes('empresa'))l=estado.empresas; if(l){if(cb.checked)l.push(v);else{var i=l.indexOf(v);if(i>-1)l.splice(i,1);}} mostrarEtiquetaFiltro('check',v,cb.checked); });
  });

  document.getElementById('boton-aplicar-filtros').addEventListener('click', function(){ estado.pagina=0; cargarProductos(); });
  document.getElementById('boton-limpiar-filtros').addEventListener('click', function(){
    checkboxesFiltro.forEach(function(c){c.checked=false;}); botonesTalla.forEach(function(b){b.classList.remove('activo');}); botonesColor.forEach(function(b){b.classList.remove('activo');}); botonesGenero.forEach(function(b){b.classList.remove('activo');});
    document.querySelector('.boton-genero[data-genero="todos"]').classList.add('activo');
    sliderPrecio.value=800000; valorPrecioMaximo.textContent='$800.000'; contenedorFiltrosActivos.innerHTML='';
    Object.assign(estado,{genero:'todos',categorias:[],marcas:[],empresas:[],colores:[],tallas:[],precioMax:800000,pagina:0});
    cargarProductos();
  });
  document.getElementById('selector-ordenar').addEventListener('change', function(){ estado.orden=this.value; estado.pagina=0; cargarProductos(); });
  document.getElementById('boton-vista-cuadricula').addEventListener('click', function(){ this.classList.add('activo'); document.getElementById('boton-vista-lista').classList.remove('activo'); grillaCatalogo.style.gridTemplateColumns='repeat(3,1fr)'; });
  document.getElementById('boton-vista-lista').addEventListener('click', function(){ this.classList.add('activo'); document.getElementById('boton-vista-cuadricula').classList.remove('activo'); grillaCatalogo.style.gridTemplateColumns='1fr'; });

  cargarProductos();
});