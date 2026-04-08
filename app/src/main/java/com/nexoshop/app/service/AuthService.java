package com.nexoshop.app.service;

import com.nexoshop.app.model.Admin;
import com.nexoshop.app.model.Usuario;
import com.nexoshop.app.model.Usuario.DatosEmpresa;
import com.nexoshop.app.repository.AdminRepository;
import com.nexoshop.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

// ============================================================
// SERVICIO: AuthService
//
// FLUJO DE LOGIN:
//   1. Busca en BD "admin" coleccion "admins" por campo "Correo"
//      -> contrasena en texto plano -> rol ADMIN -> /panel-admin
//   2. Si no es admin, busca en BD "usuario" coleccion "usuarios"
//      por campo "correo" (minuscula)
//      -> contrasena puede ser texto plano O BCrypt
//      -> COMPRADOR -> /   |   VENDEDOR -> /panel-vendedor
//
// DETECCION DE CONTRASENA:
//   Los usuarios existentes tienen password en texto plano.
//   Los nuevos registros usan BCrypt.
//   Se detecta si el hash empieza con "$2a$" para saber cual usar.
// ============================================================
@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder encriptador = new BCryptPasswordEncoder();

    // ── REGISTRO ──────────────────────────────────────────────
    public Map<String, Object> registrar(Map<String, Object> datos) {
        Map<String, Object> resultado = new HashMap<>();

        String email = (String) datos.get("email");
        String rol   = (String) datos.get("rol");

        if (usuarioRepository.existsByEmail(email)) {
            resultado.put("exito",   false);
            resultado.put("mensaje", "El correo " + email + " ya esta registrado.");
            return resultado;
        }

        // Nuevos registros usan BCrypt
        String passwordEncriptado = encriptador.encode((String) datos.get("password"));

        Usuario nuevoUsuario;

        if ("VENDEDOR".equals(rol)) {
            @SuppressWarnings("unchecked")
            Map<String, String> datosEmpresa = (Map<String, String>) datos.get("empresa");
            DatosEmpresa empresa = new DatosEmpresa(
                datosEmpresa.get("nombre"),
                datosEmpresa.get("nit"),
                datosEmpresa.get("ciudad")
            );
            nuevoUsuario = new Usuario(
                (String) datos.get("nombre"), email,
                (String) datos.get("telefono"), passwordEncriptado, empresa
            );
        } else {
            nuevoUsuario = new Usuario(
                (String) datos.get("nombre"), email,
                (String) datos.get("telefono"), passwordEncriptado
            );
        }

        usuarioRepository.save(nuevoUsuario);

        resultado.put("exito",  true);
        resultado.put("rol",    nuevoUsuario.getRol());
        resultado.put("activo", nuevoUsuario.isActivo());
        resultado.put("mensaje", "VENDEDOR".equals(rol)
            ? "Empresa registrada. El administrador la revisara en maximo 24 horas."
            : "Cuenta creada exitosamente. Bienvenido a NexoShop!");

        return resultado;
    }

    // ── LOGIN ─────────────────────────────────────────────────
    public Map<String, Object> login(String email, String password) {
        Map<String, Object> resultado = new HashMap<>();

        // PASO 1: verificar si es ADMIN (BD "admin", campo "Correo")
        Optional<Admin> adminOpt = adminRepository.findByCorreo(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            // Admins tienen password en texto plano
            if (!password.equals(admin.getPassword())) {
                resultado.put("exito",   false);
                resultado.put("mensaje", "Correo o contrasena incorrectos.");
                return resultado;
            }
            resultado.put("exito",  true);
            resultado.put("id",     admin.getId());
            resultado.put("nombre", admin.getNombre());
            resultado.put("email",  admin.getCorreo());
            resultado.put("rol",    "ADMIN");
            resultado.put("mensaje","Bienvenido, " + admin.getNombre() + ".");
            return resultado;
        }

        // PASO 2: verificar si es USUARIO (BD "usuario", campo "correo")
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            resultado.put("exito",   false);
            resultado.put("mensaje", "Correo o contrasena incorrectos.");
            return resultado;
        }

        Usuario usuario = usuarioOpt.get();
        String hashGuardado = usuario.getPassword();

        // Detectar si la contrasena esta en BCrypt o texto plano
        boolean passwordCorrecta;
        if (hashGuardado != null && hashGuardado.startsWith("$2a$")) {
            // Contrasena nueva -> verificar con BCrypt
            passwordCorrecta = encriptador.matches(password, hashGuardado);
        } else {
            // Contrasena vieja -> comparacion directa (texto plano)
            passwordCorrecta = password.equals(hashGuardado);
        }

        if (!passwordCorrecta) {
            resultado.put("exito",   false);
            resultado.put("mensaje", "Correo o contrasena incorrectos.");
            return resultado;
        }

        // Vendedor pendiente de aprobacion
        if ("VENDEDOR".equals(usuario.getRol()) && !usuario.isActivo()) {
            resultado.put("exito",   false);
            resultado.put("mensaje", "Tu empresa esta pendiente de aprobacion. Te notificaremos por email.");
            return resultado;
        }

        resultado.put("exito",  true);
        resultado.put("id",     usuario.getId());
        resultado.put("nombre", usuario.getNombre());
        resultado.put("email",  usuario.getEmail());
        resultado.put("rol",    usuario.getRol() != null ? usuario.getRol() : "COMPRADOR");
        resultado.put("mensaje","Bienvenido, " + usuario.getNombre() + ".");
        return resultado;
    }
}
