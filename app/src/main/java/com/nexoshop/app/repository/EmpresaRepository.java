package com.nexoshop.app.repository;

import com.nexoshop.app.model.Empresa;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// ============================================================
// REPOSITORIO: EmpresaRepository
// ============================================================
@Repository
public interface EmpresaRepository extends MongoRepository<Empresa, String> {

    // Busca empresa por NIT
    @Query("{ 'nit': ?0 }")
    Optional<Empresa> findByNit(String nit);

    // Verifica si ya existe ese NIT
    @Query(value = "{ 'nit': ?0 }", exists = true)
    boolean existsByNit(String nit);

    // Busca empresa por el ID del vendedor dueño
    @Query("{ 'usuarioId': ?0 }")
    Optional<Empresa> findByUsuarioId(String usuarioId);
}