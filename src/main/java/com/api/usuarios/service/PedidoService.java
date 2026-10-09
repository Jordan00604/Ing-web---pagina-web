package com.api.usuarios.service;

import com.api.usuarios.dto.CrearPedidoRequest;
import com.api.usuarios.dto.ItemPedidoRequest;
import com.api.usuarios.dto.PedidoResponse;
import com.api.usuarios.model.DetallePedido;
import com.api.usuarios.model.Pedido;
import com.api.usuarios.model.Producto;
import com.api.usuarios.model.Usuario;
import com.api.usuarios.repository.PedidoRepository;
import com.api.usuarios.repository.ProductoRepository;
import com.api.usuarios.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public PedidoResponse crearPedido(Long usuarioId, CrearPedidoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);

        BigDecimal total = BigDecimal.ZERO;

        Map<Long, Integer> cantidades = new TreeMap<>();
        for (ItemPedidoRequest item : request.items()) {
            try {
                cantidades.merge(item.productoId(), item.cantidad(), Math::addExact);
            } catch (ArithmeticException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad demasiado grande");
            }
        }
        // Orden fijo de bloqueo, consolidando IDs para evitar sobreventa y deadlocks.
        for (var entry : cantidades.entrySet()) {
            ItemPedidoRequest item = new ItemPedidoRequest(entry.getKey(), entry.getValue());
            Producto producto = productoRepository.findForUpdate(item.productoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + item.productoId()));

            if (producto.getStock() < item.cantidad()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock insuficiente para producto: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - item.cantidad());
            productoRepository.save(producto);

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.cantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.cantidad()));
            detalle.setSubtotal(subtotal);

            pedido.getDetalles().add(detalle);
            total = total.add(subtotal);
        }

        pedido.setTotal(total);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    public List<PedidoResponse> misPedidos(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId).stream()
                .map(PedidoResponse::from).toList();
    }

    public List<PedidoResponse> todosPedidos() {
        return pedidoRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(PedidoResponse::from).toList();
    }

    private Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    }

    public PedidoResponse obtenerPorId(Long id, Long usuarioId, boolean admin) {
        Pedido pedido = buscarPorId(id);
        if (!admin && !pedido.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a este pedido");
        }
        return PedidoResponse.from(pedido);
    }

    public PedidoResponse actualizarEstado(Long id, String estado) {
        Pedido pedido = buscarPorId(id);
        pedido.setEstado(estado.trim());
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }
}
