/* ================================================================
   SCRIPTS_DETALLE.JS — NexoShop
   Maneja: galería, selector de color/talla/cantidad,
   tabs de descripción/specs/reseñas, agregar al carrito
================================================================ */


// ----------------------------------------------------------------
// GALERIA DE IMAGENES
// Cambia la imagen principal al hacer clic en una miniatura
// ----------------------------------------------------------------
const miniaturasGaleria      = document.querySelectorAll('.miniatura-imagen');
const emojiImagenPrincipal   = document.getElementById('emoji-imagen-principal');

// Lista de emojis por "imagen" (cuando haya imágenes reales se reemplaza por URLs)
const imagenesProducto = ['👟', '👟', '👟', '👟'];

miniaturasGaleria.forEach(function(miniatura) {
  miniatura.addEventListener('click', function() {
    // Quitamos activo de todas
    miniaturasGaleria.forEach(m => m.classList.remove('activa'));
    this.classList.add('activa');

    // Cambiamos la imagen principal
    const indice = parseInt(this.dataset.imagen);
    emojiImagenPrincipal.textContent = imagenesProducto[indice];

    /*
    TODO: cuando haya imágenes reales:
    document.getElementById('imagen-principal-producto').src = imagenesProducto[indice];
    */
  });
});


// ----------------------------------------------------------------
// SELECTOR DE COLOR
// Cambia el color activo y actualiza el texto
// ----------------------------------------------------------------
const opcionesColor          = document.querySelectorAll('.opcion-color-detalle');
const textoColorSeleccionado = document.getElementById('color-seleccionado-texto');

opcionesColor.forEach(function(opcion) {
  opcion.addEventListener('click', function() {
    opcionesColor.forEach(o => o.classList.remove('activo'));
    this.classList.add('activo');
    textoColorSeleccionado.textContent = this.dataset.color;
  });
});


// ----------------------------------------------------------------
// SELECTOR DE TALLA
// Activa la talla elegida y habilita los botones de compra
// ----------------------------------------------------------------
const opcionesTalla          = document.querySelectorAll('.opcion-talla-detalle:not(.sin-stock)');
const textoTallaSeleccionada = document.getElementById('talla-seleccionada-texto');
const botonAgregarCarrito    = document.getElementById('boton-agregar-al-carrito');
const botonComprarAhora      = document.getElementById('boton-comprar-ahora');
let tallaElegida             = null;

opcionesTalla.forEach(function(opcion) {
  opcion.addEventListener('click', function() {
    opcionesTalla.forEach(o => o.classList.remove('activo'));
    this.classList.add('activo');

    tallaElegida = this.dataset.talla;
    textoTallaSeleccionada.textContent = 'Talla ' + tallaElegida;

    // Habilitamos los botones de compra ahora que hay talla elegida
    botonAgregarCarrito.disabled = false;
    botonAgregarCarrito.textContent = '+ Agregar al carrito';
    botonComprarAhora.disabled   = false;
  });
});


// ----------------------------------------------------------------
// CONTROL DE CANTIDAD
// ----------------------------------------------------------------
const botonRestar       = document.getElementById('boton-restar-cantidad');
const botonSumar        = document.getElementById('boton-sumar-cantidad');
const textoCantidad     = document.getElementById('cantidad-seleccionada');
const stockDisponible   = 8; // TODO: vendrá del backend
let cantidadElegida     = 1;

botonSumar.addEventListener('click', function() {
  if (cantidadElegida < stockDisponible) {
    cantidadElegida++;
    textoCantidad.textContent = cantidadElegida;
  }
});

botonRestar.addEventListener('click', function() {
  if (cantidadElegida > 1) {
    cantidadElegida--;
    textoCantidad.textContent = cantidadElegida;
  }
});


// ----------------------------------------------------------------
// BOTON AGREGAR AL CARRITO
// ----------------------------------------------------------------
botonAgregarCarrito.addEventListener('click', function() {
  if (!tallaElegida) return;

  const colorElegido = document.querySelector('.opcion-color-detalle.activo').dataset.color;

  const productoParaCarrito = {
    id:        1, // TODO: vendrá del backend
    nombre:    'Nike Air Max 270 React ENG',
    marca:     'Nike',
    empresa:   'ZapatoStyle',
    precio:    389900,
    talla:     tallaElegida,
    color:     colorElegido,
    cantidad:  cantidadElegida
  };

  console.log('Agregando al carrito:', productoParaCarrito);

  // Feedback visual en el botón
  const textoOriginal = this.textContent;
  this.textContent    = '✓ ¡Agregado al carrito!';
  this.style.background = '#2d6e2d';

  // Actualizamos el contador del navbar
  const contadorCarrito = document.getElementById('contador-carrito');
  contadorCarrito.textContent = parseInt(contadorCarrito.textContent) + cantidadElegida;

  setTimeout(() => {
    this.textContent      = textoOriginal;
    this.style.background = '';
  }, 2000);

  /*
  TODO: Conectar con Spring Boot → POST /api/carrito
  fetch('/api/carrito', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('nexoshop-token')
    },
    body: JSON.stringify(productoParaCarrito)
  });
  */
});


// ----------------------------------------------------------------
// BOTON COMPRAR AHORA
// Agrega al carrito y redirige al checkout
// ----------------------------------------------------------------
botonComprarAhora.addEventListener('click', function() {
  if (!tallaElegida) return;
  // TODO: agregar al carrito y redirigir a carrito.html
  window.location.href = 'carrito.html';
});


// ----------------------------------------------------------------
// BOTON FAVORITO
// ----------------------------------------------------------------
const botonFavoritoDetalle = document.getElementById('boton-favorito-detalle');
const botonFavoritoAccion  = document.getElementById('boton-favorito-accion');
let esFavorito             = false;

function toggleFavorito() {
  esFavorito = !esFavorito;
  const icono = esFavorito ? '❤️' : '♡';
  botonFavoritoDetalle.textContent = icono;
  botonFavoritoAccion.textContent  = esFavorito ? '❤️ Guardado' : '♡ Guardar';

  /*
  TODO: POST /api/favoritos
  fetch('/api/favoritos', {
    method: esFavorito ? 'POST' : 'DELETE',
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nexoshop-token') },
    body: JSON.stringify({ productoId: 1 })
  });
  */
}
botonFavoritoDetalle.addEventListener('click', toggleFavorito);
botonFavoritoAccion.addEventListener('click',  toggleFavorito);


// ----------------------------------------------------------------
// TABS: Descripción / Especificaciones / Reseñas
// ----------------------------------------------------------------
const tabsDetalle       = document.querySelectorAll('.tab-detalle');
const contenidosTabs    = document.querySelectorAll('.contenido-tab');

tabsDetalle.forEach(function(tab) {
  tab.addEventListener('click', function() {
    // Desactivamos todos
    tabsDetalle.forEach(t => t.classList.remove('activo'));
    contenidosTabs.forEach(c => c.style.display = 'none');

    // Activamos el elegido
    this.classList.add('activo');
    const idContenido = 'contenido-' + this.dataset.tab;
    document.getElementById(idContenido).style.display = 'block';
  });
});


// ----------------------------------------------------------------
// ENLACE "ir a reseñas" desde el contador de valoraciones
// ----------------------------------------------------------------
document.getElementById('numero-resenas').addEventListener('click', function() {
  document.querySelector('.tab-detalle[data-tab="resenas"]').click();
  document.getElementById('seccion-tabs-detalle').scrollIntoView({ behavior: 'smooth' });
});


console.log('✅ scripts_Detalle.js cargado correctamente');