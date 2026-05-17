// ================================================================
// scripts_Espera.js — Underwater
// Página de espera de aprobación para vendedores
// ================================================================

// ── Helpers de sesión ────────────────────────────────────────────
function obtenerSesion() {
  return {
    id:        (localStorage.getItem('uw-id')        || '').trim(),
    nombre:    (localStorage.getItem('uw-nombre')    || '').trim(),
    email:     (localStorage.getItem('uw-email')     || '').trim(),
    rol:       (localStorage.getItem('uw-rol')        || '').trim(),
    empresaId: (localStorage.getItem('uw-empresaId') || '').trim()
  };
}

function cerrarSesion() {
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  localStorage.clear();
  window.location.href = '/login';
}

// ── Mostrar datos del vendedor en pantalla ───────────────────────
const sesion = obtenerSesion();

// Si no hay sesión ninguna, redirigir al login
if (!sesion.email && !sesion.id) {
  window.location.href = '/login';
}

if (sesion.email) {
  document.getElementById('email-espera').textContent = sesion.email;
}

if (sesion.nombre) {
  const elNombre = document.getElementById('nombre-vendedor');
  elNombre.textContent = sesion.nombre.toUpperCase();
}

// ── Cerrar sesión ─────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', cerrarSesion);

// ── Funciones para actualizar UI según estado ────────────────────
function marcarAprobado() {
  // Icono
  document.getElementById('icono-espera').textContent = '🎉';

  // Alerta verde
  document.getElementById('alerta-aprobado').style.display = 'block';

  // Pasos: completar paso 2 y activar paso 3
  const paso2 = document.getElementById('paso-2');
  paso2.classList.remove('activo');
  paso2.classList.add('completado');

  const paso3 = document.getElementById('paso-3');
  paso3.classList.add('activo');

  // Badge verde
  const badge = document.getElementById('estado-badge');
  badge.querySelector('.dot').style.background   = '#1a6e3f';
  badge.querySelector('.dot').style.animation    = 'none';
  badge.querySelector('#badge-texto').textContent = 'Empresa Aprobada';
  badge.style.background   = 'rgba(26, 110, 63, 0.1)';
  badge.style.borderColor  = '#1a6e3f';
  badge.style.color        = '#1a6e3f';

  // Detener timers
  clearInterval(intervaloVerificacion);
  clearInterval(intervaloCuenta);
  document.getElementById('refresco-info').style.display = 'none';

  // Redirigir al panel del vendedor
  setTimeout(() => {
    window.location.href = '/panel-vendedor';
  }, 2500);
}

function marcarRechazado() {
  // Icono
  document.getElementById('icono-espera').textContent = '❌';

  // Badge rojo
  const badge = document.getElementById('estado-badge');
  badge.querySelector('.dot').style.background   = '#a0281e';
  badge.querySelector('.dot').style.animation    = 'none';
  badge.querySelector('#badge-texto').textContent = 'Solicitud Rechazada';
  badge.style.background   = 'rgba(160, 40, 30, 0.08)';
  badge.style.borderColor  = '#a0281e';
  badge.style.color        = '#a0281e';

  // Mensaje de descripción
  document.getElementById('desc-espera').innerHTML =
    `Tu solicitud de empresa fue <strong>rechazada</strong>.<br>
     Por favor <a href="/login" style="color:var(--esmeralda);font-weight:700;text-decoration:underline;">contáctanos</a> para más información o registra una nueva empresa.`;

  // Detener timers
  clearInterval(intervaloVerificacion);
  clearInterval(intervaloCuenta);
  document.getElementById('refresco-info').style.display = 'none';
}

// ── Verificar si ya fue aprobado/rechazado ───────────────────────
async function verificarAprobacion() {
  const usuarioId = sesion.id;
  if (!usuarioId) return;

  try {
    const res = await fetch(`/api/vendedor/empresa?usuarioId=${usuarioId}`);

    // 404 → empresa aún no encontrada, seguir esperando
    if (res.status === 404) return;
    if (!res.ok) return;

    const empresa = await res.json();
    if (!empresa) return;

    if (empresa.estado === 'APROBADA' && empresa.activo) {
      // Actualizar empresaId en localStorage por si acaso
      localStorage.setItem('uw-empresaId', empresa.id || empresa._id || sesion.empresaId);
      localStorage.setItem('uw-rol', 'VENDEDOR');
      marcarAprobado();

    } else if (empresa.estado === 'RECHAZADA') {
      marcarRechazado();
    }
    // PENDIENTE → no hacer nada, seguir esperando

  } catch (err) {
    console.warn('[Espera] Error al verificar estado:', err);
  }
}

// ── Cuenta regresiva visual ──────────────────────────────────────
let segundos = 30;
const elCuenta = document.getElementById('cuenta-regresiva');

const intervaloCuenta = setInterval(() => {
  segundos--;
  elCuenta.textContent = segundos;
  if (segundos <= 0) segundos = 30;
}, 1000);

// ── Verificación periódica cada 30 segundos ──────────────────────
const intervaloVerificacion = setInterval(() => {
  verificarAprobacion();
  segundos = 30;
  elCuenta.textContent = segundos;
}, 30000);

// ── Verificación inicial al cargar la página ─────────────────────
// (por si el vendedor ya fue aprobado antes de llegar aquí)
verificarAprobacion();

console.log('✅ scripts_Espera.js cargado');