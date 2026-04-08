/* ================================================================
   SCRIPTS_COMPRADOR.JS — NexoShop
   Maneja: filtros pedidos, modal reseña, favoritos,
   datos personales, contraseña, direcciones, espera aprobación
================================================================ */


// ----------------------------------------------------------------
// FILTROS DE ESTADO EN MIS PEDIDOS
// ----------------------------------------------------------------
const filtrosBtnEstado = document.querySelectorAll('.filtro-estado-btn');
const tarjetasPedido   = document.querySelectorAll('.tarjeta-pedido');

filtrosBtnEstado.forEach(function(boton) {
  boton.addEventListener('click', function() {
    filtrosBtnEstado.forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');
    const estadoFiltro = this.dataset.estado;
    tarjetasPedido.forEach(function(tarjeta) {
      tarjeta.style.display = (estadoFiltro === 'todos' || tarjeta.dataset.estado === estadoFiltro) ? '' : 'none';
    });
  });
});


// ----------------------------------------------------------------
// CANCELAR PEDIDO
// ----------------------------------------------------------------
document.querySelectorAll('.btn-pedido-cancelar').forEach(function(boton) {
  boton.addEventListener('click', function() {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) return;
    const tarjeta = this.closest('.tarjeta-pedido');
    const badge   = tarjeta?.querySelector('.badge-pedido');
    if (badge) { badge.className = 'badge-pedido badge-cancelado'; badge.textContent = '✕ Cancelado'; }
    if (tarjeta) tarjeta.dataset.estado = 'cancelado';
    this.remove();
    mostrarToast('Pedido cancelado. Te notificaremos por correo.');
    /* TODO: PUT /api/comprador/pedidos/{id}/cancelar */
  });
});


// ----------------------------------------------------------------
// MODAL DE RESEÑA
// ----------------------------------------------------------------
const modalResena     = document.getElementById('modal-resena');
const btnCerrarModal  = document.getElementById('btn-cerrar-modal-resena');
const estrellasClick  = document.querySelectorAll('.estrella-click');
const textoValoracion = document.getElementById('texto-valoracion');
const btnEnviarResena = document.getElementById('btn-enviar-resena');
const errorResena     = document.getElementById('error-resena');
let valoracionElegida = 0;

const textoValoraciones = { 1: '😞 Muy malo', 2: '😐 Regular', 3: '🙂 Bueno', 4: '😊 Muy bueno', 5: '🤩 Excelente' };

document.querySelectorAll('.btn-dejar-resena, #btn-abrir-modal-resena').forEach(function(boton) {
  boton.addEventListener('click', function() {
    valoracionElegida = 0;
    estrellasClick.forEach(e => { e.classList.remove('activa'); e.style.color = ''; });
    if (textoValoracion) textoValoracion.textContent = 'Selecciona una valoración';
    const inputComentario = document.getElementById('input-comentario-resena');
    if (inputComentario) inputComentario.value = '';
    if (errorResena) errorResena.textContent = '';
    if (modalResena) modalResena.style.display = 'flex';
  });
});

if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => { if (modalResena) modalResena.style.display = 'none'; });
if (modalResena) modalResena.addEventListener('click', e => { if (e.target === modalResena) modalResena.style.display = 'none'; });

estrellasClick.forEach(function(estrella) {
  estrella.addEventListener('mouseenter', function() {
    const val = parseInt(this.dataset.valor);
    estrellasClick.forEach(e => e.style.color = parseInt(e.dataset.valor) <= val ? 'var(--color-amarillo)' : '');
    if (textoValoracion) textoValoracion.textContent = textoValoraciones[val] || '';
  });
  estrella.addEventListener('mouseleave', function() {
    estrellasClick.forEach(e => e.style.color = parseInt(e.dataset.valor) <= valoracionElegida ? 'var(--color-amarillo)' : '');
    if (textoValoracion) textoValoracion.textContent = valoracionElegida > 0 ? textoValoraciones[valoracionElegida] : 'Selecciona una valoración';
  });
  estrella.addEventListener('click', function() {
    valoracionElegida = parseInt(this.dataset.valor);
    estrellasClick.forEach(e => e.classList.toggle('activa', parseInt(e.dataset.valor) <= valoracionElegida));
    if (textoValoracion) textoValoracion.textContent = textoValoraciones[valoracionElegida];
  });
});

if (btnEnviarResena) {
  btnEnviarResena.addEventListener('click', function() {
    const texto = document.getElementById('input-comentario-resena')?.value.trim();
    if (valoracionElegida === 0) { if (errorResena) errorResena.textContent = 'Selecciona una valoración'; return; }
    if (!texto) { if (errorResena) errorResena.textContent = 'Escribe un comentario'; return; }
    if (errorResena) errorResena.textContent = '';
    /* TODO: POST /api/resenas */
    if (modalResena) modalResena.style.display = 'none';
    mostrarToast('⭐ ¡Reseña publicada! Gracias por tu opinión.');
  });
}


// ----------------------------------------------------------------
// QUITAR FAVORITOS
// ----------------------------------------------------------------
document.querySelectorAll('.btn-quitar-favorito').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const tarjeta = this.closest('.tarjeta-favorito');
    if (!tarjeta) return;
    tarjeta.style.cssText = 'opacity:0; transform:scale(0.9); transition:all 0.3s ease';
    setTimeout(() => {
      tarjeta.remove();
      const grilla = document.getElementById('grilla-favoritos');
      if (grilla && grilla.querySelectorAll('.tarjeta-favorito').length === 0) {
        grilla.style.display = 'none';
        const vacio = document.getElementById('favoritos-vacio');
        if (vacio) vacio.style.display = 'block';
      }
    }, 300);
    /* TODO: DELETE /api/favoritos/{productoId} */
  });
});


// ----------------------------------------------------------------
// GUARDAR DATOS PERSONALES
// ----------------------------------------------------------------
const formDatos = document.getElementById('form-datos-personales');
if (formDatos) {
  formDatos.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre  = document.getElementById('cuenta-nombre')?.value.trim();
    const email   = document.getElementById('cuenta-email')?.value.trim();
    if (!nombre || !email) { alert('El nombre y correo son obligatorios'); return; }
    /* TODO: PUT /api/comprador/perfil */
    const exito = document.getElementById('exito-datos');
    if (exito) { exito.style.display = 'block'; setTimeout(() => exito.style.display = 'none', 3000); }
  });
}


// ----------------------------------------------------------------
// CAMBIAR CONTRASEÑA
// ----------------------------------------------------------------
const formPassword = document.getElementById('form-cambiar-password');
if (formPassword) {
  formPassword.addEventListener('submit', function(e) {
    e.preventDefault();
    const actual    = document.getElementById('pass-actual')?.value;
    const nueva     = document.getElementById('pass-nueva')?.value;
    const confirmar = document.getElementById('pass-confirmar')?.value;
    const error     = document.getElementById('error-password');
    if (!actual || !nueva || !confirmar) { if (error) error.textContent = 'Completa todos los campos'; return; }
    if (nueva !== confirmar) { if (error) error.textContent = 'Las contraseñas no coinciden'; return; }
    if (nueva.length < 8)    { if (error) error.textContent = 'Mínimo 8 caracteres'; return; }
    if (error) error.textContent = '';
    /* TODO: PUT /api/comprador/cambiar-password */
    const exito = document.getElementById('exito-password');
    if (exito) { exito.style.display = 'block'; setTimeout(() => exito.style.display = 'none', 3000); }
    formPassword.reset();
  });
}


// ----------------------------------------------------------------
// MOSTRAR/OCULTAR CONTRASEÑA
// ----------------------------------------------------------------
document.querySelectorAll('.btn-toggle-password').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const campo = document.getElementById(this.dataset.target);
    if (!campo) return;
    campo.type       = campo.type === 'password' ? 'text' : 'password';
    this.textContent = campo.type === 'password' ? '👁' : '🙈';
  });
});


// ----------------------------------------------------------------
// NUEVA DIRECCIÓN
// ----------------------------------------------------------------
function abrirFormDireccion() {
  alert('Aquí irá el formulario de nueva dirección 📍\nPendiente: conectar con Spring Boot\nEndpoint: POST /api/comprador/direcciones');
}
const tarjetaNuevaDir   = document.getElementById('tarjeta-nueva-dir');
const btnNuevaDireccion = document.getElementById('btn-nueva-direccion');
if (tarjetaNuevaDir)   tarjetaNuevaDir.addEventListener('click', abrirFormDireccion);
if (btnNuevaDireccion) btnNuevaDireccion.addEventListener('click', abrirFormDireccion);


// ----------------------------------------------------------------
// CERRAR SESIÓN
// ----------------------------------------------------------------
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion-cuenta');
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener('click', function() {
    if (!confirm('¿Cerrar sesión?')) return;
    localStorage.removeItem('nexoshop-token');
    localStorage.removeItem('nexoshop-rol');
    localStorage.removeItem('nexoshop-nombre');
    window.location.href = 'index.html';
  });
}


// ----------------------------------------------------------------
// ESPERA APROBACION — verificar estado
// ----------------------------------------------------------------
const btnVerificarEstado = document.getElementById('btn-verificar-estado');
if (btnVerificarEstado) {
  btnVerificarEstado.addEventListener('click', function() {
    const textoOriginal = this.textContent;
    this.textContent    = '⏳ Verificando...';
    setTimeout(() => {
      this.textContent = textoOriginal;
      mostrarToast('Tu solicitud sigue en revisión. Te notificaremos pronto.');
      /* TODO: GET /api/vendedor/estado-aprobacion */
    }, 1500);
  });
}


// ----------------------------------------------------------------
// TOAST
// ----------------------------------------------------------------
function mostrarToast(mensaje) {
  let toast = document.getElementById('toast-comprador');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-comprador';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#111;border:1px solid rgba(45,110,45,0.4);color:#4caf50;padding:14px 20px;font-size:0.82rem;font-weight:700;letter-spacing:0.04em;z-index:999;font-family:Nunito,sans-serif;transition:opacity 0.3s;max-width:320px;';
    document.body.appendChild(toast);
  }
  toast.textContent   = mensaje;
  toast.style.opacity = '1';
  setTimeout(() => toast.style.opacity = '0', 3000);
}

console.log('✅ scripts_Comprador.js cargado correctamente');