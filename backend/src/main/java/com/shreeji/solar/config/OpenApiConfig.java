package com.shreeji.solar.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI solarOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Gujarat Rooftop Solar API")
                        .description("Calculator and bill-reading API for PM Surya Ghar rooftop solar.")
                        .version("v0.0.1"));
    }
}
