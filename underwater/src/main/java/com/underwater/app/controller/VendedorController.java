package com.underwater.app.controller;

import com.underwater.app.model.*;
import com.underwater.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/vendedor")
public class VendedorController {

    @Autowired private ProductoRepository productoRepo;
    @Autowired private EmpresaRepository  empresaRepo;
    @Autowired private PedidoRepository   pedidoRepo;

    // ── GET /api/vendedor/productos?vendedorId=xxx ───────────────
    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> misProductos(@RequestParam String vendedorId) {
        return ResponseEntity.ok(productoRepo.findByVendedorId(vendedorId));
    }

    // ── GET /api/vendedor/productos/{id} ─────────────────────────
    @GetMapping("/productos/{id}")
    public ResponseEntity<?> detalleProducto(@PathVariable String id) {
        return productoRepo.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ── POST /api/vendedor/productos — publicar ──────────────────
    @PostMapping("/productos")
    public ResponseEntity<Map<String, Object>> publicar(@RequestBody Map<String, Object> datos) {
        Map<String, Object> res = new HashMap<>();
        try {
            Producto p = construir(datos, true);
            Producto guardado = productoRepo.save(p);
            res.put("exito",   true);
            res.put("id",      guardado.getId());
            res.put("mensaje", "¡Producto publicado exitosamente!");
            return ResponseEntity.status(201).body(res);
        } catch (Exception e) {
            res.put("exito",   false);
            res.put("mensaje", "Error al publicar: " + e.getMessage());
            return ResponseEntity.badRequest().body(res);
        }
    }

    // ── POST /api/vendedor/productos/borrador ────────────────────
    @PostMapping("/productos/borrador")
    public ResponseEntity<Map<String, Object>> borrador(@RequestBody Map<String, Object> datos) {
        Map<String, Object> res = new HashMap<>();
        try {
            Producto p = construir(datos, false);
            Producto guardado = productoRepo.save(p);
            res.put("exito",   true);
            res.put("id",      guardado.getId());
            res.put("mensaje", "Borrador guardado.");
            return ResponseEntity.status(201).body(res);
        } catch (Exception e) {
            res.put("exito",   false);
            res.put("mensaje", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(res);
        }
    }

    // ── PUT /api/vendedor/productos/{id}/estado ──────────────────
    @PutMapping("/productos/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        productoRepo.cambiarEstado(id, body.get("estado"));
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Estado actualizado."));
    }

    // ── DELETE /api/vendedor/productos/{id} ──────────────────────
    @DeleteMapping("/productos/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        productoRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Producto eliminado."));
    }

    // ── GET /api/vendedor/empresa?usuarioId=xxx ──────────────────
    @GetMapping("/empresa")
    public ResponseEntity<?> miEmpresa(@RequestParam String usuarioId) {
        return empresaRepo.findByUsuarioId(usuarioId)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ── PUT /api/vendedor/empresa ────────────────────────────────
    // Body: { usuarioId, nombre, ciudad, descripcion, telefono }
    @PutMapping("/empresa")
    public ResponseEntity<?> actualizarEmpresa(@RequestBody Map<String, String> body) {
        String usuarioId = body.get("usuarioId");
        return empresaRepo.findByUsuarioId(usuarioId).map(e -> {
            if (body.get("nombre")      != null) e.setNombre(body.get("nombre"));
            if (body.get("ciudad")      != null) e.setCiudad(body.get("ciudad"));
            if (body.get("descripcion") != null) e.setDescripcion(body.get("descripcion"));
            if (body.get("telefono")    != null) e.setTelefono(body.get("telefono"));
            empresaRepo.save(e);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Empresa actualizada."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── GET /api/vendedor/pedidos?empresaId=xxx ──────────────────
    @GetMapping("/pedidos")
    public ResponseEntity<?> misPedidos(@RequestParam String empresaId) {
        return ResponseEntity.ok(pedidoRepo.findByEmpresaId(empresaId));
    }

    // ── PUT /api/vendedor/pedidos/{id}/enviar ────────────────────
    @PutMapping("/pedidos/{id}/enviar")
    public ResponseEntity<?> marcarEnviado(@PathVariable String id) {
        return pedidoRepo.findById(id).map(p -> {
            p.setEstado("ENVIADO");
            pedidoRepo.save(p);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Pedido marcado como enviado."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Helper ───────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private Producto construir(Map<String, Object> d, boolean publicar) {
        Producto p = new Producto(
            (String) d.get("nombre"),
            (String) d.get("marca"),
            (String) d.get("categoria"),
            (String) d.get("genero"),
            (String) d.get("descripcion"),
            d.get("precio") != null ? ((Number) d.get("precio")).intValue() : 0,
            d.get("precioDescuento") != null ? ((Number) d.get("precioDescuento")).intValue() : null,
            (List<String>) d.get("tallas"),
            (List<String>) d.get("colores"),
            (String) d.get("vendedorId"),
            (String) d.get("empresaId"),
            publicar
        );
        if (d.get("stock") != null) p.setStock(((Number) d.get("stock")).intValue());
        if (d.get("stockPorTalla") != null) {
            Map<String, Object> raw = (Map<String, Object>) d.get("stockPorTalla");
            Map<String, Integer> spt = new HashMap<>();
            raw.forEach((k, v) -> spt.put(k, ((Number) v).intValue()));
            p.setStockPorTalla(spt);
        }
        if (d.get("vendedorNombre") != null) p.setVendedorNombre((String) d.get("vendedorNombre"));
        return p;
    }
}
