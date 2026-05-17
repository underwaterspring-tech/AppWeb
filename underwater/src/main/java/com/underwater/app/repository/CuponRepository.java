package com.underwater.app.repository;

import com.underwater.app.model.Cupon;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CuponRepository extends MongoRepository<Cupon, String> {

    @Query("{ 'codigo': ?0, 'activo': true }")
    Optional<Cupon> findByCodigoActivo(String codigo);

    @Query("{ 'vendedorId': ?0 }")
    List<Cupon> findByVendedorId(String vendedorId);
}
