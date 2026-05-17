package com.underwater.app.controller;

import com.underwater.app.model.Producto;
import com.underwater.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepo;
    private final MongoTemplate      mongoTemplate;

    @Value("${app.upload.dir:src/main/resources/static/uploads/productos}")
    private String uploadDir;

    public ProductoController(ProductoRepository productoRepo) {
        this.productoRepo  = productoRepo;
        this.mongoTemplate = productoRepo.getTemplate();
    }

    // ── GET /api/productos/destacados ───────────────────────────
    @GetMapping("/destacados")
    public ResponseEntity<List<Producto>> destacados() {
        return ResponseEntity.ok(productoRepo.findDestacados());
    }

    // ── GET /api/productos — catálogo con filtros ───────────────
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar(
            @RequestParam(required = false) String genero,
            @RequestParam(required = false) String categorias,
            @RequestParam(required = false) String marcas,
            @RequestParam(required = false) String colores,
            @RequestParam(required = false) String tallas,
            @RequestParam(required = false, defaultValue = "800000") int precioMax,
            @RequestParam(required = false, defaultValue = "novedad") String orden,
            @RequestParam(required = false, defaultValue = "0")  int pagina,
            @RequestParam(required = false, defaultValue = "9")  int tamano) {

        Query query = new Query();
        query.addCriteria(Criteria.where("estado").is("ACTIVO"));
        query.addCriteria(Criteria.where("publicado").is(true));
        query.addCriteria(Criteria.where("precio").lte(precioMax));

        if (genero != null && !genero.isBlank() && !genero.equalsIgnoreCase("todos"))
            query.addCriteria(Criteria.where("genero").regex("^" + genero + "$", "i"));

        if (categorias != null && !categorias.isBlank())
            query.addCriteria(Criteria.where("categoria").in(Arrays.asList(categorias.split(","))));

        if (marcas != null && !marcas.isBlank())
            query.addCriteria(Criteria.where("marca").in(Arrays.asList(marcas.split(","))));

        if (colores != null && !colores.isBlank())
            query.addCriteria(Criteria.where("colores").in(Arrays.asList(colores.split(","))));

        if (tallas != null && !tallas.isBlank())
            query.addCriteria(Criteria.where("tallas").in(Arrays.asList(tallas.split(","))));

        Sort sort = switch (orden) {
            case "precio-asc"  -> Sort.by(Sort.Direction.ASC,  "precio");
            case "precio-desc" -> Sort.by(Sort.Direction.DESC, "precio");
            default            -> Sort.by(Sort.Direction.DESC, "fechaRegistro");
        };

        long total     = mongoTemplate.count(query, Producto.class);
        query.with(sort).skip((long) pagina * tamano).limit(tamano);
        List<Producto> productos = mongoTemplate.find(query, Producto.class, "productos");

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("productos",    productos);
        resp.put("totalItems",   total);
        resp.put("totalPaginas", (int) Math.ceil((double) total / tamano));
        resp.put("paginaActual", pagina);
        return ResponseEntity.ok(resp);
    }

    // ── GET /api/productos/todos — sin filtro (fallback) ────────
    @GetMapping("/todos")
    public ResponseEntity<Map<String, Object>> todos(
            @RequestParam(defaultValue = "0")    int pagina,
            @RequestParam(defaultValue = "1000") int tamano) {
        List<Producto> lista = productoRepo.findAll();
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("productos",    lista);
        resp.put("totalItems",   lista.size());
        resp.put("totalPaginas", 1);
        resp.put("paginaActual", 0);
        return ResponseEntity.ok(resp);
    }

    // ── GET /api/productos/{id} — detalle ───────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> detalle(@PathVariable String id) {
        return productoRepo.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ── POST /api/productos — crear ─────────────────────────────
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Producto producto) {
        if (producto.getFechaRegistro() == null)
            producto.setFechaRegistro(java.time.LocalDateTime.now());
        if (producto.getEstado() == null)
            producto.setEstado(producto.isPublicado() ? "ACTIVO" : "BORRADOR");
        return ResponseEntity.ok(productoRepo.save(producto));
    }

    // ── POST /api/productos/{id}/imagenes — subir imágenes ──────
    @PostMapping("/{id}/imagenes")
    public ResponseEntity<?> subirImagenes(
            @PathVariable String id,
            @RequestParam("archivos") List<MultipartFile> archivos) {

        Optional<Producto> opt = productoRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Producto producto = opt.get();
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "No se pudo crear la carpeta de uploads."));
        }

        List<String> urls = new ArrayList<>();
        if (producto.getImagenes() != null) urls.addAll(producto.getImagenes());

        for (MultipartFile archivo : archivos) {
            if (archivo.isEmpty()) continue;
            String ext      = obtenerExtension(archivo.getOriginalFilename());
            String nombre   = id + "_" + System.currentTimeMillis() + ext;
            Path   destino  = Paths.get(uploadDir, nombre);
            try {
                archivo.transferTo(destino.toFile());
                urls.add("/uploads/productos/" + nombre);
            } catch (IOException e) {
                return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al guardar " + archivo.getOriginalFilename()));
            }
        }

        productoRepo.actualizarImagenes(id, urls);
        return ResponseEntity.ok(Map.of("imagenes", urls));
    }

    // ── DELETE /api/productos/{id}/imagenes ─────────────────────
    @DeleteMapping("/{id}/imagenes")
    public ResponseEntity<?> eliminarImagen(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String url = body.get("url");
        if (url == null || url.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Falta el campo 'url'"));

        Optional<Producto> opt = productoRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Producto p = opt.get();
        List<String> imgs = new ArrayList<>(p.getImagenes() != null ? p.getImagenes() : List.of());
        imgs.remove(url);
        productoRepo.actualizarImagenes(id, imgs);

        try {
            Files.deleteIfExists(Paths.get(uploadDir, url.replace("/uploads/productos/", "")));
        } catch (IOException ignored) {}

        return ResponseEntity.ok(Map.of("imagenes", imgs));
    }

    private String obtenerExtension(String nombre) {
        if (nombre == null || !nombre.contains(".")) return ".jpg";
        return nombre.substring(nombre.lastIndexOf('.'));
    }
}
