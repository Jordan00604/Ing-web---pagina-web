package com.api.usuarios;

import com.api.usuarios.model.Usuario;
import com.api.usuarios.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import static org.junit.jupiter.api.Assertions.*;

/** HTTP real, BD efímera aislada: no accede a PostgreSQL ni credenciales de producción. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:flows;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
        "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false"
})
class FashionWorldIntegrationTests {
    @LocalServerPort int port;
    @Autowired UsuarioRepository usuarios;
    @Autowired PasswordEncoder encoder;
    @Autowired ObjectMapper json;
    @Autowired org.springframework.security.oauth2.jwt.JwtEncoder jwtEncoder;
    final HttpClient client = HttpClient.newHttpClient();

    @DynamicPropertySource
    static void secret(DynamicPropertyRegistry registry) {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        String secret = Base64.getEncoder().encodeToString(bytes);
        registry.add("app.jwt.secret", () -> secret);
    }

    HttpResponse<String> call(String method, String path, String token, Object body) throws Exception {
        var b = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (token != null) b.header("Authorization", "Bearer " + token);
        if (body != null) b.header("Content-Type", "application/json");
        return client.send(b.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    JsonNode tree(HttpResponse<String> r) { return json.readTree(r.body()); }
    String login(String email, String password) throws Exception {
        var r = call("POST", "/api/auth/login", null, Map.of("email", email, "password", password));
        assertEquals(200, r.statusCode()); // No imprimir respuesta: contiene JWT.
        return tree(r).get("accessToken").asText();
    }
    Map<String, Object> product(String name, int stock) {
        return Map.of("nombre", name, "precio", 25.50, "stock", stock, "categoria", "Prueba",
                "talla", "M", "color", "Esmeralda", "descripcion", "Fixture aislado");
    }
    Map<String, Object> order(long id, int quantity) {
        return Map.of("items", new Object[]{Map.of("productoId", id, "cantidad", quantity)});
    }

    @Test
    void publicClientAdminAndOrderSecurityFlows() throws Exception {
        String password = UUID.randomUUID().toString();
        String prefix = UUID.randomUUID().toString();
        String a = prefix + "a@example.test", b = prefix + "b@example.test";
        var registration = Map.of("nombre", "Cliente de prueba", "email", a, "password", password, "rol", "ADMIN");
        assertEquals(201, call("POST", "/api/auth/register", null, registration).statusCode());
        assertEquals(409, call("POST", "/api/auth/register", null, registration).statusCode());
        assertEquals(400, call("POST", "/api/auth/register", null, Map.of("email", "incorrecto")).statusCode());
        assertEquals(201, call("POST", "/api/auth/register", null,
                Map.of("nombre", "Otro cliente", "email", b, "password", password)).statusCode());
        assertEquals(401, call("POST", "/api/auth/login", null, Map.of("email", a, "password", "incorrecta")).statusCode());
        String ta = login(a, password), tb = login(b, password);
        assertEquals("CLIENTE", usuarios.findByEmail(a).orElseThrow().getRol());
        assertFalse(json.writeValueAsString(usuarios.findByEmail(a).orElseThrow()).contains("password"));
        assertEquals(200, call("GET", "/api/usuarios/me", ta, null).statusCode());
        assertEquals(401, call("GET", "/api/usuarios/me", "invalid", null).statusCode());
        assertEquals(401, call("GET", "/api/usuarios/me", null, null).statusCode());
        var now = java.time.Instant.now();
        var expiredClaims = org.springframework.security.oauth2.jwt.JwtClaimsSet.builder()
                .issuer("tienda-usuarios").subject(usuarios.findByEmail(a).orElseThrow().getId().toString())
                .issuedAt(now.minusSeconds(7200)).expiresAt(now.minusSeconds(3600)).claim("rol", "CLIENTE").build();
        var header = org.springframework.security.oauth2.jwt.JwsHeader.with(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build();
        String expired = jwtEncoder.encode(org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(header, expiredClaims)).getTokenValue();
        assertEquals(401, call("GET", "/api/usuarios/me", expired, null).statusCode());
        var foreignClaims = org.springframework.security.oauth2.jwt.JwtClaimsSet.builder().issuer("otro-emisor")
                .subject(usuarios.findByEmail(a).orElseThrow().getId().toString()).issuedAt(now)
                .expiresAt(now.plusSeconds(3600)).claim("rol", "CLIENTE").build();
        String foreign = jwtEncoder.encode(org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(header, foreignClaims)).getTokenValue();
        assertEquals(401, call("GET", "/api/usuarios/me", foreign, null).statusCode());
        assertEquals(403, call("POST", "/api/productos", ta, product("Prohibido", 1)).statusCode());
        assertEquals(403, call("GET", "/api/pedidos", ta, null).statusCode());

        Usuario admin = new Usuario();
        admin.setNombre("Admin de prueba"); admin.setEmail(prefix + "admin@example.test");
        admin.setPassword(encoder.encode(password)); admin.setRol("ADMIN"); usuarios.save(admin);
        String tadmin = login(admin.getEmail(), password);
        assertEquals(400, call("POST", "/api/productos", tadmin, product("", -1)).statusCode());
        var created = call("POST", "/api/productos", tadmin, product("Prenda HTTP", 4));
        assertEquals(201, created.statusCode()); long id = tree(created).get("id").asLong();
        assertEquals(200, call("GET", "/api/productos", null, null).statusCode());
        assertEquals(1, tree(call("GET", "/api/productos/buscar?q=Prenda", null, null)).size());
        assertEquals(1, tree(call("GET", "/api/productos/categoria/Prueba", null, null)).size());
        assertEquals(1, tree(call("GET", "/api/productos/talla/M", null, null)).size());
        assertEquals(404, call("GET", "/api/productos/999999", null, null).statusCode());
        assertEquals(200, call("PUT", "/api/productos/" + id, tadmin, product("Prenda editada", 4)).statusCode());
        assertEquals(400, call("POST", "/api/pedidos", ta, order(id, 5)).statusCode());
        assertEquals(400, call("POST", "/api/pedidos", ta, order(id, 0)).statusCode());
        assertEquals(4, tree(call("GET", "/api/productos/" + id, null, null)).get("stock").asInt());
        var pedido = call("POST", "/api/pedidos", ta, Map.of("items", new Object[]{
                Map.of("productoId", id, "cantidad", 1), Map.of("productoId", id, "cantidad", 1)}));
        assertEquals(201, pedido.statusCode()); long pid = tree(pedido).get("id").asLong();
        assertEquals(51.0, tree(pedido).get("total").asDouble());
        assertEquals(1, tree(pedido).get("detalles").size());
        assertFalse(pedido.body().contains("password"));
        assertFalse(pedido.body().contains("$2"));
        assertEquals(2, tree(call("GET", "/api/productos/" + id, null, null)).get("stock").asInt());
        assertEquals(200, call("GET", "/api/pedidos/" + pid, ta, null).statusCode());
        assertEquals(403, call("GET", "/api/pedidos/" + pid, tb, null).statusCode());
        assertEquals(200, call("GET", "/api/pedidos/" + pid, tadmin, null).statusCode());
        var mine = call("GET", "/api/pedidos/mis-pedidos", ta, null);
        assertEquals(1, tree(mine).size()); assertFalse(mine.body().contains("password"));
        assertEquals(0, tree(call("GET", "/api/pedidos/mis-pedidos", tb, null)).size());
        assertEquals(403, call("PUT", "/api/pedidos/" + pid + "/estado", ta, Map.of("estado", "REVISADO")).statusCode());
        assertEquals(400, call("PUT", "/api/pedidos/" + pid + "/estado", tadmin, Map.of("estado", " ")).statusCode());
        assertEquals(200, call("PUT", "/api/pedidos/" + pid + "/estado", tadmin, Map.of("estado", "REVISADO")).statusCode());
        assertEquals("REVISADO", tree(call("GET", "/api/pedidos/" + pid, ta, null)).get("estado").asText());
        assertFalse(call("GET", "/api/pedidos", tadmin, null).body().contains("password"));
        assertEquals(409, call("DELETE", "/api/productos/" + id, tadmin, null).statusCode());
        long disposable = tree(call("POST", "/api/productos", tadmin, product("Temporal", 1))).get("id").asLong();
        assertEquals(204, call("DELETE", "/api/productos/" + disposable, tadmin, null).statusCode());
        assertEquals(404, call("GET", "/api/productos/" + disposable, null, null).statusCode());

        long last = tree(call("POST", "/api/productos", tadmin, product("Última unidad", 1))).get("id").asLong();
        var f1 = CompletableFuture.supplyAsync(() -> concurrentOrder(last, ta));
        var f2 = CompletableFuture.supplyAsync(() -> concurrentOrder(last, tb));
        var statuses = java.util.List.of(f1.join(), f2.join());
        assertEquals(1, statuses.stream().filter(s -> s == 201).count());
        assertEquals(1, statuses.stream().filter(s -> s == 400).count());
        assertEquals(0, tree(call("GET", "/api/productos/" + last, null, null)).get("stock").asInt());
        var preflight = client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/productos"))
                .header("Origin", "http://127.0.0.1:5173").header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "Authorization,Content-Type")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(200, preflight.statusCode());
        assertEquals("http://127.0.0.1:5173", preflight.headers().firstValue("Access-Control-Allow-Origin").orElse(""));
    }
    int concurrentOrder(long id, String token) {
        try { return call("POST", "/api/pedidos", token, order(id, 1)).statusCode(); }
        catch (Exception e) { throw new IllegalStateException("Error en prueba concurrente"); }
    }
}
