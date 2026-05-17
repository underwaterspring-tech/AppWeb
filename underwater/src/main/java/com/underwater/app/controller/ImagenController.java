package com.underwater.app.controller;

import com.underwater.app.service.ImagenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/imagenes")
public class ImagenController {

    @Autowired
    private ImagenService imagenService;

    // POST /api/admin/imagenes/actualizar
    // Busca imágenes en KicksDB solo para productos sin imagen
    // Los productos con imagen del vendedor NO se tocan
    @PostMapping("/actualizar")
    public ResponseEntity<Map<String, Object>> actualizar() {
        Map<String, Object> resultado = imagenService.actualizarImagenes();
        return ResponseEntity.ok(resultado);
    }
}