// ================================================================
// scripts_Empresas.js — Underwater
// ================================================================

const COLORES_EMP = [
  '#c8452d','#e8a838','#16a34a','#1d4ed8',
  '#7c3aed','#0891b2','#c05621','#b91c1c'
];

let productosGlobal = [];

document.addEventListener('DOMContentLoaded', async () => {
  const grilla = document.getElementById('grilla-empresas-pag');

  try {
    const [resEmpresas, resProductos] = await Promise.all([
      fetch('/api/admin/empresas?estado=APROBADA'),
      fetch('/api/productos?tamano=1000&pagina=0')
    ]);

    if (!resEmpresas.ok) throw new Error('Error al cargar empresas');
    if (!resProductos.ok) throw new Error('Error al cargar productos');

    const empresas = await resEmpresas.json();
    const dataProd = await resProductos.json();
    productosGlobal = Array.isArray(dataProd) ? dataProd : (dataProd.productos ?? []);

    if (!empresas?.length) {
      grilla.innerHTML = '<p class="emp-estado-msg">No hay empresas disponibles.</p>';
      return;
    }

    renderEmpresas(empresas);

  } catch (e) {
    console.error(e);
    grilla.innerHTML = '<p class="emp-estado-msg emp-estado-error">Error cargando empresas.</p>';
  }
});

function renderEmpresas(empresas) {
  const grilla = document.getElementById('grilla-empresas-pag');

  const fragment = document.createDocumentFragment();

  empresas.forEach((empresa, i) => {
    const nombre    = empresa.nombreEmpresa || empresa.nombre || '—';
    const ciudad    = empresa.ciudad || '—';
    const desc      = empresa.descripcion || 'Empresa vendedora en Underwater Marketplace.';
    const color     = COLORES_EMP[i % COLORES_EMP.length];
    const iniciales = nombre
      .split(' ')
      .map(w => w[0] ?? '')
      .join('')
      .substring(0, 2)
      .toUpperCase();

    // Contar productos por ID si está disponible, si no por nombre
    const idEmpresa = empresa.id || empresa.empresaId;
    const cant = productosGlobal.filter(p =>
      idEmpresa
        ? (p.empresaId === idEmpresa || p.vendedorId === idEmpresa)
        : (p.vendedorNombre || '') === nombre
    ).length;

    const url = `/catalogo?empresa=${encodeURIComponent(nombre)}`;

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-empresa-pag';
    tarjeta.setAttribute('role', 'button');
    tarjeta.setAttribute('tabindex', '0');
    tarjeta.setAttribute('aria-label', `Ver empresa ${nombre}`);

    tarjeta.addEventListener('click', () => { window.location.href = url; });
    tarjeta.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') window.location.href = url;
    });

    tarjeta.innerHTML = `
      <div class="emp-cabecera">
        <div class="emp-logo" style="background:${color}">${iniciales}</div>
        <div class="emp-info">
          <p class="emp-nombre">${escapeHtml(nombre)}</p>
          <p class="emp-ciudad">${escapeHtml(ciudad)}</p>
        </div>
        <span class="emp-verificado">✓ Verificada</span>
      </div>
      <div class="emp-body">
        <p class="emp-desc">${escapeHtml(desc)}</p>
        <div class="emp-stats">
          <div class="emp-stat">
            <span class="emp-stat-n">${cant}</span>
            <span class="emp-stat-l">Productos</span>
          </div>
          <div class="emp-stat">
            <span class="emp-stat-n">${escapeHtml(ciudad)}</span>
            <span class="emp-stat-l">Ciudad</span>
          </div>
        </div>
        <button class="emp-btn" data-url="${url}">Ver productos →</button>
      </div>
    `;

    // El botón navega sin propagar el click a la tarjeta
    tarjeta.querySelector('.emp-btn').addEventListener('click', e => {
      e.stopPropagation();
      window.location.href = url;
    });

    fragment.appendChild(tarjeta);
  });

  grilla.innerHTML = '';
  grilla.appendChild(fragment);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}