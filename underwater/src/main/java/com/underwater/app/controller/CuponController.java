package com.underwater.app.controller;

import com.underwater.app.model.Cupon;
import com.underwater.app.repository.CuponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/cupones")
public class CuponController {

    @Autowired private CuponRepository cuponRepo;

    // ── POST /api/cupones/validar — comprador valida un cupón ────
    @PostMapping("/validar")
    public ResponseEntity<?> validar(@RequestBody Map<String, Object> body) {
        String codigo   = ((String) body.get("codigo")).toUpperCase().trim();
        int    subtotal = body.get("subtotal") != null
            ? ((Number) body.get("subtotal")).intValue() : 0;

        Optional<Cupon> opt = cuponRepo.findByCodigoActivo(codigo);
        if (opt.isEmpty())
            return ResponseEntity.ok(Map.of("valido", false, "mensaje", "Cupón inválido o expirado."));

        Cupon c = opt.get();

        if (c.getFechaExpiracion() != null && c.getFechaExpiracion().isBefore(LocalDateTime.now()))
            return ResponseEntity.ok(Map.of("valido", false, "mensaje", "Este cupón ha expirado."));

        if (subtotal < c.getMinimoCompra())
            return ResponseEntity.ok(Map.of(
                "valido", false,
                "mensaje", "Compra mínima de $" + String.format("%,d", c.getMinimoCompra()) + " para usar este cupón."
            ));

        if (c.getUsoMaximo() > 0 && c.getUsoActual() >= c.getUsoMaximo())
            return ResponseEntity.ok(Map.of("valido", false, "mensaje", "Este cupón ya agotó sus usos."));

        int descuento = "PORCENTAJE".equalsIgnoreCase(c.getTipo())
            ? (int) Math.round(subtotal * c.getValor() / 100.0)
            : Math.min(c.getValor(), subtotal);

        return ResponseEntity.ok(Map.of(
            "valido",      true,
            "tipo",        c.getTipo(),
            "valor",       c.getValor(),
            "descuento",   descuento,
            "descripcion", c.getDescripcion() != null ? c.getDescripcion() : "",
            "mensaje",     "✓ Cupón aplicado: " + (c.getDescripcion() != null ? c.getDescripcion() : c.getCodigo())
        ));
    }

    // ── GET /api/cupones/vendedor?vendedorId=xxx ─────────────────
    @GetMapping("/vendedor")
    public ResponseEntity<?> misCupones(@RequestParam String vendedorId) {
        List<Cupon> cupones = cuponRepo.findByVendedorId(vendedorId);
        return ResponseEntity.ok(cupones);
    }

    // ── POST /api/cupones/usar — incrementar usoActual al confirmar pedido ──
    @PostMapping("/usar")
    public ResponseEntity<?> usarCupon(@RequestBody Map<String, Object> body) {
        String codigo = body.get("codigo") != null
            ? ((String) body.get("codigo")).toUpperCase().trim() : null;
        if (codigo == null)
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Código requerido."));

        Optional<Cupon> opt = cuponRepo.findByCodigoActivo(codigo);
        if (opt.isEmpty())
            return ResponseEntity.ok(Map.of("exito", false, "mensaje", "Cupón no encontrado."));

        Cupon c = opt.get();
        c.setUsoActual(c.getUsoActual() + 1);

        // Desactivar automáticamente si se agotaron los usos
        if (c.getUsoMaximo() > 0 && c.getUsoActual() >= c.getUsoMaximo())
            c.setActivo(false);

        cuponRepo.save(c);
        return ResponseEntity.ok(Map.of("exito", true, "usoActual", c.getUsoActual()));
    }

    // ── POST /api/cupones/crear — vendedor crea un cupón ─────────
    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        String vendedorId     = (String) body.get("vendedorId");
        String vendedorNombre = (String) body.get("vendedorNombre");
        String empresaId      = (String) body.get("empresaId");
        String codigo         = body.get("codigo") != null
            ? ((String) body.get("codigo")).toUpperCase().trim() : null;

        if (codigo == null || codigo.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "El código es requerido."));

        // Verificar que el código no existe
        if (cuponRepo.findByCodigoActivo(codigo).isPresent())
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Ese código ya existe."));

        Cupon c = new Cupon();
        c.setCodigo(codigo);
        c.setTipo(body.get("tipo") != null ? ((String) body.get("tipo")).toUpperCase() : "PORCENTAJE");
        c.setValor(body.get("valor") != null ? ((Number) body.get("valor")).intValue() : 0);
        c.setDescripcion((String) body.get("descripcion"));
        c.setMinimoCompra(body.get("minimoCompra") != null ? ((Number) body.get("minimoCompra")).intValue() : 0);
        c.setUsoMaximo(body.get("usoMaximo") != null ? ((Number) body.get("usoMaximo")).intValue() : 100);
        c.setUsoActual(0);
        c.setActivo(true);
        c.setVendedorId(vendedorId);
        c.setVendedorNombre(vendedorNombre);
        c.setEmpresaId(empresaId);
        c.setFechaCreacion(LocalDateTime.now());

        if (body.get("fechaExpiracion") != null) {
            try {
                c.setFechaExpiracion(LocalDateTime.parse((String) body.get("fechaExpiracion") + "T23:59:59"));
            } catch (Exception e) {
                c.setFechaExpiracion(LocalDateTime.now().plusMonths(1));
            }
        } else {
            c.setFechaExpiracion(LocalDateTime.now().plusMonths(1));
        }

        Cupon guardado = cuponRepo.save(c);
        return ResponseEntity.status(201).body(Map.of(
            "exito",   true,
            "id",      guardado.getId(),
            "mensaje", "Cupón '" + codigo + "' creado exitosamente."
        ));
    }

    // ── PUT /api/cupones/{id}/toggle — activar/desactivar ────────
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable String id, @RequestParam String vendedorId) {
        return cuponRepo.findById(id).map(c -> {
            if (!vendedorId.equals(c.getVendedorId()))
                return ResponseEntity.status(403).body(Map.of("exito", false, "mensaje", "No autorizado."));
            c.setActivo(!c.isActivo());
            cuponRepo.save(c);
            return ResponseEntity.ok(Map.of("exito", true, "activo", c.isActivo(),
                "mensaje", c.isActivo() ? "Cupón activado." : "Cupón desactivado."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE /api/cupones/{id} — eliminar ──────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id, @RequestParam String vendedorId) {
        return cuponRepo.findById(id).map(c -> {
            if (!vendedorId.equals(c.getVendedorId()))
                return ResponseEntity.status(403).body(Map.of("exito", false, "mensaje", "No autorizado."));
            cuponRepo.delete(c);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Cupón eliminado."));
        }).orElse(ResponseEntity.notFound().build());
    }
}
