package com.underwater.app.repository;

import com.underwater.app.model.Admin;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public class AdminRepository {

    private final MongoTemplate adminMongoTemplate;

    public AdminRepository(@Qualifier("adminMongoTemplate") MongoTemplate adminMongoTemplate) {
        this.adminMongoTemplate = adminMongoTemplate;
    }

    public Admin save(Admin admin) {
        return adminMongoTemplate.save(admin);
    }

    public Optional<Admin> findByCorreo(String correo) {
        Query query = new Query(Criteria.where("Correo").is(correo));
        Admin admin = adminMongoTemplate.findOne(query, Admin.class, "admins");
        return Optional.ofNullable(admin);
    }

    public Optional<Admin> findById(String id) {
        Query query = new Query(Criteria.where("_id").is(id));
        Admin admin = adminMongoTemplate.findOne(query, Admin.class, "admins");
        return Optional.ofNullable(admin);
    }
}
