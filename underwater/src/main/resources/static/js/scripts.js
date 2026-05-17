// ================================================================
// scripts.js — Underwater Marketplace
// Script GLOBAL: navbar dinámico, sesión, carrito, productos index
// ================================================================

// ── Sesión ───────────────────────────────────────────────────────
function getSesion() {
  return {
    id:        localStorage.getItem('uw-id'),
    nombre:    localStorage.getItem('uw-nombre'),
    email:     localStorage.getItem('uw-email'),
    rol:       localStorage.getItem('uw-rol'),
    empresaId: localStorage.getItem('uw-empresaId')
  };
}

// ================================================================
// NAVBAR DINÁMICO
// ================================================================
function actualizarNavbar() {
  var s       = getSesion();
  var iconos  = document.getElementById('iconos-derecha');
  if (!iconos) return;

  if (s.id && s.nombre) {
    var iniciales    = s.nombre.split(' ').map(function(p){ return p[0]||''; }).join('').substring(0,2).toUpperCase();
    var enlacePerfil = '/mi-cuenta';
    var labelPerfil  = 'Mi cuenta';
    if (s.rol === 'ADMIN')    { enlacePerfil = '/panel-admin';    labelPerfil = 'Panel Admin'; }
    if (s.rol === 'VENDEDOR') { enlacePerfil = '/panel-vendedor'; labelPerfil = 'Mi panel'; }

    // Vendedor y Admin NO ven carrito ni favoritos
    var botonesCompra = '';
    if (s.rol !== 'VENDEDOR' && s.rol !== 'ADMIN') {
      botonesCompra = '<button class="boton-icono" onclick="window.location.href=\'/favoritos\'" title=\"Favoritos\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\" stroke=\"white\" stroke-width=\"1.8\" stroke-linejoin=\"round\" fill=\"none\"/></svg><span id=\"contador-favoritos\" style=\"position:absolute;top:2px;right:2px;background:#F97316;color:white;font-size:0.55rem;width:15px;height:15px;border-radius:50%;display:none;align-items:center;justify-content:center;font-weight:800\"></span></button>'
        + '<button class="boton-icono" onclick="window.location.href=\'/carrito\'" title="Carrito"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="1.8"/><path d="M16 10a4 4 0 01-8 0" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg><span id="contador-carrito">0</span></button>';
    }

    var opcionesComprador = '';
    if (s.rol === 'COMPRADOR') {
      opcionesComprador = '<a href="/pedidos" style="display:block;padding:12px 16px;color:#0F172A;text-decoration:none;font-size:0.8rem;font-weight:700;letter-spacing:0.06em;border-bottom:1px solid #E2E8F0">📦 Mis pedidos</a>'
        + '<a href="/favoritos" style="display:block;padding:12px 16px;color:#0F172A;text-decoration:none;font-size:0.8rem;font-weight:700;letter-spacing:0.06em;border-bottom:1px solid #E2E8F0">♡ Favoritos</a>';
    }

    iconos.innerHTML = botonesCompra
      + '<div id="menu-usuario-contenedor" style="position:relative">'
        + '<button id="boton-usuario-navbar" onclick="toggleMenuUsuario()" style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;padding:8px 14px;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.06em;cursor:pointer;transition:all 0.2s">'
          + '<span style="width:28px;height:28px;background:#F97316;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800">' + iniciales + '</span>'
          + s.nombre.split(' ')[0]
          + '<span style="font-size:0.6rem;opacity:0.6">▼</span>'
        + '</button>'
        + '<div id="dropdown-usuario" style="display:none;position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid #E2E8F0;min-width:180px;z-index:200">'
          + '<a href="' + enlacePerfil + '" style="display:block;padding:12px 16px;color:#0F172A;text-decoration:none;font-size:0.8rem;font-weight:700;letter-spacing:0.06em;border-bottom:1px solid #E2E8F0">👤 ' + labelPerfil + '</a>'
          + opcionesComprador
          + '<button onclick="cerrarSesionNavbar()" style="display:block;width:100%;padding:12px 16px;background:none;border:none;color:#e05252;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.06em;text-align:left;cursor:pointer">↩ Cerrar sesión</button>'
        + '</div>'
      + '</div>';

    if (s.rol !== 'VENDEDOR' && s.rol !== 'ADMIN') {
      cargarContadorCarrito(s.id);
      cargarContadorFavoritos(s.id);
    }

  } else {
    iconos.innerHTML = '<button class="boton-icono" id="boton-favoritos" onclick="window.location.href=\'/login\'" title=\"Favoritos\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\" stroke=\"white\" stroke-width=\"1.8\" stroke-linejoin=\"round\" fill=\"none\"/></svg><span id=\"contador-favoritos\" style=\"position:absolute;top:2px;right:2px;background:#F97316;color:white;font-size:0.55rem;width:15px;height:15px;border-radius:50%;display:none;align-items:center;justify-content:center;font-weight:800\"></span></button>'
      + '<button class="boton-icono" id="boton-carrito" onclick="window.location.href=\'/carrito\'"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="1.8"/><path d="M16 10a4 4 0 01-8 0" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg><span id="contador-carrito">0</span></button>'
      + '<button id="boton-login" onclick="window.location.href=\'/login\'">Ingresar</button>'
      + '<button id="boton-registro-vender" onclick="window.location.href=\'/login\'">Vender aquí</button>';
  }
}

function toggleMenuUsuario() {
  var dd = document.getElementById('dropdown-usuario');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', function(e) {
  var cont = document.getElementById('menu-usuario-contenedor');
  if (cont && !cont.contains(e.target)) {
    var dd = document.getElementById('dropdown-usuario');
    if (dd) dd.style.display = 'none';
  }
});

function cerrarSesionNavbar() {
  fetch('/api/auth/logout', { method: 'POST' }).catch(function(){});
  localStorage.clear();
  window.location.href = '/index';
}

async function cargarContadorCarrito(usuarioId) {
  if (!usuarioId) return;
  try {
    var res  = await fetch('/api/carrito?usuarioId=' + usuarioId);
    var data = await res.json();
    var total = (data.items || []).reduce(function(s, i){ return s + i.cantidad; }, 0);
    var el = document.getElementById('contador-carrito');
    if (el) el.textContent = total;
  } catch(e) {}
}

async function cargarContadorFavoritos(usuarioId) {
  if (!usuarioId) return;
  try {
    var res  = await fetch('/api/favoritos?usuarioId=' + usuarioId);
    var data = await res.json();
    var total = Array.isArray(data) ? data.length : 0;
    var el = document.getElementById('contador-favoritos');
    if (el) {
      el.textContent = total;
      el.style.display = total > 0 ? 'flex' : 'none';
    }
  } catch(e) {}
}

// Función global para actualizar el contador sin hacer fetch
// Llamar con +1 al agregar, -1 al quitar
function actualizarContadorFavoritos(delta) {
  var el = document.getElementById('contador-favoritos');
  if (!el) return;
  var actual = parseInt(el.textContent) || 0;
  var nuevo  = Math.max(0, actual + delta);
  el.textContent = nuevo;
  el.style.display = nuevo > 0 ? 'flex' : 'none';
}

// ── Cursor personalizado ─────────────────────────────────────────
var elementoCursorPunto   = document.getElementById('cursor-punto');
var elementoCursorCirculo = document.getElementById('cursor-circulo');
if (elementoCursorPunto && elementoCursorCirculo) {
  document.addEventListener('mousemove', function(e) {
    elementoCursorPunto.style.left = e.clientX + 'px';
    elementoCursorPunto.style.top  = e.clientY + 'px';
    setTimeout(function() {
      elementoCursorCirculo.style.left = e.clientX + 'px';
      elementoCursorCirculo.style.top  = e.clientY + 'px';
    }, 80);
  });
}

// ── Scroll reveal ────────────────────────────────────────────────
var elementosParaRevelar = document.querySelectorAll('.revelar');
var observadorScroll = new IntersectionObserver(function(entradas) {
  entradas.forEach(function(entrada, indice) {
    if (entrada.isIntersecting) {
      setTimeout(function(){ entrada.target.classList.add('visible'); }, indice * 80);
    }
  });
}, { threshold: 0.1 });
elementosParaRevelar.forEach(function(el){ observadorScroll.observe(el); });

// ── Carrusel puntos hero ─────────────────────────────────────────
var puntosCarrusel = document.querySelectorAll('.punto-carrusel');
var indicePuntoActual = 0;
if (puntosCarrusel.length > 0) {
  setInterval(function() {
    puntosCarrusel[indicePuntoActual].classList.remove('activo');
    indicePuntoActual = (indicePuntoActual + 1) % puntosCarrusel.length;
    puntosCarrusel[indicePuntoActual].classList.add('activo');
  }, 2800);
}

// ── Botones hero y banner ────────────────────────────────────────
var heroBtnComprar = document.getElementById('hero-boton-comprar');
if (heroBtnComprar) heroBtnComprar.addEventListener('click', function(){ window.location.href = '/catalogo'; });
var heroBtnVender = document.getElementById('hero-boton-vender');
if (heroBtnVender) heroBtnVender.addEventListener('click', function(){ window.location.href = '/login'; });
var botonBannerOferta = document.getElementById('banner-boton-oferta');
if (botonBannerOferta) botonBannerOferta.addEventListener('click', function(){ window.location.href = '/login'; });

// ── Categorías ───────────────────────────────────────────────────
document.querySelectorAll('.tarjeta-categoria').forEach(function(tarjeta) {
  tarjeta.style.cursor = 'pointer';
  tarjeta.addEventListener('click', function() {
    var nombre = (this.querySelector('.nombre-categoria') || {}).textContent || '';
    var mapa = { 'deportivos':'/catalogo?categoria=deportivos', 'tacones':'/catalogo?categoria=tacones', 'botas':'/catalogo?categoria=botas', 'casual':'/catalogo?categoria=casual', 'sandalias':'/catalogo?categoria=sandalias' };
    window.location.href = mapa[nombre.toLowerCase().trim()] || '/catalogo';
  });
});

// ── Tabs como funciona ───────────────────────────────────────────
var tabsFuncionamiento = document.querySelectorAll('.tab-funcionamiento');
var pasosComprador     = document.getElementById('pasos-comprador');
var pasosVendedor      = document.getElementById('pasos-vendedor');
if (tabsFuncionamiento.length > 0) {
  tabsFuncionamiento.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabsFuncionamiento.forEach(function(t){ t.classList.remove('activo'); });
      this.classList.add('activo');
      if (this.dataset.tab === 'comprador') {
        if (pasosComprador) pasosComprador.style.display = 'grid';
        if (pasosVendedor)  pasosVendedor.style.display  = 'none';
      } else {
        if (pasosComprador) pasosComprador.style.display = 'none';
        if (pasosVendedor)  pasosVendedor.style.display  = 'grid';
      }
    });
  });
}

// ── Barra de búsqueda ────────────────────────────────────────────
var inputBusqueda         = document.getElementById('input-busqueda');
var panelSugerencias      = document.getElementById('panel-sugerencias-busqueda');
var botonEjecutarBusqueda = document.getElementById('boton-ejecutar-busqueda');

function ejecutarBusqueda() {
  var texto = inputBusqueda ? inputBusqueda.value.trim() : '';
  if (!texto) return;
  if (panelSugerencias) panelSugerencias.style.display = 'none';
  window.location.href = '/catalogo?buscar=' + encodeURIComponent(texto);
}

if (inputBusqueda) {
  inputBusqueda.addEventListener('focus', function(){ if(panelSugerencias) panelSugerencias.style.display='block'; });
  document.addEventListener('click', function(e) {
    var cont = document.getElementById('contenedor-barra-busqueda');
    if (cont && !cont.contains(e.target) && panelSugerencias) panelSugerencias.style.display = 'none';
  });
  inputBusqueda.addEventListener('keydown', function(e){ if(e.key==='Enter') ejecutarBusqueda(); });
}
if (botonEjecutarBusqueda) botonEjecutarBusqueda.addEventListener('click', ejecutarBusqueda);
document.querySelectorAll('.sugerencia-item').forEach(function(s) {
  s.addEventListener('click', function() {
    if (inputBusqueda) inputBusqueda.value = this.textContent.replace(/^\S+\s/, '');
    if (panelSugerencias) panelSugerencias.style.display = 'none';
    ejecutarBusqueda();
  });
});

// ── Links navbar categorías ──────────────────────────────────────
document.querySelectorAll('#menu-categorias a').forEach(function(a) {
  var txt = (a.textContent || '').toLowerCase().trim();
  if (txt === 'deportivos') a.href = '/catalogo?categoria=deportivos';
  else if (txt === 'casual') a.href = '/catalogo?categoria=casual';
  else if (txt === 'marcas') a.href = '/marcas';
  else if (txt === 'empresas') a.href = '/empresas';
  else if (txt === 'ofertas') a.href = '/catalogo?ofertas=true';
});

// ================================================================
// DATOS DINÁMICOS DESDE LA API (index.html)
// ================================================================
var API_PRODUCTOS = '/api/productos';
var API_EMPRESAS  = '/api/admin/empresas';
var FONDOS_TARJETA = ['#f0ece4','#e8f0e8','#f0e8e8','#e8eaf0','#faf0e8','#e8f4f0','#f4e8f0','#e8ecf0'];
var COLORES_EMPRESA = ['var(--color-rojo)','#f0b429','#2d6e2d','#1a3a6e','#8b5cf6','#0891b2','#c05621','#b91c1c'];
var MAPA_COLORES = { negro:'#111',blanco:'#fff',rojo:'#c8452d',azul:'#1a3a6e',verde:'#2d6e2d',gris:'#888',rosado:'#e91e8c',rosa:'#e91e8c',morado:'#8b5cf6',naranja:'#f97316',amarillo:'#eab308',beige:'#d4b896',cafe:'#7c5c3e',marino:'#001f5b' };

function formatPrecio(v) { return '$' + Number(v || 0).toLocaleString('es-CO'); }

function generarCirculosColor(colores) {
  if (!colores || !colores.length) return '';
  return colores.slice(0, 3).map(function(c) {
    var k  = c.toLowerCase().split('/')[0].trim();
    var bg = MAPA_COLORES[k] || '#ccc';
    return '<div class="circulo-color" style="background:' + bg + ';' + (k==='blanco'?'border:2px solid #ddd;':'') + '"></div>';
  }).join('');
}

function generarEtiqueta(p) {
  if (p.precioDescuento && p.precioDescuento > 0) {
    return '<span class="etiqueta-producto etiqueta-oferta">-' + Math.round((1-p.precioDescuento/p.precio)*100) + '%</span>';
  }
  var dias = p.fechaRegistro ? (Date.now() - new Date(p.fechaRegistro).getTime()) / 86400000 : 999;
  return dias < 30 ? '<span class="etiqueta-producto etiqueta-nuevo">Nuevo</span>' : '<span class="etiqueta-producto etiqueta-popular">🔥 Top</span>';
}

function generarPrecio(p) {
  if (p.precioDescuento && p.precioDescuento > 0)
    return '<span class="precio-tachado">' + formatPrecio(p.precio) + '</span><span class="precio-oferta">' + formatPrecio(p.precioDescuento) + '</span>';
  return formatPrecio(p.precio);
}

function generarImagen(p) {
  if (p.imagenes && p.imagenes.length > 0 && p.imagenes[0])
    return '<img src="' + p.imagenes[0] + '" alt="' + (p.nombre||'') + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"><span style="display:none;font-size:3rem">👟</span>';
  var emojis = { deportivos:'👟',casual:'🥿',tacones:'👠',botas:'🥾',sandalias:'🩴' };
  return '<span style="font-size:3.5rem">' + (emojis[(p.categoria||'').toLowerCase()]||'👟') + '</span>';
}

async function agregarAlCarrito(productoId, boton) {
  var s = getSesion();
  if (!s.id) { window.location.href = '/login'; return; }
  try {
    var resProd = await fetch('/api/productos/' + productoId);
    var prod    = await resProd.json();
    var tallas  = (prod.tallasDisponibles || prod.tallas || []).map(String).filter(Boolean);
    var colores = (prod.colores || []).filter(Boolean);
    if (!tallas.length && !colores.length) { _ejecutarAgregarCarrito(productoId,'','',boton); return; }
    if (tallas.length === 1 && !colores.length) { _ejecutarAgregarCarrito(productoId,tallas[0],'',boton); return; }
    _mostrarModalTallaColor(prod, tallas, colores, boton);
  } catch(e) { _ejecutarAgregarCarrito(productoId,'','',boton); }
}

var _COLORES_HEX = {'negro':'#1a1a1a','blanco':'#f5f5f5','rojo':'#c8452d','azul':'#2563eb','verde':'#16a34a','amarillo':'#eab308','gris':'#94a3b8','café':'#92400e','cafe':'#92400e','beige':'#d4b896','rosado':'#f472b6','morado':'#7c3aed','naranja':'#f97316','celeste':'#38bdf8'};

function _mostrarModalTallaColor(prod, tallas, colores, botonOrigen) {
  var ant = document.getElementById('modal-seleccion-talla'); if(ant) ant.remove();
  var modal = document.createElement('div');
  modal.id = 'modal-seleccion-talla';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
  var html = '<div style="background:white;border:1px solid #e2e8f0;max-width:420px;width:100%;box-shadow:0 20px 40px rgba(15,23,42,0.15);overflow:hidden">';
  html += '<div style="background:#F97316;height:4px"></div><div style="padding:28px">';
  html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px">';
  html += '<div><p style="font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:#c8452d;font-weight:800;margin-bottom:4px">AGREGAR AL CARRITO</p>';
  html += '<h3 style="font-family:var(--fuente-titulos);font-size:1.4rem;color:#0f172a">'+(prod.nombre||'')+'</h3>';
  html += '<p style="font-size:0.75rem;color:#64748b">'+(prod.marca||'')+'</p></div>';
  html += '<button onclick="document.getElementById(\'modal-seleccion-talla\').remove()" style="background:none;border:none;color:#64748b;font-size:1.1rem;cursor:pointer">✕</button></div>';
  if(tallas.length){
    html += '<p style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#0f172a;font-weight:800;margin-bottom:10px">Talla *</p>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px" id="tallas-modal-grid">';
    tallas.forEach(function(t){ html += '<button onclick="seleccionarTallaModal(\''+t+'\')" data-talla="'+t+'" style="min-width:48px;height:48px;padding:0 10px;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;font-family:var(--fuente-cuerpo);font-size:0.85rem;font-weight:700;cursor:pointer">'+t+'</button>'; });
    html += '</div>';
  }
  if(colores.length){
    html += '<p style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#0f172a;font-weight:800;margin-bottom:10px">Color *</p>';
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px" id="colores-modal-grid">';
    colores.forEach(function(col){ var hex=_COLORES_HEX[col.toLowerCase()]||'#94a3b8'; html += '<button onclick="seleccionarColorModal(\''+col+'\')" data-color="'+col+'" title="'+col+'" style="width:32px;height:32px;border-radius:50%;background:'+hex+';border:2px solid '+(col.toLowerCase()==='blanco'?'#e2e8f0':hex)+';cursor:pointer"></button>'; });
    html += '</div>';
  }
  html += '<p id="modal-talla-error" style="color:#c8452d;font-size:0.75rem;font-weight:700;margin-bottom:12px;display:none"></p>';
  html += '<button onclick="_confirmarTallaModal(\''+prod.id+'\')" id="btn-confirmar-talla" style="width:100%;padding:13px;background:#0f172a;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.78rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer">Agregar al carrito</button>';
  html += '</div></div>';
  modal.innerHTML = html;
  modal._productoId=prod.id; modal._botonOrigen=botonOrigen; modal._tieneTallas=tallas.length>0; modal._tieneColores=colores.length>0;
  document.body.appendChild(modal);
}

function seleccionarTallaModal(talla){
  document.querySelectorAll('#tallas-modal-grid button').forEach(function(b){ var ok=b.dataset.talla===talla; b.style.background=ok?'#0f172a':'#f8fafc'; b.style.color=ok?'white':'#0f172a'; b.style.borderColor=ok?'#0f172a':'#e2e8f0'; });
  var m=document.getElementById('modal-seleccion-talla'); if(m) m._tallaSeleccionada=talla;
  var e=document.getElementById('modal-talla-error'); if(e) e.style.display='none';
}

function seleccionarColorModal(color){
  document.querySelectorAll('#colores-modal-grid button').forEach(function(b){ b.style.transform=b.dataset.color===color?'scale(1.3)':'scale(1)'; b.style.boxShadow=b.dataset.color===color?'0 0 0 3px #0f172a':'none'; });
  var m=document.getElementById('modal-seleccion-talla'); if(m) m._colorSeleccionado=color;
  var e=document.getElementById('modal-talla-error'); if(e) e.style.display='none';
}

async function _confirmarTallaModal(productoId){
  var modal=document.getElementById('modal-seleccion-talla'); if(!modal) return;
  var talla=modal._tallaSeleccionada||''; var color=modal._colorSeleccionado||'';
  var boton=modal._botonOrigen; var errEl=document.getElementById('modal-talla-error'); var btnConf=document.getElementById('btn-confirmar-talla');
  if(modal._tieneTallas&&!talla){ if(errEl){errEl.textContent='⚠ Selecciona una talla';errEl.style.display='block';} return; }
  if(modal._tieneColores&&!color){ if(errEl){errEl.textContent='⚠ Selecciona un color';errEl.style.display='block';} return; }
  if(btnConf){btnConf.textContent='Agregando...';btnConf.disabled=true;}
  var ok=await _ejecutarAgregarCarrito(productoId,talla,color,boton,1);
  if(ok) modal.remove(); else if(btnConf){btnConf.textContent='Agregar al carrito';btnConf.disabled=false;}
}

async function _ejecutarAgregarCarrito(productoId,talla,color,boton){
  var s=getSesion(); if(!s.id){window.location.href='/login';return false;}
  try{
    var res=await fetch('/api/carrito/agregar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuarioId:s.id,productoId:productoId,talla:talla,color:color,cantidad:1})});
    var data=await res.json();
    if(data.exito){
      if(boton){var orig=boton.textContent;boton.textContent='✓ ¡Agregado!';boton.style.background='#16a34a';setTimeout(function(){boton.textContent=orig;boton.style.background='';},1500);}
      var total=(data.carrito&&data.carrito.items||[]).reduce(function(s,i){return s+i.cantidad;},0);
      var contEl=document.getElementById('contador-carrito');
      if(contEl){contEl.textContent=total;contEl.style.transform='scale(1.5)';setTimeout(function(){contEl.style.transform='';},200);}
      return true;
    }
    return false;
  }catch(e){console.error('Error carrito:',e);return false;}
}

// ── Productos destacados ─────────────────────────────────────────
async function cargarProductosDestacados() {
  var grilla = document.getElementById('grilla-productos');
  if (!grilla) return;
  try {
    var res  = await fetch(API_PRODUCTOS + '?tamano=4&pagina=0&orden=novedad');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    var productos = data.productos || data;
    if (!productos || !productos.length) {
      grilla.innerHTML = '<p style="text-align:center;color:#64748B;padding:40px;grid-column:1/-1">No hay productos aún.</p>';
      return;
    }
    grilla.innerHTML = productos.map(function(p, i) {
      var id    = p.id || p._id;
      var fondo = FONDOS_TARJETA[i % FONDOS_TARJETA.length];
      return '<div class="tarjeta-producto" style="cursor:pointer" onclick="window.location.href=\'/detalle?id=' + id + '\'">'
        + '<div class="imagen-producto" style="background:' + fondo + '">'
          + generarEtiqueta(p)
          + generarImagen(p)
          + '<button class="boton-agregar-carrito" onclick="event.stopPropagation();agregarAlCarrito(\'' + id + '\',this)">+ Agregar al carrito</button>'
        + '</div>'
        + '<div class="detalle-producto">'
          + '<p class="vendedor-producto">por <a href="#" class="enlace-vendedor">' + (p.vendedorNombre||'Tienda') + '</a></p>'
          + '<p class="marca-producto">' + (p.marca||'') + '</p>'
          + '<p class="nombre-producto">' + (p.nombre||'') + '</p>'
          + '<div class="pie-producto">'
            + '<div class="precio-producto">' + generarPrecio(p) + '</div>'
            + '<div class="colores-disponibles">' + generarCirculosColor(p.colores) + '</div>'
          + '</div>'
        + '</div>'
      + '</div>';
    }).join('');
    grilla.querySelectorAll('.tarjeta-producto').forEach(function(el){ observadorScroll.observe(el); });
  } catch(e) {
    console.warn('Error productos:', e);
    grilla.innerHTML = '<p style="text-align:center;color:#64748B;padding:40px;grid-column:1/-1">Error conectando con el servidor.</p>';
  }
}

// ── Empresas destacadas ──────────────────────────────────────────
async function cargarEmpresasDestacadas() {
  var grilla = document.getElementById('grilla-empresas');
  if (!grilla) return;
  try {
    var res     = await fetch(API_EMPRESAS + '?estado=APROBADA');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var empresas = await res.json();
    if (!empresas || !empresas.length) {
      grilla.innerHTML = '<p style="text-align:center;color:#64748B;padding:40px;grid-column:1/-1">No hay empresas aún.</p>';
      return;
    }
    grilla.innerHTML = empresas.slice(0, 4).map(function(e, i) {
      var nombre   = e.nombreEmpresa || e.nombre || 'Empresa';
      var iniciales = nombre.split(' ').map(function(w){ return w[0]||''; }).join('').substring(0,2).toUpperCase();
      var ciudad   = e.ciudad || '';
      var color    = COLORES_EMPRESA[i % COLORES_EMPRESA.length];
      return '<div class="tarjeta-empresa" style="cursor:pointer" onclick="window.location.href=\'/catalogo?empresa=' + encodeURIComponent(nombre) + '\'">'
        + '<div class="empresa-cabecera">'
          + '<div class="empresa-logo" style="background:' + color + '">' + iniciales + '</div>'
          + '<div class="empresa-estado-verificado">✓ Verificada</div>'
        + '</div>'
        + '<h3 class="empresa-nombre">' + nombre + '</h3>'
        + '<p class="empresa-ciudad">📍 ' + ciudad + '</p>'
        + '<button class="boton-ver-empresa" onclick="event.stopPropagation();window.location.href=\'/catalogo?empresa=' + encodeURIComponent(nombre) + '\'">Ver tienda →</button>'
      + '</div>';
    }).join('');
    grilla.querySelectorAll('.tarjeta-empresa').forEach(function(el){ observadorScroll.observe(el); });
  } catch(e) {
    console.warn('Error empresas:', e);
    grilla.innerHTML = '<p style="text-align:center;color:#64748B;padding:40px;grid-column:1/-1">Error cargando empresas.</p>';
  }
}

// ── Conteos categorías ───────────────────────────────────────────
async function cargarConteosCategorias() {
  try {
    var res  = await fetch(API_PRODUCTOS + '?tamano=1000&pagina=0');
    if (!res.ok) return;
    var data = await res.json();
    var productos = data.productos || data || [];
    var conteo = {};
    productos.forEach(function(p) {
      var cat = (p.categoria || 'otro').toLowerCase();
      conteo[cat] = (conteo[cat] || 0) + 1;
    });
    var set = function(id, cat) {
      var el = document.getElementById(id);
      if (el) { var n = conteo[cat] || 0; el.textContent = n > 0 ? n + ' producto' + (n!==1?'s':'') : 'Próximamente'; }
    };
    set('cat-deportivos', 'deportivos');
    set('cat-tacones',    'tacones');
    set('cat-botas',      'botas');
    set('cat-casual',     'casual');
    set('cat-sandalias',  'sandalias');
    var statProductos = document.getElementById('stat-productos');
    if (statProductos && productos.length > 0)
      statProductos.innerHTML = '+' + productos.length + '<span class="acento-rojo"></span>';
  } catch(e) { console.warn('Error categorías:', e); }
}

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  actualizarNavbar();
  cargarProductosDestacados();
  cargarEmpresasDestacadas();
  cargarConteosCategorias();
});

console.log('✅ scripts.js cargado');