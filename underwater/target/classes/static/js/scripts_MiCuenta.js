// ================================================================
// GUARD DE SESIÓN — Usuario autenticado
// ================================================================
(function() {
  var id = localStorage.getItem('uw-id');
  if (!id) {
    window.location.replace('/login');
    throw new Error('No autenticado');
  }
})();

// ================================================================
// scripts_MiCuenta.js — Underwater
// ================================================================
document.addEventListener('DOMContentLoaded', async function() {
  if (typeof cargarMisReportes === 'function') cargarMisReportes();
  var usuarioId = localStorage.getItem('uw-id');
  var grilla    = document.getElementById('grilla-mi-cuenta');
  var sinSesion = document.getElementById('cuenta-sin-sesion');

  if (!usuarioId) {
    if (grilla)    grilla.style.display    = 'none';
    if (sinSesion) sinSesion.style.display = 'block';
    return;
  }

  // Cargar perfil
  try {
    var res  = await fetch('/api/comprador/perfil?usuarioId=' + usuarioId);
    var data = await res.json();
    var partes    = (data.nombre || '').split(' ');
    var iniciales = partes.map(function(p){ return p[0]||''; }).join('').substring(0,2).toUpperCase();

    document.getElementById('perfil-avatar').textContent          = iniciales || '--';
    document.getElementById('perfil-nombre-completo').textContent = data.nombre || '';
    document.getElementById('perfil-email').textContent           = data.email  || '';

    if (data.fechaRegistro) {
      try {
        var d = new Date(data.fechaRegistro);
        document.getElementById('perfil-miembro-desde').textContent =
          'Miembro desde ' + d.toLocaleDateString('es-CO',{year:'numeric',month:'long'});
      } catch(e) {
        document.getElementById('perfil-miembro-desde').textContent = 'Miembro desde ' + data.fechaRegistro;
      }
    }

    document.getElementById('cuenta-nombre').value    = partes[0] || '';
    document.getElementById('cuenta-apellido').value  = partes.slice(1).join(' ') || '';
    document.getElementById('cuenta-email').value     = data.email    || '';
    document.getElementById('cuenta-telefono').value  = data.telefono || '';
    document.getElementById('cuenta-direccion').value = data.direccion || '';

    if (data.direccion) {
      var grillaDirs   = document.getElementById('grilla-direcciones-cuenta');
      var tarjetaNueva = document.getElementById('tarjeta-nueva-dir');
      var tarjetaDir   = document.createElement('div');
      tarjetaDir.className = 'tarjeta-direccion-cuenta predeterminada';
      tarjetaDir.innerHTML =
        '<div class="direccion-badge-pred">✓ Predeterminada</div>'
        + '<p class="direccion-nombre">' + (data.nombre||'') + '</p>'
        + '<p class="direccion-linea">'  + data.direccion + '</p>'
        + '<p class="direccion-tel">📞 ' + (data.telefono||'—') + '</p>'
        + '<div class="direccion-acciones"><button class="btn-editar-direccion" onclick="agregarDireccion()">Editar</button></div>';
      if (grillaDirs && tarjetaNueva) grillaDirs.insertBefore(tarjetaDir, tarjetaNueva);
    }
  } catch(err) { console.warn('Error perfil:', err); }

  // Guardar datos personales
  var formDatos = document.getElementById('form-datos-personales');
  if (formDatos) formDatos.addEventListener('submit', async function(e) {
    e.preventDefault();
    var uid       = localStorage.getItem('uw-id');
    var nombre    = (document.getElementById('cuenta-nombre').value.trim() + ' ' + document.getElementById('cuenta-apellido').value.trim()).trim();
    var telefono  = document.getElementById('cuenta-telefono').value.trim();
    var direccion = document.getElementById('cuenta-direccion').value.trim();
    var exitoEl   = document.getElementById('exito-datos');
    var errorEl   = document.getElementById('error-datos');
    try {
      var res  = await fetch('/api/comprador/perfil', {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body:   JSON.stringify({ usuarioId: uid, nombre, telefono, direccion })
      });
      var data = await res.json();
      if (data.exito) {
        localStorage.setItem('uw-nombre', nombre);
        document.getElementById('perfil-nombre-completo').textContent = nombre;
        document.getElementById('perfil-avatar').textContent = nombre.split(' ').map(function(p){return p[0]||'';}).join('').substring(0,2).toUpperCase();
        if (exitoEl) { exitoEl.style.display = 'block'; setTimeout(function(){ exitoEl.style.display='none'; }, 3000); }
        if (errorEl)   errorEl.style.display = 'none';
      } else {
        if (errorEl) { errorEl.textContent = data.mensaje || 'Error al guardar'; errorEl.style.display = 'block'; }
        if (exitoEl)   exitoEl.style.display = 'none';
      }
    } catch { if (errorEl) { errorEl.textContent = 'Error de conexión'; errorEl.style.display = 'block'; } }
  });

  // Cambiar contraseña
  var formPass = document.getElementById('form-cambiar-password');
  if (formPass) formPass.addEventListener('submit', async function(e) {
    e.preventDefault();
    var uid       = localStorage.getItem('uw-id');
    var actual    = document.getElementById('pass-actual').value;
    var nueva     = document.getElementById('pass-nueva').value;
    var confirmar = document.getElementById('pass-confirmar').value;
    var errEl     = document.getElementById('error-password');
    var exitoEl   = document.getElementById('exito-password');
    if (nueva !== confirmar) { if(errEl) errEl.textContent='Las contraseñas no coinciden'; return; }
    if (nueva.length < 8)    { if(errEl) errEl.textContent='Mínimo 8 caracteres'; return; }
    if (errEl) errEl.textContent = '';
    try {
      var res  = await fetch('/api/comprador/cambiar-password', {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body:   JSON.stringify({ usuarioId: uid, passwordActual: actual, passwordNueva: nueva })
      });
      var data = await res.json();
      if (data.exito) {
        if (exitoEl) { exitoEl.style.display = 'block'; setTimeout(function(){ exitoEl.style.display='none'; }, 3000); }
        formPass.reset();
        if (errEl) errEl.textContent = '';
      } else {
        if (errEl) errEl.textContent = data.mensaje || 'Contraseña actual incorrecta';
      }
    } catch { if (errEl) errEl.textContent = 'Error de conexión'; }
  });

  // Toggle mostrar/ocultar contraseña
  document.querySelectorAll('.btn-toggle-password').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var campo = document.getElementById(this.dataset.target);
      if (!campo) return;
      campo.type       = campo.type === 'password' ? 'text' : 'password';
      this.textContent = campo.type === 'password' ? '👁' : '🙈';
    });
  });

  // Botón nueva dirección y tarjeta → abrir modal
  var btnNuevaDir = document.getElementById('btn-nueva-direccion');
  var tarjetaNew  = document.getElementById('tarjeta-nueva-dir');
  if (btnNuevaDir) btnNuevaDir.addEventListener('click', agregarDireccion);
  if (tarjetaNew)  tarjetaNew.addEventListener('click', agregarDireccion);

  // Cerrar sesión
  var btnCerrar = document.getElementById('btn-cerrar-sesion-cuenta');
  if (btnCerrar) btnCerrar.addEventListener('click', function() {
    if (!confirm('¿Cerrar sesión?')) return;
    fetch('/api/auth/logout', {method:'POST'}).catch(function(){});
    localStorage.clear();
    window.location.href = '/index';
  });
});

// ── Modal nueva dirección ─────────────────────────────────────────
function agregarDireccion() {
  var modal = document.getElementById('modal-nueva-dir');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-nueva-dir';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.addEventListener('click', function(e){ if(e.target===modal) modal.style.display='none'; });
    modal.innerHTML =
      '<div style="background:white;border:1px solid #e2e8f0;max-width:480px;width:100%;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden">'
      + '<div style="background:#F97316;height:4px"></div>'
      + '<div style="padding:32px">'
        + '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px">'
          + '<div>'
            + '<p style="font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:#c8452d;font-weight:800;margin-bottom:4px">MI CUENTA</p>'
            + '<h3 style="font-family:var(--fuente-titulos);font-size:1.8rem;letter-spacing:0.04em;color:#0f172a;line-height:1">AGREGAR DIRECCIÓN</h3>'
          + '</div>'
          + '<button onclick="document.getElementById(\'modal-nueva-dir\').style.display=\'none\'" style="background:none;border:none;color:#64748b;font-size:1.1rem;cursor:pointer">✕</button>'
        + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:14px">'
          + '<div><label style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#0f172a;font-weight:800;display:block;margin-bottom:7px">Dirección completa *</label>'
            + '<input type="text" id="modal-dir-linea" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;font-family:var(--fuente-cuerpo);padding:11px 14px;outline:none;box-sizing:border-box;font-size:0.88rem" placeholder="Calle 123 # 45-67, Apto 301"/></div>'
          + '<div><label style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#0f172a;font-weight:800;display:block;margin-bottom:7px">Ciudad *</label>'
            + '<select id="modal-dir-ciudad" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;font-family:var(--fuente-cuerpo);padding:11px 14px;outline:none;box-sizing:border-box;font-size:0.88rem">'
              + '<option value="">Selecciona ciudad</option>'
              + '<option>Bogotá</option><option>Medellín</option><option>Cali</option>'
              + '<option>Barranquilla</option><option>Cartagena</option><option>Bucaramanga</option>'
              + '<option>Pereira</option><option>Santa Marta</option><option>Manizales</option>'
            + '</select></div>'
          + '<div><label style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#0f172a;font-weight:800;display:block;margin-bottom:7px">Teléfono</label>'
            + '<input type="tel" id="modal-dir-tel" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;font-family:var(--fuente-cuerpo);padding:11px 14px;outline:none;box-sizing:border-box;font-size:0.88rem" placeholder="300 123 4567"/></div>'
          + '<p id="modal-dir-error" style="color:#c8452d;font-size:0.78rem;font-weight:700;display:none"></p>'
          + '<div style="display:flex;gap:10px">'
            + '<button onclick="guardarNuevaDireccion()" style="flex:1;padding:13px;background:#0f172a;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.78rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer">Guardar dirección</button>'
            + '<button onclick="document.getElementById(\'modal-nueva-dir\').style.display=\'none\'" style="padding:13px 20px;background:none;border:1px solid #e2e8f0;color:#64748b;font-family:var(--fuente-cuerpo);font-size:0.78rem;font-weight:700;cursor:pointer">Cancelar</button>'
          + '</div>'
        + '</div>'
      + '</div>'
    + '</div>';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
}

async function guardarNuevaDireccion() {
  var uid    = localStorage.getItem('uw-id');
  var linea  = document.getElementById('modal-dir-linea')  ? document.getElementById('modal-dir-linea').value.trim()  : '';
  var ciudad = document.getElementById('modal-dir-ciudad') ? document.getElementById('modal-dir-ciudad').value        : '';
  var tel    = document.getElementById('modal-dir-tel')    ? document.getElementById('modal-dir-tel').value.trim()    : '';
  var errEl  = document.getElementById('modal-dir-error');

  if (!linea || !ciudad) {
    if (errEl) { errEl.textContent = '⚠ Completa los campos requeridos'; errEl.style.display = 'block'; }
    return;
  }
  if (errEl) errEl.style.display = 'none';

  var dirCompleta = linea + ', ' + ciudad;
  try {
    var res  = await fetch('/api/comprador/perfil', {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body:   JSON.stringify({ usuarioId: uid, direccion: dirCompleta, telefono: tel || undefined })
    });
    var data = await res.json();
    if (data.exito) {
      var grillaDirs   = document.getElementById('grilla-direcciones-cuenta');
      var tarjetaNueva = document.getElementById('tarjeta-nueva-dir');
      var div = document.createElement('div');
      div.className = 'tarjeta-direccion-cuenta predeterminada';
      div.innerHTML =
        '<div class="direccion-badge-pred">✓ Predeterminada</div>'
        + '<p class="direccion-nombre">' + (localStorage.getItem('uw-nombre')||'') + '</p>'
        + '<p class="direccion-linea">'  + linea  + '</p>'
        + '<p class="direccion-ciudad">' + ciudad + '</p>'
        + (tel ? '<p class="direccion-tel">📞 ' + tel + '</p>' : '')
        + '<div class="direccion-acciones"><button class="btn-editar-direccion" onclick="agregarDireccion()">Editar</button></div>';
      if (grillaDirs && tarjetaNueva) grillaDirs.insertBefore(div, tarjetaNueva);
      document.getElementById('cuenta-direccion').value = dirCompleta;
      document.getElementById('modal-nueva-dir').style.display = 'none';
      document.getElementById('modal-dir-linea').value  = '';
      document.getElementById('modal-dir-ciudad').value = '';
      document.getElementById('modal-dir-tel').value    = '';
    } else {
      if (errEl) { errEl.textContent = '⚠ ' + (data.mensaje||'Error al guardar'); errEl.style.display = 'block'; }
    }
  } catch(e) {
    if (errEl) { errEl.textContent = '⚠ Error de conexión'; errEl.style.display = 'block'; }
  }
}
