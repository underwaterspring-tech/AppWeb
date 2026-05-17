package com.underwater.app.controller;

import com.underwater.app.model.*;
import com.underwater.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    @Autowired private UsuarioRepository  usuarioRepo;
    @Autowired private ProductoRepository productoRepo;

    // GET /api/carrito?usuarioId=xxx
    @GetMapping
    public ResponseEntity<?> obtener(@RequestParam String usuarioId) {
        return usuarioRepo.findById(usuarioId).map(u -> {
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("usuarioId", usuarioId);
            res.put("items", u.getCarrito());
            return ResponseEntity.ok(res);
        }).orElse(ResponseEntity.notFound().build());
    }

    // POST /api/carrito/agregar
    @PostMapping("/agregar")
    public ResponseEntity<?> agregar(@RequestBody Map<String, Object> body) {
        String usuarioId  = (String) body.get("usuarioId");
        String productoId = (String) body.get("productoId");
        String talla      = (String) body.get("talla");
        String color      = (String) body.get("color");
        int    cantidad   = body.get("cantidad") != null ? ((Number) body.get("cantidad")).intValue() : 1;

        return usuarioRepo.findById(usuarioId).map(u -> {
            Optional<Producto> prodOpt = productoRepo.findById(productoId);
            if (prodOpt.isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "Producto no encontrado."));

            Producto prod   = prodOpt.get();
            List<ItemCarrito> carrito = new ArrayList<>(u.getCarrito());

            // Si ya existe el mismo item, sumar cantidad
            Optional<ItemCarrito> existente = carrito.stream()
                .filter(i -> i.getProductoId().equals(productoId)
                          && Objects.equals(i.getTalla(), talla)
                          && Objects.equals(i.getColor(), color))
                .findFirst();

            if (existente.isPresent()) {
                existente.get().setCantidad(existente.get().getCantidad() + cantidad);
            } else {
                ItemCarrito item = new ItemCarrito();
                item.setProductoId(productoId);
                item.setNombre(prod.getNombre());
                item.setMarca(prod.getMarca());
                item.setPrecio(prod.getPrecio());
                item.setPrecioDescuento(prod.getPrecioDescuento());
                item.setCantidad(cantidad);
                item.setTalla(talla);
                item.setColor(color);
                item.setImagen(prod.getImagenes() != null && !prod.getImagenes().isEmpty() ? prod.getImagenes().get(0) : "");
                item.setVendedorNombre(prod.getVendedorNombre());
                item.setEmpresaId(prod.getEmpresaId());
                carrito.add(item);
            }

            u.setCarrito(carrito);
            usuarioRepo.save(u);

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("exito",   true);
            res.put("mensaje", "Producto agregado al carrito.");
            res.put("carrito", Map.of("usuarioId", usuarioId, "items", carrito));
            return ResponseEntity.ok(res);
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/carrito/cantidad
    @PutMapping("/cantidad")
    public ResponseEntity<?> actualizarCantidad(@RequestBody Map<String, Object> body) {
        String usuarioId  = (String) body.get("usuarioId");
        String productoId = (String) body.get("productoId");
        String talla      = (String) body.get("talla");
        String color      = (String) body.get("color");
        int    cantidad   = ((Number) body.get("cantidad")).intValue();

        return usuarioRepo.findById(usuarioId).map(u -> {
            List<ItemCarrito> carrito = new ArrayList<>(u.getCarrito());
            carrito.stream()
                .filter(i -> i.getProductoId().equals(productoId)
                          && Objects.equals(i.getTalla(), talla)
                          && Objects.equals(i.getColor(), color))
                .findFirst()
                .ifPresent(i -> i.setCantidad(cantidad));
            u.setCarrito(carrito);
            usuarioRepo.save(u);
            return ResponseEntity.ok(Map.of("exito", true, "carrito",
                Map.of("usuarioId", usuarioId, "items", carrito)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/carrito/item
    @DeleteMapping("/item")
    public ResponseEntity<?> eliminarItem(@RequestBody Map<String, Object> body) {
        String usuarioId  = (String) body.get("usuarioId");
        String productoId = (String) body.get("productoId");
        String talla      = (String) body.get("talla");
        String color      = (String) body.get("color");

        return usuarioRepo.findById(usuarioId).map(u -> {
            List<ItemCarrito> carrito = new ArrayList<>(u.getCarrito());
            carrito.removeIf(i -> i.getProductoId().equals(productoId)
                               && Objects.equals(i.getTalla(), talla)
                               && Objects.equals(i.getColor(), color));
            u.setCarrito(carrito);
            usuarioRepo.save(u);
            return ResponseEntity.ok(Map.of("exito", true, "carrito",
                Map.of("usuarioId", usuarioId, "items", carrito)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/carrito?usuarioId=xxx — vaciar
    @DeleteMapping
    public ResponseEntity<?> vaciar(@RequestParam String usuarioId) {
        return usuarioRepo.findById(usuarioId).map(u -> {
            u.setCarrito(new ArrayList<>());
            usuarioRepo.save(u);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Carrito vaciado."));
        }).orElse(ResponseEntity.notFound().build());
    }
}
