package com.nexoshop.app.controller;

import com.nexoshop.app.model.Usuario;
import com.nexoshop.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

// ============================================================
// CONTROLADOR: AdminController
// Expone endpoints REST para el panel de administración
//
//   GET  /api/admin/usuarios              ← listar todos
//   GET  /api/admin/usuarios?rol=COMPRADOR ← filtrar por rol
//   PUT  /api/admin/usuarios/{id}/suspender
//   PUT  /api/admin/usuarios/{id}/activar
// ============================================================
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")   // ajusta el origen en producción
public class AdminController {

    @Autowired
    private UsuarioRepository usuarioRepository;


    // ── GET /api/admin/usuarios ────────────────────────────────
    /**
     * Devuelve la lista de usuarios.
     * Parámetro opcional ?rol=COMPRADOR o ?rol=VENDEDOR
     *
     * Respuesta: array de objetos Usuario (sin password)
     */
    @GetMapping("/usuarios")
    public ResponseEntity<List<Map<String, Object>>> listarUsuarios(
            @RequestParam(required = false) String rol) {

        List<Usuario> usuarios = usuarioRepository.findAll();

        // Filtramos por rol si se especificó
        List<Map<String, Object>> resultado = usuarios.stream()
            .filter(u -> rol == null || rol.equalsIgnoreCase(u.getRol()))
            .map(this::usuarioAMapa)
            .toList();

        return ResponseEntity.ok(resultado);
    }


    // ── PUT /api/admin/usuarios/{id}/suspender ─────────────────
    /**
     * Marca al usuario como inactivo (activo = false)
     */
    @PutMapping("/usuarios/{id}/suspender")
    public ResponseEntity<Map<String, Object>> suspenderUsuario(@PathVariable String id) {
        Optional<Usuario> opt = usuarioRepository.findById(id);

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = opt.get();
        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
            "exito",   true,
            "mensaje", "Usuario suspendido correctamente.",
            "usuario", usuarioAMapa(usuario)
        ));
    }


    // ── PUT /api/admin/usuarios/{id}/activar ───────────────────
    /**
     * Reactiva un usuario suspendido (activo = true)
     */
    @PutMapping("/usuarios/{id}/activar")
    public ResponseEntity<Map<String, Object>> activarUsuario(@PathVariable String id) {
        Optional<Usuario> opt = usuarioRepository.findById(id);

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = opt.get();
        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
            "exito",   true,
            "mensaje", "Usuario reactivado correctamente.",
            "usuario", usuarioAMapa(usuario)
        ));
    }


    // ── Utilidad: convierte Usuario a Map sin exponer password ─
    private Map<String, Object> usuarioAMapa(Usuario u) {
        return Map.of(
            "id",             u.getId(),
            "nombre",         u.getNombre()         != null ? u.getNombre()    : "",
            "email",          u.getEmail()           != null ? u.getEmail()     : "",
            "telefono",       u.getTelefono()        != null ? u.getTelefono()  : "",
            "rol",            u.getRol()             != null ? u.getRol()       : "",
            "activo",         u.isActivo(),
            "fechaRegistro",  u.getFechaRegistro()   != null ? u.getFechaRegistro().toString() : ""
        );
    }
}