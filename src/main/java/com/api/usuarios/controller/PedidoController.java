package com.api.usuarios.controller;

import com.api.usuarios.dto.CrearPedidoRequest;
import com.api.usuarios.dto.PedidoResponse;
import com.api.usuarios.dto.EstadoPedidoRequest;
import com.api.usuarios.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CrearPedidoRequest request) {
        Long usuarioId = Long.parseLong(jwt.getSubject());
        PedidoResponse pedido = pedidoService.crearPedido(usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping("/mis-pedidos")
    public List<PedidoResponse> misPedidos(@AuthenticationPrincipal Jwt jwt) {
        Long usuarioId = Long.parseLong(jwt.getSubject());
        return pedidoService.misPedidos(usuarioId);
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> todosPedidos(@AuthenticationPrincipal Jwt jwt) {
        if (!isAdmin(jwt)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(pedidoService.todosPedidos());
    }

    @GetMapping("/{id}")
    public PedidoResponse obtenerPorId(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return pedidoService.obtenerPorId(id, Long.parseLong(jwt.getSubject()), isAdmin(jwt));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> actualizarEstado(@PathVariable Long id, @Valid @RequestBody EstadoPedidoRequest body, @AuthenticationPrincipal Jwt jwt) {
        if (!isAdmin(jwt)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        PedidoResponse actualizado = pedidoService.actualizarEstado(id, body.estado());
        return ResponseEntity.ok(actualizado);
    }

    private boolean isAdmin(Jwt jwt) {
        String rol = jwt.getClaimAsString("rol");
        return "ADMIN".equals(rol);
    }
}
