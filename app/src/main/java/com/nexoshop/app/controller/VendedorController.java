package com.nexoshop.app.controller;

import com.nexoshop.app.model.Producto;
import com.nexoshop.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// ============================================================
// CONTROLADOR: VendedorController
// Endpoints que consume el panel del vendedor
//
//   POST /api/vendedor/productos        ← publicar producto
//   POST /api/vendedor/productos/borrador ← guardar borrador
//   GET  /api/vendedor/productos        ← mis productos
//   PUT  /api/vendedor/productos/{id}/estado ← cambiar estado
//   DELETE /api/vendedor/productos/{id} ← eliminar
// ============================================================
@RestController
@RequestMapping("/api/vendedor")
@CrossOrigin(origins = "*")
public class VendedorController {

    @Autowired
    private ProductoRepository productoRepo;


    // ── POST /api/vendedor/productos ──────────────────────────
    @PostMapping("/productos")
    public ResponseEntity<Map<String, Object>> publicarProducto(
            @RequestBody Map<String, Object> datos) {

        Map<String, Object> respuesta = new HashMap<>();

        try {
            Producto producto = construirProducto(datos, true);
            Producto guardado = productoRepo.save(producto);

            respuesta.put("exito",   true);
            respuesta.put("id",      guardado.getId());
            respuesta.put("mensaje", "¡Producto publicado exitosamente!");
            return ResponseEntity.status(201).body(respuesta);

        } catch (Exception e) {
            respuesta.put("exito",   false);
            respuesta.put("mensaje", "Error al publicar el producto: " + e.getMessage());
            return ResponseEntity.badRequest().body(respuesta);
        }
    }


    // ── POST /api/vendedor/productos/borrador ─────────────────
    @PostMapping("/productos/borrador")
    public ResponseEntity<Map<String, Object>> guardarBorrador(
            @RequestBody Map<String, Object> datos) {

        Map<String, Object> respuesta = new HashMap<>();

        try {
            Producto producto = construirProducto(datos, false);
            Producto guardado = productoRepo.save(producto);

            respuesta.put("exito",   true);
            respuesta.put("id",      guardado.getId());
            respuesta.put("mensaje", "Borrador guardado correctamente.");
            return ResponseEntity.status(201).body(respuesta);

        } catch (Exception e) {
            respuesta.put("exito",   false);
            respuesta.put("mensaje", "Error al guardar el borrador: " + e.getMessage());
            return ResponseEntity.badRequest().body(respuesta);
        }
    }


    // ── GET /api/vendedor/productos ───────────────────────────
    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> misProductos(
            @RequestParam String vendedorId) {
        return ResponseEntity.ok(productoRepo.findByVendedorId(vendedorId));
    }


    // ── PUT /api/vendedor/productos/{id}/estado ───────────────
    @PutMapping("/productos/{id}/estado")
    public ResponseEntity<Map<String, Object>> cambiarEstado(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        Map<String, Object> respuesta = new HashMap<>();
        String nuevoEstado = body.get("estado");

        productoRepo.cambiarEstado(id, nuevoEstado);
        respuesta.put("exito",   true);
        respuesta.put("mensaje", "Estado actualizado a " + nuevoEstado);
        return ResponseEntity.ok(respuesta);
    }


    // ── DELETE /api/vendedor/productos/{id} ───────────────────
    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Map<String, Object>> eliminarProducto(
            @PathVariable String id) {

        Map<String, Object> respuesta = new HashMap<>();
        productoRepo.deleteById(id);
        respuesta.put("exito",   true);
        respuesta.put("mensaje", "Producto eliminado.");
        return ResponseEntity.ok(respuesta);
    }


    @SuppressWarnings("unchecked")
private Producto construirProducto(Map<String, Object> datos, boolean publicar) {

    Producto p = new Producto(
        (String)  datos.get("nombre"),
        (String)  datos.get("marca"),
        (String)  datos.get("categoria"),
        (String)  datos.get("genero"),
        (String)  datos.get("descripcion"),
                  datos.get("precio") != null
                      ? ((Number) datos.get("precio")).intValue() : 0,
                  datos.get("precioDescuento") != null
                      ? ((Number) datos.get("precioDescuento")).intValue() : null,
        (List<String>) datos.get("tallas"),
        (List<String>) datos.get("colores"),
        (String)  datos.get("vendedorId"),
        (String)  datos.get("empresaId"),
                  publicar
    );

    // Stock total
    if (datos.get("stock") != null) {
        p.setStock(((Number) datos.get("stock")).intValue());
    }

    // Stock por talla
    if (datos.get("stockPorTalla") != null) {
        Map<String, Object> rawMap = (Map<String, Object>) datos.get("stockPorTalla");
        Map<String, Integer> stockPorTalla = new HashMap<>();
        rawMap.forEach((talla, cantidad) ->
            stockPorTalla.put(talla, ((Number) cantidad).intValue())
        );
        p.setStockPorTalla(stockPorTalla);
    }

    return p;
}
}