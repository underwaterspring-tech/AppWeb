package com.underwater.app.controller;

import com.underwater.app.model.*;
import com.underwater.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private EmpresaRepository empresaRepo;
    @Autowired private PedidoRepository  pedidoRepo;
    @Autowired private MongoTemplate     mongoTemplate;

    // ═══════════════════════ USUARIOS ═══════════════════════════

    @GetMapping("/usuarios")
    public ResponseEntity<List<Map<String, Object>>> listarUsuarios(
            @RequestParam(defaultValue = "COMPRADOR") String rol) {
        return ResponseEntity.ok(
            usuarioRepo.findAll().stream()
                .filter(u -> "todos".equalsIgnoreCase(rol) || rol.equalsIgnoreCase(u.getRol()))
                .map(this::usuarioAMapa)
                .toList()
        );
    }

    @PutMapping("/usuarios/{id}/suspender")
    public ResponseEntity<?> suspender(@PathVariable String id) {
        return usuarioRepo.findById(id).map(u -> {
            u.setActivo(false);
            usuarioRepo.save(u);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Usuario suspendido."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/usuarios/{id}/activar")
    public ResponseEntity<?> activar(@PathVariable String id) {
        return usuarioRepo.findById(id).map(u -> {
            u.setActivo(true);
            usuarioRepo.save(u);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Usuario activado."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ═══════════════════════ EMPRESAS ════════════════════════════

    @GetMapping("/empresas")
    public ResponseEntity<List<Map<String, Object>>> listarEmpresas(
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(
            empresaRepo.findAll().stream()
                .filter(e -> estado == null || estado.equalsIgnoreCase(e.getEstado()))
                .map(this::empresaAMapa)
                .toList()
        );
    }

    @PutMapping("/empresas/{id}/estado")
    public ResponseEntity<?> cambiarEstadoEmpresa(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado").toUpperCase();
        return empresaRepo.findById(id).map(e -> {
            e.setEstado(nuevoEstado);
            e.setActivo("APROBADA".equals(nuevoEstado));

            // Si se aprueba, activar también al usuario vendedor
            if ("APROBADA".equals(nuevoEstado) && e.getUsuarioId() != null) {
                usuarioRepo.findById(e.getUsuarioId()).ifPresent(u -> {
                    u.setActivo(true);
                    usuarioRepo.save(u);
                });
            }
            empresaRepo.save(e);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Estado actualizado a " + nuevoEstado));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ═══════════════════════ PRODUCTOS ═══════════════════════════

    @GetMapping("/productos")
    public ResponseEntity<List<Map<String, Object>>> listarProductos() {
        List<Map> raw = mongoTemplate.findAll(Map.class, "productos");
        return ResponseEntity.ok(raw.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("_id",          p.get("_id"));
            m.put("nombre",       p.getOrDefault("nombre", ""));
            m.put("empresaNombre",p.getOrDefault("vendedorNombre", p.getOrDefault("empresaNombre", "")));
            m.put("categoria",    p.getOrDefault("categoria", ""));
            m.put("precio",       p.getOrDefault("precio", 0));
            m.put("precioCOP",    p.getOrDefault("precio", 0));
            m.put("stock",        p.getOrDefault("stock", 0));
            m.put("estado",       p.getOrDefault("estado", "ACTIVO"));
            m.put("publicado",    p.getOrDefault("publicado", true));
            m.put("empresaId",    p.getOrDefault("empresaId", ""));
            m.put("vendedorId",   p.getOrDefault("vendedorId", ""));
            return m;
        }).toList());
    }

    @PutMapping("/productos/{id}/estado")
    public ResponseEntity<?> cambiarEstadoProducto(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String estado   = body.get("estado").toUpperCase();
        boolean publicado = "ACTIVO".equals(estado);

        Update update = new Update().set("estado", estado).set("publicado", publicado);
        Query  query  = new Query(Criteria.where("_id").is(id));
        mongoTemplate.updateFirst(query, update, "productos");

        return ResponseEntity.ok(Map.of("exito", true, "estado", estado));
    }

    // ═══════════════════════ PEDIDOS ═════════════════════════════

    @GetMapping("/pedidos")
    public ResponseEntity<List<Pedido>> listarPedidos() {
        List<Pedido> pedidos = pedidoRepo.findAll();
        pedidos.sort(Comparator.comparing(Pedido::getFechaPedido,
            Comparator.nullsLast(Comparator.reverseOrder())));
        return ResponseEntity.ok(pedidos);
    }

    @PutMapping("/pedidos/{id}/estado")
    public ResponseEntity<?> cambiarEstadoPedido(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return pedidoRepo.findById(id).map(p -> {
            p.setEstado(body.get("estado").toUpperCase());
            pedidoRepo.save(p);
            return ResponseEntity.ok(Map.of("exito", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ═══════════════════════ STATS / DASHBOARD ═══════════════════

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalUsuarios",  usuarioRepo.count());
        m.put("totalEmpresas",  empresaRepo.count());
        m.put("totalProductos", mongoTemplate.count(new Query(), "productos"));
        m.put("totalPedidos",   pedidoRepo.count());
        m.put("empresasPendientes",
            empresaRepo.findAll().stream()
                .filter(e -> "PENDIENTE".equalsIgnoreCase(e.getEstado())).count());
        return ResponseEntity.ok(m);
    }

    // ═══════════════════════ HELPERS ═════════════════════════════

    private Map<String, Object> usuarioAMapa(Usuario u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id",          u.getId());
        m.put("nombre",       nvl(u.getNombre()));
        m.put("correo",       nvl(u.getEmail()));
        m.put("telefono",     nvl(u.getTelefono()));
        m.put("direccion",    nvl(u.getDireccion()));
        m.put("rol",          nvl(u.getRol()));
        m.put("activo",       u.isActivo());
        m.put("fechaRegistro",nvl(u.getFechaRegistro()));
        return m;
    }

    private Map<String, Object> empresaAMapa(Empresa e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id",             e.getId());
        m.put("nombreEmpresa",   nvl(e.getNombre()));
        m.put("nit",             nvl(e.getNit()));
        m.put("ciudad",          nvl(e.getCiudad()));
        m.put("direccion",       nvl(e.getDireccion()));
        m.put("nombreEncargado", nvl(e.getNombreEncargado()));
        m.put("correo",          nvl(e.getCorreo()));
        m.put("telefono",        nvl(e.getTelefono()));
        m.put("rol",             nvl(e.getRol()));
        m.put("estado",          nvl(e.getEstado()) .isEmpty() ? "PENDIENTE" : e.getEstado());
        m.put("activo",          e.isActivo());
        m.put("fechaRegistro",   nvl(e.getFechaRegistro()));
        m.put("usuarioId",       nvl(e.getUsuarioId()));
        return m;
    }

    private String nvl(String s) { return s != null ? s : ""; }
}
