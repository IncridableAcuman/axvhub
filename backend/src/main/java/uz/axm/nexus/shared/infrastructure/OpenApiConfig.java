package uz.axm.nexus.shared.infrastructure;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI nexusOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AXV Hub — Nexus Platform API")
                        .description("Muhammad Al-Xorazmiy Vorislari ta'lim ekotizimi uchun Modular Monolith REST API hujjatlari")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("AXV Hub Texnik Jamoasi")
                                .email("contact@axm-nexus.uz"))
                        .license(new License().name("Apache 2.0")));
    }
}
