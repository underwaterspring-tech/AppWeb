package com.nexoshop.app.repository;

import com.nexoshop.app.model.Producto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProductoRepository {

    private final MongoTemplate productoTemplate;

    public ProductoRepository(
            @Value("${spring.data.mongodb.uri}") String mongoUri) {

        String uriProducto = mongoUri.substring(0, mongoUri.lastIndexOf('/') + 1) + "producto";
        this.productoTemplate = new MongoTemplate(
            new SimpleMongoClientDatabaseFactory(uriProducto)
        );
    }

    // Expone el template para que los controllers puedan hacer queries complejas
    public MongoTemplate getTemplate() {
        return productoTemplate;
    }

    public Producto save(Producto producto) {
        return productoTemplate.save(producto);
    }

    public Optional<Producto> findById(String id) {
        return Optional.ofNullable(productoTemplate.findById(id, Producto.class));
    }

    public List<Producto> findByVendedorId(String vendedorId) {
        Query query = new Query(Criteria.where("vendedorId").is(vendedorId));
        return productoTemplate.find(query, Producto.class);
    }

    public List<Producto> findAllActivos() {
        Query query = new Query(Criteria.where("estado").is("ACTIVO"));
        return productoTemplate.find(query, Producto.class);
    }

    public void deleteById(String id) {
        Query query = new Query(Criteria.where("_id").is(id));
        productoTemplate.remove(query, Producto.class);
    }

    public void cambiarEstado(String id, String nuevoEstado) {
        Query query  = new Query(Criteria.where("_id").is(id));
        Update update = new Update().set("estado", nuevoEstado);
        productoTemplate.updateFirst(query, update, Producto.class);
    }

    // Actualiza solo la lista de imágenes de un producto existente
    public void actualizarImagenes(String id, List<String> imagenes) {
        Query query  = new Query(Criteria.where("_id").is(id));
        Update update = new Update().set("imagenes", imagenes);
        productoTemplate.updateFirst(query, update, Producto.class);
    }
}