// ================================================================
// MODAL ADMIN — reemplaza los alert() nativos
// ================================================================
function filaModal(label, valor) {
  return (
    '<div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:12px 14px">' +
    '<p style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#64748B;margin-bottom:4px">' +
    label +
    "</p>" +
    '<p style="font-size:0.88rem;font-weight:700;color:#0F172A">' +
    (valor || "—") +
    "</p>" +
    "</div>"
  );
}

function abrirModalAdmin(contenidoHTML) {
  let modal = document.getElementById("modal-admin-detalle");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-admin-detalle";
    modal.style.cssText =
      "position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px";
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.style.display = "none";
    });
    document.body.appendChild(modal);
  }
  var caja = document.createElement("div");
  caja.style.cssText =
    "background:#FFFFFF;border:1px solid #E2E8F0;max-width:560px;width:100%;max-height:85vh;overflow-y:auto;padding:32px;position:relative;border-radius:2px";
  var btnCerrar = document.createElement("button");
  btnCerrar.textContent = "✕";
  btnCerrar.style.cssText =
    "position:absolute;top:16px;right:16px;background:none;border:none;color:#64748B;font-size:1.2rem;cursor:pointer;line-height:1";
  btnCerrar.onclick = function () {
    modal.style.display = "none";
  };
  caja.appendChild(btnCerrar);
  var contenido = document.createElement("div");
  contenido.innerHTML = contenidoHTML;
  caja.appendChild(contenido);
  modal.innerHTML = "";
  modal.appendChild(caja);
  var dummy = "<div>";
  // contenido ya añadido
  modal.style.display = "flex";
}

// ================================================================
// scripts_Admin.js — NexoShop Panel Admin
// Conectado a Spring Boot + MongoDB (base: Datos)
// ================================================================

// ----------------------------------------------------------------
// DATOS EN MEMORIA
// ----------------------------------------------------------------
let DB = {
  usuarios: [],
  empresas: [],
  productos: [],
  pedidos: [],
};

// ----------------------------------------------------------------
// CARGA INICIAL DESDE LA API REST
// ----------------------------------------------------------------
async function cargarTodosLosDatos() {
  try {
    const [usuarios, empresas, productos, pedidos] = await Promise.all([
      fetch("/api/admin/usuarios?rol=COMPRADOR").then((r) => r.json()),
      fetch("/api/admin/empresas").then((r) => r.json()),
      fetch("/api/admin/productos").then((r) => r.json()),
      fetch("/api/admin/pedidos").then((r) => r.json()),
    ]);

    DB.usuarios = usuarios;
    DB.empresas = empresas;
    DB.productos = productos;
    DB.pedidos = pedidos;

    inicializarEstadoEmpresas();
    actualizarDashboard();
    actualizarBadgesSidebar();

    renderizarTablaUsuarios(filtrarUsuarios());
    renderizarTablaEmpresas(filtrarEmpresas());
    renderizarTablaProductos(filtrarProductos());
    renderizarTablaPedidos(filtrarPedidos());

    console.log(
      "✅ API cargada — Usuarios:",
      usuarios.length,
      "| Empresas:",
      empresas.length,
      "| Productos:",
      productos.length,
      "| Pedidos:",
      pedidos.length,
    );
  } catch (err) {
    console.error("❌ Error al cargar datos desde la API:", err);
    mostrarNotificacion("⚠ No se pudo conectar con el servidor.");
  }
}

// ----------------------------------------------------------------
// NAVEGACION DEL SIDEBAR
// ----------------------------------------------------------------
const enlacesSidebar = document.querySelectorAll(".sidebar-enlace");
const seccionesPanel = document.querySelectorAll(".seccion-panel");
const tituloSeccion = document.getElementById("titulo-seccion-actual");
const subtituloSeccion = document.getElementById("subtitulo-seccion-actual");

const infoSecciones = {
  dashboard: {
    titulo: "Dashboard",
    subtitulo: "Resumen general del marketplace",
  },
  empresas: {
    titulo: "Empresas",
    subtitulo: "Aprueba, rechaza y gestiona las empresas vendedoras",
  },
  usuarios: {
    titulo: "Usuarios",
    subtitulo: "Administra compradores y vendedores",
  },
  productos: {
    titulo: "Productos",
    subtitulo: "Todos los productos publicados en el marketplace",
  },
  pedidos: {
    titulo: "Pedidos",
    subtitulo: "Todos los pedidos del marketplace",
  },
  reportes: {
    titulo: "Reportes",
    subtitulo: "Estadísticas y métricas del marketplace",
  },
  configuracion: {
    titulo: "Configuración",
    subtitulo: "Ajustes generales de NexoShop",
  },
};

const renderPorSeccion = {
  usuarios: () => renderizarTablaUsuarios(filtrarUsuarios()),
  empresas: () => renderizarTablaEmpresas(filtrarEmpresas()),
  productos: () => renderizarTablaProductos(filtrarProductos()),
  pedidos: () => renderizarTablaPedidos(filtrarPedidos()),
  reportes: () => cargarReportesAdmin(),
};

enlacesSidebar.forEach(function (enlace) {
  enlace.addEventListener("click", function (e) {
    e.preventDefault();
    cambiarSeccion(this.dataset.seccion);
  });
});

function cambiarSeccion(seccionId) {
  enlacesSidebar.forEach((e) => e.classList.remove("activo"));
  const enlaceActivo = document.querySelector(
    `.sidebar-enlace[data-seccion="${seccionId}"]`,
  );
  if (enlaceActivo) enlaceActivo.classList.add("activo");

  seccionesPanel.forEach((s) => s.classList.remove("activa"));
  const seccionActiva = document.getElementById("seccion-" + seccionId);
  if (seccionActiva) seccionActiva.classList.add("activa");

  if (infoSecciones[seccionId]) {
    if (tituloSeccion)
      tituloSeccion.textContent = infoSecciones[seccionId].titulo;
    if (subtituloSeccion)
      subtituloSeccion.textContent = infoSecciones[seccionId].subtitulo;
  }

  if (renderPorSeccion[seccionId]) renderPorSeccion[seccionId]();
}

document
  .querySelectorAll(".panel-card-enlace[data-ir-a]")
  .forEach(function (enlace) {
    enlace.addEventListener("click", function (e) {
      e.preventDefault();
      cambiarSeccion(this.dataset.irA);
    });
  });

// ================================================================
//  SECCIÓN: USUARIOS
// ================================================================

function filtrarUsuarios() {
  const rol = document.getElementById("filtro-rol-usuarios")?.value || "todos";
  const termino = (document.getElementById("buscar-usuario")?.value || "")
    .toLowerCase()
    .trim();

  return DB.usuarios.filter((u) => {
    const coincideRol =
      rol === "todos" || (u.rol || "").toUpperCase() === rol.toUpperCase();
    const coincideBusqueda =
      !termino ||
      (u.nombre || "").toLowerCase().includes(termino) ||
      (u.correo || u.email || "").toLowerCase().includes(termino) ||
      (u.telefono || "").toLowerCase().includes(termino);
    return coincideRol && coincideBusqueda;
  });
}

function renderizarTablaUsuarios(usuarios) {
  const tbody = document.querySelector("#seccion-usuarios .tabla-admin tbody");
  if (!tbody) return;

  if (!usuarios || !usuarios.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748B">
      No hay usuarios que coincidan con el filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  usuarios.forEach(function (u) {
    const iniciales = obtenerIniciales(u.nombre);
    const colorAvatar = generarColor(u.nombre);

    const rolBadge =
      (u.rol || "").toUpperCase() === "VENDEDOR"
        ? `<span class="badge-rol badge-vendedor">Vendedor</span>`
        : `<span class="badge-rol badge-comprador">Comprador</span>`;

    const estaActivo =
      u.activo === true || u.activo === "true" || u.activo === 1;
    const estadoBadge = estaActivo
      ? `<span class="badge-estado badge-entregado">Activo</span>`
      : `<span class="badge-estado badge-cancelado">Suspendido</span>`;

    const botonAccion = estaActivo
      ? `<button class="boton-accion-tabla boton-suspender-tabla"
             title="Suspender" data-id="${u._id}" data-accion="suspender">&#9646;&#9646;</button>`
      : `<button class="boton-accion-tabla boton-activar-tabla"
             title="Reactivar" data-id="${u._id}" data-accion="activar">&#9654;</button>`;

    const fecha = u.fechaRegistro
      ? (() => {
          try {
            const d = new Date(u.fechaRegistro.replace(" ", "T"));
            return isNaN(d) ? u.fechaRegistro : d.toLocaleDateString("es-CO");
          } catch (ex) {
            return u.fechaRegistro;
          }
        })()
      : "—";

    const fila = document.createElement("tr");
    fila.style.height = "56px";
    fila.dataset.id = u._id;
    fila.innerHTML = `
      <td>
        <div class="celda-usuario">
          <div class="usuario-tabla-avatar" style="background:${colorAvatar}">${iniciales}</div>
          <span>${u.nombre || "—"}</span>
        </div>
      </td>
      <td class="celda-gris">${u.correo || u.email || "—"}</td>
      <td>${rolBadge}</td>
      <td class="celda-gris">${u.telefono || "—"}</td>
      <td class="celda-gris">${fecha}</td>
      <td>${estadoBadge}</td>
      <td>
        <div class="acciones-tabla">
          <button class="boton-accion-tabla boton-ver-tabla" title="Ver perfil" data-id="${u._id}">&#128065;</button>
          ${botonAccion}
        </div>
      </td>`;

    tbody.appendChild(fila);
  });

  registrarEventosTablaUsuarios(tbody);
}

function registrarEventosTablaUsuarios(tbody) {
  tbody.querySelectorAll("[data-accion]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const id = this.dataset.id;
      const accion = this.dataset.accion;
      const suspender = accion === "suspender";
      abrirModal(
        suspender ? "¿Suspender usuario?" : "¿Reactivar usuario?",
        suspender
          ? "El usuario no podrá acceder a la plataforma."
          : "El usuario podrá volver a acceder.",
        !suspender,
        () => cambiarEstadoUsuario(id, accion),
      );
    });
  });

  tbody.querySelectorAll(".boton-ver-tabla").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const usuario = DB.usuarios.find(
        (u) => String(u._id) === String(this.dataset.id),
      );
      if (usuario) mostrarDetalleUsuario(usuario);
    });
  });
}

async function cambiarEstadoUsuario(id, accion) {
  const usuario = DB.usuarios.find((u) => String(u._id) === String(id));
  if (!usuario) return;

  try {
    const endpoint =
      accion === "activar"
        ? `/api/admin/usuarios/${id}/activar`
        : `/api/admin/usuarios/${id}/suspender`;

    const res = await fetch(endpoint, { method: "PUT" });

    if (!res.ok) {
      console.error("❌ Error usuario:", res.status, await res.text());
      mostrarNotificacion(
        "⚠ No se pudo guardar el cambio en la base de datos.",
      );
      return;
    }

    usuario.activo = accion === "activar";
    mostrarNotificacion(
      accion === "suspender" ? "Usuario suspendido." : "Usuario reactivado.",
    );
    renderizarTablaUsuarios(filtrarUsuarios());
    actualizarDashboard();
  } catch (e) {
    console.error("❌ Excepción usuario:", e);
    mostrarNotificacion("⚠ Error de conexión con el servidor.");
  }
}

function mostrarDetalleUsuario(u) {
  const fecha = u.fechaRegistro
    ? new Date(u.fechaRegistro).toLocaleDateString("es-CO")
    : "—";
  const iniciales = (u.nombre || "U")
    .split(" ")
    .map((p) => p[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const estadoColor = u.activo ? "#2d6e2d" : "#e05252";
  const estadoTxt = u.activo ? "Activo" : "Suspendido";
  abrirModalAdmin(`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      <div style="width:56px;height:56px;border-radius:50%;background:#F97316;display:flex;align-items:center;justify-content:center;font-family:var(--fuente-titulos);font-size:1.2rem;color:white;flex-shrink:0">${iniciales}</div>
      <div>
        <h3 style="font-family:var(--fuente-titulos);font-size:1.5rem;color:#0F172A;margin:0">${u.nombre || "—"}</h3>
        <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;color:${estadoColor}">● ${estadoTxt}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${filaModal("📧 Correo", u.correo || u.email || "—")}
      ${filaModal("📱 Teléfono", u.telefono || "—")}
      ${filaModal("👤 Rol", u.rol || "—")}
      ${filaModal("📅 Registro", fecha)}
      ${filaModal("🏠 Dirección", u.direccion || "—")}
    </div>
  `);
}

document
  .getElementById("filtro-rol-usuarios")
  ?.addEventListener("change", () =>
    renderizarTablaUsuarios(filtrarUsuarios()),
  );
document
  .getElementById("buscar-usuario")
  ?.addEventListener("input", () => renderizarTablaUsuarios(filtrarUsuarios()));

// ================================================================
//  SECCIÓN: EMPRESAS
// ================================================================

function inicializarEstadoEmpresas() {
  DB.empresas.forEach((e) => {
    if (!e.estado) e.estado = "PENDIENTE";
    else e.estado = e.estado.toUpperCase();
  });
}

function filtrarEmpresas() {
  const estado = (
    document.getElementById("filtro-estado-empresas")?.value || "todas"
  ).toLowerCase();
  const termino = (document.getElementById("buscar-empresa")?.value || "")
    .toLowerCase()
    .trim();

  return DB.empresas.filter((e) => {
    const estadoEmp = (e.estado || "pendiente").toLowerCase();
    const coincideEstado = estado === "todas" || estadoEmp === estado;

    const nombreEmp = (e.nombreEmpresa || e.nombre || "").toLowerCase();
    const encargado = (e.nombreEncargado || "").toLowerCase();
    const nit = (e.nit || "").toLowerCase();
    const ciudad = (e.ciudad || "").toLowerCase();

    const coincideBusqueda =
      !termino ||
      nombreEmp.includes(termino) ||
      encargado.includes(termino) ||
      nit.includes(termino) ||
      ciudad.includes(termino);

    return coincideEstado && coincideBusqueda;
  });
}

function renderizarTablaEmpresas(empresas) {
  const tbody =
    document.getElementById("tabla-cuerpo-empresas") ||
    document.querySelector("#seccion-empresas .tabla-admin tbody");
  if (!tbody) return;

  if (!empresas || !empresas.length) {
    tbody.innerHTML = `<tr>
      <td colspan="8" style="text-align:center;padding:32px;color:#64748B;font-family:Nunito,sans-serif">
        No hay empresas que coincidan con el filtro.
      </td>
    </tr>`;
    actualizarBadgeEmpresas();
    return;
  }

  tbody.innerHTML = "";

  empresas.forEach(function (e) {
    const nombreEmp = e.nombreEmpresa || e.nombre || "—";
    const iniciales = obtenerIniciales(nombreEmp);
    const colorAvatar = generarColor(nombreEmp);
    const estado = (e.estado || "PENDIENTE").toUpperCase();

    // ── Fecha ──────────────────────────────────────────────
    const fecha = e.fechaRegistro
      ? (() => {
          try {
            const raw = String(e.fechaRegistro).replace(" ", "T");
            const d = new Date(raw);
            return isNaN(d) ? e.fechaRegistro : d.toLocaleDateString("es-CO");
          } catch (ex) {
            return e.fechaRegistro;
          }
        })()
      : "—";

    // ── Ciudad ─────────────────────────────────────────────
    const ciudad = e.ciudad
      ? e.ciudad
      : e.direccion
        ? e.direccion.includes(",")
          ? e.direccion.split(",").pop().trim()
          : e.direccion
        : "—";

    // ── Badge de estado ────────────────────────────────────
    const clasesBadge = {
      APROBADA: "badge-aprobado",
      RECHAZADA: "badge-rechazado",
      PENDIENTE: "badge-pendiente",
    };
    const textosBadge = {
      APROBADA: "Aprobada",
      RECHAZADA: "Rechazada",
      PENDIENTE: "Pendiente",
    };
    const claseBadge = clasesBadge[estado] || "badge-pendiente";
    const textoBadge = textosBadge[estado] || estado;

    // ── Número de productos ────────────────────────────────
    const numProductos = DB.productos.filter(
      (p) => (p.empresaNombre || p.empresa || "") === nombreEmp,
    ).length;

    // ── Encargado ──────────────────────────────────────────
    const encargado = e.nombreEncargado || "—";

    // ── Fila ───────────────────────────────────────────────
    const fila = document.createElement("tr");
    fila.dataset.id = String(e._id);
    fila.innerHTML = `
      <td>
        <div class="celda-usuario">
          <div class="usuario-tabla-avatar" style="background:${colorAvatar}">${iniciales}</div>
          <div>
            <p style="margin:0;font-weight:600">${nombreEmp}</p>
            <p style="margin:0;font-size:0.75rem;color:#64748B">${e.correo || ""}</p>
          </div>
        </div>
      </td>
      <td class="celda-gris">${e.nit || "—"}</td>
      <td class="celda-gris">${ciudad}</td>
      <td class="celda-gris">${encargado}</td>
      <td class="celda-gris" style="text-align:center">${numProductos}</td>
      <td class="celda-gris">${fecha}</td>
      <td><span class="badge-estado ${claseBadge}">${textoBadge}</span></td>
      <td>
        <div class="acciones-tabla">
          <select class="selector-estado-empresa" data-id="${e._id}" data-estado-actual="${estado}">
            <option value="PENDIENTE"  ${estado === "PENDIENTE" ? "selected" : ""}>Pendiente</option>
            <option value="APROBADA"   ${estado === "APROBADA" ? "selected" : ""}>Aprobada</option>
            <option value="RECHAZADA"  ${estado === "RECHAZADA" ? "selected" : ""}>Rechazada</option>
          </select>
        </div>
      </td>`;

    tbody.appendChild(fila);
  });

  registrarEventosTablaEmpresas(tbody);
  actualizarBadgeEmpresas();
}

function registrarEventosTablaEmpresas(tbody) {
  tbody.querySelectorAll(".selector-estado-empresa").forEach(function (sel) {
    sel.addEventListener("change", function () {
      const id = this.dataset.id;
      const nuevoEstado = this.value;
      const estadoActual = this.dataset.estadoActual;

      if (nuevoEstado === estadoActual) return;

      const mensajes = {
        APROBADA: "La empresa podrá publicar productos en el marketplace.",
        RECHAZADA: "La empresa no podrá publicar ni vender productos.",
        PENDIENTE: "La empresa volverá a estado pendiente de revisión.",
      };

      const selectRef = this;

      abrirModal(
        `¿Cambiar estado a "${textoEstadoEmpresa(nuevoEstado)}"?`,
        mensajes[nuevoEstado] || "¿Confirmas el cambio de estado?",
        nuevoEstado === "APROBADA",
        () => cambiarEstadoEmpresa(id, nuevoEstado),
        () => {
          selectRef.value = estadoActual;
        }, // revertir si cancela
      );
    });
  });
}

function textoEstadoEmpresa(estado) {
  return (
    { APROBADA: "Aprobada", RECHAZADA: "Rechazada", PENDIENTE: "Pendiente" }[
      estado
    ] || estado
  );
}

async function cambiarEstadoEmpresa(id, nuevoEstado) {
  const empresa = DB.empresas.find((e) => String(e._id) === String(id));
  if (!empresa) {
    mostrarNotificacion("⚠ No se encontró la empresa.");
    return;
  }

  try {
    const res = await fetch(`/api/admin/empresas/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (!res.ok) {
      console.error("❌ Error empresa:", res.status, await res.text());
      mostrarNotificacion(
        "⚠ No se pudo guardar el cambio en la base de datos.",
      );
      renderizarTablaEmpresas(filtrarEmpresas()); // revertir visual
      return;
    }

    // Actualizar en memoria y re-renderizar
    empresa.estado = nuevoEstado;
    empresa.activo = nuevoEstado === "APROBADA";

    const mensajesExito = {
      APROBADA: "Empresa aprobada correctamente.",
      RECHAZADA: "Empresa rechazada.",
      PENDIENTE: "Empresa marcada como pendiente.",
    };
    mostrarNotificacion(mensajesExito[nuevoEstado] || "Estado actualizado.");

    renderizarTablaEmpresas(filtrarEmpresas());
    actualizarBadgeEmpresas();
    actualizarDashboard();
  } catch (err) {
    console.error("❌ Excepción empresa:", err);
    mostrarNotificacion("⚠ Error de conexión con el servidor.");
    renderizarTablaEmpresas(filtrarEmpresas());
  }
}

function actualizarBadgeEmpresas() {
  const pendientes = DB.empresas.filter(
    (e) => (e.estado || "PENDIENTE").toUpperCase() === "PENDIENTE",
  ).length;

  // Badge del sidebar
  const badge = document.querySelector(
    '.sidebar-enlace[data-seccion="empresas"] .sidebar-badge',
  );
  if (badge) badge.textContent = pendientes || "";

  // Badge en el dashboard
  const badgeDash = document.querySelector(".badge-pendientes");
  if (badgeDash)
    badgeDash.textContent = `${pendientes} pendiente${pendientes !== 1 ? "s" : ""}`;
}

document
  .getElementById("filtro-estado-empresas")
  ?.addEventListener("change", () =>
    renderizarTablaEmpresas(filtrarEmpresas()),
  );
document
  .getElementById("buscar-empresa")
  ?.addEventListener("input", () => renderizarTablaEmpresas(filtrarEmpresas()));

// ================================================================
//  SECCIÓN: PRODUCTOS
// ================================================================

function filtrarProductos() {
  const termino = (document.getElementById("buscar-producto")?.value || "")
    .toLowerCase()
    .trim();

  return DB.productos.filter((p) => {
    const empresa = (p.empresaNombre || p.empresa || "").toLowerCase();
    return (
      !termino ||
      (p.nombre || "").toLowerCase().includes(termino) ||
      empresa.includes(termino) ||
      (p.categoria || "").toLowerCase().includes(termino)
    );
  });
}

function renderizarTablaProductos(productos) {
  const tbody = document.querySelector("#seccion-productos .tabla-admin tbody");
  if (!tbody) return;

  if (!productos || !productos.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748B">
      No hay productos que coincidan con el filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  productos.forEach(function (p) {
    const empresaNombre = p.empresaNombre || p.empresa || "—";
    const colorAvatar = generarColor(empresaNombre);
    const iniciales = obtenerIniciales(empresaNombre);
    const precio = p.precioCOP
      ? "$" + Number(p.precioCOP).toLocaleString("es-CO")
      : "—";

    const esActivo =
      p.activo === true || (p.estado || "").toUpperCase() === "ACTIVO";
    const estadoBadge = esActivo
      ? `<span class="badge-estado badge-entregado">Activo</span>`
      : `<span class="badge-estado badge-cancelado">Inactivo</span>`;

    const botonEstado = esActivo
      ? `<button class="boton-accion-tabla boton-suspender-tabla boton-estado-producto"
             title="Suspender" data-id="${p._id}" data-accion="SUSPENDIDO">&#9646;&#9646;</button>`
      : `<button class="boton-accion-tabla boton-activar-tabla boton-estado-producto"
             title="Activar" data-id="${p._id}" data-accion="ACTIVO">&#9654;</button>`;

    const fila = document.createElement("tr");
    fila.style.height = "56px";
    fila.dataset.id = p._id;
    fila.innerHTML = `
      <td>
        <div class="celda-usuario">
          <div class="usuario-tabla-avatar" style="background:${colorAvatar}">${iniciales}</div>
          <div>
            <p style="font-weight:600;margin:0">${p.nombre || "—"}</p>
            <p style="font-size:0.78rem;color:#64748B;margin:0">${p.categoria || ""}</p>
          </div>
        </div>
      </td>
      <td class="celda-gris">${empresaNombre}</td>
      <td class="celda-gris">${precio}</td>
      <td class="celda-gris">${p.stock ?? "—"}</td>
      <td class="celda-gris">—</td>
      <td>${estadoBadge}</td>
      <td>
        <div class="acciones-tabla">
          <button class="boton-accion-tabla boton-ver-tabla" title="Ver" data-id="${p._id}">&#128065;</button>
          ${botonEstado}
        </div>
      </td>`;

    tbody.appendChild(fila);
  });

  registrarEventosTablaProductos(tbody);
}

function registrarEventosTablaProductos(tbody) {
  tbody.querySelectorAll(".boton-estado-producto").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const id = this.dataset.id;
      const accion = this.dataset.accion;
      const activar = accion === "ACTIVO";

      abrirModal(
        activar ? "¿Activar producto?" : "¿Suspender producto?",
        activar
          ? "El producto será visible en el marketplace."
          : "El producto quedará oculto del marketplace.",
        activar,
        () => cambiarEstadoProducto(id, accion),
      );
    });
  });

  tbody.querySelectorAll(".boton-ver-tabla").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const p = DB.productos.find(
        (x) => String(x._id) === String(this.dataset.id),
      );
      if (!p) return;
      abrirModalAdmin(`
        <h3 style="font-family:var(--fuente-titulos);font-size:1.5rem;color:#0F172A;margin-bottom:20px">👟 ${p.nombre || "—"}</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${filaModal("🏢 Empresa", p.empresaNombre || p.empresa || p.vendedorNombre || "—")}
          ${filaModal("🏷 Marca", p.marca || "—")}
          ${filaModal("📂 Categoría", p.categoria || "—")}
          ${filaModal("💰 Precio", "$" + Number(p.precio || p.precioCOP || 0).toLocaleString("es-CO"))}
          ${filaModal("📦 Stock", p.stock ?? 0)}
          ${filaModal("⚡ Estado", p.estado || "—")}
        </div>
      `);
    });
  });
}

async function cambiarEstadoProducto(id, nuevoEstado) {
  const producto = DB.productos.find((p) => String(p._id) === String(id));
  if (!producto) return;

  try {
    const res = await fetch(`/api/admin/productos/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (!res.ok) {
      console.error("❌ Error producto:", res.status, await res.text());
      mostrarNotificacion("⚠ No se pudo guardar el cambio.");
      return;
    }

    producto.estado = nuevoEstado;
    producto.activo = nuevoEstado === "ACTIVO";
    producto.publicado = nuevoEstado === "ACTIVO";

    mostrarNotificacion(
      nuevoEstado === "ACTIVO" ? "Producto activado." : "Producto suspendido.",
    );
    renderizarTablaProductos(filtrarProductos());
    actualizarDashboard();
  } catch (e) {
    console.error("❌ Excepción producto:", e);
    mostrarNotificacion("⚠ Error de conexión con el servidor.");
  }
}

document
  .getElementById("buscar-producto")
  ?.addEventListener("input", () =>
    renderizarTablaProductos(filtrarProductos()),
  );

// ================================================================
//  SECCIÓN: PEDIDOS
// ================================================================

function filtrarPedidos() {
  const estado =
    document.getElementById("filtro-estado-pedidos")?.value || "todos";
  const termino = (document.getElementById("buscar-pedido")?.value || "")
    .toLowerCase()
    .trim();

  const norm = (s) => {
    const u = (s || "").toUpperCase();
    return u === "EN_PROCESO" || u === "PROCESANDO"
      ? "procesando"
      : u.toLowerCase();
  };

  return DB.pedidos.filter((p) => {
    const coincideEstado =
      estado === "todos" || norm(p.estado) === norm(estado);
    const coincideBusqueda =
      !termino ||
      (p.nombreUsuario || "").toLowerCase().includes(termino) ||
      (p.estado || "").toLowerCase().includes(termino) ||
      String(p._id).toLowerCase().includes(termino);
    return coincideEstado && coincideBusqueda;
  });
}

function renderizarTablaPedidos(pedidos) {
  const tbody = document.querySelector("#seccion-pedidos .tabla-admin tbody");
  if (!tbody) return;

  if (!pedidos || !pedidos.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748B">
      No hay pedidos que coincidan con el filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  pedidos.forEach(function (p) {
    const colorAvatar = generarColor(p.nombreUsuario || "");
    const iniciales = obtenerIniciales(p.nombreUsuario || "");
    const fecha = p.fechaPedido
      ? new Date(p.fechaPedido).toLocaleDateString("es-CO")
      : "—";
    const total = p.items
      ? "$" +
        p.items
          .reduce((acc, i) => acc + (i.subtotal || 0), 0)
          .toLocaleString("es-CO")
      : "—";
    const numProductos = p.items ? p.items.length : 0;

    const mapClase = {
      ENTREGADO: "badge-entregado",
      ENVIADO: "badge-enviado",
      EN_PROCESO: "badge-proceso",
      PROCESANDO: "badge-proceso",
      PENDIENTE: "badge-pendiente",
      CANCELADO: "badge-cancelado",
    };
    const mapTexto = {
      ENTREGADO: "Entregado",
      ENVIADO: "Enviado",
      EN_PROCESO: "En proceso",
      PROCESANDO: "En proceso",
      PENDIENTE: "Pendiente",
      CANCELADO: "Cancelado",
    };

    const claseEstado =
      mapClase[(p.estado || "").toUpperCase()] || "badge-pendiente";
    const textoEstado = mapTexto[(p.estado || "").toUpperCase()] || p.estado;

    const fila = document.createElement("tr");
    fila.style.height = "56px";
    fila.dataset.id = p._id;
    fila.innerHTML = `
      <td class="celda-gris">#${p._id}</td>
      <td>
        <div class="celda-usuario">
          <div class="usuario-tabla-avatar" style="background:${colorAvatar}">${iniciales}</div>
          <span>${p.nombreUsuario || "—"}</span>
        </div>
      </td>
      <td class="celda-gris">—</td>
      <td class="celda-gris">${numProductos} producto${numProductos !== 1 ? "s" : ""}</td>
      <td class="celda-gris">${total}</td>
      <td class="celda-gris">${fecha}</td>
      <td><span class="badge-estado ${claseEstado}">${textoEstado}</span></td>
      <td>
        <button class="boton-accion-tabla boton-ver-tabla" title="Ver detalle" data-id="${p._id}">&#128065;</button>
      </td>`;

    tbody.appendChild(fila);
  });

  tbody.querySelectorAll(".boton-ver-tabla").forEach((boton) => {
    boton.addEventListener("click", function () {
      const pedido = DB.pedidos.find(
        (p) => String(p._id) === String(this.dataset.id),
      );
      if (!pedido) return;
      const dir = pedido.direccionEntrega || {};
      const items = pedido.items || [];
      const total =
        pedido.total || items.reduce((s, i) => s + (i.subtotal || 0), 0);
      const fecha = pedido.fechaPedido
        ? new Date(pedido.fechaPedido).toLocaleDateString("es-CO")
        : "—";
      abrirModalAdmin(`
        <h3 style="font-family:var(--fuente-titulos);font-size:1.5rem;color:#0F172A;margin-bottom:20px">
          📦 Pedido <span style="color:#F97316">#${String(pedido._id || "")
            .slice(-6)
            .toUpperCase()}</span>
        </h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          ${filaModal("👤 Comprador", pedido.nombreUsuario || "—")}
          ${filaModal("📧 Correo", pedido.correoUsuario || "—")}
          ${filaModal("📍 Dirección", dir.linea || "—")}
          ${filaModal("🏙 Ciudad", dir.ciudad || "—")}
          ${filaModal("📞 Teléfono", dir.telefono || "—")}
          ${filaModal("💳 Pago", pedido.metodoPago || "—")}
          ${filaModal("📅 Fecha", fecha)}
          ${filaModal("⚡ Estado", pedido.estado || "—")}
        </div>
        <p style="font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:#64748B;margin-bottom:10px">PRODUCTOS</p>
        ${items
          .map(
            (
              i,
            ) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E2E8F0">
          <span style="font-size:0.82rem;color:#0F172A">${i.nombre || "—"} · Talla ${i.talla || "—"} · x${i.cantidad || 1}</span>
          <span style="font-weight:700;color:#0F172A">$${Number(i.subtotal || 0).toLocaleString("es-CO")}</span>
        </div>`,
          )
          .join("")}
        <div style="display:flex;justify-content:space-between;padding-top:14px;margin-top:8px;border-top:1px solid #E2E8F0">
          <span style="font-weight:700;color:#0F172A">TOTAL</span>
          <span style="font-family:var(--fuente-titulos);font-size:1.5rem;color:#0F172A">$${Number(total).toLocaleString("es-CO")}</span>
        </div>
      `);
    });
  });
}

document
  .getElementById("filtro-estado-pedidos")
  ?.addEventListener("change", () => renderizarTablaPedidos(filtrarPedidos()));
document
  .getElementById("buscar-pedido")
  ?.addEventListener("input", () => renderizarTablaPedidos(filtrarPedidos()));

// ================================================================
//  DASHBOARD
// ================================================================

function actualizarDashboard() {
  const set = (sel, val) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = val;
  };
  set(
    '[data-metric="total-usuarios"]',
    DB.usuarios.length.toLocaleString("es-CO"),
  );
  set(
    '[data-metric="total-empresas"]',
    DB.empresas.length.toLocaleString("es-CO"),
  );
  set(
    '[data-metric="total-productos"]',
    DB.productos.length.toLocaleString("es-CO"),
  );
  set(
    '[data-metric="total-pedidos"]',
    DB.pedidos.length.toLocaleString("es-CO"),
  );
}

function actualizarBadgesSidebar() {
  inicializarEstadoEmpresas();
  actualizarBadgeEmpresas();

  const badgePedidos = document.querySelector('[data-badge="pedidos"]');
  if (badgePedidos) {
    badgePedidos.textContent = DB.pedidos.filter(
      (p) => (p.estado || "").toUpperCase() === "PENDIENTE",
    ).length;
  }
}

// ================================================================
//  MODAL DE CONFIRMACIÓN
// ================================================================
const modal = document.getElementById("modal-confirmacion");
const modalTitulo = document.getElementById("modal-titulo");
const modalMensaje = document.getElementById("modal-mensaje");
const modalBotonConfirmar = document.getElementById("modal-boton-confirmar");
const modalBotonCancelar = document.getElementById("modal-boton-cancelar");
let accionPendiente = null;
let accionCancelacion = null;

function abrirModal(titulo, mensaje, esAprobacion, fnConfirmar, fnCancelar) {
  if (!modal) return;
  if (modalTitulo) modalTitulo.textContent = titulo;
  if (modalMensaje) modalMensaje.textContent = mensaje;
  accionPendiente = fnConfirmar;
  accionCancelacion = fnCancelar || null;

  if (modalBotonConfirmar) {
    modalBotonConfirmar.className = esAprobacion ? "confirmar-verde" : "";
    modalBotonConfirmar.textContent = "Sí, confirmar";
  }
  modal.style.display = "flex";
}

function cerrarModal(ejecutarCancelacion) {
  if (modal) modal.style.display = "none";
  if (ejecutarCancelacion && accionCancelacion) accionCancelacion();
  accionPendiente = null;
  accionCancelacion = null;
}

modalBotonCancelar?.addEventListener("click", () => cerrarModal(true));
modal?.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal(true);
});
modalBotonConfirmar?.addEventListener("click", function () {
  if (accionPendiente) accionPendiente();
  cerrarModal(false);
});

// ================================================================
//  CERRAR SESIÓN
// ================================================================
document.getElementById("boton-cerrar-sesion-admin")
  ?.addEventListener("click", function () {
    var modal = document.getElementById("modal-cerrar-sesion-adm");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-cerrar-sesion-adm";
      modal.style.cssText =
        "position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px";
      modal.innerHTML =
        '<div style="background:#FFFFFF;border:1px solid #E2E8F0;padding:32px;max-width:360px;width:100%;border-radius:15px;text-align:center">' +
        '<p style="font-family:var(--fuente-titulos);font-size:1.3rem;letter-spacing:0.04em;color:#0F172A;margin-bottom:24px">¿CERRAR SESIÓN?</p>' +
        '<div style="display:flex;gap:12px;justify-content:center">' +
        '<button id="adm-si" style="padding:11px 28px;background:#19876E;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.1em;cursor:pointer">Confirmar</button>' +
        '<button id="adm-no" style="padding:11px 28px;background:none;border:1px solid #CBD5E1;color:#0F172A;font-family:var(--fuente-cuerpo);font-size:0.8rem;font-weight:700;letter-spacing:0.1em;cursor:pointer">Cancelar</button>' +
        "</div></div>";
      document.body.appendChild(modal);

      document.getElementById("adm-si").onclick = function () {
        // Avisar al backend pero NO esperar — siempre limpiar y redirigir
        const API = "https://api-eventhive.onrender.com"; // ← tu URL del backend
        fetch(API + "/api/auth/logout", { method: "POST" }).catch(() => {});
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      };

      document.getElementById("adm-no").onclick = function () {
        modal.style.display = "none";
      };
    }
    modal.style.display = "flex";
  });

// ================================================================
//  TOAST DE NOTIFICACIÓN
// ================================================================
function mostrarNotificacion(mensaje) {
  let toast = document.getElementById("toast-admin");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-admin";
    toast.style.cssText = `
      position:fixed;bottom:24px;right:24px;
      background:#FFFFFF;border:1px solid rgba(45,110,45,0.4);
      color:#4caf50;padding:14px 20px;font-size:0.82rem;
      font-weight:700;letter-spacing:0.04em;z-index:9999;
      transition:opacity 0.3s;max-width:320px;border-radius:2px;`;
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.opacity = "1";
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);
}

// ================================================================
//  NOTIFICACIONES (campana)
// ================================================================
document
  .getElementById("boton-notificaciones")
  ?.addEventListener("click", function () {
    mostrarNotificacion("🔔 Notificaciones — próximamente");
  });

// ================================================================
//  UTILIDADES
// ================================================================
function obtenerIniciales(nombre) {
  if (!nombre) return "?";
  const partes = nombre.trim().split(" ");
  return partes.length >= 2
    ? (partes[0][0] + partes[1][0]).toUpperCase()
    : partes[0].substring(0, 2).toUpperCase();
}

function generarColor(nombre) {
  const colores = [
    "#c8452d",
    "#1a3a6e",
    "#2d6e2d",
    "#7c5a3c",
    "#6b3a7d",
    "#b5820a",
  ];
  let hash = 0;
  for (let i = 0; i < (nombre || "").length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colores[Math.abs(hash) % colores.length];
}

// ================================================================
//  ESTILOS: selector de estado de empresa
// ================================================================
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .selector-estado-empresa {
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.15);
      color: #e0e0e0;
      padding: 6px 10px;
      border-radius: 4px;
      font-family: Nunito, sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s;
      min-width: 118px;
    }
    .selector-estado-empresa:hover  { border-color: rgba(255,255,255,0.3); }
    .selector-estado-empresa:focus  { border-color: #c8452d; }
    .selector-estado-empresa option[value="APROBADA"]  { color: #4caf50; }
    .selector-estado-empresa option[value="RECHAZADA"] { color: #c8452d; }
    .selector-estado-empresa option[value="PENDIENTE"] { color: #e8a838; }

    /* Badges de empresa (por si no están en el CSS externo) */
    .badge-aprobado  { background: rgba(45,110,45,0.2)  !important; color: #4caf50  !important; }
    .badge-rechazado { background: rgba(200,69,45,0.2)  !important; color: #c8452d  !important; }
    .badge-pendiente { background: rgba(232,168,56,0.2) !important; color: #e8a838  !important; }
  `;
  document.head.appendChild(style);
})();

// ================================================================
//  ARRANQUE
// ================================================================
cargarTodosLosDatos();

console.log("✅ scripts_Admin.js cargado — API REST + MongoDB");
// ================================================================
//  DASHBOARD — EMPRESAS PENDIENTES DINÁMICAS
//  Reemplaza las filas hardcodeadas por datos reales de la BD
// ================================================================

function renderizarEmpresasPendientesDashboard() {
  const lista = document.querySelector(".lista-empresas-pendientes");
  if (!lista) return;

  const pendientes = DB.empresas.filter(
    (e) => (e.estado || "PENDIENTE").toUpperCase() === "PENDIENTE",
  );

  if (pendientes.length === 0) {
    lista.innerHTML = `<p style="text-align:center;padding:24px;color:#64748B;font-family:Nunito,sans-serif">
      ✓ No hay empresas pendientes de aprobación.</p>`;
    return;
  }

  lista.innerHTML = pendientes
    .map((e) => {
      const nombre = e.nombreEmpresa || e.nombre || "—";
      const iniciales = obtenerIniciales(nombre);
      const color = generarColor(nombre);
      const ciudad = e.ciudad || "—";
      const nit = e.nit || "—";
      const fecha = e.fechaRegistro
        ? (() => {
            try {
              const d = new Date(e.fechaRegistro);
              return isNaN(d) ? e.fechaRegistro : d.toLocaleDateString("es-CO");
            } catch {
              return e.fechaRegistro;
            }
          })()
        : "—";

      return `
      <div class="fila-empresa-pendiente" data-id="${e._id}">
        <div class="empresa-pendiente-logo" style="background:${color}">${iniciales}</div>
        <div class="empresa-pendiente-info">
          <p class="empresa-pendiente-nombre">${nombre}</p>
          <p class="empresa-pendiente-detalle">NIT: ${nit} · ${ciudad} · ${fecha}</p>
        </div>
        <div class="empresa-pendiente-acciones">
          <button class="boton-aprobar"  data-id="${e._id}">✓ Aprobar</button>
          <button class="boton-rechazar" data-id="${e._id}">✕ Rechazar</button>
        </div>
      </div>`;
    })
    .join("");

  // Registrar eventos de aprobar/rechazar desde el dashboard
  lista.querySelectorAll(".boton-aprobar").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.dataset.id;
      abrirModal(
        "¿Aprobar empresa?",
        "La empresa podrá publicar productos en el marketplace.",
        true,
        () => cambiarEstadoEmpresaYRefrescar(id, "APROBADA"),
      );
    });
  });

  lista.querySelectorAll(".boton-rechazar").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.dataset.id;
      abrirModal(
        "¿Rechazar empresa?",
        "La empresa no podrá publicar ni vender productos.",
        false,
        () => cambiarEstadoEmpresaYRefrescar(id, "RECHAZADA"),
      );
    });
  });
}

async function cambiarEstadoEmpresaYRefrescar(id, nuevoEstado) {
  try {
    const res = await fetch(`/api/admin/empresas/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (!res.ok) {
      mostrarNotificacion("⚠ Error al guardar el cambio.");
      return;
    }

    // Actualizar en memoria
    const empresa = DB.empresas.find((e) => String(e._id) === String(id));
    if (empresa) {
      empresa.estado = nuevoEstado;
      empresa.activo = nuevoEstado === "APROBADA";
    }

    const msg =
      nuevoEstado === "APROBADA"
        ? "✅ Empresa aprobada. El vendedor ya puede ingresar."
        : "❌ Empresa rechazada.";
    mostrarNotificacion(msg);

    // Refrescar todo
    inicializarEstadoEmpresas();
    actualizarDashboard();
    actualizarBadgesSidebar();
    renderizarEmpresasPendientesDashboard();
    renderizarTablaEmpresas(filtrarEmpresas());
  } catch (err) {
    console.error("Error:", err);
    mostrarNotificacion("⚠ Error de conexión.");
  }
}

// ── Sobrescribir actualizarDashboard para incluir empresas pendientes ──
const _actualizarDashboardOriginal = actualizarDashboard;
actualizarDashboard = function () {
  _actualizarDashboardOriginal();
  renderizarEmpresasPendientesDashboard();
};

console.log("✅ Módulo empresas-pendientes cargado");

// ================================================================
// REPORTES — Admin
// ================================================================
async function cargarReportesAdmin() {
  var tbody = document.getElementById("tabla-reportes-admin");
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748B">Cargando...</td></tr>';

  var filtro = document.getElementById("filtro-estado-reporte");
  var estado = filtro ? filtro.value : "";

  try {
    var url = "/api/reportes" + (estado ? "?estado=" + estado : "");
    var res = await fetch(url);
    var reportes = await res.json();

    if (!Array.isArray(reportes) || !reportes.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748B">No hay reportes todavía.</td></tr>';
      return;
    }

    var colores = {
      PENDIENTE: "#e8a838",
      RESUELTO: "#16a34a",
      REVISADO: "#2563eb",
    };

    tbody.innerHTML = reportes
      .map(function (r) {
        var estado = (r.estado || "PENDIENTE").toUpperCase();
        var color = colores[estado] || "#888";
        var fecha = r.fechaCreacion
          ? new Date(r.fechaCreacion).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—";

        return (
          "<tr>" +
          "<td>" +
          '<p style="font-weight:700;color:#0F172A;margin-bottom:3px">' +
          (r.asunto || "—") +
          "</p>" +
          '<p style="font-size:0.78rem;color:#64748B;line-height:1.5">' +
          (r.descripcion || "").substring(0, 80) +
          (r.descripcion && r.descripcion.length > 80 ? "..." : "") +
          "</p>" +
          (r.respuestaAdmin
            ? '<div style="margin-top:8px;background:rgba(22,163,74,0.08);border-left:2px solid #16a34a;padding:6px 10px">' +
              '<p style="font-size:0.68rem;color:#16a34a;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px">✓ Respuesta enviada</p>' +
              '<p style="font-size:0.78rem;color:#d4cfc8">' +
              r.respuestaAdmin +
              "</p>" +
              "</div>"
            : "") +
          "</td>" +
          '<td><p style="font-size:0.84rem;color:#0F172A">' +
          (r.usuarioNombre || "—") +
          "</p>" +
          '<p style="font-size:0.72rem;color:#64748B">' +
          (r.usuarioRol || "") +
          "</p></td>" +
          '<td><span style="font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748B">' +
          (r.tipo || "OTRO") +
          "</span></td>" +
          '<td style="font-size:0.82rem;color:#64748B">' +
          fecha +
          "</td>" +
          '<td><span style="font-size:0.65rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:' +
          color +
          ";border:1px solid " +
          color +
          ';padding:3px 8px">' +
          estado +
          "</span></td>" +
          "<td>" +
          '<div style="display:flex;flex-direction:column;gap:6px">' +
          '<textarea id="resp-' +
          r.id +
          '" rows="2" placeholder="Escribe tu respuesta..." ' +
          'style="width:200px;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);padding:8px;outline:none;resize:none;font-size:0.78rem">' +
          (r.respuestaAdmin || "") +
          "</textarea>" +
          '<div style="display:flex;gap:6px">' +
          "<button onclick=\"responderReporte('" +
          r.id +
          "')\" " +
          'style="flex:1;padding:7px;background:#F97316;border:none;color:white;font-family:var(--fuente-cuerpo);font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer">' +
          (r.respuestaAdmin ? "Actualizar" : "Responder") +
          "</button>" +
          "<select id=\"sel-" + r.id + "\" onchange=\"cambiarEstadoReporte('" +
          r.id +
          "',this.value)\" " +
          'style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;color:#0F172A;font-family:var(--fuente-cuerpo);font-size:0.68rem;cursor:pointer;padding:4px">' +
          ["PENDIENTE", "REVISADO", "RESUELTO"]
            .map(function (e) {
              return (
                '<option value="' +
                e +
                '"' +
                (e === (r.estado || 'PENDIENTE').toUpperCase() ? " selected" : "") +
                ">" +
                e +
                "</option>"
              );
            })
            .join("") +
          "</select>" +
          "</div>" +
          "</div>" +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:24px;color:#c8452d">Error al cargar reportes.</td></tr>';
  }
}

async function responderReporte(id) {
  var txt    = document.getElementById("resp-" + id);
  var sel    = document.getElementById("sel-" + id);
  var estado = sel ? sel.value : "RESUELTO";

  if (!txt || !txt.value.trim()) {
    mostrarToastAdmin("⚠ Escribe una respuesta primero.");
    return;
  }
  try {
    // Guardar respuesta y estado en paralelo
    const [r1, r2] = await Promise.all([
      fetch("/api/reportes/" + id + "/responder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuesta: txt.value.trim() }),
      }),
      fetch("/api/reportes/" + id + "/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: estado }),
      })
    ]);
    const data = await r1.json();
    if (data.exito) {
      mostrarToastAdmin("✓ Reporte actualizado");
      cargarReportesAdmin();
    }
  } catch (e) {
    mostrarToastAdmin("Error al actualizar reporte");
  }
}

async function cambiarEstadoReporte(id, estado) {
  try {
    var res = await fetch("/api/reportes/" + id + "/estado", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: estado }),
    });
    var data = await res.json();
    if (data.exito) {
      mostrarToastAdmin("✓ Estado actualizado");
      cargarReportesAdmin();
    }
  } catch (e) {
    console.error("Error cambiando estado:", e);
  }
}