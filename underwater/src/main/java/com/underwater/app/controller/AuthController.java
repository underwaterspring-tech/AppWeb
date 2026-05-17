package com.underwater.app.controller;

import com.underwater.app.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registro(@RequestBody Map<String, Object> datos) {
        Map<String, Object> res = authService.registrar(datos);
        if (!(boolean) res.get("exito")) return ResponseEntity.badRequest().body(res);
        return ResponseEntity.status(201).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> body) {
        String email    = (String) body.get("email");
        String password = (String) body.get("password");
        if (email == null || email.isBlank() || password == null || password.isBlank())
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Email y contraseña requeridos."));
        Map<String, Object> res = authService.login(email.trim(), password);
        if (!(boolean) res.get("exito")) return ResponseEntity.status(401).body(res);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sesion")
    public ResponseEntity<Map<String, Object>> sesion() {
        return ResponseEntity.ok(Map.of("autenticado", false));
    }
}
