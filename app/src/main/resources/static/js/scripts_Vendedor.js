/* ================================================================
   SCRIPTS_VENDEDOR.JS — NexoShop
   Maneja: navegación propia del vendedor, formulario de producto,
   carga de imágenes, selector de tallas y stock, validaciones
================================================================ */


// ----------------------------------------------------------------
// CONFIGURACION DE SECCIONES DEL VENDEDOR
// Sobreescribe los títulos del scripts_Admin.js para el vendedor
// ----------------------------------------------------------------
const infoSeccionesVendedor = {
  'dashboard-vendedor': { titulo: 'Dashboard',          subtitulo: 'Resumen de tu tienda ZapatoStyle' },
  'mis-productos':      { titulo: 'Mis Productos',      subtitulo: '142 productos publicados en el marketplace' },
  'nuevo-producto':     { titulo: 'Agregar Producto',   subtitulo: 'Completa todos los campos para publicar tu producto' },
  'mis-pedidos':        { titulo: 'Mis Pedidos',        subtitulo: 'Pedidos recibidos en tu tienda' },
  'mi-empresa':         { titulo: 'Datos de Mi Empresa', subtitulo: 'Información pública de tu tienda en el marketplace' },
  'mis-ventas':         { titulo: 'Mis Ventas',         subtitulo: 'Historial de ventas y ganancias de tu tienda' }
};

// Actualizamos el comportamiento de cambio de sección para incluir subtítulos del vendedor
document.querySelectorAll('.sidebar-enlace').forEach(function(enlace) {
  enlace.addEventListener('click', function() {
    const seccionId = this.dataset.seccion;
    if (infoSeccionesVendedor[seccionId]) {
      document.getElementById('titulo-seccion-actual').textContent    = infoSeccionesVendedor[seccionId].titulo;
      document.getElementById('subtitulo-seccion-actual').textContent = infoSeccionesVendedor[seccionId].subtitulo;
    }
  });
});

// Botón "Agregar producto" desde la tabla de mis productos
const botonIrNuevoProducto = document.getElementById('boton-ir-nuevo-producto');
if (botonIrNuevoProducto) {
  botonIrNuevoProducto.addEventListener('click', function() {
    cambiarSeccion('nuevo-producto');
  });
}

// Botón "Volver a productos" desde el formulario
const botonVolverProductos = document.getElementById('boton-volver-productos');
if (botonVolverProductos) {
  botonVolverProductos.addEventListener('click', function() {
    cambiarSeccion('mis-productos');
  });
}

// Botones "Editar" en la tabla de productos
document.querySelectorAll('.boton-editar-tabla').forEach(function(boton) {
  boton.addEventListener('click', function() {
    cambiarSeccion('nuevo-producto');
    // TODO: cargar datos del producto seleccionado en el formulario
    // GET /api/vendedor/productos/{id}
  });
});

// Enlace "Ver todos" del dashboard
document.querySelectorAll('.panel-card-enlace[data-ir-a]').forEach(function(enlace) {
  enlace.addEventListener('click', function(e) {
    e.preventDefault();
    cambiarSeccion(this.dataset.irA);
  });
});


// ----------------------------------------------------------------
// SELECTOR DE TALLAS EN EL FORMULARIO DE PRODUCTO
// Al activar una talla, aparece su campo de stock
// ----------------------------------------------------------------
const botonesTallaForm         = document.querySelectorAll('.boton-talla-form');
const contenedorStockPorTalla  = document.getElementById('contenedor-stock-por-talla');
const grillaSockTallas         = document.getElementById('grilla-stock-tallas');
let tallasSeleccionadas        = [];

botonesTallaForm.forEach(function(boton) {
  boton.addEventListener('click', function() {
    const talla = this.dataset.talla;
    this.classList.toggle('activo');

    if (this.classList.contains('activo')) {
      // Agregamos la talla
      tallasSeleccionadas.push(talla);
      agregarCampoStockTalla(talla);
    } else {
      // Quitamos la talla
      tallasSeleccionadas = tallasSeleccionadas.filter(t => t !== talla);
      quitarCampoStockTalla(talla);
    }

    // Mostramos u ocultamos el contenedor de stock
    contenedorStockPorTalla.style.display = tallasSeleccionadas.length > 0 ? 'block' : 'none';
  });
});

function agregarCampoStockTalla(talla) {
  const campoStock = document.createElement('div');
  campoStock.className = 'campo-stock-talla';
  campoStock.id        = 'stock-talla-' + talla;
  campoStock.innerHTML = `
    <label>Talla ${talla}</label>
    <input type="number" min="0" value="0" placeholder="0" class="campo-admin"/>
  `;
  grillaSockTallas.appendChild(campoStock);
}

function quitarCampoStockTalla(talla) {
  const campo = document.getElementById('stock-talla-' + talla);
  if (campo) campo.remove();
}


// ----------------------------------------------------------------
// ZONA DE CARGA DE IMAGENES
// ----------------------------------------------------------------
const zonaCargaPrincipal    = document.getElementById('zona-carga-principal');
const inputImagenes         = document.getElementById('input-imagenes');
const previsualizacion      = document.getElementById('previsualizacion-imagenes');

// Clic en la zona abre el selector de archivos
if (zonaCargaPrincipal) {
  zonaCargaPrincipal.addEventListener('click', function() {
    inputImagenes.click();
  });

  // Arrastrar y soltar
  zonaCargaPrincipal.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = 'var(--color-rojo)';
    this.style.background  = 'rgba(200,69,45,0.06)';
  });
  zonaCargaPrincipal.addEventListener('dragleave', function() {
    this.style.borderColor = '';
    this.style.background  = '';
  });
  zonaCargaPrincipal.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = '';
    this.style.background  = '';
    procesarArchivosImagenes(e.dataTransfer.files);
  });
}

if (inputImagenes) {
  inputImagenes.addEventListener('change', function() {
    procesarArchivosImagenes(this.files);
  });
}

function procesarArchivosImagenes(archivos) {
  Array.from(archivos).forEach(function(archivo) {
    if (!archivo.type.startsWith('image/')) return;

    const miniatura = document.createElement('div');
    miniatura.className = 'miniatura-cargada';

    // Mostramos preview con FileReader
    const lector = new FileReader();
    lector.onload = function(e) {
      miniatura.style.backgroundImage = `url(${e.target.result})`;
      miniatura.style.backgroundSize  = 'cover';
      miniatura.style.backgroundPosition = 'center';
    };
    lector.readAsDataURL(archivo);

    // Botón para quitar la imagen
    const botonQuitar = document.createElement('button');
    botonQuitar.className   = 'boton-quitar-imagen';
    botonQuitar.textContent = '✕';
    botonQuitar.addEventListener('click', function() {
      miniatura.remove();
    });

    miniatura.appendChild(botonQuitar);
    previsualizacion.appendChild(miniatura);
  });
}


// ----------------------------------------------------------------
// VALIDACIONES Y ENVIO DEL FORMULARIO DE PRODUCTO
// ----------------------------------------------------------------
const formNuevoProducto = document.getElementById('form-nuevo-producto');
const alertaExitoProducto = document.getElementById('alerta-exito-producto');
const alertaErrorProducto = document.getElementById('alerta-error-producto');

if (formNuevoProducto) {
  formNuevoProducto.addEventListener('submit', function(e) {
    e.preventDefault();
    alertaExitoProducto.style.display = 'none';
    alertaErrorProducto.style.display = 'none';

    if (!validarFormProducto()) {
      alertaErrorProducto.style.display = 'block';
      return;
    }

    // Recopilamos todos los datos
    const datosProducto = {
      nombre:          document.getElementById('prod-nombre').value.trim(),
      marca:           document.getElementById('prod-marca').value,
      categoria:       document.getElementById('prod-categoria').value,
      genero:          document.getElementById('prod-genero').value,
      descripcion:     document.getElementById('prod-descripcion').value.trim(),
      precio:          parseInt(document.getElementById('prod-precio').value),
      precioDescuento: parseInt(document.getElementById('prod-precio-descuento').value) || null,
      tallas:          tallasSeleccionadas,
      publicar:        document.getElementById('toggle-publicar').checked
    };

    console.log('Publicando producto:', datosProducto);

    /*
    TODO: POST /api/vendedor/productos
    fetch('/api/vendedor/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('nexoshop-token')
      },
      body: JSON.stringify(datosProducto)
    })
    .then(res => res.json())
    .then(data => {
      alertaExitoProducto.style.display = 'block';
      setTimeout(() => cambiarSeccion('mis-productos'), 2000);
    });
    */

    // Simulación mientras no hay backend
    alertaExitoProducto.style.display = 'block';
    setTimeout(function() {
      cambiarSeccion('mis-productos');
    }, 2000);
  });
}

function validarFormProducto() {
  let valido = true;

  const campos = [
    { id: 'prod-nombre',      errorId: 'error-prod-nombre',      mensaje: 'El nombre es obligatorio' },
    { id: 'prod-marca',       errorId: 'error-prod-marca',       mensaje: 'Selecciona la marca' },
    { id: 'prod-categoria',   errorId: 'error-prod-categoria',   mensaje: 'Selecciona la categoría' },
    { id: 'prod-genero',      errorId: 'error-prod-genero',      mensaje: 'Selecciona el género' },
    { id: 'prod-descripcion', errorId: 'error-prod-descripcion', mensaje: 'La descripción es obligatoria' },
    { id: 'prod-precio',      errorId: 'error-prod-precio',      mensaje: 'El precio es obligatorio' }
  ];

  campos.forEach(function(c) {
    const campo = document.getElementById(c.id);
    const error = document.getElementById(c.errorId);
    if (!campo.value.trim()) {
      campo.classList.add('campo-invalido');
      error.textContent = c.mensaje;
      valido = false;
    } else {
      campo.classList.remove('campo-invalido');
      error.textContent = '';
    }
  });

  // Validar tallas
  const errorTallas = document.getElementById('error-prod-tallas');
  if (tallasSeleccionadas.length === 0) {
    errorTallas.textContent = 'Selecciona al menos una talla';
    valido = false;
  } else {
    errorTallas.textContent = '';
  }

  return valido;
}


// ----------------------------------------------------------------
// GUARDAR BORRADOR
// ----------------------------------------------------------------
const botonGuardarBorrador = document.getElementById('boton-guardar-borrador');
if (botonGuardarBorrador) {
  botonGuardarBorrador.addEventListener('click', function() {
    console.log('Guardando borrador...');
    // TODO: POST /api/vendedor/productos/borrador
    alert('✅ Borrador guardado — pendiente conectar con Spring Boot');
  });
}


// ----------------------------------------------------------------
// GUARDAR DATOS DE EMPRESA
// ----------------------------------------------------------------
const botonGuardarEmpresa = document.getElementById('boton-guardar-empresa');
if (botonGuardarEmpresa) {
  botonGuardarEmpresa.addEventListener('click', function() {
    const datosEmpresa = {
      nombre:      document.getElementById('emp-nombre').value.trim(),
      ciudad:      document.getElementById('emp-ciudad').value,
      descripcion: document.getElementById('emp-descripcion').value.trim()
    };
    console.log('Actualizando empresa:', datosEmpresa);
    // TODO: PUT /api/vendedor/empresa
    alert('✅ Datos de empresa actualizados — pendiente conectar con Spring Boot');
  });
}


// ----------------------------------------------------------------
// MARCAR PEDIDO COMO ENVIADO
// ----------------------------------------------------------------
document.querySelectorAll('#boton-marcar-enviado').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const fila   = this.closest('tr');
    const badge  = fila.querySelector('.badge-estado');
    badge.className   = 'badge-estado badge-enviado';
    badge.textContent = 'Enviado';
    this.remove();
    // TODO: PUT /api/vendedor/pedidos/{id}/enviar
  });
});


// ----------------------------------------------------------------
// BUSQUEDA EN MIS PRODUCTOS
// ----------------------------------------------------------------
const inputBuscarMiProducto = document.getElementById('buscar-mi-producto');
if (inputBuscarMiProducto) {
  inputBuscarMiProducto.addEventListener('input', function() {
    const termino = this.value.toLowerCase();
    document.querySelectorAll('#tabla-mis-productos tr').forEach(function(fila) {
      fila.style.display = fila.textContent.toLowerCase().includes(termino) ? '' : 'none';
    });
  });
}


console.log('✅ scripts_Vendedor.js cargado correctamente');