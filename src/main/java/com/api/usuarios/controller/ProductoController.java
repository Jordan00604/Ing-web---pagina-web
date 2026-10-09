package com.api.usuarios.controller;

import com.api.usuarios.model.Producto;
import com.api.usuarios.service.ProductoService;
import com.api.usuarios.dto.ProductoRequest;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> listar() {
        return productoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Producto obtener(@PathVariable Long id) {
        return productoService.buscarPorId(id);
    }

    @GetMapping("/buscar")
    public List<Producto> buscar(@RequestParam("q") String q) {
        return productoService.buscar(q);
    }

    @GetMapping("/categoria/{cat}")
    public List<Producto> buscarPorCategoria(@PathVariable String cat) {
        return productoService.buscarPorCategoria(cat);
    }

    @GetMapping("/talla/{talla}")
    public List<Producto> buscarPorTalla(@PathVariable String talla) {
        return productoService.buscarPorTalla(talla);
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoRequest datos) {
        Producto guardado = productoService.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest datos) {
        Producto actualizado = productoService.actualizar(id, datos);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}