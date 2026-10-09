package com.api.usuarios.service;

import com.api.usuarios.model.Producto;
import com.api.usuarios.repository.ProductoRepository;
import com.api.usuarios.dto.ProductoRequest;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductoService {
    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    public List<Producto> buscarPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    public List<Producto> buscarPorTalla(String talla) {
        return productoRepository.findByTalla(talla);
    }

    public List<Producto> buscar(String query) {
        return productoRepository.findByNombreContainingIgnoreCase(query);
    }

    public Producto crear(ProductoRequest request) {
        Producto producto = new Producto();
        actualizarCampos(producto, request);
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, ProductoRequest request) {
        Producto producto = productoRepository.findForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        actualizarCampos(producto, request);
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        Producto producto = productoRepository.findForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        productoRepository.delete(producto);
        productoRepository.flush();
    }

    private void actualizarCampos(Producto producto, ProductoRequest request) {
        producto.setNombre(request.nombre().trim());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setStock(request.stock());
        producto.setCategoria(request.categoria());
        producto.setTalla(request.talla());
        producto.setColor(request.color());
        producto.setImagenUrl(request.imagenUrl());
    }
}
