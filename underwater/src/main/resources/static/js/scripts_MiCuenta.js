// ================================================================
// scripts_MiCuenta.js — Underwater
// Perfil, contraseña y dirección del comprador
// ================================================================

document.addEventListener('DOMContentLoaded', async function() {
    if (typeof cargarMisReportes === 'function') cargarMisReportes();
    var usuarioId = localStorage.getItem('uw-id');
    var grilla    = document.getElementById('grilla-mi-cuenta');
    var sinSesion = document.getElementById('cuenta-sin-sesion');

    if (!usuarioId) {
      grilla.style.display = 'none';
      sinSesion.style.display = 'block';
      return;
    }

    // Cargar perfil desde la BD
    try {
      var res  = await fetch('/api/comprador/perfil?usuarioId=' + usuarioId);
      var data = await res.json();

      var partes   = (data.nombre || '').split(' ');
      var iniciales = partes.map(function(p){return p[0]||'';}).join('').substring(0,2).toUpperCase();

      // Avatar e info breve
      document.getElementById('perfil-avatar').textContent           = iniciales || '--';
      document.getElementById('perfil-nombre-completo').textContent  = data.nombre || '';
      document.getElementById('perfil-email').textContent            = data.email  || '';

      if (data.fechaRegistro) {
        try {
          var d = new Date(data.fechaRegistro);
          document.getElementById('perfil-miembro-desde').textContent = 'Miembro desde ' + d.toLocaleDateString('es-CO',{year:'numeric',month:'long'});
        } catch { document.getElementById('perfil-miembro-desde').textContent = 'Miembro desde ' + data.fechaRegistro; }
      }

      // Formulario
      document.getElementById('cuenta-nombre').value    = partes[0] || '';
      document.getElementById('cuenta-apellido').value  = partes.slice(1).join(' ') || '';
      document.getElementById('cuenta-email').value     = data.email    || '';
      document.getElementById('cuenta-telefono').value  = data.telefono || '';
      document.getElementById('cuenta-direccion').value = data.direccion || '';

      // Dirección en la grilla si tiene una guardada
      if (data.direccion) {
        var grillaDirs = document.getElementById('grilla-direcciones-cuenta');
        var tarjetaNueva = document.getElementById('tarjeta-nueva-dir');
        var tarjetaDir = document.createElement('div');
        tarjetaDir.className = 'tarjeta-direccion-cuenta predeterminada';
        tarjetaDir.innerHTML = '<div class="direccion-badge-pred">✓ Predeterminada</div>'
          + '<p class="direccion-nombre">' + (data.nombre||'') + '</p>'
          + '<p class="direccion-linea">' + data.direccion + '</p>'
          + '<p class="direccion-tel">📞 ' + (data.telefono||'—') + '</p>'
          + '<div class="direccion-acciones"><button class="btn-editar-direccion" onclick="document.getElementById(\'cuenta-direccion\').focus()">Editar</button></div>';
        grillaDirs.insertBefore(tarjetaDir, tarjetaNueva);
      }

    } catch(err) { console.warn('Error perfil:', err); }
  });

  // Guardar datos personales → BD
  document.getElementById('form-datos-personales').addEventListener('submit', async function(e) {
    e.preventDefault();
    var usuarioId = localStorage.getItem('uw-id');
    if (!usuarioId) return;

    var nombre    = (document.getElementById('cuenta-nombre').value.trim() + ' ' + document.getElementById('cuenta-apellido').value.trim()).trim();
    var telefono  = document.getElementById('cuenta-telefono').value.trim();
    var direccion = document.getElementById('cuenta-direccion').value.trim();
    var exitoEl   = document.getElementById('exito-datos');
    var errorEl   = document.getElementById('error-datos');

    try {
      var res  = await fetch('/api/comprador/perfil', {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body:   JSON.stringify({ usuarioId, nombre, telefono, direccion })
      });
      var data = await res.json();

      if (data.exito) {
        // Actualizar sesión y UI
        localStorage.setItem('uw-nombre', nombre);
        document.getElementById('perfil-nombre-completo').textContent = nombre;
        document.getElementById('perfil-avatar').textContent = nombre.split(' ').map(function(p){return p[0]||'';}).join('').substring(0,2).toUpperCase();
        exitoEl.style.display = 'block';
        errorEl.style.display = 'none';
        setTimeout(function(){ exitoEl.style.display='none'; }, 3000);
      } else {
        errorEl.textContent   = data.mensaje || 'Error al guardar';
        errorEl.style.display = 'block';
        exitoEl.style.display = 'none';
      }
    } catch {
      errorEl.textContent   = 'Error de conexión';
      errorEl.style.display = 'block';
    }
  });

  // Cambiar contraseña → BD
  document.getElementById('form-cambiar-password').addEventListener('submit', async function(e) {
    e.preventDefault();
    var usuarioId = localStorage.getItem('uw-id');
    if (!usuarioId) return;

    var actual    = document.getElementById('pass-actual').value;
    var nueva     = document.getElementById('pass-nueva').value;
    var confirmar = document.getElementById('pass-confirmar').value;
    var errEl     = document.getElementById('error-password');
    var exitoEl   = document.getElementById('exito-password');

    if (nueva !== confirmar) { errEl.textContent='Las contraseñas no coinciden'; return; }
    if (nueva.length < 8)    { errEl.textContent='Mínimo 8 caracteres'; return; }
    errEl.textContent = '';

    try {
      var res  = await fetch('/api/comprador/cambiar-password', {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body:   JSON.stringify({ usuarioId, passwordActual: actual, passwordNueva: nueva })
      });
      var data = await res.json();

      if (data.exito) {
        exitoEl.style.display = 'block';
        setTimeout(function(){ exitoEl.style.display='none'; }, 3000);
        document.getElementById('form-cambiar-password').reset();
        errEl.textContent = '';
      } else {
        errEl.textContent = data.mensaje || 'Contraseña actual incorrecta';
      }
    } catch { errEl.textContent = 'Error de conexión'; }
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

  // Nueva dirección (simplificado — edita la dirección en el campo)
  document.getElementById('btn-nueva-direccion').addEventListener('click', function() {
    document.getElementById('cuenta-direccion').focus();
    document.getElementById('cuenta-direccion').scrollIntoView({behavior:'smooth'});
  });

  document.getElementById('tarjeta-nueva-dir').addEventListener('click', function() {
    document.getElementById('cuenta-direccion').focus();
    document.getElementById('cuenta-direccion').scrollIntoView({behavior:'smooth'});
  });

  function agregarDireccion() {
    document.getElementById('cuenta-direccion').focus();
  }

  // Cerrar sesión
  document.getElementById('btn-cerrar-sesion-cuenta').addEventListener('click', function() {
    var modal = document.getElementById('modal-cerrar-sesion-cuenta');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-cerrar-sesion-cuenta';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px';
      modal.innerHTML =
        '<div style="background:#FFFFFF;border:1px solid #E2E8F0;padding:32px;max-width:360px;width:100%;border-radius:15px;text-align:center">'
        + '<p style="font-family:var(--fuente-titulos);font-size:1.3rem;letter-spacing:0.04em;color:#0F172A;margin-bottom:24px">¿CERRAR SESIÓN?</p>'
        + '<div style="display:flex;gap:12px;justify-content:center">'
        + '<button id="cta-si" style="padding:11px 28px;background:#19876E;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.1em;cursor:pointer;border-radius:6px">Confirmar</button>'
        + '<button id="cta-no" style="padding:11px 28px;background:none;border:1px solid #CBD5E1;color:#0F172A;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.1em;cursor:pointer;border-radius:6px">Cancelar</button>'
        + '</div></div>';
      document.body.appendChild(modal);
      document.getElementById('cta-si').onclick = function() {
        fetch('/api/auth/logout', {method:'POST'}).catch(function(){});
        localStorage.clear();
        window.location.href = '/index';
      };
      document.getElementById('cta-no').onclick = function() {
        modal.style.display = 'none';
      };
      modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
    modal.style.display = 'flex';
  });

// Override función agregarDireccion para abrir modal
function agregarDireccion() {
  var modal = document.getElementById('modal-nueva-dir');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-nueva-dir';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `
      <div style="background:#FFFFFF;border:1px solid #E2E8F0;max-width:480px;width:100%;padding:32px;position:relative">
        <button onclick="document.getElementById('modal-nueva-dir').style.display='none'"
          style="position:absolute;top:16px;right:16px;background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer">✕</button>
        <h3 style="font-family:var(--fuente-titulos);font-size:1.5rem;color:#0F172A;margin-bottom:20px">AGREGAR DIRECCIÓN</h3>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div><label style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;display:block;margin-bottom:6px">Dirección completa *</label>
            <input type="text" id="modal-dir-linea" style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);padding:12px 16px;outline:none;box-sizing:border-box" placeholder="Calle 123 # 45-67, Apto 301"/></div>
          <div><label style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;display:block;margin-bottom:6px">Ciudad *</label>
            <select id="modal-dir-ciudad" style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);padding:12px 16px;outline:none;box-sizing:border-box;border-radius:6px">
              <option value="">Selecciona</option>
              <option>Bogotá</option><option>Medellín</option><option>Cali</option>
              <option>Barranquilla</option><option>Cartagena</option><option>Bucaramanga</option>
              <option>Pereira</option><option>Santa Marta</option><option>Manizales</option>
            </select></div>
          <div><label style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;display:block;margin-bottom:6px">Teléfono</label>
            <input type="tel" id="modal-dir-tel" style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);padding:12px 16px;outline:none;box-sizing:border-box" placeholder="300 123 4567"/></div>
          <p id="modal-dir-error" style="color:#e05252;font-size:0.78rem;display:none"></p>
          <button onclick="guardarNuevaDireccion()" style="width:100%;padding:14px;background:#0E6655;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.85rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">
            Guardar dirección
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
}

async function guardarNuevaDireccion() {
  var uid    = localStorage.getItem('uw-id');
  var linea  = document.getElementById('modal-dir-linea').value.trim();
  var ciudad = document.getElementById('modal-dir-ciudad').value;
  var tel    = document.getElementById('modal-dir-tel').value.trim();
  var errEl  = document.getElementById('modal-dir-error');

  if (!linea || !ciudad) { errEl.textContent='Completa los campos requeridos'; errEl.style.display='block'; return; }
  errEl.style.display = 'none';

  // Guardar en perfil del usuario
  var dirCompleta = linea + ', ' + ciudad;
  try {
    var res  = await fetch('/api/comprador/perfil', {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ usuarioId: uid, direccion: dirCompleta, telefono: tel || undefined })
    });
    var data = await res.json();
    if (data.exito) {
      // Agregar tarjeta visualmente
      var grilla    = document.getElementById('grilla-direcciones-cuenta');
      var tarjetaNew = document.getElementById('tarjeta-nueva-dir');
      var div = document.createElement('div');
      div.className = 'tarjeta-direccion-cuenta';
      div.innerHTML = '<p class="direccion-nombre">' + (localStorage.getItem('uw-nombre')||'') + '</p>'
        + '<p class="direccion-linea">' + linea + '</p>'
        + '<p class="direccion-ciudad">' + ciudad + '</p>'
        + (tel ? '<p class="direccion-tel">📞 ' + tel + '</p>' : '')
        + '<div class="direccion-acciones"><button class="btn-editar-direccion" onclick="document.getElementById(\'cuenta-direccion\').value=\'' + dirCompleta.replace(/'/g,"") + '\';document.getElementById(\'cuenta-direccion\').focus()">Editar</button></div>';
      grilla.insertBefore(div, tarjetaNew);
      document.getElementById('modal-nueva-dir').style.display = 'none';
      // Limpiar modal
      document.getElementById('modal-dir-linea').value = '';
      document.getElementById('modal-dir-ciudad').value = '';
      document.getElementById('modal-dir-tel').value = '';
    }
  } catch(e) { errEl.textContent='Error de conexión'; errEl.style.display='block'; }
}