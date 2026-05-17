package com.underwater.app.repository;

import com.underwater.app.model.Empresa;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;

public interface EmpresaRepository extends MongoRepository<Empresa, String> {

    @Query("{ 'nit': ?0 }")
    Optional<Empresa> findByNit(String nit);

    @Query(value = "{ 'nit': ?0 }", exists = true)
    boolean existsByNit(String nit);

    @Query("{ 'usuarioId': ?0 }")
    Optional<Empresa> findByUsuarioId(String usuarioId);
}
