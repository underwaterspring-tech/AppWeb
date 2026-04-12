
// URL base del backend
const API_BASE = '/api/auth';


// ----------------------------------------------------------------
// TABS: cambiar entre "Ingresar" y "Registrarse"
// ----------------------------------------------------------------
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


// ----------------------------------------------------------------
// SELECTOR TIPO DE USUARIO
// ----------------------------------------------------------------
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


// ----------------------------------------------------------------
// MOSTRAR / OCULTAR CONTRASEÑA
// ----------------------------------------------------------------
document.querySelectorAll('.boton-mostrar-password').forEach(function(boton) {
  boton.addEventListener('click', function() {
    const campo = document.getElementById(this.dataset.target);
    if (campo.type === 'password') {
      campo.type        = 'text';
      this.textContent  = '🙈';
    } else {
      campo.type        = 'password';
      this.textContent  = '👁';
    }
  });
});


// ----------------------------------------------------------------
// BARRA DE SEGURIDAD DE LA CONTRASEÑA
// ----------------------------------------------------------------
const inputPasswordRegistro = document.getElementById('registro-password');
const barraSeguridad        = document.getElementById('nivel-seguridad-barra');
const textoSeguridad        = document.getElementById('texto-seguridad-password');

inputPasswordRegistro.addEventListener('input', function() {
  const password = this.value;
  const nivel    = evaluarSeguridadPassword(password);

  barraSeguridad.className = '';
  textoSeguridad.className = '';

  if (password.length === 0) {
    barraSeguridad.style.width = '0%';
    textoSeguridad.textContent = '';
    return;
  }

  if (nivel === 'debil') {
    barraSeguridad.classList.add('seguridad-debil');
    textoSeguridad.classList.add('texto-debil');
    textoSeguridad.textContent = 'Contraseña débil';
  } else if (nivel === 'media') {
    barraSeguridad.classList.add('seguridad-media');
    textoSeguridad.classList.add('texto-media');
    textoSeguridad.textContent = 'Contraseña media';
  } else {
    barraSeguridad.classList.add('seguridad-fuerte');
    textoSeguridad.classList.add('texto-fuerte');
    textoSeguridad.textContent = '✓ Contraseña segura';
  }
});

function evaluarSeguridadPassword(password) {
  let puntos = 0;
  if (password.length >= 8)           puntos++;
  if (password.length >= 12)          puntos++;
  if (/[A-Z]/.test(password))         puntos++;
  if (/[0-9]/.test(password))         puntos++;
  if (/[^A-Za-z0-9]/.test(password))  puntos++;
  if (puntos <= 2) return 'debil';
  if (puntos <= 3) return 'media';
  return 'fuerte';
}


// ----------------------------------------------------------------
// VALIDACIONES
// ----------------------------------------------------------------
function validarCampo(campo, mensajeError, condicion, textoError) {
  if (!condicion) {
    campo.classList.add('campo-con-error');
    campo.classList.remove('campo-valido');
    mensajeError.textContent = textoError;
    return false;
  } else {
    campo.classList.remove('campo-con-error');
    if (campo.value.length > 0) campo.classList.add('campo-valido');
    mensajeError.textContent = '';
    return true;
  }
}

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarFormLogin() {
  const email    = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const errEmail = document.getElementById('error-login-email');
  const errPass  = document.getElementById('error-login-password');

  const emailOk    = validarCampo(email,    errEmail, esEmailValido(email.value),   'Ingresa un correo válido');
  const passwordOk = validarCampo(password, errPass,  password.value.length >= 6,   'La contraseña debe tener al menos 6 caracteres');

  return emailOk && passwordOk;
}

function validarFormRegistro() {
  const nombre    = document.getElementById('registro-nombre');
  const email     = document.getElementById('registro-email');
  const telefono  = document.getElementById('registro-telefono');
  const password  = document.getElementById('registro-password');
  const confirmar = document.getElementById('registro-confirmar-password');
  const terminos  = document.getElementById('checkbox-terminos');

  let todoValido = true;
  todoValido &= validarCampo(nombre,    document.getElementById('error-registro-nombre'),    nombre.value.trim().length >= 3,                  'El nombre debe tener al menos 3 caracteres');
  todoValido &= validarCampo(email,     document.getElementById('error-registro-email'),     esEmailValido(email.value),                       'Ingresa un correo válido');
  todoValido &= validarCampo(telefono,  document.getElementById('error-registro-telefono'),  telefono.value.replace(/\D/g,'').length >= 10,    'Ingresa un teléfono válido de 10 dígitos');
  todoValido &= validarCampo(password,  document.getElementById('error-registro-password'),  password.value.length >= 8,                       'La contraseña debe tener al menos 8 caracteres');
  todoValido &= validarCampo(confirmar, document.getElementById('error-registro-confirmar'), confirmar.value === password.value,               'Las contraseñas no coinciden');

  if (!terminos.checked) {
    document.getElementById('error-terminos').textContent = 'Debes aceptar los términos y condiciones';
    todoValido = false;
  } else {
    document.getElementById('error-terminos').textContent = '';
  }

  if (tipoUsuarioActual === 'VENDEDOR') {
    const empNombre = document.getElementById('empresa-nombre');
    const empNit    = document.getElementById('empresa-nit');
    const empCiudad = document.getElementById('empresa-ciudad');
    todoValido &= validarCampo(empNombre, document.getElementById('error-empresa-nombre'), empNombre.value.trim().length >= 3, 'Ingresa el nombre de la empresa');
    todoValido &= validarCampo(empNit,    document.getElementById('error-empresa-nit'),    empNit.value.trim().length >= 5,    'Ingresa un NIT válido');
    todoValido &= validarCampo(empCiudad, document.getElementById('error-empresa-ciudad'), empCiudad.value !== '',             'Selecciona una ciudad');
  }

  return !!todoValido;
}


// ----------------------------------------------------------------
// HELPERS DE UI
// ----------------------------------------------------------------
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

// Guarda datos básicos del usuario en localStorage (sin datos sensibles)
function guardarSesion(datos) {
  localStorage.setItem('nexoshop-id',     datos.id);
  localStorage.setItem('nexoshop-nombre', datos.nombre);
  localStorage.setItem('nexoshop-email',  datos.email);
  localStorage.setItem('nexoshop-rol',    datos.rol);
}

// DESPUÉS (rutas a tus archivos .html reales)
function redirigirSegunRol(rol) {
  if (rol === 'ADMIN')    { window.location.href = 'panel_Admin.html';    return; }
  if (rol === 'VENDEDOR') { window.location.href = 'panel_Vendedor.html'; return; }
  window.location.href = 'index.html'; // COMPRADOR
}

// ----------------------------------------------------------------
// ENVÍO DEL FORMULARIO DE LOGIN — conectado con Spring Boot
// ----------------------------------------------------------------
const formLogin        = document.getElementById('form-login');
const botonLogin       = document.getElementById('boton-submit-login');
const alertaErrorLogin = document.getElementById('alerta-error-login');

formLogin.addEventListener('submit', async function(evento) {
  evento.preventDefault();
  alertaErrorLogin.style.display = 'none';

  if (!validarFormLogin()) return;

  mostrarCargando(botonLogin);

  const datosLogin = {
    email:    document.getElementById('login-email').value.trim(),
    password: document.getElementById('login-password').value
  };

  try {
    const respuesta = await fetch(`${API_BASE}/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(datosLogin)
    });

    const data = await respuesta.json();

    if (respuesta.ok && data.exito) {
      // Guardar sesión y redirigir
      guardarSesion(data);
      redirigirSegunRol(data.rol);
    } else {
  alertaErrorLogin.textContent   = '❌ ' + (data.mensaje || 'Correo o contraseña incorrectos.');
  alertaErrorLogin.style.display = 'block';
  ocultarCargando(botonLogin);
}

  } catch (error) {
    // Error de red (el backend no está corriendo, por ejemplo)
    console.error('Error de conexión:', error);
    alertaErrorLogin.textContent   = '❌ No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    alertaErrorLogin.style.display = 'block';
    ocultarCargando(botonLogin);
  }
});

// scripts_Auth.js — verificación de sesión y cierre
(function verificarSesion() {
    const ROL_REQUERIDO = {
        'panel_Admin.html':    'ADMIN',
        'panel_Vendedor.html': 'VENDEDOR',
        'carrito.html':        'COMPRADOR',
        'favoritos.html':      'COMPRADOR',
        'pedidos.html':        'COMPRADOR',
        'mi_Cuenta.html':      'COMPRADOR'
    };

    const pagina       = window.location.pathname.split('/').pop();
    const rolNecesario = ROL_REQUERIDO[pagina];
    const rolActual    = localStorage.getItem('nexoshop-rol');

    if (!rolNecesario) return;

    if (!rolActual) {
        window.location.href = 'login.html';
        return;
    }

    if (rolActual !== rolNecesario) {
        if (rolActual === 'ADMIN')          window.location.href = 'panel_Admin.html';
        else if (rolActual === 'VENDEDOR')  window.location.href = 'panel_Vendedor.html';
        else                                window.location.href = 'index.html';
    }
})();

function cerrarSesion() {
    localStorage.removeItem('nexoshop-id');
    localStorage.removeItem('nexoshop-nombre');
    localStorage.removeItem('nexoshop-email');
    localStorage.removeItem('nexoshop-rol');
    window.location.href = 'login.html';
}

// ----------------------------------------------------------------
// ENVÍO DEL FORMULARIO DE REGISTRO — conectado con Spring Boot
// ----------------------------------------------------------------
const formRegistro        = document.getElementById('form-registro');
const botonRegistro       = document.getElementById('boton-submit-registro');
const alertaExitoRegistro = document.getElementById('alerta-exito-registro');
const alertaErrorRegistro = document.getElementById('alerta-error-registro');

formRegistro.addEventListener('submit', async function(evento) {
  evento.preventDefault();
  alertaExitoRegistro.style.display = 'none';
  alertaErrorRegistro.style.display = 'none';

  if (!validarFormRegistro()) return;

  mostrarCargando(botonRegistro);

  // Construir el objeto que espera el backend
  const datosRegistro = {
    nombre:   document.getElementById('registro-nombre').value.trim(),
    email:    document.getElementById('registro-email').value.trim(),
    telefono: document.getElementById('registro-telefono').value.trim(),
    password: document.getElementById('registro-password').value,
    rol:      tipoUsuarioActual
  };

  if (tipoUsuarioActual === 'VENDEDOR') {
    datosRegistro.empresa = {
      nombre: document.getElementById('empresa-nombre').value.trim(),
      nit:    document.getElementById('empresa-nit').value.trim(),
      ciudad: document.getElementById('empresa-ciudad').value
    };
  }

  try {
    const respuesta = await fetch(`${API_BASE}/registro`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(datosRegistro)
    });

    const data = await respuesta.json();

    if (respuesta.ok && data.exito) {
      // Mostrar mensaje de éxito
      alertaExitoRegistro.textContent   = '✅ ' + data.mensaje;
      alertaExitoRegistro.style.display = 'block';

      if (tipoUsuarioActual === 'VENDEDOR') {
        // Al vendedor le mostramos el aviso de aprobación y no redirigimos
        ocultarCargando(botonRegistro);
      } else {
        // Al comprador lo llevamos al login tras 2 segundos
        setTimeout(function() {
          document.getElementById('tab-login').click();
          ocultarCargando(botonRegistro);
        }, 2000);
      }

    } else {
      // El backend rechazó el registro (email duplicado, etc.)
      alertaErrorRegistro.textContent   = '❌ ' + (data.mensaje || 'Ocurrió un error. Intenta de nuevo.');
      alertaErrorRegistro.style.display = 'block';
      ocultarCargando(botonRegistro);
    }

  } catch (error) {
    console.error('Error de conexión:', error);
    alertaErrorRegistro.textContent   = '❌ No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    alertaErrorRegistro.style.display = 'block';
    ocultarCargando(botonRegistro);
  }
});


console.log('✅ scripts_Login.js cargado — conectado con Spring Boot en', API_BASE);