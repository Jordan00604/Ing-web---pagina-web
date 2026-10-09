package com.api.usuarios;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:context;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false", "spring.jpa.open-in-view=false"
})
class UsuariosApplicationTests {

    @org.springframework.test.context.DynamicPropertySource
    static void secret(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> {
            byte[] bytes = new byte[32];
            new java.security.SecureRandom().nextBytes(bytes);
            return java.util.Base64.getEncoder().encodeToString(bytes);
        });
    }

	@Test
	void contextLoads() {
	}

}
