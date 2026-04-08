package com.nexoshop.app.repository;

import com.nexoshop.app.model.Admin;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// ============================================================
// REPOSITORIO: AdminRepository
// Usa el MongoTemplate de la BD "admin" (no la principal).
// Busca por campo "Correo" (C mayuscula) en coleccion "admins".
// ============================================================
@Repository
public class AdminRepository {

    private final MongoTemplate adminMongoTemplate;

    public AdminRepository(@Qualifier("adminMongoTemplate") MongoTemplate adminMongoTemplate) {
        this.adminMongoTemplate = adminMongoTemplate;
    }

    public Optional<Admin> findByCorreo(String correo) {
        Query query = new Query(Criteria.where("Correo").is(correo));
        Admin admin = adminMongoTemplate.findOne(query, Admin.class);
        return Optional.ofNullable(admin);
    }
}
