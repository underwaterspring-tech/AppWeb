
const API_BASE = 'http://localhost:8080/api/admin';


// ----------------------------------------------------------------
// NAVEGACION DEL SIDEBAR
// ----------------------------------------------------------------
const enlacesSidebar    = document.querySelectorAll('.sidebar-enlace');
const seccionesPanel    = document.querySelectorAll('.seccion-panel');
const tituloSeccion     = document.getElementById('titulo-seccion-actual');
const subtituloSeccion  = document.getElementById('subtitulo-seccion-actual');

const infoSecciones = {
  dashboard:      { titulo: 'Dashboard',           subtitulo: 'Resumen general del marketplace' },
  empresas:       { titulo: 'Empresas',             subtitulo: 'Aprueba, rechaza y gestiona las empresas vendedoras' },
  usuarios:       { titulo: 'Usuarios',             subtitulo: 'Administra compradores y vendedores' },
  productos:      { titulo: 'Productos',            subtitulo: 'Todos los productos publicados en el marketplace' },
  pedidos:        { titulo: 'Pedidos',              subtitulo: 'Todos los pedidos del marketplace' },
  reportes:       { titulo: 'Reportes',             subtitulo: 'Estadísticas y métricas del marketplace' },
  configuracion:  { titulo: 'Configuración',        subtitulo: 'Ajustes generales de NexoShop' }
};

enlacesSidebar.forEach(function(enlace) {
  enlace.addEventListener('click', function(e) {
    e.preventDefault();
    const seccionId = this.dataset.seccion;
    cambiarSeccion(seccionId);

    // Cargamos usuarios al entrar a esa sección
    if (seccionId === 'usuarios') cargarUsuarios();
  });
});

function cambiarSeccion(seccionId) {
  enlacesSidebar.forEach(e => e.classList.remove('activo'));
  const enlaceActivo = document.querySelector(`.sidebar-enlace[data-seccion="${seccionId}"]`);
  if (enlaceActivo) enlaceActivo.classList.add('activo');

  seccionesPanel.forEach(s => s.classList.remove('activa'));
  const seccionActiva = document.getElementById('seccion-' + seccionId);
  if (seccionActiva) seccionActiva.classList.add('activa');

  if (infoSecciones[seccionId]) {
    tituloSeccion.textContent    = infoSecciones[seccionId].titulo;
    subtituloSeccion.textContent = infoSecciones[seccionId].subtitulo;
  }
}

document.querySelectorAll('.panel-card-enlace[data-ir-a]').forEach(function(enlace) {
  enlace.addEventListener('click', function(e) {
    e.preventDefault();
    cambiarSeccion(this.dataset.irA);
  });
});


// ----------------------------------------------------------------
// CARGAR USUARIOS DESDE LA API
// GET /api/admin/usuarios
// ----------------------------------------------------------------
async function cargarUsuarios(filtroRol = null) {
  const tbody = document.querySelector('#seccion-usuarios .tabla-admin tbody');
  if (!tbody) return;

  // Indicador de carga
  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center;padding:24px;color:#888;font-size:0.85rem;">
        Cargando usuarios…
      </td>
    </tr>`;

  try {
    const url = filtroRol && filtroRol !== 'todos'
      ? `${API_BASE}/usuarios?rol=${filtroRol}`
      : `${API_BASE}/usuarios`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const usuarios = await respuesta.json();
    renderizarTablaUsuarios(usuarios, tbody);

  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:24px;color:#c8452d;font-size:0.85rem;">
          ⚠ No se pudo conectar con la API. Verifica que el servidor esté activo.
        </td>
      </tr>`;
  }
}

// ----------------------------------------------------------------
// RENDERIZAR FILAS DE USUARIOS
// ----------------------------------------------------------------
function renderizarTablaUsuarios(usuarios, tbody) {
  if (!usuarios.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:24px;color:#888;font-size:0.85rem;">
          No hay usuarios registrados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = '';

  usuarios.forEach(function(u) {
    const iniciales  = obtenerIniciales(u.nombre);
    const colorAvatar = generarColor(u.nombre);
    const rolBadge   = u.rol === 'VENDEDOR'
      ? `<span class="badge-rol badge-vendedor">Vendedor</span>`
      : `<span class="badge-rol badge-comprador">Comprador</span>`;
    const estadoBadge = u.activo
      ? `<span class="badge-estado badge-entregado">Activo</span>`
      : `<span class="badge-estado badge-cancelado">Suspendido</span>`;
    const botonAccion = u.activo
      ? `<button class="boton-accion-tabla boton-suspender-tabla"
           title="Suspender" data-id="${u.id}" data-accion="suspender">⏸</button>`
      : `<button class="boton-accion-tabla boton-activar-tabla"
           title="Reactivar" data-id="${u.id}" data-accion="activar">▶</button>`;

    // Formateamos la fecha
    const fecha = u.fechaRegistro
      ? new Date(u.fechaRegistro).toLocaleDateString('es-CO')
      : '—';

    const fila = document.createElement('tr');
    fila.dataset.id = u.id;
    fila.innerHTML = `
      <td>
        <div class="celda-usuario">
          <div class="usuario-tabla-avatar" style="background:${colorAvatar}">${iniciales}</div>
          <span>${u.nombre}</span>
        </div>
      </td>
      <td class="celda-gris">${u.email}</td>
      <td>${rolBadge}</td>
      <td class="celda-gris">${u.telefono || '—'}</td>
      <td class="celda-gris">${fecha}</td>
      <td>${estadoBadge}</td>
      <td>
        <div class="acciones-tabla">
          <button class="boton-accion-tabla boton-ver-tabla" title="Ver perfil"
            data-id="${u.id}">👁</button>
          ${botonAccion}
        </div>
      </td>`;

    tbody.appendChild(fila);
  });

  // Registramos eventos en los botones recién creados
  registrarEventosTablaUsuarios(tbody);
}

// ----------------------------------------------------------------
// EVENTOS: SUSPENDER / ACTIVAR DESDE LA TABLA
// ----------------------------------------------------------------
function registrarEventosTablaUsuarios(tbody) {
  tbody.querySelectorAll('[data-accion]').forEach(function(boton) {
    boton.addEventListener('click', function() {
      const id     = this.dataset.id;
      const accion = this.dataset.accion;

      const esSuspender = accion === 'suspender';
      abrirModal(
        esSuspender ? '¿Suspender usuario?' : '¿Reactivar usuario?',
        esSuspender
          ? 'El usuario no podrá acceder a la plataforma.'
          : 'El usuario podrá volver a acceder a la plataforma.',
        !esSuspender,
        function() { cambiarEstadoUsuario(id, accion); }
      );
    });
  });
}

async function cambiarEstadoUsuario(id, accion) {
  try {
    const respuesta = await fetch(`${API_BASE}/usuarios/${id}/${accion}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const datos = await respuesta.json();
    mostrarNotificacionExito(
      accion === 'suspender'
        ? '⏸ Usuario suspendido correctamente.'
        : '▶ Usuario reactivado correctamente.'
    );

    // Recargamos la tabla para reflejar el cambio
    const filtroActual = document.getElementById('filtro-rol-usuarios')?.value || 'todos';
    cargarUsuarios(filtroActual);

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    mostrarNotificacionExito('⚠ Error al conectar con la API.');
  }
}


// ----------------------------------------------------------------
// MODAL DE CONFIRMACION
// ----------------------------------------------------------------
const modal               = document.getElementById('modal-confirmacion');
const modalTitulo         = document.getElementById('modal-titulo');
const modalMensaje        = document.getElementById('modal-mensaje');
const modalBotonConfirmar = document.getElementById('modal-boton-confirmar');
const modalBotonCancelar  = document.getElementById('modal-boton-cancelar');
let accionPendiente       = null;

function abrirModal(titulo, mensaje, esAprobacion, funcionConfirmar) {
  modalTitulo.textContent  = titulo;
  modalMensaje.textContent = mensaje;
  accionPendiente          = funcionConfirmar;
  modalBotonConfirmar.className    = esAprobacion ? 'confirmar-verde' : '';
  modalBotonConfirmar.textContent  = esAprobacion ? 'Sí, activar' : 'Sí, suspender';
  modal.style.display = 'flex';
}

function cerrarModal() {
  modal.style.display = 'none';
  accionPendiente     = null;
}

modalBotonCancelar.addEventListener('click', cerrarModal);
modal.addEventListener('click', function(e) {
  if (e.target === modal) cerrarModal();
});
modalBotonConfirmar.addEventListener('click', function() {
  if (accionPendiente) accionPendiente();
  cerrarModal();
});


// ----------------------------------------------------------------
// APROBAR / RECHAZAR EMPRESAS (lógica original conservada)
// ----------------------------------------------------------------
document.querySelectorAll('.boton-aprobar').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const idEmpresa = this.dataset.id;
    abrirModal(
      '¿Aprobar empresa?',
      'La empresa podrá publicar productos en el marketplace de inmediato.',
      true,
      function() { aprobarEmpresa(idEmpresa); }
    );
  });
});

document.querySelectorAll('.boton-rechazar').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const idEmpresa = this.dataset.id;
    abrirModal(
      '¿Rechazar empresa?',
      'La empresa no podrá publicar productos.',
      false,
      function() { rechazarEmpresa(idEmpresa); }
    );
  });
});

function aprobarEmpresa(id) {
  document.querySelectorAll('.fila-empresa-pendiente').forEach(function(fila) {
    if (fila.querySelector(`.boton-aprobar[data-id="${id}"]`)) {
      fila.style.opacity = '0';
      fila.style.transition = 'opacity 0.3s';
      setTimeout(() => fila.remove(), 300);
    }
  });
  actualizarBadgeEmpresas();
  mostrarNotificacionExito('✓ Empresa aprobada.');
}

function rechazarEmpresa(id) {
  document.querySelectorAll('.fila-empresa-pendiente').forEach(function(fila) {
    if (fila.querySelector(`.boton-rechazar[data-id="${id}"]`)) {
      fila.style.opacity = '0';
      fila.style.transition = 'opacity 0.3s';
      setTimeout(() => fila.remove(), 300);
    }
  });
  actualizarBadgeEmpresas();
  mostrarNotificacionExito('✕ Empresa rechazada.');
}

function actualizarBadgeEmpresas() {
  const badge = document.querySelector('.sidebar-badge-amarillo');
  const pendientes = document.querySelectorAll('.fila-empresa-pendiente').length - 1;
  if (badge) badge.textContent = Math.max(pendientes, 0);
}


// ----------------------------------------------------------------
// NOTIFICACION TOAST
// ----------------------------------------------------------------
function mostrarNotificacionExito(mensaje) {
  let toast = document.getElementById('toast-admin');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-admin';
    toast.style.cssText = `
      position:fixed;bottom:24px;right:24px;
      background:#111;border:1px solid rgba(45,110,45,0.4);
      color:#4caf50;padding:14px 20px;
      font-size:0.82rem;font-weight:700;
      letter-spacing:0.04em;z-index:999;
      font-family:var(--fuente-cuerpo);
      transition:opacity 0.3s;max-width:320px;`;
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}


// ----------------------------------------------------------------
// BÚSQUEDAS EN TABLAS
// ----------------------------------------------------------------
document.getElementById('buscar-empresa')?.addEventListener('input', function() {
  filtrarFilasTabla(document.getElementById('tabla-cuerpo-empresas'), this.value);
});

document.getElementById('buscar-usuario')?.addEventListener('input', function() {
  filtrarFilasTabla(
    document.querySelector('#seccion-usuarios .tabla-admin tbody'), this.value);
});

document.getElementById('buscar-producto')?.addEventListener('input', function() {
  filtrarFilasTabla(
    document.querySelector('#seccion-productos .tabla-admin tbody'), this.value);
});

document.getElementById('buscar-pedido')?.addEventListener('input', function() {
  filtrarFilasTabla(
    document.querySelector('#seccion-pedidos .tabla-admin tbody'), this.value);
});

function filtrarFilasTabla(cuerpo, termino) {
  if (!cuerpo) return;
  const t = termino.toLowerCase();
  cuerpo.querySelectorAll('tr').forEach(function(fila) {
    fila.style.display = fila.textContent.toLowerCase().includes(t) ? '' : 'none';
  });
}


// ----------------------------------------------------------------
// FILTRO POR ROL (recarga desde API)
// ----------------------------------------------------------------
document.getElementById('filtro-rol-usuarios')?.addEventListener('change', function() {
  cargarUsuarios(this.value);
});


// ----------------------------------------------------------------
// FILTRO ESTADO EMPRESAS
// ----------------------------------------------------------------
document.getElementById('filtro-estado-empresas')?.addEventListener('change', function() {
  const estado = this.value.toLowerCase();
  document.querySelectorAll('#tabla-cuerpo-empresas tr').forEach(function(fila) {
    if (estado === 'todas') { fila.style.display = ''; return; }
    const badge = fila.querySelector('.badge-estado');
    fila.style.display = badge?.textContent.toLowerCase().includes(estado) ? '' : 'none';
  });
});


// ----------------------------------------------------------------
// CERRAR SESIÓN
// ----------------------------------------------------------------
document.getElementById('boton-cerrar-sesion-admin')?.addEventListener('click', function() {
  if (confirm('¿Cerrar sesión?')) {
    localStorage.removeItem('nexoshop-token');
    localStorage.removeItem('nexoshop-rol');
    window.location.href = 'login.html';
  }
});


// ----------------------------------------------------------------
// NOTIFICACIONES
// ----------------------------------------------------------------
document.getElementById('boton-notificaciones')?.addEventListener('click', function() {
  alert('🔔 Notificaciones — próximamente');
});


// ----------------------------------------------------------------
// UTILIDADES
// ----------------------------------------------------------------
function obtenerIniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ');
  return partes.length >= 2
    ? (partes[0][0] + partes[1][0]).toUpperCase()
    : partes[0].substring(0, 2).toUpperCase();
}

// Genera un color consistente a partir del nombre (mismo nombre = mismo color)
function generarColor(nombre) {
  const colores = ['#c8452d', '#1a3a6e', '#2d6e2d', '#7c5a3c', '#6b3a7d', '#b5820a'];
  let hash = 0;
  for (let i = 0; i < (nombre || '').length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colores[Math.abs(hash) % colores.length];
}


// ----------------------------------------------------------------
// INICIO: cargamos usuarios si la sección ya está activa al cargar
// ----------------------------------------------------------------
if (document.querySelector('#seccion-usuarios.activa')) {
  cargarUsuarios();
}

console.log('✅ scripts_Admin.js cargado — conectado a', API_BASE);