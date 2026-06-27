package com.shreeji.solar.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI solarOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Gujarat Rooftop Solar API")
                        .description("Calculator, bill OCR, and survey lead-capture API for PM Surya Ghar rooftop solar.")
                        .version("v0.0.1"))
                .components(new Components().addSecuritySchemes("basicAuth",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("basic")));
    }
}
