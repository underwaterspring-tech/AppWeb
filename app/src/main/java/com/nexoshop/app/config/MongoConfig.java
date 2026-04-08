package com.nexoshop.app.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

// ============================================================
// CONFIGURACION MONGODB MULTI-BASE
//
//   BD principal:   "usuario"  -> compradores y vendedores
//   BD secundaria:  "admin"    -> administradores
//
// Ambas en el mismo servidor MongoDB (localhost:27017)
// ============================================================
@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.host:localhost}")
    private String host;

    @Value("${spring.data.mongodb.port:27017}")
    private int port;

    private String uri() {
        return "mongodb://" + host + ":" + port;
    }

    @Primary
    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory() {
        return new SimpleMongoClientDatabaseFactory(
            MongoClients.create(uri()), "usuario"
        );
    }

    @Primary
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoDatabaseFactory());
    }

    @Bean(name = "adminMongoTemplate")
    public MongoTemplate adminMongoTemplate() {
        MongoDatabaseFactory adminFactory = new SimpleMongoClientDatabaseFactory(
            MongoClients.create(uri()), "admin"
        );
        return new MongoTemplate(adminFactory);
    }
}
