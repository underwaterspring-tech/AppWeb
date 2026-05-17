package com.underwater.app.service;

import com.underwater.app.model.Producto;
import com.underwater.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class ImagenService {

    @Autowired
    private ProductoRepository productoRepo;

    private static final String ACCESS_KEY = "qxX3R4XUHVK361CvZTFIY_XGdvd58ZomRXj0NeKQuWw";
    private static final String API_URL    = "https://api.unsplash.com/search/photos?per_page=1&client_id=" + ACCESS_KEY + "&query=";

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache para no repetir llamadas con el mismo nombre base
    private final Map<String, String> cache = new HashMap<>();

    // ── Actualizar imágenes de todos los productos sin imagen ─────
    public Map<String, Object> actualizarImagenes() {
        List<Producto> productos = productoRepo.findAll();
        int actualizados = 0;
        int sinImagen    = 0;
        int omitidos     = 0;

        for (Producto p : productos) {
            // Si ya tiene imágenes → respetar las del vendedor
            if (p.getImagenes() != null && !p.getImagenes().isEmpty()) {
                omitidos++;
                continue;
            }

            String nombreBase = limpiarNombre(p.getNombre());
            String imagen     = buscarImagen(nombreBase + " sneaker", p.getMarca());

            if (imagen != null) {
                p.setImagenes(List.of(imagen));
                productoRepo.save(p);
                actualizados++;
            } else {
                sinImagen++;
            }

            // Pausa para no saturar la API (50 req/hora)
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
        }

        return Map.of(
            "total",        productos.size(),
            "actualizados", actualizados,
            "omitidos",     omitidos,
            "sinImagen",    sinImagen
        );
    }

    // ── Buscar imagen en Unsplash ─────────────────────────────────
    @SuppressWarnings("unchecked")
    private String buscarImagen(String query, String marca) {
        String cacheKey = query.toLowerCase();
        if (cache.containsKey(cacheKey)) return cache.get(cacheKey);

        try {
            String url = API_URL + query.replace(" ", "%20");
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> results =
                    (List<Map<String, Object>>) response.getBody().get("results");

                if (results != null && !results.isEmpty()) {
                    Map<String, Object> urls = (Map<String, Object>) results.get(0).get("urls");
                    if (urls != null) {
                        // "regular" da imágenes de buena calidad ~1080px
                        String imagen = (String) urls.get("regular");
                        if (imagen != null && !imagen.isBlank()) {
                            cache.put(cacheKey, imagen);
                            return imagen;
                        }
                    }
                }
            }

            // Fallback: buscar solo por marca + sneaker
            if (!query.toLowerCase().contains(marca.toLowerCase())) {
                String imagenMarca = buscarImagen(marca + " sneaker", marca);
                cache.put(cacheKey, imagenMarca);
                return imagenMarca;
            }

        } catch (Exception e) {
            System.err.println("[ImagenService] Error buscando '" + query + "': " + e.getMessage());
        }

        cache.put(cacheKey, null);
        return null;
    }

    // ── Limpiar nombre — quitar sufijos Pro/Elite/Classic/etc ─────
    private String limpiarNombre(String nombre) {
        String[] sufijos = {" Pro", " Elite", " Classic", " Sport",
                            " Lite", " Max", " Plus", " V2", " V3",
                            " Running", " W", " Kids"};
        String limpio = nombre;
        for (String s : sufijos) {
            limpio = limpio.replace(s, "");
        }
        return limpio.trim();
    }
}