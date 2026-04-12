

// ----------------------------------------------------------------
// CURSOR PERSONALIZADO
// Mueve los dos círculos del cursor según donde esté el mouse
// ----------------------------------------------------------------
const elementoCursorPunto   = document.getElementById('cursor-punto');
const elementoCursorCirculo = document.getElementById('cursor-circulo');

// Cada vez que el mouse se mueve, actualizamos la posición del cursor
document.addEventListener('mousemove', function(evento) {
  // El punto sigue al mouse inmediatamente
  elementoCursorPunto.style.left = evento.clientX + 'px';
  elementoCursorPunto.style.top  = evento.clientY + 'px';

  // El círculo sigue con un pequeño retraso (efecto de "cola")
  setTimeout(function() {
    elementoCursorCirculo.style.left = evento.clientX + 'px';
    elementoCursorCirculo.style.top  = evento.clientY + 'px';
  }, 80);
});



// ----------------------------------------------------------------
// ANIMACION AL HACER SCROLL (Scroll Reveal)
// Los elementos con clase "revelar" aparecen cuando el usuario
// los ve en pantalla al desplazarse
// ----------------------------------------------------------------
const elementosParaRevelar = document.querySelectorAll('.revelar');

// IntersectionObserver: nos avisa cuando un elemento entra en pantalla
const observadorScroll = new IntersectionObserver(function(entradas) {
  entradas.forEach(function(entrada, indice) {
    if (entrada.isIntersecting) {
      // Añadimos un pequeño retraso escalonado entre elementos
      setTimeout(function() {
        entrada.target.classList.add('visible');
      }, indice * 80);
    }
  });
}, { threshold: 0.1 }); // Se activa cuando el 10% del elemento es visible

// Le decimos al observador que vigile cada elemento
elementosParaRevelar.forEach(function(elemento) {
  observadorScroll.observe(elemento);
});


// ----------------------------------------------------------------
// CARRUSEL DE PUNTOS DEL HERO
// Los tres puntitos del hero cambian automáticamente cada 2.8 segundos
// ----------------------------------------------------------------
const puntosCarrusel = document.querySelectorAll('.punto-carrusel');
let indicePuntoActual = 0;

setInterval(function() {
  // Quitamos la clase "activo" del punto actual
  puntosCarrusel[indicePuntoActual].classList.remove('activo');

  // Pasamos al siguiente punto (si llegamos al final, volvemos al primero)
  indicePuntoActual = (indicePuntoActual + 1) % puntosCarrusel.length;

  // Activamos el nuevo punto
  puntosCarrusel[indicePuntoActual].classList.add('activo');

}, 2800); // cada 2.8 segundos


// ----------------------------------------------------------------
// BOTON AGREGAR AL CARRITO
// Cuando el usuario hace clic en "Agregar al carrito",
// el botón cambia de color y muestra confirmación
// ----------------------------------------------------------------
const botonesAgregarCarrito = document.querySelectorAll('.boton-agregar-carrito');

botonesAgregarCarrito.forEach(function(boton) {
  boton.addEventListener('click', function() {
    const textoOriginal = this.textContent;

    // Cambiamos el texto y color del botón a verde
    this.textContent = '✓ ¡Producto agregado!';
    this.style.backgroundColor = '#2d6e2d'; // verde

    // Actualizamos el contador del carrito en la barra de navegación
    actualizarContadorCarrito();

    // Después de 1.5 segundos, volvemos al estado original
    setTimeout(() => {
      this.textContent = textoOriginal;
      this.style.backgroundColor = '';
    }, 1500);
  });
});


// ----------------------------------------------------------------
// CONTADOR DEL CARRITO
// Aumenta el número que aparece encima del ícono del carrito
// ----------------------------------------------------------------
const elementoContadorCarrito = document.getElementById('contador-carrito');
let cantidadProductosEnCarrito = parseInt(elementoContadorCarrito.textContent);

function actualizarContadorCarrito() {
  cantidadProductosEnCarrito++;
  elementoContadorCarrito.textContent = cantidadProductosEnCarrito;

  // Animación de "rebote" cuando se agrega un producto
  elementoContadorCarrito.style.transform = 'scale(1.5)';
  setTimeout(function() {
    elementoContadorCarrito.style.transform = 'scale(1)';
  }, 200);
}


// ----------------------------------------------------------------
// BOTON DE BUSQUEDA (preparado para conectar con el backend)
// ----------------------------------------------------------------
const botonBuscar = document.getElementById('boton-buscar');

botonBuscar.addEventListener('click', function() {
  // TODO: Conectar con el endpoint de Spring Boot: GET /api/productos/buscar?q=...
  alert('Aquí irá el buscador de productos 🔍');
});


// ----------------------------------------------------------------
// BOTON DE LOGIN (preparado para conectar con Spring Security)
// ----------------------------------------------------------------
const botonLogin = document.getElementById('boton-login');

botonLogin.addEventListener('click', function() {
    window.location.href = 'login.html';
});

// ----------------------------------------------------------------
// BOTON "VENDER AQUI" — redirige al registro de empresa
// ----------------------------------------------------------------
const botonRegistroVender = document.getElementById('boton-registro-vender');
if (botonRegistroVender) {
    botonRegistroVender.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
}
// ----------------------------------------------------------------
// BOTON DE FAVORITOS
// ----------------------------------------------------------------
const botonFavoritos = document.getElementById('boton-favoritos');

botonFavoritos.addEventListener('click', function() {
  // TODO: Conectar con el endpoint: POST /api/favoritos
  alert('Aquí irá tu lista de favoritos ♡');
});


// ----------------------------------------------------------------
// BOTON DE CARRITO
// ----------------------------------------------------------------
const botonCarrito = document.getElementById('boton-carrito');

botonCarrito.addEventListener('click', function() {
  // TODO: Redirigir a: window.location.href = '/carrito'
  alert('Aquí irás al carrito de compras 🛒');
});


// ----------------------------------------------------------------
// BOTON BANNER "REGISTRAR EMPRESA"
// ----------------------------------------------------------------
const botonBannerOferta = document.getElementById('banner-boton-oferta');
if (botonBannerOferta) {
    botonBannerOferta.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
}
// ----------------------------------------------------------------
// CONSOLE LOG de bienvenida (solo para desarrollo)
// ----------------------------------------------------------------
console.log('✅ NexoShop cargado correctamente');
console.log('📦 Scripts conectados al HTML y CSS');
console.log('🔧 Pendiente: conectar con Spring Boot en el backend');


// ----------------------------------------------------------------
// TABS "COMO FUNCIONA" — Comprador / Vendedor
// ----------------------------------------------------------------
const tabsFuncionamiento = document.querySelectorAll('.tab-funcionamiento');
const pasosComprador     = document.getElementById('pasos-comprador');
const pasosVendedor      = document.getElementById('pasos-vendedor');

if (tabsFuncionamiento.length > 0) {
  tabsFuncionamiento.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabsFuncionamiento.forEach(t => t.classList.remove('activo'));
      this.classList.add('activo');

      if (this.dataset.tab === 'comprador') {
        pasosComprador.style.display = 'grid';
        pasosVendedor.style.display  = 'none';
      } else {
        pasosComprador.style.display = 'none';
        pasosVendedor.style.display  = 'grid';
      }
    });
  });
}


// ----------------------------------------------------------------
// BOTON BANNER "REGISTRAR EMPRESA"
// ----------------------------------------------------------------
const botonBannerEmpresa = document.getElementById('banner-boton-oferta');
if (botonBannerEmpresa) {
  botonBannerEmpresa.addEventListener('click', function() {
    // TODO: window.location.href = '/registro-empresa'
    alert('Redirigiendo al registro de empresa... 🏢');
  });
}


// ----------------------------------------------------------------
// BARRA DE BUSQUEDA — mostrar/ocultar sugerencias
// ----------------------------------------------------------------
const inputBusqueda            = document.getElementById('input-busqueda');
const panelSugerencias         = document.getElementById('panel-sugerencias-busqueda');
const botonEjecutarBusqueda    = document.getElementById('boton-ejecutar-busqueda');

if (inputBusqueda) {

  // Mostrar sugerencias cuando el usuario hace foco en el input
  inputBusqueda.addEventListener('focus', function() {
    panelSugerencias.style.display = 'block';
  });

  // Ocultar sugerencias cuando el usuario hace clic fuera
  document.addEventListener('click', function(evento) {
    const dentroDelBuscador = document.getElementById('contenedor-barra-busqueda');
    if (!dentroDelBuscador.contains(evento.target)) {
      panelSugerencias.style.display = 'none';
    }
  });

  // Buscar al presionar Enter
  inputBusqueda.addEventListener('keydown', function(evento) {
    if (evento.key === 'Enter') {
      ejecutarBusqueda();
    }
  });

  // Buscar al hacer clic en el botón
  botonEjecutarBusqueda.addEventListener('click', ejecutarBusqueda);

  // Al hacer clic en una sugerencia, llenar el input y buscar
  document.querySelectorAll('.sugerencia-item').forEach(function(sugerencia) {
    sugerencia.addEventListener('click', function() {
      // Quitamos el emoji del texto de la sugerencia
      const textoSugerencia = this.textContent.replace(/^\S+\s/, '');
      inputBusqueda.value = textoSugerencia;
      panelSugerencias.style.display = 'none';
      ejecutarBusqueda();
    });
  });
}

// Función que ejecuta la búsqueda
function ejecutarBusqueda() {
  const textoBusqueda = inputBusqueda.value.trim();
  if (textoBusqueda === '') return;

  panelSugerencias.style.display = 'none';
  console.log('Buscando:', textoBusqueda);

  // TODO: Conectar con Spring Boot → GET /api/productos/buscar?q=textoBusqueda
  // window.location.href = `/catalogo.html?buscar=${textoBusqueda}`;
  alert(`Buscando: "${textoBusqueda}" — pendiente conectar con Spring Boot`);
}