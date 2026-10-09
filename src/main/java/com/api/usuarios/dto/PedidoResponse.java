package com.api.usuarios.dto;

import com.api.usuarios.model.Pedido;
import com.api.usuarios.model.Producto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Contrato explícito: nunca serializar entidades de usuario ni proxies JPA. */
public record PedidoResponse(Long id, UsuarioResumen usuario, List<DetalleResumen> detalles,
        BigDecimal total, String estado, LocalDateTime fechaCreacion) {
    public record UsuarioResumen(Long id, String nombre, String email) {}
    public record ProductoResumen(Long id, String nombre, String descripcion, BigDecimal precio,
            Integer stock, String categoria, String talla, String color, String imagenUrl) {
        static ProductoResumen from(Producto p) {
            return new ProductoResumen(p.getId(), p.getNombre(), p.getDescripcion(), p.getPrecio(),
                    p.getStock(), p.getCategoria(), p.getTalla(), p.getColor(), p.getImagenUrl());
        }
    }
    public record DetalleResumen(Long id, ProductoResumen producto, Integer cantidad,
            BigDecimal precioUnitario, BigDecimal subtotal) {}

    public static PedidoResponse from(Pedido p) {
        return new PedidoResponse(p.getId(), new UsuarioResumen(p.getUsuario().getId(),
                p.getUsuario().getNombre(), p.getUsuario().getEmail()), p.getDetalles().stream()
                .map(d -> new DetalleResumen(d.getId(), ProductoResumen.from(d.getProducto()),
                        d.getCantidad(), d.getPrecioUnitario(), d.getSubtotal())).toList(),
                p.getTotal(), p.getEstado(), p.getFechaCreacion());
    }
}
