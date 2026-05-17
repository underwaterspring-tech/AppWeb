package com.underwater.app.repository;

import com.underwater.app.model.Reporte;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ReporteRepository extends MongoRepository<Reporte, String> {

    @Query("{ 'usuarioId': ?0 }")
    List<Reporte> findByUsuarioId(String usuarioId);

    @Query("{ 'estado': ?0 }")
    List<Reporte> findByEstado(String estado);
}
