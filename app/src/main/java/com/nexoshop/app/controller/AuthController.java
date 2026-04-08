package com.nexoshop.app.controller;

import com.nexoshop.app.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// ============================================================
// CONTROLADOR: AuthController
// Expone los endpoints REST que consume el frontend
//
//   POST /api/auth/registro  ← recibe datos del formulario
//   POST /api/auth/login     ← recibe email + password
// ============================================================
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;


    // ── POST /api/auth/registro ────────────────────────────────
    /**
     * Recibe el JSON del formulario de registro y crea el usuario en MongoDB.
     *
     * JSON esperado (COMPRADOR):
     * {
     *   "nombre":   "Juan Pérez",
     *   "email":    "juan@ejemplo.com",
     *   "telefono": "3001234567",
     *   "password": "MiClave123",
     *   "rol":      "COMPRADOR"
     * }
     *
     * JSON esperado (VENDEDOR) — agrega el objeto "empresa":
     * {
     *   "nombre":   "Ana López",
     *   "email":    "ana@zapatos.com",
     *   "telefono": "3107654321",
     *   "password": "EmpresaSegura1",
     *   "rol":      "VENDEDOR",
     *   "empresa": {
     *     "nombre": "ZapatoStyle SAS",
     *     "nit":    "900.123.456-7",
     *     "ciudad": "medellin"
     *   }
     * }
     */
    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registro(@RequestBody Map<String, Object> datos) {
        Map<String, Object> resultado = authService.registrar(datos);

        // Si el registro falló (email duplicado, etc.) devolvemos 400
        if (!(boolean) resultado.get("exito")) {
            return ResponseEntity.badRequest().body(resultado);
        }

        // 201 Created en caso de éxito
        return ResponseEntity.status(201).body(resultado);
    }


    // ── POST /api/auth/login ──────────────────────────────────
    /**
     * Verifica las credenciales y devuelve los datos del usuario.
     *
     * JSON esperado:
     * {
     *   "email":    "juan@ejemplo.com",
     *   "password": "MiClave123"
     * }
     *
     * Respuesta exitosa:
     * {
     *   "exito":   true,
     *   "id":      "abc123...",
     *   "nombre":  "Juan Pérez",
     *   "email":   "juan@ejemplo.com",
     *   "rol":     "COMPRADOR",
     *   "mensaje": "Bienvenido, Juan Pérez."
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> credenciales) {
        String email    = (String) credenciales.get("email");
        String password = (String) credenciales.get("password");

        Map<String, Object> resultado = authService.login(email, password);

        // Credenciales incorrectas o vendedor no aprobado → 401
        if (!(boolean) resultado.get("exito")) {
            return ResponseEntity.status(401).body(resultado);
        }

        return ResponseEntity.ok(resultado);
    }
}