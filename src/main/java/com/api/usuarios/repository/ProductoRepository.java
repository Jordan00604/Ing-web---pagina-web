package com.api.usuarios.repository;

import com.api.usuarios.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> findForUpdate(@Param("id") Long id);
    List<Producto> findByCategoria(String categoria);
    List<Producto> findByTalla(String talla);
    List<Producto> findByCategoriaAndTalla(String categoria, String talla);
    List<Producto> findByNombreContainingIgnoreCase(String query);
}
