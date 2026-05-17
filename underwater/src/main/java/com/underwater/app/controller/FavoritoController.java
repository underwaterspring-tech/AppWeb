package com.underwater.app.controller;

import com.underwater.app.model.*;
import com.underwater.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    @Autowired private UsuarioRepository  usuarioRepo;
    @Autowired private ProductoRepository productoRepo;

    // Busca usuario por id, con log para diagnosticar
    private Optional<Usuario> buscarUsuario(String usuarioId) {
        if (usuarioId == null) return Optional.empty();
        String uid = usuarioId.trim();
        Optional<Usuario> u = usuarioRepo.findById(uid);
        if (u.isEmpty()) {
            System.err.println("[Favoritos] Usuario NO encontrado por id: '" + uid + "' (len=" + uid.length() + ")");
            // Listar los primeros usuarios para comparar
            usuarioRepo.findAll().stream().limit(3).forEach(usr ->
                System.err.println("  BD id: '" + usr.getId() + "' nombre: " + usr.getNombre())
            );
        }
        return u;
    }

    // GET /api/favoritos?usuarioId=xxx
    @GetMapping
    public ResponseEntity<?> listar(@RequestParam String usuarioId) {
        Optional<Usuario> uOpt = buscarUsuario(usuarioId);
        if (uOpt.isEmpty()) return ResponseEntity.ok(List.of());

        Usuario u = uOpt.get();
        List<String> ids = u.getFavoritos();
        if (ids == null || ids.isEmpty()) return ResponseEntity.ok(List.of());

        List<Map<String, Object>> resultado = ids.stream().map(productoId -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("productoId", productoId);
            productoRepo.findById(productoId).ifPresent(p -> {
                item.put("nombre",          p.getNombre());
                item.put("marca",           p.getMarca());
                item.put("precio",          p.getPrecio());
                item.put("precioDescuento", p.getPrecioDescuento());
                item.put("imagenes",        p.getImagenes());
                item.put("colores",         p.getColores());
                item.put("vendedorNombre",  p.getVendedorNombre());
                item.put("estado",          p.getEstado());
            });
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }

    // POST /api/favoritos — agregar
    @PostMapping
    public ResponseEntity<?> agregar(@RequestBody Map<String, String> body) {
        String usuarioId  = body.get("usuarioId");
        String productoId = body.get("productoId");

        if (usuarioId == null || productoId == null)
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Datos incompletos."));

        Optional<Usuario> uOpt = buscarUsuario(usuarioId);
        if (uOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("exito", false, "mensaje", "Usuario no encontrado: " + usuarioId));

        Usuario u = uOpt.get();
        List<String> favs = new ArrayList<>(u.getFavoritos() != null ? u.getFavoritos() : new ArrayList<>());
        if (!favs.contains(productoId.trim())) {
            favs.add(productoId.trim());
            u.setFavoritos(favs);
            usuarioRepo.save(u);
        }
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Agregado a favoritos."));
    }

    // DELETE /api/favoritos — quitar
    @DeleteMapping
    public ResponseEntity<?> quitar(@RequestBody Map<String, String> body) {
        String usuarioId  = body.get("usuarioId");
        String productoId = body.get("productoId");

        if (usuarioId == null || productoId == null)
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Datos incompletos."));

        Optional<Usuario> uOpt = buscarUsuario(usuarioId);
        if (uOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("exito", false, "mensaje", "Usuario no encontrado."));

        Usuario u = uOpt.get();
        List<String> favs = new ArrayList<>(u.getFavoritos() != null ? u.getFavoritos() : new ArrayList<>());
        favs.remove(productoId.trim());
        u.setFavoritos(favs);
        usuarioRepo.save(u);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Eliminado de favoritos."));
    }

    // GET /api/favoritos/check
    @GetMapping("/check")
    public ResponseEntity<?> check(@RequestParam String usuarioId, @RequestParam String productoId) {
        Optional<Usuario> uOpt = buscarUsuario(usuarioId);
        if (uOpt.isEmpty()) return ResponseEntity.ok(Map.of("esFavorito", false));
        boolean esFav = uOpt.get().getFavoritos() != null && uOpt.get().getFavoritos().contains(productoId.trim());
        return ResponseEntity.ok(Map.of("esFavorito", esFav));
    }

    // GET /api/favoritos/debug?usuarioId=xxx — diagnóstico
    @GetMapping("/debug")
    public ResponseEntity<?> debug(@RequestParam String usuarioId) {
        String uid = usuarioId.trim();
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("idRecibido", uid);
        info.put("longitud", uid.length());
        Optional<Usuario> u = usuarioRepo.findById(uid);
        info.put("encontrado", u.isPresent());
        if (u.isPresent()) {
            info.put("nombre",    u.get().getNombre());
            info.put("email",     u.get().getEmail());
            info.put("favoritos", u.get().getFavoritos());
        } else {
            List<Map<String,String>> todos = usuarioRepo.findAll().stream().limit(5).map(us ->
                Map.of("id", String.valueOf(us.getId()), "nombre", String.valueOf(us.getNombre()))
            ).collect(Collectors.toList());
            info.put("primeros5Usuarios", todos);
        }
        return ResponseEntity.ok(info);
    }
}