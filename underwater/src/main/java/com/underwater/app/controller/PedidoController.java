package com.underwater.app.controller;

import com.underwater.app.model.*;
import com.underwater.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired private PedidoRepository  pedidoRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    // GET /api/pedidos?usuarioId=xxx
    @GetMapping
    public ResponseEntity<List<Pedido>> misPedidos(@RequestParam String usuarioId) {
        List<Pedido> pedidos = pedidoRepo.findByUsuarioId(usuarioId);
        pedidos.sort(Comparator.comparing(Pedido::getFechaPedido,
            Comparator.nullsLast(Comparator.reverseOrder())));
        return ResponseEntity.ok(pedidos);
    }

    // GET /api/pedidos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> detalle(@PathVariable String id) {
        return pedidoRepo.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/pedidos — crear desde carrito embebido del usuario
    @SuppressWarnings("unchecked")
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        String usuarioId     = (String) body.get("usuarioId");
        String nombreUsuario = (String) body.get("nombreUsuario");
        String correo        = (String) body.get("correoUsuario");
        String metodoPago    = (String) body.get("metodoPago");

        // Dirección de entrega
        Map<String, String> dirMap = (Map<String, String>) body.get("direccionEntrega");
        DireccionEntrega dir = new DireccionEntrega();
        if (dirMap != null) {
            dir.setNombre(dirMap.get("nombre"));
            dir.setLinea(dirMap.get("linea"));
            dir.setCiudad(dirMap.get("ciudad"));
            dir.setDepartamento(dirMap.get("departamento"));
            dir.setTelefono(dirMap.get("telefono"));
        }

        // Obtener carrito del usuario
        Optional<Usuario> uOpt = usuarioRepo.findById(usuarioId);
        if (uOpt.isEmpty()) return ResponseEntity.notFound().build();

        Usuario usuario = uOpt.get();
        List<ItemCarrito> carritoItems = usuario.getCarrito();

        if (carritoItems == null || carritoItems.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "El carrito está vacío."));

        // Convertir items del carrito a items del pedido
        List<ItemPedido> items = carritoItems.stream().map(i -> {
            ItemPedido ip = new ItemPedido();
            ip.setProductoId(i.getProductoId());
            ip.setNombre(i.getNombre());
            ip.setMarca(i.getMarca());
            int precioReal = (i.getPrecioDescuento() != null && i.getPrecioDescuento() > 0)
                ? i.getPrecioDescuento() : i.getPrecio();
            ip.setPrecio(precioReal);
            ip.setCantidad(i.getCantidad());
            ip.setTalla(i.getTalla());
            ip.setColor(i.getColor());
            ip.setSubtotal(precioReal * i.getCantidad());
            ip.setVendedorNombre(i.getVendedorNombre());
            ip.setEmpresaId(i.getEmpresaId());
            return ip;
        }).collect(Collectors.toList());

        int subtotal  = items.stream().mapToInt(ItemPedido::getSubtotal).sum();
        int descuento = body.get("descuento") != null ? ((Number) body.get("descuento")).intValue() : 0;
        int total     = subtotal - descuento;

        Pedido pedido = new Pedido();
        pedido.setUsuarioId(usuarioId);
        pedido.setNombreUsuario(nombreUsuario);
        pedido.setCorreoUsuario(correo);
        pedido.setDireccionEntrega(dir);
        pedido.setItems(items);
        pedido.setSubtotal(subtotal);
        pedido.setDescuento(descuento);
        pedido.setEnvio(0);
        pedido.setTotal(total);
        pedido.setMetodoPago(metodoPago);
        pedido.setEstado("PROCESANDO");
        pedido.setFechaPedido(LocalDateTime.now());

        Pedido guardado = pedidoRepo.save(pedido);

        // Vaciar carrito del usuario
        usuario.setCarrito(new ArrayList<>());
        usuarioRepo.save(usuario);

        return ResponseEntity.status(201).body(Map.of(
            "exito",   true,
            "id",      guardado.getId(),
            "total",   total,
            "mensaje", "¡Pedido realizado exitosamente!"
        ));
    }

    // PUT /api/pedidos/{id}/cancelar
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable String id, @RequestParam String usuarioId) {
        Optional<Pedido> opt = pedidoRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Pedido pedido = opt.get();
        if (!pedido.getUsuarioId().equals(usuarioId))
            return ResponseEntity.status(403).body(Map.of("error", "No autorizado."));
        if ("ENVIADO".equals(pedido.getEstado()) || "ENTREGADO".equals(pedido.getEstado()))
            return ResponseEntity.badRequest().body(Map.of("error", "No se puede cancelar un pedido ya enviado."));
        pedido.setEstado("CANCELADO");
        pedidoRepo.save(pedido);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Pedido cancelado."));
    }
}
