// ================================================================
// scripts_Reportes.js — Modal de reporte para compradores y vendedores
// ================================================================

function abrirModalReporte(tipo, entidadId, entidadNombre) {
  var modal = document.getElementById("modal-reporte-usuario");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-reporte-usuario";
    modal.style.cssText =
      "position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px";
    modal.addEventListener("click", function (e) {
      if (e.target === modal) cerrarModalReporte();
    });
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div style="background:#FFFFFF;border:1px solid #E2E8F0;max-width:520px;width:100%;padding:32px;position:relative">' +
    '<button onclick="cerrarModalReporte()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#64748B;font-size:1.2rem;cursor:pointer">&#10005;</button>' +
    '<h3 style="font-family:var(--fuente-titulos);font-size:1.5rem;letter-spacing:0.04em;color:#0F172A;margin-bottom:20px">ENVIAR REPORTE</h3>' +
    '<div style="display:flex;flex-direction:column;gap:14px">' +
    '<div><label style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#d4cfc8;display:block;margin-bottom:6px">Tipo *</label>' +
    '<select id="rep-tipo" style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);padding:12px 16px;outline:none;box-sizing:border-box">' +
    '<option value="PRODUCTO">Problema con un producto</option>' +
    '<option value="PEDIDO">Problema con un pedido</option>' +
    '<option value="PAGO">Problema con un pago</option>' +
    '<option value="USUARIO">Reportar un usuario</option>' +
    '<option value="OTRO" selected>Otro</option>' +
    "</select></div>" +
    '<div><label style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#d4cfc8;display:block;margin-bottom:6px">Asunto *</label>' +
    '<input type="text" id="rep-asunto" placeholder="Describe brevemente el problema" style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);padding:12px 16px;outline:none;box-sizing:border-box"/></div>' +
    '<div><label style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#d4cfc8;display:block;margin-bottom:6px">Descripcion *</label>' +
    '<textarea id="rep-descripcion" rows="4" placeholder="Explica con detalle lo que sucedio..." style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);padding:12px 16px;outline:none;resize:vertical;box-sizing:border-box"></textarea></div>' +
    '<p id="rep-error" style="color:#e05252;font-size:0.78rem;display:none"></p>' +
    '<p id="rep-exito" style="color:#4caf50;font-size:0.78rem;display:none"></p>' +
    '<button onclick="enviarReporte()" style="width:100%;padding:14px;background:#0E6655;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.85rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Enviar reporte</button>' +
    "</div>" +
    "</div>";

  // Prellenar tipo si viene
  if (tipo) {
    var sel = document.getElementById("rep-tipo");
    if (sel) sel.value = tipo;
  }
  modal._entidadId = entidadId || null;
  modal._entidadNombre = entidadNombre || null;
  modal.style.display = "flex";
}

function cerrarModalReporte() {
  var modal = document.getElementById("modal-reporte-usuario");
  if (modal) modal.style.display = "none";
}

async function enviarReporte() {
  var uid = localStorage.getItem("uw-id");
  var nombre = localStorage.getItem("uw-nombre");
  var email = localStorage.getItem("uw-email");
  var rol = localStorage.getItem("uw-rol");
  var tipo = document.getElementById("rep-tipo")
    ? document.getElementById("rep-tipo").value
    : "OTRO";
  var asunto = document.getElementById("rep-asunto")
    ? document.getElementById("rep-asunto").value.trim()
    : "";
  var desc = document.getElementById("rep-descripcion")
    ? document.getElementById("rep-descripcion").value.trim()
    : "";
  var errEl = document.getElementById("rep-error");
  var exitoEl = document.getElementById("rep-exito");
  var modal = document.getElementById("modal-reporte-usuario");

  if (!asunto) {
    errEl.textContent = "El asunto es requerido";
    errEl.style.display = "block";
    return;
  }
  if (!desc) {
    errEl.textContent = "La descripcion es requerida";
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";

  try {
    var res = await fetch("/api/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: uid,
        usuarioNombre: nombre,
        usuarioEmail: email,
        usuarioRol: rol,
        tipo: tipo,
        asunto: asunto,
        descripcion: desc,
        entidadId: modal ? modal._entidadId : null,
        entidadNombre: modal ? modal._entidadNombre : null,
      }),
    });
    var data = await res.json();
    if (data.exito) {
      exitoEl.textContent = "✓ " + data.mensaje;
      exitoEl.style.display = "block";
      document.getElementById("rep-asunto").value = "";
      document.getElementById("rep-descripcion").value = "";
      setTimeout(function () {
        cerrarModalReporte();
        exitoEl.style.display = "none";
      }, 2500);
    } else {
      errEl.textContent = data.mensaje || "Error al enviar";
      errEl.style.display = "block";
    }
  } catch (e) {
    errEl.textContent = "Error de conexion";
    errEl.style.display = "block";
  }
}

console.log("scripts_Reportes.js cargado");
