
// ----------------------------------------------------------------
// VARIABLES GLOBALES
// ----------------------------------------------------------------
const formNuevoProducto    = document.getElementById('form-nuevo-producto');
const alertaExitoProducto  = document.getElementById('alerta-exito-producto');
const alertaErrorProducto  = document.getElementById('alerta-error-producto');
const botonGuardarBorrador = document.getElementById('boton-guardar-borrador');


// ----------------------------------------------------------------
// CONFIGURACION DE SECCIONES DEL VENDEDOR
// ----------------------------------------------------------------
const infoSeccionesVendedor = {
  'dashboard-vendedor': { titulo: 'Dashboard',           subtitulo: 'Resumen de tu tienda' },
  'mis-productos':      { titulo: 'Mis Productos',       subtitulo: 'Productos publicados en el marketplace' },
  'nuevo-producto':     { titulo: 'Agregar Producto',    subtitulo: 'Completa todos los campos para publicar tu producto' },
  'mis-pedidos':        { titulo: 'Mis Pedidos',         subtitulo: 'Pedidos recibidos en tu tienda' },
  'mi-empresa':         { titulo: 'Datos de Mi Empresa', subtitulo: 'Información pública de tu tienda en el marketplace' },
  'mis-ventas':         { titulo: 'Mis Ventas',          subtitulo: 'Historial de ventas y ganancias de tu tienda' }
};

document.querySelectorAll('.sidebar-enlace').forEach(function(enlace) {
  enlace.addEventListener('click', function() {
    const seccionId = this.dataset.seccion;

    if (infoSeccionesVendedor[seccionId]) {
      document.getElementById('titulo-seccion-actual').textContent    = infoSeccionesVendedor[seccionId].titulo;
      document.getElementById('subtitulo-seccion-actual').textContent = infoSeccionesVendedor[seccionId].subtitulo;
    }

    if (seccionId === 'mis-productos') {
      cargarMisProductos();
    }
  });
});


// ----------------------------------------------------------------
// NAVEGACION ENTRE SECCIONES
// ----------------------------------------------------------------
const botonIrNuevoProducto = document.getElementById('boton-ir-nuevo-producto');
if (botonIrNuevoProducto) {
  botonIrNuevoProducto.addEventListener('click', function() {
    cambiarSeccion('nuevo-producto');
  });
}

const botonVolverProductos = document.getElementById('boton-volver-productos');
if (botonVolverProductos) {
  botonVolverProductos.addEventListener('click', function() {
    cambiarSeccion('mis-productos');
  });
}

document.querySelectorAll('.panel-card-enlace[data-ir-a]').forEach(function(enlace) {
  enlace.addEventListener('click', function(e) {
    e.preventDefault();
    if (this.dataset.irA === 'mis-productos') cargarMisProductos();
    cambiarSeccion(this.dataset.irA);
  });
});


// ----------------------------------------------------------------
// SELECTOR DE TALLAS
// ----------------------------------------------------------------
const botonesTallaForm        = document.querySelectorAll('.boton-talla-form');
const contenedorStockPorTalla = document.getElementById('contenedor-stock-por-talla');
const grillaSockTallas        = document.getElementById('grilla-stock-tallas');
let tallasSeleccionadas       = [];

botonesTallaForm.forEach(function(boton) {
  boton.addEventListener('click', function() {
    const talla = this.dataset.talla;
    this.classList.toggle('activo');

    if (this.classList.contains('activo')) {
      tallasSeleccionadas.push(talla);
      agregarCampoStockTalla(talla);
    } else {
      tallasSeleccionadas = tallasSeleccionadas.filter(t => t !== talla);
      quitarCampoStockTalla(talla);
    }

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
const zonaCargaPrincipal = document.getElementById('zona-carga-principal');
const inputImagenes      = document.getElementById('input-imagenes');
const previsualizacion   = document.getElementById('previsualizacion-imagenes');

if (zonaCargaPrincipal) {
  zonaCargaPrincipal.addEventListener('click', function() {
    inputImagenes.click();
  });

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

    const lector = new FileReader();
    lector.onload = function(e) {
      miniatura.style.backgroundImage    = `url(${e.target.result})`;
      miniatura.style.backgroundSize     = 'cover';
      miniatura.style.backgroundPosition = 'center';
    };
    lector.readAsDataURL(archivo);

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
// VALIDACIONES DEL FORMULARIO DE PRODUCTO
// ----------------------------------------------------------------
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
// HELPER: construir objeto con datos del formulario
// ----------------------------------------------------------------
function construirDatosProducto() {
  const coloresSeleccionados = Array.from(
    document.querySelectorAll('#selector-colores-form input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  // Recoger stock por talla
  const stockPorTalla = {};
  tallasSeleccionadas.forEach(function(talla) {
    const input = document.querySelector(`#stock-talla-${talla} input`);
    stockPorTalla[talla] = input ? parseInt(input.value) || 0 : 0;
  });

  // Stock total = suma de todos las tallas
  const stockTotal = Object.values(stockPorTalla).reduce((a, b) => a + b, 0);

  const datos = {
    nombre:          document.getElementById('prod-nombre').value.trim(),
    marca:           document.getElementById('prod-marca').value,
    categoria:       document.getElementById('prod-categoria').value,
    genero:          document.getElementById('prod-genero').value,
    descripcion:     document.getElementById('prod-descripcion').value.trim(),
    precio:          parseInt(document.getElementById('prod-precio').value)           || 0,
    precioDescuento: parseInt(document.getElementById('prod-precio-descuento').value) || null,
    tallas:          tallasSeleccionadas,
    stockPorTalla:   stockPorTalla,   // { "44": 3, "45": 5 }
    stock:           stockTotal,      // total general
    colores:         coloresSeleccionados,
    publicar:        document.getElementById('toggle-publicar').checked,
    vendedorId:      localStorage.getItem('nexoshop-id'),
    empresaId:       localStorage.getItem('nexoshop-empresaId') || null
  };

  console.log('📦 Datos del producto:', datos);
  return datos;
}

// ----------------------------------------------------------------
// ENVIO DEL FORMULARIO — PUBLICAR PRODUCTO
// ----------------------------------------------------------------
if (formNuevoProducto) {
  formNuevoProducto.addEventListener('submit', async function(e) {
    e.preventDefault();
    alertaExitoProducto.style.display = 'none';
    alertaErrorProducto.style.display = 'none';

    console.log('🚀 Submit disparado');

    if (!validarFormProducto()) {
      alertaErrorProducto.style.display = 'block';
      return;
    }

    const datosProducto = construirDatosProducto();

    try {
      console.log('📡 Enviando al backend...');

      const respuesta = await fetch('/api/vendedor/productos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(datosProducto)
      });

      console.log('📬 Status HTTP:', respuesta.status);
      const data = await respuesta.json();
      console.log('📄 Respuesta del backend:', data);

      if (respuesta.ok && data.exito) {
        alertaExitoProducto.textContent   = '✅ ' + data.mensaje;
        alertaExitoProducto.style.display = 'block';
        limpiarFormularioProducto();
        setTimeout(() => cambiarSeccion('mis-productos'), 2000);
      } else {
        alertaErrorProducto.textContent   = '❌ ' + (data.mensaje || 'Error al publicar.');
        alertaErrorProducto.style.display = 'block';
      }

    } catch (error) {
      console.error('❌ Error de red:', error);
      alertaErrorProducto.textContent   = '❌ No se pudo conectar con el servidor.';
      alertaErrorProducto.style.display = 'block';
    }
  });
}


// ----------------------------------------------------------------
// GUARDAR BORRADOR
// ----------------------------------------------------------------
if (botonGuardarBorrador) {
  botonGuardarBorrador.addEventListener('click', async function() {
    const datosProducto = construirDatosProducto();
    console.log('💾 Guardando borrador:', datosProducto);

    try {
      const respuesta = await fetch('/api/vendedor/productos/borrador', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(datosProducto)
      });

      const data = await respuesta.json();
      alert(data.exito ? '✅ ' + data.mensaje : '❌ ' + data.mensaje);

    } catch (error) {
      alert('❌ No se pudo conectar con el servidor.');
    }
  });
}


// ----------------------------------------------------------------
// LIMPIAR FORMULARIO DESPUES DE PUBLICAR
// ----------------------------------------------------------------
function limpiarFormularioProducto() {
  formNuevoProducto.reset();
  tallasSeleccionadas = [];
  document.querySelectorAll('.boton-talla-form').forEach(b => b.classList.remove('activo'));
  if (grillaSockTallas)        grillaSockTallas.innerHTML        = '';
  if (contenedorStockPorTalla) contenedorStockPorTalla.style.display = 'none';
  if (previsualizacion)        previsualizacion.innerHTML        = '';
  formNuevoProducto.dataset.editandoId = '';
}


// ----------------------------------------------------------------
// CARGAR MIS PRODUCTOS DESDE EL BACKEND
// ----------------------------------------------------------------
function cargarMisProductos() {
  const vendedorId = localStorage.getItem('nexoshop-id');
  if (!vendedorId) return;

  fetch(`/api/vendedor/productos?vendedorId=${vendedorId}`)
    .then(res => res.json())
    .then(productos => renderizarTablaProductos(productos))
    .catch(err => console.error('Error cargando productos:', err));
}

function renderizarTablaProductos(productos) {
  const tbody = document.getElementById('tabla-mis-productos');
  if (!tbody) return;

  const subtitulo = document.querySelector('#seccion-mis-productos .seccion-panel-subtitulo');
  if (subtitulo) subtitulo.textContent = `${productos.length} productos publicados en el marketplace`;

  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:32px;color:var(--color-gris-medio)">
          No tienes productos aún.
          <a href="#" onclick="cambiarSeccion('nuevo-producto')"
             style="color:var(--color-rojo)">Agrega tu primer producto →</a>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr data-id="${p.id}">
      <td>
        <div class="celda-producto">
          <span class="producto-tabla-emoji">👟</span>
          <div>
            <p class="producto-tabla-nombre">${p.nombre}</p>
            <p class="producto-tabla-marca">${p.marca}</p>
          </div>
        </div>
      </td>
      <td>$${p.precio.toLocaleString('es-CO')}</td>
      <td>
        <span class="${p.stock > 0 ? 'stock-disponible' : 'stock-agotado'}">
          ${p.stock} und
        </span>
      </td>
      <td class="celda-gris">${p.tallas ? p.tallas.join(', ') : '—'}</td>
      <td>—</td>
      <td>${badgeEstado(p.estado)}</td>
      <td>
        <div class="acciones-tabla">
          <button class="boton-accion-tabla boton-ver-tabla" title="Ver">👁</button>
          <button class="boton-accion-tabla boton-editar-tabla"
                  title="Editar"
                  onclick="editarProducto('${p.id}')">✏️</button>
          <button class="boton-accion-tabla boton-suspender-tabla"
                  title="${p.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}"
                  onclick="toggleEstadoProducto('${p.id}', '${p.estado}')">
            ${p.estado === 'ACTIVO' ? '⏸' : '▶'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function badgeEstado(estado) {
  const map = {
    'ACTIVO':     { clase: 'badge-entregado', texto: 'Activo' },
    'BORRADOR':   { clase: 'badge-procesando', texto: 'Borrador' },
    'SUSPENDIDO': { clase: 'badge-cancelado',  texto: 'Suspendido' }
  };
  const b = map[estado] || { clase: '', texto: estado };
  return `<span class="badge-estado ${b.clase}">${b.texto}</span>`;
}


// ----------------------------------------------------------------
// TOGGLE ESTADO: ACTIVO ↔ SUSPENDIDO
// ----------------------------------------------------------------
function toggleEstadoProducto(id, estadoActual) {
  const nuevoEstado = estadoActual === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';

  fetch(`/api/vendedor/productos/${id}/estado`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ estado: nuevoEstado })
  })
  .then(res => res.json())
  .then(data => {
    if (data.exito) cargarMisProductos();
  })
  .catch(err => console.error('Error cambiando estado:', err));
}


// ----------------------------------------------------------------
// EDITAR PRODUCTO
// ----------------------------------------------------------------
function editarProducto(id) {
  fetch(`/api/vendedor/productos/${id}`)
    .then(res => res.json())
    .then(p => {
      document.getElementById('prod-nombre').value      = p.nombre      || '';
      document.getElementById('prod-marca').value       = p.marca       || '';
      document.getElementById('prod-categoria').value   = p.categoria   || '';
      document.getElementById('prod-genero').value      = p.genero      || '';
      document.getElementById('prod-descripcion').value = p.descripcion || '';
      document.getElementById('prod-precio').value      = p.precio      || '';
      document.getElementById('prod-precio-descuento').value = p.precioDescuento || '';

      tallasSeleccionadas = p.tallas || [];
      if (grillaSockTallas) grillaSockTallas.innerHTML = '';
      document.querySelectorAll('.boton-talla-form').forEach(btn => {
        if (tallasSeleccionadas.includes(btn.dataset.talla)) {
          btn.classList.add('activo');
          agregarCampoStockTalla(btn.dataset.talla);
        } else {
          btn.classList.remove('activo');
        }
      });
      if (contenedorStockPorTalla) {
        contenedorStockPorTalla.style.display = tallasSeleccionadas.length > 0 ? 'block' : 'none';
      }

      document.querySelectorAll('#selector-colores-form input[type="checkbox"]')
        .forEach(cb => { cb.checked = p.colores && p.colores.includes(cb.value); });

      formNuevoProducto.dataset.editandoId = id;
      cambiarSeccion('nuevo-producto');
    })
    .catch(err => console.error('Error cargando producto:', err));
}


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


// ----------------------------------------------------------------
// MARCAR PEDIDO COMO ENVIADO
// ----------------------------------------------------------------
document.querySelectorAll('.boton-accion-tabla.boton-activar-tabla').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const fila  = this.closest('tr');
    const badge = fila.querySelector('.badge-estado');
    badge.className   = 'badge-estado badge-enviado';
    badge.textContent = 'Enviado';
    this.remove();
    // TODO: PUT /api/vendedor/pedidos/{id}/enviar
  });
});


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
// CARGAR PRODUCTOS AL INICIAR SI YA ESTAMOS EN ESA SECCION
// ----------------------------------------------------------------
if (document.querySelector('#seccion-mis-productos.activa')) {
  cargarMisProductos();
}


console.log('✅ scripts_Vendedor.js cargado correctamente');