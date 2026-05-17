package com.underwater.app.controller;

import com.underwater.app.model.*;
import com.underwater.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/comprador")
public class CompradorController {

    @Autowired private UsuarioRepository  usuarioRepo;
    @Autowired private ProductoRepository productoRepo;

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    // GET /api/comprador/perfil?usuarioId=xxx
    @GetMapping("/perfil")
    public ResponseEntity<?> perfil(@RequestParam String usuarioId) {
        return usuarioRepo.findById(usuarioId).map(u -> {
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("id",            u.getId());
            res.put("nombre",        u.getNombre());
            res.put("email",         u.getEmail());
            res.put("telefono",      u.getTelefono());
            res.put("direccion",     u.getDireccion());
            res.put("rol",           u.getRol());
            res.put("fechaRegistro", u.getFechaRegistro());
            return ResponseEntity.ok(res);
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/comprador/perfil
    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(@RequestBody Map<String, String> body) {
        String id = body.get("usuarioId");
        return usuarioRepo.findById(id).map(u -> {
            if (body.get("nombre")    != null) u.setNombre(body.get("nombre"));
            if (body.get("telefono")  != null) u.setTelefono(body.get("telefono"));
            if (body.get("direccion") != null) u.setDireccion(body.get("direccion"));
            usuarioRepo.save(u);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Perfil actualizado."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/comprador/cambiar-password
    @PutMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> body) {
        String id     = body.get("usuarioId");
        String actual = body.get("passwordActual");
        String nueva  = body.get("passwordNueva");

        return usuarioRepo.findById(id).map(u -> {
            String hash = u.getPassword();
            boolean ok  = (hash != null && hash.startsWith("$2a$"))
                ? bcrypt.matches(actual, hash) : actual.equals(hash);
            if (!ok) return ResponseEntity.status(401)
                .body(Map.of("exito", false, "mensaje", "La contraseña actual es incorrecta."));
            u.setPassword(bcrypt.encode(nueva));
            usuarioRepo.save(u);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Contraseña actualizada."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // POST /api/comprador/resenas — agrega reseña dentro del producto
    @PostMapping("/resenas")
    public ResponseEntity<?> crearResena(@RequestBody Map<String, Object> body) {
        String productoId    = (String) body.get("productoId");
        String usuarioId     = (String) body.get("usuarioId");
        String nombreUsuario = (String) body.get("nombreUsuario");
        int    valoracion    = ((Number) body.get("valoracion")).intValue();
        String comentario    = (String) body.get("comentario");

        return productoRepo.findById(productoId).map(p -> {
            Resena resena = new Resena(usuarioId, nombreUsuario, valoracion, comentario);
            List<Resena> resenas = new ArrayList<>(p.getResenas());
            resenas.add(resena);
            p.setResenas(resenas);
            p.recalcularPromedio();
            productoRepo.save(p);
            return ResponseEntity.status(201).body(Map.of(
                "exito",    true,
                "mensaje",  "Reseña publicada.",
                "promedio", p.getValoracionPromedio(),
                "total",    p.getTotalResenas()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET /api/comprador/resenas?productoId=xxx — obtener reseñas del producto
    @GetMapping("/resenas")
    public ResponseEntity<?> resenasPorProducto(@RequestParam String productoId) {
        return productoRepo.findById(productoId).map(p ->
            ResponseEntity.ok(Map.of(
                "resenas",  p.getResenas(),
                "promedio", p.getValoracionPromedio(),
                "total",    p.getTotalResenas()
            ))
        ).orElse(ResponseEntity.notFound().build());
    }
}
