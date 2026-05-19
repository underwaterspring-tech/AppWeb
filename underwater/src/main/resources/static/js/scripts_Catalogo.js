// ================================================================
// scripts_Catalogo.js — Underwater Marketplace
// ================================================================

var API_URL = "/api/productos";

var FONDOS = [
  "#f0ece4",
  "#e8f0e8",
  "#f0e8e8",
  "#e8eaf0",
  "#faf0e8",
  "#e8f4f0",
  "#f4e8f0",
  "#e8ecf0",
  "#eef0e8",
];
var MAPA_COLORES = {
  negro: "#111",
  blanco: "#fff",
  rojo: "#c8452d",
  azul: "#1a3a6e",
  verde: "#2d6e2d",
  gris: "#888",
  morado: "#8b5cf6",
  cafe: "#7c5a3c",
  naranja: "#e67e22",
  rosa: "#ff6b6b",
  amarillo: "#f1c40f",
  beige: "#e8d5b0",
  black: "#111",
  white: "#fff",
  red: "#c8452d",
  blue: "#1a3a6e",
  green: "#2d6e2d",
  gray: "#888",
  grey: "#888",
  purple: "#8b5cf6",
  brown: "#7c5a3c",
  orange: "#e67e22",
  pink: "#ff6b6b",
  yellow: "#f1c40f",
};

var estado = {
  genero: "todos",
  categorias: [],
  marcas: [],
  empresas: [],
  colores: [],
  tallas: [],
  precioMax: 800000,
  orden: "relevancia",
  pagina: 0,
  tamano: 9,
  totalPaginas: 1,
  todos: [],
  busqueda: "",
  soloOfertas: false,
};

var favoritosLocales = [];

// ── Helpers ─────────────────────────────────────────────────────
function n(s) {
  return String(s == null ? "" : s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_\s]+/g, "")
    .trim();
}
function eq(a, b) {
  return n(a) === n(b);
}
function fmt(v) {
  return parseInt(v || 0).toLocaleString("es-CO");
}
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function colorACss(c) {
  return MAPA_COLORES[n(c)] || "#ccc";
}
function emojiCat(cat) {
  var m = {
    deportivos: "👟",
    casual: "👟",
    tacones: "👠",
    botas: "🥾",
    sandalias: "🩴",
  };
  return m[n(cat)] || "👟";
}
function estrellasHTML(v) {
  var s = "",
    k = Math.round(parseFloat(v) || 0);
  for (var i = 0; i < k; i++) s += "★";
  for (var i = k; i < 5; i++) s += "☆";
  return s;
}

function getSesionC() {
  return {
    id: localStorage.getItem("uw-id"),
    nombre: localStorage.getItem("uw-nombre"),
    rol: localStorage.getItem("uw-rol"),
  };
}

// ── Getters de campos ────────────────────────────────────────────
function getPrecioBase(p) {
  return parseFloat(p.precio || p.precioCOP || 0);
}
function getPrecioDesc(p) {
  return parseFloat(p.precioDescuento || 0);
}
function getPrecioEfectivo(p) {
  var b = getPrecioBase(p),
    d = getPrecioDesc(p);
  return d > 0 && d < b ? d : b;
}
function getTallas(p) {
  var t = p.tallas || p.tallasDisponibles || [];
  return Array.isArray(t) ? t.map(String) : [];
}
function getColores(p) {
  var c = p.colores || p.colors || [];
  if (Array.isArray(c) && c.length) return c;
  var s = p.color || "";
  return s ? [s] : [];
}
function getEmpresa(p) {
  return p.vendedorNombre || p.empresaNombre || p.empresa || "";
}
function getCategoria(p) {
  return n(p.categoria || p.category || "");
}
function getMarca(p) {
  return n(p.marca || p.brand || "");
}

// ================================================================
// FAVORITOS
// ================================================================
function cargarFavoritosLocales() {
  var s = getSesionC();
  if (!s.id) {
    favoritosLocales = [];
    return;
  }
  fetch("/api/favoritos?usuarioId=" + s.id)
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      favoritosLocales = (data || []).map(function (f) {
        return String(f.productoId || f._id || "");
      });
    })
    .catch(function () {
      favoritosLocales = [];
    });
}

function esFavorito(id) {
  return favoritosLocales.indexOf(String(id)) !== -1;
}

async function toggleFavorito(productoId, btn) {
  var s = getSesionC();
  if (!s.id) {
    window.location.href = "/login";
    return;
  }
  if (!productoId) {
    console.warn("Sin productoId");
    return;
  }
  var esFav = esFavorito(productoId);
  var metodo = esFav ? "DELETE" : "POST";
  // Actualizar UI inmediatamente (optimistic)
  if (esFav) {
    favoritosLocales = favoritosLocales.filter(function (id) {
      return id !== String(productoId);
    });
    btn.textContent = "♡";
    btn.classList.remove("activo");
    if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos(-1);
  } else {
    favoritosLocales.push(String(productoId));
    btn.textContent = "❤️";
    btn.classList.add("activo");
    if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos(+1);
  }
  try {
    var res = await fetch("/api/favoritos", {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: s.id, productoId: String(productoId) }),
    });
    var data = await res.json();
    if (!data.exito) {
      // Revertir si falló
      if (esFav) {
        favoritosLocales.push(String(productoId));
        btn.textContent = "❤️";
        btn.classList.add("activo");
        if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos(+1);
      } else {
        favoritosLocales = favoritosLocales.filter(function (id) {
          return id !== String(productoId);
        });
        btn.textContent = "♡";
        btn.classList.remove("activo");
        if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos(-1);
      }
      console.error("Error favorito servidor:", data);
    }
  } catch (e) {
    // Revertir si hay error de red
    if (esFav) {
      favoritosLocales.push(String(productoId));
      btn.textContent = "❤️";
      btn.classList.add("activo");
    } else {
      favoritosLocales = favoritosLocales.filter(function (id) {
        return id !== String(productoId);
      });
      btn.textContent = "♡";
      btn.classList.remove("activo");
    }
    console.error("Error favorito red:", e);
  }
}

// ================================================================
// FILTRADO
// ================================================================
function filtrarProductos(lista) {
  return lista.filter(function (p) {
    if (estado.busqueda) {
      var txt = n(estado.busqueda);
      if (
        !n(p.nombre || "").includes(txt) &&
        !n(p.marca || "").includes(txt) &&
        !n(getEmpresa(p)).includes(txt)
      )
        return false;
    }
    if (estado.genero !== "todos") {
      var g = n(p.genero || "");
      if (g && g !== "todos" && g !== "unisex" && !eq(g, estado.genero))
        return false;
    }
    if (estado.categorias.length > 0) {
      if (
        !estado.categorias.some(function (c) {
          return eq(getCategoria(p), c);
        })
      )
        return false;
    }
    if (estado.marcas.length > 0) {
      if (
        !estado.marcas.some(function (m) {
          return eq(getMarca(p), m);
        })
      )
        return false;
    }
    if (estado.empresas.length > 0) {
      var emp = n(getEmpresa(p));
      if (
        !estado.empresas.some(function (e) {
          return n(emp).includes(n(e)) || eq(emp, e);
        })
      )
        return false;
    }
    if (estado.colores.length > 0) {
      var cols = getColores(p);
      if (
        !estado.colores.some(function (c) {
          return cols.some(function (cp) {
            return eq(cp, c);
          });
        })
      )
        return false;
    }
    if (estado.tallas.length > 0) {
      var talls = getTallas(p);
      if (
        !estado.tallas.some(function (t) {
          return talls.indexOf(String(t)) !== -1;
        })
      )
        return false;
    }
    var pe = getPrecioEfectivo(p);
    if (pe > 0 && pe > estado.precioMax) return false;
    if (estado.soloOfertas) {
      var d = getPrecioDesc(p);
      if (!(d > 0 && d < getPrecioBase(p))) return false;
    }
    return true;
  });
}

function ordenarProductos(lista) {
  var c = lista.slice();
  if (estado.orden === "precio-asc")
    c.sort(function (a, b) {
      return getPrecioEfectivo(a) - getPrecioEfectivo(b);
    });
  if (estado.orden === "precio-desc")
    c.sort(function (a, b) {
      return getPrecioEfectivo(b) - getPrecioEfectivo(a);
    });
  if (estado.orden === "valoracion")
    c.sort(function (a, b) {
      return (b.valoracionPromedio || 0) - (a.valoracionPromedio || 0);
    });
  if (estado.orden === "novedad")
    c.sort(function (a, b) {
      return new Date(b.fechaRegistro || 0) - new Date(a.fechaRegistro || 0);
    });
  return c;
}

// ================================================================
// CARGA DESDE API
// ================================================================
async function cargarProductos() {
  mostrarCargando();
  if (estado.todos.length > 0) {
    aplicar();
    return;
  }
  try {
    var res = await fetch(API_URL + "?tamano=1000&pagina=0");
    if (!res.ok) throw new Error("HTTP " + res.status);
    var data = await res.json();
    var lista = Array.isArray(data) ? data : data.productos || [];
    if (!lista.length) {
      var res2 = await fetch(API_URL + "/todos?tamano=1000&pagina=0");
      var data2 = await res2.json();
      lista = Array.isArray(data2) ? data2 : data2.productos || [];
    }
    estado.todos = lista;
    // Cargar empresas DESPUÉS de tener los productos
    cargarFiltroEmpresas();
    aplicar();
  } catch (e) {
    console.error(e);
    var g = document.getElementById("grilla-productos-catalogo");
    if (g)
      g.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;padding:3rem;color:#e05252">Error conectando con el servidor.</p>';
  }
}

function mostrarCargando() {
  var g = document.getElementById("grilla-productos-catalogo");
  if (g)
    g.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;padding:3rem;opacity:.4">Cargando productos...</p>';
}

function aplicar() {
  var filtrados = filtrarProductos(estado.todos);
  var ordenados = ordenarProductos(filtrados);
  var total = ordenados.length;
  var totalPags = Math.max(1, Math.ceil(total / estado.tamano));
  if (estado.pagina >= totalPags) estado.pagina = 0;
  var paginados = ordenados.slice(
    estado.pagina * estado.tamano,
    (estado.pagina + 1) * estado.tamano,
  );
  var numEl = document.getElementById("numero-resultados");
  if (numEl) numEl.textContent = total;
  renderizar(paginados);
  actualizarPaginacion(total, totalPags, estado.pagina);
}

// ================================================================
// RENDERIZAR
// ================================================================
function renderizar(lista) {
  var grilla = document.getElementById("grilla-productos-catalogo");
  if (!lista.length) {
    grilla.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:4rem;opacity:.6"><p style="font-size:2rem;margin-bottom:.5rem">Sin resultados</p><button onclick="limpiarFiltros()" style="margin-top:1rem;padding:.5rem 1.5rem;background:#F97316;color:#fff;border:none;cursor:pointer">Limpiar filtros</button></div>';
    return;
  }
  var html = "";
  lista.forEach(function (p, i) {
    var id = String(p._id || p.id || "");
    var precioBase = getPrecioBase(p),
      precioDesc = getPrecioDesc(p);
    var tieneDesc = precioDesc > 0 && precioDesc < precioBase;
    var pct = tieneDesc ? Math.round((1 - precioDesc / precioBase) * 100) : 0;
    var precioHTML = tieneDesc
      ? '<span class="precio-tachado">$' +
        fmt(precioBase) +
        '</span><span class="precio-oferta">$' +
        fmt(precioDesc) +
        "</span>"
      : precioBase > 0
        ? "$" + fmt(precioBase)
        : "—";
    var etiquetaHTML = tieneDesc
      ? '<span class="etiqueta-producto etiqueta-oferta">-' + pct + "%</span>"
      : '<span class="etiqueta-producto etiqueta-nuevo">Nuevo</span>';
    var cols = getColores(p);
    var coloresHTML = cols
      .slice(0, 4)
      .map(function (c) {
        var bg = colorACss(c),
          b = n(c) === "blanco" ? "border:2px solid #ddd;" : "";
        return (
          '<div class="circulo-color" style="background:' +
          bg +
          ";" +
          b +
          '" title="' +
          esc(c) +
          '"></div>'
        );
      })
      .join("");
    var imgs = p.imagenes || p.images || [];
    var imagenHTML =
      imgs.length > 0
        ? '<img src="' +
          esc(imgs[0]) +
          '" alt="' +
          esc(p.nombre || "") +
          '" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'"><span class="emoji-producto" style="display:none">' +
          emojiCat(p.categoria) +
          "</span>"
        : '<span class="emoji-producto">' + emojiCat(p.categoria) + "</span>";
    var rating = p.valoracionPromedio || 0,
      totalRes = p.totalResenas || 0;
    var vendedor = esc(getEmpresa(p) || "Tienda"),
      marca = esc(p.marca || ""),
      nombre = esc(p.nombre || "—");
    var fondo = FONDOS[i % FONDOS.length];
    var esFav = esFavorito(id);

    html +=
      '<div class="tarjeta-producto-catalogo" data-id="' +
      id +
      '" style="cursor:pointer">' +
      '<div class="imagen-producto-catalogo" style="background:' +
      fondo +
      '">' +
      etiquetaHTML +
      imagenHTML +
      '<div class="botones-hover-producto">' +
      '<button class="boton-favorito-catalogo btn-fav' +
      (esFav ? " activo" : "") +
      '" data-id="' +
      id +
      '" onclick="event.stopPropagation();toggleFavorito(\'' +
      id +
      "',this)\">" +
      (esFav ? "❤️" : "♡") +
      "</button>" +
      '<button class="boton-ver-detalle" onclick="event.stopPropagation();irADetalle(\'' +
      id +
      '\')" title="Ver detalle">👁</button>' +
      "</div>" +
      '<button class="boton-agregar-carrito btn-carrito" data-id="' +
      id +
      '" onclick="event.stopPropagation();agregarCarrito(\'' +
      id +
      "',this)\">+ Carrito</button>" +
      "</div>" +
      '<div class="detalle-producto">' +
      '<p class="vendedor-producto">por <a href="/catalogo?empresa=' +
      encodeURIComponent(getEmpresa(p)) +
      '" class="enlace-vendedor" onclick="event.stopPropagation()">' +
      vendedor +
      "</a></p>" +
      '<p class="marca-producto">' +
      marca +
      "</p>" +
      '<p class="nombre-producto">' +
      nombre +
      "</p>" +
      '<div class="estrellas-valoracion"><span class="estrellas">' +
      estrellasHTML(rating) +
      "</span>" +
      (totalRes > 0
        ? '<span class="cantidad-resenas">(' + totalRes + ")</span>"
        : "") +
      "</div>" +
      '<div class="pie-producto"><div class="precio-producto">' +
      precioHTML +
      '</div><div class="colores-disponibles">' +
      coloresHTML +
      "</div></div>" +
      "</div>" +
      "</div>";
  });
  grilla.innerHTML = html;
  grilla.querySelectorAll(".tarjeta-producto-catalogo").forEach(function (t) {
    t.addEventListener("click", function () {
      irADetalle(this.dataset.id);
    });
  });
}

// ================================================================
// CARRITO
// ================================================================
async function agregarCarrito(productoId, btn) {
  var s = getSesionC();
  if (!s.id) {
    window.location.href = "/login";
    return;
  }
  if (s.rol === "VENDEDOR" || s.rol === "ADMIN") return;
  // Usar modal global de talla/color/cantidad (definido en scripts.js)
  if (typeof agregarAlCarrito === "function") {
    agregarAlCarrito(productoId, btn);
  } else {
    // Fallback directo
    btn.textContent = "...";
    btn.disabled = true;
    try {
      var res = await fetch("/api/carrito/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: s.id,
          productoId: productoId,
          talla: "",
          color: "",
          cantidad: 1,
        }),
      });
      var data = await res.json();
      if (data.exito) {
        btn.textContent = "✓";
        btn.style.background = "#16a34a";
        var cont = document.getElementById("contador-carrito");
        if (cont)
          cont.textContent = (
            (data.carrito && data.carrito.items) ||
            []
          ).reduce(function (s, i) {
            return s + i.cantidad;
          }, 0);
        setTimeout(function () {
          btn.textContent = "+ Carrito";
          btn.style.background = "";
          btn.disabled = false;
        }, 1500);
      } else {
        btn.textContent = "+ Carrito";
        btn.disabled = false;
      }
    } catch (e) {
      btn.textContent = "+ Carrito";
      btn.disabled = false;
    }
  }
}

function irADetalle(id) {
  if (id) window.location.href = "/detalle?id=" + encodeURIComponent(id);
}

// ================================================================
// FILTRO DE EMPRESAS DINÁMICO
// ================================================================
async function cargarFiltroEmpresas() {
  try {
    var res = await fetch("/api/admin/empresas/publicas");
    if (!res.ok) return;
    var data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    var ul = document.getElementById("lista-filtro-empresas");
    if (!ul) {
      // Buscar por contenido del título
      document.querySelectorAll(".grupo-filtro").forEach(function (g) {
        var t = g.querySelector(".filtro-nombre");
        if (t && n(t.textContent).includes("empresa")) {
          ul = g.querySelector(".lista-opciones-filtro");
        }
      });
    }
    if (!ul) return;

    // Contar productos por empresa
    var conteo = {};
    estado.todos.forEach(function (p) {
      var emp = getEmpresa(p);
      if (emp) conteo[emp] = (conteo[emp] || 0) + 1;
    });

    ul.innerHTML = data
      .map(function (e) {
        var nombre = e.nombreEmpresa || e.nombre || "—";
        var cant = conteo[nombre] || 0;
        return (
          '<li><label class="opcion-filtro">' +
          '<input type="checkbox" class="checkbox-filtro checkbox-empresa" value="' +
          esc(nombre) +
          '"/>' +
          '<span class="texto-opcion">' +
          esc(nombre) +
          "</span>" +
          '<span class="cantidad-opcion">' +
          cant +
          "</span>" +
          "</label></li>"
        );
      })
      .join("");

    // Eventos
    ul.querySelectorAll(".checkbox-empresa").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var v = cb.value;
        if (cb.checked) {
          if (estado.empresas.indexOf(v) === -1) estado.empresas.push(v);
          mostrarEtiqueta("empresa", v, true);
        } else {
          estado.empresas = estado.empresas.filter(function (x) {
            return x !== v;
          });
          mostrarEtiqueta("empresa", v, false);
        }
        estado.pagina = 0;
        aplicar();
      });
    });

    // Marcar si viene de URL
    estado.empresas.forEach(function (emp) {
      ul.querySelectorAll(".checkbox-empresa").forEach(function (cb) {
        if (eq(cb.value, emp)) cb.checked = true;
      });
    });
  } catch (e) {
    console.warn("Error empresas:", e);
  }
}

// ================================================================
// PAGINACIÓN
// ================================================================
function actualizarPaginacion(total, totalPags, paginaActual) {
  estado.totalPaginas = totalPags;
  var btnAnt = document.getElementById("boton-anterior");
  var btnSig = document.getElementById("boton-siguiente");
  var numWrap = document.getElementById("numeros-pagina");
  if (btnAnt) btnAnt.disabled = paginaActual === 0;
  if (btnSig) btnSig.disabled = paginaActual >= totalPags - 1;
  if (!numWrap) return;
  numWrap.innerHTML = "";
  var rango = [];
  if (totalPags <= 7) {
    for (var i = 0; i < totalPags; i++) rango.push(i);
  } else {
    rango = [0];
    var desde = Math.max(1, paginaActual - 1),
      hasta = Math.min(totalPags - 2, paginaActual + 1);
    if (desde > 1) rango.push("...");
    for (var i = desde; i <= hasta; i++) rango.push(i);
    if (hasta < totalPags - 2) rango.push("...");
    rango.push(totalPags - 1);
  }
  rango.forEach(function (p) {
    if (p === "...") {
      var sp = document.createElement("span");
      sp.className = "puntos-paginacion";
      sp.textContent = "...";
      numWrap.appendChild(sp);
    } else {
      var btn = document.createElement("button");
      btn.className = "numero-pagina" + (p === paginaActual ? " activo" : "");
      btn.textContent = p + 1;
      (function (pg) {
        btn.onclick = function () {
          estado.pagina = pg;
          aplicar();
        };
      })(p);
      numWrap.appendChild(btn);
    }
  });
}

// ================================================================
// ETIQUETAS ACTIVAS
// ================================================================
function mostrarEtiqueta(tipo, valor, activo) {
  var cont = document.getElementById("contenedor-filtros-activos");
  if (!cont) return;
  var id = "etq-" + tipo + "-" + n(valor);
  if (activo) {
    if (document.getElementById(id)) return;
    var tag = document.createElement("span");
    tag.className = "etiqueta-filtro-activo";
    tag.id = id;
    tag.innerHTML =
      valor +
      ' <button class="boton-quitar-etiqueta" onclick="quitarFiltro(\'' +
      tipo +
      "','" +
      valor.replace(/'/g, "\\'") +
      "')\">&times;</button>";
    cont.appendChild(tag);
  } else {
    var el = document.getElementById(id);
    if (el) el.remove();
  }
}

function quitarFiltro(tipo, valor) {
  if (tipo === "talla") {
    var b = document.querySelector('.boton-talla[data-talla="' + valor + '"]');
    if (b) b.classList.remove("activo");
    estado.tallas = estado.tallas.filter(function (t) {
      return t !== valor;
    });
  }
  if (tipo === "color") {
    var b = document.querySelector('.boton-color[data-color="' + valor + '"]');
    if (b) b.classList.remove("activo");
    estado.colores = estado.colores.filter(function (c) {
      return c !== valor;
    });
  }
  if (tipo === "check") {
    var cb = document.querySelector('.checkbox-filtro[value="' + valor + '"]');
    if (cb) cb.checked = false;
    estado.categorias = estado.categorias.filter(function (x) {
      return x !== valor;
    });
    estado.marcas = estado.marcas.filter(function (x) {
      return x !== valor;
    });
  }
  if (tipo === "empresa") {
    var cb = document.querySelector('.checkbox-empresa[value="' + valor + '"]');
    if (cb) cb.checked = false;
    estado.empresas = estado.empresas.filter(function (x) {
      return x !== valor;
    });
  }
  if (tipo === "genero") {
    estado.genero = "todos";
    document.querySelectorAll(".boton-genero").forEach(function (b) {
      b.classList.remove("activo");
    });
    var bt = document.querySelector('.boton-genero[data-genero="todos"]');
    if (bt) bt.classList.add("activo");
  }
  if (tipo === "busqueda") {
    estado.busqueda = "";
    var inp = document.getElementById("input-busqueda");
    if (inp) inp.value = "";
  }
  if (tipo === "ofertas") {
    estado.soloOfertas = false;
  }
  mostrarEtiqueta(tipo, valor, false);
  estado.pagina = 0;
  aplicar();
}

function limpiarFiltros() {
  document
    .querySelectorAll(".checkbox-filtro,.checkbox-empresa")
    .forEach(function (c) {
      c.checked = false;
    });
  document.querySelectorAll(".boton-talla").forEach(function (b) {
    b.classList.remove("activo");
  });
  document.querySelectorAll(".boton-color").forEach(function (b) {
    b.classList.remove("activo");
  });
  document.querySelectorAll(".boton-genero").forEach(function (b) {
    b.classList.remove("activo");
  });
  var bt = document.querySelector('.boton-genero[data-genero="todos"]');
  if (bt) bt.classList.add("activo");
  var sl = document.getElementById("slider-precio");
  if (sl) sl.value = 800000;
  var vp = document.getElementById("valor-precio-maximo");
  if (vp) vp.textContent = "$800.000";
  var cont = document.getElementById("contenedor-filtros-activos");
  if (cont) cont.innerHTML = "";
  var inp = document.getElementById("input-busqueda");
  if (inp) inp.value = "";
  Object.assign(estado, {
    genero: "todos",
    categorias: [],
    marcas: [],
    empresas: [],
    colores: [],
    tallas: [],
    precioMax: 800000,
    busqueda: "",
    soloOfertas: false,
    pagina: 0,
  });
  aplicar();
}

// ================================================================
// LEER PARAMS URL
// ================================================================
function leerParamsURL() {
  var params = new URLSearchParams(window.location.search);
  var cat = params.get("categoria"),
    buscar = params.get("buscar");
  var marca = params.get("marca"),
    empresa = params.get("empresa");
  var ofertas = params.get("ofertas");
  if (cat) {
    estado.categorias = [cat];
    var cb = document.querySelector('.checkbox-filtro[value="' + cat + '"]');
    if (cb) {
      cb.checked = true;
    }
    mostrarEtiqueta("check", cat, true);
  }
  if (buscar) {
    estado.busqueda = buscar;
    var inp = document.getElementById("input-busqueda");
    if (inp) inp.value = buscar;
    mostrarEtiqueta("busqueda", buscar, true);
  }
  if (marca) {
    estado.marcas = [marca];
    mostrarEtiqueta("check", marca, true);
  }
  if (empresa) {
    estado.empresas = [empresa];
    mostrarEtiqueta("empresa", empresa, true);
  }
  if (ofertas === "true") {
    estado.soloOfertas = true;
    mostrarEtiqueta("ofertas", "Con descuento", true);
  }
}

// ================================================================
// DOM READY
// ================================================================
document.addEventListener("DOMContentLoaded", function () {
  // Búsqueda
  var inp = document.getElementById("input-busqueda");
  var btnBus = document.getElementById("boton-ejecutar-busqueda");
  var panel = document.getElementById("panel-sugerencias-busqueda");
  function ejecutarBusqueda() {
    var txt = inp ? inp.value.trim() : "";
    if (estado.busqueda) mostrarEtiqueta("busqueda", estado.busqueda, false);
    estado.busqueda = txt;
    if (txt) mostrarEtiqueta("busqueda", txt, true);
    estado.pagina = 0;
    aplicar();
  }
  if (inp) {
    inp.addEventListener("focus", function () {
      if (panel) panel.style.display = "block";
    });
    document.addEventListener("click", function (e) {
      var cont = document.getElementById("contenedor-barra-busqueda");
      if (cont && !cont.contains(e.target) && panel)
        panel.style.display = "none";
    });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") ejecutarBusqueda();
    });
  }
  if (btnBus) btnBus.addEventListener("click", ejecutarBusqueda);
  document.querySelectorAll(".sugerencia-item").forEach(function (s) {
    s.addEventListener("click", function () {
      if (inp) inp.value = this.textContent.replace(/^\S+\s/, "");
      if (panel) panel.style.display = "none";
      ejecutarBusqueda();
    });
  });

  // Slider precio
  var sl = document.getElementById("slider-precio");
  var vp = document.getElementById("valor-precio-maximo");
  if (sl) {
    sl.addEventListener("input", function () {
      estado.precioMax = parseInt(this.value);
      if (vp) vp.textContent = "$" + estado.precioMax.toLocaleString("es-CO");
    });
    sl.addEventListener("change", function () {
      estado.precioMax = parseInt(this.value);
      estado.pagina = 0;
      aplicar();
    });
  }

  // Género
  document.querySelectorAll(".boton-genero").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (estado.genero !== "todos")
        mostrarEtiqueta("genero", estado.genero, false);
      document.querySelectorAll(".boton-genero").forEach(function (b) {
        b.classList.remove("activo");
      });
      btn.classList.add("activo");
      estado.genero = btn.dataset.genero;
      if (estado.genero !== "todos")
        mostrarEtiqueta("genero", estado.genero, true);
      estado.pagina = 0;
      aplicar();
    });
  });

  // Tallas
  document.querySelectorAll(".boton-talla").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.toggle("activo");
      var t = btn.dataset.talla;
      if (btn.classList.contains("activo")) {
        estado.tallas.push(t);
        mostrarEtiqueta("talla", t, true);
      } else {
        estado.tallas = estado.tallas.filter(function (x) {
          return x !== t;
        });
        mostrarEtiqueta("talla", t, false);
      }
      estado.pagina = 0;
      aplicar();
    });
  });

  // Colores
  document.querySelectorAll(".boton-color").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.toggle("activo");
      var c = btn.dataset.color;
      if (btn.classList.contains("activo")) {
        estado.colores.push(c);
        mostrarEtiqueta("color", c, true);
      } else {
        estado.colores = estado.colores.filter(function (x) {
          return x !== c;
        });
        mostrarEtiqueta("color", c, false);
      }
      estado.pagina = 0;
      aplicar();
    });
  });

  // Checkboxes categoría/marca
  document
    .querySelectorAll(".checkbox-filtro:not(.checkbox-empresa)")
    .forEach(function (cb) {
      cb.addEventListener("change", function () {
        var v = cb.value;
        var grupo = cb.closest(".grupo-filtro");
        var titulo = grupo
          ? n(grupo.querySelector(".filtro-nombre").textContent)
          : "";
        if (cb.checked) {
          if (titulo.includes("categor")) estado.categorias.push(v);
          else if (titulo.includes("marca")) estado.marcas.push(v);
          mostrarEtiqueta("check", v, true);
        } else {
          estado.categorias = estado.categorias.filter(function (x) {
            return x !== v;
          });
          estado.marcas = estado.marcas.filter(function (x) {
            return x !== v;
          });
          mostrarEtiqueta("check", v, false);
        }
        estado.pagina = 0;
        aplicar();
      });
    });

  // Aplicar / Limpiar
  var btnAplicar = document.getElementById("boton-aplicar-filtros");
  if (btnAplicar)
    btnAplicar.addEventListener("click", function () {
      estado.pagina = 0;
      aplicar();
    });
  var btnLimpiar = document.getElementById("boton-limpiar-filtros");
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarFiltros);

  // Ordenar
  var sel = document.getElementById("selector-ordenar");
  if (sel)
    sel.addEventListener("change", function () {
      estado.orden = this.value;
      estado.pagina = 0;
      aplicar();
    });

  // Paginación
  var btnAnt = document.getElementById("boton-anterior");
  var btnSig = document.getElementById("boton-siguiente");
  if (btnAnt)
    btnAnt.addEventListener("click", function () {
      if (estado.pagina > 0) {
        estado.pagina--;
        aplicar();
      }
    });
  if (btnSig)
    btnSig.addEventListener("click", function () {
      if (estado.pagina < estado.totalPaginas - 1) {
        estado.pagina++;
        aplicar();
      }
    });

  // Vista
  var grilla = document.getElementById("grilla-productos-catalogo");
  var btnCuad = document.getElementById("boton-vista-cuadricula");
  var btnList = document.getElementById("boton-vista-lista");
  if (btnCuad)
    btnCuad.addEventListener("click", function () {
      this.classList.add("activo");
      if (btnList) btnList.classList.remove("activo");
      if (grilla) grilla.style.gridTemplateColumns = "";
    });
  if (btnList)
    btnList.addEventListener("click", function () {
      this.classList.add("activo");
      if (btnCuad) btnCuad.classList.remove("activo");
      if (grilla) grilla.style.gridTemplateColumns = "1fr";
    });

  // Leer URL y cargar
  leerParamsURL();
  cargarFavoritosLocales();
  cargarProductos();
});

console.log("✅ scripts_Catalogo.js cargado");