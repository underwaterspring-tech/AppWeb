package com.nexoshop.app.repository;

import com.nexoshop.app.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// ============================================================
// REPOSITORIO: UsuarioRepository
// El campo en MongoDB es "correo" (minuscula).
// Usamos @Query con el nombre real del campo en la BD.
// ============================================================
@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    // Busca por el campo "correo" en MongoDB
    @Query("{ 'correo': ?0 }")
    Optional<Usuario> findByEmail(String email);

    // Verifica si ya existe ese correo
    @Query(value = "{ 'correo': ?0 }", exists = true)
    boolean existsByEmail(String email);
}
