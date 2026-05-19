package com.underwater.app.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String uri;

    // ── BD principal: Datos ──
    @Primary
    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory() {
        return new SimpleMongoClientDatabaseFactory(MongoClients.create(uri), "Datos");
    }

    @Primary
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoDatabaseFactory());
    }

    // ── BD secundaria: admin ──
    @Bean(name = "adminMongoTemplate")
    public MongoTemplate adminMongoTemplate() {
        MongoDatabaseFactory adminFactory =
            new SimpleMongoClientDatabaseFactory(MongoClients.create(uri), "Datos");
        return new MongoTemplate(adminFactory);
    }
}