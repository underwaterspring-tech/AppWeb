package com.underwater.app.repository;

import com.underwater.app.model.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class ProductoRepository {

    private final MongoTemplate mongoTemplate;

    @Autowired
    public ProductoRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public MongoTemplate getTemplate() { return mongoTemplate; }

    public Producto save(Producto p) {
        return mongoTemplate.save(p, "productos");
    }

    public Optional<Producto> findById(String id) {
        Producto p = mongoTemplate.findById(id, Producto.class, "productos");
        return Optional.ofNullable(p);
    }

    public List<Producto> findByVendedorId(String vendedorId) {
        Query q = new Query(Criteria.where("vendedorId").is(vendedorId));
        return mongoTemplate.find(q, Producto.class, "productos");
    }

    public List<Producto> findAllActivos() {
        Query q = new Query(Criteria.where("estado").is("ACTIVO").and("publicado").is(true));
        return mongoTemplate.find(q, Producto.class, "productos");
    }

    public List<Producto> findAll() {
        return mongoTemplate.findAll(Producto.class, "productos");
    }

    public List<Producto> findDestacados() {
        Query q = new Query(Criteria.where("destacado").is(true)
                                    .and("estado").is("ACTIVO")
                                    .and("publicado").is(true));
        return mongoTemplate.find(q, Producto.class, "productos");
    }

    public void deleteById(String id) {
        Query q = new Query(Criteria.where("_id").is(id));
        mongoTemplate.remove(q, "productos");
    }

    public void cambiarEstado(String id, String nuevoEstado) {
        Update update = new Update()
            .set("estado", nuevoEstado)
            .set("publicado", "ACTIVO".equals(nuevoEstado));
        Query q = new Query(Criteria.where("_id").is(id));
        mongoTemplate.updateFirst(q, update, "productos");
    }

    public void actualizarImagenes(String id, List<String> imagenes) {
        Update update = new Update().set("imagenes", imagenes);
        Query q = new Query(Criteria.where("_id").is(id));
        mongoTemplate.updateFirst(q, update, "productos");
    }
}
