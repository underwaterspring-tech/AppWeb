// ── GUARD: Solo compradores ─────────────────────────────────────
(function () {
  var id = localStorage.getItem("uw-id");
  var rol = localStorage.getItem("uw-rol");
  if (!id) {
    window.location.replace("/login");
    throw new Error("No autenticado");
  }
  if (rol === "ADMIN") {
    window.location.replace("/panel-admin");
    throw new Error("Rol incorrecto");
  }
  if (rol === "VENDEDOR") {
    window.location.replace("/panel-vendedor");
    throw new Error("Rol incorrecto");
  }
})();

var valoracionElegida = 0;
var productoResenaId = null;
var textoVals = {
  1: "😞 Muy malo",
  2: "😐 Regular",
  3: "🙂 Bueno",
  4: "😊 Muy bueno",
  5: "🤩 Excelente",
};

function fmtFecha(f) {
  if (!f) return "—";
  try {
    return new Date(f).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(f);
  }
}

function renderTimeline(estado) {
  var pasos = ["Recibido", "Confirmado", "Preparando", "Enviado", "Entregado"];
  var nivel =
    { PENDIENTE: 0, PROCESANDO: 2, ENVIADO: 3, ENTREGADO: 4 }[estado] || 0;
  if (estado === "CANCELADO")
    return '<div class="timeline-pedido"><div class="paso-timeline completado"><div class="paso-icono">✓</div><p class="paso-nombre">Recibido</p></div><div class="linea-timeline completada"></div><div class="paso-timeline activo"><div class="paso-icono">✕</div><p class="paso-nombre">Cancelado</p></div></div>';
  return (
    '<div class="timeline-pedido">' +
    pasos
      .map(function (p, i) {
        var cl =
          i < nivel ? "completado" : i === nivel ? "activo" : "pendiente";
        var ic = i < nivel ? "✓" : i === nivel ? "◉" : "○";
        return (
          (i > 0
            ? '<div class="linea-timeline' +
              (i <= nivel ? " completada" : "") +
              '"></div>'
            : "") +
          '<div class="paso-timeline ' +
          cl +
          '"><div class="paso-icono">' +
          ic +
          '</div><p class="paso-nombre">' +
          p +
          "</p></div>"
        );
      })
      .join("") +
    "</div>"
  );
}

function renderPedido(p) {
  var id = String(p.id || p._id || "");
  var estado = (p.estado || "PROCESANDO").toUpperCase();
  var items = p.items || [];
  var total =
    p.total ||
    items.reduce(function (s, i) {
      return s + (i.subtotal || 0);
    }, 0);
  var fecha = fmtFecha(p.fechaPedido);
  var idCorto = id.slice(-4).toUpperCase();
  var vendNom =
    items.length > 0 ? items[0].vendedorNombre || "Tienda" : "Tienda";
  var vendIni = vendNom
    .split(" ")
    .map(function (w) {
      return w[0] || "";
    })
    .join("")
    .substring(0, 2)
    .toUpperCase();

  var badgeMap = {
    PROCESANDO: "badge-procesando",
    PENDIENTE: "badge-procesando",
    ENVIADO: "badge-enviado",
    ENTREGADO: "badge-entregado",
    CANCELADO: "badge-cancelado",
  };
  var textoMap = {
    PROCESANDO: "⏳ En proceso",
    PENDIENTE: "⏳ Pendiente",
    ENVIADO: "🚚 Enviado",
    ENTREGADO: "✓ Entregado",
    CANCELADO: "✕ Cancelado",
  };

  var productosHTML = items
    .map(function (item) {
      return (
        '<div class="pedido-producto-item">' +
        '<div class="pedido-producto-foto">👟</div>' +
        '<div class="pedido-producto-info">' +
        '<p class="pedido-producto-marca">' +
        (item.marca || "") +
        "</p>" +
        '<p class="pedido-producto-nombre">' +
        (item.nombre || "—") +
        "</p>" +
        '<p class="pedido-producto-variante">Talla ' +
        (item.talla || "—") +
        " · " +
        (item.color || "—") +
        " · x" +
        (item.cantidad || 1) +
        "</p>" +
        "</div>" +
        '<p class="pedido-producto-precio">$' +
        Number(item.subtotal || 0).toLocaleString("es-CO") +
        "</p>" +
        '<a href="/detalle?id=' +
        (item.productoId || "") +
        '" class="pedido-producto-ver">Ver →</a>' +
        "</div>"
      );
    })
    .join("");

  var resenaHTML =
    estado === "ENTREGADO"
      ? '<div class="banner-resena"><div class="banner-resena-texto"><span class="banner-resena-icono">⭐</span><div><p class="banner-resena-titulo">¿Qué tal el producto?</p><p class="banner-resena-subtitulo">Tu opinión ayuda a otros compradores</p></div></div>' +
        '<button class="btn-dejar-resena" onclick="abrirModal(\'' +
        id +
        "','" +
        (items[0]?.nombre || "Producto").replace(/'/g, "") +
        "','" +
        vendNom.replace(/'/g, "") +
        "')\">Dejar reseña</button></div>"
      : "";

  var accionesHTML =
    '<div class="pedido-acciones">' +
    (estado === "PROCESANDO" || estado === "PENDIENTE"
      ? '<button class="btn-pedido-cancelar" onclick="cancelarPedido(\'' +
        id +
        "')\">Cancelar pedido</button>"
      : "") +
    (estado === "ENTREGADO"
      ? '<button class="btn-pedido-primario" onclick="window.location.href=\'/catalogo\'">Volver a comprar</button>'
      : "") +
    '<button class="btn-pedido-outline" onclick="window.location.href=\'/catalogo\'">Ver catálogo</button>' +
    "</div>";

  return (
    '<div class="tarjeta-pedido revelar" data-estado="' +
    estado.toLowerCase() +
    '" data-id="' +
    id +
    '">' +
    '<div class="pedido-header">' +
    '<div class="pedido-header-izq"><span class="pedido-id">#' +
    idCorto +
    '</span><span class="pedido-fecha">' +
    fecha +
    "</span></div>" +
    '<div class="pedido-header-der"><span class="badge-pedido ' +
    (badgeMap[estado] || "badge-procesando") +
    '">' +
    (textoMap[estado] || estado) +
    '</span><span class="pedido-precio-total">$' +
    Number(total).toLocaleString("es-CO") +
    "</span></div>" +
    "</div>" +
    renderTimeline(estado) +
    '<div class="pedido-productos">' +
    productosHTML +
    "</div>" +
    resenaHTML +
    '<div class="pedido-footer">' +
    '<div class="pedido-vendedor"><span class="pedido-vendedor-logo">' +
    vendIni +
    '</span><span class="pedido-vendedor-nombre">' +
    vendNom +
    "</span></div>" +
    accionesHTML +
    "</div></div>"
  );
}

document.addEventListener("DOMContentLoaded", async function () {
  var usuarioId = localStorage.getItem("uw-id");
  var lista = document.getElementById("lista-mis-pedidos");
  var sinSesion = document.getElementById("ped-sin-sesion");
  var vacio = document.getElementById("ped-vacio");
  var sub = document.getElementById("subtitulo-pagina-comprador");

  if (!usuarioId) {
    sinSesion.style.display = "block";
    return;
  }

  try {
    var res = await fetch("/api/pedidos?usuarioId=" + usuarioId);
    var pedidos = await res.json();

    if (!pedidos || pedidos.length === 0) {
      vacio.style.display = "block";
      return;
    }

    if (sub)
      sub.textContent =
        pedidos.length + " pedido" + (pedidos.length !== 1 ? "s" : "");
    lista.innerHTML = pedidos.map(renderPedido).join("");
    setTimeout(function () {
      lista.querySelectorAll(".revelar").forEach(function (el) {
        el.classList.add("visible");
      });
    }, 100);

    // Filtros
    document.querySelectorAll(".filtro-estado-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filtro-estado-btn").forEach(function (b) {
          b.classList.remove("activo");
        });
        this.classList.add("activo");
        var est = this.dataset.estado;
        lista.querySelectorAll(".tarjeta-pedido").forEach(function (t) {
          t.style.display =
            est === "todos" || t.dataset.estado === est ? "" : "none";
        });
      });
    });
  } catch (err) {
    console.error(err);
    lista.innerHTML =
      '<p style="text-align:center;color:#64748B;padding:40px">Error cargando pedidos.</p>';
  }
});

async function cancelarPedido(id) {
  if (!confirm("¿Cancelar este pedido?")) return;
  var usuarioId = localStorage.getItem("uw-id");
  try {
    var res = await fetch(
      "/api/pedidos/" + id + "/cancelar?usuarioId=" + usuarioId,
      { method: "PUT" },
    );
    var data = await res.json();
    if (data.exito) window.location.reload();
    else alert("No se pudo cancelar: " + (data.error || ""));
  } catch {
    alert("Error de conexión");
  }
}

function abrirModal(pedidoId, nombreProducto, empresa) {
  productoResenaId = pedidoId;
  valoracionElegida = 0;
  document.getElementById("modal-nombre-producto").textContent = nombreProducto;
  document.getElementById("modal-empresa-producto").textContent = empresa;
  document.getElementById("input-comentario-resena").value = "";
  document.getElementById("error-resena").textContent = "";
  document.getElementById("texto-valoracion").textContent =
    "Selecciona una valoración";
  document.querySelectorAll(".estrella-click").forEach(function (e) {
    e.style.color = "";
    e.classList.remove("activa");
  });
  document.getElementById("modal-resena").style.display = "flex";
}

document
  .getElementById("btn-cerrar-modal-resena")
  .addEventListener("click", function () {
    document.getElementById("modal-resena").style.display = "none";
  });

document.getElementById("modal-resena").addEventListener("click", function (e) {
  if (e.target === this) this.style.display = "none";
});

// Estrellas
var estrellas = document.querySelectorAll(".estrella-click");
estrellas.forEach(function (est) {
  est.addEventListener("mouseenter", function () {
    var v = parseInt(this.dataset.valor);
    estrellas.forEach(function (e) {
      e.style.color = parseInt(e.dataset.valor) <= v ? "var(--amarillo)" : "";
    });
    document.getElementById("texto-valoracion").textContent =
      textoVals[v] || "";
  });
  est.addEventListener("mouseleave", function () {
    estrellas.forEach(function (e) {
      e.style.color =
        parseInt(e.dataset.valor) <= valoracionElegida ? "var(--amarillo)" : "";
    });
    document.getElementById("texto-valoracion").textContent =
      valoracionElegida > 0
        ? textoVals[valoracionElegida]
        : "Selecciona una valoración";
  });
  est.addEventListener("click", function () {
    valoracionElegida = parseInt(this.dataset.valor);
    estrellas.forEach(function (e) {
      e.classList.toggle(
        "activa",
        parseInt(e.dataset.valor) <= valoracionElegida,
      );
      e.style.color =
        parseInt(e.dataset.valor) <= valoracionElegida ? "var(--amarillo)" : "";
    });
    document.getElementById("texto-valoracion").textContent =
      textoVals[valoracionElegida];
  });
});

document
  .getElementById("btn-enviar-resena")
  .addEventListener("click", async function () {
    var comentario = document
      .getElementById("input-comentario-resena")
      .value.trim();
    var errEl = document.getElementById("error-resena");
    if (valoracionElegida === 0) {
      errEl.textContent = "Selecciona una valoración";
      return;
    }
    if (!comentario) {
      errEl.textContent = "Escribe un comentario";
      return;
    }
    errEl.textContent = "";
    var usuarioId = localStorage.getItem("uw-id");
    var nombre = localStorage.getItem("uw-nombre");
    try {
      await fetch("/api/comprador/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          productoId: productoResenaId,
          nombreUsuario: nombre,
          valoracion: valoracionElegida,
          comentario,
        }),
      });
      document.getElementById("modal-resena").style.display = "none";
      alert("✅ ¡Reseña publicada!");
    } catch {
      errEl.textContent = "Error al enviar";
    }
  });

  var valoracionElegida = 0;
  var productoResenaId  = null;
  var textoVals = {1:'😞 Muy malo',2:'😐 Regular',3:'🙂 Bueno',4:'😊 Muy bueno',5:'🤩 Excelente'};

  function fmtFecha(f) {
    if (!f) return '—';
    try { return new Date(f).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'}); }
    catch { return String(f); }
  }

  function renderTimeline(estado) {
    var pasos = ['Recibido','Confirmado','Preparando','Enviado','Entregado'];
    var nivel = {PENDIENTE:0,PROCESANDO:2,ENVIADO:3,ENTREGADO:4}[estado] || 0;
    if (estado === 'CANCELADO') return '<div class="timeline-pedido"><div class="paso-timeline completado"><div class="paso-icono">✓</div><p class="paso-nombre">Recibido</p></div><div class="linea-timeline completada"></div><div class="paso-timeline activo"><div class="paso-icono">✕</div><p class="paso-nombre">Cancelado</p></div></div>';
    return '<div class="timeline-pedido">' + pasos.map(function(p,i){
      var cl = i < nivel ? 'completado' : i === nivel ? 'activo' : 'pendiente';
      var ic = i < nivel ? '✓' : i === nivel ? '◉' : '○';
      return (i>0 ? '<div class="linea-timeline'+(i<=nivel?' completada':'')+'"></div>' : '')
        + '<div class="paso-timeline '+cl+'"><div class="paso-icono">'+ic+'</div><p class="paso-nombre">'+p+'</p></div>';
    }).join('') + '</div>';
  }

  function renderPedido(p) {
    var id      = String(p.id || p._id || '');
    var estado  = (p.estado || 'PROCESANDO').toUpperCase();
    var items   = p.items || [];
    var total   = p.total || items.reduce(function(s,i){return s+(i.subtotal||0);},0);
    var fecha   = fmtFecha(p.fechaPedido);
    var idCorto = id.slice(-4).toUpperCase();
    var vendNom = items.length > 0 ? (items[0].vendedorNombre||'Tienda') : 'Tienda';
    var vendIni = vendNom.split(' ').map(function(w){return w[0]||'';}).join('').substring(0,2).toUpperCase();

    var badgeMap = {PROCESANDO:'badge-procesando',PENDIENTE:'badge-procesando',ENVIADO:'badge-enviado',ENTREGADO:'badge-entregado',CANCELADO:'badge-cancelado'};
    var textoMap = {PROCESANDO:'⏳ En proceso',PENDIENTE:'⏳ Pendiente',ENVIADO:'🚚 Enviado',ENTREGADO:'✓ Entregado',CANCELADO:'✕ Cancelado'};

    var productosHTML = items.map(function(item){
      return '<div class="pedido-producto-item">'
        +'<div class="pedido-producto-foto">👟</div>'
        +'<div class="pedido-producto-info">'
        +'<p class="pedido-producto-marca">'+(item.marca||'')+'</p>'
        +'<p class="pedido-producto-nombre">'+(item.nombre||'—')+'</p>'
        +'<p class="pedido-producto-variante">Talla '+(item.talla||'—')+' · '+(item.color||'—')+' · x'+(item.cantidad||1)+'</p>'
        +'</div>'
        +'<p class="pedido-producto-precio">$'+Number(item.subtotal||0).toLocaleString('es-CO')+'</p>'
        +'<a href="/detalle?id='+(item.productoId||'')+'" class="pedido-producto-ver">Ver →</a>'
        +'</div>';
    }).join('');

    var resenaHTML = estado==='ENTREGADO'
      ? '<div class="banner-resena"><div class="banner-resena-texto"><span class="banner-resena-icono">⭐</span><div><p class="banner-resena-titulo">¿Qué tal el producto?</p><p class="banner-resena-subtitulo">Tu opinión ayuda a otros compradores</p></div></div>'
        +'<button class="btn-dejar-resena" onclick="abrirModal(\''+id+'\',\''+(items[0]?.nombre||'Producto').replace(/'/g,'')+'\',\''+vendNom.replace(/'/g,'')+'\')">Dejar reseña</button></div>'
      : '';

    var accionesHTML = '<div class="pedido-acciones">'
      +(estado==='PROCESANDO'||estado==='PENDIENTE' ? '<button class="btn-pedido-cancelar" onclick="cancelarPedido(\''+id+'\')">Cancelar pedido</button>' : '')
      +(estado==='ENTREGADO' ? '<button class="btn-pedido-primario" onclick="window.location.href=\'/catalogo\'">Volver a comprar</button>' : '')
      +'<button class="btn-pedido-outline" onclick="window.location.href=\'/catalogo\'">Ver catálogo</button>'
      +'</div>';

    return '<div class="tarjeta-pedido revelar" data-estado="'+estado.toLowerCase()+'" data-id="'+id+'">'
      +'<div class="pedido-header">'
      +'<div class="pedido-header-izq"><span class="pedido-id">#'+idCorto+'</span><span class="pedido-fecha">'+fecha+'</span></div>'
      +'<div class="pedido-header-der"><span class="badge-pedido '+(badgeMap[estado]||'badge-procesando')+'">'+(textoMap[estado]||estado)+'</span><span class="pedido-precio-total">$'+Number(total).toLocaleString('es-CO')+'</span></div>'
      +'</div>'
      +renderTimeline(estado)
      +'<div class="pedido-productos">'+productosHTML+'</div>'
      +resenaHTML
      +'<div class="pedido-footer">'
      +'<div class="pedido-vendedor"><span class="pedido-vendedor-logo">'+vendIni+'</span><span class="pedido-vendedor-nombre">'+vendNom+'</span></div>'
      +accionesHTML
      +'</div></div>';
  }

  document.addEventListener('DOMContentLoaded', async function() {
    var usuarioId = localStorage.getItem('uw-id');
    var lista     = document.getElementById('lista-mis-pedidos');
    var sinSesion = document.getElementById('ped-sin-sesion');
    var vacio     = document.getElementById('ped-vacio');
    var sub       = document.getElementById('subtitulo-pagina-comprador');

    if (!usuarioId) { sinSesion.style.display='block'; return; }

    try {
      var res     = await fetch('/api/pedidos?usuarioId='+usuarioId);
      var pedidos = await res.json();

      if (!pedidos || pedidos.length===0) { vacio.style.display='block'; return; }

      if (sub) sub.textContent = pedidos.length+' pedido'+(pedidos.length!==1?'s':'');
      lista.innerHTML = pedidos.map(renderPedido).join('');
      setTimeout(function(){ lista.querySelectorAll('.revelar').forEach(function(el){el.classList.add('visible');}); },100);

      // Filtros
      document.querySelectorAll('.filtro-estado-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
          document.querySelectorAll('.filtro-estado-btn').forEach(function(b){b.classList.remove('activo');});
          this.classList.add('activo');
          var est = this.dataset.estado;
          lista.querySelectorAll('.tarjeta-pedido').forEach(function(t){
            t.style.display = (est==='todos'||t.dataset.estado===est) ? '' : 'none';
          });
        });
      });

    } catch(err) {
      console.error(err);
      lista.innerHTML='<p style="text-align:center;color:#888;padding:40px">Error cargando pedidos.</p>';
    }
  });

  async function cancelarPedido(id) {
    if (!confirm('¿Cancelar este pedido?')) return;
    var usuarioId = localStorage.getItem('uw-id');
    try {
      var res  = await fetch('/api/pedidos/'+id+'/cancelar?usuarioId='+usuarioId,{method:'PUT'});
      var data = await res.json();
      if (data.exito) window.location.reload();
      else alert('No se pudo cancelar: '+(data.error||''));
    } catch { alert('Error de conexión'); }
  }

  function abrirModal(pedidoId, nombreProducto, empresa) {
    productoResenaId = pedidoId;
    valoracionElegida = 0;
    document.getElementById('modal-nombre-producto').textContent  = nombreProducto;
    document.getElementById('modal-empresa-producto').textContent = empresa;
    document.getElementById('input-comentario-resena').value = '';
    document.getElementById('error-resena').textContent = '';
    document.getElementById('texto-valoracion').textContent = 'Selecciona una valoración';
    document.querySelectorAll('.estrella-click').forEach(function(e){e.style.color='';e.classList.remove('activa');});
    document.getElementById('modal-resena').style.display='flex';
  }

  document.getElementById('btn-cerrar-modal-resena').addEventListener('click',function(){
    document.getElementById('modal-resena').style.display='none';
  });

  document.getElementById('modal-resena').addEventListener('click',function(e){
    if (e.target===this) this.style.display='none';
  });

  // Estrellas
  var estrellas = document.querySelectorAll('.estrella-click');
  estrellas.forEach(function(est){
    est.addEventListener('mouseenter',function(){
      var v = parseInt(this.dataset.valor);
      estrellas.forEach(function(e){ e.style.color=parseInt(e.dataset.valor)<=v?'var(--color-amarillo)':''; });
      document.getElementById('texto-valoracion').textContent = textoVals[v]||'';
    });
    est.addEventListener('mouseleave',function(){
      estrellas.forEach(function(e){ e.style.color=parseInt(e.dataset.valor)<=valoracionElegida?'var(--color-amarillo)':''; });
      document.getElementById('texto-valoracion').textContent = valoracionElegida>0?textoVals[valoracionElegida]:'Selecciona una valoración';
    });
    est.addEventListener('click',function(){
      valoracionElegida = parseInt(this.dataset.valor);
      estrellas.forEach(function(e){ e.classList.toggle('activa',parseInt(e.dataset.valor)<=valoracionElegida); e.style.color=parseInt(e.dataset.valor)<=valoracionElegida?'var(--color-amarillo)':''; });
      document.getElementById('texto-valoracion').textContent = textoVals[valoracionElegida];
    });
  });

  document.getElementById('btn-enviar-resena').addEventListener('click', async function(){
    var comentario = document.getElementById('input-comentario-resena').value.trim();
    var errEl      = document.getElementById('error-resena');
    if (valoracionElegida===0) { errEl.textContent='Selecciona una valoración'; return; }
    if (!comentario)           { errEl.textContent='Escribe un comentario'; return; }
    errEl.textContent='';
    var usuarioId = localStorage.getItem('uw-id');
    var nombre    = localStorage.getItem('uw-nombre');
    try {
      await fetch('/api/comprador/resenas',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({usuarioId,productoId:productoResenaId,nombreUsuario:nombre,valoracion:valoracionElegida,comentario})});
      document.getElementById('modal-resena').style.display='none';
      alert('✅ ¡Reseña publicada!');
    } catch { errEl.textContent='Error al enviar'; }
  });
