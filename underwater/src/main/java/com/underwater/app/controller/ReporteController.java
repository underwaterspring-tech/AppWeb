package com.underwater.app.controller;

import com.underwater.app.model.Reporte;
import com.underwater.app.repository.ReporteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired private ReporteRepository reporteRepo;

    // POST /api/reportes — crear reporte (comprador o vendedor)
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        String usuarioId     = (String) body.get("usuarioId");
        String usuarioNombre = (String) body.get("usuarioNombre");
        String usuarioEmail  = (String) body.get("usuarioEmail");
        String usuarioRol    = (String) body.get("usuarioRol");
        String tipo          = (String) body.get("tipo");
        String asunto        = (String) body.get("asunto");
        String descripcion   = (String) body.get("descripcion");

        if (asunto == null || asunto.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "El asunto es requerido."));
        if (descripcion == null || descripcion.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "La descripcion es requerida."));

        Reporte r = new Reporte();
        r.setUsuarioId(usuarioId);
        r.setUsuarioNombre(usuarioNombre);
        r.setUsuarioEmail(usuarioEmail);
        r.setUsuarioRol(usuarioRol);
        r.setTipo(tipo != null ? tipo : "OTRO");
        r.setAsunto(asunto.trim());
        r.setDescripcion(descripcion.trim());
        r.setEstado("PENDIENTE");
        r.setEntidadId((String) body.get("entidadId"));
        r.setEntidadNombre((String) body.get("entidadNombre"));
        r.setFechaCreacion(LocalDateTime.now());

        Reporte guardado = reporteRepo.save(r);
        return ResponseEntity.status(201).body(Map.of(
            "exito",   true,
            "id",      guardado.getId(),
            "mensaje", "Reporte enviado al administrador. Te responderemos pronto."
        ));
    }

    // GET /api/reportes/mis-reportes?usuarioId=xxx
    @GetMapping("/mis-reportes")
    public ResponseEntity<?> misReportes(@RequestParam String usuarioId) {
        List<Reporte> reportes = reporteRepo.findByUsuarioId(usuarioId);
        reportes.sort(Comparator.comparing(Reporte::getFechaCreacion,
            Comparator.nullsLast(Comparator.reverseOrder())));
        return ResponseEntity.ok(reportes);
    }

    // GET /api/reportes — admin ve todos
    @GetMapping
    public ResponseEntity<?> todos(@RequestParam(required = false) String estado) {
        List<Reporte> reportes = estado != null
            ? reporteRepo.findByEstado(estado.toUpperCase())
            : reporteRepo.findAll();
        reportes.sort(Comparator.comparing(Reporte::getFechaCreacion,
            Comparator.nullsLast(Comparator.reverseOrder())));
        return ResponseEntity.ok(reportes);
    }

    // PUT /api/reportes/{id}/responder — admin responde
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responder(@PathVariable String id, @RequestBody Map<String, String> body) {
        return reporteRepo.findById(id).map(r -> {
            r.setRespuestaAdmin(body.get("respuesta"));
            r.setEstado("RESUELTO");
            r.setFechaRespuesta(LocalDateTime.now());
            reporteRepo.save(r);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Respuesta enviada."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/reportes/{id}/estado — admin cambia estado
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable String id, @RequestBody Map<String, String> body) {
        return reporteRepo.findById(id).map(r -> {
            r.setEstado(body.get("estado").toUpperCase());
            reporteRepo.save(r);
            return ResponseEntity.ok(Map.of("exito", true));
        }).orElse(ResponseEntity.notFound().build());
    }
}
