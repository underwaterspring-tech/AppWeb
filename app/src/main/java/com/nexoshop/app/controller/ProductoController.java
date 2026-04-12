package com.nexoshop.app.controller;

import com.nexoshop.app.model.Producto;
import com.nexoshop.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoRepository productoRepository;
    private final MongoTemplate productoTemplate;

    // Carpeta donde se guardan las imágenes dentro del proyecto Spring Boot.
    // Apunta a src/main/resources/static/uploads/productos
    // Así Spring Boot las sirve automáticamente en /uploads/productos/archivo.jpg
    @Value("${app.upload.dir:src/main/resources/static/uploads/productos}")
    private String uploadDir;

    public ProductoController(
            @Value("${spring.data.mongodb.uri}") String mongoUri,
            ProductoRepository productoRepository
    ) {
        this.productoRepository = productoRepository;
        this.productoTemplate   = productoRepository.getTemplate();
    }

    // ================================================================
    // GET /api/productos  — catálogo con filtros y paginación
    // ================================================================
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerProductos(
            @RequestParam(required = false)                              String genero,
            @RequestParam(required = false)                              String categorias,
            @RequestParam(required = false)                              String marcas,
            @RequestParam(required = false)                              String empresas,
            @RequestParam(required = false)                              String colores,
            @RequestParam(required = false)                              String tallas,
            @RequestParam(required = false, defaultValue = "800000")     int    precioMax,
            @RequestParam(required = false, defaultValue = "relevancia") String orden,
            @RequestParam(required = false, defaultValue = "0")          int    pagina,
            @RequestParam(required = false, defaultValue = "9")          int    tamano
    ) {
        Query query = new Query();
        query.addCriteria(Criteria.where("estado").is("ACTIVO"));
        query.addCriteria(Criteria.where("publicado").is(true));

        // Precio máximo — respeta precioDescuento si existe
        query.addCriteria(new Criteria().orOperator(
            Criteria.where("precioDescuento").lte(precioMax),
            new Criteria().andOperator(
                Criteria.where("precioDescuento").exists(false),
                Criteria.where("precio").lte(precioMax)
            )
        ));

        if (genero != null && !genero.isBlank() && !genero.equalsIgnoreCase("todos"))
            query.addCriteria(Criteria.where("genero").regex("^" + genero + "$", "i"));

        if (categorias != null && !categorias.isBlank())
            query.addCriteria(Criteria.where("categoria").in(Arrays.asList(categorias.split(","))));

        if (marcas != null && !marcas.isBlank())
            query.addCriteria(Criteria.where("marca").in(Arrays.asList(marcas.split(","))));

        if (empresas != null && !empresas.isBlank())
            query.addCriteria(Criteria.where("vendedorId").in(Arrays.asList(empresas.split(","))));

        if (colores != null && !colores.isBlank())
            query.addCriteria(Criteria.where("colores").in(Arrays.asList(colores.split(","))));

        if (tallas != null && !tallas.isBlank())
            query.addCriteria(Criteria.where("tallas").in(Arrays.asList(tallas.split(","))));

        Sort sort = switch (orden) {
            case "precio-asc"  -> Sort.by(Sort.Direction.ASC,  "precio");
            case "precio-desc" -> Sort.by(Sort.Direction.DESC, "precio");
            case "novedad"     -> Sort.by(Sort.Direction.DESC, "fechaRegistro");
            default            -> Sort.by(Sort.Direction.DESC, "fechaRegistro");
        };

        long total = productoTemplate.count(query, Producto.class);
        query.with(sort).skip((long) pagina * tamano).limit(tamano);

        List<Producto> productos = productoTemplate.find(query, Producto.class);

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("productos",    productos);
        respuesta.put("totalItems",   total);
        respuesta.put("totalPaginas", (int) Math.ceil((double) total / tamano));
        respuesta.put("paginaActual", pagina);
        respuesta.put("tamano",       tamano);
        return ResponseEntity.ok(respuesta);
    }

    // ================================================================
    // GET /api/productos/{id}  — detalle de un producto
    // ================================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerProductoPorId(@PathVariable String id) {
        return productoRepository.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ================================================================
    // POST /api/productos  — crear producto (sin imágenes aún)
    // ================================================================
    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        if (producto.getFechaRegistro() == null)
            producto.setFechaRegistro(java.time.LocalDateTime.now());
        if (producto.getEstado() == null)
            producto.setEstado(producto.isPublicado() ? "ACTIVO" : "BORRADOR");
        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.ok(guardado);
    }

    // ================================================================
    // POST /api/productos/{id}/imagenes
    //
    // Sube 1 o varias imágenes para un producto ya creado.
    // Recibe multipart/form-data con campo "archivos" (múltiple).
    //
    // Responde:
    //   { "imagenes": ["/uploads/productos/ID_1.jpg", ...] }
    //
    // Uso desde el formulario del vendedor:
    //   const form = new FormData();
    //   for (const file of files) form.append('archivos', file);
    //   fetch('/api/productos/' + id + '/imagenes', { method:'POST', body:form });
    // ================================================================
    @PostMapping("/{id}/imagenes")
    public ResponseEntity<?> subirImagenes(
            @PathVariable String id,
            @RequestParam("archivos") List<MultipartFile> archivos
    ) {
        // Verificar que el producto existe
        Optional<Producto> opt = productoRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();

        Producto producto = opt.get();

        // Crear la carpeta de destino si no existe
        Path destino = Paths.get(uploadDir);
        try {
            Files.createDirectories(destino);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "No se pudo crear la carpeta de uploads: " + e.getMessage()));
        }

        // Imágenes anteriores (para no borrarlas si ya tenía)
        List<String> urlsGuardadas = new ArrayList<>();
        if (producto.getImagenes() != null) urlsGuardadas.addAll(producto.getImagenes());

        // Guardar cada archivo
        for (MultipartFile archivo : archivos) {
            if (archivo.isEmpty()) continue;

            String extension  = obtenerExtension(archivo.getOriginalFilename());
            String nombreFile = id + "_" + System.currentTimeMillis() + extension;
            Path   ruta       = destino.resolve(nombreFile);

            try {
                archivo.transferTo(ruta.toFile());
                urlsGuardadas.add("/uploads/productos/" + nombreFile);
            } catch (IOException e) {
                return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al guardar " + archivo.getOriginalFilename() + ": " + e.getMessage()));
            }
        }

        // Actualizar el producto en MongoDB
        productoRepository.actualizarImagenes(id, urlsGuardadas);

        return ResponseEntity.ok(Map.of("imagenes", urlsGuardadas));
    }

    // ================================================================
    // DELETE /api/productos/{id}/imagenes
    //
    // Elimina una imagen específica de un producto.
    // Body: { "url": "/uploads/productos/abc.jpg" }
    // ================================================================
    @DeleteMapping("/{id}/imagenes")
    public ResponseEntity<?> eliminarImagen(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String urlAEliminar = body.get("url");
        if (urlAEliminar == null || urlAEliminar.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'url'"));

        Optional<Producto> opt = productoRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Producto producto = opt.get();
        List<String> imagenes = new ArrayList<>(
            producto.getImagenes() != null ? producto.getImagenes() : List.of()
        );
        imagenes.remove(urlAEliminar);
        productoRepository.actualizarImagenes(id, imagenes);

        // Borrar el archivo físico
        String nombreArchivo = urlAEliminar.replace("/uploads/productos/", "");
        Path rutaFisica = Paths.get(uploadDir, nombreArchivo);
        try { Files.deleteIfExists(rutaFisica); } catch (IOException ignored) {}

        return ResponseEntity.ok(Map.of("imagenes", imagenes));
    }

    // ── Helper ─────────────────────────────────────────────────────
    private String obtenerExtension(String nombreOriginal) {
        if (nombreOriginal == null || !nombreOriginal.contains(".")) return ".jpg";
        return nombreOriginal.substring(nombreOriginal.lastIndexOf('.'));
    }
}