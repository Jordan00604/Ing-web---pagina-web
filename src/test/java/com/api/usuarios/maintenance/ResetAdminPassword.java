package com.api.usuarios.maintenance;

import com.api.usuarios.config.PasswordConfig;
import java.io.Console;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.CharBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.Duration;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.ObjectMapper;

/** Herramienta local, solo classpath de test: no añade endpoints ni se distribuye en el JAR. */
public final class ResetAdminPassword {
    public static final long TARGET_ID = 2L;
    public static final String TARGET_EMAIL = "jordyguay04@gmail.com";
    private static final String TARGET_ROLE = "ADMIN";
    private static final ObjectMapper JSON = new ObjectMapper();

    private ResetAdminPassword() {}

    public enum Result { VERIFIED, RESTORED_AFTER_FAILED_VERIFICATION, CONCURRENT_CHANGE }

    @FunctionalInterface
    public interface LoginVerifier { boolean verify(char[] password); }

    public static void main(String[] args) {
        char[] password = null;
        char[] confirmation = null;
        Properties properties = new Properties();
        int exitCode = 0;
        try {
            if (args.length > 1 || (args.length == 1 && !"--check".equals(args[0]))) {
                throw new SafeFailure("No se admiten contraseñas, hashes ni identificadores por argumentos.");
            }
            if (System.getProperty("jdk.httpclient.HttpClient.log") != null) {
                throw new SafeFailure("Desactiva el registro HTTP del JVM antes de usar esta herramienta.");
            }
            boolean check = args.length == 1;
            Console console = System.console();
            if (!check && console == null) {
                throw new SafeFailure("Ejecuta el script en una terminal local interactiva. No se acepta entrada redirigida.");
            }
            try (var reader = Files.newBufferedReader(Path.of("target/classes/application.properties"), StandardCharsets.UTF_8)) {
                properties.load(reader);
            }
            String jdbcUrl = setting(properties, "spring.datasource.url", "SPRING_DATASOURCE_URL");
            // Alcance limitado al entorno local PostgreSQL, no a servidores remotos.
            if (!jdbcUrl.startsWith("jdbc:postgresql://")) throw new SafeFailure("La conexión no es PostgreSQL local.");
            requireLocal(URI.create(jdbcUrl.substring(5)));
            URI apiBase = URI.create("http://localhost:8081");
            if (!backendAvailable(apiBase)) throw new SafeFailure("El backend local no responde; no se modificó la contraseña.");
            try (Connection connection = DriverManager.getConnection(jdbcUrl,
                    setting(properties, "spring.datasource.username", "SPRING_DATASOURCE_USERNAME"),
                    setting(properties, "spring.datasource.password", "SPRING_DATASOURCE_PASSWORD"))) {
                connection.setReadOnly(true);
                checkTarget(connection);
                if (check) {
                    System.out.println("Cuenta ADMIN ID 2 y backend local disponibles. Comprobación de solo lectura; sin cambios.");
                    return;
                }
                connection.setReadOnly(false);
                console.printf("Solo se restablecerá la contraseña del ADMIN ID 2 (%s).%n", TARGET_EMAIL);
                password = console.readPassword("Nueva contraseña (entrada oculta): ");
                confirmation = console.readPassword("Repite la contraseña (entrada oculta): ");
                if (password == null || confirmation == null || !Arrays.equals(password, confirmation)) {
                    throw new SafeFailure("Las contraseñas no coinciden o se canceló la entrada. No se modificaron datos.");
                }
                validatePassword(password);
                Arrays.fill(confirmation, '\0');
                // El mismo bean definido por el backend; no una implementación externa de BCrypt.
                PasswordEncoder encoder = new PasswordConfig().passwordEncoder();
                Result result = reset(connection, encoder, password, value -> verifyLogin(apiBase, value));
                if (result == Result.VERIFIED) {
                    console.printf("Contraseña actualizada y login verificado para ADMIN ID 2. Rol y demás datos conservados.%n");
                } else if (result == Result.RESTORED_AFTER_FAILED_VERIFICATION) {
                    throw new SafeFailure("No se pudo verificar el login. Se restauró la contraseña anterior; no se declara éxito.");
                } else {
                    throw new SafeFailure("No se verificó el login y hubo un cambio concurrente. No se sobrescribió ese cambio; revisa la cuenta antes de continuar.");
                }
            }
        } catch (SafeFailure failure) {
            System.err.println(failure.getMessage());
            exitCode = 1;
        } catch (Exception failure) {
            // Nunca imprimir excepciones JDBC/HTTP, sus cuerpos, hashes, JWT ni stack traces.
            System.err.println("Operación no confirmada. Revisa la conexión local. Si se interrumpió después de guardar, comprueba el acceso antes de repetir; no se declara éxito.");
            exitCode = 1;
        } finally {
            if (password != null) Arrays.fill(password, '\0');
            if (confirmation != null) Arrays.fill(confirmation, '\0');
            properties.clear();
        }
        if (exitCode != 0) System.exit(exitCode);
    }

    public static Result reset(Connection connection, PasswordEncoder encoder, char[] password,
            LoginVerifier verifier) throws SQLException {
        validatePassword(password);
        connection.setAutoCommit(false);
        String previousHash;
        String newHash;
        Map<String, Object> before;
        try {
            if ("PostgreSQL".equals(connection.getMetaData().getDatabaseProductName())) {
                try (var statement = connection.createStatement()) { statement.execute("SET LOCAL lock_timeout = '5s'"); }
            }
            try (var statement = connection.prepareStatement("SELECT * FROM usuarios WHERE id = ? FOR UPDATE")) {
                statement.setLong(1, TARGET_ID);
                try (var rows = statement.executeQuery()) {
                    if (!rows.next() || !TARGET_EMAIL.equals(rows.getString("email")) || !TARGET_ROLE.equals(rows.getString("rol"))) {
                        throw new SafeFailure("ID, correo o rol no coinciden con la cuenta autorizada. No se modificaron datos.");
                    }
                    previousHash = rows.getString("password");
                    before = unchangedFields(rows);
                }
            }
            newHash = encoder.encode(CharBuffer.wrap(password));
            try (var update = connection.prepareStatement("UPDATE usuarios SET password = ? WHERE id = ? AND email = ? AND rol = ?")) {
                update.setString(1, newHash); update.setLong(2, TARGET_ID);
                update.setString(3, TARGET_EMAIL); update.setString(4, TARGET_ROLE);
                if (update.executeUpdate() != 1) throw new SafeFailure("No se pudo actualizar exactamente la cuenta autorizada.");
            }
            try (var statement = connection.prepareStatement("SELECT * FROM usuarios WHERE id = ?")) {
                statement.setLong(1, TARGET_ID);
                try (var rows = statement.executeQuery()) {
                    if (!rows.next() || !before.equals(unchangedFields(rows))) {
                        throw new SafeFailure("La operación alteraría otros datos; se canceló sin guardar.");
                    }
                }
            }
            connection.commit();
        } catch (RuntimeException | SQLException failure) {
            connection.rollback();
            throw failure;
        }

        boolean verified;
        try { verified = verifier.verify(password); } catch (RuntimeException failure) { verified = false; }
        if (verified) { connection.setAutoCommit(true); return Result.VERIFIED; }

        // El backend necesita ver el commit para comprobar el login. Si falla, compensar
        // solo cuando nadie haya cambiado después el hash o la identidad de esta cuenta.
        try (var restore = connection.prepareStatement("UPDATE usuarios SET password = ? WHERE id = ? AND email = ? AND rol = ? AND password = ?")) {
            restore.setString(1, previousHash); restore.setLong(2, TARGET_ID);
            restore.setString(3, TARGET_EMAIL); restore.setString(4, TARGET_ROLE); restore.setString(5, newHash);
            int count = restore.executeUpdate();
            connection.commit(); connection.setAutoCommit(true);
            return count == 1 ? Result.RESTORED_AFTER_FAILED_VERIFICATION : Result.CONCURRENT_CHANGE;
        } catch (SQLException failure) { connection.rollback(); throw failure; }
    }

    public static boolean verifyLogin(URI base, char[] password) {
        requireLocal(base);
        byte[] payload = null;
        try {
            var client = localClient();
            payload = JSON.writeValueAsBytes(Map.of("email", TARGET_EMAIL, "password", new String(password)));
            var login = client.send(HttpRequest.newBuilder(base.resolve("/api/auth/login"))
                    .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(payload)).build(), HttpResponse.BodyHandlers.ofString());
            if (login.statusCode() != 200) return false;
            var body = JSON.readTree(login.body());
            if (!body.hasNonNull("accessToken") || !"Bearer".equals(body.path("tokenType").asText())) return false;
            String token = body.get("accessToken").asText();
            var profile = client.send(HttpRequest.newBuilder(base.resolve("/api/usuarios/me"))
                    .timeout(Duration.ofSeconds(10)).header("Authorization", "Bearer " + token).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (profile.statusCode() != 200) return false;
            var user = JSON.readTree(profile.body());
            return user.path("id").asLong() == TARGET_ID && TARGET_EMAIL.equals(user.path("email").asText())
                    && TARGET_ROLE.equals(user.path("rol").asText());
        } catch (InterruptedException failure) {
            Thread.currentThread().interrupt(); return false;
        } catch (Exception failure) { return false; }
        finally { if (payload != null) Arrays.fill(payload, (byte) 0); }
    }

    private static void checkTarget(Connection connection) throws SQLException {
        try (var statement = connection.prepareStatement("SELECT id, email, rol FROM usuarios WHERE id = ?")) {
            statement.setLong(1, TARGET_ID);
            try (var rows = statement.executeQuery()) {
                if (!rows.next() || !TARGET_EMAIL.equals(rows.getString("email")) || !TARGET_ROLE.equals(rows.getString("rol"))) {
                    throw new SafeFailure("La cuenta no coincide con ID 2, correo autorizado y rol ADMIN. No se modificaron datos.");
                }
            }
        }
    }

    private static Map<String, Object> unchangedFields(java.sql.ResultSet rows) throws SQLException {
        Map<String, Object> fields = new HashMap<>();
        var metadata = rows.getMetaData();
        for (int i = 1; i <= metadata.getColumnCount(); i++) {
            if (!"password".equalsIgnoreCase(metadata.getColumnLabel(i))) fields.put(metadata.getColumnLabel(i), rows.getObject(i));
        }
        return fields;
    }

    private static void validatePassword(char[] password) {
        if (password == null || password.length < 8 || CharBuffer.wrap(password).toString().isBlank()) {
            throw new SafeFailure("La contraseña debe tener al menos 8 caracteres y no estar vacía.");
        }
        var bytes = StandardCharsets.UTF_8.encode(CharBuffer.wrap(password));
        try {
            if (bytes.remaining() > 72) throw new SafeFailure("BCrypt admite como máximo 72 bytes UTF-8. Elige una contraseña más corta.");
            for (char c : password) if (c == '\0') throw new SafeFailure("La contraseña contiene un carácter no permitido.");
        } finally {
            while (bytes.hasRemaining()) {
                int position = bytes.position(); bytes.put(position, (byte) 0); bytes.position(position + 1);
            }
        }
    }

    private static String setting(Properties properties, String key, String environment) {
        String value = System.getenv(environment);
        if (value == null) value = properties.getProperty(key);
        if (value == null || value.contains("${")) throw new SafeFailure("Falta un parámetro de conexión en el entorno local.");
        return value;
    }
    private static void requireLocal(URI uri) {
        if (uri.getUserInfo() != null || !java.util.Set.of("localhost", "127.0.0.1", "[::1]").contains(uri.getHost())) {
            throw new SafeFailure("La herramienta solo acepta conexiones locales sin credenciales en la URL.");
        }
    }
    private static HttpClient localClient() {
        return HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build();
    }
    private static boolean backendAvailable(URI base) {
        try { return localClient().send(HttpRequest.newBuilder(base.resolve("/api/productos"))
                .timeout(Duration.ofSeconds(5)).GET().build(), HttpResponse.BodyHandlers.discarding()).statusCode() == 200; }
        catch (InterruptedException failure) { Thread.currentThread().interrupt(); return false; }
        catch (Exception failure) { return false; }
    }
    public static final class SafeFailure extends RuntimeException {
        SafeFailure(String message) { super(message); }
    }
}
