package com.api.usuarios;

import com.api.usuarios.model.Producto;
import com.api.usuarios.model.Usuario;
import com.api.usuarios.repository.ProductoRepository;
import com.api.usuarios.repository.UsuarioRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Base64;

/** Servidor real para E2E, exclusivamente en classpath de test y H2 en memoria. */
public class FrontendTestApplication {
    public static void main(String[] args) {
        if (System.getenv("FW_TEST_ADMIN_PASSWORD") == null || System.getenv("FW_TEST_ADMIN_EMAIL") == null) {
            throw new IllegalStateException("Las credenciales de prueba deben existir solo en el entorno del proceso");
        }
        byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes);
        System.setProperty("app.jwt.secret", Base64.getEncoder().encodeToString(bytes));
        SpringApplication app = new SpringApplication(UsuariosApplication.class, Fixtures.class);
        app.run("--server.port=8082", "--spring.datasource.url=jdbc:h2:mem:browser;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
                "--spring.datasource.driver-class-name=org.h2.Driver", "--spring.datasource.username=sa",
                "--spring.datasource.password=", "--spring.jpa.hibernate.ddl-auto=create-drop",
                "--spring.jpa.open-in-view=false", "--spring.jpa.show-sql=false", "--logging.level.root=WARN");
    }
    @TestConfiguration
    static class Fixtures {
        @Bean CommandLineRunner fixtures(UsuarioRepository usuarios, ProductoRepository productos, PasswordEncoder encoder) {
            return args -> {
                Usuario admin = new Usuario(); admin.setNombre("Administrador E2E"); admin.setRol("ADMIN");
                admin.setEmail(System.getenv("FW_TEST_ADMIN_EMAIL"));
                admin.setPassword(encoder.encode(System.getenv("FW_TEST_ADMIN_PASSWORD"))); usuarios.save(admin);
                String[] names = {"TEST Blazer Esmeralda", "TEST Pantalón Lino", "TEST Vestido Midi", "TEST Camiseta Pima"};
                String[] categories = {"Chaquetas", "Pantalones", "Vestidos", "Camisetas"};
                for (int i = 0; i < names.length; i++) {
                    Producto p = new Producto(); p.setNombre(names[i]); p.setCategoria(categories[i]);
                    p.setDescripcion("Prenda de prueba E2E. No es un producto comercial.");
                    p.setPrecio(new BigDecimal("25.50")); p.setStock(i == 2 ? 0 : 8);
                    p.setTalla(i == 1 ? "L" : "M"); p.setColor("Esmeralda");
                    p.setImagenUrl("/editorial/28ee11b91b0e4c1c8dec9f3b2ebb3b9d-" + i + ".jpg");
                    productos.save(p);
                }
            };
        }
    }
}
