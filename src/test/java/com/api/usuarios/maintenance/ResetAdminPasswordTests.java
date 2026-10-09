package com.api.usuarios.maintenance;

import com.api.usuarios.UsuariosApplication;
import com.api.usuarios.config.PasswordConfig;
import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;

/** Datos sintéticos exclusivamente H2, verifica el mismo flujo contra HTTP Spring real. */
@SpringBootTest(classes = UsuariosApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:admin-reset;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
        "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false"
})
class ResetAdminPasswordTests {
    @LocalServerPort int port;
    final PasswordEncoder encoder = new PasswordConfig().passwordEncoder();
    String originalHash;
    String otherHash;

    @DynamicPropertySource
    static void secret(DynamicPropertyRegistry registry) {
        byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes);
        String secret = Base64.getEncoder().encodeToString(bytes);
        registry.add("app.jwt.secret", () -> secret);
    }
    Connection connection() throws Exception {
        return DriverManager.getConnection("jdbc:h2:mem:admin-reset;DB_CLOSE_DELAY=-1;MODE=PostgreSQL", "sa", "");
    }
    @BeforeEach
    void fixtures() throws Exception {
        originalHash = encoder.encode(UUID.randomUUID().toString());
        otherHash = encoder.encode(UUID.randomUUID().toString());
        try (var c = connection(); var delete = c.createStatement()) {
            delete.executeUpdate("DELETE FROM usuarios");
            try (var insert = c.prepareStatement("INSERT INTO usuarios (id,nombre,email,password,rol) VALUES (?,?,?,?,?)")) {
                insert.setLong(1, 1); insert.setString(2, "Otra cuenta de prueba"); insert.setString(3, "other@example.test");
                insert.setString(4, otherHash); insert.setString(5, "ADMIN"); insert.executeUpdate();
                insert.setLong(1, 2); insert.setString(2, "Cuenta sintética de prueba"); insert.setString(3, ResetAdminPassword.TARGET_EMAIL);
                insert.setString(4, originalHash); insert.setString(5, "ADMIN"); insert.executeUpdate();
            }
        }
    }
    String hash(long id) throws Exception {
        try (var c = connection(); var s = c.prepareStatement("SELECT password FROM usuarios WHERE id=?")) {
            s.setLong(1,id); try (var r = s.executeQuery()) { r.next(); return r.getString(1); }
        }
    }
    @Test
    void resetsOnlyAuthorizedPasswordAndVerifiesRealLoginAndProfile() throws Exception {
        char[] password = UUID.randomUUID().toString().toCharArray();
        try (var c = connection()) {
            assertEquals(ResetAdminPassword.Result.VERIFIED, ResetAdminPassword.reset(c, encoder, password,
                    value -> ResetAdminPassword.verifyLogin(URI.create("http://localhost:" + port), value)));
            assertTrue(encoder.matches(java.nio.CharBuffer.wrap(password), hash(2)));
            assertTrue(otherHash.equals(hash(1))); // No imprimir hashes en mensajes de aserción.
            try (var s = c.prepareStatement("SELECT nombre,email,rol FROM usuarios WHERE id=2"); var r=s.executeQuery()) {
                r.next(); assertEquals("Cuenta sintética de prueba", r.getString("nombre"));
                assertEquals(ResetAdminPassword.TARGET_EMAIL, r.getString("email")); assertEquals("ADMIN", r.getString("rol"));
            }
        } finally { Arrays.fill(password, '\0'); }
    }
    @Test
    void restoresPreviousHashWhenLoginCannotBeVerified() throws Exception {
        char[] password = UUID.randomUUID().toString().toCharArray();
        try (var c=connection()) {
            assertEquals(ResetAdminPassword.Result.RESTORED_AFTER_FAILED_VERIFICATION,
                    ResetAdminPassword.reset(c, encoder, password, value -> false));
            assertTrue(originalHash.equals(hash(2))); assertTrue(otherHash.equals(hash(1)));
        } finally { Arrays.fill(password, '\0'); }
    }
    @Test
    void refusesWrongIdentityOrRoleWithoutChanges() throws Exception {
        char[] password = UUID.randomUUID().toString().toCharArray();
        try (var c=connection()) {
            try (var s=c.createStatement()) { s.executeUpdate("UPDATE usuarios SET rol='CLIENTE' WHERE id=2"); }
            assertThrows(ResetAdminPassword.SafeFailure.class, () -> ResetAdminPassword.reset(c, encoder, password, value -> true));
            assertTrue(originalHash.equals(hash(2))); assertTrue(otherHash.equals(hash(1)));
            try (var s=c.createStatement()) { s.executeUpdate("UPDATE usuarios SET rol='ADMIN', email='wrong@example.test' WHERE id=2"); }
            c.commit();
            assertThrows(ResetAdminPassword.SafeFailure.class, () -> ResetAdminPassword.reset(c, encoder, password, value -> true));
            assertTrue(originalHash.equals(hash(2))); assertTrue(otherHash.equals(hash(1)));
        } finally { Arrays.fill(password, '\0'); }
    }
    @Test
    void neverOverwritesConcurrentPasswordChangeDuringCompensation() throws Exception {
        char[] password = UUID.randomUUID().toString().toCharArray();
        String concurrentHash=encoder.encode(UUID.randomUUID().toString());
        try (var c=connection()) {
            assertEquals(ResetAdminPassword.Result.CONCURRENT_CHANGE,
                    ResetAdminPassword.reset(c, encoder, password, value -> {
                        try (var other=connection(); var s=other.prepareStatement("UPDATE usuarios SET password=? WHERE id=2")) {
                            s.setString(1,concurrentHash); s.executeUpdate(); return false;
                        } catch (Exception e) { throw new IllegalStateException("Error aislado de prueba"); }
                    }));
            assertTrue(concurrentHash.equals(hash(2))); assertTrue(otherHash.equals(hash(1)));
        } finally { Arrays.fill(password, '\0'); }
    }
    @Test
    void rejectsShortAndOver72BytePasswordsBeforeWriting() throws Exception {
        try (var c=connection()) {
            assertThrows(ResetAdminPassword.SafeFailure.class, () -> ResetAdminPassword.reset(c,encoder,new char[7],value -> true));
            assertThrows(ResetAdminPassword.SafeFailure.class, () -> ResetAdminPassword.reset(c,encoder,"é".repeat(37).toCharArray(),value -> true));
            assertTrue(originalHash.equals(hash(2))); assertTrue(otherHash.equals(hash(1)));
        }
    }
}
