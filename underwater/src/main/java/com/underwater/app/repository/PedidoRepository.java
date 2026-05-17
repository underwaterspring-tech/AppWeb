package com.underwater.app.repository;

import com.underwater.app.model.Pedido;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface PedidoRepository extends MongoRepository<Pedido, String> {
    @Query("{ 'usuarioId': ?0 }")
    List<Pedido> findByUsuarioId(String usuarioId);

    @Query("{ 'items.empresaId': ?0 }")
    List<Pedido> findByEmpresaId(String empresaId);
}
