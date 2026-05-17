package com.underwater.app.service;

import com.underwater.app.model.*;
import com.underwater.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AuthService {

    @Autowired private UsuarioRepository  usuarioRepo;
    @Autowired private AdminRepository    adminRepo;
    @Autowired private EmpresaRepository  empresaRepo;

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    // ── Protección brute force ───────────────────────────────────
    private static final int  MAX_INTENTOS = 5;
    private static final long BLOQUEO_MS   = 15 * 60 * 1000L;
    private final Map<String, AtomicInteger> intentos    = new ConcurrentHashMap<>();
    private final Map<String, Long>          bloqueadoHasta = new ConcurrentHashMap<>();

    private boolean estaBloqueado(String email) {
        Long hasta = bloqueadoHasta.get(email);
        if (hasta == null) return false;
        if (System.currentTimeMillis() < hasta) return true;
        bloqueadoHasta.remove(email); intentos.remove(email); return false;
    }
    private void registrarIntento(String email, boolean ok) {
        if (ok) { intentos.remove(email); bloqueadoHasta.remove(email); return; }
        AtomicInteger n = intentos.computeIfAbsent(email, k -> new AtomicInteger(0));
        if (n.incrementAndGet() >= MAX_INTENTOS)
            bloqueadoHasta.put(email, System.currentTimeMillis() + BLOQUEO_MS);
    }

    // ── REGISTRO ────────────────────────────────────────────────
    public Map<String, Object> registrar(Map<String, Object> datos) {
        Map<String, Object> res = new HashMap<>();
        String email = (String) datos.get("email");
        String rol   = (String) datos.get("rol");

        if (usuarioRepo.existsByEmail(email)) {
            res.put("exito",   false);
            res.put("mensaje", "El correo " + email + " ya está registrado.");
            return res;
        }

        String passHash = bcrypt.encode((String) datos.get("password"));

        if ("VENDEDOR".equals(rol)) {
            Usuario usuario = new Usuario(
                (String) datos.get("nombre"), email,
                (String) datos.get("telefono"), passHash
            );
            usuario.setRol("VENDEDOR");
            usuario.setActivo(false);
            Usuario guardado = usuarioRepo.save(usuario);

            @SuppressWarnings("unchecked")
            Map<String, String> emp = (Map<String, String>) datos.get("empresa");
            Empresa empresa = new Empresa(
                emp.get("nombre"), emp.get("nit"),
                emp.get("ciudad"), guardado.getId()
            );
            Empresa empresaGuardada = empresaRepo.save(empresa);

            res.put("exito",     true);
            res.put("id",        guardado.getId());
            res.put("nombre",    guardado.getNombre());
            res.put("email",     guardado.getEmail());
            res.put("rol",       "VENDEDOR");
            res.put("activo",    false);
            res.put("empresaId", empresaGuardada.getId());
            res.put("mensaje",   "Empresa registrada. El administrador la revisará en máximo 24 horas.");
        } else {
            Usuario usuario = new Usuario(
                (String) datos.get("nombre"), email,
                (String) datos.get("telefono"), passHash
            );
            usuarioRepo.save(usuario);
            res.put("exito",   true);
            res.put("rol",     "COMPRADOR");
            res.put("activo",  true);
            res.put("mensaje", "Cuenta creada exitosamente. ¡Bienvenido a Underwater!");
        }
        return res;
    }

    // ── LOGIN ────────────────────────────────────────────────────
    public Map<String, Object> login(String email, String password) {
        Map<String, Object> res = new HashMap<>();
        if (estaBloqueado(email)) { res.put("exito",false); res.put("mensaje","Demasiados intentos. Espera 15 minutos."); return res; }

        // 1. ¿Es admin?
        Optional<Admin> adminOpt = adminRepo.findByCorreo(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            // Admin puede tener password en texto plano o hasheada
            boolean ok = admin.getPassword().startsWith("$2a$")
                ? bcrypt.matches(password, admin.getPassword())
                : password.equals(admin.getPassword());

            if (!ok) {
                res.put("exito",   false);
                res.put("mensaje", "Correo o contraseña incorrectos.");
                return res;
            }
            res.put("exito",   true);
            res.put("id",      admin.getId());
            res.put("nombre",  admin.getNombre());
            res.put("email",   admin.getCorreo());
            res.put("rol",     "ADMIN");
            res.put("mensaje", "Bienvenido, " + admin.getNombre() + ".");
            return res;
        }

        // 2. ¿Es usuario normal?
        Optional<Usuario> uOpt = usuarioRepo.findByEmail(email);
        if (uOpt.isEmpty()) {
            res.put("exito",   false);
            res.put("mensaje", "Correo o contraseña incorrectos.");
            return res;
        }

        Usuario u = uOpt.get();
        String hash = u.getPassword();
        boolean ok  = (hash != null && hash.startsWith("$2a$"))
            ? bcrypt.matches(password, hash)
            : password.equals(hash);

        if (!ok) {
            res.put("exito",   false);
            res.put("mensaje", "Correo o contraseña incorrectos.");
            return res;
        }

        if ("VENDEDOR".equals(u.getRol()) && !u.isActivo()) {
            // Incluir id y empresaId para que el frontend pueda verificar el estado
            String empId = null;
            Optional<Empresa> empOpt = empresaRepo.findByUsuarioId(u.getId());
            if (empOpt.isPresent()) empId = empOpt.get().getId();

            res.put("exito",     false);
            res.put("pendiente", true);
            res.put("id",        u.getId());
            res.put("nombre",    u.getNombre());
            res.put("email",     u.getEmail());
            res.put("empresaId", empId);
            res.put("mensaje",   "Tu empresa está pendiente de aprobación.");
            return res;
        }

        if (!u.isActivo()) {
            res.put("exito",   false);
            res.put("mensaje", "Tu cuenta está suspendida. Contacta al soporte.");
            return res;
        }

        // Si es vendedor, incluir empresaId
        String empresaId = null;
        if ("VENDEDOR".equals(u.getRol())) {
            Optional<Empresa> emp = empresaRepo.findByUsuarioId(u.getId());
            if (emp.isPresent()) empresaId = emp.get().getId();
        }

        res.put("exito",     true);
        res.put("id",        u.getId());
        res.put("nombre",    u.getNombre());
        res.put("email",     u.getEmail());
        res.put("rol",       u.getRol() != null ? u.getRol() : "COMPRADOR");
        res.put("empresaId", empresaId);
        res.put("mensaje",   "Bienvenido, " + u.getNombre() + ".");
        return res;
    }
}