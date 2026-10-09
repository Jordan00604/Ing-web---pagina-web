package com.api.usuarios.controller;

import com.api.usuarios.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarios;

    public UsuarioController(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @GetMapping("/me")
    public ResponseEntity<?> miPerfil(@AuthenticationPrincipal Jwt jwt) {
        Long id = Long.valueOf(jwt.getSubject());

        return usuarios.findById(id)
                .<ResponseEntity<?>>map(usuario -> ResponseEntity.ok(Map.of(
                        "id", usuario.getId(),
                        "nombre", usuario.getNombre(),
                        "email", usuario.getEmail(),
                        "rol", "ADMIN".equals(usuario.getRol()) ? "ADMIN" : "CLIENTE"
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
