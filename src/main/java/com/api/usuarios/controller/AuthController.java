package com.api.usuarios.controller;

import com.api.usuarios.dto.RegistroRequest;
import com.api.usuarios.model.Usuario;
import com.api.usuarios.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.api.usuarios.dto.LoginRequest;
import java.time.Instant;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final UsuarioRepository usuarios;
        private final PasswordEncoder passwordEncoder;
        private final JwtEncoder jwtEncoder;

        public AuthController(
                        UsuarioRepository usuarios,
                        PasswordEncoder passwordEncoder,
                        JwtEncoder jwtEncoder) {
                this.usuarios = usuarios;
                this.passwordEncoder = passwordEncoder;
                this.jwtEncoder = jwtEncoder;
        }

        @PostMapping("/register")
        public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequest datos) {
                String email = datos.email().trim().toLowerCase(Locale.ROOT);

                if (usuarios.existsByEmail(email)) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                        .body(Map.of("mensaje", "El correo ya está registrado"));
                }

                Usuario usuario = new Usuario();
                usuario.setNombre(datos.nombre().trim());
                usuario.setEmail(email);
                usuario.setPassword(passwordEncoder.encode(datos.password()));

                usuario.setRol("CLIENTE");

                Usuario guardado = usuarios.save(usuario);

                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                                "id", guardado.getId(),
                                "nombre", guardado.getNombre(),
                                "email", guardado.getEmail()));
        }

        @PostMapping("/login")
        public ResponseEntity<?> iniciarSesion(@Valid @RequestBody LoginRequest datos) {
                String email = datos.email().trim().toLowerCase(Locale.ROOT);

                Usuario usuario = usuarios.findByEmail(email).orElse(null);

                if (usuario == null ||
                                !passwordEncoder.matches(datos.password(), usuario.getPassword())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("mensaje", "Correo o contraseña incorrectos"));
                }

                Instant ahora = Instant.now();

                JwtClaimsSet claims = JwtClaimsSet.builder()
                                .issuer("tienda-usuarios")
                                .subject(usuario.getId().toString())
                                .issuedAt(ahora)
                                .expiresAt(ahora.plusSeconds(3600))
                                .claim("email", usuario.getEmail())
                                .claim("rol", "ADMIN".equals(usuario.getRol()) ? "ADMIN" : "CLIENTE")
                                .build();

                JwsHeader encabezado = JwsHeader.with(MacAlgorithm.HS256).build();

                String token = jwtEncoder.encode(
                                JwtEncoderParameters.from(encabezado, claims)).getTokenValue();

                return ResponseEntity.ok(Map.of(
                                "accessToken", token,
                                "tokenType", "Bearer",
                                "expiresIn", 3600,
                                "nombre", usuario.getNombre()));
        }
}