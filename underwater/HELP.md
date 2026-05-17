# Underwater Marketplace — Backend

## Requisitos
- Java 17+
- Maven 3.9+ (o usar ./mvnw incluido)
- MongoDB corriendo en localhost:27017

## Cómo correr el proyecto

### Opción 1 — Con Maven instalado:
```bash
mvn spring-boot:run
```

### Opción 2 — Con el wrapper incluido:
```bash
# Linux/Mac:
chmod +x mvnw
./mvnw spring-boot:run

# Windows:
mvnw.cmd spring-boot:run
```

### Opción 3 — Desde IntelliJ IDEA:
1. File → Open → selecciona la carpeta del proyecto
2. Espera que Maven descargue dependencias
3. Clic derecho en AppApplication.java → Run

## Estructura del proyecto
```
src/main/java/com/underwater/app/
├── AppApplication.java
├── config/       → MongoConfig, SecurityConfig, ViewConfig
├── controller/   → Auth, Producto, Carrito, Pedido, Favorito, Comprador, Vendedor, Admin, Cupon
├── model/        → 12 modelos
├── repository/   → 9 repositorios
└── service/      → AuthService

src/main/resources/
├── application.properties
└── static/       ← AQUÍ van tus HTML, CSS, JS
```

## Frontend
Copia todo tu frontend dentro de:
`src/main/resources/static/`

Estructura esperada:
```
static/
├── css/
├── js/
├── uploads/productos/
├── index.html
├── login.html
├── Catalogo.html
├── detalle.html
├── carrito.html
├── favoritos.html
├── pedidos.html
├── mi_Cuenta.html
├── panel_Admin.html
├── panel_Vendedor.html
└── espera_Aprobacion.html
```

## Endpoints disponibles
- POST   /api/auth/registro
- POST   /api/auth/login
- POST   /api/auth/logout
- GET    /api/productos
- GET    /api/productos/destacados
- GET    /api/productos/{id}
- POST   /api/productos/{id}/imagenes
- GET    /api/carrito?usuarioId=
- POST   /api/carrito/agregar
- PUT    /api/carrito/cantidad
- DELETE /api/carrito/item
- DELETE /api/carrito?usuarioId=
- GET    /api/pedidos?usuarioId=
- POST   /api/pedidos
- PUT    /api/pedidos/{id}/cancelar
- GET    /api/favoritos?usuarioId=
- POST   /api/favoritos
- DELETE /api/favoritos
- GET    /api/favoritos/check
- GET    /api/comprador/perfil?usuarioId=
- PUT    /api/comprador/perfil
- PUT    /api/comprador/cambiar-password
- POST   /api/comprador/resenas
- GET    /api/vendedor/productos?vendedorId=
- POST   /api/vendedor/productos
- PUT    /api/vendedor/productos/{id}/estado
- DELETE /api/vendedor/productos/{id}
- GET    /api/vendedor/empresa?usuarioId=
- PUT    /api/vendedor/empresa
- GET    /api/vendedor/pedidos?empresaId=
- PUT    /api/vendedor/pedidos/{id}/enviar
- GET    /api/admin/usuarios
- PUT    /api/admin/usuarios/{id}/suspender
- PUT    /api/admin/usuarios/{id}/activar
- GET    /api/admin/empresas
- PUT    /api/admin/empresas/{id}/estado
- GET    /api/admin/productos
- PUT    /api/admin/productos/{id}/estado
- GET    /api/admin/pedidos
- GET    /api/admin/stats
- POST   /api/cupones/validar
