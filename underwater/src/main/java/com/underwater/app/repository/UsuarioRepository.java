package com.underwater.app.repository;

import com.underwater.app.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    @Query("{ 'correo': ?0 }")
    Optional<Usuario> findByEmail(String email);

    @Query(value = "{ 'correo': ?0 }", exists = true)
    boolean existsByEmail(String email);
}
