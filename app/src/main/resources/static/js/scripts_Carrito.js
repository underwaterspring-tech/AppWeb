/* ================================================================
   SCRIPTS_CARRITO.JS — NexoShop
   Maneja: cantidades, eliminar items, cupones,
   cálculo de totales, vaciar carrito, proceder al pago
================================================================ */


// ----------------------------------------------------------------
// DATOS DEL CARRITO
// En producción estos vendrán del backend:
// GET /api/carrito (con token JWT)
// ----------------------------------------------------------------
const productosEnCarrito = [
  { id: 1, nombre: 'Air Max 270 React ENG',    precio: 389900, cantidad: 1, empresa: 'ZapatoStyle' },
  { id: 2, nombre: 'Air Jordan 1 Retro High',  precio: 620000, cantidad: 1, empresa: 'ZapatoStyle' },
  { id: 3, nombre: 'Ultraboost 22 Running',    precio: 315000, cantidad: 1, empresa: 'SoleModa'    }
];

let descuentoCupon = 0;


// ----------------------------------------------------------------
// CALCULAR Y ACTUALIZAR TOTALES
// ----------------------------------------------------------------
function calcularTotales() {
  // Leemos las cantidades actuales del DOM
  document.querySelectorAll('.item-carrito').forEach(function(item) {
    const id       = parseInt(item.id.replace('item-', ''));
    const cantidad = parseInt(item.querySelector('.cantidad-item').textContent);
    const producto = productosEnCarrito.find(p => p.id === id);
    if (producto) producto.cantidad = cantidad;
  });

  // Calculamos subtotal
  const subtotal = productosEnCarrito.reduce((suma, p) => suma + (p.precio * p.cantidad), 0);

  // Descuento fijo del producto en oferta (Adidas -30%)
  const descuentoOferta = 135000;

  // Total final
  const total = subtotal - descuentoOferta - descuentoCupon;

  // Actualizamos el DOM
  document.getElementById('valor-subtotal').textContent  = formatearPrecio(subtotal);
  document.getElementById('valor-descuentos').textContent = '− ' + formatearPrecio(descuentoOferta + descuentoCupon);
  document.getElementById('valor-total').textContent      = formatearPrecio(Math.max(total, 0));

  // Actualizamos el contador del navbar
  const totalItems = productosEnCarrito.reduce((suma, p) => suma + p.cantidad, 0);
  document.getElementById('contador-carrito').textContent     = totalItems;
  document.getElementById('cantidad-items-carrito').textContent = totalItems;
}

// Formatea un número como precio colombiano: $389.900
function formatearPrecio(numero) {
  return '$' + numero.toLocaleString('es-CO');
}


// ----------------------------------------------------------------
// BOTONES DE CANTIDAD (+ y -)
// ----------------------------------------------------------------
document.querySelectorAll('.boton-sumar-item').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const id           = parseInt(this.dataset.id);
    const itemElement  = document.getElementById('item-' + id);
    const spanCantidad = itemElement.querySelector('.cantidad-item');
    const producto     = productosEnCarrito.find(p => p.id === id);

    let cantidadActual = parseInt(spanCantidad.textContent);
    if (cantidadActual < 10) {
      cantidadActual++;
      spanCantidad.textContent = cantidadActual;
      actualizarPrecioItem(id, cantidadActual, producto.precio);
      calcularTotales();
    }
    /*
    TODO: PUT /api/carrito/item/{id} { cantidad: cantidadActual }
    */
  });
});

document.querySelectorAll('.boton-restar-item').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const id           = parseInt(this.dataset.id);
    const itemElement  = document.getElementById('item-' + id);
    const spanCantidad = itemElement.querySelector('.cantidad-item');
    const producto     = productosEnCarrito.find(p => p.id === id);

    let cantidadActual = parseInt(spanCantidad.textContent);
    if (cantidadActual > 1) {
      cantidadActual--;
      spanCantidad.textContent = cantidadActual;
      actualizarPrecioItem(id, cantidadActual, producto.precio);
      calcularTotales();
    } else {
      // Si la cantidad llega a 0, preguntamos si eliminar
      if (confirm('¿Deseas eliminar este producto del carrito?')) {
        eliminarItem(id);
      }
    }
  });
});

// Actualiza el precio total del item según la cantidad
function actualizarPrecioItem(id, cantidad, precioUnitario) {
  const itemElement  = document.getElementById('item-' + id);
  const precioTotal  = itemElement.querySelector('.item-precio-total');
  if (precioTotal) {
    precioTotal.textContent = formatearPrecio(precioUnitario * cantidad);
  }
}


// ----------------------------------------------------------------
// ELIMINAR ITEM DEL CARRITO
// ----------------------------------------------------------------
document.querySelectorAll('.boton-eliminar-item').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const id = parseInt(this.dataset.id);
    eliminarItem(id);
  });
});

function eliminarItem(id) {
  const itemElement = document.getElementById('item-' + id);
  if (!itemElement) return;

  // Animación de salida
  itemElement.style.opacity    = '0';
  itemElement.style.transform  = 'translateX(20px)';
  itemElement.style.transition = 'all 0.3s ease';

  setTimeout(function() {
    itemElement.remove();

    // Quitamos del array
    const indice = productosEnCarrito.findIndex(p => p.id === id);
    if (indice !== -1) productosEnCarrito.splice(indice, 1);

    calcularTotales();
    verificarCarritoVacio();
  }, 300);

  /*
  TODO: DELETE /api/carrito/item/{id}
  */
}


// ----------------------------------------------------------------
// VERIFICAR SI EL CARRITO QUEDÓ VACIO
// ----------------------------------------------------------------
function verificarCarritoVacio() {
  if (productosEnCarrito.length === 0) {
    document.getElementById('cuerpo-carrito').style.display    = 'none';
    document.getElementById('estado-carrito-vacio').style.display = 'flex';
    document.getElementById('subtitulo-carrito').textContent   = 'Tu carrito está vacío';
  }
}


// ----------------------------------------------------------------
// VACIAR TODO EL CARRITO
// ----------------------------------------------------------------
const botonVaciar = document.getElementById('boton-vaciar-carrito');

botonVaciar.addEventListener('click', function() {
  if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;

  // Animamos y eliminamos todos los items
  document.querySelectorAll('.item-carrito').forEach(function(item) {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(20px)';
    item.style.transition = 'all 0.3s ease';
  });

  setTimeout(function() {
    productosEnCarrito.length = 0;
    calcularTotales();
    verificarCarritoVacio();
  }, 350);

  /*
  TODO: DELETE /api/carrito
  */
});


// ----------------------------------------------------------------
// CUPON DE DESCUENTO
// ----------------------------------------------------------------
const inputCupon         = document.getElementById('input-cupon');
const botonAplicarCupon  = document.getElementById('boton-aplicar-cupon');
const mensajeCupon       = document.getElementById('mensaje-cupon');

// Cupones válidos (en producción esto se valida en el backend)
const cuponesValidos = {
  'NEXO10':  { descuento: 0.10, texto: '✓ Cupón aplicado: 10% de descuento' },
  'BIENVENIDO': { descuento: 0.15, texto: '✓ Cupón aplicado: 15% de descuento' },
  'ZAPATOS20':  { descuento: 0.20, texto: '✓ Cupón aplicado: 20% de descuento' }
};

botonAplicarCupon.addEventListener('click', function() {
  const codigoCupon = inputCupon.value.trim().toUpperCase();

  if (codigoCupon === '') {
    mostrarMensajeCupon('Ingresa un código de cupón', false);
    return;
  }

  /*
  TODO: Validar en el backend → POST /api/cupones/validar { codigo: codigoCupon }
  */

  // Simulación mientras no hay backend
  if (cuponesValidos[codigoCupon]) {
    const cupon    = cuponesValidos[codigoCupon];
    const subtotal = productosEnCarrito.reduce((s, p) => s + (p.precio * p.cantidad), 0);
    descuentoCupon = Math.round(subtotal * cupon.descuento);

    mostrarMensajeCupon(cupon.texto, true);
    inputCupon.disabled           = true;
    botonAplicarCupon.textContent = '✓ Aplicado';
    botonAplicarCupon.style.background = '#2d6e2d';
    calcularTotales();
  } else {
    mostrarMensajeCupon('❌ Cupón inválido o expirado', false);
    descuentoCupon = 0;
    calcularTotales();
  }
});

function mostrarMensajeCupon(texto, esValido) {
  mensajeCupon.style.display = 'block';
  mensajeCupon.textContent   = texto;
  mensajeCupon.className     = esValido ? 'cupon-valido' : 'cupon-invalido';
}

// Aplicar cupón con Enter
inputCupon.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') botonAplicarCupon.click();
});


// ----------------------------------------------------------------
// PROCEDER AL PAGO
// ----------------------------------------------------------------
const botonPago = document.getElementById('boton-proceder-pago');

botonPago.addEventListener('click', function() {
  if (productosEnCarrito.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  // Verificar si el usuario está logueado
  const tokenUsuario = localStorage.getItem('nexoshop-token');
  if (!tokenUsuario) {
    // Si no está logueado, lo mandamos al login
    if (confirm('Debes iniciar sesión para continuar con el pago. ¿Ir al login?')) {
      window.location.href = 'login.html';
    }
    return;
  }

  // TODO: Redirigir al checkout
  // window.location.href = 'checkout.html';
  alert('✅ Procediendo al pago — próximamente: página de checkout con métodos de pago');
});


// ----------------------------------------------------------------
// INICIALIZAR
// ----------------------------------------------------------------
calcularTotales();
verificarCarritoVacio();

console.log('✅ scripts_Carrito.js cargado correctamente');