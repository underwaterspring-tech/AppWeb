// ================================================================
// scrips_login.js — Underwater Marketplace
// Sesión unificada en sessionStorage con prefijo "uw-"
// ================================================================

const API_BASE = '/api/auth';

// ── Helpers de sesión globales ───────────────────────────────────
function guardarSesion(datos) {
  localStorage.setItem('uw-id',        String(datos.id        || '').trim());
  localStorage.setItem('uw-nombre',    String(datos.nombre    || '').trim());
  localStorage.setItem('uw-email',     String(datos.email     || '').trim());
  localStorage.setItem('uw-rol',       String(datos.rol       || '').trim());
  localStorage.setItem('uw-empresaId', String(datos.empresaId || '').trim());
}

function obtenerSesion() {
  return {
    id:        localStorage.getItem('uw-id'),
    nombre:    localStorage.getItem('uw-nombre'),
    email:     localStorage.getItem('uw-email'),
    rol:       localStorage.getItem('uw-rol'),
    empresaId: localStorage.getItem('uw-empresaId')
  };
}

function cerrarSesion() {
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  localStorage.clear();
  window.location.href = '/login';
}

function redirigirSegunRol(rol, activo) {
  if (rol === 'ADMIN')    { window.location.href = '/panel-admin'; return; }
  if (rol === 'VENDEDOR') {
    // Si no está activo (pendiente de aprobación) → página de espera
    if (!activo) { window.location.href = '/espera-aprobacion'; return; }
    window.location.href = '/panel-vendedor';
    return;
  }
  window.location.href = '/index';
}

// ── TABS ─────────────────────────────────────────────────────────
const tabsAuth           = document.querySelectorAll('.tab-auth');
const formularioLogin    = document.getElementById('formulario-login');
const formularioRegistro = document.getElementById('formulario-registro');

tabsAuth.forEach(function(tab) {
  tab.addEventListener('click', function() {
    tabsAuth.forEach(t => t.classList.remove('activo'));
    this.classList.add('activo');
    if (this.dataset.tab === 'login') {
      formularioLogin.style.display    = 'block';
      formularioRegistro.style.display = 'none';
    } else {
      formularioLogin.style.display    = 'none';
      formularioRegistro.style.display = 'block';
    }
  });
});

document.querySelectorAll('.enlace-cambiar-tab').forEach(function(enlace) {
  enlace.addEventListener('click', function() {
    const irA = this.dataset.irA;
    document.getElementById('tab-' + irA).click();
    document.getElementById('panel-formularios').scrollTop = 0;
  });
});

// ── SELECTOR TIPO USUARIO ────────────────────────────────────────
const botonestipoUsuario = document.querySelectorAll('.boton-tipo-usuario');
const camposEmpresa      = document.getElementById('campos-empresa');
let tipoUsuarioActual    = 'COMPRADOR';

botonestipoUsuario.forEach(function(boton) {
  boton.addEventListener('click', function() {
    botonestipoUsuario.forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');
    tipoUsuarioActual = this.dataset.tipo;
    camposEmpresa.style.display = tipoUsuarioActual === 'VENDEDOR' ? 'block' : 'none';
  });
});

// ── MOSTRAR / OCULTAR CONTRASEÑA ─────────────────────────────────
document.querySelectorAll('.boton-mostrar-password').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const campo = document.getElementById(this.dataset.target);
    if (campo.type === 'password') { campo.type = 'text';     this.textContent = '🙈'; }
    else                           { campo.type = 'password'; this.textContent = '👁'; }
  });
});

// ── BARRA SEGURIDAD CONTRASEÑA ───────────────────────────────────
const inputPasswordRegistro = document.getElementById('registro-password');
const barraSeguridad        = document.getElementById('nivel-seguridad-barra');
const textoSeguridad        = document.getElementById('texto-seguridad-password');

inputPasswordRegistro.addEventListener('input', function() {
  const nivel = evaluarSeguridadPassword(this.value);
  barraSeguridad.className = '';
  textoSeguridad.className = '';
  if (!this.value.length) { barraSeguridad.style.width = '0%'; textoSeguridad.textContent = ''; return; }
  const mapa = { debil: ['seguridad-debil','texto-debil','Contraseña débil'], media: ['seguridad-media','texto-media','Contraseña media'], fuerte: ['seguridad-fuerte','texto-fuerte','✓ Contraseña segura'] };
  barraSeguridad.classList.add(mapa[nivel][0]);
  textoSeguridad.classList.add(mapa[nivel][1]);
  textoSeguridad.textContent = mapa[nivel][2];
});

function evaluarSeguridadPassword(p) {
  let pts = 0;
  if (p.length >= 8) pts++; if (p.length >= 12) pts++;
  if (/[A-Z]/.test(p)) pts++; if (/[0-9]/.test(p)) pts++;
  if (/[^A-Za-z0-9]/.test(p)) pts++;
  return pts <= 2 ? 'debil' : pts <= 3 ? 'media' : 'fuerte';
}

// ── VALIDACIONES ─────────────────────────────────────────────────
function validarCampo(campo, errEl, condicion, texto) {
  if (!condicion) { campo.classList.add('campo-con-error'); campo.classList.remove('campo-valido'); errEl.textContent = texto; return false; }
  campo.classList.remove('campo-con-error'); if (campo.value.length > 0) campo.classList.add('campo-valido'); errEl.textContent = ''; return true;
}

function esEmailValido(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function validarFormLogin() {
  const email = document.getElementById('login-email');
  const pass  = document.getElementById('login-password');
  return validarCampo(email, document.getElementById('error-login-email'), esEmailValido(email.value), 'Ingresa un correo válido')
       & validarCampo(pass,  document.getElementById('error-login-password'), pass.value.length >= 6, 'Mínimo 6 caracteres');
}

function validarFormRegistro() {
  const n = document.getElementById('registro-nombre');
  const e = document.getElementById('registro-email');
  const t = document.getElementById('registro-telefono');
  const p = document.getElementById('registro-password');
  const c = document.getElementById('registro-confirmar-password');
  const terms = document.getElementById('checkbox-terminos');
  let ok = true;
  ok &= validarCampo(n, document.getElementById('error-registro-nombre'),    n.value.trim().length >= 3,            'Mínimo 3 caracteres');
  ok &= validarCampo(e, document.getElementById('error-registro-email'),     esEmailValido(e.value),                'Correo inválido');
  ok &= validarCampo(t, document.getElementById('error-registro-telefono'),  t.value.replace(/\D/g,'').length >= 10,'Teléfono de 10 dígitos');
  ok &= validarCampo(p, document.getElementById('error-registro-password'),  p.value.length >= 8,                   'Mínimo 8 caracteres');
  ok &= validarCampo(c, document.getElementById('error-registro-confirmar'), c.value === p.value,                   'Las contraseñas no coinciden');
  if (!terms.checked) { document.getElementById('error-terminos').textContent = 'Debes aceptar los términos'; ok = false; }
  else { document.getElementById('error-terminos').textContent = ''; }
  if (tipoUsuarioActual === 'VENDEDOR') {
    const en = document.getElementById('empresa-nombre');
    const en2 = document.getElementById('empresa-nit');
    const ec  = document.getElementById('empresa-ciudad');
    ok &= validarCampo(en,  document.getElementById('error-empresa-nombre'), en.value.trim().length >= 3,  'Nombre requerido');
    ok &= validarCampo(en2, document.getElementById('error-empresa-nit'),    en2.value.trim().length >= 5, 'NIT inválido');
    ok &= validarCampo(ec,  document.getElementById('error-empresa-ciudad'), ec.value !== '',              'Selecciona ciudad');
  }
  return !!ok;
}

// ── HELPERS UI ───────────────────────────────────────────────────
function mostrarCargando(boton) {
  boton.querySelector('.boton-submit-texto').style.display    = 'none';
  boton.querySelector('.boton-submit-cargando').style.display = 'inline';
  boton.disabled = true;
}
function ocultarCargando(boton) {
  boton.querySelector('.boton-submit-texto').style.display    = 'inline';
  boton.querySelector('.boton-submit-cargando').style.display = 'none';
  boton.disabled = false;
}

// ── ENVÍO LOGIN ──────────────────────────────────────────────────
const formLogin        = document.getElementById('form-login');
const botonLogin       = document.getElementById('boton-submit-login');
const alertaErrorLogin = document.getElementById('alerta-error-login');

formLogin.addEventListener('submit', async function(e) {
  e.preventDefault();
  alertaErrorLogin.style.display = 'none';
  if (!validarFormLogin()) return;
  mostrarCargando(botonLogin);

  try {
    const res  = await fetch(`${API_BASE}/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email:    document.getElementById('login-email').value.trim(),
        password: document.getElementById('login-password').value
      })
    });
    const data = await res.json();

    if (res.ok && data.exito) {
      guardarSesion(data);
      redirigirSegunRol(data.rol, data.activo !== false);
    } else if (data.pendiente) {
      // Vendedor pendiente de aprobación → guardar sesión con datos reales y enviar a espera
      guardarSesion({
        id:        data.id        || '',
        nombre:    data.nombre    || '',
        email:     document.getElementById('login-email').value.trim(),
        rol:       'PENDIENTE',
        empresaId: data.empresaId || ''
      });
      window.location.href = '/espera-aprobacion';
    } else {
      alertaErrorLogin.textContent   = '❌ ' + (data.mensaje || 'Correo o contraseña incorrectos.');
      alertaErrorLogin.style.display = 'block';
      ocultarCargando(botonLogin);
    }
  } catch (err) {
    alertaErrorLogin.textContent   = '❌ No se pudo conectar con el servidor.';
    alertaErrorLogin.style.display = 'block';
    ocultarCargando(botonLogin);
  }
});

// ── ENVÍO REGISTRO ───────────────────────────────────────────────
const formRegistro        = document.getElementById('form-registro');
const botonRegistro       = document.getElementById('boton-submit-registro');
const alertaExitoRegistro = document.getElementById('alerta-exito-registro');
const alertaErrorRegistro = document.getElementById('alerta-error-registro');

formRegistro.addEventListener('submit', async function(e) {
  e.preventDefault();
  alertaExitoRegistro.style.display = 'none';
  alertaErrorRegistro.style.display = 'none';
  if (!validarFormRegistro()) return;
  mostrarCargando(botonRegistro);

  const datos = {
    nombre:   document.getElementById('registro-nombre').value.trim(),
    email:    document.getElementById('registro-email').value.trim(),
    telefono: document.getElementById('registro-telefono').value.trim(),
    password: document.getElementById('registro-password').value,
    rol:      tipoUsuarioActual
  };

  if (tipoUsuarioActual === 'VENDEDOR') {
    datos.empresa = {
      nombre: document.getElementById('empresa-nombre').value.trim(),
      nit:    document.getElementById('empresa-nit').value.trim(),
      ciudad: document.getElementById('empresa-ciudad').value
    };
  }

  try {
    const res  = await fetch(`${API_BASE}/registro`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(datos)
    });
    const data = await res.json();

    if (res.ok && data.exito) {
      alertaExitoRegistro.textContent   = '✅ ' + data.mensaje;
      alertaExitoRegistro.style.display = 'block';

      if (tipoUsuarioActual === 'VENDEDOR') {
        // Guardar sesión con los datos reales antes de redirigir
        guardarSesion({
          id:        data.id        || '',
          nombre:    data.nombre    || '',
          email:     data.email     || document.getElementById('registro-email').value.trim(),
          rol:       'PENDIENTE',
          empresaId: data.empresaId || ''
        });
        // Vendedor: mostrar mensaje y redirigir a espera después de 2 seg
        setTimeout(() => { window.location.href = '/espera-aprobacion'; }, 2500);
      } else {
        // Comprador: ir al login después de 2 seg
        setTimeout(() => { document.getElementById('tab-login').click(); ocultarCargando(botonRegistro); }, 2000);
      }
    } else {
      alertaErrorRegistro.textContent   = '❌ ' + (data.mensaje || 'Error al registrar.');
      alertaErrorRegistro.style.display = 'block';
      ocultarCargando(botonRegistro);
    }
  } catch (err) {
    alertaErrorRegistro.textContent   = '❌ No se pudo conectar con el servidor.';
    alertaErrorRegistro.style.display = 'block';
    ocultarCargando(botonRegistro);
  }
});

console.log('✅ scrips_login.js cargado');