/* ================================================================
   SCRIPTS-CATALOGO.JS — NexoShop
   Solo la interactividad propia del catálogo.
   El cursor, scroll reveal y carrito → vienen de scripts.js
================================================================ */


// ----------------------------------------------------------------
// SLIDER DE PRECIO
// Actualiza el valor mostrado cuando el usuario mueve el slider
// ----------------------------------------------------------------
const sliderPrecio         = document.getElementById('slider-precio');
const valorPrecioMaximo    = document.getElementById('valor-precio-maximo');

sliderPrecio.addEventListener('input', function() {
  const precioFormateado = '$' + parseInt(this.value).toLocaleString('es-CO');
  valorPrecioMaximo.textContent = precioFormateado;
});


// ----------------------------------------------------------------
// BOTONES DE GÉNERO — solo uno activo a la vez
// ----------------------------------------------------------------
const botonesGenero = document.querySelectorAll('.boton-genero');

botonesGenero.forEach(function(boton) {
  boton.addEventListener('click', function() {
    botonesGenero.forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');

    const generoElegido = this.dataset.genero;
    console.log('Género:', generoElegido);
    // TODO: GET /api/productos?genero=hombre
  });
});


// ----------------------------------------------------------------
// BOTONES DE TALLA — varios activos al tiempo
// ----------------------------------------------------------------
const botonesTalla = document.querySelectorAll('.boton-talla');

botonesTalla.forEach(function(boton) {
  boton.addEventListener('click', function() {
    this.classList.toggle('activo');
    mostrarEtiquetaFiltro('talla', this.dataset.talla, this.classList.contains('activo'));
  });
});


// ----------------------------------------------------------------
// BOTONES DE COLOR — varios activos al tiempo
// ----------------------------------------------------------------
const botonesColor = document.querySelectorAll('.boton-color');

botonesColor.forEach(function(boton) {
  boton.addEventListener('click', function() {
    this.classList.toggle('activo');
    mostrarEtiquetaFiltro('color', this.dataset.color, this.classList.contains('activo'));
  });
});


// ----------------------------------------------------------------
// CHECKBOXES DE CATEGORIA, MARCA Y EMPRESA
// ----------------------------------------------------------------
const checkboxesFiltro = document.querySelectorAll('.checkbox-filtro');

checkboxesFiltro.forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
    mostrarEtiquetaFiltro('check', this.value, this.checked);
  });
});


// ----------------------------------------------------------------
// ETIQUETAS DE FILTROS ACTIVOS
// Muestra visualmente qué filtros están seleccionados
// ----------------------------------------------------------------
const contenedorFiltrosActivos = document.getElementById('contenedor-filtros-activos');

function mostrarEtiquetaFiltro(tipo, valor, estaActivo) {
  const idEtiqueta = 'etiqueta-' + tipo + '-' + valor;

  if (estaActivo) {
    // Creamos la etiqueta si no existe
    if (!document.getElementById(idEtiqueta)) {
      const nuevaEtiqueta = document.createElement('span');
      nuevaEtiqueta.className = 'etiqueta-filtro-activo';
      nuevaEtiqueta.id = idEtiqueta;
      nuevaEtiqueta.innerHTML = `
        ${valor}
        <button class="boton-quitar-etiqueta" onclick="quitarFiltro('${tipo}', '${valor}')">×</button>
      `;
      contenedorFiltrosActivos.appendChild(nuevaEtiqueta);
    }
  } else {
    // Eliminamos la etiqueta si existe
    const etiquetaExistente = document.getElementById(idEtiqueta);
    if (etiquetaExistente) etiquetaExistente.remove();
  }
}

// Quita un filtro al hacer clic en la "×" de la etiqueta
function quitarFiltro(tipo, valor) {
  // Desmarcamos el elemento correspondiente
  if (tipo === 'talla') {
    const boton = document.querySelector(`.boton-talla[data-talla="${valor}"]`);
    if (boton) boton.classList.remove('activo');
  }
  if (tipo === 'color') {
    const boton = document.querySelector(`.boton-color[data-color="${valor}"]`);
    if (boton) boton.classList.remove('activo');
  }
  if (tipo === 'check') {
    const checkbox = document.querySelector(`.checkbox-filtro[value="${valor}"]`);
    if (checkbox) checkbox.checked = false;
  }
  // Eliminamos la etiqueta visual
  const etiqueta = document.getElementById('etiqueta-' + tipo + '-' + valor);
  if (etiqueta) etiqueta.remove();
}


// ----------------------------------------------------------------
// BOTON LIMPIAR TODOS LOS FILTROS
// ----------------------------------------------------------------
const botonLimpiar = document.getElementById('boton-limpiar-filtros');

botonLimpiar.addEventListener('click', function() {
  // Desmarcamos todos los checkboxes
  checkboxesFiltro.forEach(c => c.checked = false);

  // Quitamos activo de tallas y colores
  botonesTalla.forEach(b => b.classList.remove('activo'));
  botonesColor.forEach(b => b.classList.remove('activo'));

  // Reseteamos género a "Todos"
  botonesGenero.forEach(b => b.classList.remove('activo'));
  document.querySelector('.boton-genero[data-genero="todos"]').classList.add('activo');

  // Reseteamos precio
  sliderPrecio.value = 800000;
  valorPrecioMaximo.textContent = '$800.000';

  // Limpiamos las etiquetas visuales
  contenedorFiltrosActivos.innerHTML = '';

  console.log('Todos los filtros limpiados');
  // TODO: GET /api/productos (sin filtros)
});


// ----------------------------------------------------------------
// BOTON APLICAR FILTROS
// Recoge todos los filtros y los prepara para enviar al backend
// ----------------------------------------------------------------
const botonAplicar = document.getElementById('boton-aplicar-filtros');

botonAplicar.addEventListener('click', function() {
  // Recogemos todos los filtros activos
  const filtrosSeleccionados = {
    categorias:   [],
    marcas:       [],
    empresas:     [],
    genero:       document.querySelector('.boton-genero.activo')?.dataset.genero || 'todos',
    precioMaximo: sliderPrecio.value,
    tallas:       [],
    colores:      []
  };

  // Recorremos checkboxes marcados y los separamos por grupo
  checkboxesFiltro.forEach(function(c) {
    if (!c.checked) return;
    const grupo = c.closest('.grupo-filtro');
    const nombreGrupo = grupo.querySelector('.filtro-nombre').textContent.toLowerCase();
    if (nombreGrupo.includes('categoría'))  filtrosSeleccionados.categorias.push(c.value);
    if (nombreGrupo.includes('marca'))      filtrosSeleccionados.marcas.push(c.value);
    if (nombreGrupo.includes('empresa'))    filtrosSeleccionados.empresas.push(c.value);
  });

  document.querySelectorAll('.boton-talla.activo').forEach(b  => filtrosSeleccionados.tallas.push(b.dataset.talla));
  document.querySelectorAll('.boton-color.activo').forEach(b  => filtrosSeleccionados.colores.push(b.dataset.color));

  console.log('Filtros a enviar al backend:', filtrosSeleccionados);

  /*
  TODO: Llamar al backend Spring Boot:
  fetch(`/api/productos?genero=${filtrosSeleccionados.genero}&precioMax=${filtrosSeleccionados.precioMaximo}`)
    .then(res => res.json())
    .then(data => renderizarProductos(data));
  */

  alert('✅ Filtros listos — pendiente conectar con Spring Boot');
});


// ----------------------------------------------------------------
// CAMBIO DE VISTA: cuadrícula vs lista
// ----------------------------------------------------------------
const botonVistaCuadricula = document.getElementById('boton-vista-cuadricula');
const botonVistaLista      = document.getElementById('boton-vista-lista');
const grillaCatalogo       = document.getElementById('grilla-productos-catalogo');

botonVistaCuadricula.addEventListener('click', function() {
  botonVistaCuadricula.classList.add('activo');
  botonVistaLista.classList.remove('activo');
  grillaCatalogo.style.gridTemplateColumns = 'repeat(3, 1fr)';
});

botonVistaLista.addEventListener('click', function() {
  botonVistaLista.classList.add('activo');
  botonVistaCuadricula.classList.remove('activo');
  grillaCatalogo.style.gridTemplateColumns = '1fr';
});


// ----------------------------------------------------------------
// SELECTOR DE ORDENAMIENTO
// ----------------------------------------------------------------
const selectorOrdenar = document.getElementById('selector-ordenar');

selectorOrdenar.addEventListener('change', function() {
  const ordenElegido = this.value;
  console.log('Ordenando por:', ordenElegido);
  // TODO: GET /api/productos?orden=precio-asc
});


// ----------------------------------------------------------------
// PAGINACION
// ----------------------------------------------------------------
const numerosPagina    = document.querySelectorAll('.numero-pagina');
const botonAnterior    = document.getElementById('boton-anterior');
const botonSiguiente   = document.getElementById('boton-siguiente');
let paginaActual       = 1;
const totalPaginas     = 12;

numerosPagina.forEach(function(boton) {
  boton.addEventListener('click', function() {
    numerosPagina.forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');
    paginaActual = parseInt(this.textContent);

    // Habilitamos o deshabilitamos los botones anterior/siguiente
    botonAnterior.disabled  = paginaActual === 1;
    botonSiguiente.disabled = paginaActual === totalPaginas;

    console.log('Página:', paginaActual);
    // TODO: GET /api/productos?pagina=2
  });
});

botonSiguiente.addEventListener('click', function() {
  if (paginaActual < totalPaginas) {
    paginaActual++;
    console.log('Página siguiente:', paginaActual);
    // TODO: GET /api/productos?pagina=${paginaActual}
  }
});

botonAnterior.addEventListener('click', function() {
  if (paginaActual > 1) {
    paginaActual--;
    console.log('Página anterior:', paginaActual);
    // TODO: GET /api/productos?pagina=${paginaActual}
  }
});


// ----------------------------------------------------------------
// FUNCION: Renderizar productos desde el backend
// Esta función se usará cuando conectemos con Spring Boot
// ----------------------------------------------------------------
function renderizarProductos(listaProductos) {
  /*
  TODO: Cuando Spring Boot devuelva los productos, los pintamos así:
  grillaCatalogo.innerHTML = '';
  listaProductos.forEach(function(producto) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto-catalogo';
    tarjeta.innerHTML = `
      <div class="imagen-producto-catalogo">
        <img src="${producto.imagenUrl}" alt="${producto.nombre}"/>
        <button class="boton-agregar-carrito">+ Carrito</button>
      </div>
      <div class="detalle-producto">
        <p class="vendedor-producto">por <a href="#">${producto.empresaNombre}</a></p>
        <p class="marca-producto">${producto.marca}</p>
        <p class="nombre-producto">${producto.nombre}</p>
        <div class="pie-producto">
          <div class="precio-producto">$${producto.precio.toLocaleString('es-CO')}</div>
        </div>
      </div>
    `;
    grillaCatalogo.appendChild(tarjeta);
  });
  */
}

console.log('✅ scripts-catalogo.js cargado correctamente');